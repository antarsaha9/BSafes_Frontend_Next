package com.bsafes.android

import android.app.Activity
import android.util.Log
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.ConsumeParams
import com.android.billingclient.api.ConsumeResponseListener
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchasesParams
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update


class InAppPurchaseWorker(private val activity: Activity) {

    private val _purchases = MutableStateFlow<List<String>>(emptyList())
    val purchases = _purchases.asStateFlow()
    private val tag = "InAppPurchaseWorker"

    private val purchaseUpdateListener = PurchasesUpdatedListener { result, purchases ->
        if (result.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            Log.d(tag, "Purchase updated")
            for (purchase in purchases) {
                handlePurchase(purchase)
            }
        } else if (result.responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
            Log.d(tag, "User canceled the purchase")
            // User canceled the purchase
        } else {
            Log.d(tag, "Billing error: ${result.responseCode}")
            Log.d(tag, "Billing error: ${result.debugMessage}")
            // Handle other error cases
        }
    }

    private val params: PendingPurchasesParams = PendingPurchasesParams.newBuilder()
        .enableOneTimeProducts()
        .build()
    private var billingClient: BillingClient = BillingClient.newBuilder(activity)
        .setListener(purchaseUpdateListener)
        .enablePendingPurchases(params)
        .build()

    private fun handlePurchase(purchase: Purchase) {
        val consumeParams = ConsumeParams.newBuilder()
            .setPurchaseToken(purchase.purchaseToken)
            .build()

        val listener = ConsumeResponseListener { billingResult, s -> }

        billingClient.consumeAsync(consumeParams, listener)

        if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
            Log.d(tag, "Purchase state: ${purchase.purchaseState}")
            if (!purchase.isAcknowledged) {
                val acknowledgePurchaseParams = AcknowledgePurchaseParams
                    .newBuilder()
                    .setPurchaseToken(purchase.purchaseToken)
                    .build()

                billingClient.acknowledgePurchase(acknowledgePurchaseParams) { billingResult ->
                    if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                        _purchases.update {
                            val newList = it.toMutableList()
                            newList.add(purchase.products[0].toString())
                            newList
                        }
                    }
                }
            }
        }
    }

    fun billingSetup() {
        Log.d(tag, "Billing client ready ${billingClient.isReady}")
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
                if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                    Log.d(tag, "Billing setup finished")
                    // Connected
                    this@InAppPurchaseWorker.checkProducts()
                }
                else {
                    Log.d(tag, "Billing setup failed")
                    Log.d(tag, "Billing error: ${result.debugMessage}")
                    // Handle billing setup failure
                }
            }

            override fun onBillingServiceDisconnected() {
                Log.d(tag, "Billing service disconnected")
                // Handle billing service disconnection
            }
        })
    }

    fun checkProducts() {
        Log.d(tag, "Checking products")
        val queryPurchaseParams = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.INAPP)
            .build()

        billingClient.queryPurchasesAsync(
            queryPurchaseParams
        ) { result, purchases ->
            Log.d(tag, "Checking products result: ${result.responseCode}")
            Log.d(tag, "Checking products result: ${result.debugMessage}")
            when (result.responseCode) {
                BillingClient.BillingResponseCode.OK -> {
                    for (purchase in purchases) {
                        Log.d(tag, "Purchase: ${purchase.purchaseState}")
                        if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                            // User has an active product
                            this@InAppPurchaseWorker.handlePurchase(purchase)
                            _purchases.update {
                                val newList = it.toMutableList()
                                newList.add(purchase.products[0].toString())
                                newList
                            }

                            return@queryPurchasesAsync
                        }
                    }
                }

                BillingClient.BillingResponseCode.USER_CANCELED -> {
                    Log.d(tag, "User canceled the purchase")
                    // User canceled the purchase
                }

                else -> {
                    Log.d(tag, "Billing error: ${result.responseCode}")
                    Log.d(tag, "Billing error: ${result.debugMessage}")
                    // Handle other error cases
                }
            }

            // User does not have an active subscription
        }
    }

    fun purchase(
        productId: String,
    ) {
        Log.d(tag, "Purchase product: $productId")
        val queryProductDetailsParams =
            QueryProductDetailsParams.newBuilder()
                .setProductList(
                    listOf(
                        QueryProductDetailsParams.Product.newBuilder()
                            .setProductId("monthly")
                            .setProductType(BillingClient.ProductType.INAPP)
                            .build(),
                        QueryProductDetailsParams.Product.newBuilder()
                            .setProductId("yearly")
                            .setProductType(BillingClient.ProductType.INAPP)
                            .build()
                    )
                )
                .build()

        billingClient.queryProductDetailsAsync(queryProductDetailsParams) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                val productDetails = productDetailsList.firstOrNull { productDetails ->
                    productDetails.productId == productId
                }
                productDetails?.let {
                    val productDetailsParamsList = listOf(
                        BillingFlowParams.ProductDetailsParams.newBuilder()
                            .setProductDetails(it)
                            .build()
                    )

                    val billingFlowParams = BillingFlowParams.newBuilder()
                        .setProductDetailsParamsList(productDetailsParamsList)
                        .build()

                    billingClient.launchBillingFlow(activity, billingFlowParams)
                }
            }
        }
    }
}
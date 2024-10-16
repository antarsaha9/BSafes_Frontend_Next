package com.bsafes.android

import android.content.Context
import android.webkit.JavascriptInterface
import android.widget.Toast

/** Instantiate the interface and set the context  */
class WebviewJSInterface(private val mContext: Context, private val inAppPurchaseWorker: InAppPurchaseWorker) {
    /** Show a toast from the web page  */
    @JavascriptInterface
    fun showToast(toast: String) {
        Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show()
    }

    @JavascriptInterface
    fun initiatePurchase(checkoutPlan: String) {
        inAppPurchaseWorker.purchase(checkoutPlan)
    }
}
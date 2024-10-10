package com.bsafes.android

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import android.util.Log
import android.view.ViewGroup
import android.webkit.ServiceWorkerClient
import android.webkit.ServiceWorkerController
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewAssetLoader.PathHandler
import androidx.webkit.internal.AssetHelper
import kotlinx.coroutines.launch
import java.io.InputStream


@Composable
fun ScafoldWrappedWebView() {
    val snackbarHostState = remember { SnackbarHostState() }
    Scaffold(
        Modifier.fillMaxSize(),
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }) { innerPadding ->
        ComposeWrappedWebView(innerPadding, snackbarHostState)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("RestrictedApi")
@Composable
fun ComposeWrappedWebView(
    innerPadding: androidx.compose.foundation.layout.PaddingValues,
    snackbarHostState: SnackbarHostState
) {
    val rootTag = "WebViewWrapper"
    var filePathCallback by remember { mutableStateOf<ValueCallback<Array<Uri>>?>(null) }
    val requiredMimeType = remember { mutableStateOf<Array<String>>(arrayOf()) }
    var openBottomSheet by rememberSaveable { mutableStateOf(false) }
    val webView = remember { mutableStateOf<WebView?>(null) }
    val bottomSheetState = rememberModalBottomSheetState()
    val coroutineScope = rememberCoroutineScope()
    val scheme = "https"
    val domain = "android.bsafes.com"
    val hideModalBottomSheet: () -> Unit =
        {
            coroutineScope.launch { bottomSheetState.hide() }.invokeOnCompletion {
                if (!bottomSheetState.isVisible) {
                    openBottomSheet = false
                }
            }
        }
    val appContext = LocalContext.current
    val inAppPurchaseWorker = remember {
        InAppPurchaseWorker(appContext as Activity)
    }

    LaunchedEffect(key1 = true) {
        inAppPurchaseWorker.billingSetup()
//            inAppPurchaseWorker.checkProducts()
    }

    AndroidView(
        factory = { context ->
            val tag = "$rootTag AndroidView"
            val assetLoader = WebViewAssetLoader.Builder()
                .setDomain(domain)
                .addPathHandler("/", PathHandler { path ->
                    var usePath = path
                    try {
                        if (path.isEmpty()) usePath = "index.html"
                        val inputStream: InputStream = context.assets.open("dist/$usePath")
                        val mimeType = AssetHelper.guessMimeType(usePath)

                        return@PathHandler WebResourceResponse(mimeType, null, inputStream)
                    } catch (e: Exception) {
                        Log.e(tag, "Error loading asset: $path", e)
                    }
                    null
                })
                .build()


            val swController = ServiceWorkerController.getInstance()
            swController.setServiceWorkerClient(object : ServiceWorkerClient() {
                // I don't know how to reuse this variable, so I wrote it twice
//                private val assetLoader: WebViewAssetLoader = assetLoaderBuilder.build()
                override fun shouldInterceptRequest(request: WebResourceRequest): WebResourceResponse? {
                    // Capture request here and generate response or allow pass-through
                    return assetLoader.shouldInterceptRequest(request.url)
                }
            })


//            val assetLoader = WebViewAssetLoader.Builder()
//                .addPathHandler("/", WebViewAssetLoader.AssetsPathHandler(context))
//                .build()

            WebView(context).apply {
                val tag = "$rootTag WebView"
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )

                /**
                 * Enable JavaScript in the WebView
                 * This is required to load JS in the WebView
                 * The compiler will warn you that this can cause XSS security issues
                 * but since we are loading our own assets, this is not a concern
                 * hence the `@Suppress("SetJavaScriptEnabled")` annotation
                 */
                @Suppress("SetJavaScriptEnabled")
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.allowFileAccess = true
                settings.allowContentAccess = true
                settings.loadWithOverviewMode = true
                settings.useWideViewPort = true
                settings.setSupportZoom(false)
                webViewClient = object : WebViewClient() {
                    override fun shouldInterceptRequest(
                        view: WebView,
                        request: WebResourceRequest
                    ): WebResourceResponse? {
                        return assetLoader.shouldInterceptRequest(request.url)
                    }
                }

                webChromeClient = object : WebChromeClient() {
                    override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage): Boolean {
                        Log.d(tag, consoleMessage.message())
                        return true
                    }


                    override fun onShowFileChooser(
                        webView: WebView?,
                        filePathCallbackk: ValueCallback<Array<Uri>>?,
                        fileChooserParams: FileChooserParams?
                    ): Boolean {

                        Log.d(
                            tag,
                            "File chooser triggered, types = ${fileChooserParams?.acceptTypes.toString()}"
                        )

                        if (fileChooserParams?.acceptTypes?.isNotEmpty() == true) {
                            val mimetypes =
                                if (fileChooserParams.acceptTypes.size == 1 && fileChooserParams.acceptTypes[0] == ""
                                ) arrayOf("*/*") else fileChooserParams.acceptTypes!!
                            requiredMimeType.value = mimetypes
                            filePathCallback = filePathCallbackk
                            openBottomSheet = true
                            return true
                        } else return false

                    }
                }

                /**
                 * This is the URL that will be loaded when the WebView is first
                 * The assets directory is served by a domain `https://appassets.androidplatform.net`
                 * Learn more about the WebViewAssetLoader here:
                 * https://developer.android.com/reference/androidx/webkit/WebViewAssetLoader
                 */
                loadUrl("$scheme://$domain")
                addJavascriptInterface(WebviewJSInterface(context), "Android")
            }.also { webView.value = it }
        },
        update = {}
    )

    var backPressedCount by remember { mutableIntStateOf(0) }

    fun exitApp() {
        (appContext as Activity).finish()
    }

    BackHandler(enabled = true) {
        val localTag = "BackHandler"
        val tag = "$rootTag $localTag"
        Log.d(tag, "Back button pressed ${webView.value!!.url.toString()}")
        if (webView.value!!.canGoBack()) {
            val currentUrl = webView.value!!.url
            if (currentUrl == "$scheme://$domain" || currentUrl == "$scheme://$domain/safe") {
                backPressedCount++
                if (backPressedCount >= 2) {
                    // Exit the app
                    Log.d(tag, "Exiting app")
                    exitApp()
                } else {
                    Log.d(tag, "Press back again to exit")
                    Toast.makeText(appContext, "Press back again to exit", Toast.LENGTH_SHORT)
                        .show()
                }
            } else {
                // Navigate back in WebView
                Log.d(tag, "Going back")
                webView.value!!.goBack()
                backPressedCount = 0 // Reset count
            }
        } else {
            Log.d(tag, "Can't go back, exiting app")
            exitApp()
        }
    }

    fun openSnackbarForCameraPermission() {
        coroutineScope.launch {
            val result =
                snackbarHostState.showSnackbar(
                    message = "The app needs camera permission to take a photo/video",
                    actionLabel = "Go to settings",
                    withDismissAction = true
                )
            if (result == SnackbarResult.ActionPerformed) {
                val intent = Intent(
                    Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                    Uri.fromParts("package", appContext.packageName, null)
                )
                (appContext as Activity).startActivity(intent)
            }
        }
    }

    if (openBottomSheet) {
        CameraGalleryChooser(
            sheetState = bottomSheetState,
            onDismissRequest = {
                Log.d(rootTag, "Dismissing bottom sheet")
                filePathCallback?.onReceiveValue(null)
                hideModalBottomSheet()
            },
            onActionRequest = { value ->
                filePathCallback?.onReceiveValue(value)
                hideModalBottomSheet()
            },
            requiredMimeType = requiredMimeType.value,
            openSnackbarForCameraPermission = { openSnackbarForCameraPermission() },
        )
    }
}


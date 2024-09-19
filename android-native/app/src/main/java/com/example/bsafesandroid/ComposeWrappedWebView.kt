package com.example.bsafesandroid

import android.annotation.SuppressLint
import android.net.Uri
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
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.viewinterop.AndroidView
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewAssetLoader.PathHandler
import androidx.webkit.internal.AssetHelper
import kotlinx.coroutines.launch
import java.io.InputStream


@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("RestrictedApi")
@Composable
fun ComposeWrappedWebView() {
    var filePathCallback by remember { mutableStateOf<ValueCallback<Array<Uri>>?>(null) }
    var requiredMimeType = remember { mutableStateOf<Array<String>>(arrayOf()) }
    var openBottomSheet by rememberSaveable { mutableStateOf(false) }

    val bottomSheetState = rememberModalBottomSheetState()
    val coroutineScope = rememberCoroutineScope()
    val hideModalBottomSheet: () -> Unit =
        {
            coroutineScope.launch { bottomSheetState.hide() }.invokeOnCompletion {
                if (!bottomSheetState.isVisible) {
                    openBottomSheet = false
                }
            }
        }

    AndroidView(
        factory = { context ->
            val scheme = "https"
            val domain = "android.bsafes.com"
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
                        Log.e("AssetLoader", "Error loading asset: $path", e)
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
                        Log.d("WebView", consoleMessage.message())
                        return true
                    }


                    override fun onShowFileChooser(
                        webView: WebView?,
                        filePathCallbackk: ValueCallback<Array<Uri>>?,
                        fileChooserParams: FileChooserParams?
                    ): Boolean {

                        Log.d("WebView", fileChooserParams?.mode.toString())
                        Log.d("WebView", fileChooserParams?.acceptTypes.toString())

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
            }
        },
        update = {}
    )

    if (openBottomSheet) {
        CameraGalleryChooser(
            sheetState = bottomSheetState,
            onDismissRequest = {
                Log.d("WebView CameraGalleryChooser", "onDismissRequest")
                filePathCallback?.onReceiveValue(null)
                openBottomSheet = false
            },
            onActionRequest = { value ->
                filePathCallback?.onReceiveValue(value)
                hideModalBottomSheet()

            },
            requiredMimeType = requiredMimeType.value
        )
    }
}


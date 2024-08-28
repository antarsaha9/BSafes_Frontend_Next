package com.example.bsafesandroid

import android.view.ViewGroup
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.ui.viewinterop.AndroidView
import androidx.webkit.WebViewAssetLoader

@Composable
fun ComposeWrappedWebView() {
    AndroidView(
        factory = { context ->
            val assetLoader = WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context))
                .build()

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

                webViewClient =  object : WebViewClient() {
                    override fun shouldInterceptRequest(
                        view: WebView,
                        request: WebResourceRequest
                    ): WebResourceResponse? {
                        return assetLoader.shouldInterceptRequest(request.url)
                    }
                }

                /**
                 * This is the URL that will be loaded when the WebView is first
                 * The assets directory is served by a domain `https://appassets.androidplatform.net`
                 * Learn more about the WebViewAssetLoader here:
                 * https://developer.android.com/reference/androidx/webkit/WebViewAssetLoader
                 */
                loadUrl("https://appassets.androidplatform.net/assets/dist/index.html")
            }
        },
        update = {}
    )
}
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
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.SheetState
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.FileProvider
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewAssetLoader.PathHandler
import androidx.webkit.internal.AssetHelper
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import kotlinx.coroutines.launch
import java.io.File
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

@OptIn(ExperimentalMaterial3Api::class, ExperimentalPermissionsApi::class)
@Composable
@Preview
fun CameraGalleryChooser(
    sheetState: SheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
    onDismissRequest: () -> Unit = { /* No-op default implementation */ },
    onActionRequest: (Array<Uri>) -> Unit = { /* No-op default implementation */ },
    requiredMimeType: Array<String> = arrayOf()
) {

    val imageUri = remember {
        mutableStateOf<Uri?>(null)
    }

    val context = LocalContext.current
    val cameraLauncher =
        rememberLauncherForActivityResult(contract = ActivityResultContracts.TakePicture()) {
            if (it) {
                onActionRequest(arrayOf(imageUri.value!!))
            }
            else {
                Log.d("CameraGalleryChooser", "File not selected")
                onDismissRequest()
            }
        }

    val handleSelectedUri: (List<Uri>) -> Unit = { selectedUri ->
        Log.d("CameraGalleryChooser", "File selected = $selectedUri")
        onActionRequest(selectedUri.toTypedArray())
    }
    val visualMediaPickerLauncher =
        rememberLauncherForActivityResult(ActivityResultContracts.PickMultipleVisualMedia()) { selectedUri ->
            handleSelectedUri(selectedUri)
        }
    val filePickerLauncher =
        rememberLauncherForActivityResult(ActivityResultContracts.OpenMultipleDocuments()) { selectedUri ->
            handleSelectedUri(selectedUri)
        }
    val authority = stringResource(id = R.string.file_provider)
    fun createFile(): Uri {
        val directory = File(context.cacheDir, "images")
        directory.mkdirs()
        val file = File.createTempFile("image_${System.currentTimeMillis()}", ".jpg", directory)
        return FileProvider.getUriForFile(context, authority, file)
    }

    val cameraPermission = rememberPermissionState(
        permission = android.Manifest.permission.CAMERA,
        onPermissionResult = {
            imageUri.value = createFile()
            cameraLauncher.launch(imageUri.value!!)
        })


    val size = 80.dp
    val coroutineScope = rememberCoroutineScope()

//    if required mime type is image (image/*) then show image picker
    if (requiredMimeType[0].contains("image/")) {
        ModalBottomSheet(
            sheetState = sheetState,
            onDismissRequest = onDismissRequest
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceEvenly,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 20.dp)
            ) {
                Column {
                    IconButton(onClick = {
                        visualMediaPickerLauncher.launch(
                            PickVisualMediaRequest(
                                ActivityResultContracts.PickVisualMedia.SingleMimeType(
                                    requiredMimeType[0]
                                )
                            )
                        )
                    }, modifier = Modifier.size(size)) {
                        Icon(
                            Image,
                            contentDescription = "Localized description",
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                    Text(
                        text = "Gallery",
                        style = TextStyle(fontWeight = FontWeight.Bold),
                        // adding text align on below line.
                        textAlign = TextAlign.Center,
                        // adding font size on below line.
                        fontSize = 20.sp
                    )
                }
                Column {
                    IconButton(onClick = {
                        if (cameraPermission.status.isGranted) {
                            imageUri.value = createFile()
                            cameraLauncher.launch(imageUri.value!!)
                        } else {
                            cameraPermission.launchPermissionRequest()
                        }
                    }, modifier = Modifier.size(size)) {
                        Icon(
                            Photo_camera,
                            contentDescription = "Localized description",
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                    Text(
                        text = "Camera",
                        style = TextStyle(fontWeight = FontWeight.Bold),
                        // adding text align on below line.
                        textAlign = TextAlign.Center,
                        // adding font size on below line.
                        fontSize = 20.sp
                    )
                }
            }
        }

    } else if (requiredMimeType[0].contains("video/")) {
        coroutineScope.launch {
            visualMediaPickerLauncher.launch(
                PickVisualMediaRequest(
                    ActivityResultContracts.PickVisualMedia.SingleMimeType(
                        requiredMimeType[0]
                    )
                )
            )
        }
    } else {
        coroutineScope.launch {
            filePickerLauncher.launch(requiredMimeType)
        }
    }
}

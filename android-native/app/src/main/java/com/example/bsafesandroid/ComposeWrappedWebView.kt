package com.example.bsafesandroid

import android.annotation.SuppressLint
import android.content.Context
import android.net.Uri
import android.os.Environment
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
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
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
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
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
import java.io.File
import java.io.InputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale


@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("RestrictedApi")
@Composable
fun ComposeWrappedWebView() {
    var filePathCallback by remember { mutableStateOf<ValueCallback<Array<Uri>>?>(null) }
    val values = remember { mutableStateOf("") }
    val openBottomSheet = remember { mutableStateOf(false) }
    val launcher =
        rememberLauncherForActivityResult(ActivityResultContracts.OpenMultipleDocuments()) { selectedUri ->
            println("File selected = $selectedUri")
            filePathCallback?.onReceiveValue(selectedUri.toTypedArray())
            filePathCallback = null
        }

    val bottomSheetState = rememberModalBottomSheetState()


//    val permissions = arrayOf(Manifest.permission.CAMERA)
////    val context = LocalContext.current
//    var takePictureFile: File? = null
//    var takePictureUri: Uri? = null
//    val cameraPermissionLauncher = rememberLauncherForActivityResult(
//        contract = ActivityResultContracts.RequestPermission(),
//    ) { isGranted: Boolean ->
//        if (isGranted) {
//            takePictureFile = createImageCaptureFile(context)
//            Timber.tag("ok").d("ImageSelectionBottomSheet: %s", takePictureFile?.absoluteFile)
//            takePictureUri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", takePictureFile!!)
//            Timber.tag("ok").d("ImageSelectionBottomSheet: %s", takePictureUri)
//            cameraLauncher.launch(takePictureUri)
//
//        } else {
//            // Permission is denied, handle it accordingly
//        }
//    }
//
//    val takePhotoLauncher = rememberLauncherForActivityResult(
//        contract = ActivityResultContracts.TakePicture(),
//        onResult = {isSaved ->
////            ...
//        }
//    )

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
                            filePathCallback = filePathCallbackk

                            openBottomSheet.value = true
//                            launcher.launch(mimetypes)
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

    if (openBottomSheet.value) {
        CameraGalleryChooser(
            sheetState = bottomSheetState,
            onDismissRequest = { /*TODO*/ },
//            onActionRequest = filePathCallback,
            onActionRequest = { value ->
                filePathCallback?.onReceiveValue(value)
//                filePathCallback(value)
//                values.value = value
//                Log.d("WebView CameraGalleryChooser", value)

            }
        )
    }


//    LaunchedEffect(showBottomSheet) {
//        if (showBottomSheet) {
//            bottomSheetState.show()
//        } else {
//            bottomSheetState.hide()
//        }
//    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalPermissionsApi::class)
@Composable
@Preview
fun CameraGalleryChooser(
    sheetState: SheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
    onDismissRequest: () -> Unit = { /* No-op default implementation */ },
    onActionRequest: (Array<Uri>) -> Unit = { /* No-op default implementation */ },
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
        }

    val galleryLauncher =
        rememberLauncherForActivityResult(ActivityResultContracts.OpenMultipleDocuments()) { selectedUri ->
            println("File selected = $selectedUri")
//            filePathCallback?.onReceiveValue(selectedUri.toTypedArray())
//            filePathCallback = null
            onActionRequest(selectedUri.toTypedArray())
        }

    val cameraPermission = rememberPermissionState(permission = android.Manifest.permission.CAMERA)

    fun createFile(): Uri {
        val storage = context.getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        val file = File.createTempFile("image_${System.currentTimeMillis()}", ".jpg", storage)
        return FileProvider.getUriForFile(context, context.packageName, file)
    }

    val size = 80.dp

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
                    galleryLauncher.launch(arrayOf("image/*"))
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
                    } else cameraPermission.launchPermissionRequest()
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


//        Column {
//            Row(
//                horizontalArrangement = Arrangement.SpaceEvenly,
//                modifier = Modifier
//                    .fillMaxWidth()
//                    .padding(8.dp)
//            ) {
//                IconButton(onClick = {
//                    if (cameraPermission.status.isGranted) {
//                        imageUri.value = createFile()
//                        cameraLauncher.launch(imageUri.value!!)
//                    } else cameraPermission.launchPermissionRequest()
//
//                }) {
//                    Icon(imageVector = Icons.Filled.AccountCircle, contentDescription = "Camera")
//                    Text(text = "Camera")
//                }
//                IconButton(onClick = {
//
//                    galleryLauncher.launch(arrayOf("image/*"))
//                }) {
//                    Icon(imageVector = Icons.Filled.Add, contentDescription = "File")
//                    Text(text = "Plus")
//
//                }
//            }
//        }
    }


}

private fun createImageCaptureFile(context: Context): File {
    val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
    val fileName = "JPEG_${timeStamp}.jpg"
    val cacheDir = context.cacheDir
    return File(cacheDir, fileName)
}
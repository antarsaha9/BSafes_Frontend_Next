package com.bsafes.android

import android.net.Uri
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.FileProvider
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import com.google.accompanist.permissions.shouldShowRationale
import kotlinx.coroutines.launch
import java.io.File


@OptIn(ExperimentalMaterial3Api::class, ExperimentalPermissionsApi::class)
@Composable
fun CameraGalleryChooser(
    sheetState: SheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
    onDismissRequest: () -> Unit = { /* No-op default implementation */ },
    onActionRequest: (Array<Uri>) -> Unit = { /* No-op default implementation */ },
    requiredMimeType: Array<String> = arrayOf(),
    openSnackbarForCameraPermission: () -> Unit
) {
    val TAG = "CameraGalleryChooser"

    val mediaUri = remember {
        mutableStateOf<Uri?>(null)
    }
    val afterPermissionGrantAction = remember { mutableStateOf<(() -> Unit)?>(null) }

    val context = LocalContext.current
    val cameraLauncherForImage =
        rememberLauncherForActivityResult(contract = ActivityResultContracts.TakePicture()) {
            if (it) {
                Log.d(TAG, "Image captured")
                onActionRequest(arrayOf(mediaUri.value!!))
            } else {
                Log.d(TAG, "Image not captured")
                onDismissRequest()
            }
        }

    val cameraLauncherForVideo =
        rememberLauncherForActivityResult(contract = ActivityResultContracts.CaptureVideo()) {
            if (it) {
                Log.d(TAG, "Video captured")
                onActionRequest(arrayOf(mediaUri.value!!))
            } else {
                Log.d(TAG, "Video not captured")
                onDismissRequest()
            }
        }

    val handleSelectedUri: (List<Uri>) -> Unit = { selectedUri ->
        Log.d(TAG, "File selected = $selectedUri")
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
    fun createFile(mediaExtension: String): Uri {
        val directory = File(context.cacheDir, "captured_media")
        directory.mkdirs()
        val file = File.createTempFile(
            "media_${System.currentTimeMillis()}",
            ".${mediaExtension}",
            directory
        )
        return FileProvider.getUriForFile(context, authority, file)
    }

    val cameraPermission = rememberPermissionState(
        permission = android.Manifest.permission.CAMERA,
        onPermissionResult = { isGranted ->
            Log.d(TAG, "Camera permission granted = $isGranted")
            if (isGranted) {
                afterPermissionGrantAction.value?.let { it1 -> it1() }
            } else {
                onDismissRequest()
            }
            afterPermissionGrantAction.value = null
        })

    val coroutineScope = rememberCoroutineScope()
    fun checkAndRequestPermission() {
        if (cameraPermission.status.isGranted) {
            Log.d(TAG, "Camera permission granted")
            afterPermissionGrantAction.value?.let { it1 -> it1() }
        } else {
            Log.d(TAG, "Requesting camera permission")
            if (cameraPermission.status.shouldShowRationale) {
                Log.d(TAG, "Show rationale")
                openSnackbarForCameraPermission()
                onDismissRequest()

            } else {
                Log.d(TAG, "Request permission")
                val res = cameraPermission.launchPermissionRequest()
                Log.d(TAG, "Permission result = $res")

            }
        }

    }


    val size = 80.dp

    fun launchCameraForImage() {
        mediaUri.value = createFile("jpg")
        cameraLauncherForImage.launch(mediaUri.value!!)
    }

    fun launchCameraForVideo() {
        mediaUri.value = createFile("mp4")
        cameraLauncherForVideo.launch(mediaUri.value!!)
    }

//    if required mime type is image (image/) or video (video/) then show image picker
    if (requiredMimeType[0].contains("image/") || requiredMimeType[0].contains("video/")) {
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
                    .navigationBarsPadding()
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
                        if (requiredMimeType[0].contains("image/")) {
                            afterPermissionGrantAction.value = ::launchCameraForImage
                            checkAndRequestPermission()
                        } else {
                            afterPermissionGrantAction.value = ::launchCameraForVideo
                            checkAndRequestPermission()
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
    } else {
        LaunchedEffect(requiredMimeType) {
            coroutineScope.launch {
                filePickerLauncher.launch(requiredMimeType)
            }
        }
    }
}

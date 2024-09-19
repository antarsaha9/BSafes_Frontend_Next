package com.example.bsafesandroid

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
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.FileProvider
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import kotlinx.coroutines.launch
import java.io.File


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
package com.bsafes.android

import android.content.Context
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.bsafes.android.ui.theme.BSafesAndroidTheme
import java.io.File

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
//        enableEdgeToEdge()
        setContent {
            BSafesAndroidTheme {
//                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
//                    Greeting(
//                        name = "Android",
//                        modifier = Modifier.padding(innerPadding)
//                    )
//                }

//                Surface(
//                    modifier = Modifier.fillMaxSize(),
//                    color = MaterialTheme.colorScheme.background
//                ) {
                ScafoldWrappedWebView()
//                    ComposeWrappedWebView()
//                }
            }
        }

        logTemporaryFiles(this)
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    BSafesAndroidTheme {
        Greeting("Android")
    }
}

fun logTemporaryFiles(context: Context) {
    val tag = "CapturedMediaCleaner"
    // Directory where temporary files are stored
    val tempDir = File(context.cacheDir, "captured_media")

    // List files in the directory
    val tempFiles = tempDir.listFiles()

    if (tempFiles != null && tempFiles.isNotEmpty()) {
        Log.d(tag, "Media captured in previous executions:")
        tempFiles.forEach { file ->
            Log.d(
                tag,
                "Deleting file: ${file.name}, Path: ${file.absolutePath}, Size: ${file.length()} bytes"
            )
            file.delete()
            Log.d(tag, "File deleted: ${file.name}")
        }
    } else {
        Log.d("MainActivity", "No temporary files found.")
    }
}
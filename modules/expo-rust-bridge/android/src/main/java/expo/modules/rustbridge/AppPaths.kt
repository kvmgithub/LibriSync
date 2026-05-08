package expo.modules.rustbridge

import android.content.Context
import java.io.File

object AppPaths {
    private const val DATABASE_FILE_NAME = "audible.db"

    fun databasePath(context: Context): String {
        return File(context.filesDir, DATABASE_FILE_NAME).absolutePath
    }
}

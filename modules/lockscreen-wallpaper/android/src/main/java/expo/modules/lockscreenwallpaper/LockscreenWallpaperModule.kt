package expo.modules.lockscreenwallpaper

import android.app.WallpaperManager
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import java.io.File

class SetOptions : Record {
  @Field
  val alsoSetHome: Boolean = false

  @Field
  val allowBackup: Boolean = true
}

internal class FileNotFoundException(uri: String) :
  CodedException("ERR_FILE_NOT_FOUND", "Wallpaper image not found: $uri", null)

internal class DecodeFailedException(uri: String) :
  CodedException("ERR_DECODE_FAILED", "Could not decode the wallpaper image: $uri", null)

internal class NotSupportedException :
  CodedException("ERR_NOT_SUPPORTED", "This device does not support wallpapers.", null)

internal class NotAllowedException :
  CodedException("ERR_NOT_ALLOWED", "This device does not allow apps to change the wallpaper.", null)

internal class SetFailedException(message: String, cause: Throwable?) :
  CodedException("ERR_SET_FAILED", message, cause)

/**
 * Sets ONLY the lock-screen wallpaper (FLAG_LOCK) from a PNG written by react-native-view-shot.
 * ARCHITECTURE §8. The only native code in the app.
 */
class LockscreenWallpaperModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("LockscreenWallpaper")

    Function("getCapabilities") {
      val wm = WallpaperManager.getInstance(context)
      mapOf(
        "isWallpaperSupported" to wm.isWallpaperSupported,
        "isSetWallpaperAllowed" to wm.isSetWallpaperAllowed,
        "sdkInt" to Build.VERSION.SDK_INT
      )
    }

    // AsyncFunction runs off the main thread.
    AsyncFunction("setLockScreenWallpaperAsync") { fileUri: String, options: SetOptions ->
      val wm = WallpaperManager.getInstance(context)
      if (!wm.isWallpaperSupported) throw NotSupportedException()
      if (!wm.isSetWallpaperAllowed) throw NotAllowedException()

      val bitmap = decode(fileUri)
      try {
        val flags = if (options.alsoSetHome) {
          WallpaperManager.FLAG_LOCK or WallpaperManager.FLAG_SYSTEM
        } else {
          WallpaperManager.FLAG_LOCK
        }
        val id = wm.setBitmap(bitmap, null, options.allowBackup, flags)
        if (id == 0) throw SetFailedException("WallpaperManager did not apply the wallpaper.", null)
        id
      } catch (e: CodedException) {
        throw e
      } catch (e: Exception) {
        throw SetFailedException(e.message ?: "Setting the wallpaper failed.", e)
      } finally {
        bitmap.recycle()
      }
    }
  }

  private fun decode(fileUri: String): Bitmap {
    val uri = Uri.parse(fileUri)
    if (uri.scheme == "content") {
      val stream = context.contentResolver.openInputStream(uri) ?: throw FileNotFoundException(fileUri)
      return stream.use { BitmapFactory.decodeStream(it) } ?: throw DecodeFailedException(fileUri)
    }
    val file = File(uri.path ?: fileUri)
    if (!file.exists()) throw FileNotFoundException(fileUri)
    return BitmapFactory.decodeFile(file.absolutePath) ?: throw DecodeFailedException(fileUri)
  }
}

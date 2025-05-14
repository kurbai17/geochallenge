package com.kurbai.geochallenge

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.soloader.SoLoader
import com.kurbai.geochallenge.BuildConfig
import com.kurbai.geochallenge.AutolinkingPackageList
import androidx.emoji.text.EmojiCompat
import androidx.emoji.bundled.BundledEmojiCompatConfig

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost = object : ReactNativeHost(this) {
    override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

    override fun getPackages(): List<ReactPackage> {
      return AutolinkingPackageList.get()
    }

    override fun getJSMainModuleName(): String = "index"
  }

    override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return DefaultReactActivityDelegate(this, mainComponentName, false)
  }
}

    // Desactiva Bridgeless por compatibilidad
    try {
      val clazz = Class.forName("com.facebook.react.internal.featureflags.ReactNativeFeatureFlags")
      val method = clazz.getDeclaredMethod("enableBridgelessArchitecture", Boolean::class.javaPrimitiveType)
      method.invoke(null, false)
    } catch (e: Exception) {
      e.printStackTrace() // solo para desarrollo, puedes quitarlo en producción
    }

    // Init EmojiCompat usando el paquete incluido
    val config = BundledEmojiCompatConfig(this)
    EmojiCompat.init(config)
  }
}

package com.kurbai.geochallenge;

import com.facebook.react.ReactPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.swmansion.reanimated.ReanimatedPackage;
import com.swmansion.rnscreens.RNScreensPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.rnappauth.RNAppAuthPackage;
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
import com.airbnb.android.react.maps.MapsPackage;

import java.util.Arrays;
import java.util.List;

public class AutolinkingPackageList {
    public static List<ReactPackage> get() {
        return Arrays.asList(
            new RNCWebViewPackage(),
            new RNGestureHandlerPackage(),
            new ReanimatedPackage(),
            new RNScreensPackage(),
            new LinearGradientPackage(),
            new SplashScreenReactPackage(),
            new RNAppAuthPackage(),
            new SafeAreaContextPackage(),
            new MapsPackage()
        );
    }
}

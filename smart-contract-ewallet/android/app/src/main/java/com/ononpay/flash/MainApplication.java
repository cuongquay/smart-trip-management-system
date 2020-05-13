package com.tripcontract.apps;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.xb.contactpicker.ReactNativeContacts;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.horcrux.svg.SvgPackage;
import org.reactnative.camera.RNCameraPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.imagepicker.ImagePickerPackage;
import com.ninty.system.setting.SystemSettingPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.kishanjvaghela.cardview.RNCardViewPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.i18n.reactnativei18n.ReactNativeI18n;
import com.idehub.GoogleAnalyticsBridge.GoogleAnalyticsBridgePackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.bugsnag.BugsnagReactNative;
import com.geektime.rnonesignalandroid.ReactNativeOneSignalPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.bugsnag.BugsnagReactNative;
import com.facebook.soloader.SoLoader;
import com.facebook.react.uimanager.UIImplementationProvider;
import com.facebook.drawee.backends.pipeline.Fresco;

import com.tripcontract.apps.modules.progresshud.RNProgressHUDPackage;
import com.tripcontract.apps.modules.datetimepicker.RNDateTimeChooserPackage;
import com.tripcontract.apps.modules.actionsheet.ActionSheetPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new ReactNativeContacts(),
            new SvgPackage(),
            new RNCameraPackage(),
            new VectorIconsPackage(),
            new ImagePickerPackage(),
            new SystemSettingPackage(),
            new SplashScreenReactPackage(),
            new RNCardViewPackage(),
            new RNDeviceInfo(),
            new LinearGradientPackage(),
            new ReactNativeI18n(),
            new GoogleAnalyticsBridgePackage(),
            new MapsPackage(),
            new ReactNativeConfigPackage(),
            BugsnagReactNative.getPackage(),
            new ReactNativeOneSignalPackage(),
            new ActionSheetPackage(),
            new RNDateTimeChooserPackage(),
            new RNProgressHUDPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    Fresco.initialize(this);
    BugsnagReactNative.start(this);
    SoLoader.init(this, /* native exopackage */ false);
  }
}

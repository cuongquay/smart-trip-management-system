/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"
#import "SplashScreen.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <BugsnagReactNative/BugsnagReactNative.h>
// TODO: uncomment this for FireBase integration import library
//#import <Firebase>

@implementation AppDelegate
@synthesize oneSignal = _oneSignal;

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;
  
  // Bundle URL:
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"tripcontract"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  #ifdef DEBUG

  #else
    // SplashScreen:
    [SplashScreen show];
  #endif

  // Bugsnag:
  [BugsnagReactNative start];

  // OneSignal:
  self.oneSignal = [[RCTOneSignal alloc] initWithLaunchOptions:launchOptions
                      appId:@"c5c43d0f-b678-451f-8063-30516852bb72"
                      settings:@{kOSSettingsKeyInFocusDisplayOption : @(OSNotificationDisplayTypeNotification), kOSSettingsKeyAutoPrompt : @YES}];

  // TODO: uncomment this for FireBase integration configure
  // [FIRApp configure];
  return YES;
}

@end

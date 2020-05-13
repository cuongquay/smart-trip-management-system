//
//  RNKitASDatePicker.h
//  RNKitASDatePicker
//

#if __has_include(<React/RCTBridge.h>)
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#else
#import "RCTBridgeModule.h"
#import "RCTEventEmitter.h"
#endif

@interface RNKitASDatePicker : RCTEventEmitter <RCTBridgeModule>
@end

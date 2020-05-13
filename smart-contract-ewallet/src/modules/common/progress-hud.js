'use strict';

var RNProgressHUD = require('react-native').NativeModules.RNProgressHUD;
//var IsAndroid = RNProgressHUD.IsAndroid;

var determinateMode = {
  annular: 0,
  bar: 1
};

var ProgressHUD = function() {
  this.determinateMode = determinateMode['annular'];
};

ProgressHUD.prototype.setDeterminateMode = function(mode) {
  if (determinateMode[mode] !== null) {
    this.determinateMode = determinateMode[mode];
  }
};
ProgressHUD.prototype.showSimpleText = function(
  message = 'default',
  duration = 2000
) {
  RNProgressHUD.showSimpleText(message, duration);
};
ProgressHUD.prototype.dismiss = function() {
  RNProgressHUD.dismiss();
};
ProgressHUD.prototype.showSpinIndeterminate = function() {
  var args = [].slice.call(arguments);
  if (args.length === 0) {
    RNProgressHUD.showSpinIndeterminate();
  } else if (args.length === 1 && typeof args[0] == 'string') {
    RNProgressHUD.showSpinIndeterminateWithTitle(args[0]);
  } else if (
    args.length === 2 &&
    typeof args[0] == 'string' &&
    typeof args[1] == 'string'
  ) {
    RNProgressHUD.showSpinIndeterminateWithTitleAndDetails(args[0], args[1]);
  } else {
    throw Error('params error');
  }
};
ProgressHUD.prototype.showDeterminate = function({
  mode,
  title,
  details
} = {}) {
  var modeIndex = 0;
  if (determinateMode[mode] !== null && determinateMode[mode] !== undefined) {
    modeIndex = determinateMode[mode];
  } else {
    modeIndex = this.determinateMode;
  }
  RNProgressHUD.showDeterminate(modeIndex, title, details);
};
ProgressHUD.prototype.setProgress = function(progress) {
  if (typeof progress == 'number') {
    RNProgressHUD.setProgress(progress);
  } else {
    throw Error('params must be Number type');
  }
};

export default new ProgressHUD();

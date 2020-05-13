import ProgressHUD from './progress-hud';
import { setLoading } from 'actions/actions-common';
import { store } from 'app';

export default function setLoadingView(loading: boolean = true, isNative = false) {
  if (isNative) {
    loading ? ProgressHUD.showSpinIndeterminate() : ProgressHUD.dismiss();
    return;
  }
  !loading && ProgressHUD.dismiss();
  return store.dispatch(setLoading(loading));
}
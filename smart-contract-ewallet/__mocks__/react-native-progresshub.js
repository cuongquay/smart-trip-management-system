const ProgressHub = {};
ProgressHub.showSpinIndeterminate = () =>
  console.log('Testing native module: spin indeterminate');
ProgressHub.dismiss = () => console.log('Testing native module: dismiss');
export default ProgressHub;

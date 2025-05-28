import authView from './authView.js';
const init = () => {
  authView.hideForgotDetailsListener();
  authView.showAuthModalListeners();
  authView.checkAuthAndUpdateUI();
  authView.loginListener();
  authView.signupListener();
  authView.sendCodeListener();
  authView.resetPasswordListener();
};
init();

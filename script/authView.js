import { apiJSON } from './apiClient.js';
import { getCurrentUser, clearUserCache } from './userStorage.js';
class AuthView {
  #registrationContainer = document.querySelector('.registration');
  #overlay = document.querySelector('.modal-overlay');
  #modal = document.querySelector('.modal-registration');
  #close = document.querySelector('.modal-close');
  #btnSignup = document.querySelector('.btn--signup');
  #btnLogin = document.querySelector('.btn--login');
  #formSignup = document.querySelector('.form-signup');
  #formLogin = document.querySelector('.form-login');
  #forms = document.querySelectorAll('.form');
  #errorMessages = document.querySelectorAll('.error-msg');
  #message = document.querySelector('.message');
  #modalText = document.querySelector('.modal--text');
  #loginTab = document.getElementById('login-tab');
  #inputEmail = document.querySelector('.inp-email');
  #sendCodeBtn = document.querySelector('.send-code-btn');
  #codeGroup = document.querySelector('.code-group');
  #inputCode = document.querySelector('.inp-code');
  #btnResend = document.querySelector('.btn-resend');
  #forgotForm = document.querySelector('.forgot-form');
  #passwordFields = document.querySelector('.pwd-fields');
  #inputPassword = document.querySelector('.inp-password');
  #inputPasswordConfirm = document.querySelector('.inp-password-confirm');
  #updatePasswordBtn = document.querySelector('.btn-update');
  #errorEmail = document.querySelector('.error-msg[data-for="emailReset"]');
  #remainingTime = 90;
  #forgotDetails = document.querySelector('.forgot-details');
  constructor(user) {
    this.user = user;
  }
  signupListener() {
    this.#formSignup.addEventListener('submit', this.signup.bind(this));
  }
  loginListener() {
    this.#formLogin.addEventListener('submit', this.login.bind(this));
  }
  sendCodeListener() {
    this.#sendCodeBtn.addEventListener('click', this.sendCode.bind(this));
    this.#btnResend.addEventListener('click', this.sendCode.bind(this));
  }
  resetPasswordListener() {
    this.#updatePasswordBtn.addEventListener(
      'click',
      this.resetPassword.bind(this),
    );
  }
  hideForgotDetailsListener() {
    this.#loginTab.addEventListener('change', () => {
      const det = document.querySelector('.forgot-details');
      if (det) det.open = false;
    });
  }
  showAuthModalListeners() {
    clearUserCache();

    this.#btnSignup.addEventListener('click', () => this._openModal('signup'));
    this.#btnLogin.addEventListener('click', () => this._openModal('login'));

    this.#close.addEventListener('click', this._closeModal.bind(this));
    this.#overlay.addEventListener('click', this._closeModal.bind(this));
  }
  _showErrors(details = {}) {
    this.#errorMessages.forEach((s) => {
      s.textContent = '';
      s.classList.remove('show');
    });
    this.#forms.forEach((form) => {
      form
        .querySelectorAll('input')
        .forEach((inp) => inp.classList.remove('invalid'));
      for (const [field, message] of Object.entries(details)) {
        const small = document.querySelector(`.error-msg[data-for="${field}"]`);
        const input =
          this.#formSignup.querySelector(`[name="${field}"]`) ||
          this.#formLogin.querySelector(`[name="${field}"]`) ||
          this.#forgotForm.querySelector(`[name="${field}"]`);
        this.#passwordFields.querySelector(`[name="${field}"]`);
        if (small) {
          small.textContent = message;
          small.classList.add('show');
        }
        if (input) input.classList.add('invalid');
      }
    });
  }
  _closeModal() {
    this.#overlay.classList.remove('active');
    this.#modal.classList.remove('active');
    this.#close.removeEventListener('click', this.closeModal);
    this.#overlay.removeEventListener('click', this.closeModal);
    this.#forgotDetails.open = false;
  }
  _openModal(mode) {
    document.getElementById(mode + '-tab').checked = true;
    this.#overlay.classList.add('active');
    this.#modal.classList.add('active');
  }
  async isLoggedIn() {
    try {
      const res = await fetch('http://localhost:3000/api/v1/users/auth/ping', {
        method: 'GET',
        credentials: 'include',
      });
      return res.status === 204;
    } catch (err) {
      return false;
    }
  }
  async checkAuthAndUpdateUI() {
    const loggedIn = await this.isLoggedIn();
    if (!loggedIn) return;
    const user = await getCurrentUser();
    this.#registrationContainer.innerHTML = `
    <h1 class = "username">${user.name}</h1>
    <img src="/../images/users/${user.photo}" alt="Avatar" class="user-avatar" />
    `;
    document.querySelector('.user-avatar').addEventListener('click', () => {
      window.location.href = '/profile.html';
    });
  }
  async signup(e) {
    e.preventDefault();
    this._showErrors();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());

    try {
      await apiJSON('http://localhost:3000/api/v1/users/signup', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      this._closeModal();
      this._showToast('Signup successful! You are now logged in.✅✅✅');
      this.checkAuthAndUpdateUI();
      this.#formSignup.reset();
    } catch (err) {
      if (err.errors || err.details)
        this._showErrors(err.errors || err.details);
      else {
        alert(err.message || 'Unknown error');
      }
    }
  }
  async login(e) {
    e.preventDefault();
    this._showErrors();
    const formData = new FormData(e.target);
    const body = {
      email: formData.get('emailLogin'),
      password: formData.get('passwordLogin'),
    };

    try {
      await apiJSON('http://localhost:3000/api/v1/users/login', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      this._closeModal();
      this._showToast('Login successful! Welcome back.✅✅✅');
      this.checkAuthAndUpdateUI();
      this.#formLogin.reset();
    } catch (err) {
      if (err.errors || err.details)
        this._showErrors(err.errors || err.details);
      else this._showErrors({ passwordLogin: err.message || 'Unknown error' });
    }
  }
  async sendCode(e) {
    e.preventDefault();
    const email = this.#inputEmail.value.trim();
    if (!email) {
      this._showErrors({ emailReset: 'Please enter your email' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      this._showErrors({ emailReset: 'Invalid email format' });
      return;
    }
    try {
      await apiJSON('http://localhost:3000/api/v1/users/forgotPassword', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (e.target.classList.contains('send-code-btn')) {
        this.#codeGroup.classList.remove('hidden');
        this.#passwordFields.classList.remove('hidden');
        this.#updatePasswordBtn.classList.remove('hidden');
        this._showToast('Code sent to your email! 📧');
      }
      e.target.disabled = true;
      if (e.target.classList.contains('btn-resend')) {
        const interval = setInterval(() => {
          if (this.#remainingTime <= 0) {
            clearInterval(interval);
            this.#btnResend.disabled = false;
            this.#btnResend.textContent = 'Resend Code';
            this.#remainingTime = 90;
          } else {
            this.#remainingTime--;
            this.#btnResend.textContent = `Resend Code (${this.#remainingTime}s)`;
          }
        }, 1000);
      }
    } catch (err) {
      this.#errorEmail.textContent =
        err.message || 'Failed to send code. Please try again.';
      this.#errorEmail.classList.add('show');
    }
  }
  async resetPassword(e) {
    e.preventDefault();
    this._showErrors();
    const code = this.#inputCode.value.trim();
    const password = this.#inputPassword.value.trim();
    const passwordConfirm = this.#inputPasswordConfirm.value.trim();

    if (!code) {
      this._showErrors({ codeReset: 'Please enter the reset code' });
      return;
    }
    if (!password) {
      this._showErrors({ passwordReset: 'Please enter a new password' });
      return;
    }
    if (!passwordConfirm) {
      this._showErrors({
        passwordConfirmReset: 'Please confirm your password',
      });
      return;
    }
    if (password !== passwordConfirm) {
      this._showErrors({
        passwordConfirmReset: 'Passwords do not match',
      });
      return;
    }
    if (password.length < 8) {
      this._showErrors({
        passwordReset: 'Password must be at least 8 characters long',
      });
      return;
    }
    if (passwordConfirm.length < 8) {
      this._showErrors({
        passwordConfirmReset:
          'Password confirmation must be at least 8 characters long',
      });
      return;
    }

    try {
      await apiJSON(
        `http://localhost:3000/api/v1/users/resetPassword/${code}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ password, passwordConfirm }),
        },
      );
      this._showToast('Password reset successful! You can now log in.✅✅✅');
      this._closeModal();
      this.#formSignup.reset();
      this.#formLogin.reset();
      this.checkAuthAndUpdateUI();
    } catch (err) {
      if (err.errors || err.details)
        this._showErrors(err.errors || err.details);
      else this._showErrors({ codeReset: err.message || 'Unknown error' });
    }
  }
  _showToast(text, duration = 1000) {
    this.#message.classList.add('active');
    this.#modalText.innerHTML = text;
    setTimeout(() => {
      this.#message.classList.remove('active');
      this.#modalText.innerHTML = '';
    }, duration);
  }
}

export default new AuthView();

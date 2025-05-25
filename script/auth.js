import { apiJSON } from './apiClient.js';
class Auth {
  #registrationContainer = document.querySelector('.registration');
  #overlay = document.querySelector('.modal-overlay');
  #modal = document.querySelector('.modal-registration');
  #close = document.querySelector('.modal-close');
  #btnSignup = document.querySelector('.btn--signup');
  #btnLogin = document.querySelector('.btn--login');
  #formSignup = document.querySelector('.form-signup');
  #errorMessages = document.querySelectorAll('.error-msg');
  constructor(user) {
    this.user = user;
  }
  _showErrors(details = {}) {
    this.#errorMessages.forEach((s) => {
      s.textContent = '';
      s.classList.remove('show');
    });
    this.#formSignup
      .querySelectorAll('input')
      .forEach((inp) => inp.classList.remove('invalid'));
    for (const [field, message] of Object.entries(details)) {
      const small = document.querySelector(`.error-msg[data-for="${field}"]`);
      const input = this.#formSignup.querySelector(`[name="${field}"]`);
      if (small) {
        small.textContent = message;
        small.classList.add('show');
      }
      if (input) input.classList.add('invalid');
    }
  }
  _closeModal() {
    this.#overlay.classList.remove('active');
    this.#modal.classList.remove('active');
    this.#close.removeEventListener('click', this.closeModal);
    this.#overlay.removeEventListener('click', this.closeModal);
  }
  showAuthModal() {
    const openModal = (mode) => {
      document.getElementById(mode + '-tab').checked = true;
      this.#overlay.classList.add('active');
      this.#modal.classList.add('active');
    };

    this.#btnSignup.addEventListener('click', () => openModal('signup'));
    this.#btnLogin.addEventListener('click', () => openModal('login'));

    this.#close.addEventListener('click', this._closeModal.bind(this));
    this.#overlay.addEventListener('click', this._closeModal.bind(this));
  }
  async _isLoggedIn() {
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
    const loggedIn = await this._isLoggedIn();
    if (!loggedIn) return;
    const res = await apiJSON('http://localhost:3000/api/v1/users/me');
    const { user } = res.data;
    this.#registrationContainer.innerHTML = `
    <h1 class = "username">${user.name}</h1>
    <img src="../images/users/${user.photo}" alt="Avatar" class="user-avatar" />
    `;
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
      else alert(err.message || 'Unknown error');
    }
  }
  addEventListeners() {
    this.#formSignup.addEventListener('submit', (e) => this.signup(e));
  }
  _showToast(text, duration = 1000) {
    const container = document.querySelector('.message');
    const textInfo = document.querySelector('.modal--text');
    container.classList.add('open--modal');
    textInfo.innerHTML = text;
    setTimeout(() => {
      container.classList.remove('open--modal');
      textInfo.innerHTML = '';
    }, duration);
  }
}

const auth = new Auth();
auth.showAuthModal();
auth.checkAuthAndUpdateUI();
auth.addEventListeners();

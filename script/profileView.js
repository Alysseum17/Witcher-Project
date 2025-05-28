import { getCurrentUser, clearUserCache } from './userStorage.js';
import { apiJSON } from './apiClient.js';
class ProfileView {
  #editBtn = document.querySelector('.edit-btn');
  #editForm = document.querySelector('.edit-form');
  #headerBox = document.querySelector('.header');
  #nameEl = document.querySelector('.name');
  #emailEl = document.querySelector('.email');
  #message = document.querySelector('.message');
  #modalText = document.querySelector('.modal--text');
  #username = document.querySelector('.username');
  #userAvatar = document.querySelector('.user-avatar');
  #changePasswordForm = document.querySelector('.pwd-form');
  #pwdDetails = document.querySelector('.pwd-details');
  #logoutBtn = document.querySelector('.logout-btn');

  async showNameandEmail(nameArg = '', emailArg = '') {
    try {
      const { name, email, photo } = await getCurrentUser();
      this.#nameEl.textContent = nameArg || name || 'Anonymous witcher';
      this.#emailEl.textContent = emailArg || email;
      this.#username.textContent = nameArg || name || 'Anonymous';
      this.#userAvatar.src = `../images/users/${photo || 'default.jpg'}`;
    } catch (err) {
      this._showToast(err.message || 'Failed to load user data', 2000);
    }
  }
  openEditFormListener() {
    this.#editBtn.addEventListener('click', this._toggleEdit);
  }
  editNameListener() {
    this.#editForm.addEventListener(
      'submit',
      this._handleEditSubmit.bind(this),
    );
  }
  logoutListener() {
    this.#logoutBtn.addEventListener('click', this.logout.bind(this));
  }
  async _handleEditSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());
    try {
      await apiJSON('http://localhost:3000/api/v1/users/updateMe', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      this.#editForm.reset();
      this._showToast('Profile updated successfully! ✅', 2000);
      this.#editForm.classList.add('hidden');
      this.#headerBox.classList.remove('blurred');
      this.showNameandEmail(
        body.name || this.#username.textContent,
        body.email || this.#emailEl.textContent,
      );
      clearUserCache();
      await getCurrentUser();
    } catch (err) {
      this._showToast(err.message || 'Failed to update profile', 2000);
    }
  }

  async logout() {
    try {
      await apiJSON('http://localhost:3000/api/v1/users/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      this._showToast('Logout successful! 👋', 2000);
      clearUserCache();
      setTimeout(() => (window.location.href = '/homePage.html'), 1000);
    } catch (err) {
      this._showToast(err.message || 'Failed to logout', 1000);
    }
  }
  _toggleEdit = (e) => {
    e.stopPropagation();
    const hidden = this.#editForm.classList.toggle('hidden');
    this.#headerBox.classList.toggle('blurred', !hidden);
  };

  _closeOnClickOutside = (e) => {
    if (
      !this.#editForm.classList.contains('hidden') &&
      !this.#editForm.contains(e.target) &&
      !this.#editBtn.contains(e.target)
    ) {
      this._toggleEdit(e);
    }
  };
  changePasswordListener() {
    this.#changePasswordForm?.addEventListener(
      'submit',
      this._handleChangePasswordSubmit.bind(this),
    );
  }
  async _handleChangePasswordSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());
    try {
      await apiJSON('http://localhost:3000/api/v1/users/updateMyPassword', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      this.#changePasswordForm.reset();
      this._showToast('Password updated successfully! ✅', 2000);
      this.#pwdDetails.open = false;
    } catch (err) {
      this._showToast(err.message || 'Failed to update password', 2000);
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

export const profileView = new ProfileView();

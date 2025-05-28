import { profileView } from './profileView.js';

const init = () => {
  profileView.showNameandEmail();
  profileView.openEditFormListener();
  document.addEventListener('click', profileView._closeOnClickOutside);
  profileView.changePasswordListener();
  profileView.editNameListener();
  profileView.logoutListener();
};
init();

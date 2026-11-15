const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('certusDesktop', {
  isElectron: true,
  platform: process.platform,
});

function markDocument() {
  if (document && document.documentElement) {
    document.documentElement.classList.add('is-desktop-app');
    if (process.platform === 'darwin') {
      document.documentElement.classList.add('is-mac-app', 'is-mac');
    }
  }
}

markDocument();
window.addEventListener('DOMContentLoaded', markDocument);

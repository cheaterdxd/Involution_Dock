// src/preload/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Module 1
  toggleMinimize: (isMinimized) => ipcRenderer.send('toggle-minimize', isMinimized),
  onWindowMinimize: (callback) => ipcRenderer.on('window-state-changed', (_event, value) => callback(value)),

  // Module 2
  readConfig: () => ipcRenderer.invoke('read-config'),
  writeConfig: (configObject) => ipcRenderer.invoke('write-config', configObject),

  // Module 4
  runCommand: (bookmark) => ipcRenderer.invoke('run-command', bookmark),

  // Module 5
  gitPush: () => ipcRenderer.invoke('git-push'),
  gitPull: () => ipcRenderer.invoke('git-pull'),
});

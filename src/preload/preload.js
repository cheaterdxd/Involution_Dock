const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  toggleMinimize: (state) => ipcRenderer.send('toggle-minimize', state),
  setAlwaysOnTop: (state) => ipcRenderer.send('set-always-on-top', state),
  onWindowMinimize: (callback) => ipcRenderer.on('window-minimize', callback),
  readConfig: () => ipcRenderer.invoke('read-config'),
  writeConfig: (configObject) => ipcRenderer.invoke('write-config', configObject),
  runCommand: (command) => ipcRenderer.invoke('run-command', command),
  gitPush: () => ipcRenderer.invoke('git-push'),
  gitPull: () => ipcRenderer.invoke('git-pull')
});

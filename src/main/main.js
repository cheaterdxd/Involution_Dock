// src/main/main.js
const { app, BrowserWindow, screen, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const { exec } = require('child_process');
const simpleGit = require('simple-git');

let win;
const configPath = path.join(app.getPath('userData'), 'config.json');

const defaultConfig = {
  bookmarks: [
    { id: "uuid-1", name: "Docs", type: "Folder", target: app.getPath('documents'), icon: "Folder" },
    { id: "uuid-2", name: "Shell", type: "Command", target: "powershell -NoExit", icon: "Terminal" },
    { id: "uuid-3", name: "GitHub", type: "Link", target: "https://github.com", icon: "Link" },
  ],
  pomodoro: { workDuration: 25, breakDuration: 5, longBreakDuration: 15 },
  appSettings: {
    transparencyLevel: 80,
    gitRepoUrl: null, // To be configured by the user
    gitToken: null,   // To be configured by the user
  }
};

async function ensureConfigFile() {
  try {
    await fs.access(configPath);
  } catch (error) {
    await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
  }
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;
  win = new BrowserWindow({ width: 800, height: 50, x: Math.round((width - 800) / 2), y: 50, frame: false, transparent: true, alwaysOnTop: true, resizable: false, webPreferences: { preload: path.join(__dirname, '../preload/preload.js'), contextIsolation: true, nodeIntegration: false } });
  win.loadFile(path.join(__dirname, '../../dist/index.html'));
  // win.webContents.openDevTools();
}

// === IPC Handlers ===

ipcMain.handle('git-push', async () => {
  const git = simpleGit(app.getPath('userData'));
  try {
    await git.add(configPath).commit(`Sync by Pinbar ${new Date().toISOString()}`).push();
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('git-pull', async () => {
  const git = simpleGit(app.getPath('userData'));
  try {
    await git.pull({ '--strategy-option': 'theirs' });
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('run-command', async (event, bookmark) => {
  try {
    if (bookmark.type === 'Folder' || bookmark.type === 'App') await shell.openPath(bookmark.target);
    else if (bookmark.type === 'Link') await shell.openExternal(bookmark.target);
    else if (bookmark.type === 'Command') exec(bookmark.target);
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('read-config', async () => JSON.parse(await fs.readFile(configPath, 'utf-8')));

ipcMain.handle('write-config', async (event, config) => {
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
  return { success: true };
});

ipcMain.on('toggle-minimize', (event, isMinimized) => {
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  if (isMinimized) {
    win.setBounds({ width: 800, height: 50, x: Math.round((width - 800) / 2), y: 50 });
  } else {
    win.setBounds({ width: 50, height: 50, x: width - 80, y: 50 });
  }
  win.webContents.send('window-state-changed', !isMinimized);
});


// === App Lifecycle ===
app.whenReady().then(async () => {
  await ensureConfigFile();
  createWindow();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

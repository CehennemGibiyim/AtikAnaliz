const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const url  = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width:  430,
    height: 900,
    minWidth:  390,
    minHeight: 700,
    backgroundColor: '#0b0e17',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
    titleBarStyle: 'default',
  });

  // Production: load from build folder
  const startUrl = url.format({
    pathname: path.join(__dirname, '../build/index.html'),
    protocol: 'file:',
    slashes:  true,
  });

  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url: u }) => {
    shell.openExternal(u);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// Minimal menu
Menu.setApplicationMenu(Menu.buildFromTemplate([
  {
    label: 'AtikAnaliz',
    submenu: [
      { label: 'Yenile (F5)', accelerator: 'F5', click: () => mainWindow?.reload() },
      { type: 'separator' },
      { label: 'Çıkış', accelerator: 'Alt+F4', role: 'quit' },
    ],
  },
]));

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

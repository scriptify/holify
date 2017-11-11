const electron = require(`electron`);
const createServer = require(`../cmd-server/index.js`);
const { startAppByObject, getInstalledAppList, getBootConfig, getAppPath, startAppByName } = require(`./os.js`);
// Module to control application life.
// Module to create native browser window.
const { BrowserWindow, app } = electron;

const url = require(`url`);

// Keep a global reference of the window object, if you don`t, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow(pathOfApp) {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: pathOfApp,
    protocol: `file:`,
    slashes: true
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on(`closed`, () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on(`ready`, boot);

// Quit when all windows are closed.
app.on(`window-all-closed`, () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== `darwin`)
    app.quit();
});

app.on(`activate`, () => {
  // On OS X it`s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null)
    boot();
});


async function boot() {
  // Start server and register callback

  const bootConfig = await getBootConfig();
  const installedApps = await getInstalledAppList();

  const bootApp = installedApps.find(installedApp => installedApp.name === bootConfig.bootapp);
  if (!bootApp) {
    console.error(`No such bootapp: ${bootConfig.bootapp}`);
    return;
  }

  createWindow(getAppPath(bootApp));

  function onPair(username) {
    console.log(`User joined: ${username}`);
  }

  function onCommand(cmd) {
    switch (cmd.type) {
      case `OS`:
        switch (cmd.name) {
          case `START_APP`: {
            const appName = cmd.payload;
            startAppByName(appName, mainWindow);
          }
            break;
          case `CLOSE_APP`:
            startAppByObject(bootApp, mainWindow);
            break;
        }
        break;
      case `APP`:
        mainWindow.webContents.executeJavaScript(`
          if (window.executeCommand && typeof window.executeCommand === 'function') {
            window.executeCommand('${JSON.stringify(cmd)}');
          }
        `);
        break;
    }
  }

  createServer({
    onPair,
    onCommand
  }, bootConfig.password);
}

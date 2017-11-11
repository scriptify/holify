const fs = require(`fs`);
const path = require(`path`);
const url = require(`url`);
const promisify = require(`util.promisify`);

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

async function getInstalledAppList() {
  const appsPath = path.join(__dirname, `..`, `apps`);
  const res = await readDir(appsPath);
  const retArr = [];
  for (let appFolder of res) {
    const configFilePath = path.join(appsPath, appFolder, `.holify`);
    const content = await readFile(configFilePath);
    const appObj = JSON.parse(content);
    retArr.push(appObj);
  }

  return retArr;
}

function getAppPath(appObj) {
  return path.join(__dirname, `..`, `apps`, appObj.name, appObj.content, `index.html`);
}

function startAppByObject(appObj, mainWindow) {
  const appPath = getAppPath(appObj);
  mainWindow.loadURL(url.format({
    pathname: appPath,
    protocol: `file:`,
    slashes: true
  }));
}

async function startAppByName(appName, mainWindow) {
  const installedApps = await getInstalledAppList();
  const app = installedApps.find(iApp => iApp.name === appName);
  if (!app)
    return;

  startAppByObject(app, mainWindow);
}

async function getBootConfig() {
  const content = await readFile(path.join(__dirname, `..`, `.boot`));
  return JSON.parse(content);
}

module.exports = {
  getInstalledAppList,
  getBootConfig,
  startAppByName,
  startAppByObject,
  getAppPath
};

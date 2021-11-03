// Native
import { join } from 'path';
import { format } from 'url';
import path from 'path';

// Packages
import { BrowserWindow, app, ipcMain, IpcMainEvent } from 'electron';
import isDev from 'electron-is-dev';
import prepareNext from 'electron-next';
import { Extract } from 'unzipper';
import fs from 'fs';
import sizeOf from 'image-size';

const appName = 'ArchiveImageViewer';
const appWorkPath = `${app.getPath('temp')}${appName}`;

const clearAppWorkPath = () => {
  console.log(appWorkPath);
  try {
    fs.rmSync(appWorkPath, { recursive: true });
  } catch (_) {
    console.debug(`not exist ${appWorkPath}`);
  }
  fs.mkdirSync(appWorkPath);
};

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  clearAppWorkPath();

  await prepareNext('./renderer');

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
  });

  const url = isDev
    ? 'http://localhost:8000/'
    : format({
        pathname: join(__dirname, '../renderer/out/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  mainWindow.loadURL(url);
});

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit);

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on('message', (event: IpcMainEvent, message: any) => {
  console.log(message);
  setTimeout(() => event.sender.send('message', 'hi from electron'), 500);
});
const supportedExtentions = ['.jpeg', '.jpg', '.png'];

const isSupportedExtention = (filePath: string) => {
  if (typeof filePath !== 'string') {
    return false;
  }
  return (
    supportedExtentions.filter((extention) => filePath.endsWith(extention))
      .length !== 0
  );
};

const getExtentionType = (filePath: string) => {
  if (!isSupportedExtention(filePath)) {
    return;
  }
  return filePath.endsWith('.png') ? 'png' : 'jpeg';
};

const getAllFiles = (dirPath: string, arrayOfFiles: string[]) => {
  const files = fs.readdirSync(dirPath);
  console.log('-----');
  console.log(dirPath);
  console.log(files);

  let newArrayOfFiles = arrayOfFiles;

  files.forEach((file) => {
    if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
      newArrayOfFiles = getAllFiles(`${dirPath}/${file}`, newArrayOfFiles);
    } else if (isSupportedExtention(file)) {
      newArrayOfFiles.push(path.join(`${dirPath}/${file}`));
    }
  });

  return newArrayOfFiles;
};

ipcMain.handle('putFile', async (event, zipFilePath) => {
  console.log(zipFilePath);
  const timestamp = Date.now();
  // fs.createReadStream(zipFilePath).pipe(
  //   Extract({ path: `${appWorkPath}/${timestamp}` }).on('close', () =>
  //     console.log('close')
  //   )
  // );
  await new Promise((resolve: any, reject) => {
    fs.createReadStream(zipFilePath)
      .pipe(Extract({ path: `${appWorkPath}/${timestamp}` }))
      .on('close', () => resolve())
      .on('error', (error) => reject(error));
  });

  const files = getAllFiles(appWorkPath, []);
  console.log(files);
  console.log(`3 ${Date.now()}`);
  event.returnValue = files;
});

ipcMain.on('getImageSource', (event, filePath) => {
  console.log(filePath);
  const type = getExtentionType(filePath);
  const image = fs.readFileSync(filePath, { encoding: 'base64' });
  const dimensions = sizeOf(filePath);
  event.returnValue = {
    src: `data:image/${type};base64,${image}`,
    width: dimensions.width,
    height: dimensions.height,
  };
});

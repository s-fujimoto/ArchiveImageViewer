/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('viewerApi', {
  putFile: (zipFilePath: string): string[] =>
    ipcRenderer.sendSync('putFile', zipFilePath),
  getImageSource: (filePath: string) =>
    ipcRenderer.sendSync('getImageSource', filePath),
});

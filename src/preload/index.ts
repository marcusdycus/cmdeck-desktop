import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("cmdeck", {
  toggleMode: () => ipcRenderer.send("toggle-mode"),
  getMode: () => ipcRenderer.invoke("get-mode"),
  getVersion: () => ipcRenderer.invoke("get-version"),
  logout: () => ipcRenderer.send("logout"),
  onScreensaverStart: (cb: () => void) =>
    ipcRenderer.on("screensaver-start", cb),
  onScreensaverStop: (cb: () => void) =>
    ipcRenderer.on("screensaver-stop", cb),
});

import { BrowserWindow, powerMonitor } from "electron";
import { store } from "./store";

let screensaverWin: BrowserWindow | null = null;
let idleCheckInterval: NodeJS.Timeout | null = null;

export function startIdleDetection(onIdle: () => void, onActive: () => void) {
  const threshold = store.get("idleTimeout");
  if (!store.get("screensaverEnabled")) return;

  idleCheckInterval = setInterval(() => {
    const idleTime = powerMonitor.getSystemIdleTime();
    if (idleTime >= threshold && !screensaverWin) {
      onIdle();
    }
  }, 5000); // Check every 5 seconds

  powerMonitor.on("user-did-become-active", () => {
    if (screensaverWin) onActive();
  });

  powerMonitor.on("lock-screen", () => {
    if (screensaverWin) onActive();
  });
}

export function showScreensaver() {
  if (screensaverWin) return;

  screensaverWin = new BrowserWindow({
    fullscreen: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: "#1A1A1A",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      partition: "persist:cmdeck",
    },
  });

  // Load the read-only dashboard as the screensaver
  screensaverWin.loadURL("https://cmdeck.io/wallpaper");

  // Dismiss on any input — delay to ignore mouse jitter from window appearing
  screensaverWin.webContents.on("did-finish-load", () => {
    screensaverWin?.webContents.executeJavaScript(`
      let ready = false;
      setTimeout(() => { ready = true; }, 1500);
      document.addEventListener('mousemove', () => { if (ready) window.close(); });
      document.addEventListener('mousedown', () => { if (ready) window.close(); });
      document.addEventListener('keydown', () => { if (ready) window.close(); });
    `);
  });
}

export function dismissScreensaver() {
  if (screensaverWin && !screensaverWin.isDestroyed()) {
    screensaverWin.close();
  }
  screensaverWin = null;
}

export function stopIdleDetection() {
  if (idleCheckInterval) {
    clearInterval(idleCheckInterval);
    idleCheckInterval = null;
  }
}

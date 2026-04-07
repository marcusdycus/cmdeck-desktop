import { BrowserWindow, screen } from "electron";
import path from "path";

const BASE_URL = "https://cmdeck.io";
let wallpaperWin: BrowserWindow | null = null;
let editWin: BrowserWindow | null = null;
let isAttached = false;

export function createWallpaperWindow(): BrowserWindow {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  wallpaperWin = new BrowserWindow({
    x: 0,
    y: 0,
    width,
    height,
    frame: false,
    transparent: false,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    fullscreen: true,
    backgroundColor: "#1A1A1A",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      partition: "persist:cmdeck",
    },
  });

  wallpaperWin.loadURL(`${BASE_URL}/wallpaper`);

  wallpaperWin.on("closed", () => {
    wallpaperWin = null;
  });

  return wallpaperWin;
}

export function createEditWindow(): BrowserWindow {
  editWin = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Command Deck",
    titleBarStyle: "hiddenInset",
    backgroundColor: "#1A1A1A",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      partition: "persist:cmdeck",
    },
  });

  editWin.loadURL(`${BASE_URL}/deck`);

  editWin.on("closed", () => {
    editWin = null;
  });

  return editWin;
}

export async function attachWallpaper(): Promise<void> {
  if (!wallpaperWin || isAttached) return;

  if (process.platform === "win32") {
    try {
      const { attach } = await import("electron-as-wallpaper");
      attach(wallpaperWin);
      isAttached = true;
    } catch (err) {
      console.error("Failed to attach wallpaper (Windows):", err);
    }
  } else if (process.platform === "darwin") {
    // Place window at desktop level
    wallpaperWin.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    });
    wallpaperWin.setAlwaysOnTop(true, "desktop");
    wallpaperWin.setFocusable(false);
    isAttached = true;
  }
}

export async function detachWallpaper(): Promise<void> {
  if (!wallpaperWin || !isAttached) return;

  if (process.platform === "win32") {
    try {
      const { detach } = await import("electron-as-wallpaper");
      detach(wallpaperWin);
    } catch (err) {
      console.error("Failed to detach wallpaper (Windows):", err);
    }
  } else if (process.platform === "darwin") {
    wallpaperWin.setAlwaysOnTop(false);
    wallpaperWin.setFocusable(true);
  }

  isAttached = false;
}

export function getWallpaperWindow(): BrowserWindow | null {
  return wallpaperWin;
}

export function getEditWindow(): BrowserWindow | null {
  return editWin;
}

export function isWallpaperAttached(): boolean {
  return isAttached;
}

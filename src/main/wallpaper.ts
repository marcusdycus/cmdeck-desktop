import { BrowserWindow, screen } from "electron";
import path from "path";

const BASE_URL = "https://cmdeck.io";
let mainWin: BrowserWindow | null = null;

// CSS injected into the remote page to make the title bar draggable
// and prevent traffic light buttons from covering content
const TITLEBAR_CSS = `
  /* Make the header area draggable for macOS window movement */
  header, [class*="header"], nav {
    -webkit-app-region: drag;
    padding-left: 78px !important;
  }

  /* Buttons/links inside the header should still be clickable */
  header a, header button, header input, header select,
  nav a, nav button, nav input, nav select,
  [class*="header"] a, [class*="header"] button,
  [class*="header"] input, [class*="header"] select {
    -webkit-app-region: no-drag;
  }

  /* Top-level body padding so nothing hides behind traffic lights */
  body {
    padding-top: 2px;
  }
`;

export function createMainWindow(): BrowserWindow {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWin = new BrowserWindow({
    width: Math.round(width * 0.85),
    height: Math.round(height * 0.85),
    title: "Command Deck",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 12, y: 12 },
    backgroundColor: "#1A1A1A",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      partition: "persist:cmdeck",
    },
  });

  mainWin.loadURL(`${BASE_URL}/deck`);

  // Inject titlebar CSS after each page load
  mainWin.webContents.on("did-finish-load", () => {
    mainWin?.webContents.insertCSS(TITLEBAR_CSS);
  });

  mainWin.on("closed", () => {
    mainWin = null;
  });

  return mainWin;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWin;
}

export function reloadMainWindow(): void {
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.loadURL(`${BASE_URL}/deck`);
  }
}

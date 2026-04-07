import { BrowserWindow, screen } from "electron";
import path from "path";

const BASE_URL = "https://cmdeck.io";
let mainWin: BrowserWindow | null = null;

const isMac = process.platform === "darwin";

// CSS injected into the remote page for window dragging
const TITLEBAR_CSS = isMac
  ? `
  /* macOS: make header draggable, pad for traffic lights */
  header, [class*="header"], nav {
    -webkit-app-region: drag;
    padding-left: 78px !important;
  }
  header a, header button, header input, header select,
  nav a, nav button, nav input, nav select,
  [class*="header"] a, [class*="header"] button,
  [class*="header"] input, [class*="header"] select {
    -webkit-app-region: no-drag;
  }
  body { padding-top: 2px; }
`
  : `
  /* Windows: make header draggable */
  header, [class*="header"], nav {
    -webkit-app-region: drag;
  }
  header a, header button, header input, header select,
  nav a, nav button, nav input, nav select,
  [class*="header"] a, [class*="header"] button,
  [class*="header"] input, [class*="header"] select {
    -webkit-app-region: no-drag;
  }
`;

export function createMainWindow(): BrowserWindow {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const winOptions: Electron.BrowserWindowConstructorOptions = {
    width: Math.round(width * 0.85),
    height: Math.round(height * 0.85),
    title: "Command Deck",
    backgroundColor: "#1A1A1A",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      partition: "persist:cmdeck",
    },
  };

  if (isMac) {
    winOptions.titleBarStyle = "hiddenInset";
    winOptions.trafficLightPosition = { x: 12, y: 12 };
  } else {
    winOptions.titleBarStyle = "hidden";
    winOptions.titleBarOverlay = {
      color: "#1A1A1A",
      symbolColor: "#8A8A8A",
      height: 36,
    };
  }

  mainWin = new BrowserWindow(winOptions);
  mainWin.loadURL(`${BASE_URL}/deck`);

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

import { Tray, Menu, nativeImage, app, shell } from "electron";
import path from "path";
import { getMainWindow } from "./wallpaper";
import { store } from "./store";

let tray: Tray | null = null;

interface TrayCallbacks {
  onToggleFullscreen: () => void;
  onRefresh: () => void;
  onLogout: () => void;
}

const TIMEOUT_OPTIONS = [
  { label: "15 seconds", value: 15 },
  { label: "30 seconds", value: 30 },
  { label: "1 minute", value: 60 },
  { label: "2 minutes", value: 120 },
  { label: "5 minutes", value: 300 },
  { label: "10 minutes", value: 600 },
  { label: "30 minutes", value: 1800 },
];

export function createTray(callbacks: TrayCallbacks): { updateMenu: () => void } {
  if (tray) {
    tray.destroy();
    tray = null;
  }

  const iconPath = path.join(__dirname, "../../assets/tray-icon.png");
  let icon = nativeImage.createFromPath(iconPath);

  if (icon.isEmpty()) {
    icon = nativeImage.createEmpty();
  }

  if (process.platform === "darwin") {
    icon.setTemplateImage(true);
  }

  tray = new Tray(icon);
  tray.setToolTip("Command Deck");

  const buildMenu = () => {
    const currentTimeout = store.get("idleTimeout");
    const screensaverEnabled = store.get("screensaverEnabled");

    return Menu.buildFromTemplate([
      { label: "Command Deck", enabled: false },
      { type: "separator" },
      {
        label: "Show Dashboard",
        click: () => {
          const win = getMainWindow();
          if (win && !win.isDestroyed()) {
            win.show();
            win.focus();
          }
        },
      },
      {
        label: "Toggle Fullscreen",
        accelerator: "CommandOrControl+Shift+D",
        click: callbacks.onToggleFullscreen,
      },
      {
        label: "Open in Browser",
        click: () => shell.openExternal("https://cmdeck.io/deck"),
      },
      { type: "separator" },
      { label: "Screensaver", enabled: false },
      {
        label: "Enabled",
        type: "checkbox",
        checked: screensaverEnabled,
        click: () => {
          store.set("screensaverEnabled", !screensaverEnabled);
          tray?.setContextMenu(buildMenu());
        },
      },
      {
        label: "Idle Timeout",
        submenu: TIMEOUT_OPTIONS.map((opt) => ({
          label: opt.label,
          type: "radio" as const,
          checked: currentTimeout === opt.value,
          click: () => {
            store.set("idleTimeout", opt.value);
            tray?.setContextMenu(buildMenu());
          },
        })),
      },
      { type: "separator" },
      {
        label: "Refresh",
        click: callbacks.onRefresh,
      },
      {
        label: "Sign Out",
        click: callbacks.onLogout,
      },
      { type: "separator" },
      {
        label: "Quit",
        accelerator: process.platform === "darwin" ? "Cmd+Q" : undefined,
        click: () => app.quit(),
      },
    ]);
  };

  tray.setContextMenu(buildMenu());

  return {
    updateMenu: () => tray?.setContextMenu(buildMenu()),
  };
}

import { Tray, Menu, nativeImage, app, shell } from "electron";
import path from "path";
import { getMainWindow } from "./wallpaper";

let tray: Tray | null = null;

interface TrayCallbacks {
  onToggleFullscreen: () => void;
  onRefresh: () => void;
  onLogout: () => void;
}

export function createTray(callbacks: TrayCallbacks): { updateMenu: () => void } {
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

  const buildMenu = () =>
    Menu.buildFromTemplate([
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

  tray.setContextMenu(buildMenu());

  return {
    updateMenu: () => tray?.setContextMenu(buildMenu()),
  };
}

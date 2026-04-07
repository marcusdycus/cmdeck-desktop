import { Tray, Menu, nativeImage, app, shell } from "electron";
import path from "path";

let tray: Tray | null = null;

interface TrayCallbacks {
  onToggleMode: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  getMode: () => "wallpaper" | "windowed";
}

export function createTray(callbacks: TrayCallbacks): { updateMenu: () => void } {
  const iconPath =
    process.platform === "darwin"
      ? path.join(__dirname, "../../assets/tray-icon.png")
      : path.join(__dirname, "../../assets/tray-icon.png");

  const icon = nativeImage.createFromPath(iconPath);
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
        label:
          callbacks.getMode() === "wallpaper"
            ? "Switch to Edit Mode"
            : "Switch to Wallpaper Mode",
        accelerator: "CommandOrControl+Shift+D",
        click: callbacks.onToggleMode,
      },
      {
        label: "Open in Browser",
        click: () => shell.openExternal("https://cmdeck.io/deck"),
      },
      { type: "separator" },
      {
        label: "Refresh Wallpaper",
        click: callbacks.onRefresh,
      },
      { type: "separator" },
      {
        label: "Sign Out",
        click: callbacks.onLogout,
      },
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

import { BrowserWindow, session } from "electron";
import { store } from "./store";

const BASE_URL = "https://cmdeck.io";

export async function checkAuthStatus(): Promise<boolean> {
  try {
    const ses = session.fromPartition("persist:cmdeck");
    const cookies = await ses.cookies.get({ url: BASE_URL });
    const hasSession = cookies.some(
      (c) =>
        c.name === "__Secure-next-auth.session-token" ||
        c.name === "next-auth.session-token" ||
        c.name === "authjs.session-token"
    );

    if (!hasSession) {
      store.set("isLoggedIn", false);
      return false;
    }

    // Verify with server
    const fetch = (await import("electron")).net.fetch;
    const res = await fetch(`${BASE_URL}/api/auth/desktop-status`, {
      session: ses,
    } as RequestInit);
    const data = await res.json();

    store.set("isLoggedIn", data.authenticated);
    return data.authenticated;
  } catch {
    return store.get("isLoggedIn");
  }
}

export function createLoginWindow(onSuccess: () => void): BrowserWindow {
  const win = new BrowserWindow({
    width: 480,
    height: 640,
    resizable: false,
    title: "Command Deck — Sign In",
    backgroundColor: "#1A1A1A",
    webPreferences: {
      partition: "persist:cmdeck",
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL(`${BASE_URL}/login?desktop=true`);

  // Detect successful login by monitoring URL changes
  win.webContents.on("did-navigate", (_event, url) => {
    if (url.includes("/deck") || url.includes("/wallpaper")) {
      store.set("isLoggedIn", true);
      win.close();
      onSuccess();
    }
  });

  win.webContents.on("did-navigate-in-page", (_event, url) => {
    if (url.includes("/deck") || url.includes("/wallpaper")) {
      store.set("isLoggedIn", true);
      win.close();
      onSuccess();
    }
  });

  return win;
}

export async function logout(): Promise<void> {
  const ses = session.fromPartition("persist:cmdeck");
  await ses.clearStorageData();
  store.set("isLoggedIn", false);
}

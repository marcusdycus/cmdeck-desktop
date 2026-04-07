import { app } from "electron";
import path from "path";
import fs from "fs";

interface StoreSchema {
  isLoggedIn: boolean;
  idleTimeout: number;
  screensaverEnabled: boolean;
  launchAtStartup: boolean;
  lastMode: "wallpaper" | "windowed";
}

const defaults: StoreSchema = {
  isLoggedIn: false,
  idleTimeout: 30,
  screensaverEnabled: true,
  launchAtStartup: true,
  lastMode: "wallpaper",
};

class SimpleStore {
  private filePath: string | null = null;
  private data: StoreSchema = { ...defaults };
  private loaded = false;

  private ensureLoaded() {
    if (this.loaded) return;
    this.filePath = path.join(app.getPath("userData"), "config.json");
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        this.data = { ...defaults, ...JSON.parse(raw) };
      }
    } catch {
      this.data = { ...defaults };
    }
    this.loaded = true;
  }

  private save() {
    if (!this.filePath) return;
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    } catch {
      // Silent fail
    }
  }

  get<K extends keyof StoreSchema>(key: K): StoreSchema[K] {
    this.ensureLoaded();
    return this.data[key];
  }

  set<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]) {
    this.ensureLoaded();
    this.data[key] = value;
    this.save();
  }
}

export const store = new SimpleStore();

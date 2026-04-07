# Command Deck Desktop

Native macOS app for your [cmdeck.io](https://cmdeck.io) dashboard.

## Features

- Your Command Deck dashboard in a clean native window
- Hidden title bar with draggable header
- Toggle fullscreen: `Cmd+Shift+D`
- System tray with quick actions (show, fullscreen, refresh, sign out)
- Screensaver with animated clock on idle (5 min default)
- Auto-launch on startup
- Signs in with your cmdeck.io account

## Install

1. Download the `.dmg` from [Releases](https://github.com/marcusdycus/cmdeck-desktop/releases)
2. Open it and drag **Command Deck** to Applications
3. Right-click the app > Open (first launch only -- app is unsigned)
4. Sign in with your cmdeck.io account

## How It Works

1. Launch the app -- sign in with your cmdeck.io account
2. Your dashboard loads in a native window
3. Press `Cmd+Shift+D` to toggle fullscreen on any monitor
4. After 5 minutes idle, a screensaver with an animated clock appears
5. Use the tray icon for quick actions

## Development

```bash
npm install
npm run dev
```

> **Note:** If running from VS Code's terminal, the `dev` script automatically unsets `ELECTRON_RUN_AS_NODE` which VS Code sets.

## Build

```bash
npm run dist:mac   # macOS DMG (universal: Intel + Apple Silicon)
```

## Tech

- Electron 41
- Loads cmdeck.io remotely (no local server needed)
- Injects CSS for draggable title bar and traffic light positioning
- macOS uses `hiddenInset` title bar style

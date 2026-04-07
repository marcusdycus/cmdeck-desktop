# Command Deck Desktop

Desktop app that turns your [cmdeck.io](https://cmdeck.io) dashboard into a live wallpaper and screensaver.

## Features

- Live wallpaper showing your Command Deck dashboard
- Screensaver with animated clock on idle (5 min default)
- Hotkey toggle: `Cmd+Shift+D` (macOS) / `Ctrl+Shift+D` (Windows) to switch between wallpaper and edit mode
- System tray with quick actions
- Auto-launch on startup
- Signs in with your cmdeck.io account

## How It Works

1. Launch the app — sign in with your cmdeck.io account
2. Your dashboard renders as a passive live wallpaper
3. Press `Cmd+Shift+D` to pop into windowed mode for editing
4. Press again to go back to wallpaper mode
5. After 5 minutes idle, a screensaver with an animated clock appears

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run dist:mac   # macOS DMG
npm run dist:win   # Windows installer
```

## Tech

- Electron 33
- Loads cmdeck.io remotely (no local Next.js server)
- electron-as-wallpaper for Windows WorkerW integration
- macOS uses window level positioning

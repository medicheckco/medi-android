# MediTrack Mobile

MediTrack is a pharmacy inventory management system built with React and prepared for deployment to both Android and iOS from one shared codebase.

## Features

- Medication catalog with search, filters, brand and location grouping
- Batch management with expiry tracking and near-expiry highlighting
- Barcode and GS1 QR scanning flows
- Import and export tools
- Capacitor setup for native Android and iOS packaging

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies with `npm install`
2. Add the values from [.env.example](C:\Users\Kaleel\Downloads\Meditrack.neon-main\Meditrack.neon-main\.env.example) into `.env.local`
3. Start the app with `npm run dev`

## Build Mobile Apps

1. Install dependencies with `npm install`
2. Build the web bundle with `npm run mobile:build`
3. Generate native project files with `npm run mobile:sync`
4. Open Android Studio with `npm run mobile:android`
5. Open Xcode with `npm run mobile:ios`

## Notes

- The shared React UI is the source of truth for both platforms.
- Safe-area handling is included for iPhone and Android devices with notches and gesture bars.
- Camera-based scanning permissions are handled at the native project level after Capacitor sync.
- PWA and AI Studio-specific server files were removed to keep the repo mobile-focused.
- Firebase and API endpoints are now configured through Vite environment variables for mobile development.

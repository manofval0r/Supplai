# Supplai Web

A responsive Next.js web app for Supplai. It is built from the Expo mobile
screens with React Native Web, so the workflow and visual language match
`apps/mobile`. Changes here do not modify the mobile app.

Routes:

- `/` marketing landing page and interactive app preview
- `/login` demo entry
- `/dashboard` the full facility and rider workflow

Run it from the repository root:

```powershell
npm run dev --workspace apps/web
```

It serves on http://localhost:3002. Start the API separately with
`npm run dev:api` on http://localhost:3000.

## Environment

Copy `.env.example` to `.env.local` and set only public values. This package
must never hold server secrets.

| Variable                       | Purpose                                           | Default                 |
| ------------------------------ | ------------------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL`          | Base URL for the Supplai API                      | `http://localhost:3000` |
| `NEXT_PUBLIC_EXPO_PREVIEW_URL` | Latest Android preview build or Expo project page | Expo project page       |

When the API is unreachable the screens continue in demo mode with fictional
fixtures. Every fixture view is labelled as demo data in the UI.

## Tests

```powershell
npm test --workspace apps/web
```

The suite covers API base resolution from environment variables and checks
that committed environment examples contain placeholders, not secrets.

## 3D

The native 3D product stage is rebuilt for the browser with Three.js on a
WebGL canvas. The landing page also includes an interactive 3D phone preview
loaded from `public/preview/home.png`.

## Build

```powershell
npm run build --workspace apps/web
npm run start --workspace apps/web
```

# Supplai Web

This is an independent Next.js web port of the Expo mobile app. The screens,
components, theme, API client, and image assets are copied into this workspace;
changes here do not modify `apps/mobile`.

Run the app from the repository root:

```powershell
npm run dev --workspace apps/web
```

The web client uses `NEXT_PUBLIC_API_URL` when set. It defaults to
`http://localhost:3000`, matching the local API used by the mobile app.
Browser notifications require explicit permission. The native-only 3D product
stage is rendered as a CSS illustration on the web.

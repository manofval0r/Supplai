# Supplai Mobile (Round 5)

Expo SDK 58 facility/rider role shell for the Supplai emergency medicine redistribution workflow.

## Role flows

- **Facility** — raise an ambient-only stock request (ORS sachets / zinc 20 mg tablets), confirm or decline source release, accept or refuse receipt using the 4-digit delivery proof code.
- **Rider** — mark picked up, mark in transit, view the delivery proof code to share with the receiving facility.

Both roles share a notification inbox (unread badge, per-event read state, deep link to an order) and in-app banners. Expo local notifications fire for simulated critical events on Android (request raised, pickup recorded, transfer in transit). Remote push is optional and never a required demo dependency.

## Running

```bash
cd apps/mobile
npm install        # already run once at the repo root
npx expo start     # Expo Go / dev client
```

The app calls the API at `http://127.0.0.1:3000` by default. Override with `EXPO_PUBLIC_API_URL`.

Start the API first:

```bash
cd ../api
npm run dev
```

## `/demo/dispatch` proof-code handoff (documented contract)

Dispatch is an LGA / demo-operator action, not a mobile action. It lives on the API at `POST /demo/dispatch` and returns:

```json
{
  "transferReference": "TRF-0001",
  "externalDispatchId": "...",
  "receiverProofCode": "1234",
  "proofExpiresAt": "2026-11-05T12:30:00.000Z"
}
```

The `receiverProofCode` is a 4-digit code valid for 30 minutes. The rider shares it with the receiving facility, which enters it via the mobile **Accept handover** action (`POST /api/orders/:reference/actions` with `action: "receive"` and `proofCode`). The source facility's phone must match the transfer's receiving facility, otherwise the action returns `unauthorized`. Two wrong codes lock the transfer.

Mobile displays the last 4 characters of `transferReference` as the placeholder proof code until the real proof code is wired from the dispatch response into the rider order view.

## Data boundaries

This is a demo scaffold. Fictional facility IDs (`PHC-A`…`PHC-H`), phone numbers, and commodity data are used. Ambient commodities only: ORS and zinc 20 mg. No oxytocin, no cold chain. All paid/partner-dependent services (SMS gateway, maps provider, remote push) are simulated or configurable via environment variables.

## Tech

- Expo SDK 58 (`expo` 58.0.23, `expo-router` not used — single-app role shell)
- React Native 0.88.1, TypeScript
- `expo-notifications` for local alerts
- `react-native-safe-area-context` for SafeAreaView
- EAS build for Android demo; remote native push is a development-build enhancement

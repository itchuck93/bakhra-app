# BAKHRA — Android & iOS app (demo)

One codebase (Expo / React Native, TypeScript) that runs on both Android and iOS.
Modelled on bakhra.com: campaign slideshow, categories, products, bundles with
scent selection, search, cart, English/Arabic switch, and a **demo** checkout
(no order is sent, no payment is taken).

## Run it on your phone (fastest)
1. Install Node.js 20+ on a computer.
2. In this folder: `npm install` then `npx expo start`
3. Install **Expo Go** on your phone (Play Store / App Store) and scan the QR code.

## Run in Android Studio / Xcode
- Android: `npx expo run:android` (creates the `android/` folder you can open in Android Studio)
- iOS: `npx expo run:ios` (needs a Mac with Xcode)

## Build store files
`npx eas-cli build -p android` (APK/AAB) and `npx eas-cli build -p ios`
(iOS needs an Apple Developer account).

## Connect to Shopify
Open `src/shopify.ts` and fill in the three settings at the top:
store address (`xxxx.myshopify.com`), the Storefront **public** access token,
and an optional app-only discount code. With these empty the app runs in demo mode.

## Where things are
- `src/shopify.ts` — Shopify settings and connection (products, cart, checkout)
- `src/data.ts` — products, prices, images, contact details
- `src/i18n.ts` — English and Arabic text
- `src/ui.tsx` — colours and shared components
- `src/screens/` — Home, Shop/Search, Product, Cart/Checkout
- `App.tsx` — header, tabs, navigation

## Before release
- Arabic text and the colour palette were written for this demo — review against the brand.
- Bundle contents other than the All Over Trio are assumed from the bundle names.
- App icon and splash are still the starter placeholders (`assets/`).
- Images load from bakhra.com; the catalogue is a snapshot. For live stock, prices
  and real checkout, connect the Shopify Storefront API in `src/data.ts` and the
  `submit` function in `src/screens/Cart.tsx`.

## iOS build (no Mac needed)
EAS builds iOS in Expo's cloud. Profiles in `eas.json`:
- `preview` — installable on registered iPhones/iPads (ad hoc). Needs an Apple Developer account.
- `production` — for TestFlight / App Store. Needs an Apple Developer account.
- `simulator` — runs only in the Xcode simulator on a Mac.

From a computer: `npx eas-cli build -p ios --profile preview`
From a tablet: push this folder to GitHub, link the repo on expo.dev
(project → GitHub), then start an iOS build from the expo.dev website.

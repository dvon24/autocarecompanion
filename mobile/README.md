# Au7o Mobile (Capacitor shell)

Thin Android/iOS WebView over **https://au7o.io** with the `Au7oApp`
user-agent marker. The web app detects the marker (`src/lib/native-app.ts`)
and switches to store-safe behavior: no AdSense, no subscribe prompts.

**Store posture:** this is the FREE app. Subscriptions live on the website
and are never linked from inside the app — that avoids Apple's 30% IAP cut
and Play billing requirements entirely.

## Build the Android app (one-time setup)

1. Install **Android Studio** (bundles the SDK + JDK): https://developer.android.com/studio
2. `cd mobile && npx cap open android` — opens the project in Android Studio.
3. First run: let Android Studio finish Gradle sync, then press ▶ to run
   on an emulator or a USB-connected phone (enable Developer Options →
   USB debugging on the phone).

## Release to the Play Store

1. Create a Play Console account ($25 one-time): https://play.google.com/console
2. In Android Studio: **Build → Generate Signed Bundle (AAB)** — create a
   keystore when prompted and BACK IT UP (losing it means you can never
   update the app).
3. Play Console → Create app → upload the `.aab`, fill the store listing
   (use `assets/logo.png` art), complete the Data Safety form:
   - Data collected: email (account), photos (processed, not stored unless
     consented), approximate location (no), crash logs (Sentry if enabled)
   - Link the privacy policy: https://au7o.io/privacy
4. Content rating questionnaire → Everyone. Review typically takes 1–3 days.

## iOS later

Needs a Mac + Apple Developer account ($99/yr):
`npm i @capacitor/ios && npx cap add ios && npx cap open ios`.
The config already appends the UA marker for iOS.

## Regenerating icons/splash

Art source: `assets/logo.png` (1024×1024).
`npx @capacitor/assets generate --android --iconBackgroundColor '#F7F6F2' --splashBackgroundColor '#F7F6F2'`

## After changing capacitor.config.ts or www/

`npx cap sync`

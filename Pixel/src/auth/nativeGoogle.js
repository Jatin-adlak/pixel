import { GOOGLE_CLIENT_ID } from "../config/env"

const IOS_CLIENT_ID = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID || undefined

/** True when running inside the Capacitor Android/iOS shell. */
export const isNativeApp = () =>
  typeof window !== "undefined" &&
  !!window.Capacitor?.isNativePlatform?.()

let initialised = false

/**
 * Opens the native Google account picker and returns a Google ID token.
 * The token's audience is the WEB client ID, so the existing Django
 * /users/login/ endpoint can verify it exactly like a web login.
 */
export async function nativeGoogleSignIn() {
  const { SocialLogin } = await import("@capgo/capacitor-social-login")

  if (!initialised) {
    await SocialLogin.initialize({
      google: {
        webClientId: GOOGLE_CLIENT_ID,
        ...(IOS_CLIENT_ID ? { iOSClientId: IOS_CLIENT_ID } : {}),
      },
    })
    initialised = true
  }

  const res = await SocialLogin.login({
    provider: "google",
    options: { scopes: ["email", "profile"] },
  })

  const idToken = res?.result?.idToken
  if (!idToken) throw new Error("Google did not return an ID token.")
  return idToken
}

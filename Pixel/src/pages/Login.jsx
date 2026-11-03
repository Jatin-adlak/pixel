
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import TeamParticles from "../components/TeamParticles";
import { loginUser } from "../api/api";
import { isNativeApp, nativeGoogleSignIn } from "../auth/nativeGoogle";

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSuccess = async (credentialResponse) => {
    if (loading) return;

    try {
      setLoading(true);
      setError("");

      // Ensure Google returned an identity credential.
      const credential = credentialResponse?.credential;

      if (!credential) {
        throw new Error("Google did not return a credential.");
      }

      // Send Google's credential to Django.
      // Django verifies it and issues PIXEL's JWT tokens.
      const result = await loginUser({ credential });

      // Validate the response before storing anything.
      if (!result?.user || !result?.access || !result?.refresh) {
        throw new Error(
          "The server returned an incomplete login response."
        );
      }

      const savedUser = result.user;

      if (!savedUser.email) {
        throw new Error("The server did not return a user email.");
      }

      // Store PIXEL access and refresh tokens.
      localStorage.setItem("pixelAccessToken", result.access);
      localStorage.setItem("pixelRefreshToken", result.refresh);

      // Store the user profile returned by Django.
      localStorage.setItem(
        "pixelUser",
        JSON.stringify(savedUser)
      );

      // Notify components that listen for user changes.
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("userChanged"));

      // Preserve the existing onboarding flow.
      const isNewUser =
        typeof savedUser.name !== "string" ||
        savedUser.name.trim() === "";

      if (isNewUser) {
        navigate("/username", {
          state: { email: savedUser.email },
          replace: true,
        });
      } else {
        navigate("/feed", {
          state: { email: savedUser.email },
          replace: true,
        });
      }
    } catch (err) {
      console.error("PIXEL login error:", err);

      setError(
        err.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in failed. Please try again.");
  };

  // Android / iOS app: Google blocks web sign-in inside a WebView,
  // so use the native account picker and reuse the same login flow.
  const handleNativeGoogle = async () => {
    if (loading) return;
    try {
      setError("");
      const idToken = await nativeGoogleSignIn();
      await handleLoginSuccess({ credential: idToken });
    } catch (err) {
      console.error("PIXEL native login error:", err);
      setError(err.message || "Google sign-in failed. Please try again.");
    }
  };

  const handleGuestBrowse = () => {
    navigate("/feed");
  };

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-black">
      <TeamParticles />

      <div
        className="
          relative z-10
          backdrop-blur-2xl
          bg-white/20 dark:bg-black/20
          border border-white/30 dark:border-white/10
          rounded-3xl
          px-12 py-14
          shadow-xl
          flex flex-col items-center text-center
        "
      >
        <h1 className="text-5xl font-pixel mb-10 text-blue-600">
          Pixel
        </h1>

        <p className="text-black dark:text-gray-400 mb-8">
          Your <i>moments</i>, organised <i>beautifully!</i>
        </p>

        <div className="flex flex-col gap-4 w-[260px]">
          <div className="flex justify-center">
            {isNativeApp() ? (
              <button
                type="button"
                onClick={handleNativeGoogle}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white text-black font-medium shadow hover:bg-gray-100 transition disabled:opacity-60"
              >
                Continue with Google
              </button>
            ) : (
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={handleGoogleError}
                useOneTap={false}
              />
            )}
          </div>

          {loading && (
            <p
              className="text-sm text-gray-500"
              role="status"
            >
              Signing in...
            </p>
          )}

          {error && (
            <p
              className="text-sm text-red-500 break-words"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleGuestBrowse}
            className="
              text-gray-600 dark:text-gray-400
              w-full py-3 rounded-xl
              hover:bg-white/10 transition
            "
          >
            Browse as Guest
          </button>
        </div>
      </div>
    </section>
  );
}

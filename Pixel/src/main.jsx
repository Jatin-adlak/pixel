import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { GoogleOAuthProvider } from "@react-oauth/google"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="937566351436-ri2j2qrt3thc7gud43au585fsf97uiig.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
)

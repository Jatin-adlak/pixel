import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { GoogleOAuthProvider } from "@react-oauth/google"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="578954072006-aas3viqv21ho7hc2gvg64ibpac1ljsmr.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
)

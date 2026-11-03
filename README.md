# PIXEL

Photography, AI and storytelling platform for SAIT / SAIP.
One codebase, three ways to run it:

| Part | Folder | Tech | Port |
|---|---|---|---|
| Website + Android/iOS app | `Pixel/` | React 19, Vite, Tailwind, Capacitor 8 | 5173 (dev) |
| REST API | `pixel_backend/` | Django, Django REST Framework, MongoDB (GridFS) | 8000 |
| AI face search | `face_service/` | FastAPI, InsightFace, FAISS | 5001 |

```
pixel/
├── Pixel/             React app  (+ Pixel/android = the Android Studio project)
├── pixel_backend/     Django API (.env, credentials/ are git-ignored)
├── face_service/      FastAPI face-search service (dataset/, embeddings/)
├── requirements.txt   ALL Python dependencies (backend + face service)
├── run-all.bat        Starts everything on Windows
└── venv/              Python virtual environment (git-ignored)
```

How the pieces talk to each other:

```
 Browser / Android app ──▶ Django :8000 ──▶ MongoDB (data + images in GridFS)
                                  │──▶ Google Drive (event gallery photos)
                                  └──▶ Face service :5001 (face search)
```

---

## 1. Requirements

Install these once.

| Tool | Version | Needed for |
|---|---|---|
| Python | 3.14 (what the pinned versions were tested on) | backend + face service |
| Node.js | **22 or newer** (required by Capacitor 8) | website + app build |
| MongoDB | local server **or** a MongoDB Atlas cluster | database |
| Git | any | – |
| Android Studio | **2025.2.1 (Otter) or newer** | Android app |
| Xcode | 26+ (Mac only) | iOS app (optional) |

Android Studio installs the JDK it needs (JDK 21) by itself. In Android Studio, open
**Settings → Languages & Frameworks → Android SDK** and install an SDK platform
(Android 15 / API 35 is a stable choice) plus **Android Emulator** and
**Android SDK Platform-Tools** under *SDK Tools*.

Python packages are listed in `requirements.txt`. The JavaScript and Android packages are in
`Pixel/package.json` (React, Capacitor core/android/ios/cli, `@capgo/capacitor-social-login`,
`@react-oauth/google`, etc.) and install with `npm install`.

---

## 2. First-time setup

### 2.1 Python environment (backend + face service)

Open a terminal in the project root:

```powershell
python -m venv venv
venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 2.2 Backend configuration

Create `pixel_backend\.env` (copy `pixel_backend\.env.example`):

```ini
# MongoDB (local) or your Atlas connection string
MONGO_URI=mongodb://localhost:27017/
JWT_SECRET=change-me

# Path to the Google Drive service-account JSON (never commit this file)
GOOGLE_SERVICE_ACCOUNT_FILE=credentials/google-service-account.json

# Optional - the web client ID is already built in as a default
# GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com

# Optional - comma separated. Defaults: localhost,127.0.0.1,10.0.2.2
# ALLOWED_HOSTS=api.your-domain.com
```

Then:

1. Put your Google service-account key at `pixel_backend\credentials\google-service-account.json`
   and share the Drive photo folders with that account's e-mail address.
2. The database is called `pixel_db`. Collections and GridFS are created automatically.
3. Create Django's own tables once:
   ```powershell
   cd pixel_backend
   python manage.py migrate
   ```

Who can sign in: any `@sait.ac.in` / `@saip.ac.in` Google account, plus the admin
e-mails listed in `pixel_backend/apps/users/views.py` (`ADMIN_EMAILS`, `ALLOWED_DOMAINS`).

### 2.3 Face service data

The face service reads photos from `face_service\dataset\images` and stores its search index in
`face_service\embeddings`. To (re)build the index from the photos:

```powershell
cd face_service
python -m backend.index_builder
```

New photos dropped into `dataset\images` while the service is running are indexed automatically.
InsightFace downloads its model files (~300 MB) the first time it starts.

### 2.4 Website dependencies

```powershell
cd Pixel
npm install
```

---

## 3. Run the website (web version)

### Option A - one click (Windows)

Double-click `run-all.bat`. It starts the face service, Django and Vite in three windows.
The paths at the top of the file point to `C:\Users\yasha\Desktop\pixel\pixel`; edit `ROOT`
if your project lives somewhere else.

### Option B - manually (3 terminals)

```powershell
# Terminal 1 - face service
cd face_service
..\venv\Scripts\activate
uvicorn backend.main:app --reload --host 127.0.0.1 --port 5001

# Terminal 2 - Django API
cd pixel_backend
..\venv\Scripts\activate
python manage.py runserver

# Terminal 3 - website (no venv needed)
cd Pixel
npm run dev
```

Open **http://localhost:5173**.

The site talks to `http://127.0.0.1:8000` by default. To use another backend, set
`VITE_API_ORIGIN` (see 4.3). All URLs are read from `Pixel/src/config/env.js`.

---

## 4. Run the Android app

The Android app is the same React site wrapped with Capacitor. The Android Studio project is
`Pixel/android`.

### 4.1 One-time setup

```powershell
cd Pixel
npm install
npx cap add android      # only if the Pixel/android folder does not exist yet
```

### 4.2 Create a virtual device

In Android Studio: **Tools → Device Manager → Create Device**, pick a Pixel phone and a
**stable** system image such as **API 35** (very new/preview images such as API 37 can hang on
"Connecting to the Emulator"). If it hangs: **⋮ → Cold Boot Now**, or untick
*Settings → Tools → Emulator → Launch in the Running Devices tool window*.

### 4.3 Point the app at the backend

Create `Pixel\.env.production`:

```ini
# Android emulator: 10.0.2.2 is the emulator's name for your PC's localhost
VITE_API_ORIGIN=http://10.0.2.2:8000
VITE_GOOGLE_CLIENT_ID=<your web OAuth client id>
```

`Pixel\capacitor.config.json` must allow plain HTTP while testing locally:

```json
{
  "appId": "com.pixel.app",
  "appName": "Pixel",
  "webDir": "dist",
  "server": { "androidScheme": "http", "cleartext": true }
}
```

Django already accepts `10.0.2.2` (default `ALLOWED_HOSTS`).

### 4.4 Build and run

1. Start the backend (section 3, terminal 2) and, for face search, the face service.
2. Open a normal terminal (**not** the Python venv one) and go to the **frontend folder, `Pixel`**.
   Run these three commands **from inside the `Pixel` folder** (the one that contains `package.json`):
   ```powershell
   cd C:\Users\yasha\Desktop\pixel\pixel\Pixel

   npm run build            # 1. build the website into Pixel\dist
   npx cap sync android     # 2. copy the build into the Android project
   npx cap open android     # 3. open the project in Android Studio
   ```
   Running them anywhere else (project root, `pixel_backend`, or a terminal with the venv
   active) fails with "missing script" or module errors.

   Shortcut - the same three steps in one command, also run from the `Pixel` folder:
   ```powershell
   npm run mobile:android
   ```
3. Wait for the Gradle sync to finish, start the emulator, press **Run ▶**.

**Every time you change React code or `.env.production`, run `npm run build` and
`npx cap sync android` again (or `npm run mobile:sync`) from the `Pixel` folder, then press Run ▶.**
If Android Studio is already open you don't need step 3. Closing Android Studio loses nothing;
reopen it with `npx cap open android`.

Handy scripts (`Pixel/package.json`):

| Command | What it does |
|---|---|
| `npm run mobile:sync` | build the web app and copy it into android/ and ios/ |
| `npm run mobile:android` | build + sync + open Android Studio |
| `npm run mobile:ios` | build + sync + open Xcode (Mac only) |

### 4.5 Testing on a real phone

1. Enable Developer options → USB debugging, plug the phone in.
2. Phone and PC must be on the same Wi-Fi. Find the PC address with `ipconfig` (IPv4).
3. `Pixel\.env.production`: `VITE_API_ORIGIN=http://<PC-IP>:8000`
4. `pixel_backend\.env`: `ALLOWED_HOSTS=localhost,127.0.0.1,<PC-IP>`
5. Start Django on all interfaces: `python manage.py runserver 0.0.0.0:8000`
6. Allow port 8000 in Windows Firewall, then `npm run mobile:sync` and Run ▶.

### 4.6 Google sign-in on Android

Inside the app, Google login uses the **native** account picker (the web button is blocked in
WebViews). Browse-as-guest works without any of this.

1. Google Cloud Console → *APIs & Services → Credentials → Create credentials → OAuth client ID*
   → **Android**. Package name `com.pixel.app` and the SHA-1 of your signing key:
   ```powershell
   cd Pixel\android
   .\gradlew signingReport
   ```
   (use the `debug` variant SHA-1 for testing, the release/Play one for production)
2. Keep using the existing **Web** client ID as `VITE_GOOGLE_CLIENT_ID` - the backend verifies
   tokens against it.
3. iOS: create an iOS client and set `VITE_GOOGLE_IOS_CLIENT_ID`.
4. If the account picker opens but nothing happens, follow the Android setup notes of
   <https://github.com/Cap-go/capacitor-social-login> (the plugin may need a small
   `MainActivity` change).

### 4.7 Building an installable app

- **Test APK:** Android Studio → **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
- **Play Store:** **Build → Generate Signed Bundle / APK → Android App Bundle** and create a
  keystore. Keep the keystore file and passwords safe: every future update needs the same one.

### 4.8 Before a public release

- Host the Django API (and the face service) on a server with **HTTPS**.
- Set `VITE_API_ORIGIN=https://api.your-domain.com` and change `capacitor.config.json` to
  `"androidScheme": "https"` and remove `"cleartext": true`.
- Set `DEBUG = False`, a real `SECRET_KEY` and `ALLOWED_HOSTS` in the backend.
- Use `gunicorn` (Linux) instead of `runserver`.
- Compress the three team photos in `Pixel/src/assets/team` (4-13 MB each).

---

## 5. How the Android build differs from the website

- Backend URLs come from `VITE_API_ORIGIN` (`Pixel/src/config/env.js`).
- `Pixel/src/config/fetchPatch.js` rewrites any `http://127.0.0.1:8000` / `localhost:8000` link
  that the API returns (for example image URLs) to the real backend address.
- On phones the top bar shows only the logo, search, bell and avatar, and navigation moves to a
  bottom tab bar (`MobileTabBar.jsx`). Desktop layouts are unchanged.
- Native Google login: `Pixel/src/auth/nativeGoogle.js`.

---

## 6. Troubleshooting

| Problem | Fix |
|---|---|
| "Google login is not configured on the server" | Backend has no `GOOGLE_CLIENT_ID`. A default is built into `settings.py`; restart `runserver`. |
| App opens but lists are empty | Django must be running; test `http://127.0.0.1:8000/api/posts/` in the PC browser, then `http://10.0.2.2:8000/api/posts/` in the emulator's Chrome. Check **Logcat** (filter `Capacitor/Console`). |
| Images missing in the app | Run `npm run mobile:sync` after pulling the latest code (`fetchPatch.js`). |
| `Failed to resolve import "@capgo/capacitor-social-login"` | Run `npm install` in `Pixel`. |
| `npm run ...` fails with module errors | Use a terminal **without** the Python venv active, inside the `Pixel` folder. |
| Emulator stuck on "Connecting to the Emulator" | Cold boot, use an API 34/35 image, see 4.2. |
| "Unauthorized domain" after Google login | The account is not `@sait.ac.in`, `@saip.ac.in` or an admin e-mail. |
| Top bar hidden under the status bar (Android) | Capacitor 8 draws edge-to-edge. In `Navbar.jsx` replace `pt-[env(safe-area-inset-top)]` with `pt-[max(env(safe-area-inset-top),var(--safe-area-inset-top,0px))]` (same for the bottom padding in `MobileTabBar.jsx`). |
| `pip install` fails building a package | Use Python 3.14 (64-bit) and update pip; `faiss-cpu`/`insightface` need 64-bit Python. |

---

## 7. Known issues in the current code

These are existing bugs found while preparing the Android build:

1. **Face search returns no matches.** `face_service/backend/search_engine.py` has
   `#import face_recognition` commented out but still calls `face_recognition.*`, so every
   search fails silently and returns an empty list. It should be rewritten to use the InsightFace
   encoder and the FAISS index that `index_builder.py` / `dataset_watcher.py` already create.
2. **Moments use a hard-coded database.** `pixel_backend/apps/moments/services.py` connects to
   `mongodb://localhost:27017/` instead of `MONGO_URI`, so Moments read from a local MongoDB even
   when the rest of the site uses Atlas.
3. `pixel_backend/apps/images/views.py` and `posts/services.py` build image links with
   `http://127.0.0.1:8000` (handled on the client by `fetchPatch.js`, but they should be built
   from the request host).
4. `face_service/app.py` (Flask) is an unused older entry point; the real service is
   `backend.main:app` (FastAPI).
5. `Pixel/package.json` still contains `homepage` / `deploy` for GitHub Pages under another account.
6. `Pixel/tools/` holds one-off scripts used to migrate hard-coded URLs; safe to delete.

---

## 8. Security notes

- `.env`, `credentials/`, `*service-account*.json` are git-ignored. Never commit them.
- `SECRET_KEY` in `settings.py` is the Django default dev key - replace it before deploying.
- Rotate the service-account key if it was ever pushed to a public repository.

# User Profile Card Generator 🪪✨

A full-stack, form-based application where users input details (**Name**, **Bio**, **Image URL**, role, social links, theme), submit them via **HTTP POST request**, and receive a formatted, responsive profile card generated and processed by the backend.

Designed with a **Dual-Engine Architecture** so that it runs seamlessly on a local **Node.js Express Server** AND deploys directly to **GitHub Pages** with high-fidelity client-side worker emulation!

---

## 🌟 Key Features

1. **Form-Based Input Studio**:
   - Fields: Full Name, Role / Headline, Biography (with live 350-character counter), Image URL (with live preview & initials fallback), Accent Theme Selector (Slate, Emerald, Indigo, Amber, Rose, Cyan), and optional Social Handles (GitHub, X/Twitter, Website).
   - Instant Quick Presets: 1-click test data for *Robotics Lead*, *Systems Designer*, and *AI Scientist*.

2. **Backend Processing & POST Pipeline (`POST /api/profile`)**:
   - Validates required fields: Name (2–50 chars), Bio (5–350 chars), Image URL (valid HTTP/HTTPS protocol).
   - Sanitizes user input against XSS attacks.
   - Calculates profile metrics: word count, character count, and estimated reading time.
   - Generates fallback SVG initials avatars when no URL is provided or if the link is broken.
   - Issues unique card IDs (e.g. `usr_a7f9c2`) and human-friendly timestamps.
   - Standard HTTP response codes: `200 OK` on success, `400 Bad Request` with field-level errors on validation failure.

3. **Built-in HTTP Network Inspector**:
   - Real-time telemetry inspector demonstrating the exact data flow between UI and backend.
   - Displays HTTP Method, Request Headers, JSON payload, Response Status (`200 OK` / `400 Bad Request`), round-trip latency (ms), and server engine.
   - 1-click **"Copy cURL"** command to test the backend API directly from your terminal.

4. **Dual Engine Support (Express + GitHub Pages)**:
   - **Local Mode**: Uses genuine `fetch('/api/profile', { method: 'POST', ... })` targeting the live Express server.
   - **GitHub Pages Mode**: Automatically detects GitHub Pages static hosting and activates the in-browser Worker Engine so the demo works 100% out-of-the-box on GitHub Pages without server errors!

---

## 📁 Project Structure

```
User Profile Card Generator/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD workflow
├── public/                     # Static files (served by Express & GitHub Pages)
│   ├── index.html              # Main responsive web interface
│   ├── favicon.svg             # Vector favicon
│   ├── .nojekyll               # Prevents Jekyll processing on GitHub Pages
│   ├── css/
│   │   └── style.css           # Art-directed styling (anti-ai-design compliant)
│   ├── js/
│   │   ├── processor.js        # Core validation & formatting engine (shared)
│   │   ├── api.js              # API client (handles POST fetch & GitHub Pages fallback)
│   │   └── app.js              # UI controller, event listeners, card rendering
│   └── sw.js                   # Service Worker API interceptor
├── server.js                   # Node.js Express server (POST /api/profile endpoint)
├── package.json                # Dependencies, scripts (start, test, deploy)
├── test/
│   └── server.test.js          # Automated unit & integration test suite
└── README.md                   # Documentation & Deployment Guide
```

---

## 🚀 How to Run Locally (Node.js Express Server)

### 1. Prerequisites
Make sure [Node.js](https://nodejs.org/) (v18+) is installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Automated Tests
```bash
npm test
```
All 6 unit and API integration tests should pass (`✔ pass 6`).

### 4. Start the Server
```bash
npm start
```
Open your browser and navigate to:
👉 **`http://localhost:3000`**

---

## 🌐 GitHub Pages Deployment Guide (Hindi + English)

GitHub Pages ek **static web hosting platform** hai. Iska matlab yeh hai ki GitHub Pages HTML, CSS aur JavaScript ko directly host karta hai, par wahan live Node.js Express server background daemon ke roop mein run nahi hota.

Humne is project ko **Dual-Engine Architecture** ke saath design kiya hai:
Jab aap ise GitHub Pages pe deploy karenge, iska **Client-side Worker Engine** automatically activate ho jayega aur `POST /api/profile` ko seamlessly process karega! Saath hi aapka real `server.js` Express backend bhi repository mein rahega jise koi bhi clone karke locally run kar sakta hai.

### Option A: Automatic Deployment via GitHub Actions (Recommended)

1. **Git Repository Initialize karein**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: User Profile Card Generator"
   ```

2. **GitHub par naya repository banayein**:
   - [GitHub New Repository](https://github.com/new) par jayein.
   - Repo name daalein (e.g. `user-profile-card-generator`).
   - Repository ko Public banayein.

3. **Remote add karke push karein**:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/user-profile-card-generator.git
   git branch -M main
   git push -u origin main
   ```

4. **GitHub Pages Enable karein**:
   - Apne GitHub repo ke **Settings** tab mein jayein.
   - Left sidebar mein **Pages** par click karein.
   - **Build and deployment** section ke andar:
     - **Source**: Select **"GitHub Actions"**.
   - Hamara `.github/workflows/deploy.yml` workflow automatically trigger hoga aur 1 minute ke andar aapki site live ho jayegi!
   - Live URL hoga: `https://<YOUR_USERNAME>.github.io/user-profile-card-generator/`

---

### Option B: Quick 1-Command Deploy via `gh-pages`

Agar aap branch-based deployment prefer karte hain:
```bash
npm run deploy
```
Yeh script automatically `public/` directory ko aapki repo ke `gh-pages` branch par push kar dega!
Uske baad:
- GitHub Repo **Settings** > **Pages** mein jayein.
- **Source**: **"Deploy from a branch"** select karein.
- Branch mein **`gh-pages`** aur folder `/ (root)` select karke **Save** karein.

---

## 🧪 Testing the API via cURL

Jab local server chal raha ho (`http://localhost:3000`):

### Valid POST Request (200 OK):
```bash
curl -X POST "http://localhost:3000/api/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Connor",
    "title": "Lead Cybernetics Engineer",
    "bio": "Building resilient systems that survive machine rebellion.",
    "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    "theme": "emerald",
    "github": "sarah-connor"
  }'
```

### Invalid POST Request (400 Bad Request):
```bash
curl -X POST "http://localhost:3000/api/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "bio": "x"
  }'
```

---

## 🛡️ Quality & Accessibility

- **WCAG 2.1 AA Compliant**: All contrast ratios surpass 4.5:1, keyboard focusable controls, explicit ARIA live announcements.
- **XSS Protection**: All user input fields are thoroughly escaped and sanitized.
- **Mobile Responsive**: Adapts fluidly across mobile, tablet, and desktop screens.
- **Zero Bloat**: Fast load time, vanilla ES standards, zero unnecessary heavy libraries.

---

## 📄 License
MIT License. Created for full-stack learning and production card generation.


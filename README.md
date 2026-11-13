# User Profile Card Generator 🪪✨

[![Node.js CI](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-222222?logo=github-pages&logoColor=white)](https://mohammadsahil74808.github.io/User-profile-card-generator/)
[![Tests](https://img.shields.io/badge/Tests-6%2F6%20Passing-10b981)](https://github.com/mohammadsahil74808/User-profile-card-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> A full-stack, form-based profile card generator with **Node.js Express backend**, **HTTP POST request pipeline**, **interactive 3D card tilt physics**, and **Dual-Engine GitHub Pages support**.

🌐 **Live Demo on GitHub Pages**:  
👉 **[https://mohammadsahil74808.github.io/User-profile-card-generator/](https://mohammadsahil74808.github.io/User-profile-card-generator/)**

---

## 🌟 Overview & Key Features

This project focuses on handling **HTTP POST requests** and seamless data exchange between the frontend UI and backend server, designed with an anti-generic, handcrafted aesthetic.

### 🎨 Handcrafted Design & Interactive Features
- **4 Distinct Card Aesthetics**:
  - ⬛ **Obsidian**: Stealth luxury graphite, brushed metallic rim, glowing emerald live pulse dot.
  - 📰 **Editorial**: Warm archival ivory paper, *Newsreader* italic serif typography, and Swiss minimalist layout.
  - 🌅 **Aurora**: Sunset mesh gradient header with frosted glassmorphism overlays.
  - 📟 **Terminal**: Hacker phosphor CRT green accents, command prompt prefix (`>`), and monospace grid.
- **🕹️ 3D Perspective Physics Tilt**: Hovering over the card calculates real-time cursor angles and applies realistic specular lighting sheen and perspective transforms.
- **🏷️ Interactive Skills Tag Manager**: Type skills and press <kbd>Enter</kbd> (or click suggestions like `TypeScript`, `Next.js`, `Design Systems`) to add removable chips.
- **📸 Direct High-Res PNG Download**: One-click **"Download PNG"** button that renders the profile card onto a canvas and downloads a high-resolution image directly to your device!
- **⚡ Curated Personas**: Instant 1-click test profiles for *Elena Rostova* (Design Tech), *Marcus Chen* (Systems Eng), *Amara Okafor* (Creative Dir), and *Julian Vance* (Essayist).
- **📡 Live HTTP POST Traffic Monitor**: Real-time developer inspector displaying exact request payload, HTTP response status (`200 OK` / `400 Bad Request`), server engine, latency (`~24ms`), and ready-to-run terminal `cURL` commands.

---

## ⚙️ Backend Data Flow (`POST /api/profile`)

```
┌───────────────────────────┐                 ┌───────────────────────────┐
│        Frontend UI        │                 │      Node.js Backend      │
│  (Form-Based Generator)   │                 │   (server.js / Express)   │
└─────────────┬─────────────┘                 └─────────────┬─────────────┘
              │                                             │
              │  1. HTTP POST /api/profile                  │
              │     Payload: { name, bio, image, ... }      │
              ├────────────────────────────────────────────►│
              │                                             │  2. Validation:
              │                                             │     - Name: 2-50 chars
              │                                             │     - Bio: 5-350 chars
              │                                             │     - Image URL format
              │                                             │  3. XSS Sanitization
              │                                             │  4. Fallback Initials SVG
              │                                             │  5. Unique Card ID (usr_xxx)
              │                                             │  6. Computed Metadata
              │                                             │
              │  7. HTTP 200 OK / 400 Bad Request           │
              │     JSON Response: { success, card, ... }   │
              │◄────────────────────────────────────────────┤
              │                                             │
  8. Render 3D Card Artifact                                │
  9. Update Network Inspector                               │
```

---

## 🛠️ Dual-Engine Architecture (Express + GitHub Pages)

GitHub Pages is a **static web host** and cannot run a live Node.js background process. To ensure the live demo works 100% seamlessly on GitHub Pages while keeping a real full-stack Express server for local development:

1. **Local Mode (`npm start`)**: The frontend makes real `fetch('/api/profile', { method: 'POST' })` calls across the wire to the live Node.js Express server (`Node.js Express (Live)`).
2. **GitHub Pages Mode**: Automatically detects GitHub Pages hosting (`*.github.io`) and activates the **Worker Engine / Service Worker interceptor**, processing the `POST /api/profile` data client-side with identical validation and realistic network latency simulation (`GitHub Pages Worker`).

---

## 📁 Repository Structure

```
User-profile-card-generator/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD workflow
├── public/                     # Static files (Express & GitHub Pages)
│   ├── index.html              # Main semantic HTML5 interface
│   ├── favicon.svg             # Clean vector favicon
│   ├── .nojekyll               # Prevents Jekyll processing on GitHub Pages
│   ├── css/
│   │   └── style.css           # Handcrafted stylesheet & 3D tilt styles
│   ├── js/
│   │   ├── processor.js        # Core validation & formatting engine
│   │   ├── api.js              # API client (POST fetch + GH Pages fallback)
│   │   └── app.js              # UI controller, 3D physics, tag manager, PNG export
│   └── sw.js                   # Service Worker network interceptor
├── server.js                   # Node.js Express server (POST /api/profile endpoint)
├── package.json                # Dependencies, scripts (start, test, deploy)
├── test/
│   └── server.test.js          # Automated unit & integration test suite
└── README.md                   # Project documentation & deployment guide
```

---

## 💻 How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/mohammadsahil74808/User-profile-card-generator.git
cd User-profile-card-generator
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the automated test suite
```bash
npm test
```
All 6 tests should pass:
```
✔ Processor: Generates valid profile card when data is valid
✔ Processor: Validates required name and bio fields
✔ Processor: Rejects name that is too short or too long
✔ Processor: Rejects invalid image URL while accepting empty imageUrl (with fallback)
✔ Processor: Sanitizes HTML/XSS in user inputs
✔ Express Server: Health check and POST /api/profile endpoint
```

### 4. Start the Express server
```bash
npm start
```
Open your browser and navigate to:  
👉 **`http://localhost:3000`**

---

## 🚀 GitHub Pages Deployment Guide (Step-by-Step)

### Option A: Automatic Deployment via GitHub Actions (Recommended)

This repository includes a ready-to-run GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. Push your code to GitHub:
   ```bash
   git push -u origin main
   ```
2. Go to your GitHub repository:
   👉 **[https://github.com/mohammadsahil74808/User-profile-card-generator](https://github.com/mohammadsahil74808/User-profile-card-generator)**
3. Click on the **Settings** tab.
4. In the left sidebar, click on **Pages**.
5. Under **Build and deployment**:
   - **Source**: Select **"GitHub Actions"**.
6. The deployment action will automatically trigger. In ~1 minute, your site will be live at:  
   👉 **`https://mohammadsahil74808.github.io/User-profile-card-generator/`**

---

### Option B: 1-Command Deployment via `gh-pages`

You can also deploy directly from your local terminal using the npm deploy script:
```bash
npm run deploy
```
This pushes the `public/` folder to the `gh-pages` branch. Then in GitHub repo **Settings > Pages**, select **Source: Deploy from a branch** and pick `gh-pages` / `root`.

---

## 📡 API Reference (`POST /api/profile`)

### Request
```http
POST /api/profile HTTP/1.1
Content-Type: application/json

{
  "name": "Elena Rostova",
  "title": "Design Technologist & Systems Architect",
  "location": "Stockholm, Sweden",
  "status": "Available for hire",
  "bio": "Bridging high-craft design and distributed engineering.",
  "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
  "theme": "obsidian",
  "skills": ["Design Systems", "TypeScript", "Next.js"],
  "github": "elena-rostova",
  "twitter": "elena_design",
  "linkedin": "elenarostova",
  "website": "https://rostova.design"
}
```

### Success Response (`200 OK`)
```json
{
  "success": true,
  "status": 200,
  "message": "Profile card processed and generated successfully.",
  "card": {
    "id": "usr_71c6f75e20",
    "name": "Elena Rostova",
    "handle": "@elenarostova",
    "title": "Design Technologist & Systems Architect",
    "location": "Stockholm, Sweden",
    "statusText": "Available for hire",
    "bio": "Bridging high-craft design and distributed engineering.",
    "skills": ["Design Systems", "TypeScript", "Next.js"],
    "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    "fallbackAvatarUrl": "data:image/svg+xml;utf8,...",
    "theme": "obsidian",
    "links": {
      "github": "https://github.com/elena-rostova",
      "twitter": "https://x.com/elena_design",
      "linkedin": "https://linkedin.com/in/elenarostova",
      "website": "https://rostova.design"
    },
    "metadata": {
      "createdAt": "2026-11-13T15:30:00.000Z",
      "formattedDate": "Nov 13, 2026",
      "badge": "Verified Member",
      "processedBy": "Node.js Express Engine (Port 3000)"
    }
  }
}
```

### Error Response (`400 Bad Request`)
```json
{
  "success": false,
  "status": 400,
  "error": "Validation Error",
  "message": "The submitted profile data contains validation errors.",
  "errors": {
    "name": "Full name is required.",
    "bio": "Bio must be at least 5 characters long."
  }
}
```

### Test via Terminal (cURL)
```bash
curl -X POST "http://localhost:3000/api/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marcus Chen",
    "title": "Principal Systems Architect",
    "bio": "Authoring high-throughput distributed fault-tolerant systems.",
    "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    "theme": "terminal"
  }'
```

---

## 📜 License

This project is licensed under the MIT License — feel free to use it for personal or commercial projects.

**Author**: [mohammadsahil74808](https://github.com/mohammadsahil74808)

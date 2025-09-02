# Gita GPT — Divine Wisdom Assistant 🙏

A modern, responsive web app that shares distilled teachings from the Bhagavad Gita through a simple chat-like interface.

> **Live Demo:** `https://<your-username>.github.io/<your-repo>`
> **Status:** Active • v2.0

---

## ✨ Features

* **Beautiful UI/UX** with theme toggle (Light/Dark/Auto) and animated welcome screen
* **Chat-style experience** for asking spiritual questions
* **Quick Actions** to explore common topics (Dharma, Inner Peace, Overcoming Fear, Purpose)
* **Daily Verse** button to receive a randomly selected Gita verse
* **Voice Settings** (rate & pitch) + speech synthesis playback
* **Accessibility**: keyboard friendly, visible focus states

> *Note:* This project is a learning/demo app. It does **not** expose API keys client‑side and is safe to deploy as a static site.

---

## 🧰 Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Fonts:** Inter, Crimson Text
* **APIs:** Web Speech Synthesis API (browser)
* **Hosting:** GitHub Pages

---

## 📁 Project Structure

```
.
├─ index.html
├─ styles/
│  ├─ main.css
│  ├─ themes.css
│  ├─ components.css
│  └─ animations.css
├─ js/
│  ├─ app.js        # App init & UI orchestration (why: central bootstrap)
│  ├─ chat.js       # Chat message rendering & flow
│  ├─ speech.js     # Voice (speech synthesis) controls
│  └─ themes.js     # Theme switching & persistence
├─ assets/
│  └─ icons.svg
└─ github-deployment-guide.html  # Visual step-by-step Pages deployment guide
```

---

## 🚀 Getting Started (Local)

### 1) Clone or Download

```bash
# HTTPS
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2) Run Locally (any static server)

* **Option A:** Open `index.html` directly in your browser (quick check)
* **Option B:** Use a tiny static server (recommended for correct paths)

```bash
# Python 3
python -m http.server 3000
# Then open http://localhost:3000
```

No build step required. It’s a pure static site.

---

## 🔐 About API Keys

This project is designed to run **without** exposing any private API key in the browser.

* If you later integrate external LLMs or APIs, **never** put secrets directly in JS.
* Instead, use a small backend proxy (serverless function or tiny server) that keeps your key safe and forwards requests.

---

## 🌐 Deploy to GitHub Pages (Free)

You can deploy in minutes. A full **visual guide** is included here: [`github-deployment-guide.html`](./github-deployment-guide.html)

**Quick Steps**

1. Create a **public** repo and push the project
2. Repo **Settings → Pages**
3. Source: **Deploy from a branch**, Branch: **main**, Folder: **/** (root)
4. Save → wait a few minutes
5. Your site will be live at: `https://<your-username>.github.io/<your-repo>`

> For screenshots and exact clicks, open the embedded guide above.

---

## 🧪 Manual Test Scenarios

* Toggle themes and refresh: preference should persist
* Send a few sample prompts; verify message rendering and scrolling
* Press **Daily Verse** multiple times; confirm randomness and formatting
* Use **Clear** to reset chat
* Try **Voice** rate/pitch sliders and play messages
* Mobile viewport (≤ 400px): verify layout stays readable

---

## 🔧 Configuration

You can customize the experience via small constants in `/js/*` and `/styles/*`:

* **Brand texts & titles:** `index.html`
* **Colors & spacing:** `styles/themes.css`, `styles/main.css`
* **Quick actions:** `index.html` (`.quick-action` buttons with `data-message`)
* **Daily Verse source/logic:** `js/chat.js`

---

## ❓ FAQ

**Q: Can I plug in a real LLM for answers?**
Yes, but do it through a secured backend proxy to avoid leaking keys. You can host an API route on Cloudflare Workers, Netlify Functions, Vercel, or a tiny Flask/FastAPI service.

**Q: Why no build tools?**
To keep it beginner‑friendly and Pages‑ready. You can add bundlers later if needed.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/<name>`
3. Commit: `git commit -m "feat: ..."`
4. Push & open a PR

Please keep PRs small and focused.

---

## 📝 License

This project is released under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

## 🙏 Acknowledgments

* Inspiration from the **Bhagavad Gita**
* Community resources and open web APIs (Web Speech)

---

## 📸 Preview

> *Add a screenshot or GIF here*

```
![Gita GPT Screenshot](./assets/preview.png)
```

---

## 📬 Contact

* **Author:** <your name>
* **Portfolio:** <your link>
* **Email:** <your email>

---

### Changelog

* **v2.0:** Improved UI, theme toggle, voice controls, deployment guide

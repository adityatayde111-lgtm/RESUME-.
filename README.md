# 🎬 Aditya Tayde — Cinematic 60FPS Scroll Portfolio & Interactive Resume

> High-performance Canvas & Video Scrubbing Architecture meets Modern Full-Stack & AI Engineering Portfolio.

[![GitHub Profile](https://img.shields.io/badge/GitHub-adityatayde111--lgtm-blue?style=for-the-badge&logo=github)](https://github.com/adityatayde111-lgtm)
[![LinkedIn Profile](https://img.shields.io/badge/LinkedIn-Aditya_Tayde-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/adityatayde)
[![Live Preview](https://img.shields.io/badge/Live_Portfolio-Vercel-success?style=for-the-badge&logo=vercel)](https://resume-atm-f33c.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Stack-TypeScript_%7C_React_%7C_Canvas_60FPS_%7C_WebAudio-informational?style=for-the-badge)](#technical-architecture)

---

## 🌟 Key Highlights

- **60 FPS GPU-Accelerated Scrubbing**: Renders a 240-frame sequence dynamically mapped to scroll velocity with smooth mathematical interpolation (lerp damping).
- **Dual Engine Render Modes**: Seamlessly switch between WebP Canvas rendering (60FPS) and hardware-accelerated HTML5 Video fallback (H.264).
- **Web Audio Generative Drone**: Built-in 4-voice ambient sound synthesizer utilizing the browser's native Web Audio API oscillators and bi-quad lowpass filtering.
- **Live GitHub API Synchronization**: Real-time integration with the GitHub REST API to showcase repository stats, stars, and open-source contributions.
- **Interactive ATS-Optimized Resume**: Integrated printable, recruiter-ready ATS resume view with single-click PDF export (`Ctrl+P` / `Cmd+P` print stylesheet).

---

## 🚀 Flagship Projects Featured

1. **[Shetkari Raja](https://github.com/adityatayde111-lgtm/shetkari-raja)** — Smart Agricultural Platform & Android App with AI-driven grain grading via native camera capture, live procurement queue tracking, and DBT/PFMS payment monitoring.
2. **[Sanjivani AI Tool](https://github.com/adityatayde111-lgtm/sanjivani-ai-tool)** — Unified High-Availability AI Gateway unifying 358 providers with automatic failover and security firewall.
3. **[AI Assistant Agent](https://github.com/adityatayde111-lgtm/ai-assistant-agent)** — Context-aware autonomous agent architecture with dynamic tool dispatch and state persistence.
4. **[AgriSmart AI](https://github.com/adityatayde111-lgtm/AgriSmart-Helping-Farmers-Make-Better-Decisions-with-AI)** — Predictive machine learning decision support for agronomic yield improvement.

---

## 🛠️ Technical Architecture

- **Rendering**: HTML5 Canvas 2D Context, Device Pixel Ratio (DPR) adaptive scaling
- **Interpolation**: Linear interpolation (`lerpSpeed: 0.12`) with inertia damping
- **Typography & Styling**: Space Grotesk, Plus Jakarta Sans, JetBrains Mono, Modern Glassmorphism with `backdrop-filter: blur(24px)`
- **Audio Synthesis**: Native Web Audio API (`AudioContext`, `OscillatorNode`, `BiquadFilterNode`, `GainNode`)

---

## 💻 Local Setup & Development

Run locally with any static web server:

```bash
# Using Python
python3 -m http.server 3000

# Or using Node / npx
npx serve .
```

Visit `http://localhost:3000` in your browser.

---

## 📬 Contact & Connect

- **Author**: Aditya Tayde
- **LinkedIn**: [linkedin.com/in/adityatayde](https://linkedin.com/in/adityatayde)
- **GitHub**: [@adityatayde111-lgtm](https://github.com/adityatayde111-lgtm)
- **Email**: [adityatayde111@gmail.com](mailto:adityatayde111@gmail.com)

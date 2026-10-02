/**
 * Aditya Tayde - Cinematic Scroll Experience Engine & Portfolio Controller
 * High-performance Canvas 60FPS Scrubbing, Audio Drone, GitHub API Sync & Interactive Resume
 */

(function () {
  'use strict';

  // Configuration
  const TOTAL_FRAMES = 240;
  const FRAME_DIR = 'frames/';
  const FRAME_PREFIX = 'frame_';
  const FRAME_EXT = '.webp';
  const GITHUB_USERNAME = 'adityatayde111-lgtm';

  // DOM Elements
  const canvas = document.getElementById('cinema-canvas');
  const ctx = canvas.getContext('2d');
  const video = document.getElementById('cinema-video');
  const preloader = document.getElementById('preloader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderPercent = document.getElementById('loader-percent');
  const progressBar = document.getElementById('progress-bar');
  const frameCounter = document.getElementById('frame-counter');
  const soundToggle = document.getElementById('sound-toggle');
  const modeToggle = document.getElementById('mode-toggle');
  const renderModeLabel = document.getElementById('render-mode-label');
  const navLinks = document.querySelectorAll('.nav-link');
  const navRepoCount = document.getElementById('nav-repo-count');
  const heroRepoVal = document.getElementById('hero-repo-val');
  const syncStatus = document.getElementById('github-sync-status');
  const syncText = document.getElementById('sync-text');

  // Modal & Copy Elements
  const resumeModal = document.getElementById('resume-modal');
  const openResumeBtn = document.getElementById('open-resume-btn');
  const heroOpenResume = document.getElementById('hero-open-resume');
  const ctaOpenResume = document.getElementById('cta-open-resume');
  const closeResumeBtn = document.getElementById('close-resume-btn');
  const printResumeBtn = document.getElementById('print-resume-btn');
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('toast');

  // State
  let images = [];
  let loadedCount = 0;
  let targetProgress = 0;
  let currentProgress = 0;
  let currentFrameIndex = 0;
  let isVideoMode = false;
  let isAudioPlaying = false;
  let audioCtx = null;
  let droneOscillators = [];

  // Storyboard Section Mapping (5 Stages)
  const sections = [
    { start: 0.00, peak: 0.08, end: 0.18, el: document.getElementById('section-1'), navIndex: 0 },
    { start: 0.20, peak: 0.30, end: 0.40, el: document.getElementById('section-2'), navIndex: 1 },
    { start: 0.42, peak: 0.52, end: 0.62, el: document.getElementById('section-3'), navIndex: 2 },
    { start: 0.64, peak: 0.74, end: 0.84, el: document.getElementById('section-4'), navIndex: 3 },
    { start: 0.86, peak: 0.94, end: 1.00, el: document.getElementById('section-5'), navIndex: 4 }
  ];

  // Helper to format frame path: frame_000.webp
  function getFramePath(index) {
    const padIndex = String(index).padStart(3, '0');
    return `${FRAME_DIR}${FRAME_PREFIX}${padIndex}${FRAME_EXT}`;
  }

  // Set Canvas resolution taking device pixel ratio into account
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    renderFrame(currentFrameIndex);
  }

  window.addEventListener('resize', resizeCanvas);

  // Preload Image Sequence
  function preloadImages() {
    let initialBatchLoaded = 0;
    const initialBatchSize = 25;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);

      img.onload = () => {
        loadedCount++;
        const percent = Math.round((loadedCount / TOTAL_FRAMES) * 100);
        if (loaderBar) loaderBar.style.width = `${percent}%`;
        if (loaderPercent) loaderPercent.textContent = `${percent}%`;

        // Once initial batch is ready, reveal website smoothly
        if (loadedCount >= initialBatchSize && initialBatchLoaded === 0) {
          initialBatchLoaded = 1;
          renderFrame(0);
          setTimeout(() => {
            if (preloader) preloader.classList.add('loaded');
          }, 300);
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= initialBatchSize && initialBatchLoaded === 0) {
          initialBatchLoaded = 1;
          renderFrame(0);
          if (preloader) preloader.classList.add('loaded');
        }
      };

      images.push(img);
    }
  }

  // Draw frame to canvas with aspect ratio preserved ('cover' style)
  function renderFrame(index) {
    if (isVideoMode) return;

    const img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) {
      // Fallback to nearest loaded frame
      for (let offset = 1; offset < 30; offset++) {
        if (images[index - offset] && images[index - offset].complete) {
          drawCover(images[index - offset]);
          return;
        }
        if (images[index + offset] && images[index + offset].complete) {
          drawCover(images[index + offset]);
          return;
        }
      }
      return;
    }

    drawCover(img);
  }

  function drawCover(img) {
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Scale to cover
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh);
  }

  // Scroll Progress Calculation
  function updateScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    targetProgress = maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0;
  }

  window.addEventListener('scroll', updateScroll, { passive: true });

  // Animation Loop with Smooth Damping (Lerp)
  function animate() {
    const lerpSpeed = 0.12;
    currentProgress += (targetProgress - currentProgress) * lerpSpeed;

    // Update Progress bar
    if (progressBar) {
      progressBar.style.width = `${(currentProgress * 100).toFixed(1)}%`;
    }

    // Target Frame
    const nextFrameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1))));

    if (nextFrameIndex !== currentFrameIndex) {
      currentFrameIndex = nextFrameIndex;
      const displayIndex = String(currentFrameIndex + 1).padStart(3, '0');
      if (frameCounter) {
        frameCounter.textContent = `FRAME ${displayIndex} / ${TOTAL_FRAMES}`;
      }

      if (!isVideoMode) {
        renderFrame(currentFrameIndex);
      }
    }

    // Video mode scrubbing sync
    if (isVideoMode && video.duration) {
      const targetTime = currentProgress * video.duration;
      if (Math.abs(video.currentTime - targetTime) > 0.03) {
        video.currentTime = targetTime;
      }
    }

    // Dynamic Story Card Parallax & Opacities
    updateCardInteractions(currentProgress);

    requestAnimationFrame(animate);
  }

  // Dynamic Card Animations based on scroll position
  function updateCardInteractions(progress) {
    let activeNavIndex = -1;

    sections.forEach(({ start, peak, end, el, navIndex }) => {
      if (!el) return;
      const card = el.querySelector('.glass-card');
      if (!card) return;

      if (progress >= start && progress <= end) {
        let opacity = 1;
        if (progress < peak) {
          opacity = (progress - start) / (peak - start);
        } else if (progress > peak && end < 1.0) {
          opacity = 1 - (progress - peak) / (end - peak);
        }
        card.style.opacity = Math.max(0, Math.min(1, opacity));
        const translateY = (progress - peak) * 60;
        card.style.transform = `translateY(${translateY}px)`;
        activeNavIndex = navIndex;
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
      }
    });

    // Update active nav link
    if (activeNavIndex !== -1 && navLinks) {
      navLinks.forEach((btn, idx) => {
        if (idx === activeNavIndex) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }

  // Smooth Scroll on Nav Click
  function setupNavigationJumps() {
    const jumpElements = document.querySelectorAll('[data-nav]');
    jumpElements.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPercent = parseFloat(item.getAttribute('data-nav'));
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const targetScroll = targetPercent * maxScroll;
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      });
    });
  }

  // Interactive Project Category Filter Tabs
  function setupProjectFilters() {
    const filterTabsContainer = document.getElementById('project-filters');
    if (!filterTabsContainer) return;

    const filterBtns = filterTabsContainer.querySelectorAll('.filter-tab-btn');
    const projectBoxes = document.querySelectorAll('.project-box');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        projectBoxes.forEach(box => {
          if (filter === 'all') {
            box.classList.remove('is-hidden');
          } else {
            const categories = (box.getAttribute('data-category') || '').split(' ');
            if (categories.includes(filter)) {
              box.classList.remove('is-hidden');
            } else {
              box.classList.add('is-hidden');
            }
          }
        });
      });
    });
  }

  // Render Mode Toggle: Canvas WebP vs HTML5 Video
  if (modeToggle) {
    modeToggle.addEventListener('click', () => {
      isVideoMode = !isVideoMode;
      if (isVideoMode) {
        canvas.style.display = 'none';
        video.style.display = 'block';
        if (renderModeLabel) renderModeLabel.textContent = 'VIDEO H.264';
      } else {
        video.style.display = 'none';
        canvas.style.display = 'block';
        if (renderModeLabel) renderModeLabel.textContent = 'CANVAS 60FPS';
        renderFrame(currentFrameIndex);
      }
    });
  }

  // Ambient Synthesizer (Web Audio API)
  function initAudioDrone() {
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtxClass();

      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.12, audioCtx.currentTime);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, audioCtx.currentTime);

      // Cinematic Chord: C2 (65.41Hz), G2 (98.0Hz), D3 (146.8Hz), G3 (196.0Hz)
      const frequencies = [65.41, 98.0, 146.83, 196.0];
      droneOscillators = frequencies.map((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        osc.type = idx % 2 === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        oscGain.gain.setValueAtTime(0.25 / frequencies.length, audioCtx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();
        return osc;
      });

      filter.connect(masterGain);
      masterGain.connect(audioCtx.destination);
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      if (!audioCtx) {
        initAudioDrone();
        isAudioPlaying = true;
        const label = soundToggle.querySelector('.btn-label');
        if (label) label.textContent = 'AUDIO: ON';
        soundToggle.classList.add('active');
      } else {
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
          isAudioPlaying = true;
          const label = soundToggle.querySelector('.btn-label');
          if (label) label.textContent = 'AUDIO: ON';
          soundToggle.classList.add('active');
        } else if (audioCtx.state === 'running') {
          audioCtx.suspend();
          isAudioPlaying = false;
          const label = soundToggle.querySelector('.btn-label');
          if (label) label.textContent = 'AUDIO: OFF';
          soundToggle.classList.remove('active');
        }
      }
    });
  }

  // Live GitHub API Sync
  async function fetchGitHubData() {
    try {
      const userRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        const repoCount = userData.public_repos || 16;
        if (navRepoCount) navRepoCount.textContent = `${repoCount}+`;
        if (heroRepoVal) heroRepoVal.textContent = `${repoCount}+`;
        if (syncText) syncText.textContent = `LIVE GITHUB CONNECTED (${repoCount} REPOS)`;
      }
    } catch (err) {
      console.log('GitHub sync in offline/cached fallback mode:', err);
      if (syncText) syncText.textContent = 'GITHUB CONNECTED (@adityatayde111-lgtm)';
    }
  }

  // ATS Resume Modal Handlers
  function openResume() {
    if (!resumeModal) return;
    resumeModal.classList.add('open');
    resumeModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeResume() {
    if (!resumeModal) return;
    resumeModal.classList.remove('open');
    resumeModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openResumeBtn) openResumeBtn.addEventListener('click', openResume);
  if (heroOpenResume) heroOpenResume.addEventListener('click', openResume);
  if (ctaOpenResume) ctaOpenResume.addEventListener('click', openResume);
  if (closeResumeBtn) closeResumeBtn.addEventListener('click', closeResume);

  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) {
        closeResume();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resumeModal && resumeModal.classList.contains('open')) {
      closeResume();
    }
  });

  if (printResumeBtn) {
    printResumeBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Toast & Email Copy
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = 'adityatayde111@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          showToast('Email copied to clipboard: ' + email);
        }).catch(() => {
          showToast('Email: ' + email);
        });
      } else {
        showToast('Email: ' + email);
      }
    });
  }

  // AI Copilot Elements
  const navAiBtn = document.getElementById('nav-ai-btn');
  const aiWidgetTrigger = document.getElementById('ai-widget-trigger');
  const aiChatDrawer = document.getElementById('ai-chat-drawer');
  const aiCloseBtn = document.getElementById('ai-close-btn');
  const aiClearBtn = document.getElementById('ai-clear-btn');
  const aiChatForm = document.getElementById('ai-chat-form');
  const aiChatInput = document.getElementById('ai-chat-input');
  const aiMessagesList = document.getElementById('ai-messages-list');
  const aiSuggestions = document.getElementById('ai-suggestions');

  let chatHistory = [];

  // Toggle AI Drawer
  function openAiChat() {
    if (!aiChatDrawer) return;
    aiChatDrawer.classList.add('open');
    aiChatDrawer.setAttribute('aria-hidden', 'false');
    if (aiChatInput) setTimeout(() => aiChatInput.focus(), 200);
  }

  function closeAiChat() {
    if (!aiChatDrawer) return;
    aiChatDrawer.classList.remove('open');
    aiChatDrawer.setAttribute('aria-hidden', 'true');
  }

  if (navAiBtn) navAiBtn.addEventListener('click', openAiChat);
  if (aiWidgetTrigger) aiWidgetTrigger.addEventListener('click', openAiChat);
  if (aiCloseBtn) aiCloseBtn.addEventListener('click', closeAiChat);

  if (aiClearBtn) {
    aiClearBtn.addEventListener('click', () => {
      chatHistory = [];
      if (aiMessagesList) {
        aiMessagesList.innerHTML = `
          <div class="ai-msg assistant-msg">
            <div class="msg-avatar">AI</div>
            <div class="msg-bubble">
              Conversation cleared! How else can I assist you with Aditya's portfolio and projects?
            </div>
          </div>
        `;
      }
    });
  }

  // Suggestion Chips
  if (aiSuggestions) {
    aiSuggestions.addEventListener('click', (e) => {
      const chip = e.target.closest('.suggestion-chip');
      if (chip) {
        const prompt = chip.getAttribute('data-prompt');
        if (prompt) {
          sendUserMessage(prompt);
        }
      }
    });
  }

  // Append Chat Message
  function appendChatMessage(role, htmlContent) {
    if (!aiMessagesList) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-msg ${role === 'user' ? 'user-msg' : 'assistant-msg'}`;
    const avatarHtml = role === 'user' 
      ? 'YOU' 
      : '<img src="assets/aditya-tayde.jpg" alt="Aditya" class="msg-avatar-img">';
    msgDiv.innerHTML = `
      <div class="msg-avatar ${role === 'assistant' ? 'avatar-with-img' : ''}">${avatarHtml}</div>
      <div class="msg-bubble">${htmlContent}</div>
    `;
    aiMessagesList.appendChild(msgDiv);
    aiMessagesList.scrollTop = aiMessagesList.scrollHeight;
  }

  // Show Typing Indicator
  function showTypingIndicator() {
    if (!aiMessagesList) return null;
    const indicator = document.createElement('div');
    indicator.className = 'ai-msg assistant-msg typing-indicator-item';
    indicator.innerHTML = `
      <div class="msg-avatar avatar-with-img"><img src="assets/aditya-tayde.jpg" alt="Aditya" class="msg-avatar-img"></div>
      <div class="msg-bubble">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    aiMessagesList.appendChild(indicator);
    aiMessagesList.scrollTop = aiMessagesList.scrollHeight;
    return indicator;
  }

  // Local Knowledge Base Fallback Engine
  function generateLocalKnowledgeReply(prompt) {
    const q = prompt.toLowerCase();

    if (q.includes('skill') || q.includes('stack') || q.includes('tech') || q.includes('language')) {
      return `<strong>Aditya's Core Technical Arsenal:</strong>
      <br><br>
      • <strong>Frontend:</strong> React 18, TypeScript, Tailwind CSS, HTML5 Canvas 60FPS Engine, WebGL, Vite<br>
      • <strong>Backend &amp; DB:</strong> Node.js, Supabase, PostgreSQL, Firebase, RESTful APIs, JWT Auth<br>
      • <strong>Mobile:</strong> Capacitor Android, Native Camera &amp; Gallery Plugins, Gradle Pipelines<br>
      • <strong>AI Systems:</strong> Multi-Provider LLM Gateways (358+ models), Autonomous Agents, Computer Vision<br>
      <br>
      Explore all 16+ repositories on his <a href="https://github.com/adityatayde111-lgtm" target="_blank" style="color: #38bdf8; text-decoration: underline;">GitHub Profile</a>!`;
    }

    if (q.includes('shetkari') || q.includes('raja') || q.includes('farm') || q.includes('grain')) {
      return `<strong>🌾 Shetkari Raja (Flagship Agritech Platform)</strong>
      <br><br>
      Shetkari Raja is a digital agricultural platform engineered by Aditya with <strong>React</strong>, <strong>TypeScript</strong>, <strong>Capacitor Android</strong>, and <strong>Supabase</strong>.
      <br><br>
      <strong>Key Features:</strong><br>
      • <strong>AI Grain Grading:</strong> Uses native device camera capture to analyze grain specimen quality.<br>
      • <strong>Live Queue Tracker:</strong> Real-time queue position monitoring for grain procurement centers.<br>
      • <strong>DBT/PFMS Payment Tracking:</strong> Direct benefit transfer status verification for farmers.<br>
      <br>
      Check the repository: <a href="https://github.com/adityatayde111-lgtm/shetkari-raja" target="_blank" style="color: #38bdf8; text-decoration: underline;">github.com/adityatayde111-lgtm/shetkari-raja</a>`;
    }

    if (q.includes('sanjivani') || q.includes('gateway') || q.includes('358') || q.includes('firewall')) {
      return `<strong>🛡️ Sanjivani AI Tool (Unified AI Gateway)</strong>
      <br><br>
      A high-availability AI Gateway built in TypeScript that unifies <strong>358 AI model providers</strong> under a single resilient endpoint.
      <br><br>
      <strong>Highlights:</strong><br>
      • Intelligent automatic failover routing across providers.<br>
      • Zero-latency load balancing and latency routing.<br>
      • Trained prompt security firewall that neutralizes adversarial inputs before execution.<br>
      <br>
      Check the repository: <a href="https://github.com/adityatayde111-lgtm/sanjivani-ai-tool" target="_blank" style="color: #38bdf8; text-decoration: underline;">github.com/adityatayde111-lgtm/sanjivani-ai-tool</a>`;
    }

    if (q.includes('hire') || q.includes('available') || q.includes('job') || q.includes('opportunity') || q.includes('work')) {
      return `<strong>💼 Availability &amp; Roles</strong>
      <br><br>
      Yes! Aditya is currently open for high-impact opportunities:
      <br><br>
      • <strong>Full-Stack Software Engineer</strong> (React, TypeScript, Node.js, Supabase)<br>
      • <strong>AI Systems &amp; Agentic Developer</strong> (LLM Orchestration, Gateways, Computer Vision)<br>
      • <strong>Creative Web Technologist</strong> (High-performance 60FPS Canvas, UI Systems)<br>
      <br>
      Location: Maharashtra, India • Open for Global Remote Roles.<br>
      Reach out via email: <a href="mailto:adityatayde111@gmail.com" style="color: #38bdf8; text-decoration: underline;">adityatayde111@gmail.com</a>`;
    }

    if (q.includes('linkedin') || q.includes('profile') || q.includes('connect')) {
      return `<strong>💼 Connect with Aditya on LinkedIn:</strong>
      <br><br>
      You can connect directly with Aditya on his official LinkedIn profile:<br>
      👉 <a href="https://linkedin.com/in/adityatayde" target="_blank" style="color: #38bdf8; text-decoration: underline; font-weight: bold;">linkedin.com/in/adityatayde</a>
      <br><br>
      He is actively open for Full-Stack Engineering, AI Systems, and High-Impact Software Engineering opportunities!`;
    }

    if (q.includes('instagram') || q.includes('insta')) {
      return `<strong>📸 Connect with Aditya on Instagram:</strong>
      <br><br>
      You can follow and connect with Aditya on his official Instagram account:<br>
      👉 <a href="https://www.instagram.com/aditya_tayde_96?stkn=eTZla3JjN29rdWVq" target="_blank" style="color: #f472b6; text-decoration: underline; font-weight: bold;">@aditya_tayde_96 on Instagram</a>
      <br><br>
      Feel free to reach out via direct message or follow his journey!`;
    }

    if (q.includes('contact') || q.includes('email') || q.includes('github') || q.includes('reach') || q.includes('social')) {
      return `<strong>📬 How to Connect with Aditya:</strong>
      <br><br>
      • <strong>Email:</strong> <a href="mailto:adityatayde111@gmail.com" style="color: #38bdf8; text-decoration: underline;">adityatayde111@gmail.com</a><br>
      • <strong>LinkedIn:</strong> <a href="https://linkedin.com/in/adityatayde" target="_blank" style="color: #38bdf8; text-decoration: underline;">linkedin.com/in/adityatayde</a><br>
      • <strong>Instagram:</strong> <a href="https://www.instagram.com/aditya_tayde_96?stkn=eTZla3JjN29rdWVq" target="_blank" style="color: #38bdf8; text-decoration: underline;">@aditya_tayde_96</a><br>
      • <strong>GitHub:</strong> <a href="https://github.com/adityatayde111-lgtm" target="_blank" style="color: #38bdf8; text-decoration: underline;">@adityatayde111-lgtm</a> (16+ Public Repos)<br>
      • <strong>Live Portfolio:</strong> <a href="https://resume-atm-f33c.vercel.app" target="_blank" style="color: #38bdf8; text-decoration: underline;">resume-atm-f33c.vercel.app</a><br>
      <br>
      You can also click <em>Resume</em> in the header to view or print his ATS resume!`;
    }

    if (q.includes('education') || q.includes('college') || q.includes('degree') || q.includes('study')) {
      return `<strong>🎓 Academic Background:</strong>
      <br><br>
      Aditya has a rigorous foundation in <strong>Computer Engineering &amp; Technology Studies</strong>, with practical specialization in:
      <br><br>
      • Data Structures &amp; Algorithms<br>
      • Distributed Systems &amp; Database Optimization (PostgreSQL, Supabase)<br>
      • Modern Web &amp; Mobile Architectures (React, Capacitor, Android)`;
    }

    // Default intelligent overview
    return `Aditya Tayde is a <strong>Full-Stack Software Engineer &amp; AI Systems Developer</strong> with 16+ open-source GitHub repositories.
    <br><br>
    Notable achievements include architecting <strong>Shetkari Raja</strong> (an agricultural platform with AI grain grading), <strong>Sanjivani AI</strong> (a 358-provider unified gateway), and this <strong>60FPS Canvas scrub engine</strong> with native Web Audio synthesis.
    <br><br>
    Feel free to ask about his specific projects, tech stack, or email him at <a href="mailto:adityatayde111@gmail.com" style="color: #38bdf8; text-decoration: underline;">adityatayde111@gmail.com</a>!`;
  }

  // Handle User Message Submission
  async function sendUserMessage(text) {
    const cleanText = text.trim();
    if (!cleanText) return;

    if (aiChatInput) aiChatInput.value = '';
    appendChatMessage('user', escapeHtml(cleanText));
    chatHistory.push({ role: 'user', content: cleanText });

    const typingEl = showTypingIndicator();

    try {
      // First attempt: call serverless endpoint /api/chat
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          history: chatHistory
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          if (typingEl) typingEl.remove();
          appendChatMessage('assistant', formatMarkdown(data.reply));
          chatHistory.push({ role: 'assistant', content: data.reply });
          return;
        }
      }

      // If server returns fallback or insufficient quota, use local knowledge engine
      throw new Error('Using local knowledge fallback');
    } catch (err) {
      if (typingEl) typingEl.remove();
      const localReply = generateLocalKnowledgeReply(cleanText);
      appendChatMessage('assistant', localReply);
      chatHistory.push({ role: 'assistant', content: localReply });
    }
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  function formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #38bdf8; text-decoration: underline;">$1</a>');
  }

  if (aiChatForm) {
    aiChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (aiChatInput && aiChatInput.value) {
        sendUserMessage(aiChatInput.value);
      }
    });
  }

  // Global Remote Collaboration & Timezone Explorer (Powered by REST Countries API v5)
  function setupGlobalCollabExplorer() {
    const pillsRow = document.getElementById('country-pills');
    if (!pillsRow) return;

    const intelBox = document.getElementById('country-intel-box');
    const flagEl = document.getElementById('intel-flag');
    const nameEl = document.getElementById('intel-name');
    const regionEl = document.getElementById('intel-region');
    const overlapEl = document.getElementById('intel-overlap');
    const currencyEl = document.getElementById('intel-currency');
    const timezonesEl = document.getElementById('intel-timezones');
    const hireLink = document.getElementById('intel-hire-link');

    // Resilient offline/instant cache
    const countryDataCache = {
      canada: {
        name: 'Canada',
        capital: 'Ottawa',
        region: 'Americas',
        flagEmoji: '🇨🇦',
        currency: 'CAD ($)',
        timezones: 'UTC-08:00 to UTC-03:30',
        overlap: '4-6 Hours Sync with IST'
      },
      'united states': {
        name: 'United States',
        capital: 'Washington, D.C.',
        region: 'Americas',
        flagEmoji: '🇺🇸',
        currency: 'USD ($)',
        timezones: 'UTC-12:00 to UTC+12:00 (EST/PST)',
        overlap: '4-5 Hours Sync with IST (EST overlap)'
      },
      'united kingdom': {
        name: 'United Kingdom',
        capital: 'London',
        region: 'Europe',
        flagEmoji: '🇬🇧',
        currency: 'GBP (£)',
        timezones: 'UTC+00:00 (GMT/BST)',
        overlap: '6-8 Hours Prime Overlap with IST'
      },
      germany: {
        name: 'Germany',
        capital: 'Berlin',
        region: 'Europe',
        flagEmoji: '🇩🇪',
        currency: 'EUR (€)',
        timezones: 'UTC+01:00 (CET)',
        overlap: '6-7 Hours Prime Overlap with IST'
      },
      singapore: {
        name: 'Singapore',
        capital: 'Singapore',
        region: 'Asia',
        flagEmoji: '🇸🇬',
        currency: 'SGD ($)',
        timezones: 'UTC+08:00 (SGT)',
        overlap: '7-8 Hours Direct Daytime Overlap'
      },
      'united arab emirates': {
        name: 'United Arab Emirates',
        capital: 'Abu Dhabi',
        region: 'Asia',
        flagEmoji: '🇦🇪',
        currency: 'AED (د.إ)',
        timezones: 'UTC+04:00 (GST)',
        overlap: '7+ Hours Direct Sync with IST'
      },
      australia: {
        name: 'Australia',
        capital: 'Canberra',
        region: 'Oceania',
        flagEmoji: '🇦🇺',
        currency: 'AUD ($)',
        timezones: 'UTC+08:00 to UTC+10:30 (AEST)',
        overlap: '5-7 Hours Morning/Afternoon Sync'
      },
      india: {
        name: 'India',
        capital: 'New Delhi',
        region: 'Asia',
        flagEmoji: '🇮🇳',
        currency: 'INR (₹)',
        timezones: 'UTC+05:30 (IST)',
        overlap: 'Native Base (100% Core Working Hours)'
      }
    };

    function renderCountry(info) {
      if (!info) return;
      if (flagEl) flagEl.textContent = info.flagEmoji || '🌐';
      if (nameEl) nameEl.textContent = info.name || 'Global';
      if (regionEl) regionEl.textContent = `${info.region || 'World'} • ${info.capital || 'Capital'}`;
      if (overlapEl) overlapEl.textContent = info.overlapSummary || info.overlap || 'Flexible Global Overlap';
      if (currencyEl) currencyEl.textContent = info.currencies || info.currency || 'USD ($)';
      if (timezonesEl) {
        if (Array.isArray(info.timezones)) {
          timezonesEl.textContent = info.timezones.length > 2
            ? `${info.timezones[0]} to ${info.timezones[info.timezones.length - 1]}`
            : info.timezones.join(', ');
        } else {
          timezonesEl.textContent = info.timezones || 'UTC Sync';
        }
      }
      if (hireLink) {
        hireLink.href = `mailto:adityatayde111@gmail.com?subject=Opportunity%20from%20${encodeURIComponent(info.name || 'Global')}`;
        const labelSpan = hireLink.querySelector('span');
        if (labelSpan) {
          labelSpan.textContent = `Hire / Contact Aditya from ${info.name || 'your region'}`;
        }
      }
    }

    async function loadCountry(query) {
      const q = query.toLowerCase().trim();

      // Immediately render from fallback cache if present for instant UX
      if (countryDataCache[q]) {
        renderCountry(countryDataCache[q]);
      }

      // Smooth visual feedback
      if (intelBox) {
        intelBox.style.opacity = '0.7';
      }

      try {
        const res = await fetch(`/api/country?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && (data.name || data.found)) {
            countryDataCache[q] = data;
            renderCountry(data);
          }
        }
      } catch (e) {
        // Fallback already rendered, gracefully ignore network issues
      } finally {
        if (intelBox) {
          intelBox.style.opacity = '1';
        }
      }
    }

    pillsRow.addEventListener('click', (e) => {
      const btn = e.target.closest('.country-pill');
      if (!btn) return;
      const country = btn.getAttribute('data-country');
      if (!country) return;

      pillsRow.querySelectorAll('.country-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      loadCountry(country);
    });
  }

  // Initialization
  function init() {
    resizeCanvas();
    preloadImages();
    updateScroll();
    setupNavigationJumps();
    setupProjectFilters();
    setupGlobalCollabExplorer();
    fetchGitHubData();
    animate();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

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

  // Initialization
  function init() {
    resizeCanvas();
    preloadImages();
    updateScroll();
    setupNavigationJumps();
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

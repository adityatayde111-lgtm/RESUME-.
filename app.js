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

  // Launch Portal DOM Elements
  const portalLoadingBox = document.getElementById('portal-loading-box');
  const portalEnterBox = document.getElementById('portal-enter-box');
  const btnEnterSound = document.getElementById('btn-enter-sound');
  const btnEnterSilent = document.getElementById('btn-enter-silent');
  const heroPlayShowreelBtn = document.getElementById('hero-play-showreel-btn');

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
  let portalReady = false;
  let isIntroAnimating = false;
  let startProgressSnapshot = 0;

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

  // Portal Ready State Switch
  function showPortalEnterActions() {
    if (portalReady) return;
    portalReady = true;
    renderFrame(0);

    if (portalLoadingBox) {
      portalLoadingBox.style.display = 'none';
    }
    if (portalEnterBox) {
      portalEnterBox.classList.remove('hidden');
      portalEnterBox.style.display = 'flex';
    }
  }

  // Preload Image Sequence
  function preloadImages() {
    const initialBatchSize = 18;

    // Safety fallback: reveal enter buttons after 2.5s even if network is slow
    setTimeout(() => {
      showPortalEnterActions();
    }, 2500);

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);

      img.onload = () => {
        loadedCount++;
        const percent = Math.round((loadedCount / TOTAL_FRAMES) * 100);
        if (loaderBar) loaderBar.style.width = `${percent}%`;
        if (loaderPercent) loaderPercent.textContent = `${percent}%`;

        // Once initial batch is ready, reveal the Enter Experience buttons
        if (loadedCount >= initialBatchSize) {
          showPortalEnterActions();
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= initialBatchSize) {
          showPortalEnterActions();
        }
      };

      images.push(img);
    }
  }

  // Cinematic 60FPS Video/Canvas Intro Showreel Sweep
  function playCinematicIntroAnimation() {
    if (isIntroAnimating) return;
    isIntroAnimating = true;
    startProgressSnapshot = currentProgress;

    if (isVideoMode && video) {
      try {
        video.currentTime = 0;
        video.play().catch(() => {});
        setTimeout(() => {
          if (isVideoMode) {
            video.pause();
            isIntroAnimating = false;
          }
        }, 3000);
      } catch (e) {
        isIntroAnimating = false;
      }
      return;
    }

    const startTime = performance.now();
    const duration = 2800; // 2.8s smooth camera sweep
    const sweepRange = Math.min(48, TOTAL_FRAMES - 1);

    function introStep(now) {
      if (!isIntroAnimating) return;

      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Smooth sine arc: sweeps forward then gently returns to baseline
      const arc = Math.sin(t * Math.PI);
      const sweepFrame = Math.round(arc * sweepRange);

      currentFrameIndex = sweepFrame;
      renderFrame(currentFrameIndex);

      const displayIndex = String(currentFrameIndex + 1).padStart(3, '0');
      if (frameCounter) {
        frameCounter.textContent = `FRAME ${displayIndex} / ${TOTAL_FRAMES}`;
      }

      if (t < 1) {
        requestAnimationFrame(introStep);
      } else {
        isIntroAnimating = false;
        // Restore to current scroll progress frame
        const restoreFrame = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1))));
        currentFrameIndex = restoreFrame;
        renderFrame(currentFrameIndex);
        if (frameCounter) {
          const idx = String(currentFrameIndex + 1).padStart(3, '0');
          frameCounter.textContent = `FRAME ${idx} / ${TOTAL_FRAMES}`;
        }
      }
    }

    requestAnimationFrame(introStep);
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

    // Cancel intro animation if user actively scrolls
    if (isIntroAnimating && Math.abs(targetProgress - startProgressSnapshot) > 0.04) {
      isIntroAnimating = false;
    }

    // Target Frame
    const nextFrameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1))));

    if (!isIntroAnimating) {
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
    }

    // Video mode scrubbing sync
    if (isVideoMode && video.duration && !isIntroAnimating) {
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

  // ==========================================================================
  // Cinematic Audio & Song Player Engine (Inspiring Theme, Impact Beat, Drone & Custom)
  // ==========================================================================
  const bgAudio = document.getElementById('bg-soundtrack-player');
  const audioWidget = document.getElementById('audio-player-widget');
  const audioPlayBtn = document.getElementById('audio-play-pause-btn');
  const audioPlayIcon = document.getElementById('audio-play-icon');
  const audioPauseIcon = document.getElementById('audio-pause-icon');
  const audioExpandToggle = document.getElementById('audio-expand-toggle');
  const audioChevronBtn = document.getElementById('audio-chevron-btn');
  const audioDrawerCloseBtn = document.getElementById('audio-drawer-close-btn');
  const audioCurrentTimeEl = document.getElementById('audio-current-time');
  const audioTotalTimeEl = document.getElementById('audio-total-time');
  const audioTimeDisplay = document.getElementById('audio-time-display');
  const audioSeekSlider = document.getElementById('audio-seek-slider');
  const audioVolumeSlider = document.getElementById('audio-volume-slider');
  const audioMuteBtn = document.getElementById('audio-mute-btn');
  const volIcon = document.getElementById('vol-icon');
  const volMutedIcon = document.getElementById('vol-muted-icon');
  const currentTrackNameEl = document.getElementById('current-track-name');
  const customSongInput = document.getElementById('custom-song-input');
  const trackButtons = document.querySelectorAll('.track-select-pill');

  const TRACKS = {
    cinematic: {
      name: 'Inspiring Cinematic Theme',
      src: 'assets/cinematic_theme.mp3',
      type: 'audio'
    },
    impact: {
      name: 'Impact Moderato Beat',
      src: 'assets/impact_theme.ogg',
      type: 'audio'
    },
    drone: {
      name: 'Ambient Synthesizer Drone',
      src: null,
      type: 'synth'
    }
  };

  let currentTrackKey = 'cinematic';
  let isMuted = false;
  let previousVolume = 0.75;
  let isSeeking = false;

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Web Audio Synth Drone fallback implementation
  function startSynthDrone() {
    try {
      if (!audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioCtxClass();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      stopSynthDrone();

      const masterGain = audioCtx.createGain();
      const currentVol = bgAudio ? bgAudio.volume : 0.75;
      masterGain.gain.setValueAtTime(0.12 * currentVol, audioCtx.currentTime);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, audioCtx.currentTime);

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
      console.warn('Web Audio drone error:', e);
    }
  }

  function stopSynthDrone() {
    if (droneOscillators && droneOscillators.length) {
      droneOscillators.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      droneOscillators = [];
    }
  }

  function setAudioPlaybackState(playing) {
    isAudioPlaying = playing;

    if (soundToggle) {
      const label = soundToggle.querySelector('.btn-label');
      if (label) label.textContent = playing ? 'AUDIO: ON' : 'AUDIO: OFF';
      soundToggle.classList.toggle('active', playing);
    }

    if (audioWidget) {
      audioWidget.classList.toggle('playing', playing);
    }

    if (audioPlayIcon && audioPauseIcon) {
      if (playing) {
        audioPlayIcon.classList.add('hidden');
        audioPauseIcon.classList.remove('hidden');
      } else {
        audioPlayIcon.classList.remove('hidden');
        audioPauseIcon.classList.add('hidden');
      }
    }
  }

  // Smooth Volume Fade In (Studio Luxury Swell)
  function fadeInAudio(targetVol = 0.75, durationMs = 1200) {
    if (!bgAudio) return;
    bgAudio.volume = 0.05;
    const startTime = performance.now();
    function step(now) {
      if (isMuted) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      bgAudio.volume = 0.05 + progress * (targetVol - 0.05);
      if (progress < 1 && isAudioPlaying) {
        requestAnimationFrame(step);
      } else if (isAudioPlaying) {
        bgAudio.volume = targetVol;
      }
    }
    requestAnimationFrame(step);
  }

  async function playCurrentTrack(fadeIn = false) {
    const track = TRACKS[currentTrackKey];
    if (!track) return;

    if (track.type === 'synth') {
      if (bgAudio) bgAudio.pause();
      startSynthDrone();
      setAudioPlaybackState(true);
      if (currentTrackNameEl) currentTrackNameEl.textContent = track.name;
      if (audioTimeDisplay) audioTimeDisplay.textContent = 'Live Synth';
      if (audioTotalTimeEl) audioTotalTimeEl.textContent = 'Live';
      return;
    }

    stopSynthDrone();
    if (!bgAudio) return;

    try {
      if (!bgAudio.src || bgAudio.src === '' || bgAudio.src.endsWith(window.location.pathname)) {
        bgAudio.src = track.src;
      }
      if (fadeIn && !isMuted) {
        bgAudio.volume = 0.05;
      } else {
        bgAudio.volume = isMuted ? 0 : (previousVolume || 0.75);
      }
      await bgAudio.play();
      setAudioPlaybackState(true);
      if (fadeIn && !isMuted) {
        fadeInAudio(previousVolume || 0.75, 1200);
      }
    } catch (err) {
      console.warn('Audio play requires user interaction or autoplay blocked:', err);
      setAudioPlaybackState(false);
    }
  }

  function pauseCurrentTrack() {
    if (bgAudio) bgAudio.pause();
    stopSynthDrone();
    if (audioCtx && audioCtx.state === 'running') {
      audioCtx.suspend();
    }
    setAudioPlaybackState(false);
  }

  function toggleAudioPlayback() {
    if (isAudioPlaying) {
      pauseCurrentTrack();
    } else {
      playCurrentTrack();
    }
  }

  function switchTrack(trackKey, customName = null, customSrc = null) {
    if (customSrc) {
      TRACKS['custom'] = {
        name: customName || 'Custom Song',
        src: customSrc,
        type: 'audio'
      };
      currentTrackKey = 'custom';
    } else if (TRACKS[trackKey]) {
      currentTrackKey = trackKey;
    }

    const track = TRACKS[currentTrackKey];
    if (currentTrackNameEl) currentTrackNameEl.textContent = track.name;

    trackButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-track') === currentTrackKey);
    });

    if (track.type === 'audio') {
      if (bgAudio) {
        bgAudio.src = track.src;
        bgAudio.currentTime = 0;
      }
    }

    if (isAudioPlaying) {
      playCurrentTrack();
    }
  }

  // Top nav sound toggle button
  if (soundToggle) {
    soundToggle.addEventListener('click', toggleAudioPlayback);
  }

  // Floating player play/pause button
  if (audioPlayBtn) {
    audioPlayBtn.addEventListener('click', toggleAudioPlayback);
  }

  // Toggle expanded controls drawer
  if (audioExpandToggle) {
    audioExpandToggle.addEventListener('click', (e) => {
      if (e.target.closest('#audio-chevron-btn')) return;
      if (audioWidget) audioWidget.classList.toggle('expanded');
    });
  }

  if (audioChevronBtn) {
    audioChevronBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (audioWidget) audioWidget.classList.toggle('expanded');
    });
  }

  if (audioDrawerCloseBtn) {
    audioDrawerCloseBtn.addEventListener('click', () => {
      if (audioWidget) audioWidget.classList.remove('expanded');
    });
  }

  // Track select buttons
  trackButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const trackKey = btn.getAttribute('data-track');
      switchTrack(trackKey);
    });
  });

  // Native audio time update & seekbar sync
  if (bgAudio) {
    bgAudio.volume = 0.75;

    bgAudio.addEventListener('timeupdate', () => {
      if (isSeeking || TRACKS[currentTrackKey]?.type === 'synth') return;
      const current = bgAudio.currentTime;
      const duration = bgAudio.duration || 1;
      const pct = (current / duration) * 100;

      if (audioSeekSlider) audioSeekSlider.value = pct;
      if (audioCurrentTimeEl) audioCurrentTimeEl.textContent = formatTime(current);
      if (audioTimeDisplay) audioTimeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    });

    bgAudio.addEventListener('loadedmetadata', () => {
      const duration = bgAudio.duration;
      if (audioTotalTimeEl) audioTotalTimeEl.textContent = formatTime(duration);
      if (audioTimeDisplay) audioTimeDisplay.textContent = `${formatTime(bgAudio.currentTime)} / ${formatTime(duration)}`;
    });

    bgAudio.addEventListener('ended', () => {
      bgAudio.currentTime = 0;
      bgAudio.play();
    });
  }

  // Seek bar input & change
  if (audioSeekSlider && bgAudio) {
    audioSeekSlider.addEventListener('input', () => {
      isSeeking = true;
      const pct = parseFloat(audioSeekSlider.value);
      const targetTime = (pct / 100) * (bgAudio.duration || 1);
      if (audioCurrentTimeEl) audioCurrentTimeEl.textContent = formatTime(targetTime);
    });

    audioSeekSlider.addEventListener('change', () => {
      const pct = parseFloat(audioSeekSlider.value);
      bgAudio.currentTime = (pct / 100) * (bgAudio.duration || 1);
      isSeeking = false;
    });
  }

  // Volume slider
  function updateMuteIcons(muted) {
    if (volIcon && volMutedIcon) {
      if (muted) {
        volIcon.classList.add('hidden');
        volMutedIcon.classList.remove('hidden');
      } else {
        volIcon.classList.remove('hidden');
        volMutedIcon.classList.add('hidden');
      }
    }
  }

  if (audioVolumeSlider && bgAudio) {
    audioVolumeSlider.addEventListener('input', () => {
      const vol = parseFloat(audioVolumeSlider.value);
      bgAudio.volume = vol;
      isMuted = vol === 0;
      updateMuteIcons(isMuted);
    });
  }

  if (audioMuteBtn && bgAudio) {
    audioMuteBtn.addEventListener('click', () => {
      if (isMuted) {
        bgAudio.volume = previousVolume > 0 ? previousVolume : 0.75;
        if (audioVolumeSlider) audioVolumeSlider.value = bgAudio.volume;
        isMuted = false;
      } else {
        previousVolume = bgAudio.volume;
        bgAudio.volume = 0;
        if (audioVolumeSlider) audioVolumeSlider.value = 0;
        isMuted = true;
      }
      updateMuteIcons(isMuted);
    });
  }

  // Custom Song Upload input
  if (customSongInput) {
    customSongInput.addEventListener('change', () => {
      const file = customSongInput.files[0];
      if (!file) return;

      const songUrl = URL.createObjectURL(file);
      const songTitle = file.name.replace(/\.[^/.]+$/, "");
      switchTrack('custom', songTitle, songUrl);

      showToast(`Loaded personal song: ${songTitle}`);
      playCurrentTrack();
    });
  }

  // Cinematic Launch Portal Enter Handlers & Showreel Trigger
  function enterExperience(withSound = true) {
    if (preloader) {
      preloader.classList.add('loaded');
    }

    if (withSound) {
      // User gesture directly starts audio without autoplay restriction block
      playCurrentTrack(true);
      // Start cinematic 60FPS intro showreel sweep
      playCinematicIntroAnimation();
    }
  }

  if (btnEnterSound) {
    btnEnterSound.addEventListener('click', () => {
      enterExperience(true);
    });
  }

  if (btnEnterSilent) {
    btnEnterSilent.addEventListener('click', () => {
      enterExperience(false);
    });
  }

  if (heroPlayShowreelBtn) {
    heroPlayShowreelBtn.addEventListener('click', () => {
      playCurrentTrack(true);
      playCinematicIntroAnimation();
      if (window.scrollY > 150) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Clipboard Utility Helper
  function copyTextToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        showToast(successMsg);
      });
    } else {
      showToast(successMsg);
    }
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

  // Interactive Follow-up Links inside Message Bubbles
  if (aiMessagesList) {
    aiMessagesList.addEventListener('click', (e) => {
      const link = e.target.closest('.ai-quick-link');
      if (link) {
        const prompt = link.getAttribute('data-prompt');
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

  // Helper to build interactive prompt follow-ups inside replies
  function buildAIFollowups(chips) {
    if (!chips || !chips.length) return '';
    const chipsHtml = chips.map(c => 
      `<button type="button" class="ai-quick-link" data-prompt="${escapeHtml(c.prompt)}">${c.label}</button>`
    ).join('');
    return `
      <div class="ai-followups-container">
        <span class="ai-followup-title">⚡ Suggested Follow-ups:</span>
        <div class="ai-quick-links-row">
          ${chipsHtml}
        </div>
      </div>
    `;
  }

  // Local Knowledge Base Engine (Trained Portfolio Intelligence)
  function generateLocalKnowledgeReply(prompt) {
    const q = prompt.toLowerCase().trim();

    // 1. Greetings & Personal Identity
    if (/\b(hi|hello|hey|namaste|greetings|hola|who are you|what can you do|about you|introduce|intro|who is aditya|tell me about (aditya|yourself)|summary)\b/i.test(q)) {
      return `Hello! I am <strong>Aditya Tayde's AI Copilot</strong>, trained on his engineering portfolio, verified academic records, and production systems.
      <br><br>
      • <strong>Identity:</strong> Computer Science &amp; Engineering undergraduate at <strong>Sanjivani University</strong> (CGPA: <strong>8.0 / 10</strong>).<br>
      • <strong>Core Disciplines:</strong> Full-Stack Development, AI/ML Systems, Zero-Dependency TypeScript Libraries, and Agritech Innovations.<br>
      • <strong>Flagship Works:</strong> <em>Shetkari Raja</em> (React/Capacitor Agritech Platform), <em>Sanjivani AI Gateway</em> (358-provider orchestrator), and 16+ public GitHub repositories.<br>
      • <strong>Department Leadership:</strong> Official Social Media Handler &amp; Event Coordinator, CSE Department, Sanjivani University.
      ${buildAIFollowups([
        { label: '💼 Why Hire Aditya?', prompt: 'Why should recruiters hire Aditya Tayde and what makes him stand out?' },
        { label: '🌾 Shetkari Raja', prompt: 'Tell me about the Shetkari Raja agricultural platform and AI grain grading.' },
        { label: '⚡ Core Tech Stack', prompt: 'What are Aditya\'s core technical skills and programming languages?' },
        { label: '📬 Contact Info', prompt: 'How can I contact Aditya Tayde or download his resume?' }
      ])}`;
    }

    // 2. Why Hire Aditya / Value Proposition / Recruiter Evaluation
    if (/\b(why hire|why should|hire aditya|strengths|value proposition|unique|why choose|what makes|culture fit|stand out|best qualities|pros)\b/i.test(q)) {
      return `<strong>💼 Why Aditya Tayde is a High-Impact Engineering Hire:</strong>
      <br><br>
      1. <strong>Production Versatility &amp; Systems Craftsmanship:</strong>
      Aditya doesn't just write scripts — he ships complete architectures: from zero-dependency TypeScript libraries (<span class="ai-code-pill">@adityatayde/sanjivani-core</span>) and native Android mobile apps (Capacitor) to high-throughput 60FPS mathematical canvas engines.
      <br><br>
      2. <strong>Solid Computer Science Foundations:</strong>
      Maintains an impressive <strong>8.0 / 10 CGPA</strong> in Integrated B.Tech CSE at Sanjivani University and an <strong>84% Distinction</strong> in Class X. Strong grasp of Data Structures &amp; Algorithms, Object-Oriented Design, Relational Normalization, and Operating Systems.
      <br><br>
      3. <strong>Demonstrated Real-World Impact:</strong>
      Engineered <strong>Shetkari Raja</strong> to solve critical rural challenges: native camera AI grain grading, real-time procurement queues, and DBT/PFMS subsidy tracking.
      <br><br>
      4. <strong>Proven Leadership &amp; High Agency:</strong>
      As the <strong>CSE Department Social Media Handler &amp; Event Coordinator</strong>, he manages digital outreach, technical hackathons, and cross-functional teams with clear, articulate communication.
      <br><br>
      5. <strong>Immediate Availability:</strong>
      Ready to join immediately for SDE / Full-Stack / AI Internships or Junior Developer roles (Global Remote, Hybrid, or On-Site in Pune, Mumbai, Bangalore).
      ${buildAIFollowups([
        { label: '⚡ Technical Stack', prompt: 'What are Aditya\'s core technical skills and programming languages?' },
        { label: '🌾 Shetkari Raja Architecture', prompt: 'Tell me about the Shetkari Raja agricultural platform and AI grain grading.' },
        { label: '🎓 Academic Credentials', prompt: 'What is Aditya\'s academic background, college, and CGPA?' },
        { label: '📞 Schedule an Interview', prompt: 'How can I contact Aditya Tayde or download his resume?' }
      ])}`;
    }

    // 3. Shetkari Raja Flagship Project
    if (/\b(shetkari|raja|agricultural|agriculture|farmer|farming|grain|grading|dbt|pfms|procurement|crop quality)\b/i.test(q)) {
      return `<strong>🌾 Flagship Project: Shetkari Raja (Digital Agritech Platform)</strong>
      <br><br>
      A mission-driven agricultural technology ecosystem engineered to empower farmers with automated quality assessment and transparent supply chains.
      <br><br>
      • <strong>Tech Stack:</strong> React, TypeScript, Tailwind CSS, Supabase (PostgreSQL), Capacitor Android Native Bridge.<br>
      • <strong>AI-Driven Grain Grading:</strong> Utilizes device camera capture with on-device computer vision models to evaluate grain quality metrics, moisture, and impurities.<br>
      • <strong>Live Procurement Queue Tracker:</strong> Real-time queue monitoring at government agricultural grain procurement centers, eliminating days of physical waiting.<br>
      • <strong>DBT / PFMS Payment Status:</strong> Real-time tracking of Direct Benefit Transfer subsidies and procurement payouts.<br>
      • <strong>Android Mobile Ready:</strong> Packaged as a native APK via Capacitor for low-latency rural field operation.
      <div class="ai-highlight-box">
        Repository: <a href="https://github.com/adityatayde111-lgtm/shetkari-raja" target="_blank" style="color: #38bdf8; text-decoration: underline; font-weight: 600;">github.com/adityatayde111-lgtm/shetkari-raja</a>
      </div>
      ${buildAIFollowups([
        { label: '🛡️ Sanjivani AI Gateway', prompt: 'How does Sanjivani AI Gateway and open-source Core SDK work?' },
        { label: '🌱 AgriSmart AI', prompt: 'Tell me about the AgriSmart AI project' },
        { label: '⚡ Core Tech Stack', prompt: 'What are Aditya\'s core technical skills and programming languages?' }
      ])}`;
    }

    // 4. Sanjivani AI Tool & Open-Source Core SDK
    if (/\b(sanjivani|gateway|core sdk|358|failover|circuit breaker|firewall|prompt injection|@adityatayde\/sanjivani-core|load balanc)\b/i.test(q)) {
      return `<strong>🛡️ Sanjivani AI Gateway &amp; Core SDK</strong>
      <br><br>
      A high-availability, enterprise-grade AI routing engine and zero-dependency TypeScript developer library:
      <br><br>
      • <strong>358-Provider Federation:</strong> Unifies OpenAI, Anthropic, Mistral, Groq, and local Ollama runtimes under a single resilient API surface.<br>
      • <strong>Latency-Based Load Balancing:</strong> Measures real-time endpoint TTFT (Time To First Token) and routes queries to the fastest active node.<br>
      • <strong>Automatic Failover &amp; Circuit Breaking:</strong> Zero-downtime automated fallbacks when upstream providers suffer rate limits (429) or outages.<br>
      • <strong>Prompt Injection Firewall:</strong> Pre-execution input sanitization and heuristic threat detection to stop jailbreaks.<br>
      • <strong>Zero-Dependency Library:</strong> Packaged and published on npm: <span class="ai-code-pill">npm i @adityatayde/sanjivani-core</span> (v1.2.0, MIT).
      <div class="ai-highlight-box">
        Repository: <a href="https://github.com/adityatayde111-lgtm/sanjivani-ai-tool" target="_blank" style="color: #38bdf8; text-decoration: underline; font-weight: 600;">github.com/adityatayde111-lgtm/sanjivani-ai-tool</a>
      </div>
      ${buildAIFollowups([
        { label: '🤖 Agentic AI Systems', prompt: 'What AI, ML, and Autonomous Agent systems has Aditya built?' },
        { label: '🌾 Shetkari Raja', prompt: 'Tell me about the Shetkari Raja agricultural platform and AI grain grading.' },
        { label: '💼 Why Hire Aditya?', prompt: 'Why should recruiters hire Aditya Tayde and what makes him stand out?' }
      ])}`;
    }

    // 5. AI Assistant Agent
    if (/\b(ai assistant agent|agentic|tool dispatch|memory synthesis|autonomous agent)\b/i.test(q)) {
      return `<strong>🤖 AI Assistant Agent (Autonomous Tool Dispatcher)</strong>
      <br><br>
      An advanced agentic architecture engineered in TypeScript featuring:
      <br><br>
      • <strong>Dynamic Tool Calling:</strong> Analyzes user intent and dispatches deterministic tool schemas at runtime.<br>
      • <strong>Long-Term Memory Synthesis:</strong> Retains multi-turn conversation context across user sessions with semantic embedding recall.<br>
      • <strong>Autonomous Reasoning:</strong> Plan-and-solve execution loops capable of breaking down complex prompts into verifiable micro-steps.
      <div class="ai-highlight-box">
        Repository: <a href="https://github.com/adityatayde111-lgtm/ai-assistant-agent" target="_blank" style="color: #38bdf8; text-decoration: underline; font-weight: 600;">github.com/adityatayde111-lgtm/ai-assistant-agent</a>
      </div>
      ${buildAIFollowups([
        { label: '🛡️ Sanjivani AI Gateway', prompt: 'How does Sanjivani AI Gateway and open-source Core SDK work?' },
        { label: '⚡ Core Tech Stack', prompt: 'What are Aditya\'s core technical skills and programming languages?' }
      ])}`;
    }

    // 6. AgriSmart AI
    if (/\b(agrismart|yield forecasting|soil parameter|crop decision)\b/i.test(q)) {
      return `<strong>🌱 AgriSmart AI (Predictive Agronomic Decision Engine)</strong>
      <br><br>
      A data-driven farming intelligence platform designed to maximize crop yield and optimize resource allocation:
      <br><br>
      • <strong>Multi-Factor ML Analysis:</strong> Evaluates soil chemical parameters (NPK, pH), local weather forecasts, and historical crop yields.<br>
      • <strong>Actionable Recommendations:</strong> Generates tailored fertilizer schedules and irrigation advice to minimize economic loss.<br>
      • <strong>Market Forecasting:</strong> Integrates agricultural commodity pricing trends for optimal harvest timing.
      <div class="ai-highlight-box">
        Repository: <a href="https://github.com/adityatayde111-lgtm/AgriSmart-Helping-Farmers-Make-Better-Decisions-with-AI" target="_blank" style="color: #38bdf8; text-decoration: underline; font-weight: 600;">github.com/adityatayde111-lgtm/AgriSmart</a>
      </div>
      ${buildAIFollowups([
        { label: '🌾 Shetkari Raja', prompt: 'Tell me about the Shetkari Raja agricultural platform and AI grain grading.' },
        { label: '⚡ Core Tech Stack', prompt: 'What are Aditya\'s core technical skills and programming languages?' }
      ])}`;
    }

    // 7. 60FPS Canvas Engine & Cinematic Music System
    if (/\b(canvas|scrub|fps|frame|audio|soundtrack|song|music|synthesizer|oscillator|sound|track|player|mp3)\b/i.test(q)) {
      return `<strong>🎵 60FPS Canvas Scrub Engine &amp; Cinematic Audio Dock:</strong>
      <br><br>
      This portfolio itself demonstrates Aditya's creative engineering capabilities:
      <br><br>
      • <strong>60FPS Mathematical Scrubbing:</strong> 240-frame fluid canvas video visualizer driven by scroll position interpolation (lerp) with zero frame drops.<br>
      • <strong>Cinematic Soundtrack Player:</strong> Multi-track audio engine with dynamic Web Audio API integration:<br>
      &nbsp;&nbsp;1. <em>Inspiring Cinematic Theme:</em> Orchestral tech teaser.<br>
      &nbsp;&nbsp;2. <em>Impact Moderato Beat:</em> High-tempo electronic rhythm.<br>
      &nbsp;&nbsp;3. <em>Ambient Synth Drone:</em> Generative 4-voice procedural audio synthesizer.<br>
      • <strong>"Load My Song":</strong> Integrated file picker in the bottom-left music dock allowing visitors to load and play any personal MP3/WAV/OGG audio track directly in the browser!
      ${buildAIFollowups([
        { label: '⚡ Core Tech Stack', prompt: 'What are Aditya\'s core technical skills and programming languages?' },
        { label: '🌾 Shetkari Raja', prompt: 'Tell me about the Shetkari Raja agricultural platform and AI grain grading.' },
        { label: '💼 Why Hire Aditya?', prompt: 'Why should recruiters hire Aditya Tayde and what makes him stand out?' }
      ])}`;
    }

    // 8. Student Management System
    if (/\b(student management|crud|academic management|grade tracking|student portal)\b/i.test(q)) {
      return `<strong>🎓 Student Management System</strong>
      <br><br>
      A robust, database-driven academic management software:
      <br><br>
      • <strong>Relational Architecture:</strong> Normalized MySQL schema ensuring ACID compliance across student entities, courses, and grading registries.<br>
      • <strong>Core Functionality:</strong> Complete CRUD operations for student profiles, course registrations, semester grade computation, and automated transcript reporting.<br>
      • <strong>Security:</strong> Input sanitization and role-based access control protecting student academic records.
      ${buildAIFollowups([
        { label: '🧠 DSA & CS Fundamentals', prompt: 'What are Aditya\'s competencies in Data Structures, Algorithms, and Core CS?' },
        { label: '⚡ Core Tech Stack', prompt: 'What are Aditya\'s core technical skills and programming languages?' },
        { label: '🎓 Education & CGPA', prompt: 'What is Aditya\'s academic background, college, and CGPA?' }
      ])}`;
    }

    // 9. GitHub Repositories & Open Source
    if (/\b(github|repo|repositories|codebase|open source|library|npm|all projects)\b/i.test(q)) {
      return `<strong>📚 GitHub Profile &amp; 16+ Repositories (@adityatayde111-lgtm):</strong>
      <br><br>
      Aditya's GitHub showcases active engineering across web apps, libraries, and AI systems:
      <br><br>
      • <strong>shetkari-raja:</strong> Agricultural management with AI grain grading.<br>
      • <strong>sanjivani-ai-tool:</strong> High-availability AI gateway unifying 358 providers.<br>
      • <strong>@adityatayde/sanjivani-core:</strong> Zero-dependency TypeScript AI routing SDK on npm.<br>
      • <strong>ai-assistant-agent:</strong> Autonomous agentic framework with dynamic tool calling.<br>
      • <strong>AgriSmart:</strong> Predictive crop analytics and agronomic decision engine.<br>
      • <strong>Interactive Dice Roller &amp; Web Engines:</strong> Experimental UI &amp; graphics tools.<br>
      <div class="ai-highlight-box">
        Visit GitHub: <a href="https://github.com/adityatayde111-lgtm" target="_blank" style="color: #38bdf8; text-decoration: underline; font-weight: 600;">github.com/adityatayde111-lgtm</a><br>
        <em>Tip: You can also click the "Browse All 16+ Repositories" button right on this page!</em>
      </div>
      ${buildAIFollowups([
        { label: '🌾 Shetkari Raja', prompt: 'Tell me about the Shetkari Raja agricultural platform and AI grain grading.' },
        { label: '🛡️ Sanjivani AI Gateway', prompt: 'How does Sanjivani AI Gateway and open-source Core SDK work?' },
        { label: '💼 Why Hire Aditya?', prompt: 'Why should recruiters hire Aditya Tayde and what makes him stand out?' }
      ])}`;
    }

    // 10. DSA & Core Computer Science Fundamentals
    if (/\b(dsa|data structure|algorithm|problem solving|leetcode|complexity|big o|oop|object oriented|os|operating system|dbms|database system|network)\b/i.test(q)) {
      return `<strong>🧠 Data Structures, Algorithms &amp; Computer Science Core:</strong>
      <br><br>
      Aditya has built strong foundational engineering intuition through rigorous academic study and coding:
      <br><br>
      • <strong>Data Structures:</strong> Arrays, Strings, Singly/Doubly Linked Lists, Stacks, Queues, Binary Trees, Binary Search Trees, Graphs (BFS/DFS), and Hash Maps.<br>
      • <strong>Algorithms &amp; Techniques:</strong> Sorting, Searching (Binary Search), Two Pointers, Sliding Window, Recursion, Dynamic Programming, and Greedy Algorithms.<br>
      • <strong>Time &amp; Space Complexity:</strong> Systematic Big-O runtime and auxiliary space analysis for production scalability.<br>
      • <strong>Object-Oriented Programming (OOP):</strong> Encapsulation, Polymorphism, Inheritance, Abstraction, and SOLID design principles.<br>
      • <strong>Database Management (DBMS):</strong> Relational Normalization (1NF through BCNF), indexing, transactions, and ACID constraints.<br>
      • <strong>Operating Systems &amp; Networks:</strong> Process scheduling, virtual memory, concurrency, TCP/IP stack, and HTTP/REST protocols.
      ${buildAIFollowups([
        { label: '⚡ Technical Skills', prompt: 'What are Aditya\'s core technical skills and programming languages?' },
        { label: '🎓 Education & CGPA', prompt: 'What is Aditya\'s academic background, college, and CGPA?' },
        { label: '💼 Why Hire Aditya?', prompt: 'Why should recruiters hire Aditya Tayde and what makes him stand out?' }
      ])}`;
    }

    // 11. AI / ML / LLM Capabilities
    if (/\b(machine learning|deep learning|prompt engineering|gpt|rag|artificial intelligence)\b/i.test(q)) {
      return `<strong>🤖 Artificial Intelligence &amp; Machine Learning Expertise:</strong>
      <br><br>
      Aditya's AI development spans production LLM orchestration and practical applied ML:
      <br><br>
      • <strong>AI Routing &amp; Gateways:</strong> Author of <span class="ai-code-pill">sanjivani-ai-tool</span> orchestrating 358 model providers with latency-based load balancing and circuit breaking.<br>
      • <strong>Agentic Systems:</strong> Dynamic tool invocation, long-term memory synthesis, and multi-step reasoning state machines.<br>
      • <strong>Computer Vision / Edge AI:</strong> Native camera grain defect classification for the Shetkari Raja Android platform.<br>
      • <strong>Predictive Agronomic ML:</strong> Multi-factor regression and classification models in AgriSmart AI.
      ${buildAIFollowups([
        { label: '🛡️ Sanjivani AI Gateway', prompt: 'How does Sanjivani AI Gateway and open-source Core SDK work?' },
        { label: '🌾 Shetkari Raja', prompt: 'Tell me about the Shetkari Raja agricultural platform and AI grain grading.' },
        { label: '⚡ Core Tech Stack', prompt: 'What are Aditya\'s core technical skills and programming languages?' }
      ])}`;
    }

    // 12. Technical Skills & Languages Stack
    if (/\b(skill|stack|tech|technolog|language|programming|frontend|backend|framework|tool|python|c\+\+|javascript|typescript|react|tailwind|mysql)\b/i.test(q)) {
      return `<strong>⚡ Aditya's Complete Technical Stack &amp; Tooling:</strong>
      <br><br>
      • <strong>Programming Languages:</strong> Python, C, C++, JavaScript (ES6+), TypeScript<br>
      • <strong>Frontend &amp; UI Engineering:</strong> React, HTML5, CSS3, Tailwind CSS, HTML5 Canvas API, Web Audio API<br>
      • <strong>Databases &amp; Systems:</strong> MySQL, PostgreSQL / Supabase, Relational DBMS Design, Node.js REST APIs<br>
      • <strong>Mobile &amp; Frameworks:</strong> Capacitor Android Native Bridge, Express.js<br>
      • <strong>DevOps &amp; Developer Tools:</strong> Git, GitHub, Linux / Unix CLI, VS Code, npm ecosystem<br>
      • <strong>Core Competencies:</strong> DSA, OOP, AI Gateway Architectures, Agentic Workflows, 60FPS UI Rendering<br>
      • <strong>Soft Skills:</strong> Technical Leadership, Cross-Functional Teamwork, Event Coordination, Creative Problem Solving
      ${buildAIFollowups([
        { label: '🌾 Shetkari Raja Architecture', prompt: 'Tell me about the Shetkari Raja agricultural platform and AI grain grading.' },
        { label: '🛡️ Sanjivani AI Gateway', prompt: 'How does Sanjivani AI Gateway and open-source Core SDK work?' },
        { label: '🧠 DSA Competencies', prompt: 'What are Aditya\'s competencies in Data Structures, Algorithms, and Core CS?' },
        { label: '💼 Hire Aditya', prompt: 'Why should recruiters hire Aditya Tayde and what makes him stand out?' }
      ])}`;
    }

    // 13. Education & Academic Standing
    if (/\b(education|college|university|cgpa|btech|degree|school|marks|grade|sanjivani|class 10|10th|study|academic|coursework)\b/i.test(q)) {
      return `<strong>🎓 Academic Background &amp; Credentials:</strong>
      <br><br>
      • <strong>Integrated B.Tech in Computer Science &amp; Engineering:</strong><br>
      &nbsp;&nbsp;Institution: <strong>Sanjivani University</strong>, Maharashtra, India<br>
      &nbsp;&nbsp;Current CGPA: <strong>8.0 / 10</strong><br>
      &nbsp;&nbsp;Key Coursework: Data Structures &amp; Algorithms, Object-Oriented Programming, Database Management Systems, Operating Systems, Computer Networks, Artificial Intelligence.<br>
      <br>
      • <strong>Secondary School Certificate (Class X):</strong><br>
      &nbsp;&nbsp;Board Score: <strong>84% (Distinction)</strong><br>
      <br>
      • <strong>Department Leadership:</strong><br>
      &nbsp;&nbsp;Serving as the <strong>Department Social Media Handler &amp; Event Coordinator</strong> for the Department of Computer Science &amp; Engineering at Sanjivani University.
      ${buildAIFollowups([
        { label: '🏆 Leadership & Activities', prompt: 'What licenses, certifications, and leadership roles does Aditya hold?' },
        { label: '💼 Why Hire Aditya?', prompt: 'Why should recruiters hire Aditya Tayde and what makes him stand out?' },
        { label: '📬 Contact Info', prompt: 'How can I contact Aditya Tayde or download his resume?' }
      ])}`;
    }

    // 14. Leadership & Event Coordination
    if (/\b(leadership|social media|coordinator|event|cse department|extracurricular|activities|management|teamwork|organizing)\b/i.test(q)) {
      return `<strong>🏆 Leadership &amp; Departmental Coordination:</strong>
      <br><br>
      <strong>Department Social Media Handler &amp; Event Coordinator</strong><br>
      <em>Department of Computer Science &amp; Engineering, Sanjivani University</em>
      <br><br>
      • <strong>Media Strategy &amp; Outreach:</strong> Orchestrates promotional campaigns, reels, posters, and technical communications reaching thousands of students and faculty.<br>
      • <strong>Technical &amp; Cultural Event Management:</strong> Spearheads organization of department hackathons, coding competitions, technical symposiums, and cultural fests.<br>
      • <strong>Cross-Functional Collaboration:</strong> Acts as the primary bridge between department faculty, student bodies, guest speakers, and industry partners.<br>
      • <strong>Key Competencies:</strong> High EQ leadership, crisp public communication, brand building, and agile crisis management.
      ${buildAIFollowups([
        { label: '🎓 Academic Details', prompt: 'What is Aditya\'s academic background, college, and CGPA?' },
        { label: '💼 Why Hire Aditya?', prompt: 'Why should recruiters hire Aditya Tayde and what makes him stand out?' },
        { label: '📬 Contact Aditya', prompt: 'How can I contact Aditya Tayde or download his resume?' }
      ])}`;
    }

    // 15. Job Search, Internship Availability, Notice Period
    if (/\b(intern|internship|available|availability|job|career|role|join|notice period|start date|opportunity|fresher|full time|hiring)\b/i.test(q)) {
      return `<strong>💼 Internship &amp; Career Opportunities:</strong>
      <br><br>
      Aditya is actively seeking <strong>Software Development Engineer (SDE)</strong>, <strong>Full-Stack Developer</strong>, <strong>AI/ML Engineer</strong>, or <strong>Python Developer</strong> internship and junior opportunities.
      <br><br>
      • <strong>Availability:</strong> <strong>Immediate</strong> — Ready to contribute from Day 1.<br>
      • <strong>Work Modality:</strong> Fully open to <strong>Global Remote</strong>, <strong>Hybrid</strong>, or <strong>On-Site</strong> positions.<br>
      • <strong>Location Flexibility:</strong> Based in Maharashtra, India. Enthusiastic to relocate to tech hubs like <strong>Pune</strong>, <strong>Mumbai</strong>, <strong>Bangalore</strong>, or internationally.<br>
      • <strong>Direct Contact:</strong> Call <a href="tel:9403206007" style="color: #38bdf8; text-decoration: underline;">+91 9403206007</a> or email <a href="mailto:adityatayde111@gmail.com" style="color: #38bdf8; text-decoration: underline;">adityatayde111@gmail.com</a>.
      ${buildAIFollowups([
        { label: '💼 Why Hire Aditya?', prompt: 'Why should recruiters hire Aditya Tayde and what makes him stand out?' },
        { label: '📄 Resume & CV', prompt: 'How can I contact Aditya Tayde or download his resume?' },
        { label: '🌍 Remote Timezone Overlap', prompt: 'What are Aditya\'s remote collaboration capabilities and timezone overlaps?' }
      ])}`;
    }

    // 16. Global Remote Collaboration & Timezones
    if (/\b(remote|timezone|overlap|global|usa|canada|uk|europe|germany|australia|singapore|hours|ist)\b/i.test(q)) {
      return `<strong>🌍 Global Remote Collaboration &amp; Timezone Overlap:</strong>
      <br><br>
      Aditya operates with high discipline in distributed remote environments:
      <br><br>
      • <strong>Base Timezone:</strong> Indian Standard Time (IST &bull; UTC +5:30)<br>
      • <strong>United States &amp; Canada (EST / PST):</strong> 3 to 5 hours daily synchronous overlap (morning/evening sync windows).<br>
      • <strong>United Kingdom &amp; Europe (GMT / CET):</strong> 4 to 6 hours prime midday overlap.<br>
      • <strong>APAC &amp; Australia (SGT / JST / AEST):</strong> 6 to 8 hours of extensive concurrent working overlap.<br>
      • <strong>Communication Workflow:</strong> Clear asynchronous written documentation, Git-driven code reviews, Slack/Discord agility, and proactive standups.
      <div class="ai-highlight-box">
        <em>Try the interactive "Global Remote Collaboration &amp; Timezone Explorer" widget situated below on this page!</em>
      </div>
      ${buildAIFollowups([
        { label: '💼 Why Hire Aditya?', prompt: 'Why should recruiters hire Aditya Tayde and what makes him stand out?' },
        { label: '⚡ Core Tech Stack', prompt: 'What are Aditya\'s core technical skills and programming languages?' },
        { label: '📬 Contact Info', prompt: 'How can I contact Aditya Tayde or download his resume?' }
      ])}`;
    }

    // 17. Certifications & Verified Credentials
    if (/\b(cert|certificate|certification|credential|license|badge)\b/i.test(q)) {
      return `<strong>📜 Verified Credentials &amp; Certifications:</strong>
      <br><br>
      • <strong>Academic Degree:</strong> Integrated B.Tech in CSE, Sanjivani University (CGPA: <strong>8.0 / 10</strong>).<br>
      • <strong>Secondary Education:</strong> Class X Board Score: <strong>84% (Distinction)</strong>.<br>
      • <strong>Official Leadership Role:</strong> Department Social Media Handler &amp; Event Coordinator, CSE Dept, Sanjivani University.<br>
      • <strong>Verified Coursework:</strong> Python Programming, C/C++, Web Technologies, Database Systems, and AI/ML.<br>
      • <strong>Open Source Publishing:</strong> Published npm library <span class="ai-code-pill">@adityatayde/sanjivani-core</span>.<br>
      • <strong>LinkedIn Profile:</strong> <a href="https://www.linkedin.com/in/aditya-tayde-02a030383" target="_blank" style="color: #38bdf8; text-decoration: underline;">linkedin.com/in/aditya-tayde-02a030383</a>
      ${buildAIFollowups([
        { label: '🎓 Education Details', prompt: 'What is Aditya\'s academic background, college, and CGPA?' },
        { label: '🌾 Shetkari Raja Project', prompt: 'Tell me about the Shetkari Raja agricultural platform and AI grain grading.' },
        { label: '📬 Contact Aditya', prompt: 'How can I contact Aditya Tayde or download his resume?' }
      ])}`;
    }

    // 18. Resume & CV Access
    if (/\b(resume|cv|pdf|download resume|view resume)\b/i.test(q)) {
      return `<strong>📄 Aditya Tayde's Resume / CV:</strong>
      <br><br>
      You can inspect or download Aditya's verified resume right here:
      <br><br>
      • <strong>Interactive Viewer:</strong> Click the <strong>"Resume"</strong> button in the navigation bar to open the full interactive resume modal.<br>
      • <strong>Key Resume Highlights:</strong> Integrated B.Tech CSE (CGPA: 8.0/10), Class X Distinction (84%), Flagship Projects (Shetkari Raja, Sanjivani AI Tool, 60FPS Canvas Scrub Engine), and official CSE Department Leadership.<br>
      • <strong>Direct Contact:</strong> Phone: <a href="tel:9403206007" style="color: #38bdf8; text-decoration: underline;">+91 9403206007</a> &bull; Email: <a href="mailto:adityatayde111@gmail.com" style="color: #38bdf8; text-decoration: underline;">adityatayde111@gmail.com</a>
      ${buildAIFollowups([
        { label: '💼 Why Hire Aditya?', prompt: 'Why should recruiters hire Aditya Tayde and what makes him stand out?' },
        { label: '⚡ Core Tech Stack', prompt: 'What are Aditya\'s core technical skills and programming languages?' },
        { label: '🌾 Shetkari Raja', prompt: 'Tell me about the Shetkari Raja agricultural platform and AI grain grading.' }
      ])}`;
    }

    // 19. Location & Relocation
    if (/\b(location|located|where (do you|does he|are you) live|where is he (based|located)|city|state|pune|mumbai|relocate|relocation|hometown|native place|address)\b/i.test(q)) {
      return `<strong>📍 Location &amp; Relocation Readiness:</strong>
      <br><br>
      • <strong>Current Location:</strong> Maharashtra, India (Enrolled at Sanjivani University).<br>
      • <strong>Relocation Flexibility:</strong> 100% open and eager to relocate for software engineering and AI internships/roles in major tech hubs including <strong>Pune</strong>, <strong>Mumbai</strong>, <strong>Bangalore</strong>, <strong>Hyderabad</strong>, <strong>Delhi NCR</strong>, or international locations.<br>
      • <strong>Remote Readiness:</strong> Fully equipped home workstation with high-speed fiber internet and proven global timezone overlap capabilities.
      ${buildAIFollowups([
        { label: '💼 Internship Availability', prompt: 'Is Aditya available for engineering roles?' },
        { label: '🌍 Remote Overlap', prompt: 'What are Aditya\'s remote collaboration capabilities and timezone overlaps?' },
        { label: '📬 Contact Info', prompt: 'How can I contact Aditya Tayde or download his resume?' }
      ])}`;
    }

    // 20. Contact, Socials & Communication Channels
    if (/\b(contact|email|phone|call|reach|whatsapp|message|social|linkedin|instagram|handle|talk)\b/i.test(q)) {
      return `<strong>📬 Direct Contact &amp; Professional Profiles:</strong>
      <br><br>
      • <strong>Phone / Direct Call:</strong> <a href="tel:9403206007" style="color: #38bdf8; text-decoration: underline; font-weight: 600;">+91 9403206007</a><br>
      • <strong>Email:</strong> <a href="mailto:adityatayde111@gmail.com" style="color: #38bdf8; text-decoration: underline; font-weight: 600;">adityatayde111@gmail.com</a><br>
      • <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/aditya-tayde-02a030383" target="_blank" style="color: #38bdf8; text-decoration: underline; font-weight: 600;">linkedin.com/in/aditya-tayde-02a030383</a><br>
      • <strong>GitHub:</strong> <a href="https://github.com/adityatayde111-lgtm" target="_blank" style="color: #38bdf8; text-decoration: underline; font-weight: 600;">@adityatayde111-lgtm (16+ Repos)</a><br>
      • <strong>Instagram:</strong> <a href="https://www.instagram.com/aditya_tayde_96?stkn=eTZla3JjN29rdWVq" target="_blank" style="color: #f472b6; text-decoration: underline; font-weight: 600;">@aditya_tayde_96</a><br>
      • <strong>Live Portfolio:</strong> <a href="https://adityatayde111-lgtm.github.io/RESUME-./" target="_blank" style="color: #38bdf8; text-decoration: underline;">adityatayde111-lgtm.github.io/RESUME-./</a>
      ${buildAIFollowups([
        { label: '💼 Why Hire Aditya?', prompt: 'Why should recruiters hire Aditya Tayde and what makes him stand out?' },
        { label: '🌾 Shetkari Raja', prompt: 'Tell me about the Shetkari Raja agricultural platform and AI grain grading.' },
        { label: '📄 Resume & CV', prompt: 'How can I contact Aditya Tayde or download his resume?' }
      ])}`;
    }

    // 21. Praise / Courtesy / Farewell
    if (/\b(thank|thanks|awesome|great|cool|nice|good job|impressive|bye|goodbye|see ya|cheers)\b/i.test(q)) {
      return `<strong>✨ You're Very Welcome!</strong>
      <br><br>
      Thank you for taking the time to explore Aditya Tayde's portfolio and engineering projects.
      <br><br>
      If you're considering him for an engineering opportunity, feel free to give him a direct call at <a href="tel:9403206007" style="color: #38bdf8; text-decoration: underline;">+91 9403206007</a> or connect on <a href="https://www.linkedin.com/in/aditya-tayde-02a030383" target="_blank" style="color: #38bdf8; text-decoration: underline;">LinkedIn</a>!
      ${buildAIFollowups([
        { label: '🌾 Shetkari Raja', prompt: 'Tell me about the Shetkari Raja agricultural platform and AI grain grading.' },
        { label: '🛡️ Sanjivani AI Gateway', prompt: 'How does Sanjivani AI Gateway and open-source Core SDK work?' },
        { label: '⚡ Core Tech Stack', prompt: 'What are Aditya\'s core technical skills and programming languages?' }
      ])}`;
    }

    // 22. Default Intelligent Portfolio Overview & Smart Fallback
    return `Aditya Tayde is a <strong>Computer Science &amp; Engineering student at Sanjivani University (CGPA: 8.0 / 10)</strong> and full-stack software engineer.
    <br><br>
    He specializes in production web systems, AI model gateways, and agritech platforms. His notable achievements include <strong>Shetkari Raja</strong> (AI grain grading and procurement tracking), <strong>Sanjivani AI Gateway</strong> (358-provider resilient routing SDK), and official leadership as CSE Department Social Media Handler &amp; Event Coordinator.
    <br><br>
    How can I assist you further? Choose a topic below:
    ${buildAIFollowups([
      { label: '💼 Why Hire Aditya?', prompt: 'Why should recruiters hire Aditya Tayde and what makes him stand out?' },
      { label: '🌾 Shetkari Raja Architecture', prompt: 'Tell me about the Shetkari Raja agricultural platform and AI grain grading.' },
      { label: '🛡️ Sanjivani AI Gateway', prompt: 'How does Sanjivani AI Gateway and open-source Core SDK work?' },
      { label: '⚡ Core Tech Stack', prompt: 'What are Aditya\'s core technical skills and programming languages?' },
      { label: '🎓 Education & CGPA', prompt: 'What is Aditya\'s academic background, college, and CGPA?' },
      { label: '📬 Contact Info', prompt: 'How can I contact Aditya Tayde or download his resume?' }
    ])}`;
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

  // Interactive GitHub Project Library Modal Controller
  function setupGitHubLibraryModal() {
    const libraryModal = document.getElementById('github-library-modal');
    const openLibraryBtn = document.getElementById('open-github-library-btn');
    const closeLibraryBtn = document.getElementById('close-library-modal-btn');
    const reposContainer = document.getElementById('library-repos-container');
    const searchInput = document.getElementById('library-search-input');
    const langFilters = document.getElementById('library-lang-filters');
    const totalCountEl = document.getElementById('library-total-count');

    if (!libraryModal || !reposContainer) return;

    // Resilient offline base dataset for Aditya's 16 public repositories
    const baseRepos = [
      {
        name: 'sanjivani-ai-tool',
        description: 'Sanjivani Ai Tool — Unified AI Gateway with 358 providers, auto-fallback, and trained security firewall',
        language: 'TypeScript',
        stars: 1,
        forks: 0,
        url: 'https://github.com/adityatayde111-lgtm/sanjivani-ai-tool'
      },
      {
        name: 'shetkari-raja',
        description: 'Comprehensive agricultural platform & mobile app with AI grain grading, queue position tracking, and DBT verification',
        language: 'TypeScript',
        stars: 1,
        forks: 0,
        url: 'https://github.com/adityatayde111-lgtm/shetkari-raja'
      },
      {
        name: 'ai-assistant-agent',
        description: 'Context-aware autonomous agent architecture with dynamic tool dispatch, persistent memory, and multi-turn intelligence',
        language: 'TypeScript',
        stars: 0,
        forks: 0,
        url: 'https://github.com/adityatayde111-lgtm/ai-assistant-agent'
      },
      {
        name: 'RESUME-.',
        description: 'Cinematic 60FPS canvas scrub engine, Web Audio ambient synthesizer, and AI Copilot engineering portfolio',
        language: 'HTML',
        stars: 0,
        forks: 0,
        url: 'https://github.com/adityatayde111-lgtm/RESUME-.'
      },
      {
        name: 'AgriSmart-Helping-Farmers-Make-Better-Decisions-with-AI',
        description: 'Predictive machine learning intelligence analyzing soil parameters, weather conditions, and crop prices',
        language: 'TypeScript',
        stars: 0,
        forks: 0,
        url: 'https://github.com/adityatayde111-lgtm/AgriSmart-Helping-Farmers-Make-Better-Decisions-with-AI'
      },
      {
        name: 'Ai-samrt-',
        description: 'Smart AI agricultural analytics algorithms and decision support models for farmers',
        language: 'TypeScript',
        stars: 1,
        forks: 0,
        url: 'https://github.com/adityatayde111-lgtm/Ai-samrt-'
      },
      {
        name: 'Agrismart',
        description: 'Precision agritech monitoring system and telemetry dashboard',
        language: 'TypeScript',
        stars: 0,
        forks: 0,
        url: 'https://github.com/adityatayde111-lgtm/Agrismart'
      },
      {
        name: 'Ai-SMART',
        description: 'Agricultural optimization platform with predictive ML decision models',
        language: 'HTML',
        stars: 0,
        forks: 0,
        url: 'https://github.com/adityatayde111-lgtm/Ai-SMART'
      },
      {
        name: 'GIT-3-QUSTION',
        description: 'Advanced Git workflows, multi-branching strategies, and version control architecture',
        language: 'TypeScript',
        stars: 0,
        forks: 0,
        url: 'https://github.com/adityatayde111-lgtm/GIT-3-QUSTION'
      },
      {
        name: 'ADP-LAB-3-1030-',
        description: 'Advanced Data Processing and algorithmic data structure implementations',
        language: 'TypeScript',
        stars: 0,
        forks: 0,
        url: 'https://github.com/adityatayde111-lgtm/ADP-LAB-3-1030-'
      },
      {
        name: 'ADP-LAB.3-1030',
        description: 'Algorithms, data structures, and computational optimization lab codebase',
        language: 'TypeScript',
        stars: 0,
        forks: 0,
        url: 'https://github.com/adityatayde111-lgtm/ADP-LAB.3-1030'
      },
      {
        name: 'Dice-roller-20',
        description: 'Python randomized statistical probability engine and distribution calculator',
        language: 'Python',
        stars: 0,
        forks: 0,
        url: 'https://github.com/adityatayde111-lgtm/Dice-roller-20'
      },
      {
        name: 'Dice-roller-2',
        description: 'Interactive dice randomization utility and probability distribution module',
        language: 'HTML',
        stars: 0,
        forks: 0,
        url: 'https://github.com/adityatayde111-lgtm/Dice-roller-2'
      },
      {
        name: 'Aditya',
        description: 'Python scripts, automation routines, and computational utilities repository',
        language: 'Python',
        stars: 0,
        forks: 0,
        url: 'https://github.com/adityatayde111-lgtm/Aditya'
      },
      {
        name: 'Ai-tool',
        description: 'Experimental AI tooling, prompt chaining, and interface prototyping',
        language: 'TypeScript',
        stars: 0,
        forks: 0,
        url: 'https://github.com/adityatayde111-lgtm/Ai-tool'
      },
      {
        name: 'spk',
        description: 'Core developer utilities and helper functions module',
        language: 'TypeScript',
        stars: 0,
        forks: 0,
        url: 'https://github.com/adityatayde111-lgtm/spk'
      }
    ];

    let allRepos = [...baseRepos];
    let currentFilterLang = 'all';
    let currentSearchTerm = '';

    function getLangDotClass(lang) {
      if (!lang) return 'other';
      const l = lang.toLowerCase();
      if (l.includes('typescript')) return 'ts';
      if (l.includes('python')) return 'py';
      if (l.includes('html')) return 'html';
      return 'other';
    }

    function renderRepos() {
      const filtered = allRepos.filter(repo => {
        const matchesLang = currentFilterLang === 'all' || 
          (repo.language && repo.language.toLowerCase() === currentFilterLang.toLowerCase()) ||
          (currentFilterLang === 'HTML' && (repo.language === 'HTML' || repo.language === 'JavaScript'));
        
        const matchesSearch = !currentSearchTerm ||
          repo.name.toLowerCase().includes(currentSearchTerm) ||
          (repo.description && repo.description.toLowerCase().includes(currentSearchTerm)) ||
          (repo.language && repo.language.toLowerCase().includes(currentSearchTerm));

        return matchesLang && matchesSearch;
      });

      if (filtered.length === 0) {
        reposContainer.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-dim); font-size: 0.9rem;">
            No repositories found matching "<strong>${escapeHtml(currentSearchTerm)}</strong>".
          </div>
        `;
        return;
      }

      reposContainer.innerHTML = filtered.map(r => `
        <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="lib-repo-card">
          <div>
            <div class="lib-repo-top">
              <span class="lib-repo-title">${escapeHtml(r.name)}</span>
              <span class="lib-stars-tag">★ ${r.stars || 0}</span>
            </div>
            <p class="lib-repo-desc">${escapeHtml(r.description || 'Open-source software project by Aditya Tayde')}</p>
          </div>
          <div class="lib-repo-meta">
            <span class="lib-lang-tag">
              <span class="lib-lang-dot ${getLangDotClass(r.language)}"></span>
              <span>${escapeHtml(r.language || 'Code')}</span>
            </span>
            <span style="color: var(--accent-cyan); font-weight: 600;">View Repo &rarr;</span>
          </div>
        </a>
      `).join('');
    }

    async function syncLiveRepos() {
      try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);
        if (res.ok) {
          const remoteRepos = await res.json();
          if (Array.isArray(remoteRepos) && remoteRepos.length > 0) {
            allRepos = remoteRepos.map(r => ({
              name: r.name,
              description: r.description || 'Open-source repository on GitHub',
              language: r.language || 'TypeScript',
              stars: r.stargazers_count || 0,
              forks: r.forks_count || 0,
              url: r.html_url
            }));
            if (totalCountEl) totalCountEl.textContent = `${allRepos.length} Repositories`;
            renderRepos();
          }
        }
      } catch (err) {
        // Fallback remains active
      }
    }

    function openLibrary() {
      libraryModal.classList.add('open');
      libraryModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      renderRepos();
      syncLiveRepos();
    }

    function closeLibrary() {
      libraryModal.classList.remove('open');
      libraryModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (openLibraryBtn) openLibraryBtn.addEventListener('click', openLibrary);
    if (closeLibraryBtn) closeLibraryBtn.addEventListener('click', closeLibrary);

    libraryModal.addEventListener('click', (e) => {
      if (e.target === libraryModal) closeLibrary();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && libraryModal.classList.contains('open')) {
        closeLibrary();
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.toLowerCase().trim();
        renderRepos();
      });
    }

    if (langFilters) {
      langFilters.addEventListener('click', (e) => {
        const pill = e.target.closest('.lib-pill');
        if (!pill) return;
        langFilters.querySelectorAll('.lib-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentFilterLang = pill.getAttribute('data-lang') || 'all';
        renderRepos();
      });
    }

    renderRepos();
  }

  // Initialization
  function init() {
    resizeCanvas();
    preloadImages();
    updateScroll();
    setupNavigationJumps();
    setupProjectFilters();
    setupGlobalCollabExplorer();
    setupGitHubLibraryModal();
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

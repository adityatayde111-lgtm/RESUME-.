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

  async function playCurrentTrack() {
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
      await bgAudio.play();
      setAudioPlaybackState(true);
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
      return `<strong>Aditya's Technical Skills &amp; Competencies:</strong>
      <br><br>
      • <strong>Programming:</strong> Python, C, C++, JavaScript<br>
      • <strong>Web &amp; UI:</strong> HTML, CSS, JavaScript, React, Tailwind CSS, 60FPS Canvas Engine<br>
      • <strong>Databases &amp; Systems:</strong> MySQL, DBMS, Linux, VS Code, Git, GitHub<br>
      • <strong>Core Disciplines:</strong> Data Structures &amp; Algorithms (DSA), Artificial Intelligence (AI), Machine Learning<br>
      • <strong>Soft Skills:</strong> Leadership, Communication, Problem Solving, Teamwork, Creativity, Event Management<br>
      <br>
      Explore his repositories on <a href="https://github.com/adityatayde111-lgtm" target="_blank" style="color: #38bdf8; text-decoration: underline;">GitHub (@adityatayde111-lgtm)</a>!`;
    }

    if (q.includes('song') || q.includes('music') || q.includes('audio') || q.includes('sound') || q.includes('track')) {
      return `<strong>🎵 Cinematic Soundtrack &amp; Music Player:</strong>
      <br><br>
      Aditya's portfolio features an integrated multi-track <strong>Cinematic Soundtrack Player</strong>:
      <br><br>
      • <strong>Track 1:</strong> <em>Inspiring Cinematic Theme</em> (Orchestral tech teaser)<br>
      • <strong>Track 2:</strong> <em>Impact Moderato Beat</em> (Epic electronic percussion)<br>
      • <strong>Track 3:</strong> <em>Ambient Synth Drone</em> (Generative 4-voice Web Audio oscillator)<br>
      • <strong>Load Your Own Song:</strong> Click <em>"Load My Song"</em> in the bottom-left music dock to play any personal MP3/WAV/OGG song from your device!<br>
      <br>
      You can toggle playback anytime using <strong>AUDIO: ON/OFF</strong> in the top navigation bar or the floating player dock at the bottom-left corner!`;
    }

    if (q.includes('cert') || q.includes('license') || q.includes('credential')) {
      return `<strong>🎓 Academic &amp; Leadership Profile:</strong>
      <br><br>
      • <strong>Degree:</strong> Integrated B.Tech in Computer Science &amp; Engineering<br>
      • <strong>Institution:</strong> Sanjivani University (Current) &bull; CGPA: <strong>8.0 / 10</strong><br>
      • <strong>High School:</strong> Class X Board Score: <strong>84%</strong> (Distinction)<br>
      • <strong>Leadership Role:</strong> Department Social Media Handler &amp; Event Coordinator, CSE Department, Sanjivani University<br>
      • <strong>Key Projects:</strong> Shetkari Raja, AI Chat Assistant, Student Management System, Portfolio Website<br>
      <br>
      Connect with Aditya on <a href="https://www.linkedin.com/in/aditya-tayde-02a030383" target="_blank" style="color: #38bdf8; text-decoration: underline;">LinkedIn</a>!`;
    }

    if (q.includes('shetkari') || q.includes('raja') || q.includes('farm') || q.includes('grain')) {
      return `<strong>🌾 Shetkari Raja (Agricultural Platform)</strong>
      <br><br>
      Shetkari Raja is a comprehensive digital agricultural platform engineered by Aditya with <strong>React</strong>, <strong>TypeScript</strong>, <strong>Capacitor Android</strong>, and <strong>Supabase</strong>.
      <br><br>
      <strong>Key Capabilities:</strong><br>
      • <strong>AI Grain Grading:</strong> Native camera capture integration for agricultural grain specimen analysis.<br>
      • <strong>Procurement Queue Tracker:</strong> Real-time queue monitoring for farmer grain procurement centers.<br>
      • <strong>DBT/PFMS Status:</strong> Direct benefit payment status tracking.<br>
      <br>
      Repository: <a href="https://github.com/adityatayde111-lgtm/shetkari-raja" target="_blank" style="color: #38bdf8; text-decoration: underline;">github.com/adityatayde111-lgtm/shetkari-raja</a>`;
    }

    if (q.includes('sanjivani') || q.includes('gateway') || q.includes('358') || q.includes('firewall')) {
      return `<strong>🛡️ Sanjivani AI Tool (Unified AI Gateway)</strong>
      <br><br>
      A high-availability AI Gateway built in TypeScript unifying <strong>358 AI model providers</strong> with automated failover and latency-based routing.
      <br><br>
      Repository: <a href="https://github.com/adityatayde111-lgtm/sanjivani-ai-tool" target="_blank" style="color: #38bdf8; text-decoration: underline;">github.com/adityatayde111-lgtm/sanjivani-ai-tool</a>`;
    }

    if (q.includes('hire') || q.includes('available') || q.includes('job') || q.includes('opportunity') || q.includes('work') || q.includes('intern')) {
      return `<strong>💼 Internship Availability &amp; Roles</strong>
      <br><br>
      Aditya is actively seeking <strong>Software Development, AI/ML, Python, and Full-Stack Engineering Internship Opportunities</strong>.
      <br><br>
      • <strong>University:</strong> Sanjivani University (Integrated B.Tech CSE, CGPA: 8.0)<br>
      • <strong>Location:</strong> Maharashtra, India &bull; Open for On-Site and Global Remote Roles<br>
      • <strong>Phone:</strong> <a href="tel:9403206007" style="color: #38bdf8; text-decoration: underline;">+91 9403206007</a><br>
      • <strong>Email:</strong> <a href="mailto:adityatayde111@gmail.com" style="color: #38bdf8; text-decoration: underline;">adityatayde111@gmail.com</a>`;
    }

    if (q.includes('linkedin') || q.includes('profile') || q.includes('connect')) {
      return `<strong>💼 Connect with Aditya on LinkedIn:</strong>
      <br><br>
      Official LinkedIn Profile:<br>
      👉 <a href="https://www.linkedin.com/in/aditya-tayde-02a030383" target="_blank" style="color: #38bdf8; text-decoration: underline; font-weight: bold;">linkedin.com/in/aditya-tayde-02a030383</a>
      <br><br>
      Integrated B.Tech CSE student at Sanjivani University passionate about Software Engineering, AI, and Full-Stack Systems!`;
    }

    if (q.includes('instagram') || q.includes('insta')) {
      return `<strong>📸 Connect with Aditya on Instagram:</strong>
      <br><br>
      Official Instagram Account:<br>
      👉 <a href="https://www.instagram.com/aditya_tayde_96?stkn=eTZla3JjN29rdWVq" target="_blank" style="color: #f472b6; text-decoration: underline; font-weight: bold;">@aditya_tayde_96 on Instagram</a>`;
    }

    if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('call') || q.includes('github') || q.includes('reach') || q.includes('social')) {
      return `<strong>📬 How to Contact Aditya Tayde:</strong>
      <br><br>
      • <strong>Phone / Call:</strong> <a href="tel:9403206007" style="color: #38bdf8; text-decoration: underline;">+91 9403206007</a><br>
      • <strong>Email:</strong> <a href="mailto:adityatayde111@gmail.com" style="color: #38bdf8; text-decoration: underline;">adityatayde111@gmail.com</a><br>
      • <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/aditya-tayde-02a030383" target="_blank" style="color: #38bdf8; text-decoration: underline;">linkedin.com/in/aditya-tayde-02a030383</a><br>
      • <strong>Instagram:</strong> <a href="https://www.instagram.com/aditya_tayde_96?stkn=eTZla3JjN29rdWVq" target="_blank" style="color: #38bdf8; text-decoration: underline;">@aditya_tayde_96</a><br>
      • <strong>GitHub:</strong> <a href="https://github.com/adityatayde111-lgtm" target="_blank" style="color: #38bdf8; text-decoration: underline;">@adityatayde111-lgtm</a><br>
      • <strong>Live Portfolio:</strong> <a href="https://resume-atm-f33c.vercel.app" target="_blank" style="color: #38bdf8; text-decoration: underline;">resume-atm-f33c.vercel.app</a>`;
    }

    if (q.includes('education') || q.includes('college') || q.includes('degree') || q.includes('study') || q.includes('university') || q.includes('cgpa')) {
      return `<strong>🎓 Academic Background:</strong>
      <br><br>
      • <strong>Integrated B.Tech in Computer Science &amp; Engineering:</strong> Sanjivani University (Current) &bull; CGPA: <strong>8.0 / 10</strong><br>
      • <strong>Class X (Secondary School Certificate):</strong> <strong>84%</strong> (Distinction)<br>
      • <strong>Leadership &amp; Coordination:</strong> Department Social Media Handler &amp; Event Coordinator for Computer Science &amp; Engineering<br>
      • <strong>Core Coursework:</strong> Python, C, C++, Data Structures &amp; Algorithms (DSA), DBMS, MySQL, Artificial Intelligence, Web Technologies`;
    }

    // Default intelligent overview
    return `Aditya Tayde is a <strong>Computer Science &amp; Engineering student at Sanjivani University (CGPA: 8.0)</strong> and software developer.
    <br><br>
    Notable projects include <strong>Shetkari Raja</strong> (agricultural platform with AI grain grading), <strong>AI Chat Assistant</strong>, <strong>Student Management System</strong>, and this interactive 60FPS portfolio.
    <br><br>
    Feel free to call him at <a href="tel:9403206007" style="color: #38bdf8; text-decoration: underline;">+91 9403206007</a> or email <a href="mailto:adityatayde111@gmail.com" style="color: #38bdf8; text-decoration: underline;">adityatayde111@gmail.com</a>!`;
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

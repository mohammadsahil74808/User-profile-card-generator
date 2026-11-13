/**
 * Profile Studio Controller
 * Handcrafted interactive experience with 3D physics tilt,
 * tag manager, real-time sync, and client-side card image export.
 */

(function () {
  'use strict';

  // Curated Human Personas
  const PRESETS = [
    {
      name: 'Elena Rostova',
      title: 'Design Technologist & Systems Architect',
      location: 'Stockholm, Sweden',
      status: 'Available for hire',
      bio: 'Bridging high-craft design and distributed engineering. Obsessed with typography-first web software, tactile micro-interactions, and accessible UI infrastructure.',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      theme: 'obsidian',
      skills: ['Design Systems', 'TypeScript', 'Next.js', 'WebGL', 'Accessibility'],
      github: 'elena-rostova',
      twitter: 'elena_design',
      linkedin: 'elenarostova',
      website: 'https://rostova.design'
    },
    {
      name: 'Marcus Chen',
      title: 'Principal Systems Architect',
      location: 'San Francisco, CA',
      status: 'Building in stealth',
      bio: 'Authoring high-throughput distributed fault-tolerant systems. Passionate about consensus protocols, low-latency memory models, and resilient microkernel design.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      theme: 'terminal',
      skills: ['Rust', 'Distributed Systems', 'Raft', 'Linux Internals', 'Go'],
      github: 'marcuschen-sys',
      twitter: 'marcus_chen',
      linkedin: 'marcus-chen-arch',
      website: 'https://marcuschen.dev'
    },
    {
      name: 'Amara Okafor',
      title: 'Creative Director & Brand Lead',
      location: 'London, UK',
      status: 'Exploring new ideas',
      bio: 'Directing kinetic brand identities, dynamic spatial storytelling, and generative motion graphics for world-class cultural institutions and tech pioneers.',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      theme: 'aurora',
      skills: ['Creative Direction', 'Brand Strategy', 'Motion Design', '3D Spatial'],
      github: 'amara-okafor',
      twitter: 'amara_creative',
      linkedin: 'amaraokafor',
      website: 'https://amaraokafor.studio'
    },
    {
      name: 'Julian Vance',
      title: 'Independent Essayist & Critic',
      location: 'Paris, France',
      status: 'Focused on Q4 ship',
      bio: 'Writing on the intersection of human philosophy, artificial agency, and aesthetic craft. Author of the weekly critical dispatch "The Tactile Web".',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      theme: 'editorial',
      skills: ['Essays', 'Design Criticism', 'Typography', 'Monographs'],
      github: 'julianvance',
      twitter: 'julian_vance',
      linkedin: 'julianvance',
      website: 'https://julianvance.org'
    }
  ];

  // DOM Elements
  const form = document.getElementById('profileForm');
  const nameInput = document.getElementById('name');
  const titleInput = document.getElementById('title');
  const locationInput = document.getElementById('location');
  const statusSelect = document.getElementById('status');
  const bioInput = document.getElementById('bio');
  const bioCharCount = document.getElementById('bioCharCount');
  const imageUrlInput = document.getElementById('imageUrl');
  const imgPreviewContainer = document.getElementById('imgPreviewContainer');
  const skillInput = document.getElementById('skillInput');
  const tagsList = document.getElementById('tagsList');
  const skillsHidden = document.getElementById('skillsHidden');
  const githubInput = document.getElementById('github');
  const twitterInput = document.getElementById('twitter');
  const linkedinInput = document.getElementById('linkedin');
  const websiteInput = document.getElementById('website');
  const submitBtn = document.getElementById('submitBtn');
  const testInvalidBtn = document.getElementById('testInvalidBtn');
  const resetBtn = document.getElementById('resetBtn');

  // Stage & Card Elements
  const cardContainer = document.getElementById('cardContainer');
  const emptyCardState = document.getElementById('emptyCardState');
  const statusBadge = document.getElementById('backendStatusBadge');
  const statusLabel = document.getElementById('backendStatusLabel');
  const modeSwitchSelect = document.getElementById('modeSelect');

  // Network Inspector Elements
  const inspectorReqUrl = document.getElementById('inspectorReqUrl');
  const inspectorReqMethod = document.getElementById('inspectorReqMethod');
  const inspectorReqBody = document.getElementById('inspectorReqBody');
  const inspectorResStatus = document.getElementById('inspectorResStatus');
  const inspectorResTime = document.getElementById('inspectorResTime');
  const inspectorResEngine = document.getElementById('inspectorResEngine');
  const inspectorResBody = document.getElementById('inspectorResBody');
  const curlCommandText = document.getElementById('curlCommandText');
  const copyCurlBtn = document.getElementById('copyCurlBtn');
  const copyJsonBtn = document.getElementById('copyJsonBtn');
  const downloadCardPngBtn = document.getElementById('downloadCardPngBtn');
  const exportCanvas = document.getElementById('exportCanvas');

  // Toast
  const toastContainer = document.getElementById('toastContainer');

  // Internal State
  let currentSkills = [];
  let currentCardData = null;
  let activeTiltCleanup = null;

  /**
   * Show notification toast
   */
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span class="toast-message">${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('toast-show'), 15);
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  /**
   * Update bio character count indicator
   */
  function updateBioCharCount() {
    const len = bioInput.value.length;
    bioCharCount.textContent = `${len}/350`;
    if (len > 350) {
      bioCharCount.classList.add('text-overflow');
    } else {
      bioCharCount.classList.remove('text-overflow');
    }
  }

  /**
   * Refresh mini avatar preview in the input form
   */
  function updateFormAvatarThumbnail() {
    const url = imageUrlInput.value.trim();
    const initials = nameInput.value.trim().slice(0, 2).toUpperCase() || 'P';

    if (!url) {
      imgPreviewContainer.innerHTML = `<span class="avatar-initials-txt">${initials}</span>`;
      return;
    }

    imgPreviewContainer.innerHTML = `
      <img src="${url}" alt="Preview" class="avatar-preview-img" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'avatar-initials-txt\\'>${initials}</span>'" />
    `;
  }

  /**
   * Skills Tag Manager
   */
  function renderSkillTags() {
    tagsList.innerHTML = '';
    currentSkills.forEach((skill, index) => {
      const pill = document.createElement('span');
      pill.className = 'tag-pill';
      pill.innerHTML = `
        <span>${skill}</span>
        <button type="button" class="tag-remove-btn" data-index="${index}" title="Remove tag">×</button>
      `;
      tagsList.appendChild(pill);
    });

    skillsHidden.value = currentSkills.join(',');

    // Attach remove handlers
    tagsList.querySelectorAll('.tag-remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        currentSkills.splice(idx, 1);
        renderSkillTags();
        triggerLiveCardUpdate();
      });
    });
  }

  function addSkillTag(tagText) {
    const clean = tagText.trim().replace(/,/g, '');
    if (!clean) return;
    if (currentSkills.length >= 6) {
      showToast('Maximum 6 skills allowed per card.', 'info');
      return;
    }
    if (!currentSkills.includes(clean)) {
      currentSkills.push(clean);
      renderSkillTags();
      triggerLiveCardUpdate();
    }
  }

  /**
   * Clear all field-level validation errors
   */
  function clearErrors() {
    document.querySelectorAll('.field-error-msg').forEach((el) => {
      el.textContent = '';
      el.classList.remove('active');
    });
    document.querySelectorAll('.input-has-error').forEach((el) => {
      el.classList.remove('input-has-error');
    });
  }

  /**
   * Display backend validation errors on inputs
   */
  function displayErrors(errors = {}) {
    clearErrors();
    Object.keys(errors).forEach((field) => {
      const inputEl = document.getElementById(field);
      const errorEl = document.getElementById(`${field}Error`);
      if (inputEl) {
        inputEl.classList.add('input-has-error');
      }
      if (errorEl) {
        errorEl.textContent = errors[field];
        errorEl.classList.add('active');
      }
    });

    const count = Object.keys(errors).length;
    showToast(`Validation failed: ${count} error${count > 1 ? 's' : ''} detected.`, 'error');
  }

  /**
   * Collect raw form values
   */
  function getFormData() {
    const selectedTheme = document.querySelector('input[name="theme"]:checked');
    return {
      name: nameInput.value.trim(),
      title: titleInput.value.trim(),
      location: locationInput.value.trim(),
      status: statusSelect.value,
      bio: bioInput.value.trim(),
      imageUrl: imageUrlInput.value.trim(),
      theme: selectedTheme ? selectedTheme.value : 'obsidian',
      skills: currentSkills,
      github: githubInput.value.trim(),
      twitter: twitterInput.value.trim(),
      linkedin: linkedinInput.value.trim(),
      website: websiteInput.value.trim()
    };
  }

  /**
   * Load Curated Persona Preset
   */
  function loadPreset(index) {
    const data = PRESETS[index];
    if (!data) return;

    nameInput.value = data.name;
    titleInput.value = data.title;
    locationInput.value = data.location;
    statusSelect.value = data.status;
    bioInput.value = data.bio;
    imageUrlInput.value = data.imageUrl;
    githubInput.value = data.github;
    twitterInput.value = data.twitter;
    linkedinInput.value = data.linkedin;
    websiteInput.value = data.website;

    currentSkills = [...data.skills];
    renderSkillTags();

    // Select theme radio
    const themeRadio = document.querySelector(`input[name="theme"][value="${data.theme}"]`);
    if (themeRadio) {
      themeRadio.checked = true;
    }

    // Update preset button active state
    document.querySelectorAll('.persona-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });

    updateBioCharCount();
    updateFormAvatarThumbnail();
    clearErrors();

    // Immediately submit to generate card
    handleFormSubmit();
  }

  /**
   * Handle form submit: Sends real HTTP POST to backend
   */
  async function handleFormSubmit(e) {
    if (e) e.preventDefault();

    clearErrors();
    const payload = getFormData();

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.querySelector('.btn-label-text').textContent = 'Processing POST Request...';

    try {
      const response = await window.ApiClient.submitProfile(payload);

      if (response.ok && response.data.success) {
        currentCardData = response.data.card;
        renderProfileCard(currentCardData);
        showToast('Profile card generated! (HTTP 200 OK)', 'success');
      } else {
        const errors = response.data.errors || {
          form: response.data.message || 'Validation error'
        };
        displayErrors(errors);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      showToast('Network error while communicating with backend.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.querySelector('.btn-label-text').textContent = 'Generate Card (POST /api/profile)';
    }
  }

  /**
   * Test Invalid POST Button: Sends deliberately broken payload
   */
  async function handleTestInvalid() {
    clearErrors();
    testInvalidBtn.disabled = true;

    try {
      showToast('Dispatching malformed POST payload to backend...', 'info');
      const response = await window.ApiClient.submitProfile({
        name: '',
        bio: 'x',
        imageUrl: 'ftp://invalid-url'
      });

      if (!response.ok && response.data.errors) {
        displayErrors(response.data.errors);
      }
    } catch (err) {
      console.error('Test invalid failed:', err);
    } finally {
      testInvalidBtn.disabled = false;
    }
  }

  /**
   * Live Instant Update (Local sync as user types)
   */
  let updateDebounce = null;
  function triggerLiveCardUpdate() {
    clearTimeout(updateDebounce);
    updateDebounce = setTimeout(() => {
      const payload = getFormData();
      if (payload.name && payload.bio && window.CardProcessor) {
        const previewResult = window.CardProcessor.processProfileData(payload, {
          processedBy: 'Live Preview Sync'
        });
        if (previewResult.success) {
          renderProfileCard(previewResult.card);
        }
      }
    }, 120);
  }

  /**
   * Render the Handcrafted Profile Card
   */
  function renderProfileCard(card) {
    emptyCardState.style.display = 'none';
    cardContainer.style.display = 'block';

    const themeClass = `theme-${card.theme || 'obsidian'}`;

    // Format skill badges
    let skillsHtml = '';
    if (card.skills && card.skills.length > 0) {
      skillsHtml = `
        <div class="skills-tags-tray">
          ${card.skills.map((s) => `<span class="skill-badge">${s}</span>`).join('')}
        </div>
      `;
    }

    // Format social icons
    let socialHtml = '';
    if (card.links.github || card.links.twitter || card.links.linkedin || card.links.website) {
      socialHtml = '<div class="social-tray">';
      if (card.links.github) {
        socialHtml += `
          <a href="${card.links.github}" target="_blank" rel="noopener noreferrer" class="social-link-icon" title="GitHub: ${card.links.githubUsername}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12z"/></svg>
          </a>
        `;
      }
      if (card.links.twitter) {
        socialHtml += `
          <a href="${card.links.twitter}" target="_blank" rel="noopener noreferrer" class="social-link-icon" title="X / Twitter: ${card.links.twitterUsername}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
        `;
      }
      if (card.links.linkedin) {
        socialHtml += `
          <a href="${card.links.linkedin}" target="_blank" rel="noopener noreferrer" class="social-link-icon" title="LinkedIn: ${card.links.linkedinUsername}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </a>
        `;
      }
      if (card.links.website) {
        socialHtml += `
          <a href="${card.links.website}" target="_blank" rel="noopener noreferrer" class="social-link-icon" title="Website: ${card.links.website}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          </a>
        `;
      }
      socialHtml += '</div>';
    }

    cardContainer.innerHTML = `
      <article class="profile-card-artifact ${themeClass}" id="renderedProfileCard" tabindex="0" aria-label="Profile card for ${card.name}">
        <!-- Specular Lighting Glare -->
        <div class="card-specular-glare"></div>

        <!-- Top Header & Banner -->
        <div class="card-top-header">
          <div class="header-dot-matrix"></div>
          <div class="card-id-tag">
            <code>${card.id}</code>
          </div>
        </div>

        <!-- Core Profile Content -->
        <div class="card-content-core">
          <!-- Avatar & Status Cluster -->
          <div class="avatar-cluster">
            <div class="avatar-main-frame">
              <img 
                src="${card.avatarUrl}" 
                alt="${card.name}" 
                class="avatar-main-img"
                onerror="this.onerror=null; this.src='${card.fallbackAvatarUrl}';"
              />
            </div>

            <div class="status-availability-pill">
              <span class="status-live-dot"></span>
              <span>${card.statusText || 'Available for hire'}</span>
            </div>
          </div>

          <!-- Identity Row -->
          <div class="person-identity-group">
            <h2 class="person-name">${card.name}</h2>
            <p class="person-headline">${card.title}</p>
            <div class="person-subline">
              <span class="person-handle">${card.handle}</span>
              <span>•</span>
              <span class="person-location">${card.location || 'Remote'}</span>
            </div>
          </div>

          <!-- Narrative Bio -->
          <p class="person-bio">${card.bio}</p>

          <!-- Skills Tray -->
          ${skillsHtml}

          <!-- Social Links Tray -->
          ${socialHtml}
        </div>
      </article>
    `;

    // Rebind 3D Perspective Physics
    initCard3DTilt();
  }

  /**
   * 3D Perspective Tilt Physics on Card
   */
  function initCard3DTilt() {
    if (activeTiltCleanup) {
      activeTiltCleanup();
      activeTiltCleanup = null;
    }

    const card = document.getElementById('renderedProfileCard');
    if (!card) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation angles (max 12 deg tilt)
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    activeTiltCleanup = () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }

  /**
   * Download Profile Card as a High-Resolution PNG Image
   */
  function exportCardToPng() {
    if (!currentCardData) {
      showToast('Generate a card first before exporting.', 'info');
      return;
    }

    const card = currentCardData;
    const canvas = exportCanvas;
    const ctx = canvas.getContext('2d');

    // High-resolution canvas size (1200 x 1400)
    canvas.width = 1200;
    canvas.height = 1400;

    // Draw background
    const isEditorial = card.theme === 'editorial';
    const isTerminal = card.theme === 'terminal';
    const isAurora = card.theme === 'aurora';

    ctx.fillStyle = isEditorial ? '#fbfaf7' : isTerminal ? '#090c09' : isAurora ? '#0c0f1f' : '#101217';
    ctx.fillRect(0, 0, 1200, 1400);

    // Banner gradient
    const bannerGrad = ctx.createLinearGradient(0, 0, 1200, 320);
    if (isAurora) {
      bannerGrad.addColorStop(0, '#f43f5e');
      bannerGrad.addColorStop(0.5, '#ec4899');
      bannerGrad.addColorStop(1, '#8b5cf6');
    } else if (isEditorial) {
      bannerGrad.addColorStop(0, '#f1ede4');
      bannerGrad.addColorStop(1, '#dfdad0');
    } else if (isTerminal) {
      bannerGrad.addColorStop(0, '#0d140d');
      bannerGrad.addColorStop(1, '#04190c');
    } else {
      bannerGrad.addColorStop(0, '#1f242e');
      bannerGrad.addColorStop(1, '#111318');
    }
    ctx.fillStyle = bannerGrad;
    ctx.fillRect(0, 0, 1200, 320);

    // Card ID watermark
    ctx.font = '600 28px monospace';
    ctx.fillStyle = isEditorial ? '#78716c' : '#9ca3af';
    ctx.textAlign = 'right';
    ctx.fillText(card.id, 1120, 60);

    // Draw Name
    ctx.textAlign = 'left';
    ctx.font = isEditorial ? 'italic 700 72px Georgia, serif' : '800 68px system-ui, sans-serif';
    ctx.fillStyle = isEditorial ? '#1c1917' : isTerminal ? '#a7f3d0' : '#ffffff';
    ctx.fillText(card.name, 80, 520);

    // Draw Title
    ctx.font = '600 36px system-ui, sans-serif';
    ctx.fillStyle = isEditorial ? '#57534e' : '#9ca3af';
    ctx.fillText(card.title, 80, 580);

    // Draw Handle & Location
    ctx.font = '500 30px monospace';
    ctx.fillStyle = isTerminal ? '#34d399' : '#38bdf8';
    ctx.fillText(`${card.handle} • ${card.location || 'Global'}`, 80, 630);

    // Draw Bio (Word-wrapped)
    ctx.font = isEditorial ? '400 36px Georgia, serif' : '400 34px system-ui, sans-serif';
    ctx.fillStyle = isEditorial ? '#292524' : '#e2e8f0';

    const words = card.rawBio.split(' ');
    let line = '';
    let y = 730;
    const maxWidth = 1040;
    const lineHeight = 54;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, 80, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 80, y);

    // Draw Skills
    if (card.skills && card.skills.length > 0) {
      y += 80;
      let skillX = 80;
      card.skills.forEach((skill) => {
        ctx.font = '600 24px system-ui, sans-serif';
        const tagWidth = ctx.measureText(skill).width + 36;
        
        ctx.fillStyle = isEditorial ? '#ece8df' : 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.roundRect(skillX, y, tagWidth, 44, 22);
        ctx.fill();

        ctx.fillStyle = isEditorial ? '#1c1917' : '#ffffff';
        ctx.fillText(skill, skillX + 18, y + 30);
        skillX += tagWidth + 14;
      });
    }

    // Draw Footer Brand
    ctx.font = '500 24px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Generated via Profile Studio • POST /api/profile', 80, 1330);

    // Load and render avatar image onto canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(180, 320, 100, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 80, 220, 200, 200);
      ctx.restore();

      // Trigger download
      const link = document.createElement('a');
      link.download = `${card.name.toLowerCase().replace(/\s+/g, '-')}-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Profile card downloaded as PNG image!', 'success');
    };
    img.onerror = () => {
      // If CORS or image load fails, download without external image
      const link = document.createElement('a');
      link.download = `${card.name.toLowerCase().replace(/\s+/g, '-')}-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Profile card exported to PNG!', 'success');
    };
    img.src = card.avatarUrl;
  }

  /**
   * Update Network Inspector view when an HTTP POST event occurs
   */
  function handleNetworkEvent(evt) {
    inspectorReqMethod.textContent = evt.request.method;
    inspectorReqUrl.textContent = evt.request.url;
    inspectorReqBody.textContent = JSON.stringify(evt.request.body, null, 2);

    const isOk = evt.response.status === 200;
    inspectorResStatus.textContent = evt.response.statusText;
    inspectorResStatus.className = `metric-pill ${isOk ? 'status-pill-success' : 'status-pill-error'}`;

    inspectorResTime.textContent = `~${evt.response.elapsedMs} ms`;
    inspectorResEngine.textContent = evt.engine;
    inspectorResBody.textContent = JSON.stringify(evt.response.body, null, 2);

    const origin = window.location.origin || 'http://localhost:3000';
    const curlCommand = `curl -X POST "${origin}/api/profile" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(evt.request.body)}'`;
    curlCommandText.textContent = curlCommand;
  }

  /**
   * Initialize Backend Connection and Status
   */
  async function initBackendStatus() {
    statusBadge.className = 'status-pulse-dot dot-detecting';
    statusLabel.textContent = 'Detecting backend...';

    const info = await window.ApiClient.detectBackend();

    if (info.mode === 'express') {
      statusBadge.className = 'status-pulse-dot dot-express';
      statusLabel.textContent = 'Node.js Express (Live)';
      modeSwitchSelect.value = 'express';
    } else {
      statusBadge.className = 'status-pulse-dot dot-worker';
      statusLabel.textContent = 'GitHub Pages Worker';
      modeSwitchSelect.value = 'worker';
    }
  }

  /**
   * Setup All Interactive Event Listeners
   */
  function setupEventListeners() {
    form.addEventListener('submit', handleFormSubmit);
    testInvalidBtn.addEventListener('click', handleTestInvalid);

    // Reset button
    resetBtn.addEventListener('click', () => {
      form.reset();
      currentSkills = [];
      renderSkillTags();
      updateBioCharCount();
      updateFormAvatarThumbnail();
      clearErrors();
      showToast('Form cleared.', 'info');
    });

    // Real-time live sync listeners
    bioInput.addEventListener('input', () => {
      updateBioCharCount();
      triggerLiveCardUpdate();
    });

    nameInput.addEventListener('input', () => {
      updateFormAvatarThumbnail();
      triggerLiveCardUpdate();
    });

    titleInput.addEventListener('input', triggerLiveCardUpdate);
    locationInput.addEventListener('input', triggerLiveCardUpdate);
    statusSelect.addEventListener('change', triggerLiveCardUpdate);
    imageUrlInput.addEventListener('input', () => {
      updateFormAvatarThumbnail();
      triggerLiveCardUpdate();
    });

    githubInput.addEventListener('input', triggerLiveCardUpdate);
    twitterInput.addEventListener('input', triggerLiveCardUpdate);
    linkedinInput.addEventListener('input', triggerLiveCardUpdate);
    websiteInput.addEventListener('input', triggerLiveCardUpdate);

    // Theme radio changes
    document.querySelectorAll('input[name="theme"]').forEach((radio) => {
      radio.addEventListener('change', triggerLiveCardUpdate);
    });

    // Presets
    document.querySelectorAll('.persona-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-preset'), 10);
        loadPreset(index);
      });
    });

    // Curated gallery picker
    document.querySelectorAll('.avatar-pick-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const url = e.currentTarget.getAttribute('data-url');
        imageUrlInput.value = url;
        updateFormAvatarThumbnail();
        triggerLiveCardUpdate();
        showToast(url ? 'Curated avatar selected.' : 'Switched to initials avatar.', 'info');
      });
    });

    // Tag manager: Enter or comma keypress
    skillInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addSkillTag(skillInput.value);
        skillInput.value = '';
      }
    });

    // Suggested tag chips
    document.querySelectorAll('.suggest-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const tag = e.currentTarget.getAttribute('data-tag');
        addSkillTag(tag);
      });
    });

    // Mode select toggle
    modeSwitchSelect.addEventListener('change', (e) => {
      const newMode = e.target.value;
      window.ApiClient.setMode(newMode);
      if (newMode === 'express') {
        statusBadge.className = 'status-pulse-dot dot-express';
        statusLabel.textContent = 'Node.js Express (Live)';
        showToast('Switched to Live Express mode', 'info');
      } else {
        statusBadge.className = 'status-pulse-dot dot-worker';
        statusLabel.textContent = 'GitHub Pages Worker';
        showToast('Switched to GitHub Pages Worker mode', 'info');
      }
    });

    // Stage Tab Switcher
    document.querySelectorAll('.stage-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.stage-tab-btn').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.stage-pane').forEach((p) => p.classList.remove('active'));

        e.currentTarget.classList.add('active');
        const targetId = e.currentTarget.getAttribute('data-target');
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    // Copy cURL Button
    copyCurlBtn.addEventListener('click', () => {
      const curl = curlCommandText.textContent;
      navigator.clipboard.writeText(curl);
      showToast('cURL command copied to clipboard!', 'success');
    });

    // Copy JSON Button
    copyJsonBtn.addEventListener('click', () => {
      if (currentCardData) {
        navigator.clipboard.writeText(JSON.stringify(currentCardData, null, 2));
        showToast('Profile Card JSON copied to clipboard!', 'success');
      }
    });

    // Download PNG Button
    downloadCardPngBtn.addEventListener('click', exportCardToPng);

    // Subscribe to API client network telemetry
    window.ApiClient.onNetworkEvent(handleNetworkEvent);
  }

  // Self Initialization on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateBioCharCount();
    updateFormAvatarThumbnail();
    initBackendStatus();

    // Auto-load Elena Rostova by default
    loadPreset(0);
  });
})();

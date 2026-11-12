/**
 * Application Controller
 * Handles user interactions, preset loading, form submission,
 * card rendering, and network inspector updates.
 */

(function () {
  'use strict';

  // Sample Presets for quick evaluation
  const PRESETS = [
    {
      name: 'Sarah Connor',
      title: 'Lead Cybernetics Architect',
      bio: 'Pioneering resilient distributed systems, autonomous robotics, and fault-tolerant architecture. Passionate about machine learning ethics and high-concurrency microservices.',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      theme: 'emerald',
      github: 'sarah-connor',
      twitter: 'sconnor_dev',
      website: 'https://cyberresilience.io'
    },
    {
      name: 'Alex Rivera',
      title: 'Staff Product & Systems Designer',
      bio: 'Crafting high-density developer tools, design token architectures, and accessible design systems. Believer in typography-first interfaces and surgical UI restraint.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      theme: 'indigo',
      github: 'arivera-design',
      twitter: 'alexrivera',
      website: 'https://alexrivera.design'
    },
    {
      name: 'Dr. Priya Sharma',
      title: 'AI Research Scientist & Fellow',
      bio: 'Investigating neural algorithmic reasoning, multimodal graph foundation models, and verifiable agent inference. Open-source maintainer and conference speaker.',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      theme: 'rose',
      github: 'priyasharma-ai',
      twitter: 'priyasharma_ml',
      website: 'https://priyasharma.academic'
    }
  ];

  // DOM Elements
  const form = document.getElementById('profileForm');
  const nameInput = document.getElementById('name');
  const titleInput = document.getElementById('title');
  const bioInput = document.getElementById('bio');
  const bioCharCount = document.getElementById('bioCharCount');
  const imageUrlInput = document.getElementById('imageUrl');
  const imgPreviewContainer = document.getElementById('imgPreviewContainer');
  const githubInput = document.getElementById('github');
  const twitterInput = document.getElementById('twitter');
  const websiteInput = document.getElementById('website');
  const submitBtn = document.getElementById('submitBtn');
  const testInvalidBtn = document.getElementById('testInvalidBtn');
  const resetBtn = document.getElementById('resetBtn');

  // Preview elements
  const emptyState = document.getElementById('emptyCardState');
  const cardContainer = document.getElementById('cardContainer');
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

  // Notification Toast
  const toastContainer = document.getElementById('toastContainer');

  let currentCardData = null;

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

    setTimeout(() => {
      toast.classList.add('toast-show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /**
   * Update bio character count
   */
  function updateBioCharCount() {
    const len = bioInput.value.length;
    bioCharCount.textContent = `${len}/350`;
    if (len > 350) {
      bioCharCount.classList.add('text-error');
    } else {
      bioCharCount.classList.remove('text-error');
    }
  }

  /**
   * Update live image preview thumbnail
   */
  function updateImagePreview() {
    const url = imageUrlInput.value.trim();
    if (!url) {
      imgPreviewContainer.innerHTML = `
        <div class="avatar-placeholder" title="No URL provided: initials fallback will be auto-generated">
          <span>Initials</span>
        </div>
      `;
      return;
    }

    imgPreviewContainer.innerHTML = `
      <img src="${url}" alt="Preview" class="avatar-thumbnail" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'avatar-placeholder error\\'>Failed</div>'" />
    `;
  }

  /**
   * Clear all field-level validation errors
   */
  function clearErrors() {
    document.querySelectorAll('.field-error').forEach((el) => {
      el.textContent = '';
      el.classList.remove('active');
    });
    document.querySelectorAll('.input-error').forEach((el) => {
      el.classList.remove('input-error');
    });
  }

  /**
   * Highlight field-level errors returned by the backend
   */
  function displayErrors(errors = {}) {
    clearErrors();
    Object.keys(errors).forEach((field) => {
      const inputEl = document.getElementById(field);
      const errorEl = document.getElementById(`${field}Error`);
      if (inputEl) {
        inputEl.classList.add('input-error');
      }
      if (errorEl) {
        errorEl.textContent = errors[field];
        errorEl.classList.add('active');
      }
    });

    // Announce error for screen readers
    const errorCount = Object.keys(errors).length;
    showToast(`Form submission failed: ${errorCount} error${errorCount > 1 ? 's' : ''} detected.`, 'error');
  }

  /**
   * Fill form with preset data
   */
  function loadPreset(index) {
    const data = PRESETS[index];
    if (!data) return;

    nameInput.value = data.name;
    titleInput.value = data.title;
    bioInput.value = data.bio;
    imageUrlInput.value = data.imageUrl;
    githubInput.value = data.github;
    twitterInput.value = data.twitter;
    websiteInput.value = data.website;

    // Check theme radio
    const themeRadio = document.querySelector(`input[name="theme"][value="${data.theme}"]`);
    if (themeRadio) {
      themeRadio.checked = true;
    }

    updateBioCharCount();
    updateImagePreview();
    clearErrors();
    showToast(`Loaded preset for ${data.name}`, 'info');

    // Auto-generate card on preset load
    handleFormSubmit();
  }

  /**
   * Extract form data as JSON object
   */
  function getFormData() {
    const selectedTheme = document.querySelector('input[name="theme"]:checked');
    return {
      name: nameInput.value.trim(),
      title: titleInput.value.trim(),
      bio: bioInput.value.trim(),
      imageUrl: imageUrlInput.value.trim(),
      theme: selectedTheme ? selectedTheme.value : 'slate',
      github: githubInput.value.trim(),
      twitter: twitterInput.value.trim(),
      website: websiteInput.value.trim()
    };
  }

  /**
   * Handle form submission to POST /api/profile
   */
  async function handleFormSubmit(e) {
    if (e) e.preventDefault();

    clearErrors();
    const payload = getFormData();

    // Set loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');
    submitBtn.querySelector('.btn-text').textContent = 'Processing POST Request...';

    try {
      const response = await window.ApiClient.submitProfile(payload);

      if (response.ok && response.data.success) {
        currentCardData = response.data.card;
        renderProfileCard(currentCardData);
        showToast('Profile card generated successfully! (HTTP 200 OK)', 'success');
      } else {
        const errors = response.data.errors || {
          form: response.data.message || 'Validation error'
        };
        displayErrors(errors);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      showToast('Network error while processing request.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn-loading');
      submitBtn.querySelector('.btn-text').textContent = 'Generate Profile Card (POST /api/profile)';
    }
  }

  /**
   * Test Invalid POST (sends empty payload to verify 400 Bad Request handling)
   */
  async function handleTestInvalid() {
    clearErrors();
    testInvalidBtn.disabled = true;

    try {
      showToast('Sending invalid POST payload to test backend validation...', 'info');
      const response = await window.ApiClient.submitProfile({
        name: '',
        bio: 'x',
        imageUrl: 'not-valid-url'
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
   * Render the formatted profile card in UI
   */
  function renderProfileCard(card) {
    emptyState.style.display = 'none';
    cardContainer.style.display = 'block';

    const themeClass = `card-theme-${card.theme || 'slate'}`;

    let socialLinksHtml = '';
    if (card.links.github) {
      socialLinksHtml += `
        <a href="${card.links.github}" target="_blank" rel="noopener noreferrer" class="social-chip" title="GitHub: ${card.links.githubUsername}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          <span>${card.links.githubUsername}</span>
        </a>
      `;
    }
    if (card.links.twitter) {
      socialLinksHtml += `
        <a href="${card.links.twitter}" target="_blank" rel="noopener noreferrer" class="social-chip" title="X / Twitter: ${card.links.twitterUsername}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          <span>${card.links.twitterUsername}</span>
        </a>
      `;
    }
    if (card.links.website) {
      socialLinksHtml += `
        <a href="${card.links.website}" target="_blank" rel="noopener noreferrer" class="social-chip" title="Website: ${card.links.website}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          <span>Website</span>
        </a>
      `;
    }

    cardContainer.innerHTML = `
      <div class="profile-card ${themeClass}" id="renderedProfileCard" tabindex="0" aria-label="Generated profile card for ${card.name}">
        <!-- Top Card Accent Header -->
        <div class="card-banner">
          <div class="banner-grid-pattern"></div>
          <div class="card-id-tag">
            <span class="pulse-dot"></span>
            <code>${card.id}</code>
          </div>
        </div>

        <div class="card-body">
          <!-- Avatar Section -->
          <div class="card-avatar-wrap">
            <img 
              src="${card.avatarUrl}" 
              alt="${card.name}'s avatar" 
              class="card-avatar-img"
              onerror="this.onerror=null; this.src='${card.fallbackAvatarUrl}';"
            />
            <span class="avatar-status-badge" title="Active Contributor"></span>
          </div>

          <!-- User Identity -->
          <div class="card-identity">
            <div class="card-name-row">
              <h2 class="card-name">${card.name}</h2>
              <span class="verified-pill" title="Verified Data Submission">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                <span>Verified</span>
              </span>
            </div>
            <div class="card-meta-row">
              <span class="card-handle">${card.handle}</span>
              <span class="dot-separator">•</span>
              <span class="card-title">${card.title}</span>
            </div>
          </div>

          <!-- Bio Content -->
          <div class="card-bio-section">
            <p class="card-bio">${card.bio}</p>
          </div>

          <!-- Computed Stats Matrix -->
          <div class="card-stats-grid">
            <div class="stat-cell">
              <span class="stat-value">${card.stats.wordCount}</span>
              <span class="stat-label">Words</span>
            </div>
            <div class="stat-cell">
              <span class="stat-value">${card.stats.characterCount}</span>
              <span class="stat-label">Chars</span>
            </div>
            <div class="stat-cell">
              <span class="stat-value">${card.stats.readTimeMinutes}m</span>
              <span class="stat-label">Read Time</span>
            </div>
          </div>

          <!-- Social Links -->
          ${socialLinksHtml ? `<div class="card-social-links">${socialLinksHtml}</div>` : ''}

          <!-- Footer Metadata -->
          <div class="card-footer">
            <div class="footer-meta-item">
              <span class="meta-label">Generated:</span>
              <span class="meta-val">${card.metadata.formattedDate}</span>
            </div>
            <div class="footer-meta-item">
              <span class="meta-label">Engine:</span>
              <span class="meta-val engine-tag">${card.metadata.processedBy}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Action Toolbar -->
      <div class="card-actions-toolbar">
        <button type="button" class="tool-btn" id="copyJsonBtn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
          <span>Copy JSON</span>
        </button>
        <button type="button" class="tool-btn" id="printCardBtn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          <span>Print / Save PDF</span>
        </button>
      </div>
    `;

    // Attach card toolbar events
    document.getElementById('copyJsonBtn').addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(card, null, 2));
      showToast('Card JSON copied to clipboard!', 'success');
    });

    document.getElementById('printCardBtn').addEventListener('click', () => {
      window.print();
    });
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
    inspectorResStatus.className = `status-pill ${isOk ? 'status-ok' : 'status-err'}`;

    inspectorResTime.textContent = `${evt.response.elapsedMs} ms`;
    inspectorResEngine.textContent = evt.engine;
    inspectorResBody.textContent = JSON.stringify(evt.response.body, null, 2);

    // Update curl snippet
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
    statusBadge.className = 'status-dot dot-detecting';
    statusLabel.textContent = 'Detecting backend...';

    const info = await window.ApiClient.detectBackend();

    if (info.mode === 'express') {
      statusBadge.className = 'status-dot dot-express';
      statusLabel.textContent = 'Node.js Express Server (Live)';
      modeSwitchSelect.value = 'express';
    } else {
      statusBadge.className = 'status-dot dot-worker';
      statusLabel.textContent = 'GitHub Pages Worker Engine (Static)';
      modeSwitchSelect.value = 'worker';
    }
  }

  /**
   * Attach all event listeners
   */
  function setupEventListeners() {
    form.addEventListener('submit', handleFormSubmit);
    testInvalidBtn.addEventListener('click', handleTestInvalid);

    resetBtn.addEventListener('click', () => {
      form.reset();
      updateBioCharCount();
      updateImagePreview();
      clearErrors();
      emptyState.style.display = 'flex';
      cardContainer.style.display = 'none';
      showToast('Form cleared.', 'info');
    });

    bioInput.addEventListener('input', updateBioCharCount);
    imageUrlInput.addEventListener('input', updateImagePreview);

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-preset'), 10);
        loadPreset(index);
      });
    });

    // Theme radio change -> re-generate preview if active
    document.querySelectorAll('input[name="theme"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        if (currentCardData) {
          handleFormSubmit();
        }
      });
    });

    // Mode select toggle
    modeSwitchSelect.addEventListener('change', (e) => {
      const newMode = e.target.value;
      window.ApiClient.setMode(newMode);
      if (newMode === 'express') {
        statusBadge.className = 'status-dot dot-express';
        statusLabel.textContent = 'Node.js Express Server (Live)';
        showToast('Switched to Live Express Backend mode', 'info');
      } else {
        statusBadge.className = 'status-dot dot-worker';
        statusLabel.textContent = 'GitHub Pages Worker Engine';
        showToast('Switched to GitHub Pages Mock Worker mode', 'info');
      }
    });

    // Copy curl button
    copyCurlBtn.addEventListener('click', () => {
      const curl = curlCommandText.textContent;
      navigator.clipboard.writeText(curl);
      showToast('cURL command copied to clipboard!', 'success');
    });

    // Network Inspector tabs
    document.querySelectorAll('.inspector-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.inspector-tab-btn').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.inspector-tab-pane').forEach((p) => p.classList.remove('active'));

        e.currentTarget.classList.add('active');
        const targetId = e.currentTarget.getAttribute('data-target');
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    // Subscribe to API client network telemetry
    window.ApiClient.onNetworkEvent(handleNetworkEvent);
  }

  // Self-initialization
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateBioCharCount();
    updateImagePreview();
    initBackendStatus();

    // Auto-load preset 0 initially to present an immediate rich view
    loadPreset(0);
  });
})();

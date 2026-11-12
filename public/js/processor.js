/**
 * Core Profile Card Data Processor
 * Shared validation, sanitization, and formatting engine.
 * Compatible with Node.js CommonJS and Browser environments.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node.js CommonJS
    module.exports = factory();
  } else {
    // Browser global
    root.CardProcessor = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ALLOWED_THEMES = ['slate', 'emerald', 'indigo', 'amber', 'rose', 'cyan'];

  const THEME_GRADIENTS = {
    slate: { from: '#334155', to: '#0f172a', accent: '#38bdf8' },
    emerald: { from: '#065f46', to: '#022c22', accent: '#34d399' },
    indigo: { from: '#3730a3', to: '#1e1b4b', accent: '#818cf8' },
    amber: { from: '#92400e', to: '#451a03', accent: '#fbbf24' },
    rose: { from: '#9f1239', to: '#4c0519', accent: '#fb7185' },
    cyan: { from: '#155e75', to: '#083344', accent: '#22d3ee' }
  };

  /**
   * Escape HTML entities to prevent XSS injection
   */
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Generate 1-2 uppercase initials from a name
   */
  function generateInitials(name) {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * Generate an SVG Data URI avatar based on initials and theme
   */
  function generateAvatarSvg(name, theme = 'slate') {
    const initials = escapeHtml(generateInitials(name));
    const themeColors = THEME_GRADIENTS[theme] || THEME_GRADIENTS.slate;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <defs>
        <linearGradient id="g_${theme}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${themeColors.from}" />
          <stop offset="100%" stop-color="${themeColors.to}" />
        </linearGradient>
        <radialGradient id="ring_${theme}" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stop-color="transparent" />
          <stop offset="100%" stop-color="${themeColors.accent}" stop-opacity="0.3" />
        </radialGradient>
      </defs>
      <rect width="160" height="160" rx="80" fill="url(#g_${theme})" />
      <circle cx="80" cy="80" r="76" fill="url(#ring_${theme})" stroke="${themeColors.accent}" stroke-width="2" stroke-opacity="0.4" />
      <text x="50%" y="54%" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="54" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="1.5">
        ${initials}
      </text>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  /**
   * Generate unique card identifier
   */
  function generateCardId() {
    const timestamp = Date.now().toString(16).slice(-4);
    const rand = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    return `usr_${timestamp}${rand}`;
  }

  /**
   * Check if a string is a valid HTTP or HTTPS URL
   */
  function isValidUrl(urlString) {
    if (!urlString || typeof urlString !== 'string') return false;
    const trimmed = urlString.trim();
    if (!trimmed) return false;
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  /**
   * Clean and normalize a social handle or URL
   */
  function sanitizeHandle(handle) {
    if (!handle || typeof handle !== 'string') return '';
    return handle.trim().replace(/^@+/, '').replace(/[^a-zA-Z0-9_.-]/g, '');
  }

  /**
   * Format date into readable standard (e.g., Nov 12, 2026)
   */
  function formatReadableDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return 'Recently';
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  /**
   * Main function: Validate raw input and generate formatted profile card
   */
  function processProfileData(rawData = {}, options = {}) {
    const errors = {};
    const processedBy = options.processedBy || 'Node.js Express Engine';

    // 1. Validate Name
    const rawName = typeof rawData.name === 'string' ? rawData.name.trim() : '';
    if (!rawName) {
      errors.name = 'Full name is required.';
    } else if (rawName.length < 2) {
      errors.name = 'Name must be at least 2 characters long.';
    } else if (rawName.length > 50) {
      errors.name = 'Name cannot exceed 50 characters.';
    }

    // 2. Validate Bio
    const rawBio = typeof rawData.bio === 'string' ? rawData.bio.trim() : '';
    if (!rawBio) {
      errors.bio = 'Bio description is required.';
    } else if (rawBio.length < 5) {
      errors.bio = 'Bio must be at least 5 characters long.';
    } else if (rawBio.length > 350) {
      errors.bio = 'Bio cannot exceed 350 characters.';
    }

    // 3. Validate & Normalize Image URL
    const rawImageUrl = typeof rawData.imageUrl === 'string' ? rawData.imageUrl.trim() : '';
    let hasCustomImage = false;
    let validatedImageUrl = '';

    if (rawImageUrl) {
      if (!isValidUrl(rawImageUrl)) {
        errors.imageUrl = 'Image URL must be a valid HTTP or HTTPS address (or leave blank for generated avatar).';
      } else {
        hasCustomImage = true;
        validatedImageUrl = rawImageUrl;
      }
    }

    // 4. Validate Theme
    const rawTheme = typeof rawData.theme === 'string' ? rawData.theme.toLowerCase().trim() : 'slate';
    const theme = ALLOWED_THEMES.includes(rawTheme) ? rawTheme : 'slate';

    // Return early if validation fails
    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        status: 400,
        error: 'Validation Error',
        message: 'The submitted profile data contains validation errors.',
        errors: errors
      };
    }

    // 5. Title / Headline (optional, with fallback)
    const rawTitle = typeof rawData.title === 'string' ? rawData.title.trim() : '';
    const title = rawTitle ? escapeHtml(rawTitle.slice(0, 60)) : 'Member & Contributor';

    // 6. Generate handle from name
    const cleanSlug = rawName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20);
    const handle = `@${cleanSlug || 'user'}`;

    // 7. Sanitized bio & stats
    const sanitizedBio = escapeHtml(rawBio);
    const words = rawBio.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = rawBio.length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

    // 8. Social Links
    const rawGithub = sanitizeHandle(rawData.github);
    const rawTwitter = sanitizeHandle(rawData.twitter);
    let rawWebsite = typeof rawData.website === 'string' ? rawData.website.trim() : '';
    if (rawWebsite && !rawWebsite.startsWith('http://') && !rawWebsite.startsWith('https://')) {
      rawWebsite = 'https://' + rawWebsite;
    }
    const websiteValid = isValidUrl(rawWebsite);

    const links = {
      github: rawGithub ? `https://github.com/${rawGithub}` : null,
      githubUsername: rawGithub || null,
      twitter: rawTwitter ? `https://x.com/${rawTwitter}` : null,
      twitterUsername: rawTwitter || null,
      website: websiteValid ? rawWebsite : null
    };

    // 9. Generate SVG Fallback Avatar
    const fallbackAvatar = generateAvatarSvg(rawName, theme);
    const primaryAvatar = hasCustomImage ? validatedImageUrl : fallbackAvatar;

    // 10. Creation metadata
    const now = new Date();
    const cardId = generateCardId();

    const formattedCard = {
      id: cardId,
      name: escapeHtml(rawName),
      handle: handle,
      title: title,
      bio: sanitizedBio,
      rawBio: rawBio,
      avatarUrl: primaryAvatar,
      fallbackAvatarUrl: fallbackAvatar,
      hasCustomAvatar: hasCustomImage,
      theme: theme,
      links: links,
      stats: {
        wordCount: wordCount,
        characterCount: charCount,
        readTimeMinutes: readTimeMinutes
      },
      metadata: {
        createdAt: now.toISOString(),
        formattedDate: formatReadableDate(now),
        badge: 'Verified Card',
        processedBy: processedBy
      }
    };

    return {
      success: true,
      status: 200,
      message: 'Profile card processed and generated successfully.',
      card: formattedCard
    };
  }

  return {
    processProfileData: processProfileData,
    generateAvatarSvg: generateAvatarSvg,
    generateInitials: generateInitials,
    escapeHtml: escapeHtml,
    isValidUrl: isValidUrl,
    ALLOWED_THEMES: ALLOWED_THEMES
  };
});

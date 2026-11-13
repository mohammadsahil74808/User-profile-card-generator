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

  const ALLOWED_THEMES = ['obsidian', 'editorial', 'aurora', 'terminal', 'slate', 'emerald', 'indigo', 'amber', 'rose', 'cyan'];

  const THEME_PALETTES = {
    obsidian: {
      bg: '#111318',
      surface: '#181b22',
      border: '#282d38',
      accent: '#22c55e',
      text: '#f3f4f6',
      subtext: '#9ca3af',
      gradientFrom: '#1f242e',
      gradientTo: '#111318'
    },
    editorial: {
      bg: '#fbfaf8',
      surface: '#ffffff',
      border: '#e7e5e0',
      accent: '#0f172a',
      text: '#1c1917',
      subtext: '#78716c',
      gradientFrom: '#e7e5e0',
      gradientTo: '#f5f4ef'
    },
    aurora: {
      bg: '#0c0f1d',
      surface: '#14182e',
      border: '#282f54',
      accent: '#ec4899',
      text: '#f8fafc',
      subtext: '#94a3b8',
      gradientFrom: '#f43f5e',
      gradientTo: '#8b5cf6'
    },
    terminal: {
      bg: '#0a0d0a',
      surface: '#111711',
      border: '#1f2e1f',
      accent: '#10b981',
      text: '#d1fae5',
      subtext: '#6ee7b7',
      gradientFrom: '#064e3b',
      gradientTo: '#022c22'
    },
    // Backwards compatibility for previous themes
    slate: {
      bg: '#0f172a',
      surface: '#1e293b',
      border: '#334155',
      accent: '#38bdf8',
      text: '#f8fafc',
      subtext: '#94a3b8',
      gradientFrom: '#334155',
      gradientTo: '#0f172a'
    },
    emerald: {
      bg: '#064e3b',
      surface: '#065f46',
      border: '#047857',
      accent: '#34d399',
      text: '#ecfdf5',
      subtext: '#a7f3d0',
      gradientFrom: '#065f46',
      gradientTo: '#022c22'
    },
    indigo: {
      bg: '#1e1b4b',
      surface: '#312e81',
      border: '#4338ca',
      accent: '#818cf8',
      text: '#eef2ff',
      subtext: '#c7d2fe',
      gradientFrom: '#3730a3',
      gradientTo: '#1e1b4b'
    },
    amber: {
      bg: '#451a03',
      surface: '#78350f',
      border: '#92400e',
      accent: '#fbbf24',
      text: '#fef3c7',
      subtext: '#fde68a',
      gradientFrom: '#92400e',
      gradientTo: '#451a03'
    },
    rose: {
      bg: '#4c0519',
      surface: '#881337',
      border: '#9f1239',
      accent: '#fb7185',
      text: '#ffe4e6',
      subtext: '#fecdd3',
      gradientFrom: '#9f1239',
      gradientTo: '#4c0519'
    },
    cyan: {
      bg: '#083344',
      surface: '#155e75',
      border: '#0e7490',
      accent: '#22d3ee',
      text: '#ecfeff',
      subtext: '#a5f3fc',
      gradientFrom: '#155e75',
      gradientTo: '#083344'
    }
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
   * Generate a handcrafted SVG Data URI avatar based on initials and theme
   */
  function generateAvatarSvg(name, theme = 'obsidian') {
    const initials = escapeHtml(generateInitials(name));
    const palette = THEME_PALETTES[theme] || THEME_PALETTES.obsidian;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="avatar_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.gradientFrom}" />
          <stop offset="100%" stop-color="${palette.gradientTo}" />
        </linearGradient>
        <radialGradient id="avatar_ring" cx="50%" cy="50%" r="50%">
          <stop offset="65%" stop-color="transparent" />
          <stop offset="100%" stop-color="${palette.accent}" stop-opacity="0.25" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" rx="100" fill="url(#avatar_grad)" />
      <circle cx="100" cy="100" r="95" fill="url(#avatar_ring)" stroke="${palette.accent}" stroke-width="2" stroke-opacity="0.4" />
      <text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="64" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">
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
   * Format date into readable standard (e.g., Nov 13, 2026)
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
    const rawTheme = typeof rawData.theme === 'string' ? rawData.theme.toLowerCase().trim() : 'obsidian';
    const theme = ALLOWED_THEMES.includes(rawTheme) ? rawTheme : 'obsidian';

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
    const title = rawTitle ? escapeHtml(rawTitle.slice(0, 60)) : 'Product Designer & Builder';

    // 6. Location & Status
    const rawLocation = typeof rawData.location === 'string' ? rawData.location.trim() : '';
    const location = rawLocation ? escapeHtml(rawLocation.slice(0, 45)) : 'Remote / Global';

    const rawStatus = typeof rawData.status === 'string' ? rawData.status.trim() : '';
    const statusText = rawStatus ? escapeHtml(rawStatus.slice(0, 35)) : 'Available for hire';

    // 7. Skills / Tags
    let skillsList = [];
    if (Array.isArray(rawData.skills)) {
      skillsList = rawData.skills;
    } else if (typeof rawData.skills === 'string') {
      skillsList = rawData.skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    // Limit to max 6 tags and escape
    const formattedSkills = skillsList.slice(0, 6).map(s => escapeHtml(s.slice(0, 24)));

    // 8. Generate handle from name
    const cleanSlug = rawName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20);
    const handle = `@${cleanSlug || 'user'}`;

    // 9. Sanitized bio & stats
    const sanitizedBio = escapeHtml(rawBio);
    const words = rawBio.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = rawBio.length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

    // 10. Social Links
    const rawGithub = sanitizeHandle(rawData.github);
    const rawTwitter = sanitizeHandle(rawData.twitter);
    const rawLinkedin = sanitizeHandle(rawData.linkedin);

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
      linkedin: rawLinkedin ? `https://linkedin.com/in/${rawLinkedin}` : null,
      linkedinUsername: rawLinkedin || null,
      website: websiteValid ? rawWebsite : null
    };

    // 11. Generate SVG Fallback Avatar
    const fallbackAvatar = generateAvatarSvg(rawName, theme);
    const primaryAvatar = hasCustomImage ? validatedImageUrl : fallbackAvatar;

    // 12. Creation metadata & Unique ID
    const now = new Date();
    const cardId = generateCardId();

    const formattedCard = {
      id: cardId,
      name: escapeHtml(rawName),
      handle: handle,
      title: title,
      bio: sanitizedBio,
      rawBio: rawBio,
      location: location,
      statusText: statusText,
      skills: formattedSkills,
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
        badge: 'Verified Member',
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
    ALLOWED_THEMES: ALLOWED_THEMES,
    THEME_PALETTES: THEME_PALETTES
  };
});

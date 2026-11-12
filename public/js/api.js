/**
 * API Client Layer
 * Handles POST requests to the backend with automatic detection
 * of Node.js Express server vs GitHub Pages static environment.
 */

const ApiClient = (function () {
  'use strict';

  let currentMode = 'detecting'; // 'express' | 'worker'
  let networkListeners = [];

  /**
   * Subscribe to network request/response events for UI inspector
   */
  function onNetworkEvent(callback) {
    if (typeof callback === 'function') {
      networkListeners.push(callback);
    }
  }

  function emitNetworkEvent(eventData) {
    networkListeners.forEach((listener) => {
      try {
        listener(eventData);
      } catch (err) {
        console.error('Error in network listener:', err);
      }
    });
  }

  /**
   * Check whether live Node.js Express backend is available
   */
  async function detectBackend() {
    // If running directly on GitHub Pages domain, default to GitHub Pages Worker Mode
    const isGitHubPages =
      window.location.hostname.includes('github.io') ||
      window.location.protocol === 'file:';

    if (isGitHubPages) {
      currentMode = 'worker';
      return {
        mode: 'worker',
        label: 'GitHub Pages Mock Engine',
        description: 'Running on GitHub Pages static CDN. In-browser processor handles POST /api/profile.'
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch('/api/health', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        currentMode = 'express';
        return {
          mode: 'express',
          label: 'Node.js Express Server (Live)',
          description: `Connected to live Express backend on ${window.location.origin}.`
        };
      }
    } catch (_) {
      // Backend not running on same origin
    }

    currentMode = 'worker';
    return {
      mode: 'worker',
      label: 'GitHub Pages Worker Mode',
      description: 'Live Node server unreachable. Using high-fidelity in-browser worker.'
    };
  }

  /**
   * Get current operating mode
   */
  function getMode() {
    return currentMode;
  }

  /**
   * Force toggle mode (for testing)
   */
  function setMode(mode) {
    if (mode === 'express' || mode === 'worker') {
      currentMode = mode;
    }
  }

  /**
   * Send POST /api/profile request
   */
  async function submitProfile(profileData, options = {}) {
    const startTime = performance.now();
    const targetUrl = options.forceEndpoint || '/api/profile';
    const requestHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };

    const requestPayload = { ...profileData };

    // Mode 1: Express Server Live Fetch
    if (currentMode === 'express' && !options.simulateOffline) {
      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(requestPayload)
        });

        const elapsedMs = Math.round(performance.now() - startTime);
        const responseData = await response.json();

        // Emit network inspector event
        emitNetworkEvent({
          request: {
            method: 'POST',
            url: targetUrl,
            headers: requestHeaders,
            body: requestPayload
          },
          response: {
            status: response.status,
            statusText: response.status === 200 ? '200 OK' : `${response.status} Bad Request`,
            elapsedMs: elapsedMs,
            body: responseData
          },
          engine: 'Node.js Express Server'
        });

        return {
          ok: response.ok,
          status: response.status,
          data: responseData,
          elapsedMs: elapsedMs,
          engine: 'Node.js Express Server'
        };
      } catch (err) {
        console.warn('Live POST fetch failed, falling back to Worker mode:', err);
        currentMode = 'worker';
      }
    }

    // Mode 2: In-browser Worker Engine (GitHub Pages mode)
    // Simulate 220-300ms realistic network latency
    await new Promise((resolve) => setTimeout(resolve, 240 + Math.random() * 80));

    const elapsedMs = Math.round(performance.now() - startTime);
    const processor = window.CardProcessor;

    let responseData;
    if (processor) {
      responseData = processor.processProfileData(requestPayload, {
        processedBy: 'GitHub Pages Mock Server Worker v1.0'
      });
    } else {
      responseData = {
        success: false,
        status: 500,
        message: 'Processor module not loaded'
      };
    }

    const status = responseData.status || 200;

    // Emit network inspector event
    emitNetworkEvent({
      request: {
        method: 'POST',
        url: targetUrl,
        headers: requestHeaders,
        body: requestPayload
      },
      response: {
        status: status,
        statusText: status === 200 ? '200 OK' : `${status} Bad Request`,
        elapsedMs: elapsedMs,
        body: responseData
      },
      engine: 'GitHub Pages Worker'
    });

    return {
      ok: status >= 200 && status < 300,
      status: status,
      data: responseData,
      elapsedMs: elapsedMs,
      engine: 'GitHub Pages Worker'
    };
  }

  return {
    detectBackend: detectBackend,
    getMode: getMode,
    setMode: setMode,
    submitProfile: submitProfile,
    onNetworkEvent: onNetworkEvent
  };
})();

// Attach to window
window.ApiClient = ApiClient;

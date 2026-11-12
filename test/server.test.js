const test = require('node:test');
const assert = require('node:assert/strict');
const CardProcessor = require('../public/js/processor.js');
const app = require('../server.js');

test('Processor: Generates valid profile card when data is valid', () => {
  const input = {
    name: 'Sarah Connor',
    bio: 'Pioneering resilient cybernetic defenses and autonomous distributed robotics.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    title: 'Lead Robotics Architect',
    theme: 'emerald',
    github: 'sarah-connor',
    twitter: 'sconnor',
    website: 'https://resilience.dev'
  };

  const result = CardProcessor.processProfileData(input);

  assert.equal(result.success, true);
  assert.equal(result.status, 200);
  assert.ok(result.card);
  assert.equal(result.card.name, 'Sarah Connor');
  assert.equal(result.card.handle, '@sarahconnor');
  assert.equal(result.card.title, 'Lead Robotics Architect');
  assert.equal(result.card.theme, 'emerald');
  assert.equal(result.card.avatarUrl, input.imageUrl);
  assert.ok(result.card.fallbackAvatarUrl.startsWith('data:image/svg+xml'));
  assert.equal(result.card.links.github, 'https://github.com/sarah-connor');
  assert.equal(result.card.stats.wordCount > 0, true);
  assert.ok(result.card.id.startsWith('usr_'));
});

test('Processor: Validates required name and bio fields', () => {
  const result = CardProcessor.processProfileData({});

  assert.equal(result.success, false);
  assert.equal(result.status, 400);
  assert.ok(result.errors.name);
  assert.ok(result.errors.bio);
});

test('Processor: Rejects name that is too short or too long', () => {
  const shortResult = CardProcessor.processProfileData({ name: 'A', bio: 'Valid bio here' });
  assert.equal(shortResult.success, false);
  assert.ok(shortResult.errors.name);

  const longResult = CardProcessor.processProfileData({
    name: 'A'.repeat(55),
    bio: 'Valid bio description here'
  });
  assert.equal(longResult.success, false);
  assert.ok(longResult.errors.name);
});

test('Processor: Rejects invalid image URL while accepting empty imageUrl (with fallback)', () => {
  const invalidUrlResult = CardProcessor.processProfileData({
    name: 'Jane Doe',
    bio: 'Software engineer building accessible web apps.',
    imageUrl: 'not-a-valid-url'
  });
  assert.equal(invalidUrlResult.success, false);
  assert.ok(invalidUrlResult.errors.imageUrl);

  const emptyUrlResult = CardProcessor.processProfileData({
    name: 'Jane Doe',
    bio: 'Software engineer building accessible web apps.',
    imageUrl: ''
  });
  assert.equal(emptyUrlResult.success, true);
  assert.ok(emptyUrlResult.card.avatarUrl.startsWith('data:image/svg+xml'));
});

test('Processor: Sanitizes HTML/XSS in user inputs', () => {
  const result = CardProcessor.processProfileData({
    name: '<script>alert("hacked")</script> Alex',
    bio: 'Bio with <img src=x onerror=alert(1)> and "quotes"',
    title: '<b onmouseover=evil()>Designer</b>'
  });

  assert.equal(result.success, true);
  assert.ok(!result.card.name.includes('<script>'));
  assert.ok(result.card.name.includes('&lt;script&gt;'));
  assert.ok(!result.card.bio.includes('<img'));
  assert.ok(result.card.bio.includes('&lt;img'));
});

test('Express Server: Health check and POST /api/profile endpoint', async () => {
  // Start server on an ephemeral port
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Test GET /api/health
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.equal(healthData.status, 'online');

    // 2. Test POST /api/profile (Valid data)
    const postRes = await fetch(`${baseUrl}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alan Turing',
        title: 'Cryptanalyst & Mathematician',
        bio: 'Father of theoretical computer science and artificial intelligence.',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
        theme: 'indigo'
      })
    });

    assert.equal(postRes.status, 200);
    const postData = await postRes.json();
    assert.equal(postData.success, true);
    assert.equal(postData.card.name, 'Alan Turing');
    assert.equal(postData.card.theme, 'indigo');

    // 3. Test POST /api/profile (Validation failure: empty body)
    const failRes = await fetch(`${baseUrl}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    assert.equal(failRes.status, 400);
    const failData = await failRes.json();
    assert.equal(failData.success, false);
    assert.ok(failData.errors.name);
  } finally {
    server.close();
  }
});

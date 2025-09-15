const {createClient} = require('redis');

const REDIS_URL = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`;

const redis = createClient({url: REDIS_URL});

redis.on('error', (err) => console.error('[Redis] Error:', err));
redis.on('connect', () => console.log('[Redis] Connected'));
redis.on('reconnecting', () => console.log('[Redis] Reconnecting...'));

let ready = false;
async function ensureReady() {
  if (!ready) {
    await redis.connect();
    ready = true;
  }
}

async function getJSON(key) {
  await ensureReady();
  const raw = await redis.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function setJSON(key, value, ttlSeconds = 60) {
  await ensureReady();
  const payload = JSON.stringify(value);
  // SETEX para definir TTL
  await redis.setEx(key, ttlSeconds, payload);
}

async function del(patternOrKey) {
  await ensureReady();
  // Se vier com * tratamos como pattern
  if (patternOrKey.includes('*')) {
    let cursor = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, {
        MATCH: patternOrKey,
        COUNT: 100,
      });
      cursor = Number(nextCursor);
      if (keys.length) await redis.del(keys);
    } while (cursor !== 0);
  } else {
    await redis.del(patternOrKey);
  }
}

module.exports = { getJSON, setJSON, del };
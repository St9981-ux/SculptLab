import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../consent.js', import.meta.url), 'utf8');
const KEY = 'sculptlab-consent',
  ID = 'G-7BNG9RNN76';
function harness({ storage = new Map(), blocked = false, now = Date.UTC(2026, 8, 26) } = {}) {
  const scripts = [],
    events = {},
    cookieWrites = [],
    timers = new Map();
  let clock = now,
    sequence = 0;
  const cookies = new Map([
    ['_ga', 'visitor'],
    ['_ga_7BNG9RNN76', 'session'],
    ['unrelated', 'keep'],
  ]);
  const document = {
    head: {
      appendChild(script) {
        scripts.push(script);
      },
    },
    createElement: () => ({}),
  };
  Object.defineProperty(document, 'cookie', {
    get: () => [...cookies].map(([k, v]) => k + '=' + v).join('; '),
    set(value) {
      cookieWrites.push(value);
      cookies.delete(value.split('=')[0]);
    },
  });
  const window = {
    localStorage: {
      getItem(key) {
        if (blocked) throw Error('Unavailable');
        return storage.get(key) || null;
      },
      setItem(key, value) {
        if (blocked) throw Error('Unavailable');
        storage.set(key, value);
      },
    },
    addEventListener(type, fn) {
      events[type] = fn;
    },
    setTimeout(fn, ms) {
      const id = ++sequence;
      timers.set(id, { fn, ms });
      return id;
    },
    clearTimeout: id => timers.delete(id),
  };
  const context = vm.createContext({
    window,
    document,
    location: { hostname: 'sculptlab.fr' },
    Date: class extends Date {
      constructor(...args) {
        super(...(args.length ? args : [clock]));
      }
      static now() {
        return clock;
      }
    },
  });
  vm.runInContext(source, context);
  return {
    api: window.sculptlabConsent,
    window,
    storage,
    scripts,
    cookies,
    cookieWrites,
    events,
    timers,
    advance(ms) {
      clock += ms;
      for (const [id, t] of [...timers]) {
        if (timers.has(id)) {
          timers.delete(id);
          t.fn();
        }
      }
    },
    commands: () => Array.from(window.dataLayer || [], args => Array.from(args)),
  };
}
const first = harness();
first.api.start();
assert.equal(first.api.getChoice(), null);
assert.equal(first.scripts.length, 0);
assert.equal(first.window.dataLayer, undefined, 'No Google tag or data queue before consent');
assert.equal(first.window['ga-disable-' + ID], true);
assert.equal(first.cookies.has('_ga'), false);
assert.ok(first.cookies.has('unrelated'));
first.api.save(true);
const choice = JSON.parse(first.storage.get(KEY));
assert.equal(choice.analytics, true);
assert.equal(choice.expiresAt, Date.UTC(2027, 2, 26), 'Six calendar months');
assert.equal(first.scripts.length, 1);
assert.equal(first.scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=' + ID);
const commands = first.commands(),
  updates = commands.filter(c => c[0] === 'consent');
assert.equal(updates[0][1], 'default');
assert.equal(updates[0][2].analytics_storage, 'denied');
assert.equal(updates[1][2].analytics_storage, 'granted');
for (const command of updates)
  for (const flag of ['ad_storage', 'ad_user_data', 'ad_personalization'])
    assert.equal(command[2][flag], 'denied', 'Advertising never enabled');
const config = commands.find(c => c[0] === 'config');
assert.equal(config[1], ID);
assert.equal(config[2].allow_google_signals, false);
assert.equal(config[2].allow_ad_personalization_signals, false);
assert.equal(config[2].cookie_update, false);
first.api.start();
first.api.start();
assert.equal(first.scripts.length, 1);
assert.equal(first.commands().filter(c => c[0] === 'config').length, 1, 'SPA renders do not initialize tracking again');
const restored = harness({ storage: first.storage });
restored.api.start();
assert.equal(restored.scripts.length, 1);
assert.equal(restored.window['ga-disable-' + ID], false, 'A valid saved opt-in is applied after reload');
restored.api.save(false);
assert.equal(restored.window['ga-disable-' + ID], true);
assert.equal(restored.api.getChoice().analytics, false);
assert.equal(restored.cookies.has('_ga'), false);
assert.equal(restored.cookies.has('_ga_7BNG9RNN76'), false);
assert.ok(restored.cookies.has('unrelated'));
assert.ok(
  restored.cookieWrites.some(v => v.includes('Domain=sculptlab.fr')),
  'Both host and domain cookies are cleared'
);
assert.equal(
  restored
    .commands()
    .filter(c => c[0] === 'consent')
    .at(-1)[2].analytics_storage,
  'denied'
);
restored.api.start();
assert.equal(restored.scripts.length, 1, 'Refusal does not load a new tag');
const rejected = harness({ storage: restored.storage });
rejected.api.start();
assert.equal(rejected.scripts.length, 0);
assert.equal(rejected.api.getChoice().analytics, false, 'Refusal is restored too');
const invalidRecords = [
  'broken',
  JSON.stringify({ ...choice, version: 99 }),
  JSON.stringify({ ...choice, expiresAt: Date.UTC(2025, 1, 1) }),
  JSON.stringify({ ...choice, analytics: 'true' }),
];
for (const record of invalidRecords) {
  const h = harness({ storage: new Map([[KEY, record]]) });
  h.api.start();
  assert.equal(h.scripts.length, 0);
  assert.equal(h.api.getChoice(), null, 'Invalid, old or expired consent cannot grant access');
}
const legacy = harness({ storage: new Map([['cookiesAccepted', 'true']]) });
legacy.api.start();
assert.equal(legacy.scripts.length, 0, 'Legacy broad advertising consent is not imported');
const unavailable = harness({ blocked: true });
unavailable.api.save(false);
unavailable.api.start();
assert.equal(unavailable.api.getChoice().analytics, false);
assert.equal(unavailable.scripts.length, 0, 'Blocked storage retains a refusal in memory');
const expiry = harness();
expiry.api.save(true);
expiry.advance(185 * 86400000);
assert.equal(expiry.api.getChoice(), null);
assert.equal(expiry.window['ga-disable-' + ID], true, 'Expired consent disables collection even in an open tab');
const tabs = harness();
tabs.api.save(true);
tabs.storage.set(KEY, JSON.stringify({ ...tabs.api.getChoice(), analytics: false }));
tabs.events.storage({ key: KEY });
assert.equal(tabs.window['ga-disable-' + ID], true, 'Withdrawal in another tab is applied');
console.log(
  'Consent gate checked: no Google load before acceptance, saved acceptance/refusal, withdrawal, cookie removal, six-month expiry, storage failures and advertising disabled. No real analytics requests were sent.'
);

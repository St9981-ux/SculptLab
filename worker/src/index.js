/* ============================================================
   SculptLab — Cloudflare Worker
   Crée une Stripe Checkout Session avec le TRANSPORTEUR et le
   TARIF DE PORT adaptés à la ZONE de livraison choisie par le
   client sur la page récapitulatif.

   • Le prix de la sculpture est calculé ICI (côté serveur) à
     partir de (sculpture, coloris, édition) — jamais reçu du
     navigateur, donc infalsifiable.
   • La clé secrète Stripe vit dans env.STRIPE_SECRET_KEY
     (wrangler secret put STRIPE_SECRET_KEY), jamais dans le site.

   Endpoint : POST /create-checkout-session
   Corps    : { sculpture, color, lang, zone, cancel_url? }
   Réponse  : { url } (URL de paiement Stripe) | { error }
   ============================================================ */

/* --- Référentiel produit (copie fidèle de sl-head.js) --- */
const SCULPT_LABELS = { io: 'Io', zamu: "Za'mu", enigma: 'Enigma' };

const ED_MAP = {
  io: { ecarlate: 'open', pomme: 'open', sorbet: 'limited', outremer: 'limited', poudre: 'limited', arlequin: 'unique', berlingot: 'unique', cyan: 'open' },
  zamu: { acide: 'open', albizia: 'open', dragee: 'open', corail: 'open', venin: 'open', lagon: 'open', givre: 'limited', plasma: 'unique', sable: 'unique', antipode: 'unique', anemone: 'open', parme: 'open', brume: 'limited', primaire: 'limited' },
  enigma: { nova: 'open', glitch: 'open', loop: 'open', vapeur: 'open', eclipse: 'open', neon: 'open', echo: 'open', majorelle: 'open', soleil: 'limited', outremer: 'limited', vide: 'limited', neige: 'limited', vague: 'unique', vibe: 'unique', zigzag: 'unique', pulse: 'unique', plasma: 'unique', pixel: 'unique', electric: 'unique', doodle: 'unique', nuit: 'limited', aube: 'limited' }
};

const PRICES = {
  io:     { open: 455, limited: 855, unique: 1455 },
  zamu:   { open: 455, limited: 855, unique: 1455 },
  enigma: { open: 475, limited: 925, unique: 1695 }
};

const COLORS_EN = {
  // Io
  ecarlate: 'Scarlet', pomme: 'Apple', sorbet: 'Sorbet', outremer: 'Ultramarine',
  poudre: 'Powder', arlequin: 'Harlequin', berlingot: 'Candy', cyan: 'Cyan',
  // Za'mu
  acide: 'Acid', albizia: 'Albizia', dragee: 'Almond', corail: 'Coral',
  venin: 'Venom', lagon: 'Lagoon', givre: 'Frost', plasma: 'Plasma',
  sable: 'Sand', antipode: 'Antipode', anemone: 'Anemone', parme: 'Parma',
  brume: 'Mist', primaire: 'Primary',
  // Enigma
  nova: 'Nova', glitch: 'Glitch', loop: 'Loop', vapeur: 'Vapor',
  eclipse: 'Eclipse', neon: 'Neon', echo: 'Echo', majorelle: 'Majorelle',
  soleil: 'Sun', vide: 'Void', neige: 'Snow', vague: 'Wave',
  vibe: 'Vibe', zigzag: 'Zigzag', pulse: 'Pulse', pixel: 'Pixel',
  electric: 'Electric', doodle: 'Doodle', nuit: 'Night', aube: 'Dawn'
};

/* --- Zones de livraison : pays + transporteur adapté + port (centimes) --- */
/* Pour changer un tarif ou un transporteur : modifier ici puis redéployer
   (npx wrangler deploy). Estimations en jours ouvrés [min, max]. */
const ZONES = {
  fr    : { countries: ['FR','MC'], carrier: 'UPS Standard', amount: 990, est: [2, 4] },
  eu    : { countries: ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE'], carrier: 'DHL Express', amount: 1990, est: [3, 6] },
  europe: { countries: ['GB','CH','NO','IS','LI','AD','SM','VA','GI','AL','BA','ME','MK','RS','MD','UA','GG','JE','IM','FO'], carrier: 'DHL Express', amount: 2990, est: [3, 7] },
  na    : { countries: ['US','CA'], carrier: 'UPS Standard', amount: 4990, est: [5, 9] },
  latam : { countries: ['MX','GT','BZ','SV','HN','NI','CR','PA','CO','VE','EC','PE','BR','BO','PY','UY','AR','CL','GY','SR','DO','CU','JM','TT','BS','BB','PR','GP','MQ','GF','HT','AG','DM','GD','KN','LC','VC','AW','CW','KY'], carrier: 'DHL Express', amount: 7490, est: [7, 15] },
  asia  : { countries: ['JP','CN','KR','HK','TW','SG','MY','TH','VN','PH','ID','IN','PK','BD','LK','NP','KH','LA','MM','MN','KZ','UZ','KG','BN','MO','MV','BT','AU','NZ','FJ','PG','NC','PF','WS','TO','VU','TR','IL','AE','SA','QA','KW','BH','OM','JO','LB','GE','AM','AZ'], carrier: 'DHL Express', amount: 7490, est: [7, 15] },
  world : { countries: ['MA','DZ','TN','LY','EG','ZA','NG','KE','GH','CI','SN','CM','ET','TZ','UG','AO','MZ','ZW','BW','NA','MU','RE','MG','RW','BJ','BF','ML','NE','TD','GA','CG','CD','GN','TG','SL','LR','MR','GM','GW','CV','DJ','SD','BI','MW','ZM','LS','SZ','KM','SC','YT'], carrier: 'DHL Express', amount: 8490, est: [8, 18] },
};

/* --- Origines autorisées (CORS) --- */
const SITE = 'https://sculptlab.fr';
function isAllowedOrigin(o) {
  return /^https:\/\/(www\.)?sculptlab\.fr$/.test(o)
      || /^https:\/\/[a-z0-9-]+\.github\.io$/.test(o)
      || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
}

function norm(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function priceFor(sculpt, key, ed) {
  const P = PRICES[sculpt];
  if (!P) return null;
  if (sculpt === 'enigma' && ed === 'unique') {
    if (key === 'plasma' || key === 'electric') return 1455;
    if (key === 'pixel' || key === 'zigzag') return 1755;
  }
  return P[ed] || null;
}

function corsHeaders(origin) {
  const allow = isAllowedOrigin(origin) ? origin : SITE;
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
  });
}

/* Encodage form-urlencoded récursif (objets/tableaux imbriqués -> clés Stripe) */
function encodeForm(obj, prefix, out) {
  out = out || [];
  for (const k in obj) {
    const v = obj[k];
    if (v === null || v === undefined) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item !== null && typeof item === 'object') encodeForm(item, `${key}[${i}]`, out);
        else out.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(item)}`);
      });
    } else if (typeof v === 'object') {
      encodeForm(v, key, out);
    } else {
      out.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
    }
  }
  return out;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, origin);
    }
    if (!env.STRIPE_SECRET_KEY) {
      return json({ error: 'Server not configured' }, 500, origin);
    }

    let body;
    try { body = await request.json(); }
    catch (e) { return json({ error: 'Invalid JSON' }, 400, origin); }

    const sculpt = norm(body.sculpture);
    const colorRaw = String(body.color || '').trim();
    const key = norm(colorRaw);
    const lang = String(body.lang || 'fr').toLowerCase().indexOf('en') === 0 ? 'en' : 'fr';
    const zoneKey = String(body.zone || '').toLowerCase();

    if (!SCULPT_LABELS[sculpt]) return json({ error: 'Unknown sculpture' }, 400, origin);
    const ed = ED_MAP[sculpt] && ED_MAP[sculpt][key];
    if (!ed) return json({ error: 'Unknown color' }, 400, origin);
    const zone = ZONES[zoneKey];
    if (!zone) return json({ error: 'Unknown shipping zone' }, 400, origin);

    const amount = priceFor(sculpt, key, ed);
    if (!amount) return json({ error: 'Price unavailable' }, 400, origin);

    const colorDisplay = lang === 'en'
      ? (COLORS_EN[key] || colorRaw)
      : (colorRaw ? colorRaw.charAt(0).toUpperCase() + colorRaw.slice(1) : key);
    const productName = `${SCULPT_LABELS[sculpt]} - ${colorDisplay}`;

    const cancelUrl = (typeof body.cancel_url === 'string' && /^https:\/\/(www\.)?sculptlab\.fr\//.test(body.cancel_url))
      ? body.cancel_url
      : `${SITE}/`;

    const params = {
      mode: 'payment',
      locale: lang,
      success_url: `${SITE}/merci.html?session_id={CHECKOUT_SESSION_ID}&lang=${lang}`,
      cancel_url: cancelUrl,
      billing_address_collection: 'required',
      phone_number_collection: { enabled: 'true' },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: amount * 100,
          product_data: { name: productName }
        }
      }],
      shipping_address_collection: { allowed_countries: zone.countries },
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: zone.carrier,
          fixed_amount: { amount: zone.amount, currency: 'eur' },
          delivery_estimate: {
            minimum: { unit: 'business_day', value: zone.est[0] },
            maximum: { unit: 'business_day', value: zone.est[1] }
          }
        }
      }],
      metadata: {
        sculpture: sculpt, color: key, edition: ed,
        lang, zone: zoneKey, carrier: zone.carrier
      }
    };

    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: encodeForm(params).join('&')
    });

    const data = await resp.json();
    if (!resp.ok) {
      return json({ error: (data.error && data.error.message) || 'Stripe error' }, 502, origin);
    }
    return json({ url: data.url }, 200, origin);
  }
};

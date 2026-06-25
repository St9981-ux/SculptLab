#!/usr/bin/env python3
"""
SculptLab — Génère les pages du dossier en/ à partir des pages FR (source unique).
Élimine la désynchronisation : structure, CSS et en-tête proviennent toujours
des pages FR ; les textes anglais sont pré-rendus depuis le dictionnaire
`translations.en` déjà présent dans chaque page, et les méta SEO anglaises
viennent de build/en_meta.json.

Usage :  python3 build/build_en.py
"""
import re, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ['index.html','about.html','contact.html','purchase.html','io1.html','io2.html',
         'zamu1.html','zamu2.html','enigma1.html','enigma2.html',
         'cgv.html','mentions_legales.html',
         'io1_summary.html','io2_summary.html','zamu1_summary.html','zamu2_summary.html',
         'enigma1_summary.html','enigma2_summary.html']
META = json.load(open(os.path.join(ROOT,'build','en_meta.json'), encoding='utf-8'))

# --- Partials de navigation (source unique des menus, voir build/partials/) ---
_PART = os.path.join(ROOT, 'build', 'partials')
NAV_MOBILE = open(os.path.join(_PART, 'mobile-menu.html'), encoding='utf-8').read().strip()
NAV_HEADER = open(os.path.join(_PART, 'header-menu.html'), encoding='utf-8').read().strip()
RE_NAV_MOBILE = re.compile(r'<div class="mobile-menu" id="mobileMenu">.*?</div>\s*</div>', re.S)
RE_NAV_HEADER = re.compile(r'<div class="header-menu">.*?</div>\s*</div>', re.S)

def expand_nav(html):
    """Réinjecte les menus mobile + desktop depuis les partials (idempotent :
    le partial est lui-même le <div> ciblé)."""
    html = RE_NAV_MOBILE.sub(lambda m: NAV_MOBILE, html)
    html = RE_NAV_HEADER.sub(lambda m: NAV_HEADER, html)
    return html

# *2 pages whose canonical should point to their *1 counterpart in /en/
CANONICAL_ALIAS = {
    'io2.html':     'io1.html',
    'zamu2.html':   'zamu1.html',
    'enigma2.html': 'enigma1.html',
}

# JSON-LD string translations FR → EN (exact JSON string replacements)
JSONLD_TRANSLATIONS = {
    '"Résine"': '"Resin"',
    '"Sculpture contemporaine"': '"Contemporary sculpture"',
    '"Sculpture en résine peinte à la main, édition limitée numérotée sur 25 exemplaires. Fabrication artisanale française avec certificat d\'authenticité."':
        '"Hand-painted resin sculpture, numbered limited edition of 25 copies. French handcrafted with certificate of authenticity."',
    '"Sculpture en résine peinte à la main, édition limitée avec certificat d\'authenticité"':
        '"Hand-painted resin sculpture, limited edition with certificate of authenticity"',
    '"Galerie de sculptures artistiques contemporaines"': '"Gallery of contemporary artistic sculptures"',
    '"Collection de sculptures artistiques contemporaines SculptLab. disponibles à l\'achat"':
        '"Collection of SculptLab. contemporary artistic sculptures available for purchase"',
    '"Édition"': '"Edition"',
    '"Limitée à 25 exemplaires"': '"Limited to 25 copies"',
    '"Certificat"': '"Certificate"',
    '"Authenticité"': '"Authenticity"',
    '"Fabrication"': '"Manufacturing"',
    '"Artisanale française"': '"French handcraft"',
    '"Accueil"': '"Home"',
    '"Acquérir"': '"Purchase"',
}

# Dedup redirect to inject at the very start of <head> for /en/index.html

def _build_alt_translations():
    """Construit le dictionnaire de traduction des attributs alt (FR→EN)."""
    t = {
        "Signature de l'artiste SculptLab": "SculptLab artist's signature",
        "Paysages et rencontres artistiques, inspiration SculptLab":
            "Landscapes and artistic encounters, SculptLab inspiration",
        "Modelage à la main, création sculpture SculptLab":
            "Hand modeling, SculptLab sculpture creation",
        "L'atelier de sculpture contemporaine SculptLab":
            "SculptLab contemporary sculpture studio",
        "Sculpture Io, résine peinte à la main, SculptLab":
            "Io sculpture, hand-painted resin, SculptLab",
        "Sculpture Za'mu, résine peinte à la main, SculptLab":
            "Za'mu sculpture, hand-painted resin, SculptLab",
        "Sculpture Enigma, résine peinte à la main, SculptLab":
            "Enigma sculpture, hand-painted resin, SculptLab",
    }
    # (sculpture, couleur FR, couleur EN)
    combos = [
        ("Io", "Sorbet", "Sorbet"), ("Io", "Outremer", "Ultramarine"),
        ("Za'mu", "Brume", "Mist"), ("Za'mu", "Primaire", "Primary"),
        ("Enigma", "Nuit", "Night"), ("Enigma", "Aube", "Dawn"),
    ]
    for s, fr, en in combos:
        t[f"{s} - {fr}"] = f"{s} - {en}"
        t[f"Sculpture {s} {fr}, vue principale, résine peinte à la main"] = \
            f"{s} {en} sculpture, main view, hand-painted resin"
        for n in (2, 3, 4):
            t[f"Sculpture {s} {fr} vue {n}"] = f"{s} {en} sculpture view {n}"
        t[f"Boîte d'emballage sculpture {s} {fr} SculptLab"] = \
            f"{s} {en} sculpture packaging box SculptLab"
    return t

ALT_TRANSLATIONS = _build_alt_translations()

def translate_alts(html):
    """Remplace les attributs alt statiques FR par leur version EN (correspondance exacte)."""
    def repl(m):
        val = m.group(1)
        if val in ALT_TRANSLATIONS:
            return f'alt="{ALT_TRANSLATIONS[val]}"'
        return m.group(0)
    return re.sub(r'alt="([^"]*)"', repl, html)

def _extract_block(s, brace_idx):
    """Depuis l'index du '{' ouvrant, renvoie le contenu jusqu'au '}' apparié,
    en ignorant les accolades situées à l'intérieur de chaînes de caractères."""
    depth, i, quote = 0, brace_idx, None
    while i < len(s):
        c = s[i]
        if quote:
            if c == '\\':
                i += 2; continue
            if c == quote:
                quote = None
        else:
            if c in '"\'':
                quote = c
            elif c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    return s[brace_idx+1:i]
        i += 1
    return ''

def parse_en_dict(html):
    """Extrait translations.en -> dict {clé: texte anglais} via appariement d'accolades."""
    m = re.search(r'const\s+translations\s*=\s*\{', html)
    if not m: return {}
    obj = _extract_block(html, m.end()-1)          # contenu de l'objet translations
    em = re.search(r'\ben\s*:\s*\{', obj)
    if not em: return {}
    block = _extract_block(obj, em.end()-1)        # contenu du sous-objet en
    out = {}
    for k, v in re.findall(r'"([\w.]+)"\s*:\s*"((?:\\.|[^"\\])*)"', block):
        try: out[k] = json.loads('"'+v+'"')
        except Exception: out[k] = v
    return out

def prerender_i18n(html, en):
    """Remplace le texte des éléments data-i18n par leur version anglaise."""
    return re.sub(
        r'<(?P<tag>h1|h2|h3|p|a|span|button|li|label|div|td|th)((?:[^>]*?\s))data-i18n="([\w.]+)"([^>]*)>(.*?)</(?P=tag)>',
        lambda m: _repl_el(m, en), html, flags=re.S)

def _repl_el(m, en):
    tag, pre, key, post, inner = m.group('tag'), m.group(2), m.group(3), m.group(4), m.group(5)
    # On remplace dès que la traduction EN existe. Le contenu peut inclure des
    # <br> ou des spans-placeholder (.ed-cert/.ed-num remplis par le JV via leur
    # classe), mais jamais un data-i18n imbriqué (qu'on écraserait sinon).
    if key in en and 'data-i18n' not in inner:
        return f'<{tag}{pre}data-i18n="{key}"{post}>{en[key]}</{tag}>'
    return m.group(0)

def fix_paths(html):
    # images <img src="...">
    html = re.sub(r'(<img\b[^>]*?\bsrc=")(?!https?:|//|/|\.\./|data:)([^"]+)"', r'\1../\2"', html)
    # préchargement d'images
    html = re.sub(r'(<link\b[^>]*\brel="preload"[^>]*\bhref=")(?!https?:|//|/|\.\./)([^"]+)"', r'\1../\2"', html)
    html = re.sub(r'(<link\b[^>]*\bhref=")(?!https?:|//|/|\.\./)([^"]+)"([^>]*\brel="preload")', r'\1../\2"\3', html)
    # scripts locaux (.js)
    html = re.sub(r'(<script\b[^>]*\bsrc=")(?!https?:|//|/|\.\./)([^"]+\.js)"', r'\1../\2"', html)
    # feuilles de style locales (.css)
    html = re.sub(r'(<link\b[^>]*\bhref=")(?!https?:|//|/|\.\./)([^"]+\.css)"', r'\1../\2"', html)
    # url(...) dans le CSS inline (images, polices)
    html = re.sub(r"url\((['\"]?)(?!https?:|//|/|\.\./|data:)([^)'\"]+)\1\)", r"url(\1../\2\1)", html)
    return html

def set_meta(html, page):
    m = META.get(page, {})
    # Valeurs OG/Twitter par défaut = titre/description anglais (évite tout résiduel FR au partage)
    og_title = m.get('og_title') or m.get('title')
    og_desc  = m.get('og_description') or m.get('description')
    tw_title = m.get('tw_title') or m.get('title')
    tw_desc  = m.get('tw_description') or m.get('description')
    def rep_title(s):
        return re.sub(r'<title>.*?</title>', '<title>'+m['title']+'</title>', s, flags=re.S) if m.get('title') else s
    def rep_attr(s, sel, val):
        if not val: return s
        return re.sub(r'(<meta\s+'+sel+r'\s+content=")[^"]*(")',
                      lambda mm: mm.group(1)+val+mm.group(2), s)
    html = rep_title(html)
    html = rep_attr(html, r'name="description"', m.get('description'))
    html = rep_attr(html, r'name="keywords"', m.get('keywords'))
    html = rep_attr(html, r'property="og:title"', og_title)
    html = rep_attr(html, r'property="og:description"', og_desc)
    html = rep_attr(html, r'property="twitter:title"', tw_title)
    html = rep_attr(html, r'property="twitter:description"', tw_desc)
    return html

def translate_jsonld(html):
    """Remplace les chaînes JSON-LD FR par leurs équivalents EN dans les blocs <script type="application/ld+json">."""
    def replace_block(m):
        block = m.group(0)
        for fr, en in JSONLD_TRANSLATIONS.items():
            block = block.replace(fr, en)
        return block
    return re.sub(
        r'<script\s+type="application/ld\+json">.*?</script>',
        replace_block, html, flags=re.S)

def fix_canonicals(html, page):
    """
    Gère les URLs canoniques, OG et Twitter.
    - Pages *2 : canonical pointe vers /en/*1 (pas vers /en/*2).
    - Toutes les autres : remplace sculptlab.fr/<slug> → sculptlab.fr/en/<slug>.
    """
    if page in CANONICAL_ALIAS:
        target1 = CANONICAL_ALIAS[page]
        en_canonical = f'https://sculptlab.fr/en/{target1}'
        # Remplacer le canonical (qui pointe déjà vers *1 FR)
        html = re.sub(
            r'(<link\b[^>]*\brel="canonical"\s+href=")[^"]*(")',
            lambda m: m.group(1) + en_canonical + m.group(2), html)
        # OG/Twitter URL → aussi pointer vers /en/*1
        html = re.sub(
            r'(<meta\b[^>]*\bproperty="og:url"\s+content=")[^"]*(")',
            lambda m: m.group(1) + en_canonical + m.group(2), html)
        html = re.sub(
            r'(<meta\b[^>]*\bproperty="twitter:url"\s+content=")[^"]*(")',
            lambda m: m.group(1) + en_canonical + m.group(2), html)
    else:
        slug = '' if page == 'index.html' else page
        fr_url = f'https://sculptlab.fr/{slug}'
        en_url = f'https://sculptlab.fr/en/{slug}'
        for attr in ('rel="canonical" href', 'property="og:url" content', 'property="twitter:url" content'):
            html = html.replace(f'{attr}="{fr_url}"', f'{attr}="{en_url}"')
    return html


def transform(page):
    src = open(os.path.join(ROOT, page), encoding='utf-8').read()
    en = parse_en_dict(src)
    h = src
    # menus depuis les partials (avant le pré-rendu i18n qui traduira leur texte)
    h = expand_nav(h)
    # langue
    h = h.replace('<html lang="fr">', '<html lang="en">')
    h = re.sub(r'<meta\s+name="language"\s+content="fr">', '<meta name="language" content="en">', h)
    # langue par défaut JS : défaut anglais sur /en/
    h = h.replace("setLanguage(localStorage.getItem('lang') || 'fr');", "setLanguage(localStorage.getItem('lang') || 'en');")
    h = re.sub(r"setLanguage\(\s*localStorage\.getItem\('lang'\)\s*\|\|\s*'fr'\s*\)", "setLanguage(localStorage.getItem('lang') || 'en')", h)
    # URLs canoniques / OG / Twitter
    h = fix_canonicals(h, page)
    # locale
    h = h.replace('<meta property="og:locale" content="fr_FR">', '<meta property="og:locale" content="en_US">')
    h = h.replace('<meta property="og:locale:alternate" content="en_US">', '<meta property="og:locale:alternate" content="fr_FR">')
    # méta SEO anglaises
    h = set_meta(h, page)
    # JSON-LD → anglais
    h = translate_jsonld(h)
    # (la redirection de langue et la déduplication /index.html sont gérées
    #  de façon centralisée et bot-safe par sl-head.js, chargé sur chaque page)
    # chemins -> ../
    h = fix_paths(h)
    # pré-rendu des textes anglais
    h = prerender_i18n(h, en)
    # traduction des attributs alt statiques
    h = translate_alts(h)
    return h

def sync_fr_nav():
    """Réinjecte les menus (partials) dans les pages FR sources, en place.
    Idempotent : à relancer après toute modification d'un partial de menu."""
    n = 0
    for p in PAGES:
        path = os.path.join(ROOT, p)
        src = open(path, encoding='utf-8').read()
        out = expand_nav(src)
        if out != src:
            open(path, 'w', encoding='utf-8').write(out)
            n += 1
    print(f"{n} page(s) FR resynchronisée(s) (menus).")

def main():
    # 1) Source unique des menus : resynchroniser les pages FR
    sync_fr_nav()
    # 2) Générer les pages en/ depuis les sources FR
    n = 0
    for p in PAGES:
        out = transform(p)
        open(os.path.join(ROOT, 'en', p), 'w', encoding='utf-8').write(out)
        n += 1
    print(f"{n} pages en/ générées depuis les sources FR.")

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
SculptLab — Vérifie la COHÉRENCE des données dupliquées entre :
  - sl-head.js           prix + éditions          (AFFICHAGE navigateur)
  - sl-checkout.js       montants de port         (AFFICHAGE navigateur)
  - worker/src/index.js  prix + éditions + port   (FACTURATION serveur)

Ces copies sont nécessaires : le worker recalcule le prix côté serveur
(infalsifiable) et le navigateur affiche. Mais si elles divergent, le prix
AFFICHÉ ne correspond plus au prix DÉBITÉ. Ce script détecte ça.

Usage :  python3 build/check_pricing.py
Sortie :  code 0 si tout concorde, code 1 (et liste des écarts) sinon.
"""
import re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def obj_after(txt, marker):
    """Renvoie le littéral objet { ... } qui suit `marker`, accolades appariées."""
    i = txt.index(marker)
    b = txt.index('{', i)
    depth, j, q = 0, b, None
    while j < len(txt):
        c = txt[j]
        if q:
            if c == '\\':
                j += 2
                continue
            if c == q:
                q = None
        else:
            if c in '"\'':
                q = c
            elif c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    return txt[b:j + 1]
        j += 1
    raise ValueError(f"objet non terminé après {marker!r}")


SCULPTS = ('io', 'zamu', 'enigma')
EDITIONS = ('open', 'limited', 'unique')
ZONES = ('fr', 'eu', 'europe', 'na', 'world')


def parse_prices(txt, marker):
    obj = obj_after(txt, marker)
    out = {}
    for s in SCULPTS:
        m = re.search(s + r'\s*:\s*\{([^}]*)\}', obj)
        body = m.group(1)
        out[s] = {ed: int(re.search(ed + r'\s*:\s*(\d+)', body).group(1)) for ed in EDITIONS}
    return out


def parse_editions(txt, marker):
    obj = obj_after(txt, marker)
    out = {}
    for s in SCULPTS:
        m = re.search(s + r'\s*:\s*\{([^}]*)\}', obj)
        out[s] = dict(re.findall(r"(\w+)\s*:\s*['\"](\w+)['\"]", m.group(1)))
    return out


def parse_exceptions(txt):
    """Prix spéciaux Enigma 'unique' : (couleur1, couleur2) -> prix."""
    pat = r"===\s*'(\w+)'\s*\|\|\s*\w+\s*===\s*'(\w+)'\)\s*return\s*(\d+)"
    return {(a, b): int(p) for a, b, p in re.findall(pat, txt)}


def parse_zone_carriers_cents(txt, use_num):
    """Renvoie {zone: (carrier, port_en_centimes)}.
    use_num=True : lit `num` en euros (sl-checkout) ; sinon `amount` en centimes (worker)."""
    obj = obj_after(txt, 'ZONES = {')
    out = {}
    for z in ZONES:
        m = re.search(z + r'\s*:\s*\{([^}]*)\}', obj)
        body = m.group(1)
        carrier = re.search(r"carrier\s*:\s*'([^']*)'", body).group(1)
        if use_num:
            cents = round(float(re.search(r'num\s*:\s*([\d.]+)', body).group(1)) * 100)
        else:
            cents = int(re.search(r'amount\s*:\s*(\d+)', body).group(1))
        out[z] = (carrier, cents)
    return out


def main():
    try:
        _run_checks()
    except Exception as e:
        print(f"✗ Vérification impossible (structure inattendue) : {e}")
        print("  → traiter comme une divergence : corriger/aligner avant de déployer.")
        sys.exit(1)


def _run_checks():
    head = read('sl-head.js')
    checkout = read('sl-checkout.js')
    worker = read('worker/src/index.js')

    errors = []

    # 1) Prix de base : sl-head (SL_PRICES) vs worker (PRICES)
    if parse_prices(head, 'SL_PRICES =') != parse_prices(worker, 'PRICES ='):
        errors.append("Prix de base différents entre sl-head.js (SL_PRICES) et worker (PRICES).")

    # 2) Prix spéciaux Enigma 'unique' : slPrice (sl-head) vs priceFor (worker)
    if parse_exceptions(head) != parse_exceptions(worker):
        errors.append("Exceptions de prix Enigma 'unique' différentes entre sl-head.js et worker.")

    # 3) Éditions par coloris : sl-head (SL_ED_MAP) vs worker (ED_MAP)
    if parse_editions(head, 'SL_ED_MAP =') != parse_editions(worker, 'ED_MAP ='):
        errors.append("Map des éditions différente entre sl-head.js (SL_ED_MAP) et worker (ED_MAP).")

    # 4) Port + transporteur par zone : sl-checkout (num, €) vs worker (amount, centimes)
    disp = parse_zone_carriers_cents(checkout, use_num=True)
    charge = parse_zone_carriers_cents(worker, use_num=False)
    if disp != charge:
        errors.append(f"Port/transporteur différents entre sl-checkout.js et worker :\n"
                      f"      affichage = {disp}\n      facturation = {charge}")

    if errors:
        print("✗ INCOHÉRENCE prix/port détectée :")
        for e in errors:
            print("  - " + e)
        sys.exit(1)
    print("✓ Prix, éditions et port concordent entre sl-head.js, sl-checkout.js et le worker.")


if __name__ == '__main__':
    main()

// ESLint configuration (ESLint 9+/10, flat config). Run from the repository root:  eslint .
// The site scripts are classic <script> files sharing one global scope, loaded in this order:
// arrival.js, data.js, legal.js, consent.js, privacy-ui.js, app.js, cursor.js (language.js on neutral pages).
const recommended = Object.fromEntries(
  [
    'constructor-super',
    'for-direction',
    'getter-return',
    'no-async-promise-executor',
    'no-case-declarations',
    'no-class-assign',
    'no-compare-neg-zero',
    'no-cond-assign',
    'no-const-assign',
    'no-constant-binary-expression',
    'no-constant-condition',
    'no-control-regex',
    'no-debugger',
    'no-delete-var',
    'no-dupe-args',
    'no-dupe-class-members',
    'no-dupe-else-if',
    'no-dupe-keys',
    'no-duplicate-case',
    'no-empty',
    'no-empty-character-class',
    'no-empty-pattern',
    'no-empty-static-block',
    'no-ex-assign',
    'no-extra-boolean-cast',
    'no-fallthrough',
    'no-func-assign',
    'no-global-assign',
    'no-import-assign',
    'no-invalid-regexp',
    'no-loss-of-precision',
    'no-misleading-character-class',
    'no-new-native-nonconstructor',
    'no-nonoctal-decimal-escape',
    'no-obj-calls',
    'no-octal',
    'no-prototype-builtins',
    'no-redeclare',
    'no-regex-spaces',
    'no-self-assign',
    'no-setter-return',
    'no-shadow-restricted-names',
    'no-sparse-arrays',
    'no-this-before-super',
    'no-undef',
    'no-unexpected-multiline',
    'no-unreachable',
    'no-unsafe-finally',
    'no-unsafe-negation',
    'no-unsafe-optional-chaining',
    'no-unused-labels',
    'no-unused-private-class-members',
    'no-useless-backreference',
    'no-useless-catch',
    'no-useless-escape',
    'no-with',
    'require-yield',
    'use-isnan',
    'valid-typeof',
  ].map(rule => [rule, 'error'])
);
const rules = {
  ...recommended,
  // French typography uses non-breaking spaces inside texts on purpose.
  'no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true, skipRegExps: true }],
  'no-unused-vars': ['error', { vars: 'local', args: 'none', caughtErrors: 'none' }],
  // Scripts share the page's global scope: a file may define a name that the others read.
  'no-redeclare': ['error', { builtinGlobals: false }],
  // Storage can be unavailable (private browsing): those failures are ignored on purpose.
  'no-empty': ['error', { allowEmptyCatch: true }],
  eqeqeq: ['error', 'smart'],
  'no-var': 'error',
  'prefer-const': ['error', { destructuring: 'all' }],
};
const g = names =>
  Object.fromEntries(
    names
      .split(/\s+/)
      .filter(Boolean)
      .map(n => [n, 'readonly'])
  );
const browser =
  g(`window document location history navigator localStorage sessionStorage fetch URL URLSearchParams AbortController
  FormData Intl Image CSS getComputedStyle requestAnimationFrame cancelAnimationFrame setTimeout clearTimeout setInterval clearInterval
  console PerformanceObserver matchMedia innerHeight innerWidth devicePixelRatio`);
// Names each site script provides to the others (see the load order above).
const site = {
  ...g(`WORKS LEGAL t money esc href routeInfo localizedPath render handleCookieClick scheduleCookiePrompt renderCookiePanel
    closeCookiePanel showCookiePanel cookiePanel cookieLegalDetails footer signature arrow`),
  language: 'writable',
  cookiePanelOpen: 'writable',
  cookieDismissed: 'writable',
};
export default [
  { ignores: ['_build/node_modules/**', 'node_modules/**', '**/*.min.js', 'io1.html', 'en/**', 'fr/**'] },
  {
    files: ['*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: { ...browser, ...site } },
    rules,
  },
  {
    files: ['_build/*.mjs', 'eslint.config.mjs'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: g('console process URL URLSearchParams AbortController'),
    },
    rules,
  },
  {
    files: ['worker/src/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: g('fetch Response Request crypto TextEncoder URL URLSearchParams console'),
    },
    rules,
  },
];

// Same CSS-drawn circle and direct movement as sculptlab.fr/site.js.
// Even sizes keep the centre aligned; no image cursor, border, filter or shadow.
(function () {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let dot = null;
  function hide() {
    if (dot) {
      dot.style.opacity = '0';
      dot.classList.remove('is-down');
    }
    document.documentElement.classList.remove('sl-cursor-active');
  }
  function sync() {
    if (!fine.matches || reduced.matches) {
      hide();
      dot?.remove();
      dot = null;
      return;
    }
    if (!dot) {
      dot = document.createElement('div');
      dot.className = 'sl-cursor';
      dot.setAttribute('aria-hidden', 'true');
      document.body.appendChild(dot);
    }
  }
  let pointer = null,
    frame = 0;
  function place(clientX, clientY) {
    if (!dot) return;
    pointer = { clientX, clientY };
    const target = document.elementFromPoint(clientX, clientY);
    if (!target || target.closest('input,textarea,[contenteditable=true]')) {
      hide();
      return;
    }
    const dpr = window.devicePixelRatio || 1,
      x = Math.round(clientX * dpr) / dpr,
      y = Math.round(clientY * dpr) / dpr;
    dot.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
    dot.classList.toggle('is-hover', Boolean(target.closest('a,button,select,label,summary,[role=button]')));
    // The colour section turns acid yellow at one step: the circle stays blue there.
    dot.classList.toggle(
      'on-dark',
      Boolean(
        target.closest(
          '.feature:not([data-tone=acid]),.site-footer,.atelier-quote,.button,.language-switch a[aria-current=true]'
        )
      )
    );
    dot.style.opacity = '1';
    document.documentElement.classList.add('sl-cursor-active');
  }
  document.addEventListener('mousemove', e => place(e.clientX, e.clientY), { passive: true });
  // Scrolling moves the page under a still mouse: check again what lies beneath the circle.
  window.addEventListener(
    'scroll',
    () => {
      if (!dot || !pointer || dot.style.opacity !== '1' || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        place(pointer.clientX, pointer.clientY);
      });
    },
    { passive: true }
  );
  document.addEventListener('mousedown', () => dot?.classList.add('is-down'), { passive: true });
  document.addEventListener('mouseup', () => dot?.classList.remove('is-down'), { passive: true });
  document.addEventListener('mouseleave', hide, { passive: true });
  document.addEventListener('touchstart', hide, { passive: true });
  document.addEventListener('keydown', e => {
    if (e.key === 'Tab') hide();
  });
  window.addEventListener('blur', hide);
  fine.addEventListener('change', sync);
  reduced.addEventListener('change', sync);
  sync();
})();

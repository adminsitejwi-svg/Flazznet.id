(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isAutoScrolling = false;

  const EASE = {
    power2Out: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    power3Out: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    power4Out: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
    backOut: 'cubic-bezier(0.34, 1.7, 0.64, 1)',
    sineInOut: 'cubic-bezier(0.37, 0, 0.63, 1)',
    power1InOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
  };

  const all = (selector) => Array.from(document.querySelectorAll(selector));

  /* ---------- Animasi masuk saat section terlihat ---------- */

  const pendingReveals = [];

  // Elemen tersembunyi sejak halaman dimuat, lalu animasi jalan saat `trigger`
  // melewati posisi `start` (persen dari atas layar).
  function reveal(selector, { trigger, start, from, duration, stagger = 0, delay = 0, ease, keyframes }) {
    const elements = all(selector);
    if (!elements.length) return;

    const animations = elements.map((element, index) => {
      const frames = keyframes || [
        { translate: from.translate || '0 0', opacity: 0 },
        { translate: '0 0', opacity: 1 },
      ];
      const animation = element.animate(frames, {
        duration: duration * 1000,
        delay: (delay + stagger * index) * 1000,
        easing: ease || 'linear',
        fill: 'backwards',
      });
      animation.pause();
      return animation;
    });

    const play = () => animations.forEach((animation) => animation.play());

    if (!trigger) {
      play();
      return;
    }

    const target = document.querySelector(trigger);
    if (!target) {
      play();
      return;
    }

    pendingReveals.push({ target, start, play });
  }

  // Dicek berdasarkan posisi, bukan perpotongan, supaya section yang terlewat
  // saat scroll melompat (tombol End, reload di tengah halaman) tetap muncul.
  function checkPendingReveals() {
    for (let i = pendingReveals.length - 1; i >= 0; i--) {
      const { target, start, play } = pendingReveals[i];
      if (target.getBoundingClientRect().top <= (window.innerHeight * start) / 100) {
        play();
        pendingReveals.splice(i, 1);
      }
    }
  }

  function watchPendingReveals() {
    let queued = false;
    const onChange = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        checkPendingReveals();
      });
    };
    window.addEventListener('scroll', onChange, { passive: true });
    window.addEventListener('resize', onChange);
    checkPendingReveals();
  }

  /* ---------- Animasi berulang ---------- */

  function loop(selector, { transform, duration, stagger = 0, ease }) {
    all(selector).forEach((element, index) => {
      element.animate([{ transform: 'none' }, { transform }], {
        duration: duration * 1000,
        delay: stagger * index * 1000,
        iterations: Infinity,
        direction: 'alternate',
        easing: ease,
      });
    });
  }

  function initAnimations() {
    if (reduceMotion || !Element.prototype.animate) return;

    const up = (px) => ({ translate: `0 ${px}px` });
    const side = (px) => ({ translate: `${px}px 0` });

    // Hero
    reveal('.hero-left', { from: side(-100), duration: 1.2, ease: EASE.power3Out });
    reveal('.hero-right', { from: side(100), duration: 1.2, delay: 0.2, ease: EASE.power3Out });
    loop('.floating-badge', { transform: 'translateY(-12px)', duration: 2, stagger: 0.3, ease: EASE.sineInOut });

    // Clients
    reveal('.clients-content', { trigger: '.clients-section', start: 80, from: side(-80), duration: 1, ease: EASE.power3Out });
    reveal('.client-logo', { trigger: '.clients-section', start: 80, from: up(60), duration: 0.8, stagger: 0.2, ease: EASE.backOut });

    // Features
    reveal('.features-heading', { trigger: '.features-section', start: 75, from: up(50), duration: 1, ease: EASE.power3Out });
    reveal('.feature-card', { trigger: '.features-section', start: 70, from: up(80), duration: 1, stagger: 0.15, ease: EASE.power4Out });
    loop('.feature-icon', { transform: 'translateY(-8px)', duration: 2, stagger: 0.2, ease: EASE.sineInOut });

    // How it works
    reveal('.how-heading', { trigger: '.how-section', start: 75, from: up(50), duration: 1, ease: EASE.power3Out });
    reveal('.how-step', { trigger: '.how-section', start: 70, from: up(100), duration: 1, stagger: 0.25, ease: EASE.backOut });
    loop('.how-number', { transform: 'scale(1.08)', duration: 1.5, stagger: 0.2, ease: EASE.sineInOut });
    reveal('.how-buttons .btn', { trigger: '.how-buttons', start: 90, from: up(40), duration: 0.8, stagger: 0.15, ease: EASE.power2Out });

    // About
    reveal('.about-image', { trigger: '.about-section', start: 75, from: side(-120), duration: 1.2, ease: EASE.power4Out });
    reveal('.about-content', { trigger: '.about-section', start: 75, from: side(120), duration: 1.2, ease: EASE.power4Out });
    reveal('.about-item', { trigger: '.about-section', start: 70, from: up(40), duration: 0.8, stagger: 0.2, ease: EASE.power3Out });
    loop('.about-image', { transform: 'translateY(-12px)', duration: 3, ease: EASE.sineInOut });
    loop('.about-check', { transform: 'scale(1.15)', duration: 1.2, stagger: 0.2, ease: EASE.power1InOut });

    // Testimonials
    reveal('.testimonial-heading', { trigger: '.testimonial-section', start: 75, from: up(50), duration: 1, ease: EASE.power3Out });
    reveal('.testimonial-card', { trigger: '.testimonial-section', start: 70, from: up(100), duration: 1, stagger: 0.2, ease: EASE.backOut });
    reveal('.testimonial-user', { trigger: '.testimonial-section', start: 70, from: up(20), duration: 0.8, stagger: 0.2, delay: 0.4, ease: EASE.power2Out });
    loop('.testimonial-avatar', { transform: 'scale(1.05)', duration: 1.8, stagger: 0.2, ease: EASE.power1InOut });

    // Pricing
    reveal('.pricing-heading', { trigger: '.pricing-section', start: 75, from: up(50), duration: 1, ease: EASE.power3Out });
    reveal('.pricing-card', { trigger: '.pricing-section', start: 70, from: up(100), duration: 1, stagger: 0.2, ease: EASE.backOut });
    reveal('.pricing-price', {
      trigger: '.pricing-section',
      start: 70,
      duration: 0.8,
      stagger: 0.2,
      keyframes: [
        { scale: 0.8, opacity: 0, offset: 0 },
        { scale: 1.06, opacity: 1, offset: 0.3 },
        { scale: 0.98, offset: 0.55 },
        { scale: 1.01, offset: 0.78 },
        { scale: 1, opacity: 1, offset: 1 },
      ],
      ease: 'ease-out',
    });
    reveal('.pricing-btn', { trigger: '.pricing-section', start: 70, from: up(20), duration: 0.6, stagger: 0.15, delay: 0.4, ease: EASE.power2Out });

    // FAQ
    reveal('.faq-heading', { trigger: '.faq-section', start: 75, from: up(50), duration: 1, ease: EASE.power3Out });
    reveal('.faq-item', { trigger: '.faq-wrapper', start: 80, from: up(80), duration: 0.8, stagger: 0.15, ease: EASE.backOut });
    reveal('.faq-content', { trigger: '.faq-section', start: 70, from: up(20), duration: 0.6, stagger: 0.1, ease: EASE.power2Out });

    // Contact: tulisan dari kiri, formulir dari kanan, lalu kolom muncul satu per satu
    reveal('.contact-info', { trigger: '.contact-section', start: 75, from: side(-80), duration: 1, ease: EASE.power3Out });
    reveal('.contact-phone', { trigger: '.contact-section', start: 75, from: up(30), duration: 0.8, delay: 0.4, ease: EASE.power2Out });
    reveal('.contact-form', { trigger: '.contact-form', start: 85, from: side(80), duration: 1, ease: EASE.power3Out });
    reveal('.contact-field', { trigger: '.contact-form', start: 85, from: up(30), duration: 0.6, stagger: 0.12, delay: 0.3, ease: EASE.power2Out });
    reveal('.contact-submit', { trigger: '.contact-form', start: 85, from: up(20), duration: 0.7, delay: 0.85, ease: EASE.backOut });
    loop('.contact-phone-icon', { transform: 'scale(1.1)', duration: 1.2, ease: EASE.power1InOut });

    watchPendingReveals();
  }

  /* ---------- Menu mobile ---------- */

  function initNavbarToggle() {
    const toggle = document.querySelector('.navbar-toggle');
    const panel = document.getElementById('navbarPanel');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /* ---------- Link navbar aktif ---------- */

  function initNavbarActive() {
    const links = all('.nav-link');
    // Link seperti "#" (ke atas halaman) tidak punya section tujuan
    const sections = links
      .map((link) => link.getAttribute('href'))
      .filter((href) => href.startsWith('#') && href.length > 1)
      .map((href) => document.querySelector(href))
      .filter(Boolean);

    const highlight = (link) => {
      links.forEach((item) => {
        item.classList.remove('text-success');
        item.classList.add('text-gray-900');
      });
      if (link) {
        link.classList.add('text-success');
        link.classList.remove('text-gray-900');
      }
    };

    const setActive = (link) => {
      links.forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
      highlight(link);
    };

    links.forEach((link) => {
      link.addEventListener('mouseenter', () => highlight(link));
      link.addEventListener('mouseleave', () => highlight(document.querySelector('.nav-link.active')));
      link.addEventListener('click', () => setActive(link));
    });

    const onScroll = () => {
      if (isAutoScrolling) return; // selama scroll dari klik menu, menu aktif tidak berkedip

      // Dibaca dari posisi di layar, karena section berada di dalam pembungkus latar
      const line = window.innerHeight / 3;
      const current = sections.find((section) => {
        const box = section.getBoundingClientRect();
        return box.top <= line && box.bottom > line;
      });
      if (current) {
        const link = document.querySelector(`.nav-link[href="#${current.id}"]`);
        if (link) setActive(link);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('autoscrollend', onScroll);
    onScroll();
  }

  /* ---------- Scroll halus saat link menu dipencet ---------- */

  function initSmoothScroll() {
    const nav = document.querySelector('nav');
    const panel = document.getElementById('navbarPanel');
    const toggle = document.querySelector('.navbar-toggle');
    let frame = null;

    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      if (isAutoScrolling) {
        isAutoScrolling = false;
        window.dispatchEvent(new Event('autoscrollend'));
      }
    };

    const destination = (target) =>
      Math.max(0, target.getBoundingClientRect().top + window.scrollY - nav.getBoundingClientRect().height);

    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const scrollToTarget = (target) => {
      stop();
      if (reduceMotion) {
        window.scrollTo({ top: destination(target), behavior: 'instant' });
        return;
      }
      const from = window.scrollY;
      const duration = Math.min(1000, 800 + Math.abs(destination(target) - from) * 0.05);
      const start = performance.now();
      isAutoScrolling = true;

      const step = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        // Tujuan dihitung ulang tiap langkah, karena menu HP menutup selama scroll berjalan
        window.scrollTo({ top: from + (destination(target) - from) * easeInOut(progress), behavior: 'instant' });
        if (progress < 1) {
          frame = requestAnimationFrame(step);
        } else {
          stop();
        }
      };
      frame = requestAnimationFrame(step);
    };

    all('a[href^="#"]').forEach((link) => {
      const href = link.getAttribute('href');
      if (href.length < 2 || href === '#!') return;
      const target = document.querySelector(href);
      if (!target) return;

      link.addEventListener('click', (event) => {
        event.preventDefault();
        if (panel && panel.classList.contains('is-open')) {
          panel.classList.remove('is-open');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
        scrollToTarget(target);
        try {
          history.pushState(null, '', href);
        } catch (error) {
          // Sebagian browser menolak ini saat dibuka lewat file://
        }
      });
    });

    // Pengguna menggulir sendiri: animasi langsung berhenti
    ['wheel', 'touchstart'].forEach((type) => window.addEventListener(type, stop, { passive: true }));
    window.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) stop();
    });
  }

  /* ---------- Kartu buka-tutup: hanya satu kartu terbuka dalam satu waktu ---------- */

  function initFaq() {
    const toggles = all('.faq-toggle');

    const setOpen = (toggle, open) => {
      const panel = document.getElementById(toggle.getAttribute('aria-controls'));
      toggle.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
    };

    toggles.forEach((toggle) => {
      setOpen(toggle, toggle.getAttribute('aria-expanded') === 'true');
      toggle.addEventListener('click', () => {
        const willOpen = toggle.getAttribute('aria-expanded') !== 'true';
        toggles.forEach((other) => setOpen(other, false));
        setOpen(toggle, willOpen);
      });
    });
  }

  /* ---------- Foto hero: puncak kepala sejajar dengan baris "Welcome to" ---------- */

  function initHeroPhoto() {
    const hero = document.querySelector('.hero-section');
    const title = document.querySelector('.hero-left h1');
    const column = document.querySelector('.hero-right');
    const photo = document.querySelector('.hero-photo');
    const image = photo && photo.querySelector('img');
    if (!hero || !title || !column || !image) return;

    const left = document.querySelector('.hero-left');
    const EDGE_GAP = 16;
    const STACK_GAP = 32; // jarak tulisan dan foto saat bertumpuk di layar kecil
    const MIN_STACKED_HEIGHT = 260; // di bawah ini label keluar dari layar HP kecil
    // Dipakai kalau transparansi gambar tidak bisa dibaca, misalnya saat dibuka lewat file://
    const FALLBACK_HEAD_OFFSET = 0.05;
    let headOffset = null;

    // Ruang kosong di atas kepala, dibaca dari bagian transparan gambar
    const readHeadOffset = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = Math.max(1, Math.round((64 * image.naturalHeight) / image.naturalWidth));
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            if (data[(y * canvas.width + x) * 4 + 3] > 128) return y / canvas.height;
          }
        }
      } catch (error) {
        // Canvas diblokir browser, pakai nilai cadangan
      }
      return FALLBACK_HEAD_OFFSET;
    };

    const fit = () => {
      if (!image.naturalWidth) return;
      if (headOffset === null) headOffset = readHeadOffset();

      // Diukur tanpa foto, supaya tinggi Home tidak terpengaruh ukuran foto sebelumnya
      photo.style.width = '0px';
      const ratio = image.naturalWidth / image.naturalHeight;
      const heroBox = hero.getBoundingClientRect();
      let width;

      if (window.innerWidth >= 992) {
        const toTitle = (heroBox.bottom - title.getBoundingClientRect().top) / (1 - headOffset);
        const height = Math.min(toTitle, heroBox.height);
        // offsetLeft, bukan getBoundingClientRect, supaya tidak ikut geseran animasi masuk
        width = Math.min(height * ratio, window.innerWidth - column.offsetLeft - EDGE_GAP);
      } else {
        const free = heroBox.bottom - left.getBoundingClientRect().bottom - STACK_GAP;
        const height = Math.max(free, MIN_STACKED_HEIGHT);
        width = Math.min(height * ratio, window.innerWidth * 0.9, 520);
      }

      photo.style.width = `${Math.round(width)}px`;
    };

    fit();
    window.addEventListener('resize', fit);
    if (!image.complete) image.addEventListener('load', fit);
    // Posisi tulisan berubah setelah font selesai dimuat
    if (document.fonts) {
      document.fonts.addEventListener('loadingdone', fit);
      if (document.fonts.ready) document.fonts.ready.then(fit);
    }
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(left);
  }

  initHeroPhoto();
  initAnimations();
  initNavbarToggle();
  initNavbarActive();
  initSmoothScroll();
  initFaq();
})();

/* ══════════════════════════════════════════════════════
   DEVISTA — script.js
   Professional GSAP Animation Engine
   ScrollTrigger · Page Routing · Light/Dark Theme
══════════════════════════════════════════════════════ */

'use strict';

/* ── Wait for GSAP, then initialize after this file has evaluated ──
   Deferring init avoids accessing DevistaSite before its const declaration.
   A timeout also prevents the page from being trapped on the loader if a CDN
   request is blocked while opening the site locally.
──────────────────────────────────────────────────────────────────── */
(function waitGSAP() {
  let attempts = 0;
  const maxAttempts = 100; // ~3 seconds
  function start() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      DevistaSite.init();
      return;
    }
    attempts += 1;
    if (attempts < maxAttempts) {
      setTimeout(start, 30);
      return;
    }
    // Fail visibly and safely instead of leaving the full-screen loader stuck.
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
    document.documentElement.classList.add('animations-unavailable');
    console.error('Devista: GSAP could not load. Check your internet connection or CDN access.');
  }
  // Run on the next task, after the DevistaSite declaration has initialized.
  setTimeout(start, 0);
})();

/* ══════════════════════════════════════════════════════
   MAIN SITE OBJECT
══════════════════════════════════════════════════════ */
const DevistaSite = {

  /* State */
  currentPage: 'home',
  isTransitioning: false,
  theme: 'dark',
  testimonialIdx: 0,
  loaderDone: false,

  /* ── MASTER INIT ────────────────────────────── */
  init() {
    this.setupTheme();
    this.setupLoader();
    this.setupCursor();
    this.setupNavbar();
    this.setupPageRouting();
    this.setupTestimonials();
    this.setupContactForm();
    this.setupThemeToggle();
    this.setupFooterLinks();
    this.setupMobileNav();
  },

  /* ══════════════════════════════════════════════
     THEME
  ══════════════════════════════════════════════ */
  setupTheme() {
    // Load saved theme
    const saved = localStorage.getItem('devista-theme') || 'dark';
    this.theme = saved;
    document.documentElement.setAttribute('data-theme', saved);
  },

  setupThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => this.toggleTheme());
  },

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('devista-theme', this.theme);

    // Quick flash animation on toggle
    gsap.fromTo(document.body,
      { opacity: 0.7 },
      { opacity: 1, duration: 0.35, ease: 'power2.out' }
    );

    const btn = document.getElementById('themeToggle');
    gsap.to(btn, {
      rotation: 360,
      duration: 0.6,
      ease: 'back.out(1.5)',
      onComplete: () => gsap.set(btn, { rotation: 0 })
    });
  },

  /* ══════════════════════════════════════════════
     LOADER
  ══════════════════════════════════════════════ */
  setupLoader() {
    const loader = document.getElementById('loader');
    const letters = document.querySelectorAll('.ll');
    const bar = document.getElementById('loaderBar');
    const pct = document.getElementById('loaderPct');
    const status = document.getElementById('loaderStatus');

    const statusWords = ['Crafting Motion', 'Loading Assets', 'Compiling GSAP', 'Almost Ready', 'Welcome'];
    const duration = 2000;
    const startTime = performance.now();

    // Animate letters in first
    gsap.to(letters, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.07,
      ease: 'power4.out',
    });

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const count = Math.round(progress * 100);

      pct.textContent = count;
      bar.style.width = count + '%';

      const wordIdx = Math.min(Math.floor(progress * statusWords.length), statusWords.length - 1);
      status.textContent = statusWords[wordIdx];

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        this.exitLoader(loader);
      }
    };

    requestAnimationFrame(tick);
  },

  exitLoader(loader) {
    const tl = gsap.timeline({
      onComplete: () => {
        loader.style.display = 'none';
        this.loaderDone = true;
        this.animateHomePage();
      }
    });

    // Letters exit upward
    tl.to('.ll', {
      y: '-120%',
      opacity: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: 'power3.in',
    })
    // Loader panel slams up
    .to(loader, {
      yPercent: -100,
      duration: 1.1,
      ease: 'power4.inOut',
    }, '-=0.2');
  },

  /* ══════════════════════════════════════════════
     CUSTOM CURSOR
  ══════════════════════════════════════════════ */
  setupCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    const cursorText = document.getElementById('cursor-text');
    if (!dot || !ring) return;

    // GSAP quickTo for buttery smooth follow
    const xRing = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3.out' });
    const yRing = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3.out' });
    const xText = gsap.quickTo(cursorText, 'x', { duration: 0.45, ease: 'power3.out' });
    const yText = gsap.quickTo(cursorText, 'y', { duration: 0.45, ease: 'power3.out' });

    window.addEventListener('mousemove', (e) => {
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      xRing(e.clientX);
      yRing(e.clientY);
      xText(e.clientX + 30);
      yText(e.clientY - 15);
    });

    // Hover states
    const hoverEls = 'a, button, .proj-card, .svc-card, .svc-row, .why-card, .sc-item, .val-card, .team-card, .award-row, .form-input, .form-select, .form-textarea, .form-submit, .cta-primary, .cta-ghost, .pf-btn, .tn-btn, .t-ctrl, .theme-toggle, .nav-logo, .hamburger, .mob-item, .footer-links button';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverEls)) {
        ring.classList.add('hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverEls)) {
        ring.classList.remove('hover');
      }
    });

    // Click pulse
    document.addEventListener('mousedown', () => {
      gsap.to(ring, { scale: 0.75, duration: 0.12, ease: 'power2.in' });
      gsap.to(dot, { scale: 0.5, duration: 0.12 });
    });
    document.addEventListener('mouseup', () => {
      gsap.to(ring, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
      gsap.to(dot, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
    });

    // Hide on leave
    document.addEventListener('mouseleave', () => gsap.to([dot, ring], { opacity: 0, duration: 0.2 }));
    document.addEventListener('mouseenter', () => gsap.to([dot, ring], { opacity: 1, duration: 0.2 }));
  },

  /* ══════════════════════════════════════════════
     NAVBAR
  ══════════════════════════════════════════════ */
  setupNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    // Scroll shrink
    ScrollTrigger.create({
      start: 'top -70',
      onEnter: () => navbar.classList.add('scrolled'),
      onLeaveBack: () => navbar.classList.remove('scrolled'),
    });
  },

  revealNavbar() {
    gsap.to('.nav-logo', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 });
    gsap.to('.nav-links', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.58 });
    gsap.to('.nav-right', { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out', delay: 0.75 });
  },

  /* ══════════════════════════════════════════════
     PAGE ROUTING
  ══════════════════════════════════════════════ */
  setupPageRouting() {
    // All nav buttons, CTA buttons, footer buttons
    document.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.getAttribute('data-page');
        if (target !== this.currentPage && !this.isTransitioning) {
          this.navigateTo(target);
        }
      });
    });
  },

  navigateTo(pageName) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Close mobile nav if open
    this.closeMobileNav();

    // Kill existing ScrollTriggers to prevent conflicts
    ScrollTrigger.getAll().forEach(t => t.kill());

    // Transition: lime panel slides in from bottom, then out from top
    const overlay = document.getElementById('page-transition');
    const tl = gsap.timeline({
      onComplete: () => {
        this.isTransitioning = false;
        this.updateActiveNav(pageName);
      }
    });

    // Panel in
    tl.fromTo(overlay,
      { scaleY: 0, transformOrigin: 'bottom', pointerEvents: 'all' },
      { scaleY: 1, duration: 0.55, ease: 'power4.inOut' }
    )
    // Switch page at peak
    .add(() => {
      this.hidePage(this.currentPage);
      this.showPage(pageName);
      this.currentPage = pageName;
      window.scrollTo(0, 0);
    })
    // Panel out
    .to(overlay, {
      scaleY: 0,
      transformOrigin: 'top',
      duration: 0.65,
      ease: 'power4.inOut',
      pointerEvents: 'none',
    })
    // Animate new page in
    .add(() => {
      this.animatePage(pageName);
    }, '-=0.1');
  },

  hidePage(name) {
    const el = document.getElementById('page-' + name);
    if (el) el.style.display = 'none';
  },

  showPage(name) {
    const el = document.getElementById('page-' + name);
    if (el) el.style.display = 'block';
    const footer = document.getElementById('site-footer');
    if (footer) footer.style.display = 'flex';
  },

  updateActiveNav(pageName) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-page') === pageName);
    });
  },

  animatePage(name) {
    const fn = {
      home: () => this.animateHomePage(),
      services: () => this.animateServicesPage(),
      projects: () => this.animateProjectsPage(),
      about: () => this.animateAboutPage(),
      contact: () => this.animateContactPage(),
    };
    if (fn[name]) fn[name]();
  },

  /* ══════════════════════════════════════════════
     HOME PAGE ANIMATIONS
  ══════════════════════════════════════════════ */
  animateHomePage() {
    this.revealNavbar();

    const tl = gsap.timeline({ delay: 0.05 });

    // Hero eyebrow
    tl.to('.hero-eyebrow', {
      opacity: 1, y: 0,
      duration: 0.9, ease: 'power3.out'
    })
    // Hero words stagger
    .to('.h1-word', {
      y: 0, opacity: 1,
      duration: 1.2,
      stagger: { amount: 0.5, ease: 'power2.out' },
      ease: 'power4.out',
    }, '-=0.6')
    // Desc
    .to('.hero-desc', {
      opacity: 1, y: 0,
      duration: 0.9, ease: 'power3.out'
    }, '-=0.6')
    // Buttons
    .to('.hero-actions', {
      opacity: 1, y: 0,
      duration: 0.9, ease: 'power3.out'
    }, '-=0.65')
    // Scroll hint
    .to('.hero-scroll-hint', {
      opacity: 1, duration: 0.7, ease: 'power2.out'
    }, '-=0.2');

    // ScrollTrigger: Why Cards
    gsap.to('.why-card', {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.14,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.why-section',
        start: 'top 75%',
        toggleActions: 'play none none none',
      }
    });

    // ScrollTrigger: Stats counter
    this.setupStatCounters();

    // ScrollTrigger: Marquee hover speed change
    this.setupMarqueeParallax();
  },

  setupStatCounters() {
    const stats = document.querySelectorAll('.stat-n');
    stats.forEach(stat => {
      const target = parseInt(stat.dataset.count);
      gsap.fromTo(stat,
        { textContent: 0 },
        {
          textContent: target,
          duration: 2,
          ease: 'power2.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: '.stats-section',
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
          onUpdate() {
            stat.textContent = Math.round(this.targets()[0].textContent);
          }
        }
      );
    });
  },

  setupMarqueeParallax() {
    const track = document.getElementById('marqueeTrack');
    if (!track) return;

    // Reverse marquee on scroll down
    let scrollDir = 1;
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      scrollDir = window.scrollY > lastScroll ? 1 : -1;
      lastScroll = window.scrollY;
    });
  },

  /* ══════════════════════════════════════════════
     SERVICES PAGE ANIMATIONS
  ══════════════════════════════════════════════ */
  animateServicesPage() {
    this.revealNavbar();
    this.animatePageHero();

    // Rows slide in from left
    gsap.to('.svc-row', {
      opacity: 1,
      x: 0,
      duration: 0.85,
      delay:0.5,
      stagger: 0.5,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.svc-list',
        start: 'top 78%',
        toggleActions: 'play none none none',
      }
    });

    // Process steps pop up
    gsap.to('.ps-item', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.process-steps',
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });

    // Section tags slide in
    this.animateSectionTags();
  },

  /* ══════════════════════════════════════════════
     PROJECTS PAGE ANIMATIONS
  ══════════════════════════════════════════════ */
  animateProjectsPage() {
    this.revealNavbar();
    this.animatePageHero();

    // Project cards cinematic reveal
    gsap.to('.proj-card', {
      opacity: 1,
      y: 0,
      duration: 1.0,
      stagger: {
        amount: 0.5,
        from: 'start',
      },
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.projects-grid',
        start: 'top 78%',
        toggleActions: 'play none none none',
      }
    });

    // Testimonials
    this.animateSectionTags();

    gsap.from('.test-card-slide.active', {
      opacity: 0,
      y: 40,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.testimonials-section',
        start: 'top 80%',
      }
    });
  },

  setupProjectFilter() {
    const btns = document.querySelectorAll('.pf-btn');
    const cards = document.querySelectorAll('.proj-card');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        cards.forEach(card => {
          const cats = card.dataset.cat || '';
          const show = filter === 'all' || cats.includes(filter);

          gsap.to(card, {
            opacity: show ? 1 : 0.2,
            scale: show ? 1 : 0.95,
            duration: 0.4,
            ease: 'power2.out',
          });
        });
      });
    });
  },

  /* ══════════════════════════════════════════════
     ABOUT PAGE ANIMATIONS
  ══════════════════════════════════════════════ */
  animateAboutPage() {
    this.revealNavbar();
    this.animatePageHero();

    // Manifesto lines — big slide-up reveal (Awwwards style)
    const amLines = document.querySelectorAll('.am-big-line');
    amLines.forEach((line, i) => {
      gsap.from(line, {
        y: '105%',
        opacity: 0,
        duration: 1.1,
        ease: 'power4.out',
        delay: i * 0.12,
        scrollTrigger: {
          trigger: '.about-manifesto',
          start: 'top 78%',
          toggleActions: 'play none none none',
        }
      });
    });

    // Body text
    gsap.from('.am-body', {
      opacity: 0,
      y: 30,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.about-manifesto',
        start: 'top 72%',
      }
    });

    // Values grid
    gsap.to('.val-card', {
      opacity: 1,
      y: 0,
      duration: 0.85,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.values-grid',
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });

    // Team
    gsap.to('.team-card', {
      opacity: 1,
      y: 0,
      duration: 0.85,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.team-grid',
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });

    // Awards
    gsap.to('.award-row', {
      opacity: 1,
      x: 0,
      duration: 0.75,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.awards-list',
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });

    this.animateSectionTags();
  },

  /* ══════════════════════════════════════════════
     CONTACT PAGE ANIMATIONS
  ══════════════════════════════════════════════ */
  animateContactPage() {
    this.revealNavbar();
    this.animatePageHero();

    // Left info
    gsap.from('.contact-info-block', {
      opacity: 0,
      x: -30,
      duration: 0.85,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.contact-section',
        start: 'top 78%',
        toggleActions: 'play none none none',
      }
    });

    // Form
    gsap.from('.contact-form > *', {
      opacity: 0,
      y: 30,
      duration: 0.75,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.contact-form',
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });

    // Form input focus animations
    document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(input => {
      input.addEventListener('focus', () => {
        gsap.to(input, { scale: 1.01, duration: 0.25, ease: 'power2.out' });
      });
      input.addEventListener('blur', () => {
        gsap.to(input, { scale: 1, duration: 0.25, ease: 'power2.out' });
      });
    });

    // Checkbox hover animations
    document.querySelectorAll('.sc-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        gsap.to(item, { scale: 1.02, duration: 0.2, ease: 'power2.out' });
      });
      item.addEventListener('mouseleave', () => {
        gsap.to(item, { scale: 1, duration: 0.2, ease: 'power2.out' });
      });
    });
  },

  /* ══════════════════════════════════════════════
     SHARED PAGE ANIMATIONS
  ══════════════════════════════════════════════ */
  animatePageHero() {
    gsap.from('.page-h1', {
      y: 80,
      opacity: 0,
      duration: 1.1,
      ease: 'power4.out',
      delay: 0.1,
    });
    gsap.from('.page-sub', {
      y: 30,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      delay: 0.3,
    });
    gsap.from('.section-tag:first-child', {
      opacity: 0,
      x: -15,
      duration: 0.7,
      ease: 'power3.out',
    });
  },

  animateSectionTags() {
    document.querySelectorAll('.section-tag').forEach(tag => {
      gsap.from(tag, {
        opacity: 0,
        x: -15,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: tag,
          start: 'top 88%',
          toggleActions: 'play none none none',
        }
      });
    });

    document.querySelectorAll('.section-h').forEach(h => {
      gsap.from(h, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: h,
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      });
    });
  },

  /* ══════════════════════════════════════════════
     TESTIMONIALS SLIDER
  ══════════════════════════════════════════════ */
  setupTestimonials() {
    const slides = document.querySelectorAll('.test-card-slide');
    const prev = document.getElementById('tPrev');
    const next = document.getElementById('tNext');
    if (!prev || !next) return;

    const go = (dir) => {
      const current = slides[this.testimonialIdx];
      this.testimonialIdx = (this.testimonialIdx + dir + slides.length) % slides.length;
      const coming = slides[this.testimonialIdx];

      gsap.to(current, {
        opacity: 0,
        x: dir * -60,
        duration: 0.4,
        ease: 'power3.in',
        onComplete: () => {
          current.classList.remove('active');
          current.style.display = 'none';
          coming.style.display = 'block';
          coming.classList.add('active');
          gsap.fromTo(coming,
            { opacity: 0, x: dir * 60 },
            { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }
          );
        }
      });
    };

    next.addEventListener('click', () => go(1));
    prev.addEventListener('click', () => go(-1));

    // Auto-advance
    setInterval(() => go(1), 5000);
  },

  /* ══════════════════════════════════════════════
     CONTACT FORM
  ══════════════════════════════════════════════ */
  setupContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('formSubmit');
    const success = document.getElementById('formSuccess');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validateForm()) {
        this.submitForm(form, submitBtn, success);
      }
    });
  },

  validateForm() {
    let valid = true;

    const clearErr = (id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    };
    const setErr = (id, msg) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = msg;
        gsap.from(el, { opacity: 0, x: -10, duration: 0.3, ease: 'power2.out' });
      }
      valid = false;
    };

    clearErr('err-name'); clearErr('err-email');
    clearErr('err-service'); clearErr('err-message');

    const name = document.getElementById('clientName');
    const email = document.getElementById('clientEmail');
    const message = document.getElementById('clientFeedback');
    const services = document.querySelectorAll('input[name="service"]:checked');

    if (!name || !name.value.trim()) {
      setErr('err-name', 'Please enter your name.');
      name && gsap.to(name, { x: [-4, 4, -4, 4, 0], duration: 0.3, ease: 'power1.inOut' });
    }

    if (!email || !email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      setErr('err-email', 'Please enter a valid email address.');
      email && gsap.to(email, { x: [-4, 4, -4, 4, 0], duration: 0.3, ease: 'power1.inOut' });
    }

    if (services.length === 0) {
      setErr('err-service', 'Please select at least one service.');
    }

    if (!message || !message.value.trim() || message.value.trim().length < 20) {
      setErr('err-message', 'Please enter a message (at least 20 characters).');
      message && gsap.to(message, { x: [-4, 4, -4, 4, 0], duration: 0.3, ease: 'power1.inOut' });
    }

    return valid;
  },

  async submitForm(form, btn, success) {
    const name = document.getElementById('clientName')?.value.trim() || '';
    const email = document.getElementById('clientEmail')?.value.trim() || '';
    const message = document.getElementById('clientFeedback')?.value.trim() || '';
    const services = Array.from(document.querySelectorAll('input[name="service"]:checked')).map(input => input.value).join(', ') || 'Not specified';
    const budget = document.getElementById('clientBudget')?.value || 'Not specified';
    const timeline = document.getElementById('clientTimeline')?.value || 'Not specified';
    const label = btn.querySelector('.fs-text');
    const originalLabel = label?.textContent || 'Send Enquiry';
    btn.disabled = true;
    if (label) label.textContent = 'Sending...';
    try {
      if (!window.emailjs) throw new Error('EmailJS SDK failed to load');
      const templateParams = {
        title: `Project enquiry: ${services}`,
        name,
        time: new Date().toLocaleString(),
        message: `${message}\n\nSelected services: ${services}\nBudget: ${budget}\nTimeline: ${timeline}\nContact email: ${email}`,
        email,
        reply_to: email,
        service: services,
        budget,
        timeline
      };
      await window.emailjs.send('service_8y64u3p', 'template_vk0pycp', templateParams);
      const heading = success?.querySelector('h3');
      const paragraph = success?.querySelector('p');
      if (heading) heading.textContent = 'Enquiry Sent Successfully';
      if (paragraph) paragraph.textContent = 'Thanks for contacting Devista. Your project enquiry has been submitted.';
      form.style.display = 'none';
      if (success) {
        success.style.display = 'block';
        gsap.from(success, { opacity: 0, y: 20, duration: 0.5, ease: 'power3.out' });
      }
    } catch (error) {
      console.error('Devista contact form error:', error);
      let errorBox = document.getElementById('formSendError');
      if (!errorBox) {
        errorBox = document.createElement('p'); errorBox.id = 'formSendError';
        errorBox.setAttribute('role', 'alert');
        errorBox.style.cssText = 'color:#ff7777;margin-top:12px;font-size:14px;';
        form.appendChild(errorBox);
      }
      errorBox.textContent = 'Could not send right now. Please try again in a moment.';
      btn.disabled = false;
      if (label) label.textContent = originalLabel;
    }
  },

  /* ══════════════════════════════════════════════
     MOBILE NAV
  ══════════════════════════════════════════════ */
  setupMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.contains('open');
      if (isOpen) {
        this.closeMobileNav();
      } else {
        hamburger.classList.add('open');
        mobileNav.classList.add('open');
        gsap.from('.mob-item', {
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.2,
        });
      }
    });

    document.querySelectorAll('.mob-item').forEach(item => {
      item.addEventListener('click', () => {
        const target = item.getAttribute('data-page');
        this.closeMobileNav();
        if (target !== this.currentPage) {
          setTimeout(() => this.navigateTo(target), 100);
        }
      });
    });
  },

  closeMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    if (!hamburger || !mobileNav) return;
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
  },

  /* ══════════════════════════════════════════════
     FOOTER LINKS
  ══════════════════════════════════════════════ */
  setupFooterLinks() {
    document.querySelectorAll('.footer-links button, #site-footer [data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-page');
        if (target && target !== this.currentPage && !this.isTransitioning) {
          this.navigateTo(target);
        }
      });
    });
  },

};

/* ══════════════════════════════════════════════════
   GLOBAL BUTTON RIPPLE EFFECT
══════════════════════════════════════════════════ */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.cta-primary, .cta-ghost, .form-submit, .nav-contact-btn, .mob-item');
  if (!btn) return;

  const rip = document.createElement('span');
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  rip.style.cssText = `
    position:absolute;border-radius:50%;
    width:120px;height:120px;
    left:${x}px;top:${y}px;
    transform:translate(-50%,-50%) scale(0);
    background:rgba(255,255,255,0.2);
    pointer-events:none;z-index:0;
  `;

  const pos = getComputedStyle(btn).position;
  if (pos === 'static') btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(rip);

  gsap.to(rip, {
    scale: 3.5,
    opacity: 0,
    duration: 0.75,
    ease: 'power2.out',
    onComplete: () => rip.remove(),
  });
});

/* ══════════════════════════════════════════════════
   WINDOW RESIZE — REFRESH SCROLLTRIGGER
══════════════════════════════════════════════════ */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh(true);
  }, 250);
});

/* ══════════════════════════════════════════════════
   PAGE TRANSITION OVERLAY ELEMENT (injected)
══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('page-transition')) {
    const overlay = document.createElement('div');
    overlay.id = 'page-transition';
    document.body.appendChild(overlay);
  }
});


/* ═══════════════════════════════════════════════
   ES DESIGN LAB — Premium Interactions & Animations
   GSAP · Lenis · Canvas · Custom Cursor
   ═══════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────
   UTILITY HELPERS
────────────────────────────────────────────── */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsAll = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ──────────────────────────────────────────────
   SCROLL PROGRESS BAR
────────────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.id = 'scroll-progress-bar';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const max = document.body.scrollHeight - window.innerHeight;
    bar.style.width = `${(scrolled / max) * 100}%`;
  }, { passive: true });
}

/* ──────────────────────────────────────────────
   PRELOADER
────────────────────────────────────────────── */
function initPreloader() {
  const preloader = qs('#preloader');
  const bar = qs('.preloader-bar');
  const logoE = qs('.preloader-logo .logo-e');
  const logoS = qs('.preloader-logo .logo-s');
  const logoImg = qs('.preloader-logo img');

  if (!preloader) return;

  document.body.classList.add('is-loading');

  const duration = 1800;
  const startTime = performance.now();

  function updateBar(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    bar.style.width = `${progress * 100}%`;
    if (progress < 1) {
      requestAnimationFrame(updateBar);
    } else {
      finishPreloader();
    }
  }

  requestAnimationFrame(updateBar);

  function finishPreloader() {
    gsap.to(preloader, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      delay: 0.2,
      onComplete: () => {
        preloader.style.display = 'none';
        document.body.classList.remove('is-loading');
        initHeroAnimations();
      }
    });
  }

// Animate logo layers safely
  const targets = logoImg ? [logoImg] : [logoE, logoS].filter(Boolean);
  if (targets.length > 0) {
    gsap.fromTo(targets, {
      y: 30,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.1
    });
  }
}

/* ──────────────────────────────────────────────
   LENIS SMOOTH SCROLL
────────────────────────────────────────────── */
let lenis;

function initSmoothScroll() {
  if (typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // Connect to GSAP ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // Anchor link smooth scroll
  qsAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = qs(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80, duration: 1.4 });
    });
  });
}

/* ──────────────────────────────────────────────
   CUSTOM CURSOR
────────────────────────────────────────────── */
function initCustomCursor() {
  const cursor = qs('#cursor');
  const dot = qs('.cursor-dot');
  const ring = qs('.cursor-ring');

  if (!cursor || !dot || !ring) return;
  if (window.matchMedia('(hover: none)').matches) return;

  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    document.body.classList.add('cursor-hidden');
  });

  document.addEventListener('mouseenter', () => {
    document.body.classList.remove('cursor-hidden');
  });

  // Add hover class on interactive elements
  const hoverEls = qsAll('a, button, .portfolio-item, .service-card, .featured-card, .t-dot');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  function animateCursor() {
    // Dot follows immediately
    dotX += (mouseX - dotX) * 0.9;
    dotY += (mouseY - dotY) * 0.9;
    dot.style.left = `${dotX}px`;
    dot.style.top = `${dotY}px`;

    // Ring follows with lag
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;

    requestAnimationFrame(animateCursor);
  }

  requestAnimationFrame(animateCursor);
}

/* ──────────────────────────────────────────────
   HERO CANVAS BACKGROUND
────────────────────────────────────────────── */
function initHeroCanvas() {
  const canvas = qs('#hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const particles = [];
  const PARTICLE_COUNT = 60;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      // OLD v1 particle colours (amber palette, commented out):
      // this.color = Math.random() > 0.7
      //   ? `rgba(232, 164, 58, ${this.opacity})`       // amber accent
      //   : `rgba(240, 237, 232, ${this.opacity * 0.5})`; // warm white
      // NEW v2 particle colours (neon yellow + crisp white):
      this.color = Math.random() > 0.7
        ? `rgba(230, 255, 0, ${this.opacity})`            // neon yellow
        : `rgba(255, 255, 255, ${this.opacity * 0.4})`;   // pure white
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width ||
          this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  // Draw connection lines between nearby particles
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 120;
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.08;
          ctx.save();
          // OLD v1: ctx.strokeStyle = `rgba(232, 164, 58, ${alpha})`;  // amber connection lines
          // NEW v2: neon yellow connection lines
          ctx.strokeStyle = `rgba(230, 255, 0, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }

  loop();
}

/* ──────────────────────────────────────────────
   HERO ANIMATIONS
────────────────────────────────────────────── */
function initHeroAnimations() {
  const words = qsAll('.hero-headline .word');
  const eyebrow = qs('.hero-eyebrow');
  const heroSub = qs('#hero-sub');
  const heroCta = qs('#hero-cta');
  const heroStats = qs('#hero-stats');
  const scrollHint = qs('.hero-scroll-hint');

  if (!words.length) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl
    .to(eyebrow, { y: 0, opacity: 1, duration: 0.6, delay: 0.1 })
    .to(words, {
      y: 0,
      duration: 0.9,
      stagger: 0.06,
      ease: 'power4.out'
    }, '-=0.3')
    .to(heroSub, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
    .to(heroCta, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
    .to(heroStats, { y: 0, opacity: 1, duration: 0.6 }, '-=0.3')
    .to(scrollHint, { opacity: 1, duration: 0.8 }, '-=0.2');

  // Parallax on hero blob
  const blob = qs('.hero-blob');
  if (blob) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      gsap.to(blob, { x, y, duration: 1.5, ease: 'power2.out' });
    });
  }
}

/* ──────────────────────────────────────────────
   COUNT-UP STATS
────────────────────────────────────────────── */
function initCountUp() {
  const statNumbers = qsAll('.stat-number[data-count]');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1800;
      const startTime = performance.now();

      function updateCount(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(updateCount);
        else el.textContent = target;
      }

      requestAnimationFrame(updateCount);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────────
   SCROLL-TRIGGERED REVEALS
────────────────────────────────────────────── */
function initScrollReveals() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Reveal text sections
  gsap.utils.toArray('.reveal-text').forEach(el => {
    gsap.from(el.querySelectorAll('span'), {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%'
      },
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    });
  });

  // Portfolio items
  gsap.from('.portfolio-item', {
    scrollTrigger: {
      trigger: '.portfolio-grid',
      start: 'top 85%'
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
  });

  // Service cards
  gsap.from('.service-card', {
    scrollTrigger: {
      trigger: '.services-grid',
      start: 'top 85%'
    },
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
  });

  // Testimonial
  const tQuote = qs('#testimonial-quote');
  if (tQuote) {
    gsap.from(tQuote, {
      scrollTrigger: {
        trigger: tQuote,
        start: 'top 85%'
      },
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power3.out'
    });
  }
}

/* ──────────────────────────────────────────────
   NAVBAR SCROLL BEHAVIOR
────────────────────────────────────────────── */
function initNavbar() {
  const navbar = qs('#navbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });
}

/* ──────────────────────────────────────────────
   HAMBURGER MENU
────────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger = qs('#hamburger');
  const mobileMenu = qs('#mobile-menu');
  const mobileLinks = qsAll('.mobile-nav-link');

  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  hamburger.addEventListener('click', () => {
    isOpen = !isOpen;
    hamburger.classList.toggle('open', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      isOpen = false;
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      mobileMenu.setAttribute('aria-hidden', true);
      document.body.style.overflow = '';
    });
  });
}

/* ──────────────────────────────────────────────
   PORTFOLIO CARD TILT
────────────────────────────────────────────── */
function initCardTilt() {
  const cards = qsAll('.portfolio-item, .featured-card');
  if (window.matchMedia('(hover: none)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateX: -y * 6,
        rotateY: x * 6,
        transformPerspective: 600,
        duration: 0.4,
        ease: 'power2.out'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'power3.out'
      });
    });
  });
}

/* ──────────────────────────────────────────────
   FEATURED HORIZONTAL SCROLL
────────────────────────────────────────────── */
function initFeaturedScroll() {
  const container = qs('#featured-scroll');
  const track = qs('#featured-track');
  const progressBar = qs('#feat-progress');
  const prevBtn = qs('#feat-prev');
  const nextBtn = qs('#feat-next');

  if (!container || !track) return;

  let isDown = false;
  let startX;
  let scrollLeftStart;

  // Drag to scroll
  container.addEventListener('mousedown', (e) => {
    isDown = true;
    container.classList.add('grabbing');
    startX = e.pageX - container.offsetLeft;
    scrollLeftStart = container.scrollLeft;
  });

  container.addEventListener('mouseleave', () => {
    isDown = false;
    container.classList.remove('grabbing');
  });

  container.addEventListener('mouseup', () => {
    isDown = false;
    container.classList.remove('grabbing');
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2;
    container.scrollLeft = scrollLeftStart - walk;
  });

  // Update progress bar
  function updateProgress() {
    const max = container.scrollWidth - container.clientWidth;
    const progress = max > 0 ? (container.scrollLeft / max) * 100 : 0;
    const cardWidth = 380 + 24; // card width + gap
    const cardIndex = Math.round(container.scrollLeft / cardWidth);
    const totalCards = track.children.length;
    if (progressBar) {
      progressBar.style.width = `${Math.max(25, ((cardIndex + 1) / totalCards) * 100)}%`;
    }
  }

  container.addEventListener('scroll', updateProgress, { passive: true });

  // Nav buttons
  const SCROLL_AMOUNT = 400;

  prevBtn?.addEventListener('click', () => {
    container.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
  });

  nextBtn?.addEventListener('click', () => {
    container.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
  });
}

/* ──────────────────────────────────────────────
   MAGNETIC BUTTONS
────────────────────────────────────────────── */
function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;

  const buttons = qsAll('.btn-primary, .btn-ghost');
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, {
        x: x * 0.25,
        y: y * 0.25,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)'
      });
    });
  });
}

/* ──────────────────────────────────────────────
   SERVICE CARD HOVER GLOW
────────────────────────────────────────────── */
function initServiceGlow() {
  const cards = qsAll('.service-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      // OLD v1 service card glow colour:
      // card.querySelector('.service-card-bg').style.background =
      //   `radial-gradient(circle at ${x}% ${y}%, rgba(232,164,58,0.08) 0%, transparent 60%)`;
      // NEW v2 — neon yellow spotlight:
      card.querySelector('.service-card-bg').style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(230,255,0,0.07) 0%, transparent 60%)`; // NEW v2
    });
  });
}

/* ──────────────────────────────────────────────
   GSAP SCROLL PARALLAX
────────────────────────────────────────────── */
function initParallax() {
  if (typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // About floats parallax
  gsap.to('.about-float-1', {
    y: -80,
    ease: 'none',
    scrollTrigger: {
      trigger: '.about-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5
    }
  });

  gsap.to('.about-float-2', {
    y: 60,
    ease: 'none',
    scrollTrigger: {
      trigger: '.about-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5
    }
  });

  // CTA glow pulse on scroll
  gsap.to('.cta-glow', {
    scale: 1.3,
    opacity: 0.5,
    ease: 'none',
    scrollTrigger: {
      trigger: '.cta-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 2
    }
  });
}

/* ──────────────────────────────────────────────
   TESTIMONIAL DOTS
────────────────────────────────────────────── */
function initTestimonialDots() {
  const dots = qsAll('.t-dot');
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      dots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });
}

/* ──────────────────────────────────────────────
   PORTFOLIO CATEGORY FILTER (subtle)
────────────────────────────────────────────── */
function initPortfolioHovers() {
  const items = qsAll('.portfolio-item');
  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      items.forEach(other => {
        if (other !== item) {
          gsap.to(other, { opacity: 0.6, duration: 0.3, ease: 'power2.out' });
        }
      });
    });
    item.addEventListener('mouseleave', () => {
      items.forEach(other => {
        gsap.to(other, { opacity: 1, duration: 0.4, ease: 'power2.out' });
      });
    });
  });
}

/* ──────────────────────────────────────────────
   MARQUEE SPEED ON HOVER
────────────────────────────────────────────── */
function initMarquee() {
  const inner = qs('.marquee-inner');
  if (!inner) return;

  // Already handled via CSS animation-play-state
  // Add entrance animation
  gsap.fromTo(inner, { opacity: 0, y: 10 }, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.marquee-section',
      start: 'top 90%',
    }
  });
}

/* ──────────────────────────────────────────────
   ABOUT SECTION TEXT ANIMATION
────────────────────────────────────────────── */
function initAboutAnimation() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const aboutBody = qs('.about-body');
  if (aboutBody) {
    gsap.from(aboutBody, {
      scrollTrigger: {
        trigger: aboutBody,
        start: 'top 80%'
      },
      opacity: 0,
      y: 30,
      duration: 1,
      ease: 'power3.out'
    });
  }

  const badges = qsAll('.badge');
  if (badges.length > 0) {
    gsap.from(badges, {
      scrollTrigger: {
        trigger: '.about-badges',
        start: 'top 85%'
      },
      opacity: 0,
      y: 15,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }
}

/* ──────────────────────────────────────────────
   FOOTER LINKS HOVER UNDERLINE
────────────────────────────────────────────── */
function initFooterHovers() {
  const links = qsAll('.footer-col a');
  links.forEach(link => {
    link.style.display = 'inline-flex';
    link.style.alignItems = 'center';
    link.style.gap = '0.3rem';
    link.style.transition = 'color 0.2s ease, gap 0.2s ease, letter-spacing 0.2s ease';
    link.addEventListener('mouseenter', () => {
      link.style.letterSpacing = '0.02em';
    });
    link.addEventListener('mouseleave', () => {
      link.style.letterSpacing = '';
    });
  });
}

/* ──────────────────────────────────────────────
   RIPPLE EFFECT ON CTA BUTTONS
────────────────────────────────────────────── */
function initRipple() {
  const buttons = qsAll('.btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        width: 10px; height: 10px;
        background: rgba(255,255,255,0.3);
        border-radius: 50%;
        transform: scale(0);
        pointer-events: none;
        left: ${x - 5}px;
        top: ${y - 5}px;
        z-index: 0;
      `;
      btn.appendChild(ripple);

      gsap.to(ripple, {
        scale: 25,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      });
    });
  });
}

/* ──────────────────────────────────────────────
   SECTION ENTRANCE WITH GSAP
────────────────────────────────────────────── */
function initSectionEntrances() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Featured cards stagger
  gsap.from('.featured-card', {
    scrollTrigger: {
      trigger: '.featured-scroll-container',
      start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out'
  });

  // Footer brand
  gsap.from('.footer-brand', {
    scrollTrigger: {
      trigger: '.footer',
      start: 'top 85%'
    },
    x: -20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  // Author info
  gsap.from('.testimonial-author', {
    scrollTrigger: {
      trigger: '.testimonial-author',
      start: 'top 85%'
    },
    y: 20,
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out'
  });
}

/* ──────────────────────────────────────────────
   PAGE TRANSITION OVERLAY (single page feel)
────────────────────────────────────────────── */
function initPageTransition() {
  // Subtle entrance animation for whole page
  gsap.fromTo('body', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' });
}

/* ──────────────────────────────────────────────
   INIT ALL
────────────────────────────────────────────── */
function init() {
  initScrollProgress();
  initSmoothScroll();
  initCustomCursor();
  initHeroCanvas();
  initNavbar();
  initMobileMenu();
  initScrollReveals();
  initCountUp();
  initCardTilt();
  initFeaturedScroll();
  initMagneticButtons();
  initServiceGlow();
  initParallax();
  initTestimonialDots();
  initPortfolioHovers();
  initMarquee();
  initAboutAnimation();
  initFooterHovers();
  initRipple();
  initSectionEntrances();
  initPageTransition();
}

// Wait for GSAP
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }
  initPreloader();
  init();
});

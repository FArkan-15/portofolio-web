/**
 * Portfolio — Main script
 * Handles: nav, scroll animations, form, back-to-top, cursor glow, toasts
 */

(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => document.body.classList.add('loaded'));
  } else {
    document.body.classList.add('loaded');
  }

  const nav = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const backToTop = document.getElementById('backToTop');
  const contactForm = document.getElementById('contactForm');
  const toast = document.getElementById('toast');
  const cursorGlow = document.querySelector('.cursor-glow');

  // ----- Smooth scroll for anchor links -----
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        navMenu?.classList.remove('open');
        navToggle?.classList.remove('active');
        document.body.style.overflow = '';
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ----- Navbar scroll state & active section -----
  const sections = Array.from(document.querySelectorAll('section[id]'))
    .map((s) => ({ id: s.id, top: s.offsetTop, height: s.offsetHeight }))
    .sort((a, b) => a.top - b.top);

  function updateNav() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight * 0.5;

    if (scrollY > 60) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }

    let activeId = 'home';
    for (let i = sections.length - 1; i >= 0; i--) {
      const s = sections[i];
      const top = s.top ?? 0;
      const height = s.height ?? vh;
      if (scrollY >= top - vh) {
        activeId = s.id;
        break;
      }
    }

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const id = href === '#' ? '' : href?.slice(1);
      link.classList.toggle('active', id === activeId);
    });
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  window.addEventListener('resize', updateNav);
  updateNav();

  // ----- Mobile menu -----
  navToggle?.addEventListener('click', function () {
    navMenu?.classList.toggle('open');
    navToggle?.classList.toggle('active');
    document.body.style.overflow = navMenu?.classList.contains('open') ? 'hidden' : '';
  });

  // ----- Back to top -----
  function updateBackToTop() {
    if (window.scrollY > 400) {
      backToTop?.classList.add('visible');
    } else {
      backToTop?.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ----- Toast -----
  function showToast(message, type = 'success') {
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // ----- Contact form -----
  contactForm?.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim();
    const message = document.getElementById('message')?.value?.trim();

    if (!name || !email || !message) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    // Simulate submit (replace with real endpoint)
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn?.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Sending...';
    }

    setTimeout(() => {
      showToast('Message sent successfully! I\'ll get back to you soon.');
      contactForm.reset();
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    }, 800);
  });

  // ----- Cursor glow (optional) -----
  if (cursorGlow) {
    let raf = 0;
    function moveGlow(e) {
      document.body.classList.add('cursor-glow-active');
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
      });
    }
    document.addEventListener('mousemove', moveGlow, { passive: true });
  }

  // ----- GSAP: Hero & scroll reveals -----
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero fade-in
    gsap.to('.hero .reveal', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.12,
      delay: 0.2,
      ease: 'power2.out',
    });

    // Parallax hero background
    gsap.to('.hero-glow-1', {
      y: -30,
      x: 20,
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    });
    gsap.to('.hero-glow-2', {
      y: 20,
      x: -20,
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    });

    // Section reveals
    gsap.utils.toArray('.section .reveal').forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  } else {
    // Fallback: Intersection Observer for .reveal
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  // ----- Skill bars: animate width on scroll -----
  const skillCategories = document.querySelectorAll('.skill-category');
  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const category = entry.target;
        category.classList.add('visible');
        category.querySelectorAll('.skill-fill').forEach((fill) => {
          const w = fill.getAttribute('data-width') || 0;
          fill.style.setProperty('--skill-width', w + '%');
        });
      });
    },
    { threshold: 0.3 }
  );
  skillCategories.forEach((el) => skillObserver.observe(el));

  // ----- Image load animation -----
  document.querySelectorAll('.about-image img, .project-image img').forEach((img) => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  });
})();

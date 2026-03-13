/* ============================================================================
   CLAIRE LEFEZ — PORTFOLIO JAVASCRIPT
   
   Features handled here:
     1. Navbar: scroll-based background + active section highlighting
     2. Mobile: hamburger menu toggle
     3. Smooth scroll (polyfill safety for older browsers)
     4. Project modal: open, populate, close (keyboard + click)
     5. Scroll-reveal: IntersectionObserver for .fade-in elements
     6. Skill bars: animate fill width on first scroll into view
     7. Footer year: auto-update copyright year
   ============================================================================ */

/* ─────────────────────────────────────────────────────────────────────────────
   UTILITIES
   Small helper functions used throughout the script.
───────────────────────────────────────────────────────────────────────────── */

/**
 * Shorthand for document.querySelector.
 * @param {string} selector - CSS selector
 * @param {Element} [ctx=document] - context element
 * @returns {Element|null}
 */
const qs  = (selector, ctx = document) => ctx.querySelector(selector);

/**
 * Shorthand for document.querySelectorAll, returns Array.
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {Element[]}
 */
const qsa = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];


/* ─────────────────────────────────────────────────────────────────────────────
   1. NAVBAR — SCROLL BEHAVIOUR & ACTIVE SECTION TRACKING
   - Adds .scrolled class when the user scrolls past 40px
     (triggers solid background via CSS).
   - Uses IntersectionObserver to detect which section is in view and
     highlights the corresponding nav link with .active class.
───────────────────────────────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar   = qs('#navbar');
  const navLinks = qsa('.nav-link');

  /* ── Scroll-based background ─────────────────────────────────────────── */
  function onScroll() {
    // Toggle .scrolled after 40px of scroll
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }

  // Passive scroll listener for performance
  window.addEventListener('scroll', onScroll, { passive: true });

  // Run once on load in case the page is already scrolled
  onScroll();

  /* ── Active section highlighting ────────────────────────────────────── */
  // Collect all the main sections that have a matching nav link
  const sections = qsa('section[id]');

  // IntersectionObserver: fires when a section enters/leaves the viewport.
  // rootMargin pushes the "trigger zone" so the link activates a bit before
  // the section fully enters the screen.
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        // Remove .active from all links, then add it to the matching one
        navLinks.forEach(link => link.classList.remove('active'));

        const activeLink = qs(
          `.nav-link[data-section="${entry.target.id}"]`
        );
        if (activeLink) activeLink.classList.add('active');
      });
    },
    {
      // Trigger when the top 60% of the viewport has the section
      rootMargin: `-${Math.floor(window.innerHeight * 0.35)}px 0px -40% 0px`,
      threshold: 0,
    }
  );

  sections.forEach(sec => sectionObserver.observe(sec));
})();


/* ─────────────────────────────────────────────────────────────────────────────
   2. MOBILE — HAMBURGER MENU TOGGLE
   Opens/closes the mobile nav links panel and updates aria-expanded.
───────────────────────────────────────────────────────────────────────────── */
(function initMobileMenu() {
  const toggle   = qs('#navToggle');
  const navLinks = qs('#navLinks');

  if (!toggle || !navLinks) return;

  /**
   * Toggle the mobile menu open or closed.
   */
  function toggleMenu() {
    const isOpen = navLinks.classList.toggle('is-open');
    // Update ARIA attribute so screen readers announce the state
    toggle.setAttribute('aria-expanded', isOpen.toString());
  }

  toggle.addEventListener('click', toggleMenu);

  // Close the menu when a link is clicked (smooth-scroll to section)
  qsa('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close the menu when clicking outside the navbar area
  document.addEventListener('click', (e) => {
    const navbar = qs('#navbar');
    if (navbar && !navbar.contains(e.target)) {
      navLinks.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();


/* ─────────────────────────────────────────────────────────────────────────────
   3. SMOOTH SCROLL — ANCHOR LINKS
   Native CSS scroll-behavior:smooth is set in the stylesheet, but this JS
   polyfill ensures reliable behaviour across older browsers and provides
   offset compensation for the fixed navbar.
───────────────────────────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  // Select all anchor links pointing to an on-page ID
  const anchorLinks = qsa('a[href^="#"]');
  const navbarH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--navbar-h') || '72',
    10
  );

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');

      // Skip if the href is just "#" (no real target)
      if (!targetId || targetId === '#') return;

      const target = qs(targetId);
      if (!target) return;

      e.preventDefault(); // We handle scrolling manually

      // Calculate offset: element top minus navbar height and a little extra
      const top = target.getBoundingClientRect().top + window.scrollY - navbarH - 8;

      window.scrollTo({ top, behavior: 'smooth' });

      // Update URL hash without adding to browser history stack
      history.replaceState(null, '', targetId);
    });
  });
})();


/* ─────────────────────────────────────────────────────────────────────────────
   4. PROJECT MODAL
   Each .project-card stores its content in data-* attributes.
   Clicking (or pressing Enter/Space on) a card:
     a) Reads the data attributes
     b) Populates the modal elements
     c) Opens the modal with animation
   Closing:
     - Click the × button
     - Click the dark overlay
     - Press Escape key
───────────────────────────────────────────────────────────────────────────── */
(function initModal() {
  /* ── Element references ─────────────────────────────────────────────── */
  const modal       = qs('#projectModal');
  const overlay     = qs('#modalOverlay');
  const closeBtn    = qs('#modalClose');
  const titleEl     = qs('#modalTitle');
  const dateEl      = qs('#modalDate');
  const descEl      = qs('#modalDescription');
  const skillsEl    = qs('#modalSkills');
  const linkEl      = qs('#modalLink');

  if (!modal) return; // Safety guard: don't run if the modal isn't in the DOM

  /* ── Track the element that opened the modal (for focus return) ───── */
  let lastFocusedCard = null;

  /**
   * Open the modal and fill it with data from the clicked card.
   * @param {HTMLElement} card - the .project-card element
   */
  function openModal(card) {
    // Store reference to return focus after closing
    lastFocusedCard = card;

    // ── Populate content ────────────────────────────────────────────────
    titleEl.textContent = card.dataset.title        || 'Project';
    dateEl.textContent  = card.dataset.date         || '';
    descEl.textContent  = card.dataset.description  || '';

    // Build skill badge elements from comma-separated string
    skillsEl.innerHTML = '';
    const skills = (card.dataset.skills || '').split(',').map(s => s.trim()).filter(Boolean);
    skills.forEach(skill => {
      const badge = document.createElement('span');
      badge.className   = 'skill-badge';
      badge.textContent = skill;
      skillsEl.appendChild(badge);
    });

    // Show/hide the external link based on whether data-link exists
    const link = card.dataset.link;
    if (link) {
      linkEl.href             = link;
      linkEl.removeAttribute('hidden');
    } else {
      linkEl.setAttribute('hidden', '');
    }

    // ── Open animation ──────────────────────────────────────────────────
    modal.classList.add('modal--open');
    modal.setAttribute('aria-hidden', 'false');

    // Prevent the page from scrolling behind the modal
    document.body.style.overflow = 'hidden';

    // Move keyboard focus into the modal (accessibility)
    closeBtn.focus();
  }

  /**
   * Close the modal and restore page scroll.
   */
  function closeModal() {
    modal.classList.remove('modal--open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Return focus to the card that triggered the modal
    if (lastFocusedCard) lastFocusedCard.focus();
  }

  /* ── Event listeners ────────────────────────────────────────────────── */

  // Close button click
  closeBtn.addEventListener('click', closeModal);

  // Overlay click
  overlay.addEventListener('click', closeModal);

  // Escape key — close if the modal is open
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('modal--open')) {
      closeModal();
    }
  });

  // ── Attach open listeners to every project card ──────────────────────
  qsa('.project-card').forEach(card => {
    // Mouse click
    card.addEventListener('click', () => openModal(card));

    // Keyboard: Enter or Space (since card is tabindex=0, not a <button>)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  /* ── Focus trap inside the modal ───────────────────────────────────── */
  // Prevent Tab from leaving the modal while it's open
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    // Find all focusable elements within the modal
    const focusable = qsa(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      modal
    ).filter(el => !el.hidden && !el.disabled);

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: if on first element, jump to last
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: if on last element, jump to first
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();


/* ─────────────────────────────────────────────────────────────────────────────
   5. SCROLL-REVEAL ANIMATION
   Uses IntersectionObserver to add .is-visible to .fade-in elements when
   they enter the viewport. CSS handles the actual transition.
───────────────────────────────────────────────────────────────────────────── */
(function initScrollReveal() {
  const fadeElements = qsa('.fade-in');

  // If no elements to observe (or browser doesn't support IO), bail out
  if (!fadeElements.length || !('IntersectionObserver' in window)) {
    // Fallback: make all elements visible immediately
    fadeElements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        // Add class to trigger CSS transition
        entry.target.classList.add('is-visible');

        // Stop observing once the element is revealed (one-shot animation)
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,  // trigger when 12% of the element is visible
      rootMargin: '0px 0px -40px 0px',
    }
  );

  fadeElements.forEach(el => revealObserver.observe(el));
})();


/* ─────────────────────────────────────────────────────────────────────────────
   6. SKILL BARS ANIMATION
   The .skill-bar-fill starts at width: 0 (set in CSS).
   When a skill bar scrolls into view, we set its width to the value
   from the parent's data-level attribute (0–100).
───────────────────────────────────────────────────────────────────────────── */
(function initSkillBars() {
  const skillBars = qsa('.skill-bar');

  if (!skillBars.length || !('IntersectionObserver' in window)) {
    // Fallback: fill bars immediately
    skillBars.forEach(bar => {
      const fill  = qs('.skill-bar-fill', bar);
      const level = bar.dataset.level || '0';
      if (fill) fill.style.width = `${level}%`;
    });
    return;
  }

  const barObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const fill  = qs('.skill-bar-fill', entry.target);
        const level = entry.target.dataset.level || '0';

        if (fill) {
          // Small delay so the fill animates after the section fades in
          setTimeout(() => {
            fill.style.width = `${level}%`;
          }, 200);
        }

        // Animate only once
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  skillBars.forEach(bar => barObserver.observe(bar));
})();


/* ─────────────────────────────────────────────────────────────────────────────
   7. FOOTER — AUTO-UPDATE COPYRIGHT YEAR
   Keeps the footer year current without needing manual updates.
───────────────────────────────────────────────────────────────────────────── */
(function initFooterYear() {
  const yearEl = qs('#footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();


/* ─────────────────────────────────────────────────────────────────────────────
   8. ACTIVE NAV ON PAGE LOAD (hash in URL)
   If the user arrives with a hash (e.g. portfolio.html#projects), we
   immediately highlight the corresponding nav link.
───────────────────────────────────────────────────────────────────────────── */
(function initHashNav() {
  const hash = window.location.hash;
  if (!hash) return;

  const link = qs(`.nav-link[href="${hash}"]`);
  if (link) {
    qsa('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  }
})();

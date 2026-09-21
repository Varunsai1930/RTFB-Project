/* ═══════════════════════════════════════════════════════════════
   INVISIWORK — NAVBAR
   Scroll behavior, desktop dropdown, mobile drawer logic.
   FIX #1 — Reads saved profile from localStorage on every page
   so name/avatar always reflect the current user, not hardcoded HTML.
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.getElementById('hamburger-btn');
  const drawer = document.getElementById('navbar-drawer');
  const dropdownTrigger = document.getElementById('dropdown-trigger');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const drawerDashBtn = document.getElementById('drawer-dash-btn');
  const drawerSub = document.getElementById('drawer-sub');


  /* ══════════════════════════════════════════
     FIX #1 — Sync navbar avatar + name from
     the real authenticated user. Checks:
     1. window.invisiworkUser (set by auth-guard)
     2. localStorage fallback
     Also listens for 'invisiwork:user-loaded'
     custom event in case auth-guard finishes later.
  ══════════════════════════════════════════ */
  syncNavbarProfile();

  // Listen for late-arriving user data from auth-guard
  window.addEventListener('invisiwork:user-loaded', syncNavbarProfile);

  function syncNavbarProfile() {
    const user = window.invisiworkUser || JSON.parse(localStorage.getItem('invisiwork-profile') || 'null');
    if (!user?.name) return; // nothing saved yet — keep HTML default

    const navAvatar = document.querySelector('.navbar__avatar');
    const navName = document.querySelector('.navbar__user-name');

    if (navAvatar) {
      const parts = user.name.trim().split(' ').filter(Boolean);
      const initials = parts.map(p => p[0].toUpperCase()).slice(0, 2).join('');
      navAvatar.textContent = initials;
    }

    if (navName) {
      navName.textContent = user.name;
    }
  }


  /* ══════════════════════════════════════════
     SCROLL SHADOW
  ══════════════════════════════════════════ */
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (navbar) {
          navbar.classList.toggle('navbar--scrolled', window.scrollY > 10);
        }
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });


  /* ══════════════════════════════════════════
     DESKTOP DROPDOWN (hover + click)
  ══════════════════════════════════════════ */
  if (dropdownTrigger && dropdownMenu) {
    const dropdownWrap = dropdownTrigger.closest('.navbar__dropdown-wrap');

    if (dropdownWrap) {
      dropdownWrap.addEventListener('mouseenter', () => dropdownMenu.classList.add('open'));
      dropdownWrap.addEventListener('mouseleave', () => dropdownMenu.classList.remove('open'));
    }

    dropdownTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      dropdownMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (dropdownWrap && !dropdownWrap.contains(e.target)) {
        dropdownMenu.classList.remove('open');
      }
    });
  }


  /* ══════════════════════════════════════════
     HAMBURGER / MOBILE DRAWER
  ══════════════════════════════════════════ */
  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      drawer.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', drawer.classList.contains('open'));
    });
  }


  /* ══════════════════════════════════════════
     DRAWER ACCORDION (Dashboard sub-links)
  ══════════════════════════════════════════ */
  if (drawerDashBtn && drawerSub) {
    drawerDashBtn.addEventListener('click', (e) => {
      e.preventDefault();
      drawerSub.classList.toggle('open');
      const chevron = drawerDashBtn.querySelector('.navbar__chevron');
      if (chevron) {
        chevron.style.transform = drawerSub.classList.contains('open')
          ? 'rotate(180deg)' : 'rotate(0)';
      }
    });
  }


  /* ══════════════════════════════════════════
     CLOSE DRAWER ON LINK CLICK
  ══════════════════════════════════════════ */
  if (drawer) {
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }


  /* ══════════════════════════════════════════
     CLOSE DRAWER ON RESIZE ABOVE MOBILE
  ══════════════════════════════════════════ */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      if (drawer) drawer.classList.remove('open');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    }
  });

});
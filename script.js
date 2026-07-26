(() => {
  "use strict";

  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");

  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-button");
  const nav = document.querySelector(".global-nav");
  const navLinks = nav ? [...nav.querySelectorAll("a")] : [];
  let lastFocusedElement = null;
  let lockedScrollY = 0;

  const isMenuOpen = () => Boolean(menuButton && menuButton.getAttribute("aria-expanded") === "true");

  const lockPage = () => {
    lockedScrollY = window.scrollY;
    document.body.classList.add("menu-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  };

  const unlockPage = () => {
    document.body.classList.remove("menu-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, lockedScrollY);
  };

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!menuButton || !nav) return;
    const wasOpen = isMenuOpen();
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "サイト案内を開く");
    nav.classList.remove("is-open");
    header?.classList.remove("menu-active");
    nav.scrollTop = 0;
    if (wasOpen) unlockPage();
    if (restoreFocus && lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  };

  const openMenu = () => {
    if (!menuButton || !nav) return;
    lastFocusedElement = document.activeElement;
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "サイト案内を閉じる");
    nav.classList.add("is-open");
    header?.classList.add("menu-active");
    nav.scrollTop = 0;
    lockPage();
    window.requestAnimationFrame(() => navLinks[0]?.focus());
  };

  if (menuButton && nav) {
    menuButton.setAttribute("aria-label", "サイト案内を開く");
    menuButton.addEventListener("click", () => isMenuOpen() ? closeMenu({ restoreFocus: true }) : openMenu());
    navLinks.forEach((link) => link.addEventListener("click", () => closeMenu()));

    document.addEventListener("keydown", (event) => {
      if (!isMenuOpen()) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu({ restoreFocus: true });
        return;
      }
      if (event.key === "Tab") {
        const focusable = [menuButton, ...navLinks].filter((el) => el && !el.hasAttribute("disabled"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960 && isMenuOpen()) closeMenu();
    });
  }

  const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 20);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const normalizePath = (pathname) => pathname.replace(/\/index\.html$/, "/");
  const currentPath = normalizePath(window.location.pathname);
  document.querySelectorAll(".global-nav a, .footer-links a, .footer-legal-links a").forEach((link) => {
    try {
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.hash) return;
      if (normalizePath(url.pathname) === currentPath) link.setAttribute("aria-current", "page");
    } catch {}
  });

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -35px 0px" });
    reveals.forEach((element) => observer.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add("is-visible"));
  }

  const details = [...document.querySelectorAll(".faq-list details")];
  details.forEach((item) => item.addEventListener("toggle", () => {
    if (!item.open) return;
    details.forEach((other) => { if (other !== item) other.removeAttribute("open"); });
  }));
})();

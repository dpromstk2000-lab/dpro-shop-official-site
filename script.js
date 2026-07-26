(() => {
  "use strict";

  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");

  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-button");
  const nav = document.querySelector(".global-nav");
  const navLinks = nav ? [...nav.querySelectorAll("a")] : [];
  let lastFocusedElement = null;

  const isMenuOpen = () =>
    Boolean(menuButton && menuButton.getAttribute("aria-expanded") === "true");

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!menuButton || !nav) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "メニューを開く");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    if (restoreFocus && lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  const openMenu = () => {
    if (!menuButton || !nav) return;
    lastFocusedElement = document.activeElement;
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "メニューを閉じる");
    nav.classList.add("is-open");
    document.body.classList.add("menu-open");
    window.requestAnimationFrame(() => navLinks[0]?.focus());
  };

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      if (isMenuOpen()) closeMenu({ restoreFocus: true });
      else openMenu();
    });

    navLinks.forEach((link) => link.addEventListener("click", () => closeMenu()));

    document.addEventListener("keydown", (event) => {
      if (!isMenuOpen()) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu({ restoreFocus: true });
        return;
      }

      if (event.key === "Tab") {
        const focusable = [menuButton, ...navLinks].filter(
          (element) => element && !element.hasAttribute("disabled")
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960) closeMenu();
    });
  }

  const updateHeader = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 20);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // Mark the current page in global/footer navigation.
  const normalizePath = (pathname) => {
    const withoutIndex = pathname.replace(/\/index\.html$/, "/");
    return withoutIndex.endsWith("/") ? withoutIndex : withoutIndex;
  };

  const currentPath = normalizePath(window.location.pathname);
  document
    .querySelectorAll(".global-nav a, .footer-links a, .footer-legal-links a")
    .forEach((link) => {
      try {
        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin || url.hash) return;
        if (normalizePath(url.pathname) === currentPath) {
          link.setAttribute("aria-current", "page");
        }
      } catch {
        // Ignore malformed URLs without interrupting the page.
      }
    });

  const reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -35px 0px" }
    );

    reveals.forEach((element) => observer.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add("is-visible"));
  }

  const details = [...document.querySelectorAll(".faq-list details")];
  details.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      details.forEach((other) => {
        if (other !== item) other.removeAttribute("open");
      });
    });
  });
})();

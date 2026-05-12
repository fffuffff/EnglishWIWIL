/* =====================================================
   How Social Media Impacts Teen Mental Health
   Interactivity: nav, smooth scroll, counters, quiz,
   goal localStorage, back-to-top, scroll reveal
   ===================================================== */

(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme toggle (light / dark) ---------- */
  const THEME_KEY = "teen-sm-theme";
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  const applyTheme = (theme) => {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  };

  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem(THEME_KEY);
  } catch (e) { /* ignore */ }

  if (savedTheme === "dark" || savedTheme === "light") {
    applyTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    });
  }

  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) {
      mq.addEventListener("change", (e) => {
        let stored = null;
        try { stored = localStorage.getItem(THEME_KEY); } catch (err) { /* ignore */ }
        if (!stored) applyTheme(e.matches ? "dark" : "light");
      });
    }
  }

  /* ---------- Sticky nav state on scroll ---------- */
  const navbar = document.getElementById("navbar");
  const onScroll = () => {
    if (window.scrollY > 24) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");

    const backToTop = document.getElementById("backToTop");
    if (backToTop) {
      if (window.scrollY > 400) backToTop.classList.add("visible");
      else backToTop.classList.remove("visible");
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll(".counter");
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const duration = 1500;
    const start = performance.now();
    const startVal = 0;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(startVal + (target - startVal) * eased);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };

    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window && counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => counterObserver.observe(c));
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Habits Quiz ---------- */
  const reflectBtn = document.getElementById("reflectBtn");
  const resetQuizBtn = document.getElementById("resetQuizBtn");
  const reflectionBox = document.getElementById("reflectionBox");
  const reflectionCount = document.getElementById("reflectionCount");
  const quizForm = document.getElementById("habitsQuiz");

  if (reflectBtn && reflectionBox && quizForm) {
    reflectBtn.addEventListener("click", () => {
      const checked = quizForm.querySelectorAll('input[type="checkbox"]:checked').length;
      const total = quizForm.querySelectorAll('input[type="checkbox"]').length;
      reflectionBox.hidden = false;
      reflectionCount.textContent = `You checked ${checked} of ${total} boxes.`;
      reflectionBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  if (resetQuizBtn && quizForm && reflectionBox) {
    resetQuizBtn.addEventListener("click", () => {
      quizForm.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
      reflectionBox.hidden = true;
    });
  }

  /* ---------- Goal box (localStorage) ---------- */
  const goalInput = document.getElementById("goalInput");
  const goalStatus = document.getElementById("goalStatus");
  const clearGoalBtn = document.getElementById("clearGoalBtn");
  const STORAGE_KEY = "teen-sm-goal";

  const setStatus = (text, fade = true) => {
    if (!goalStatus) return;
    goalStatus.textContent = text;
    if (fade) {
      goalStatus.style.opacity = "1";
      clearTimeout(setStatus._t);
      setStatus._t = setTimeout(() => {
        goalStatus.style.transition = "opacity 0.6s ease";
        goalStatus.style.opacity = "0.7";
      }, 1500);
    }
  };

  if (goalInput) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        goalInput.value = saved;
        setStatus("Goal restored from your last visit", false);
      } else {
        setStatus("Saved automatically", false);
      }
    } catch (err) {
      setStatus("Local storage unavailable", false);
    }

    let saveTimer;
    goalInput.addEventListener("input", () => {
      setStatus("Saving…", false);
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, goalInput.value);
          setStatus("Saved");
        } catch (err) {
          setStatus("Could not save");
        }
      }, 350);
    });
  }

  if (clearGoalBtn && goalInput) {
    clearGoalBtn.addEventListener("click", () => {
      goalInput.value = "";
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        /* ignore */
      }
      setStatus("Cleared");
      goalInput.focus();
    });
  }

  /* ---------- Scroll reveal for cards/sections ---------- */
  const revealTargets = document.querySelectorAll(
    ".section-header, .card, .callout, .quiz-card, .stat, .habit-list li, .steps li, .goal-box, .resource-card, .citation, .conclusion-card"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Active section highlighting in nav ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a");
  if ("IntersectionObserver" in window && sections.length && navAnchors.length) {
    const linkMap = new Map();
    navAnchors.forEach((a) => {
      const id = a.getAttribute("href").replace("#", "");
      linkMap.set(id, a);
    });

    const setActive = (id) => {
      navAnchors.forEach((a) => a.classList.remove("active"));
      const link = linkMap.get(id);
      if (link) link.classList.add("active");
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => sectionObserver.observe(s));
  }
})();

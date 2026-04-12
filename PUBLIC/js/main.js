/* ============================================================
   SWAYUP STUDIO — main.js
   GSAP animations + general interactivity
   ============================================================ */

(function () {
  "use strict";

  /* ---------- NAVBAR ---------- */
  function initNavbar() {
    const navbar = document.querySelector(".navbar");
    const burger = document.querySelector(".navbar__burger");
    const mobileNav = document.querySelector(".navbar__mobile");
    const dropdownTrigger = document.querySelector(".navbar__dropdown-trigger");
    const dropdown = document.querySelector(".nav-dropdown");
    const mobileServicesToggle = document.querySelector(".mobile-services-toggle");
    const mobileSubnav = document.querySelector(".mobile-subnav");

    if (!navbar) return;

    // Scroll class
    const onScroll = () => {
      navbar.classList.toggle("scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Burger
    if (burger && mobileNav) {
      burger.addEventListener("click", () => {
        burger.classList.toggle("open");
        mobileNav.classList.toggle("open");
        document.body.style.overflow = mobileNav.classList.contains("open") ? "hidden" : "";
      });
    }

    // Dropdown
    if (dropdownTrigger && dropdown) {
      dropdownTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains("open");
        dropdown.classList.toggle("open", !isOpen);
        dropdownTrigger.classList.toggle("open", !isOpen);
      });
      document.addEventListener("click", () => {
        dropdown.classList.remove("open");
        dropdownTrigger.classList.remove("open");
      });
      dropdown.addEventListener("click", (e) => e.stopPropagation());
    }

    // Mobile sub-menu toggle
    if (mobileServicesToggle && mobileSubnav) {
      mobileServicesToggle.addEventListener("click", () => {
        mobileSubnav.style.display = mobileSubnav.style.display === "none" ? "block" : "none";
      });
    }

    // Active link
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".navbar__nav a, .navbar__mobile a").forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.includes(currentPath)) {
        link.classList.add("active");
      }
    });
  }

  /* ---------- FAQ ACCORDION ---------- */
  function initFAQ() {
    document.querySelectorAll(".faq-item").forEach((item) => {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");
      if (!question || !answer) return;

      question.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        // Close all
        document.querySelectorAll(".faq-item.open").forEach((openItem) => {
          openItem.classList.remove("open");
          const ans = openItem.querySelector(".faq-answer");
          if (ans) ans.style.maxHeight = "0";
        });
        // Open clicked
        if (!isOpen) {
          item.classList.add("open");
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    });
  }

  /* ---------- SCROLL REVEAL (IntersectionObserver) ---------- */
  function initReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }

  /* ---------- FILTER TABS (portfolio page) ---------- */
  function initFilters() {
    const tabs = document.querySelectorAll(".filter-tab");
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        const cat = tab.dataset.filter;
        document.querySelectorAll(".portfolio-card, .filter-item").forEach((card) => {
          const cardCat = card.dataset.category;
          if (cat === "all" || !cat || cardCat === cat || !cardCat) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }

  /* ---------- FORMS ---------- */
  function initForms() {
    document.querySelectorAll("form[data-webhook]").forEach((form) => {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const url = form.dataset.webhook;
        const submitBtn = form.querySelector("button[type=submit]");
        const success = form.querySelector(".form-success");
        const error = form.querySelector(".form-error");

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Envoi en cours...";
        }

        const data = Object.fromEntries(new FormData(form));

        try {
          await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors",
            body: JSON.stringify(data),
          });
          if (success) success.style.display = "block";
          if (error) error.style.display = "none";
          form.reset();
        } catch (err) {
          if (error) error.style.display = "block";
          if (success) success.style.display = "none";
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.original || "Envoyer";
          }
        }
      });

      // Store original btn text
      const btn = form.querySelector("button[type=submit]");
      if (btn) btn.dataset.original = btn.textContent;
    });
  }

  /* ---------- HERO BLUEPRINT GRID (canvas animation) ---------- */
  function initBlueprintGrid() {
    const canvas = document.getElementById("blueprint-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const lines = [];
    const LINE_COUNT = 6;

    for (let i = 0; i < LINE_COUNT; i++) {
      lines.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        angle: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.4,
        length: 60 + Math.random() * 120,
        alpha: 0.1 + Math.random() * 0.15,
      });
    }

    let raf;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = "rgba(255,124,54,0.06)";
      ctx.lineWidth = 1;
      const size = 60;
      for (let x = 0; x < canvas.width; x += size) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += size) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Animated crosshairs
      lines.forEach((line) => {
        line.x += Math.cos(line.angle) * line.speed;
        line.y += Math.sin(line.angle) * line.speed;
        if (line.x < 0) line.x = canvas.width;
        if (line.x > canvas.width) line.x = 0;
        if (line.y < 0) line.y = canvas.height;
        if (line.y > canvas.height) line.y = 0;

        ctx.strokeStyle = `rgba(255,124,54,${line.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(line.x - line.length / 2, line.y);
        ctx.lineTo(line.x + line.length / 2, line.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(line.x, line.y - line.length / 2);
        ctx.lineTo(line.x, line.y + line.length / 2);
        ctx.stroke();

        // Small circle
        ctx.beginPath();
        ctx.arc(line.x, line.y, 3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,124,54,${line.alpha * 2})`;
        ctx.stroke();
      });

      raf = requestAnimationFrame(draw);
    }

    draw();

    // Pause when off-screen
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        raf = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(raf);
      }
    });
    obs.observe(canvas);
  }

  /* ---------- GSAP ANIMATIONS ---------- */
  function initGSAP() {
    if (typeof gsap === "undefined") return;

    // Register ScrollTrigger if available
    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Hero text stagger
    const heroTitle = document.querySelector(".hero__title");
    const heroDesc = document.querySelector(".hero__desc");
    const heroCtas = document.querySelector(".hero__ctas");
    const heroLabel = document.querySelector(".hero__label");

    if (heroTitle) {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (heroLabel) tl.from(heroLabel, { opacity: 0, y: 20, duration: 0.6 });
      tl.from(heroTitle, { opacity: 0, y: 40, duration: 0.9 }, "-=0.3");
      if (heroDesc) tl.from(heroDesc, { opacity: 0, y: 30, duration: 0.7 }, "-=0.5");
      if (heroCtas) tl.from(heroCtas, { opacity: 0, y: 20, duration: 0.6 }, "-=0.4");

      const arpenteur = document.querySelector(".hero__arpenteur");
      if (arpenteur) {
        tl.from(arpenteur, { opacity: 0, x: 60, duration: 1.0, ease: "power3.out" }, "-=1.2");
      }
    }

    // Service cards hover
    document.querySelectorAll(".service-card").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, { y: -6, duration: 0.3, ease: "power2.out" });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, { y: 0, duration: 0.3, ease: "power2.inOut" });
      });
    });

    // ScrollTrigger reveals (if available)
    if (typeof ScrollTrigger !== "undefined") {
      gsap.utils.toArray(".reveal").forEach((el) => {
        // Remove the CSS-based reveal and use GSAP
        el.classList.remove("reveal");
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        });
      });
    }
  }

  /* ---------- COUNTER ANIMATION ---------- */
  function initCounters() {
    const counters = document.querySelectorAll(".stat-item__value[data-count]");
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const duration = 1500;
        const step = (target / duration) * 16;
        let current = 0;

        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = (Number.isInteger(target) ? Math.round(current) : current.toFixed(1)) + suffix;
          if (current >= target) clearInterval(timer);
        }, 16);

        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach((el) => observer.observe(el));
  }

  /* ---------- SMOOTH MARQUEE (JS fallback) ---------- */
  function initMarquees() {
    // The CSS animation handles most marquees
    // Duplicate content for seamless loop
    document.querySelectorAll(".banderole__track, .reviews-track").forEach((track) => {
      if (track.dataset.duplicated) return;
      track.dataset.duplicated = "1";
      const clone = track.cloneNode(true);
      track.parentElement.appendChild(clone);
    });
  }

  /* ---------- INIT ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    initFAQ();
    initReveal();
    initFilters();
    initForms();
    initBlueprintGrid();
    initGSAP();
    initCounters();
    initMarquees();
  });
})();

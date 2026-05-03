/* ============================================================
   SWAYUP STUDIO — main.js
   GSAP animations + general interactivity
   ============================================================ */

(function () {
  "use strict";

  const NAVBAR_TEMPLATE = `
<nav class="navbar" role="navigation">
  <div class="navbar__inner">
    <a href="index.html" class="navbar__logo"><img src="assets/logo-navbar-noir-complet.svg" alt="Swayup studio" /></a>
    <div class="navbar__nav">
      <a href="index.html">Accueil</a>
      <div class="nav-dropdown-wrapper">
        <button class="navbar__dropdown-trigger">Services <svg class="chevron" viewBox="0 0 14 8" fill="none"><path d="M1 1L7 7L13 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <div class="nav-dropdown">
          <div class="nav-dropdown__col">
            <a href="site-web.html">Site web</a>
            <a href="identite-visuelle.html">Identité visuelle</a>
            <a href="support-catalogue.html">Supports physiques</a>
          </div>
        </div>
      </div>
      <a href="kit-gratuit-de-l'arpenteur.html">Kit Gratuit de l'Arpenteur</a>
      <a href="Réalisations.html">Réalisations</a>
      <a href="blog.html">Blog</a>
      <a href="contact.html">Contact</a>
    </div>
    <button class="navbar__burger" aria-label="Menu"><span></span><span></span><span></span></button>
  </div>
</nav>
<div class="navbar__mobile">
  <a href="index.html">Accueil</a>
  <button class="mobile-services-toggle" style="text-align:left;font-size:1.2rem;font-weight:500;padding:14px 0;border-bottom:1px solid #f0f0f0;width:100%;background:none;border-top:none;border-left:none;border-right:none;cursor:pointer;">Services ▾</button>
  <div class="mobile-subnav" style="display:none;padding-left:16px;">
    <a href="site-web.html">Site web</a>
    <a href="identite-visuelle.html">Identité visuelle</a>
    <a href="support-catalogue.html">Supports physiques</a>
  </div>
  <a href="kit-gratuit-de-l'arpenteur.html">Kit Gratuit de l'Arpenteur</a>
  <a href="Réalisations.html">Réalisations</a>
  <a href="blog.html">Blog</a>
  <a href="contact.html">Contact</a>
</div>`;

  const FOOTER_TEMPLATE = `
<footer class="footer">
  <div class="container">
    <div class="footer__main">
      <div class="footer__brand">
        <img src="assets/logo-navbar-noir-complet.svg" alt="Swayup studio" />
        <p>Studio créatif anti-agence pour PMEs et indépendants. Site web, identité visuelle et supports physiques.</p>
      </div>
      <div class="footer__col">
        <h5>Navigation</h5>
        <a href="index.html">Accueil</a>
        <a href="Réalisations.html">Réalisations</a>
        <a href="blog.html">Blog</a>
        <a href="contact.html">Contact</a>
      </div>
      <div class="footer__col">
        <h5>Services</h5>
        <a href="site-web.html">Site web</a>
        <a href="identite-visuelle.html">Identité visuelle</a>
        <a href="support-catalogue.html">Supports physiques</a>
      </div>
      <div class="footer__col">
        <h5>Ressources</h5>
        <a href="kit-gratuit-de-l'arpenteur.html">Kit Gratuit de l'Arpenteur</a>
      </div>
    </div>
    <div class="footer__bottom">
      <p>© 2026 Swayup studio. Tous droits réservés.</p>
    </div>
  </div>
</footer>`;

  const LINK_REWRITES = {
    "kit-gratuit.html": "kit-gratuit-de-l'arpenteur.html",
    "kit-gratuit-de-l%27arpenteur.html": "kit-gratuit-de-l'arpenteur.html",
    "galerie.html": "Réalisations.html",
    "realisations.html": "Réalisations.html",
    "graphisme.html": "identite-visuelle.html",
    "graphisme.html#reseaux": "identite-visuelle.html",
    "logo.html": "identite-visuelle.html",
    "site-vitrine.html": "site-web.html",
    "site-dynamique.html": "site-web.html",
    "site-ecommerce.html": "site-web.html",
  };

  function normalizeInterPageLinks() {
    document.querySelectorAll("a[href]").forEach((link) => {
      const href = (link.getAttribute("href") || "").trim();
      if (
        !href ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#")
      )
        return;
      const normalizedHref = href.replace(/^\.\//, "");
      const rewritten = LINK_REWRITES[normalizedHref];
      if (rewritten) link.setAttribute("href", rewritten);
    });
  }

  function injectGlobalLayout() {
    const body = document.body;
    if (!body) return;

    const main = body.querySelector("main");
    const nav = body.querySelector("nav.navbar");
    const mobileNav = body.querySelector(".navbar__mobile");

    if (nav) nav.remove();
    if (mobileNav) mobileNav.remove();

    if (main) {
      main.insertAdjacentHTML("beforebegin", NAVBAR_TEMPLATE);
    } else {
      body.insertAdjacentHTML("afterbegin", NAVBAR_TEMPLATE);
    }

    const footer = body.querySelector("footer");
    if (footer) {
      footer.outerHTML = FOOTER_TEMPLATE;
    } else {
      const firstScript = body.querySelector("script");
      if (firstScript) {
        firstScript.insertAdjacentHTML("beforebegin", FOOTER_TEMPLATE);
      } else {
        body.insertAdjacentHTML("beforeend", FOOTER_TEMPLATE);
      }
    }

    const footerBottom = body.querySelector(".footer__bottom");
    if (
      footerBottom &&
      !footerBottom.querySelector('a[href="mentions-legales.html"]')
    ) {
      const legalLinks = document.createElement("div");
      legalLinks.innerHTML =
        '<a href="mentions-legales.html">Mentions légales</a><a href="politique-confidentialite.html">Politique de confidentialité</a>';
      footerBottom.appendChild(legalLinks);
      const mentionsLink = legalLinks.querySelector(
        'a[href="mentions-legales.html"]',
      );
      const privacyLink = legalLinks.querySelector(
        'a[href="politique-confidentialite.html"]',
      );
      if (mentionsLink) {
        mentionsLink.textContent =
          "Mentions l" + String.fromCharCode(233) + "gales";
      }
      if (privacyLink) {
        privacyLink.textContent =
          "Politique de confidentialit" + String.fromCharCode(233);
      }
    }

    normalizeInterPageLinks();
  }

  /* ---------- NAVBAR ---------- */
  function initNavbar() {
    const navbar = document.querySelector(".navbar");
    const navbarInner = document.querySelector(".navbar__inner");
    const navbarNav = document.querySelector(".navbar__nav");
    const burger = document.querySelector(".navbar__burger");
    const mobileNav = document.querySelector(".navbar__mobile");
    const dropdownTrigger = document.querySelector(".navbar__dropdown-trigger");
    const dropdown = document.querySelector(".nav-dropdown");
    const mobileServicesToggle = document.querySelector(
      ".mobile-services-toggle",
    );
    const mobileSubnav = document.querySelector(".mobile-subnav");

    if (!navbar) return;

    // Desktop CTA on the right
    if (navbarInner && navbarNav) {
      let navbarRight = navbarInner.querySelector(".navbar__right");
      if (!navbarRight) {
        navbarRight = document.createElement("div");
        navbarRight.className = "navbar__right";
        navbarInner.insertBefore(navbarRight, burger);
      }

      const desktopContact = navbarNav.querySelector('a[href="contact.html"]');
      if (desktopContact) {
        desktopContact.className = "btn btn-cta1 btn-sm navbar__cta";
        navbarRight.replaceChildren(desktopContact);
      }
    }

    const serviceIcons = {
      "site-web.html": "assets/icon-siteweb.svg",
      "identite-visuelle.html": "assets/icon-graphisme.svg",
      "support-catalogue.html": "assets/icon-identite-visuelle.svg",
    };

    const decorateServiceLink = (link, iconClassName) => {
      const href = (link.getAttribute("href") || "").trim();
      if (!serviceIcons[href] || link.querySelector(`.${iconClassName}`)) return;

      const label = link.textContent.trim();
      link.textContent = "";

      const icon = document.createElement("img");
      icon.src = serviceIcons[href];
      icon.alt = "";
      icon.className = iconClassName;

      const text = document.createElement("span");
      text.textContent = label;

      link.append(icon, text);
    };

    // Desktop services dropdown: icons + richer rows
    if (dropdown) {
      dropdown
        .querySelectorAll(".nav-dropdown__col a")
        .forEach((link) => decorateServiceLink(link, "nav-icon"));
    }

    // Mobile services sub-menu: same icon treatment
    if (mobileSubnav) {
      mobileSubnav
        .querySelectorAll('a[href]')
        .forEach((link) => decorateServiceLink(link, "mobile-nav-icon"));
    }

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
        document.body.style.overflow = mobileNav.classList.contains("open")
          ? "hidden"
          : "";
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
        const isOpen = mobileSubnav.style.display !== "none";
        mobileSubnav.style.display = isOpen ? "none" : "block";
        mobileServicesToggle.classList.toggle("open", !isOpen);
      });
    }

    // Active link
    const currentPath =
      window.location.pathname.split("/").pop() || "index.html";
    document
      .querySelectorAll(".navbar__nav a, .navbar__right a, .navbar__mobile a")
      .forEach((link) => {
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

      if (!question.querySelector(".icon")) {
        const icon = document.createElement("span");
        icon.className = "icon";
        icon.setAttribute("aria-hidden", "true");
        question.appendChild(icon);
      }
      question.setAttribute("aria-expanded", "false");

      question.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        // Close all
        document.querySelectorAll(".faq-item.open").forEach((openItem) => {
          openItem.classList.remove("open");
          const ans = openItem.querySelector(".faq-answer");
          if (ans) ans.style.maxHeight = "0";
          const q = openItem.querySelector(".faq-question");
          if (q) q.setAttribute("aria-expanded", "false");
        });
        // Open clicked
        if (!isOpen) {
          item.classList.add("open");
          answer.style.maxHeight = answer.scrollHeight + "px";
          question.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* ---------- PRESTATION ACCORDION ---------- */
  function initPrestations() {
    document.querySelectorAll(".prestation-item").forEach((item) => {
      const header = item.querySelector(".prestation-header");
      const body = item.querySelector(".prestation-body");
      if (!header || !body) return;

      header.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        document
          .querySelectorAll(".prestation-item.open")
          .forEach((openItem) => {
            openItem.classList.remove("open");
            const b = openItem.querySelector(".prestation-body");
            if (b) b.style.maxHeight = "0";
            const h = openItem.querySelector(".prestation-header");
            if (h) h.setAttribute("aria-expanded", "false");
          });
        if (!isOpen) {
          item.classList.add("open");
          body.style.maxHeight = body.scrollHeight + "px";
          header.setAttribute("aria-expanded", "true");
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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }

  /* ---------- FILTER TABS (portfolio page) ---------- */
  function initFilters() {
    const tabs = document.querySelectorAll(".filter-tab");
    if (!tabs.length) return;

    const applyPortfolioFilter = (filterValue) => {
      document
        .querySelectorAll(".portfolio-card, .filter-item")
        .forEach((card) => {
          const cardFilter = (
            card.dataset.type ||
            card.dataset.category ||
            ""
          ).trim();
          const matches =
            filterValue === "all" ||
            !filterValue ||
            cardFilter === filterValue;

          card.style.display = matches ? "" : "none";
        });
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        applyPortfolioFilter(tab.dataset.filter);
      });
    });

    document.addEventListener("portfolio:refresh-filters", () => {
      const activeTab = document.querySelector(".filter-tab.active");
      applyPortfolioFilter(activeTab?.dataset.filter || "all");
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
        const successDefault =
          form.dataset.successDefault ||
          "Votre message a bien ete envoye.";
        const errorDefault =
          form.dataset.errorDefault ||
          "Impossible d'envoyer votre message pour le moment.";

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Envoi en cours...";
        }

        const data = Object.fromEntries(new FormData(form));

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
            },
            body: JSON.stringify(data),
          });

          const contentType = response.headers.get("content-type") || "";
          let payload = null;

          if (contentType.includes("application/json")) {
            payload = await response.json();
          } else {
            const text = await response.text();
            payload = text ? { message: text } : null;
          }

          const responseMessage =
            payload?.message ||
            payload?.data?.message ||
            payload?.success ||
            payload?.error ||
            payload?.details;

          if (!response.ok) {
            throw new Error(responseMessage || errorDefault);
          }

          if (success) {
            success.textContent = responseMessage || successDefault;
            success.style.display = "block";
          }
          if (error) {
            error.textContent = "";
            error.style.display = "none";
          }
          form.reset();
        } catch (err) {
          if (error) {
            error.textContent =
              err instanceof Error && err.message ? err.message : errorDefault;
            error.style.display = "block";
          }
          if (success) {
            success.textContent = "";
            success.style.display = "none";
          }
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

    const designNodes = [
      { x: 0.14, y: 0.26, r: 8, phase: 0.0 },
      { x: 0.36, y: 0.22, r: 7, phase: 0.9 },
      { x: 0.62, y: 0.25, r: 8, phase: 1.8 },
      { x: 0.84, y: 0.3, r: 6, phase: 2.7 },
      { x: 0.26, y: 0.62, r: 7, phase: 1.3 },
      { x: 0.5, y: 0.68, r: 9, phase: 2.2 },
      { x: 0.76, y: 0.62, r: 7, phase: 3.0 },
    ];

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let raf;
    let tick = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick += 0.012;

      // Grid
      ctx.strokeStyle = "rgba(255,124,54,0.045)";
      ctx.lineWidth = 1;
      const size = 64;
      for (let x = 0; x < canvas.width; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Technical guide lines
      ctx.setLineDash([6, 8]);
      ctx.strokeStyle = "rgba(255,124,54,0.12)";
      ctx.lineWidth = 1;
      [0.24, 0.5, 0.74].forEach((ratio) => {
        const y = canvas.height * ratio;
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.08, y);
        ctx.lineTo(canvas.width * 0.92, y);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Node network
      const points = designNodes.map((node, idx) => {
        const pulse = Math.sin(tick * 1.4 + node.phase) * 5;
        const driftX = Math.cos(tick + idx * 0.6) * 3;
        const driftY = Math.sin(tick * 0.9 + idx * 0.8) * 3;
        return {
          x: node.x * canvas.width + driftX,
          y: node.y * canvas.height + driftY,
          r: node.r + pulse * 0.12,
          a: 0.16 + (Math.sin(tick * 1.6 + node.phase) + 1) * 0.08,
        };
      });

      ctx.strokeStyle = "rgba(255,124,54,0.2)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < points.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[i + 1].x, points[i + 1].y);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[4].x, points[4].y);
      ctx.lineTo(points[6].x, points[6].y);
      ctx.stroke();

      points.forEach((p) => {
        ctx.strokeStyle = `rgba(255,124,54,${p.a})`;
        ctx.fillStyle = "rgba(255,124,54,0.08)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,124,54,0.55)";
        ctx.fill();
      });

      // Measurement sweep lines
      const scanX = (tick * 90) % canvas.width;
      const scanY = (tick * 55) % canvas.height;
      ctx.strokeStyle = "rgba(255,124,54,0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(scanX, 0);
      ctx.lineTo(scanX, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      // Orbit markers
      points.slice(1, 6).forEach((p, idx) => {
        const orbitR = 16 + idx * 2;
        const ox = p.x + Math.cos(tick * 1.3 + idx) * orbitR;
        const oy = p.y + Math.sin(tick * 1.3 + idx) * orbitR;
        ctx.fillStyle = "rgba(255,124,54,0.32)";
        ctx.beginPath();
        ctx.arc(ox, oy, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,124,54,0.1)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, orbitR, 0, Math.PI * 2);
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
      if (heroDesc)
        tl.from(heroDesc, { opacity: 0, y: 30, duration: 0.7 }, "-=0.5");
      if (heroCtas)
        tl.from(heroCtas, { opacity: 0, y: 20, duration: 0.6 }, "-=0.4");

      const arpenteur = document.querySelector(".hero__arpenteur");
      if (arpenteur) {
        tl.from(
          arpenteur,
          { opacity: 0, x: 60, duration: 1.0, ease: "power3.out" },
          "-=1.2",
        );
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

    initKitOfferStack();
  }

  function initKitOfferStack() {
    const list = document.querySelector(".kit-offers__list");
    if (!list) return;

    const cards = Array.from(list.querySelectorAll(".kit-offer-card"));
    if (cards.length < 2) return;
    let ticking = false;

    cards.forEach((card, index) => {
      card.style.zIndex = String(index + 1);
    });

    const resetCards = () => {
      cards.forEach((card) => {
        gsap.set(card, {
          y: 0,
          scale: 1,
          rotate: 0,
          boxShadow: "0 20px 60px rgba(22, 22, 22, 0.08)",
        });
      });
    };

    const updateCards = () => {
      ticking = false;

      const stickyTop = parseFloat(window.getComputedStyle(cards[0]).top) || 120;
      const start = window.innerHeight * 0.88;
      const end = stickyTop + 24;
      const compact = window.innerWidth <= 860;
      const yOffset = compact ? 22 : 34;
      const scaleOffset = compact ? 0.032 : 0.05;
      const rotateOffset = compact ? 0.55 : 1.1;

      cards.forEach((card, index) => {
        if (index === cards.length - 1) {
          gsap.set(card, {
            y: 0,
            scale: 1,
            rotate: 0,
            boxShadow: "0 20px 60px rgba(22, 22, 22, 0.08)",
          });
          return;
        }

        const nextCard = cards[index + 1];
        const nextTop = nextCard.getBoundingClientRect().top;
        const rawProgress = 1 - (nextTop - end) / (start - end);
        const progress = gsap.utils.clamp(0, 1, rawProgress);

        gsap.set(card, {
          y: -yOffset * progress,
          scale: 1 - scaleOffset * progress,
          rotate: -rotateOffset * progress,
          boxShadow: `0 ${20 - progress * 8}px ${60 - progress * 18}px rgba(22, 22, 22, ${0.08 - progress * 0.03})`,
        });
      });
    };

    const requestTick = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateCards);
    };

    resetCards();
    requestTick();

    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);
  }

  /* ---------- COUNTER ANIMATION ---------- */
  function initCounters() {
    const counters = document.querySelectorAll(".stat-item__value[data-count]");
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.count);
          const prefix = el.dataset.prefix || "";
          const suffix = el.dataset.suffix || "";
          const forcedDecimals = Number.isFinite(
            parseInt(el.dataset.decimals, 10),
          )
            ? parseInt(el.dataset.decimals, 10)
            : null;
          const duration = 1500;
          const step = (target / duration) * 16;
          let current = 0;

          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            const decimals =
              forcedDecimals !== null
                ? forcedDecimals
                : Number.isInteger(target)
                  ? 0
                  : 1;
            el.textContent =
              prefix +
              (decimals ? current.toFixed(decimals) : Math.round(current)) +
              suffix;
            if (current >= target) clearInterval(timer);
          }, 16);

          observer.unobserve(el);
        });
      },
      { threshold: 0.5 },
    );

    counters.forEach((el) => observer.observe(el));
  }

  /* ---------- SMOOTH MARQUEE (JS fallback) ---------- */
  function initMarquees() {
    // The CSS animation handles most marquees
    // Duplicate items inside the same track to keep one visual row
    document
      .querySelectorAll(".banderole__track, .reviews-track")
      .forEach((track) => {
        if (track.dataset.duplicated) return;
        track.dataset.duplicated = "1";
        const items = Array.from(track.children);
        items.forEach((item) => {
          const clone = item.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          track.appendChild(clone);
        });
      });
  }

  /* ---------- INIT ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    injectGlobalLayout();
    initNavbar();
    initFAQ();
    initPrestations();
    initReveal();
    initFilters();
    initForms();
    initBlueprintGrid();
    initGSAP();
    initCounters();
    initMarquees();
  });
})();

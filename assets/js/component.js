(() => {
  const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const initIcons = () => {
    if (!window.lucide) return;
    window.lucide.createIcons({
      attrs: {
        class: "td-lucide-icon",
        "aria-hidden": "true"
      }
    });
  };

  const initMotion = () => {
    const shouldReduce = reduceMotion();
    document.documentElement.classList.toggle("reduce-motion", shouldReduce);

    if (!window.AOS) return;

    window.AOS.init({
      disable: shouldReduce,
      duration: 460,
      easing: "ease-out",
      once: true,
      offset: 80
    });
  };

  const initNav = (nav) => {
    if (!nav) return;

    const toggle = nav.querySelector(".td-nav__toggle");
    const menu = nav.querySelector("#prototype-menu");

    const setOpen = (isOpen, shouldFocus = true) => {
      if (!toggle || !menu) return;

      toggle.setAttribute("aria-expanded", String(isOpen));
      menu.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("nav-open", isOpen);

      if (!shouldFocus) return;
      const target = isOpen ? menu.querySelector(focusableSelector) : toggle;
      target?.focus();
    };

    const updateScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });

    toggle?.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    menu?.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false, false);
    });

    document.addEventListener("keydown", (event) => {
      if (!toggle || !menu || toggle.getAttribute("aria-expanded") !== "true") return;

      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(menu.querySelectorAll(focusableSelector));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  };

  const initCarousel = (carousel) => {
    const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
    const previous = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    const dotsContainer = carousel.querySelector("[data-carousel-dots]");
    let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));

    if (!slides.length) return;

    const dots = dotsContainer
      ? slides.map((slide, index) => {
          const dot = document.createElement("button");
          dot.className = "td-carousel__dot";
          dot.type = "button";
          dot.setAttribute("aria-label", `Show slide ${index + 1}`);
          dot.addEventListener("click", () => setActive(index));
          dotsContainer.append(dot);
          return dot;
        })
      : [];

    function setActive(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });

      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === activeIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    }

    previous?.addEventListener("click", () => setActive(activeIndex - 1));
    next?.addEventListener("click", () => setActive(activeIndex + 1));
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActive(activeIndex - 1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActive(activeIndex + 1);
      }
    });

    setActive(activeIndex);
  };

  const getSplideOptions = (carousel) => {
    const shouldReduce = reduceMotion();
    const mode = carousel.dataset.splideCarousel;
    const shared = {
      arrows: false,
      pagination: false,
      autoplay: true,
      drag: !shouldReduce,
      speed: shouldReduce ? 0 : 420,
      waitForTransition: !shouldReduce
    };

    if (mode === "conditions") {
      return {
        ...shared,
        autoplay: false,
        type: "slide",
        perPage: 3,
        perMove: 1,
        gap: "18px",
        breakpoints: {
          1199: { perPage: 3 },
          991: { perPage: 2 },
          640: { perPage: 1 }
        }
      };
    }

    if (mode === "reels") {
      return {
        ...shared,
        autoplay: false,
        type: "loop",
        focus: "center",
        perPage: 5,
        perMove: 1,
        gap: "0px",
        trimSpace: false,
        breakpoints: {
          1023: { perPage: 3 },
          767: { perPage: 1, padding: "2rem" }
        }
      };
    }

    if (mode === "reviews") {
      return {
        ...shared,
        autoplay: false,
        type: "slide",
        rewind: true,
        perPage: 1,
        perMove: 1,
        autoHeight: true,
        gap: "18px"
      };
    }

    if (mode === "certificates") {
      return {
        ...shared,
        autoplay: false,
        type: "slide",
        rewind: true,
        perPage: 3,
        perMove: 1,
        gap: "18px",
        breakpoints: {
          991: { perPage: 2 },
          640: { perPage: 1 }
        }
      };
    }

    return {
      ...shared,
      type: "fade",
      rewind: true,
      autoHeight: true
    };
  };

  const initSplideCarousel = (carousel) => {
    if (!carousel || !window.Splide) return;

    const slides = Array.from(carousel.querySelectorAll(".splide__slide"));
    const previous = carousel.querySelector("[data-splide-prev]");
    const next = carousel.querySelector("[data-splide-next]");
    const dotsContainer = carousel.querySelector("[data-splide-dots]");

    if (!slides.length) return;

    const dots = dotsContainer
      ? slides.map((slide, index) => {
          const dot = document.createElement("button");
          dot.className = "td-carousel__dot";
          dot.type = "button";
          dot.setAttribute("aria-label", `Show slide ${index + 1}`);
          dot.addEventListener("click", () => splide.go(index));
          dotsContainer.append(dot);
          return dot;
        })
      : [];

    const splide = new window.Splide(carousel, getSplideOptions(carousel));

    const syncDots = () => {
      dots.forEach((dot, index) => {
        const isActive = index === splide.index;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    };

    previous?.addEventListener("click", () => splide.go("<"));
    next?.addEventListener("click", () => splide.go(">"));
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        splide.go("<");
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        splide.go(">");
      }
    });

    splide.on("mounted moved", syncDots);
    splide.mount();
  };

  const initCertificatePreview = (dialog) => {
    if (!dialog || !("showModal" in dialog)) return;

    const title = dialog.querySelector("#certificate-dialog-title");
    const meta = dialog.querySelector("[data-certificate-dialog-meta]");
    const note = dialog.querySelector("[data-certificate-dialog-note]");

    document.querySelectorAll("[data-certificate-preview]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        if (title) title.textContent = trigger.dataset.certificateTitle || "Credential preview";
        if (meta) meta.textContent = trigger.dataset.certificateMeta || "Approved image not supplied yet.";
        if (note) note.textContent = trigger.dataset.certificateNote || "This preview is a truthful placeholder, not an issued certificate image.";
        dialog.showModal();
      });
    });
  };

  const setCount = (element, value) => {
    element.textContent = `${value.toLocaleString("en-IN")}${element.dataset.suffix || ""}`;
  };

  const animateCount = (element) => {
    const target = Number.parseInt(element.dataset.count, 10);
    if (!Number.isFinite(target)) return;

    if (reduceMotion()) {
      setCount(element, target);
      return;
    }

    const duration = 850;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setCount(element, Math.round(target * progress));
      if (progress < 1) window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  };

  const initCounters = (targets) => {
    const counters = Array.from(targets);
    if (!counters.length) return;

    if (reduceMotion() || !("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach((counter) => observer.observe(counter));
  };

  const initScrollCarousel = (carousel) => {
    const track = carousel.querySelector(".td-scroll-carousel__track");
    const previous = carousel.querySelector("[data-scroll-prev]");
    const next = carousel.querySelector("[data-scroll-next]");

    if (!track) return;

    const scrollByCard = (direction) => {
      const card = track.firstElementChild;
      const distance = card ? card.getBoundingClientRect().width + 18 : track.clientWidth;
      track.scrollBy({ left: direction * distance, behavior: reduceMotion() ? "auto" : "smooth" });
    };

    previous?.addEventListener("click", () => scrollByCard(-1));
    next?.addEventListener("click", () => scrollByCard(1));
  };

  const initFaqGroup = (group) => {
    if (!group) return;

    const items = Array.from(group.querySelectorAll("details"));
    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        items.forEach((sibling) => {
          if (sibling !== item) sibling.open = false;
        });
      });
    });
  };

  const initContactForm = (form) => {
    if (!form) return;

    const status = form.querySelector("[data-form-status]");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const required = Array.from(form.querySelectorAll("[required]"));
      const firstInvalid = required.find((field) => !field.value.trim());

      if (firstInvalid) {
        if (status) status.textContent = "Please complete the required fields before opening WhatsApp.";
        firstInvalid.focus();
        return;
      }

      const data = new FormData(form);
      const message = [
        "Hi Tulika, I'd like to book a nutrition consultation.",
        `Name: ${data.get("name")}`,
        `Phone: ${data.get("phone")}`,
        `Concern: ${data.get("concern")}`,
        `Preferred location: ${data.get("location")}`,
        data.get("message") ? `Note: ${data.get("message")}` : ""
      ].filter(Boolean).join("\n");

      window.location.href = `https://wa.me/919051177544?text=${encodeURIComponent(message)}`;
    });
  };

  window.TDComponents = {
    reduceMotion,
    initIcons,
    initMotion,
    initNav,
    initCarousel,
    initSplideCarousel,
    initCertificatePreview,
    initCounters,
    initScrollCarousel,
    initFaqGroup,
    initContactForm
  };
})();

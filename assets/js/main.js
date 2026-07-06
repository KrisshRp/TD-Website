(() => {
  document.documentElement.classList.add("js");

  const components = window.TDComponents;
  if (!components) return;

  components.initIcons();
  components.initMotion();
  components.initNav(document.querySelector("[data-nav]"));
  document.querySelectorAll("[data-splide-carousel]").forEach(components.initSplideCarousel);
  document.querySelectorAll("[data-carousel]").forEach(components.initCarousel);
  document.querySelectorAll("[data-scroll-carousel]").forEach(components.initScrollCarousel);
  document.querySelectorAll("[data-faq-group]").forEach(components.initFaqGroup);
  components.initCounters(document.querySelectorAll("[data-count]"));
  components.initContactForm(document.querySelector("[data-contact-form]"));
})();

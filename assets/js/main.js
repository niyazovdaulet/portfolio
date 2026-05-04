(function () {
  "use strict";

  var body = document.body;
  var menuBtn = document.getElementById("menuToggle");
  var overlay = document.getElementById("navOverlay");

  function setNavOpen(open) {
    body.classList.toggle("nav-open", open);
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    if (overlay) overlay.setAttribute("aria-hidden", open ? "false" : "true");
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      setNavOpen(!body.classList.contains("nav-open"));
    });
  }

  if (overlay) {
    overlay.addEventListener("click", function () {
      setNavOpen(false);
    });
  }

  document.querySelectorAll("[data-close-nav]").forEach(function (el) {
    el.addEventListener("click", function () {
      setNavOpen(false);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setNavOpen(false);
  });

  /* Spotlight screenshot galleries (scroll-snap + arrows + dots) */
  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      var args = arguments;
      t = setTimeout(function () {
        fn.apply(null, args);
      }, ms);
    };
  }

  function initSpotlightGallery(root) {
    var viewport = root.querySelector(".spotlight-gallery-viewport");
    var track = root.querySelector(".spotlight-gallery-track");
    var slides = track ? track.querySelectorAll(".spotlight-gallery-slide") : [];
    var prevBtn = root.querySelector(".spotlight-gallery-prev");
    var nextBtn = root.querySelector(".spotlight-gallery-next");
    var dotsRoot = root.querySelector(".spotlight-gallery-dots");
    if (!viewport || !track || slides.length === 0 || !dotsRoot) return;

    var dotButtons = [];

    function slideWidth() {
      return viewport.clientWidth;
    }

    function setDots() {
      dotsRoot.innerHTML = "";
      dotButtons = [];
      for (var i = 0; i < slides.length; i++) {
        (function (index) {
          var b = document.createElement("button");
          b.type = "button";
          b.setAttribute("aria-label", "Screenshot " + (index + 1));
          b.setAttribute("aria-current", index === 0 ? "true" : "false");
          b.addEventListener("click", function () {
            var w = slideWidth();
            viewport.scrollTo({ left: index * w, behavior: prefersReducedMotion() ? "auto" : "smooth" });
          });
          dotsRoot.appendChild(b);
          dotButtons.push(b);
        })(i);
      }
    }

    function prefersReducedMotion() {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function layoutSlides() {
      var w = slideWidth();
      for (var i = 0; i < slides.length; i++) {
        slides[i].style.flex = "0 0 " + w + "px";
      }
      syncDotsFromScroll();
    }

    function syncDotsFromScroll() {
      var w = slideWidth();
      if (w <= 0) return;
      var idx = Math.round(viewport.scrollLeft / w);
      if (idx < 0) idx = 0;
      if (idx >= dotButtons.length) idx = dotButtons.length - 1;
      for (var j = 0; j < dotButtons.length; j++) {
        dotButtons[j].setAttribute("aria-current", j === idx ? "true" : "false");
      }
    }

    function scrollBySlides(dir) {
      var w = slideWidth();
      var next = viewport.scrollLeft + dir * w;
      var max = Math.max(0, (slides.length - 1) * w);
      if (next < 0) next = 0;
      if (next > max) next = max;
      viewport.scrollTo({ left: next, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }

    setDots();
    layoutSlides();

    if (prevBtn) prevBtn.addEventListener("click", function () { scrollBySlides(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { scrollBySlides(1); });

    viewport.addEventListener("scroll", function () {
      syncDotsFromScroll();
    }, { passive: true });

    window.addEventListener(
      "resize",
      debounce(function () {
        layoutSlides();
      }, 120)
    );

    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(function () {
        layoutSlides();
      });
      ro.observe(viewport);
    }
  }

  document.querySelectorAll("[data-spotlight-gallery]").forEach(function (root) {
    initSpotlightGallery(root);
  });
})();

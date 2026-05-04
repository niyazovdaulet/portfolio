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

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /** @param {HTMLElement} dialog */
  function initSpotlightLightbox(dialog) {
    if (!dialog) return;
    var img = dialog.querySelector(".spotlight-lightbox__img");
    dialog.querySelectorAll("[data-spotlight-lightbox-close]").forEach(function (el) {
      el.addEventListener("click", function () {
        dialog.close();
      });
    });
    dialog.addEventListener("cancel", function (e) {
      e.preventDefault();
      dialog.close();
    });
    return {
      open: function (src, alt) {
        if (!img) return;
        img.src = src;
        img.alt = alt || "";
        if (typeof dialog.showModal === "function") dialog.showModal();
      },
    };
  }

  /**
   * Product-style 3D-ish carousel with autoplay, drag, parallax, and lightbox.
   * @param {HTMLElement} root .spotlight-gallery
   * @param {{ open: (src: string, alt?: string) => void }} lightbox
   */
  function SpotlightShowcase(root, lightbox) {
    var showcase = root.querySelector(".spotlight-showcase");
    var stageWrap = root.querySelector(".spotlight-showcase__stage-wrap");
    var track = root.querySelector(".spotlight-showcase__track");
    var slides = track ? Array.prototype.slice.call(track.querySelectorAll(".spotlight-showcase__slide")) : [];
    var prevBtn = root.querySelector(".spotlight-showcase__fab--prev");
    var nextBtn = root.querySelector(".spotlight-showcase__fab--next");
    var kickerEl = root.querySelector(".spotlight-showcase__kicker");
    var titleEl = root.querySelector(".spotlight-showcase__title");
    var descEl = root.querySelector(".spotlight-showcase__desc");
    var caption = root.querySelector(".spotlight-showcase__caption");
    var ambient = root.querySelector(".spotlight-showcase__ambient");
    var ticksRoot = root.querySelector(".spotlight-showcase__ticks");
    var shell = root.querySelector(".spotlight-showcase__shell");
    var progressFill = root.querySelector(".spotlight-showcase__progress-fill");

    if (!showcase || !stageWrap || slides.length === 0 || !ticksRoot || !caption) return;

    var autoplayMs = parseInt(root.getAttribute("data-spotlight-autoplay-ms") || "8000", 10);
    var index = 0;
    var dragX = 0;
    var dragStartX = 0;
    var dragging = false;
    var pointerId = null;
    var tickButtons = [];
    var autoplayTimer = null;
    var reduceMotion = prefersReducedMotion();
    var hoverPaused = false;
    var lastWasTap = false;

    function clamp(n, lo, hi) {
      return Math.max(lo, Math.min(hi, n));
    }

    function buildTicks() {
      ticksRoot.innerHTML = "";
      tickButtons = [];
      for (var i = 0; i < slides.length; i++) {
        (function (idx) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "spotlight-showcase__tick";
          b.setAttribute("role", "tab");
          b.setAttribute("aria-label", "Screenshot " + (idx + 1));
          b.setAttribute("aria-selected", idx === 0 ? "true" : "false");
          b.setAttribute("aria-current", idx === 0 ? "true" : "false");
          b.addEventListener("click", function () {
            goTo(idx);
          });
          ticksRoot.appendChild(b);
          tickButtons.push(b);
        })(i);
      }
    }

    function syncTicks() {
      for (var j = 0; j < tickButtons.length; j++) {
        var on = j === index;
        tickButtons[j].setAttribute("aria-current", on ? "true" : "false");
        tickButtons[j].setAttribute("aria-selected", on ? "true" : "false");
      }
    }

    function activeSlide() {
      return slides[index];
    }

    function applyAmbient() {
      var s = activeSlide();
      if (!s || !ambient) return;
      var a = s.getAttribute("data-glow-a") || "#6366f1";
      var b = s.getAttribute("data-glow-b") || "#0f0f12";
      showcase.style.setProperty("--spot-glow-a", a);
      showcase.style.setProperty("--spot-glow-b", b);
    }

    function updateCaption() {
      var s = activeSlide();
      if (!s || !kickerEl || !titleEl || !descEl) return;
      kickerEl.textContent = s.getAttribute("data-kicker") || "";
      titleEl.textContent = s.getAttribute("data-title") || "";
      descEl.textContent = s.getAttribute("data-desc") || "";
      caption.classList.remove("is-entering");
      void caption.offsetWidth;
      if (!reduceMotion) caption.classList.add("is-entering");
    }

    function offsetPerSlide() {
      var w = stageWrap.clientWidth || 360;
      return clamp(w * 0.34, 120, 220);
    }

    function render() {
      var step = offsetPerSlide();
      for (var i = 0; i < slides.length; i++) {
        var d = i - index;
        var ad = Math.abs(d);
        var x = d * step + dragX;
        var scale = d === 0 ? 1 : ad === 1 ? 0.82 : 0.68;
        var rot = clamp(d * -11, -22, 22);
        var opacity = d === 0 ? 1 : ad === 1 ? 0.52 : 0.2;
        var blur = ad > 1 ? 2.5 : ad === 1 ? 0.6 : 0;
        var z = d === 0 ? 80 : ad === 1 ? 40 : 10;
        var el = slides[i];
        el.style.transform =
          "translate(-50%, -50%) translateX(" +
          x +
          "px) translateZ(" +
          (d === 0 ? 24 : 0) +
          "px) rotateY(" +
          rot +
          "deg) scale(" +
          scale +
          ")";
        el.style.opacity = String(opacity);
        el.style.filter = blur > 0 ? "blur(" + blur + "px)" : "none";
        el.style.zIndex = String(z);
        el.classList.toggle("is-active", d === 0);
        el.classList.toggle("is-near", ad === 1);
        el.classList.toggle("is-far", ad > 1);
        var dev = el.querySelector(".spotlight-showcase__device");
        if (dev) {
          if (d === 0) dev.removeAttribute("tabindex");
          else dev.setAttribute("tabindex", "-1");
        }
        var img = el.querySelector("img");
        if (img && ad <= 1) img.setAttribute("loading", "eager");
      }
      applyAmbient();
    }

    function restartProgressAnimation() {
      if (!showcase || !progressFill || reduceMotion) return;
      showcase.classList.remove("is-autoplaying");
      void progressFill.offsetWidth;
      showcase.classList.add("is-autoplaying");
      progressFill.style.animationDuration = autoplayMs / 1000 + "s";
    }

    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = null;
      showcase.classList.remove("is-autoplaying");
    }

    function startAutoplay() {
      stopAutoplay();
      if (reduceMotion || hoverPaused) return;
      restartProgressAnimation();
      autoplayTimer = window.setInterval(function () {
        goTo((index + 1) % slides.length);
      }, autoplayMs);
    }

    function goTo(i) {
      var next = ((i % slides.length) + slides.length) % slides.length;
      index = next;
      dragX = 0;
      syncTicks();
      updateCaption();
      render();
      startAutoplay();
    }

    function step(dir) {
      goTo(index + dir);
    }

    function onParallax() {
      if (!shell || reduceMotion) return;
      var rect = root.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      var center = rect.top + rect.height * 0.45;
      var t = 1 - clamp(center / vh, 0, 1);
      var y = (t - 0.5) * 18;
      shell.style.setProperty("--spotlight-parallax", y.toFixed(2) + "px");
    }

    buildTicks();
    updateCaption();
    render();

    if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });

    track.addEventListener("click", function (e) {
      var slide = e.target.closest(".spotlight-showcase__slide");
      if (!slide) return;
      var i = slides.indexOf(slide);
      if (i < 0) return;
      if (!slide.classList.contains("is-active")) {
        goTo(i);
        return;
      }
      if (!lastWasTap || !e.target.closest(".spotlight-showcase__device")) return;
      var im = slide.querySelector("img");
      if (im && lightbox) lightbox.open(im.currentSrc || im.src, im.getAttribute("alt") || "");
    });

    stageWrap.addEventListener(
      "pointerdown",
      function (e) {
        if (e.button !== 0) return;
        lastWasTap = false;
        dragging = true;
        pointerId = e.pointerId;
        dragStartX = e.clientX;
        dragX = 0;
        stageWrap.setPointerCapture(e.pointerId);
      },
      { passive: true }
    );

    stageWrap.addEventListener("pointermove", function (e) {
      if (!dragging || e.pointerId !== pointerId) return;
      dragX = e.clientX - dragStartX;
      render();
    });

    function endDrag(e) {
      if (!dragging) return;
      if (e.type === "pointerup" && e.pointerId !== pointerId) return;
      dragging = false;
      var threshold = 48;
      lastWasTap = false;
      if (dragX > threshold) step(-1);
      else if (dragX < -threshold) step(1);
      else {
        lastWasTap = Math.abs(dragX) < 10;
        dragX = 0;
        render();
      }
      pointerId = null;
      try {
        if (e.pointerId) stageWrap.releasePointerCapture(e.pointerId);
      } catch (err) {
        /* ignore */
      }
    }

    stageWrap.addEventListener("pointerup", endDrag);
    stageWrap.addEventListener("pointercancel", endDrag);

    showcase.addEventListener("mouseenter", function () {
      hoverPaused = true;
      showcase.classList.add("is-autoplay-paused");
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = null;
    });
    showcase.addEventListener("mouseleave", function () {
      hoverPaused = false;
      showcase.classList.remove("is-autoplay-paused");
      if (!reduceMotion) startAutoplay();
    });

    window.addEventListener("scroll", onParallax, { passive: true });
    window.addEventListener("resize", debounce(render, 100));
    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(function () {
        render();
      });
      ro.observe(stageWrap);
    }

    onParallax();
    if (!reduceMotion) startAutoplay();
  }

  var lightboxDialog = document.querySelector("[data-spotlight-lightbox]");
  var lb = initSpotlightLightbox(lightboxDialog);

  document.querySelectorAll("[data-spotlight-gallery]").forEach(function (root) {
    SpotlightShowcase(root, lb);
  });
})();

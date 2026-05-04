(function () {
  "use strict";

  var body = document.body;
  var menuBtn = document.getElementById("menuToggle");
  var overlay = document.getElementById("navOverlay");
  var drawer = document.getElementById("navDrawer");
  var track = document.getElementById("carouselTrack");
  var prevBtn = document.getElementById("carouselPrev");
  var nextBtn = document.getElementById("carouselNext");
  var dots = document.querySelectorAll(".carousel-dots button");

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

  /* Carousel */
  var slideIndex = 0;

  function slideCount() {
    return track ? track.children.length : 0;
  }

  function goTo(index) {
    var n = slideCount();
    if (!track || n === 0) return;
    slideIndex = ((index % n) + n) % n;
    var w = track.parentElement.offsetWidth;
    track.style.transform = "translateX(" + -slideIndex * w + "px)";
    dots.forEach(function (d, i) {
      d.setAttribute("aria-current", i === slideIndex ? "true" : "false");
    });
  }

  function next() {
    goTo(slideIndex + 1);
  }

  function prev() {
    goTo(slideIndex - 1);
  }

  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (nextBtn) nextBtn.addEventListener("click", next);

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      goTo(i);
    });
  });

  var resizeTimer;
  window.addEventListener(
    "resize",
    function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        goTo(slideIndex);
      }, 120);
    },
    { passive: true }
  );

  if (track) goTo(0);
})();

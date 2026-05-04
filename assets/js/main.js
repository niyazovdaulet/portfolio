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
})();

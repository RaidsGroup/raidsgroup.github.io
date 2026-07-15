(function () {
  var mobileQuery = window.matchMedia("(max-width: 740px)");
  var COLLAPSE_MAX = 168;
  var details = [];
  var resizeTimer = null;

  function ensureToggle(detail) {
    var toggle = detail.querySelector(".faculty-bio-toggle");
    if (toggle) {
      return toggle;
    }

    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "faculty-bio-toggle";
    toggle.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML =
      '<span class="faculty-bio-toggle-label">Show more</span>' +
      '<span class="faculty-bio-toggle-icon" aria-hidden="true"></span>';

    toggle.addEventListener("click", function () {
      if (!mobileQuery.matches) {
        return;
      }
      var expanded = detail.classList.toggle("is-expanded");
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      var label = toggle.querySelector(".faculty-bio-toggle-label");
      if (label) {
        label.textContent = expanded ? "Show less" : "Show more";
      }
    });

    detail.appendChild(toggle);
    return toggle;
  }

  function resetDetail(detail) {
    var bio = detail.querySelector(".faculty-bio");
    var toggle = detail.querySelector(".faculty-bio-toggle");

    detail.classList.remove("is-collapsible", "is-expanded");
    if (bio) {
      bio.style.maxHeight = "";
      bio.style.overflow = "";
      bio.style.webkitMaskImage = "";
      bio.style.maskImage = "";
    }
    if (toggle) {
      toggle.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      var label = toggle.querySelector(".faculty-bio-toggle-label");
      if (label) {
        label.textContent = "Show more";
      }
    }
  }

  function syncDetail(detail) {
    var bio = detail.querySelector(".faculty-bio");
    if (!bio) {
      return;
    }

    var wasExpanded = detail.classList.contains("is-expanded");
    resetDetail(detail);

    if (!mobileQuery.matches) {
      return;
    }

    if (bio.scrollHeight <= COLLAPSE_MAX + 24) {
      return;
    }

    detail.classList.add("is-collapsible");
    if (wasExpanded) {
      detail.classList.add("is-expanded");
    }

    var toggle = ensureToggle(detail);
    toggle.hidden = false;
    toggle.setAttribute("aria-expanded", wasExpanded ? "true" : "false");
    var label = toggle.querySelector(".faculty-bio-toggle-label");
    if (label) {
      label.textContent = wasExpanded ? "Show less" : "Show more";
    }
  }

  function syncAll() {
    details.forEach(syncDetail);
  }

  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(syncAll, 120);
  }

  function init() {
    details = Array.prototype.slice.call(document.querySelectorAll(".faculty-detail"));
    if (!details.length) {
      return;
    }

    syncAll();

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", syncAll);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(syncAll);
    }

    window.addEventListener("resize", onResize);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

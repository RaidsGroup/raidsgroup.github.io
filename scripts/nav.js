(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var desktopQuery = window.matchMedia("(min-width: 741px)");
  var body = document.body;
  var typedKeys = "";
  var konamiKeys = [];
  var eggsPromise = null;
  var konamiSequence = [
    "arrowup",
    "arrowup",
    "arrowdown",
    "arrowdown",
    "arrowleft",
    "arrowright",
    "arrowleft",
    "arrowright",
    "b",
    "a"
  ];
  var hiddenCommands = [
    { length: 6, hash: "fcc15595", action: "piSummon" }
  ];
  var hiddenPiShortcut = { length: 3, hash: "4e55ed59", action: "piMeeting" };
  var konamiLabStorageKey = "raids-secret-lab-active";

  if (!header || !toggle || !nav) {
    return;
  }

  function isDesktop() {
    return desktopQuery.matches;
  }

  function closeDropdowns() {
    nav.querySelectorAll(".nav-dropdown.is-open").forEach(function (dropdown) {
      dropdown.classList.remove("is-open");
      var btn = dropdown.querySelector(".nav-dropdown-toggle");
      if (btn) {
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setOpen(open) {
    header.classList.toggle("is-nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (!open) {
      closeDropdowns();
    }
  }

  function hasKonamiLabPersisted() {
    try {
      return window.sessionStorage.getItem(konamiLabStorageKey) === "1";
    } catch (error) {
      return false;
    }
  }

  function loadStylesheet(href) {
    return new Promise(function (resolve) {
      var existing = document.querySelector('link[href="' + href + '"]');
      var link;

      if (existing) {
        resolve();
        return;
      }

      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = resolve;
      link.onerror = resolve;
      document.head.appendChild(link);
    });
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      var script;

      if (existing) {
        resolve();
        return;
      }

      script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  function loadEggs() {
    if (!eggsPromise) {
      eggsPromise = loadStylesheet("styles/effects.css").then(function () {
        return loadScript("scripts/effects/eggs.js");
      });
    }
    return eggsPromise;
  }

  function triggerEgg(action, event) {
    loadEggs().then(function () {
      if (window.RAIDSEggs && typeof window.RAIDSEggs.trigger === "function") {
        window.RAIDSEggs.trigger(action, event);
      }
    });
  }

  function hashTypedCommand(value) {
    var hash = 2166136261;
    for (var index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return ("00000000" + (hash >>> 0).toString(16)).slice(-8);
  }

  function matchesHiddenCommand(command) {
    var candidate = typedKeys.slice(-command.length);
    return candidate.length === command.length && hashTypedCommand(candidate) === command.hash;
  }

  function shouldIgnoreKeyTarget(event) {
    return event.target.closest("input, textarea, select, [contenteditable]");
  }

  function handleLazyEggShortcut(event) {
    if (window.RAIDSEggs && typeof window.RAIDSEggs.handleKeydown === "function") {
      window.RAIDSEggs.handleKeydown(event);
      return;
    }

    if (shouldIgnoreKeyTarget(event)) {
      return;
    }

    konamiKeys.push(event.key.toLowerCase());
    konamiKeys = konamiKeys.slice(-konamiSequence.length);
    if (konamiKeys.join(",") === konamiSequence.join(",")) {
      konamiKeys = [];
      triggerEgg("konami", event);
      return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) {
      return;
    }

    typedKeys = (typedKeys + event.key.toLowerCase()).slice(-32);
    if (typedKeys.endsWith("sure")) {
      typedKeys = "";
      triggerEgg("sure", event);
      return;
    }
    if (typedKeys.endsWith("debug")) {
      typedKeys = "";
      triggerEgg("debug", event);
      return;
    }

    if (hiddenCommands.some(function (command) {
      if (matchesHiddenCommand(command)) {
        typedKeys = "";
        triggerEgg(command.action, event);
        return true;
      }
      return false;
    })) {
      return;
    }

    if (body.classList.contains("egg-pi-summon") && matchesHiddenCommand(hiddenPiShortcut)) {
      typedKeys = "";
      triggerEgg(hiddenPiShortcut.action, event);
    }
  }

  toggle.addEventListener("click", function () {
    setOpen(!header.classList.contains("is-nav-open"));
  });

  nav.querySelectorAll(".nav-dropdown-toggle").forEach(function (toggleBtn) {
    toggleBtn.addEventListener("click", function (event) {
      if (isDesktop()) {
        return;
      }

      event.preventDefault();
      var dropdown = toggleBtn.closest(".nav-dropdown");
      var open = !dropdown.classList.contains("is-open");
      closeDropdowns();
      dropdown.classList.toggle("is-open", open);
      toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  nav.addEventListener("click", function (event) {
    if (event.target.closest(".nav-submenu a")) {
      setOpen(false);
      closeDropdowns();
      return;
    }
    if (event.target.closest("a") && !event.target.closest(".nav-dropdown")) {
      setOpen(false);
    }
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".nav-dropdown")) {
      closeDropdowns();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (window.RAIDSEggs && typeof window.RAIDSEggs.dismissKonamiLab === "function") {
        window.RAIDSEggs.dismissKonamiLab();
      }
      setOpen(false);
      closeDropdowns();
      return;
    }

    handleLazyEggShortcut(event);
  });

  window.addEventListener("resize", function () {
    if (isDesktop()) {
      setOpen(false);
    }
  });

  if (hasKonamiLabPersisted()) {
    loadEggs();
  }
})();

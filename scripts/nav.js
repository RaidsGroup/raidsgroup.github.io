(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var desktopQuery = window.matchMedia("(min-width: 741px)");

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
      setOpen(false);
      closeDropdowns();
    }
  });

  window.addEventListener("resize", function () {
    if (isDesktop()) {
      setOpen(false);
    }
  });

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var originalTitle = document.title;
  var typedKeys = "";
  var konamiKeys = [];
  var toastTimer = null;
  var panelTimer = null;
  var titleTimer = null;
  var publicationClicks = 0;
  var publicationClickTimer = null;
  var cobotNavTimer = null;
  var piSummonTimer = null;
  var piSummonRun = 0;
  var body = document.body;
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

  var commands = {
    sure: triggerSureDecoder,
    nightshift: triggerNightShift,
    cobot: triggerCobotNav,
    paipai: triggerPiSummon,
    debug: triggerDemoDebug
  };

  var toast = document.createElement("div");
  toast.className = "egg-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  body.appendChild(toast);

  var panel = document.createElement("section");
  panel.className = "egg-panel";
  panel.setAttribute("aria-live", "polite");
  panel.setAttribute("aria-hidden", "true");
  body.appendChild(panel);

  function showToast(message, duration) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, duration || 2600);
  }

  function showPanel(title, html, duration) {
    window.clearTimeout(panelTimer);
    panel.innerHTML =
      '<button class="egg-panel-close" type="button" aria-label="Close surprise panel">x</button>' +
      '<p class="egg-panel-kicker">RAIDS hidden protocol</p>' +
      "<h2>" + title + "</h2>" +
      '<div class="egg-panel-body">' + html + "</div>";
    panel.classList.add("is-visible");
    panel.setAttribute("aria-hidden", "false");
    panel.querySelector(".egg-panel-close").addEventListener("click", hidePanel);
    panelTimer = window.setTimeout(hidePanel, duration || 8000);
  }

  function hidePanel() {
    window.clearTimeout(panelTimer);
    panel.classList.remove("is-visible");
    panel.setAttribute("aria-hidden", "true");
  }

  function setTempClass(className, duration, onDone) {
    body.classList.add(className);
    window.setTimeout(function () {
      body.classList.remove(className);
      if (onDone) {
        onDone();
      }
    }, duration || 6000);
  }

  function setTempTitle(title, duration) {
    window.clearTimeout(titleTimer);
    document.title = title;
    titleTimer = window.setTimeout(function () {
      document.title = originalTitle;
    }, duration || 7000);
  }

  function typeText(target, text, onDone) {
    var index = 0;

    if (reducedMotion.matches) {
      target.textContent = text;
      if (onDone) {
        onDone();
      }
      return;
    }

    target.textContent = "";
    var timer = window.setInterval(function () {
      target.textContent += text.charAt(index);
      index += 1;
      if (index >= text.length) {
        window.clearInterval(timer);
        if (onDone) {
          onDone();
        }
      }
    }, 28);
  }

  function triggerSureDecoder() {
    var aboutValue = document.querySelector(".about-value");
    var originalText = aboutValue ? aboutValue.textContent : "";
    var decoded = "SURE = Solid, Unique, Radical, Elite.";

    showPanel(
      "SURE decoder",
      '<dl class="egg-sure-list"><div><dt>S</dt><dd>Solid</dd></div><div><dt>U</dt><dd>Unique</dd></div><div><dt>R</dt><dd>Radical</dd></div><div><dt>E</dt><dd>Elite</dd></div></dl><p>Definitely not a backronym. Probably.</p>',
      8500
    );

    if (aboutValue) {
      aboutValue.classList.add("egg-typewriter");
      typeText(aboutValue, decoded, function () {
        window.setTimeout(function () {
          aboutValue.textContent = originalText;
          aboutValue.classList.remove("egg-typewriter");
        }, 5200);
      });
    }
  }

  function triggerNightShift() {
    setTempTitle("RAIDS | PhD Mode", 12000);
    showPanel(
      "Night-shift lab",
      '<p class="egg-big-line">PhD mode activated.</p><p>Coffee level: critical. Figure export: still running.</p>',
      9000
    );
    setTempClass("egg-nightshift", 12000);
  }

  function triggerCobotNav() {
    var labels = {
      "index.html": ["charging dock", "battery 98%"],
      "research.html": ["idea reactor", "hypothesis hot"],
      "project.html": ["grant maze", "route recalculating"],
      "demos.html": ["robot zoo", "do not feed arms"],
      "people.html": ["human dataset", "faces recognized"],
      "people-cobotai.html": ["cobot squad", "sync ready"],
      "publication.html": ["paper farm", "citation radar on"],
      "honors.html": ["trophy cabinet", "shine limited"],
      "honors-cobotai.html": ["shiny objects", "polish mode"]
    };
    var hud = document.querySelector(".egg-cobot-hud");

    window.clearTimeout(cobotNavTimer);
    body.classList.remove("egg-cobot-nav");
    nav.querySelectorAll("[data-egg-label], [data-egg-status]").forEach(function (item) {
      item.removeAttribute("data-egg-label");
      item.removeAttribute("data-egg-status");
    });
    if (hud) {
      hud.remove();
    }

    nav.querySelectorAll("a").forEach(function (link) {
      var fileName = link.getAttribute("href");
      if (labels[fileName]) {
        link.setAttribute("data-egg-label", labels[fileName][0]);
        link.setAttribute("data-egg-status", labels[fileName][1]);
      }
    });
    nav.querySelectorAll(".nav-dropdown-toggle").forEach(function (button) {
      if (button.textContent.trim() === "People") {
        button.setAttribute("data-egg-label", "identity router");
        button.setAttribute("data-egg-status", "humans grouped");
        return;
      }
      button.setAttribute("data-egg-label", "achievement vault");
      button.setAttribute("data-egg-status", "badges indexed");
    });

    hud = document.createElement("aside");
    hud.className = "egg-cobot-hud";
    hud.setAttribute("role", "status");
    hud.innerHTML =
      '<div class="egg-cobot-face" aria-hidden="true">[cobot]</div>' +
      '<p class="egg-panel-kicker">CobotAI route planner</p>' +
      "<h2>Navigation taken over</h2>" +
      '<ol class="egg-cobot-log">' +
      "<li><span>01</span> scanning lab corridors</li>" +
      "<li><span>02</span> renaming boring menu items</li>" +
      "<li><span>03</span> recommending the least publish-or-perish route</li>" +
      "</ol>" +
      '<p class="egg-cobot-note">Mobile shortcut: open menu, long-press People.</p>';
    body.appendChild(hud);

    body.classList.add("egg-cobot-nav");
    window.setTimeout(function () {
      hud.classList.add("is-visible");
    }, 20);
    showToast("CobotAI is rerouting the lab navigation.", 3200);

    cobotNavTimer = window.setTimeout(function () {
      body.classList.remove("egg-cobot-nav");
      nav.querySelectorAll("[data-egg-label], [data-egg-status]").forEach(function (item) {
        item.removeAttribute("data-egg-label");
        item.removeAttribute("data-egg-status");
      });
      hud.classList.remove("is-visible");
      window.setTimeout(function () {
        hud.remove();
      }, 260);
    }, 12000);
  }

  function setupCobotLongPress() {
    var pressTimer = null;
    var triggered = false;
    var peopleToggle = Array.prototype.find.call(nav.querySelectorAll(".nav-dropdown-toggle"), function (button) {
      return button.textContent.trim() === "People";
    });

    if (!peopleToggle) {
      return;
    }

    function clearPressTimer() {
      window.clearTimeout(pressTimer);
    }

    peopleToggle.addEventListener("pointerdown", function () {
      triggered = false;
      clearPressTimer();
      pressTimer = window.setTimeout(function () {
        triggered = true;
        triggerCobotNav();
      }, 700);
    });

    ["pointerup", "pointerleave", "pointercancel"].forEach(function (eventName) {
      peopleToggle.addEventListener(eventName, clearPressTimer);
    });

    peopleToggle.addEventListener("click", function (event) {
      if (triggered) {
        event.preventDefault();
      }
    });
  }

  function triggerPublicationCombo(event) {
    window.clearTimeout(publicationClickTimer);
    publicationClicks += 1;
    publicationClickTimer = window.setTimeout(function () {
      publicationClicks = 0;
    }, 1600);

    if (publicationClicks === 5 || publicationClicks === 9) {
      var message = publicationClicks === 5
        ? "Combo x5: citation farming detected."
        : "Combo x9: H-index aura increased.";
      showToast(message, 3000);
      dropBadge(message, event.clientX, event.clientY);
      setTempClass("egg-citation-combo", 2800);
    }
  }

  function dropBadge(message, x, y) {
    var badge = document.createElement("div");
    badge.className = "egg-combo-badge";
    badge.textContent = message;
    badge.style.left = (x || window.innerWidth / 2) + "px";
    badge.style.top = (y || window.innerHeight / 2) + "px";
    body.appendChild(badge);
    window.setTimeout(function () {
      badge.remove();
    }, 1700);
  }

  function triggerPiSummon() {
    var runId = piSummonRun + 1;
    var peopleRoot = document.querySelector("main.people-page");
    var allCards = peopleRoot ? Array.prototype.slice.call(peopleRoot.querySelectorAll(".profile-card")) : [];
    var piCard = Array.prototype.find.call(document.querySelectorAll(".faculty-profile, .profile-card"), function (profile) {
      return /pai\s+zheng/i.test(profile.textContent);
    });
    var piImage = piCard ? piCard.querySelector(".profile-image img") : null;
    var studentCards = [];
    var assignedMissions = [];
    var missions = [
      "baseline?",
      "add one more demo",
      "ablation study",
      "rewrite intro",
      "check novelty",
      "rebuttal tonight",
      "robot test again",
      "slides by 6pm"
    ];
    var speechPool = [
      "Where is the baseline?",
      "One more experiment.",
      "Can we make the story clearer?",
      "Robot worked yesterday, right?",
      "Add an ablation study.",
      "The contribution needs to be sharper.",
      "Can we have a demo video?",
      "This figure needs a better story.",
      "Check the novelty again.",
      "Rebuttal draft tonight?",
      "Who owns slide seven?",
      "Run it one more time."
    ];
    var speechLines = [];
    var oldAvatar = document.querySelector(".egg-pi-drop-avatar");

    if (!peopleRoot) {
      return;
    }

    function shuffled(items) {
      return items.slice().sort(function () {
        return Math.random() - 0.5;
      });
    }

    studentCards = shuffled(allCards.filter(function (card) {
      return !/pai\s+zheng/i.test(card.textContent);
    })).slice(0, Math.min(12, allCards.length));
    assignedMissions = shuffled(missions);
    speechLines = shuffled(speechPool).slice(0, 3 + Math.floor(Math.random() * 2));

    window.clearTimeout(piSummonTimer);
    piSummonRun = runId;
    body.classList.remove("egg-pi-summon");
    document.querySelectorAll("[data-egg-mission]").forEach(function (card) {
      card.removeAttribute("data-egg-mission");
      card.style.removeProperty("--egg-scatter-x");
      card.style.removeProperty("--egg-scatter-y");
      card.style.removeProperty("--egg-scatter-rot");
    });
    document.querySelectorAll(".egg-pi-target").forEach(function (card) {
      card.classList.remove("egg-pi-target");
    });
    if (oldAvatar) {
      oldAvatar.remove();
    }
    document.querySelectorAll(".egg-pi-speech, .egg-pi-sound-wave").forEach(function (effect) {
      effect.remove();
    });

    body.classList.add("egg-pi-summon");
    if (piCard) {
      piCard.classList.add("egg-pi-target");
    }

    if (studentCards[0]) {
      studentCards[0].scrollIntoView({ block: "center", behavior: reducedMotion.matches ? "auto" : "smooth" });
    }

    window.setTimeout(function () {
      if (runId !== piSummonRun) {
        return;
      }

      var landingCard = studentCards[Math.min(2, studentCards.length - 1)] || piCard || peopleRoot;
      var landingRect = landingCard.getBoundingClientRect();
      var avatarMargin = Math.max(44, Math.min(78, window.innerWidth / 2 - 8, window.innerHeight / 2 - 8));
      var maxX = Math.max(avatarMargin, window.innerWidth - avatarMargin);
      var maxY = Math.max(avatarMargin, window.innerHeight - avatarMargin);
      var landingX = clamp(landingRect.left + landingRect.width / 2, avatarMargin, maxX);
      var landingY = clamp(landingRect.top + Math.min(landingRect.height / 2, 160), avatarMargin, maxY);
      var startX = piImage ? piImage.getBoundingClientRect().left + piImage.getBoundingClientRect().width / 2 : window.innerWidth / 2;
      var startY = avatarMargin;
      var avatar = document.createElement("img");
      var wave = document.createElement("span");
      var scatterScale = window.matchMedia("(max-width: 740px)").matches ? 0.55 : 1;

      function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
      }

      if (reducedMotion.matches) {
        startX = landingX;
        startY = landingY;
      } else {
        startX = clamp(startX, avatarMargin, maxX);
      }

      avatar.className = "egg-pi-drop-avatar";
      avatar.src = piImage ? piImage.src : "assets/people/zheng_pai.jpg";
      avatar.alt = "";
      avatar.style.left = startX + "px";
      avatar.style.top = startY + "px";
      avatar.style.setProperty("--egg-drop-x", landingX - startX + "px");
      avatar.style.setProperty("--egg-drop-y", landingY - startY + "px");
      body.appendChild(avatar);

      wave.className = "egg-pi-sound-wave";
      wave.style.left = landingX + "px";
      wave.style.top = landingY + "px";
      body.appendChild(wave);

      studentCards.forEach(function (card, index) {
        var direction = index % 4;
        var row = Math.floor(index / 4);
        var x = direction < 2 ? -1 : 1;
        var y = row % 2 === 0 ? 1 : -1;

        if (index > 0 && index % assignedMissions.length === 0) {
          assignedMissions = shuffled(missions);
        }

        card.setAttribute("data-egg-mission", assignedMissions[index % assignedMissions.length]);
        card.style.setProperty("--egg-scatter-x", x * (18 + direction * 7) * scatterScale + "px");
        card.style.setProperty("--egg-scatter-y", y * (10 + row * 4) * scatterScale + "px");
        card.style.setProperty("--egg-scatter-rot", x * (1.4 + row * 0.35) * scatterScale + "deg");
      });

      window.setTimeout(function () {
        var speech = document.createElement("div");
        var bubbleWidth = Math.min(250, window.innerWidth - 24);
        var speechX = landingX + 70;
        var speechY = landingY - 72;
        var lineIndex = 0;
        var speechTimer = null;

        if (runId !== piSummonRun) {
          return;
        }

        if (speechX + bubbleWidth > window.innerWidth - 12) {
          speechX = landingX - bubbleWidth - 70;
        }
        speechX = clamp(speechX, 12, Math.max(12, window.innerWidth - bubbleWidth - 12));
        speechY = clamp(speechY, 12, Math.max(12, window.innerHeight - 96));

        avatar.classList.add("is-speaking");
        wave.classList.add("is-speaking");
        speech.className = "egg-pi-speech";
        speech.textContent = speechLines[lineIndex];
        speech.style.left = speechX + "px";
        speech.style.top = speechY + "px";
        speech.style.maxWidth = bubbleWidth + "px";
        body.appendChild(speech);

        speechTimer = window.setInterval(function () {
          lineIndex += 1;
          if (lineIndex >= speechLines.length || runId !== piSummonRun) {
            window.clearInterval(speechTimer);
            speech.classList.add("is-leaving");
            window.setTimeout(function () {
              speech.remove();
            }, 220);
            return;
          }
          speech.textContent = speechLines[lineIndex];
        }, 1150);
      }, reducedMotion.matches ? 180 : 1500);
    }, reducedMotion.matches ? 60 : 520);

    piSummonTimer = window.setTimeout(function () {
      if (runId !== piSummonRun) {
        return;
      }

      body.classList.remove("egg-pi-summon");
      document.querySelectorAll("[data-egg-mission]").forEach(function (card) {
        card.removeAttribute("data-egg-mission");
        card.style.removeProperty("--egg-scatter-x");
        card.style.removeProperty("--egg-scatter-y");
        card.style.removeProperty("--egg-scatter-rot");
      });
      document.querySelectorAll(".egg-pi-target").forEach(function (card) {
        card.classList.remove("egg-pi-target");
      });
      document.querySelectorAll(".egg-pi-drop-avatar").forEach(function (avatar) {
        avatar.classList.add("is-leaving");
        window.setTimeout(function () {
          avatar.remove();
        }, 420);
      });
      document.querySelectorAll(".egg-pi-speech, .egg-pi-sound-wave").forEach(function (effect) {
        effect.classList.add("is-leaving");
        window.setTimeout(function () {
          effect.remove();
        }, 260);
      });
    }, 9800);
  }

  function triggerDemoDebug() {
    var cards = document.querySelectorAll(".demos-page .demo-card");
    var phrases = [
      "works on my robot",
      "calibrating...",
      "unexpected success detected",
      "sim-to-real, allegedly",
      "do not unplug"
    ];

    if (!cards.length) {
      showToast("Debug console not connected. Try this on the Demos page.", 3200);
      return;
    }

    cards.forEach(function (card, index) {
      var title = card.querySelector("h3");
      if (!title) {
        return;
      }
      title.setAttribute("data-egg-original", title.textContent);
      title.textContent = phrases[index % phrases.length];
    });

    showToast("Demo debug labels injected.", 2600);
    setTempClass("egg-demo-debug", 6500, function () {
      cards.forEach(function (card) {
        var title = card.querySelector("h3[data-egg-original]");
        if (title) {
          title.textContent = title.getAttribute("data-egg-original");
          title.removeAttribute("data-egg-original");
        }
      });
    });
  }

  function triggerKonamiLab() {
    setTempTitle("RAIDS | Secret Lab", 12000);
    showPanel(
      "KONAMI lab protocol",
      '<p class="egg-big-line">Secret Lab unlocked.</p><p>Robot tea break cancelled. Reviewer 2 temporarily contained. Coffee routed to GPU cluster.</p>',
      10000
    );
    setTempClass("egg-konami", 12000);
  }

  function handleKonami(event) {
    if (event.target.closest("input, textarea, select, [contenteditable]")) {
      return;
    }

    konamiKeys.push(event.key.toLowerCase());
    konamiKeys = konamiKeys.slice(-konamiSequence.length);
    if (konamiKeys.join(",") === konamiSequence.join(",")) {
      konamiKeys = [];
      triggerKonamiLab();
    }
  }

  function handleTypedCommand(event) {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.key.length !== 1 ||
      event.target.closest("input, textarea, select, [contenteditable]")
    ) {
      return;
    }

    typedKeys = (typedKeys + event.key.toLowerCase()).slice(-32);
    Object.keys(commands).some(function (command) {
      if (typedKeys.endsWith(command)) {
        commands[command]();
        typedKeys = "";
        return true;
      }
      return false;
    });
  }

  setupCobotLongPress();

  if (body.classList.contains("publication-page")) {
    document.querySelectorAll(".pub-list li, .pub-years-nav a").forEach(function (item) {
      item.addEventListener("click", triggerPublicationCombo);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      hidePanel();
    }
    handleKonami(event);
    handleTypedCommand(event);
  });
})();

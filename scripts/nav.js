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
  var titleTimer = null;
  var publicationClicks = 0;
  var publicationClickTimer = null;
  var publicationComboPulseTimer = null;
  var publicationComboToastTimer = null;
  var publicationComboTargetTimer = null;
  var cobotHideTimer = null;
  var cobotHideCountdownTimer = null;
  var cobotHideCleanup = null;
  var cobotHideFound = false;
  var piSummonTimer = null;
  var piMeetingTimer = null;
  var piMeetingSpeechTimer = null;
  var piPatrolTimers = [];
  var piPatrolFrames = [];
  var piSummonRun = 0;
  var konamiLabTimer = null;
  var konamiLabTimers = [];
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
    cobot: triggerCobotHideAndSeek,
    debug: triggerDemoDebug
  };
  var hiddenCommands = [
    { length: 6, hash: "fcc15595", action: triggerPiSummon }
  ];
  var hiddenPiShortcut = { length: 3, hash: "4e55ed59", action: triggerPiMeetingShortcut };

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

  function clearKonamiLab() {
    window.clearTimeout(konamiLabTimer);
    konamiLabTimers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    konamiLabTimers = [];
    body.classList.remove("egg-konami");
    nav.querySelectorAll("[data-konami-label]").forEach(function (item) {
      item.removeAttribute("data-konami-label");
    });
    document.querySelectorAll(".egg-konami-panel, .egg-konami-bit, .egg-konami-beacon").forEach(function (item) {
      item.remove();
    });
  }

  function triggerSureDecoder() {
    var aboutValue = document.querySelector(".about-value");
    var originalText = aboutValue ? aboutValue.textContent : "";
    var decoded = "SURE = Solid, Unique, Radical, Elite.";

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

  function getVisibleItems(selector) {
    return Array.prototype.filter.call(document.querySelectorAll(selector), function (item) {
      var rect = item.getBoundingClientRect();
      return rect.width > 8 && rect.height > 8;
    });
  }

  function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function getCobotIcon(name) {
    var icons = {
      bot: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="7" width="14" height="10" rx="3"></rect><path d="M12 7V4"></path><path d="M8 11h.01"></path><path d="M16 11h.01"></path><path d="M9 15h6"></path><path d="M5 12H3"></path><path d="M21 12h-2"></path></svg>',
      eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
      screw: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>',
      hand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 11V8a2 2 0 0 0-4 0v2"></path><path d="M14 10V6a2 2 0 0 0-4 0v8"></path><path d="M10 13.5 8.7 12a2 2 0 0 0-3 2.6l4.1 5A5.5 5.5 0 0 0 14 22h1a5 5 0 0 0 5-5v-5a2 2 0 0 0-4 0"></path></svg>',
      shadow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h18"></path><path d="M7 8h10"></path><path d="M9 16h6"></path><circle cx="12" cy="12" r="2"></circle></svg>',
      battery: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="7" width="18" height="10" rx="2"></rect><path d="M22 11v2"></path><path d="M6 11h6"></path></svg>'
    };

    return icons[name] || icons.bot;
  }

  function showCobotBrief(titleText, bodyText, countText, state) {
    var brief = document.querySelector(".egg-cobot-brief");
    var title = null;
    var copy = null;
    var count = null;

    if (!brief) {
      brief = document.createElement("div");
      brief.className = "egg-cobot-brief";
      brief.setAttribute("role", "status");
      brief.setAttribute("aria-live", "polite");
      brief.innerHTML = [
        '<span class="egg-cobot-face" aria-hidden="true">' + getCobotIcon("bot") + '</span>',
        '<span class="egg-cobot-brief-copy">',
        '<strong></strong>',
        '<span></span>',
        '</span>',
        '<b class="egg-cobot-count"></b>'
      ].join("");
      body.appendChild(brief);
    }

    brief.classList.toggle("is-success", state === "success");
    brief.classList.toggle("is-missed", state === "missed");
    title = brief.querySelector("strong");
    copy = brief.querySelector(".egg-cobot-brief-copy span");
    count = brief.querySelector(".egg-cobot-count");
    title.textContent = titleText;
    copy.textContent = bodyText;
    count.textContent = countText;
  }

  function clearCobotHideAndSeek() {
    window.clearTimeout(cobotHideTimer);
    window.clearInterval(cobotHideCountdownTimer);
    cobotHideTimer = null;
    cobotHideCountdownTimer = null;
    cobotHideFound = false;

    if (cobotHideCleanup) {
      cobotHideCleanup();
      cobotHideCleanup = null;
    }

    body.classList.remove("egg-cobot-hide");
    document.querySelectorAll(".egg-cobot-brief, .egg-cobot-target, .egg-cobot-decoy, .egg-cobot-progress-host").forEach(function (item) {
      item.remove();
    });
    document.querySelectorAll(".is-egg-cobot-host, .is-egg-cobot-decoy-host").forEach(function (item) {
      item.classList.remove("is-egg-cobot-host", "is-egg-cobot-decoy-host");
    });
  }

  function makeCobotTarget(kind, line, disguise, action, iconName) {
    var target = document.createElement("span");

    target.className = "egg-cobot-target egg-cobot-" + kind;
    target.setAttribute("role", "button");
    target.setAttribute("tabindex", "0");
    target.setAttribute("aria-label", "Find the hidden cobot");
    target.setAttribute("data-egg-line", line);
    target.setAttribute("data-egg-disguise", disguise);
    target.setAttribute("data-egg-action", action);
    target.innerHTML = getCobotIcon(iconName || kind);
    return target;
  }

  function attachCobotTarget(host, target) {
    host.classList.add("is-egg-cobot-host");
    host.appendChild(target);
    return target;
  }

  function addCobotDecoy(realHost) {
    var candidates = getVisibleItems(".btn, .nav-dropdown-toggle, .card, .demo-card, .people-card, .brand");
    var decoy = null;
    var host = null;

    candidates = candidates.filter(function (item) {
      return item !== realHost && !item.contains(realHost);
    });

    if (!candidates.length) {
      return;
    }

    host = pickRandom(candidates);
    decoy = document.createElement("span");
    decoy.className = "egg-cobot-decoy";
    decoy.textContent = Math.random() > 0.5 ? "I am definitely not this button." : "Do not hover me. I am ticklish.";
    host.classList.add("is-egg-cobot-decoy-host");
    host.appendChild(decoy);
  }

  function armCobotTarget(target, action, onFound) {
    var startX = 0;
    var startY = 0;
    var dragging = false;

    function stopEvent(event) {
      event.preventDefault();
      event.stopPropagation();
    }

    function found(event) {
      stopEvent(event);
      onFound();
    }

    if (action === "hover") {
      target.addEventListener("pointerenter", found);
      target.addEventListener("focus", onFound);
    }

    if (action === "click") {
      target.addEventListener("click", found);
    }

    if (action === "drag") {
      target.addEventListener("pointerdown", function (event) {
        stopEvent(event);
        dragging = true;
        startX = event.clientX;
        startY = event.clientY;
        if (target.setPointerCapture) {
          target.setPointerCapture(event.pointerId);
        }
      });
      target.addEventListener("pointermove", function (event) {
        if (!dragging) {
          return;
        }
        if (Math.abs(event.clientX - startX) + Math.abs(event.clientY - startY) > 12) {
          found(event);
        }
      });
      target.addEventListener("pointerup", function () {
        dragging = false;
      });
      target.addEventListener("pointercancel", function () {
        dragging = false;
      });
    }

    target.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        found(event);
      }
    });
  }

  function createCobotSpot() {
    var spots = [
      function () {
        var host = pickRandom(getVisibleItems(".btn, .nav-toggle, .nav-dropdown-toggle, .demo-card a, .link-arrow"));
        if (!host) {
          return null;
        }
        return {
          host: host,
          target: attachCobotTarget(host, makeCobotTarget("eye", "I am definitely not this button.", "a tiny eye inside a button", "click", "eye")),
          action: "click",
          disguise: "a tiny eye inside a button"
        };
      },
      function () {
        var host = pickRandom(getVisibleItems(".brand, .home-hero-brand"));
        if (!host) {
          return null;
        }
        return {
          host: host,
          target: attachCobotTarget(host, makeCobotTarget("screw", "Do not hover me. I am ticklish.", "a tiny screw on the logo", "hover", "screw")),
          action: "hover",
          disguise: "a tiny screw on the logo"
        };
      },
      function () {
        var host = pickRandom(getVisibleItems(".scope-figure, .profile-image, .award-media, .home-hero-brand"));
        if (!host) {
          return null;
        }
        return {
          host: host,
          target: attachCobotTarget(host, makeCobotTarget("hand", "You cannot move me unless you actually drag.", "a little hand in an image corner", "drag", "hand")),
          action: "drag",
          disguise: "a little hand in an image corner"
        };
      },
      function () {
        var card = pickRandom(getVisibleItems(".hero-panel, .card, .demo-card, .people-card, .award-card, .research-card"));
        var rail = null;
        var target = null;
        if (!card) {
          return null;
        }
        rail = document.createElement("span");
        rail.className = "egg-cobot-progress-host is-egg-cobot-host";
        target = makeCobotTarget("shadow", "Progress: 99%. Cobot: 1%.", "a moving shadow in a progress bar", "hover", "shadow");
        rail.appendChild(target);
        card.appendChild(rail);
        return {
          host: rail,
          target: target,
          action: "hover",
          disguise: "a moving shadow in a progress bar"
        };
      },
      function () {
        var target = makeCobotTarget("battery", "Low battery. Excellent acting.", "a tiny battery beside the cursor", "click", "battery");
        var placeBattery = function (event) {
          target.style.setProperty("--egg-cobot-x", event.clientX + 18 + "px");
          target.style.setProperty("--egg-cobot-y", event.clientY + 18 + "px");
          target.classList.add("is-placed");
        };

        target.style.setProperty("--egg-cobot-x", Math.round(window.innerWidth * 0.62) + "px");
        target.style.setProperty("--egg-cobot-y", Math.round(window.innerHeight * 0.48) + "px");
        body.appendChild(target);
        document.addEventListener("pointermove", placeBattery, { once: true });
        cobotHideCleanup = function () {
          document.removeEventListener("pointermove", placeBattery);
        };

        return {
          host: body,
          target: target,
          action: "click",
          disguise: "a tiny battery beside the cursor"
        };
      }
    ];
    var start = Math.floor(Math.random() * spots.length);
    var index = 0;
    var spot = null;

    for (index = 0; index < spots.length; index += 1) {
      spot = spots[(start + index) % spots.length]();
      if (spot) {
        return spot;
      }
    }

    return null;
  }

  function triggerCobotHideAndSeek() {
    var secondsLeft = 10;
    var spot = null;

    clearCobotHideAndSeek();
    body.classList.add("egg-cobot-hide");
    showCobotBrief("Cobot Hide-and-Seek", "I am hidden. Find me in 10 seconds.", secondsLeft, "");

    spot = createCobotSpot();
    if (!spot) {
      showCobotBrief("Cobot went offline", "It could not find a UI element to hide in.", "!", "missed");
      cobotHideTimer = window.setTimeout(clearCobotHideAndSeek, 2400);
      return;
    }

    addCobotDecoy(spot.host);
    armCobotTarget(spot.target, spot.action, function () {
      if (cobotHideFound) {
        return;
      }
      cobotHideFound = true;
      window.clearTimeout(cobotHideTimer);
      window.clearInterval(cobotHideCountdownTimer);
      spot.target.classList.add("is-found");
      showCobotBrief("Found it!", "It was disguised as " + spot.disguise + ".", "OK", "success");
      cobotHideTimer = window.setTimeout(clearCobotHideAndSeek, 2600);
    });

    cobotHideCountdownTimer = window.setInterval(function () {
      secondsLeft -= 1;
      showCobotBrief("Cobot Hide-and-Seek", "It is pretending to be UI. Try hover, click, or drag.", Math.max(secondsLeft, 0), "");
    }, 1000);

    cobotHideTimer = window.setTimeout(function () {
      if (cobotHideFound) {
        return;
      }
      window.clearInterval(cobotHideCountdownTimer);
      spot.target.classList.add("is-escaped");
      showCobotBrief("It escaped", "It says: observe the page more carefully next time.", "0", "missed");
      cobotHideTimer = window.setTimeout(clearCobotHideAndSeek, 2600);
    }, 10000);
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
        triggerCobotHideAndSeek();
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

  function showPublicationComboToast(message, event) {
    var toast = document.querySelector(".egg-citation-toast");
    var x = event && typeof event.clientX === "number" ? event.clientX : window.innerWidth / 2;
    var y = event && typeof event.clientY === "number" ? event.clientY : 140;

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "egg-citation-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      body.appendChild(toast);
    }

    x = Math.max(120, Math.min(window.innerWidth - 120, x));
    y = Math.max(96, Math.min(window.innerHeight - 36, y - 14));

    toast.textContent = message;
    toast.style.setProperty("--egg-combo-x", x + "px");
    toast.style.setProperty("--egg-combo-y", y + "px");
    toast.classList.remove("is-visible");
    window.clearTimeout(publicationComboToastTimer);
    toast.offsetWidth;
    toast.classList.add("is-visible");

    publicationComboToastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  function pulsePublicationCombo(strong) {
    window.clearTimeout(publicationComboPulseTimer);
    body.classList.remove("egg-citation-combo", "egg-citation-aura");
    body.offsetWidth;
    body.classList.add("egg-citation-combo");
    if (strong) {
      body.classList.add("egg-citation-aura");
    }

    publicationComboPulseTimer = window.setTimeout(function () {
      body.classList.remove("egg-citation-combo", "egg-citation-aura");
    }, strong ? 3600 : 2600);
  }

  function markPublicationComboTarget(target) {
    if (!target) {
      return;
    }

    window.clearTimeout(publicationComboTargetTimer);
    document.querySelectorAll(".is-citation-combo-target").forEach(function (item) {
      item.classList.remove("is-citation-combo-target");
    });
    target.offsetWidth;
    target.classList.add("is-citation-combo-target");

    publicationComboTargetTimer = window.setTimeout(function () {
      target.classList.remove("is-citation-combo-target");
    }, 900);
  }

  function triggerPublicationCombo(event) {
    var comboStep;

    window.clearTimeout(publicationClickTimer);
    publicationClicks += 1;
    comboStep = ((publicationClicks - 1) % 9) + 1;
    publicationClickTimer = window.setTimeout(function () {
      publicationClicks = 0;
    }, 1500);

    if (comboStep === 5) {
      markPublicationComboTarget(event.currentTarget);
      pulsePublicationCombo(false);
      showPublicationComboToast("Combo x5: citation farming detected.", event);
    }

    if (comboStep === 9) {
      markPublicationComboTarget(event.currentTarget);
      pulsePublicationCombo(true);
      showPublicationComboToast("H-index aura increased.", event);
    }
  }

  function clearPiPatrolTimers() {
    window.clearTimeout(piMeetingTimer);
    piMeetingTimer = null;
    window.clearInterval(piMeetingSpeechTimer);
    piMeetingSpeechTimer = null;
    piPatrolTimers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    piPatrolTimers = [];
    piPatrolFrames.forEach(function (frame) {
      window.cancelAnimationFrame(frame);
    });
    piPatrolFrames = [];
  }

  function triggerPiMeetingStage(peopleRoot, piCard, piImage) {
    var runId = piSummonRun + 1;
    var avatar = document.querySelector(".egg-pi-drop-avatar");
    var wave = document.querySelector(".egg-pi-sound-wave");
    var megaphone = document.querySelector(".egg-pi-megaphone");
    var speech = document.querySelector(".egg-pi-meeting-speech");
    var hammer = document.querySelector(".egg-pi-hammer");
    var firstStudentGrid = peopleRoot ? peopleRoot.querySelector(".people-block .profile-grid") : null;
    var meetingTarget = firstStudentGrid || peopleRoot;
    var avatarMargin = Math.max(44, Math.min(78, window.innerWidth / 2 - 8, window.innerHeight / 2 - 8));
    var targetRect;
    var targetDocRect;
    var targetDocPoint;
    var targetScrollY;
    var currentViewportPoint;
    var currentDocPoint;
    var meetingLines = [
      "One more experiment before Friday.",
      "Where is the baseline?",
      "Please make the story clearer.",
      "Everyone update your slides.",
      "Who owns Figure 3?",
      "Add a demo video.",
      "Rebuttal draft tonight.",
      "Check the novelty again.",
      "Robot test after lunch.",
      "Send me the latest results.",
      "Make the contribution sharper.",
      "This figure needs a better story.",
      "Can we compare with one more method?",
      "Please align the terminology.",
      "Who will present next week?",
      "The abstract should be more direct.",
      "Run it again with another seed.",
      "Add an ablation table.",
      "Update the timeline today.",
      "Please check the related work.",
      "Can the robot repeat this reliably?",
      "We need a cleaner video.",
      "Merge the slides before dinner.",
      "Do not forget the appendix.",
      "Please verify the numbers.",
      "What is the key insight?",
      "Make the demo more convincing.",
      "Send the draft to me tonight.",
      "Everyone has one action item.",
      "Let's make this publishable."
    ];

    if (!peopleRoot || body.classList.contains("egg-pi-meeting")) {
      return;
    }

    clearPiPatrolTimers();
    window.clearTimeout(piSummonTimer);
    piSummonRun = runId;
    body.classList.add("egg-pi-meeting");
    document.querySelectorAll(".is-egg-patrol-stop").forEach(function (card) {
      card.classList.remove("is-egg-patrol-stop");
    });
    if (hammer) {
      hammer.classList.add("is-leaving");
      window.setTimeout(function () {
        hammer.remove();
      }, 180);
    }

    if (!avatar) {
      avatar = document.createElement("img");
      avatar.className = "egg-pi-drop-avatar is-patrolling";
      avatar.src = piImage ? piImage.src : "assets/people/zheng_pai.jpg";
      avatar.alt = "";
      body.appendChild(avatar);
    }
    avatar.classList.remove("is-facing-left");

    if (!wave) {
      wave = document.createElement("span");
      wave.className = "egg-pi-sound-wave";
      body.appendChild(wave);
    }

    if (!megaphone) {
      megaphone = document.createElement("span");
      megaphone.className = "egg-pi-megaphone";
      megaphone.setAttribute("aria-hidden", "true");
      megaphone.textContent = ")))";
      body.appendChild(megaphone);
    }

    if (!speech) {
      speech = document.createElement("div");
      speech.className = "egg-pi-meeting-speech";
      speech.setAttribute("role", "status");
      speech.setAttribute("aria-live", "polite");
      body.appendChild(speech);
    }

    function randomMeetingLine(previousLine) {
      var line = meetingLines[Math.floor(Math.random() * meetingLines.length)];
      if (meetingLines.length > 1 && line === previousLine) {
        return randomMeetingLine(previousLine);
      }
      return line;
    }

    function updateMeetingSpeech() {
      speech.classList.remove("is-visible");
      window.setTimeout(function () {
        if (runId !== piSummonRun || !body.classList.contains("egg-pi-meeting")) {
          return;
        }
        speech.textContent = randomMeetingLine(speech.textContent);
        speech.classList.add("is-visible");
      }, 120);
    }

    speech.textContent = randomMeetingLine("");

    targetRect = meetingTarget ? meetingTarget.getBoundingClientRect() : null;
    targetDocRect = targetRect ? {
      left: window.scrollX + targetRect.left,
      top: window.scrollY + targetRect.top,
      width: targetRect.width,
      height: targetRect.height
    } : null;
    targetDocPoint = {
      x: targetDocRect ? targetDocRect.left + targetDocRect.width / 2 : window.scrollX + window.innerWidth / 2,
      y: targetDocRect ? targetDocRect.top - avatarMargin - 24 : window.scrollY + avatarMargin
    };
    targetScrollY = targetDocRect ? clamp(targetDocRect.top - window.innerHeight * 0.34, 0, maxScrollTop()) : 0;
    currentViewportPoint = {
      x: parseFloat(avatar.style.left) || window.innerWidth / 2,
      y: parseFloat(avatar.style.top) || avatarMargin
    };
    currentDocPoint = {
      x: window.scrollX + currentViewportPoint.x,
      y: window.scrollY + currentViewportPoint.y
    };

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function maxScrollTop() {
      return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }

    function render(docPoint) {
      var viewportX;
      var viewportY;
      var megaphoneX;
      var megaphoneY;

      if (!reducedMotion.matches) {
        window.scrollTo(window.scrollX, targetScrollY);
      }

      viewportX = clamp(docPoint.x - window.scrollX, avatarMargin, window.innerWidth - avatarMargin);
      viewportY = clamp(docPoint.y - window.scrollY, avatarMargin, window.innerHeight - avatarMargin);
      avatar.style.left = viewportX + "px";
      avatar.style.top = viewportY + "px";
      avatar.style.setProperty("--egg-drop-x", "0px");
      avatar.style.setProperty("--egg-drop-y", "0px");
      wave.style.left = viewportX + "px";
      wave.style.top = viewportY + "px";
      megaphoneX = clamp(viewportX + 48, avatarMargin, window.innerWidth - avatarMargin);
      megaphoneY = clamp(viewportY + 4, avatarMargin, window.innerHeight - avatarMargin);
      megaphone.style.left = megaphoneX + "px";
      megaphone.style.top = megaphoneY + "px";
      speech.style.left = clamp(megaphoneX + 28, avatarMargin, window.innerWidth - avatarMargin) + "px";
      speech.style.top = clamp(megaphoneY + 32, avatarMargin, window.innerHeight - avatarMargin) + "px";
    }

    function showMeetingBanner() {
      var banner = document.querySelector(".egg-pi-meeting-banner");
      if (!banner) {
        banner = document.createElement("div");
        banner.className = "egg-pi-meeting-banner";
        banner.setAttribute("role", "status");
        banner.textContent = "GROUP MEETING STARTED";
        body.appendChild(banner);
      }
      banner.classList.add("is-visible");
      megaphone.classList.add("is-visible");
      speech.classList.add("is-visible");
      window.clearInterval(piMeetingSpeechTimer);
      piMeetingSpeechTimer = window.setInterval(updateMeetingSpeech, reducedMotion.matches ? 2200 : 1350);
      wave.classList.remove("is-speaking");
      void wave.offsetWidth;
      wave.classList.add("is-speaking");
    }

    function step(startedAt) {
      var now = window.performance.now();
      var duration = reducedMotion.matches ? 1 : 900;
      var progress = clamp((now - startedAt) / duration, 0, 1);
      var docPoint = {
        x: currentDocPoint.x + (targetDocPoint.x - currentDocPoint.x) * progress,
        y: currentDocPoint.y + (targetDocPoint.y - currentDocPoint.y) * progress
      };

      if (runId !== piSummonRun) {
        return;
      }

      render(docPoint);

      if (progress < 1) {
        piPatrolFrames.push(window.requestAnimationFrame(function () {
          step(startedAt);
        }));
        return;
      }

      avatar.classList.add("is-speaking", "is-meeting");
      showMeetingBanner();
    }

    if (piCard) {
      piCard.classList.add("egg-pi-target");
    }
    piPatrolFrames.push(window.requestAnimationFrame(function () {
      step(window.performance.now());
    }));

    piMeetingTimer = window.setTimeout(function () {
      if (runId !== piSummonRun) {
        return;
      }
      window.clearInterval(piMeetingSpeechTimer);
      piMeetingSpeechTimer = null;
      body.classList.remove("egg-pi-summon", "egg-pi-meeting");
      document.querySelectorAll("[data-egg-mission], [data-egg-task-badge], [data-egg-work-status]").forEach(function (card) {
        card.removeAttribute("data-egg-mission");
        card.removeAttribute("data-egg-task-badge");
        card.removeAttribute("data-egg-work-status");
        card.style.removeProperty("--egg-scatter-x");
        card.style.removeProperty("--egg-scatter-y");
        card.style.removeProperty("--egg-scatter-rot");
      });
      document.querySelectorAll(".is-egg-raid-target, .is-egg-patrol-stop").forEach(function (card) {
        card.classList.remove("is-egg-raid-target", "is-egg-patrol-stop");
      });
      document.querySelectorAll(".egg-pi-target").forEach(function (card) {
        card.classList.remove("egg-pi-target");
      });
      document.querySelectorAll(".egg-pi-meeting-banner").forEach(function (banner) {
        banner.classList.remove("is-visible");
        window.setTimeout(function () {
          banner.remove();
        }, 220);
      });
      document.querySelectorAll(".egg-pi-megaphone").forEach(function (item) {
        item.classList.remove("is-visible");
        window.setTimeout(function () {
          item.remove();
        }, 220);
      });
      document.querySelectorAll(".egg-pi-hammer").forEach(function (item) {
        item.classList.add("is-leaving");
        window.setTimeout(function () {
          item.remove();
        }, 180);
      });
      document.querySelectorAll(".egg-pi-meeting-speech").forEach(function (item) {
        item.classList.remove("is-visible");
        window.setTimeout(function () {
          item.remove();
        }, 220);
      });
      document.querySelectorAll(".egg-pi-drop-avatar").forEach(function (item) {
        item.classList.remove("is-patrolling", "is-raiding", "is-meeting", "is-facing-left");
        item.classList.add("is-leaving");
        window.setTimeout(function () {
          item.remove();
        }, 420);
      });
      document.querySelectorAll(".egg-pi-sound-wave").forEach(function (item) {
        item.classList.add("is-leaving");
        window.setTimeout(function () {
          item.remove();
        }, 260);
      });
    }, 9000);
  }

  function triggerPiMeetingShortcut() {
    var peopleRoot = document.querySelector("main.people-page") || (body.classList.contains("people-page") ? document.querySelector("main") : null);
    var piCard = Array.prototype.find.call((peopleRoot || document).querySelectorAll(".faculty-profile, .profile-card"), function (profile) {
      return /pai\s+zheng/i.test(profile.textContent);
    });
    var piImage = piCard ? piCard.querySelector(".profile-image img") : null;

    if (!peopleRoot || !body.classList.contains("egg-pi-summon")) {
      return;
    }

    triggerPiMeetingStage(peopleRoot, piCard, piImage);
  }

  function triggerPiSummon() {
    var runId = piSummonRun + 1;
    var peopleRoot = document.querySelector("main.people-page") || (body.classList.contains("people-page") ? document.querySelector("main") : null);
    var allCards = peopleRoot ? Array.prototype.slice.call(peopleRoot.querySelectorAll(".profile-card")) : [];
    var piCard = Array.prototype.find.call((peopleRoot || document).querySelectorAll(".faculty-profile, .profile-card"), function (profile) {
      return /pai\s+zheng/i.test(profile.textContent);
    });
    var piImage = piCard ? piCard.querySelector(".profile-image img") : null;
    var studentCards = [];
    var routeCards = [];
    var visitedCards = [];
    var raidEvents = [];
    var patrolStartDelay = reducedMotion.matches ? 20 : 80;
    var patrolInterval = reducedMotion.matches ? 360 : 1250;
    var patrolTravelDuration = reducedMotion.matches ? 1 : 1220;
    var raidTravelDuration = reducedMotion.matches ? 1 : 220;
    var raidPause = reducedMotion.matches ? 520 : 1050;
    var piSummonDuration = reducedMotion.matches ? 7600 : 18500;
    var missions = [
      ["URGENT", "baseline?"],
      ["REVISION", "rewrite intro"],
      ["DEMO", "add robot video"],
      ["EXPERIMENT", "ablation study"],
      ["NOVELTY", "check novelty"],
      ["TONIGHT", "rebuttal draft"],
      ["ROBOT", "test again"],
      ["SLIDES", "slides by 6pm"],
      ["FIGURE", "fix Figure 3"],
      ["EMAIL", "reply reviewer"],
      ["DATA", "one more run"],
      ["MEETING", "bring updates"]
    ];
    var statuses = [
      "training model",
      "debugging",
      "writing intro",
      "reading papers",
      "tuning robot",
      "plotting results",
      "pretending busy",
      "checking email",
      "running baseline",
      "fixing slides"
    ];

    if (!peopleRoot) {
      return;
    }

    if (body.classList.contains("egg-pi-summon")) {
      triggerPiMeetingStage(peopleRoot, piCard, piImage);
      return;
    }

    function shuffled(items) {
      return items.slice().sort(function () {
        return Math.random() - 0.5;
      });
    }

    function buildSnakeRoute(cards, endCard) {
      var rows = [];
      var rowTolerance = 28;
      var route;

      cards.forEach(function (card) {
        var rect = card.getBoundingClientRect();
        var top = rect.top + window.scrollY;
        var row = rows.find(function (item) {
          return Math.abs(item.top - top) < rowTolerance;
        });

        if (!row) {
          row = {
            top: top,
            cards: []
          };
          rows.push(row);
        }

        row.cards.push({
          card: card,
          left: rect.left
        });
      });

      route = rows.sort(function (a, b) {
        return a.top - b.top;
      }).reduce(function (items, row, rowIndex) {
        var rowCards = row.cards.sort(function (a, b) {
          return a.left - b.left;
        });

        if (rowIndex % 2 === 1) {
          rowCards.reverse();
        }

        return items.concat(rowCards.map(function (item) {
          return item.card;
        }));
      }, []);

      if (endCard && route.indexOf(endCard) > -1 && route[route.length - 1] !== endCard) {
        route = route.filter(function (card) {
          return card !== endCard;
        });
        route.push(endCard);
      }

      return route;
    }

    studentCards = allCards.filter(function (card) {
      return !/pai\s+zheng/i.test(card.textContent);
    });
    if (studentCards.length) {
      var researchTitle = Array.prototype.find.call(peopleRoot.querySelectorAll(".people-subtitle"), function (title) {
        return /research\s+staff/i.test(title.textContent);
      });
      var researchGrid = researchTitle ? researchTitle.nextElementSibling : null;
      var researchCards = researchGrid ? Array.prototype.slice.call(researchGrid.querySelectorAll(".profile-card")) : [];
      var routeEndCard = researchCards[researchCards.length - 1];
      var routeEndIndex = routeEndCard ? studentCards.indexOf(routeEndCard) : -1;
      var raidCount;
      var raidStepPool;

      routeCards = routeEndIndex >= 0 ? studentCards.slice(0, routeEndIndex + 1) : studentCards.slice(0, Math.min(16, studentCards.length));
      routeCards = buildSnakeRoute(routeCards, routeEndCard);
      raidCount = Math.min(routeCards.length, reducedMotion.matches ? 2 : 5);
      raidStepPool = routeCards.slice(1, Math.max(2, routeCards.length - 1)).map(function (card, index) {
        return index + 1;
      });

      shuffled(raidStepPool).slice(0, raidCount).sort(function (a, b) {
        return a - b;
      }).forEach(function (step) {
        raidEvents.push({
          step: step
        });
      });
    }
    piSummonDuration = Math.max(piSummonDuration, patrolStartDelay + routeCards.length * patrolInterval + raidEvents.length * raidPause + 1800);

    window.clearTimeout(piSummonTimer);
    clearPiPatrolTimers();
    piSummonRun = runId;
    body.classList.remove("egg-pi-summon");
    document.querySelectorAll("[data-egg-mission], [data-egg-task-badge], [data-egg-work-status]").forEach(function (card) {
      card.removeAttribute("data-egg-mission");
      card.removeAttribute("data-egg-task-badge");
      card.removeAttribute("data-egg-work-status");
      card.style.removeProperty("--egg-scatter-x");
      card.style.removeProperty("--egg-scatter-y");
      card.style.removeProperty("--egg-scatter-rot");
    });
    document.querySelectorAll(".is-egg-patrol-stop").forEach(function (card) {
      card.classList.remove("is-egg-patrol-stop");
    });
    document.querySelectorAll(".is-egg-raid-target").forEach(function (card) {
      card.classList.remove("is-egg-raid-target");
    });
    document.querySelectorAll(".egg-pi-target").forEach(function (card) {
      card.classList.remove("egg-pi-target");
    });
    document.querySelectorAll(".egg-pi-drop-avatar").forEach(function (avatar) {
      avatar.remove();
    });
    document.querySelectorAll(".egg-pi-sound-wave").forEach(function (effect) {
      effect.remove();
    });
    document.querySelectorAll(".egg-pi-hammer").forEach(function (item) {
      item.remove();
    });

    body.classList.add("egg-pi-summon");
    if (piCard) {
      piCard.classList.add("egg-pi-target");
    }
    allCards.forEach(function (card, index) {
      card.setAttribute("data-egg-work-status", statuses[index % statuses.length]);
    });

    window.setTimeout(function () {
      if (runId !== piSummonRun) {
        return;
      }

      var landingCard = routeCards[0] || piCard || peopleRoot;
      var avatarMargin = Math.max(44, Math.min(78, window.innerWidth / 2 - 8, window.innerHeight / 2 - 8));
      var maxX = Math.max(avatarMargin, window.innerWidth - avatarMargin);
      var maxY = Math.max(avatarMargin, window.innerHeight - avatarMargin);
      var startRect = landingCard.getBoundingClientRect();
      var startPoint = {
        x: clamp(startRect.left + startRect.width / 2, avatarMargin, maxX),
        y: clamp(startRect.top + Math.min(startRect.height / 2, 150), avatarMargin, maxY)
      };
      var currentDocPoint = {
        x: window.scrollX + startPoint.x,
        y: window.scrollY + startRect.top + Math.min(startRect.height / 2, 150)
      };
      var activeFrame = null;
      var avatar = document.createElement("img");
      var wave = document.createElement("span");
      var hammer = document.createElement("span");
      var facingDirection = 1;
      var scatterScale = window.matchMedia("(max-width: 740px)").matches ? 0.55 : 1;
      var assignedMissions = shuffled(missions);

      function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
      }

      function maxScrollTop() {
        return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      }

      function cardCenter(card) {
        var rect = card.getBoundingClientRect();
        return {
          x: window.scrollX + clamp(rect.left + rect.width / 2, avatarMargin, maxX),
          y: window.scrollY + rect.top + Math.min(rect.height / 2, 150)
        };
      }

      function renderAvatarAt(docPoint, followScroll) {
        var desiredScrollY = clamp(docPoint.y - window.innerHeight * 0.46, 0, maxScrollTop());
        var viewportX;
        var viewportY;

        if (followScroll !== false && !reducedMotion.matches) {
          window.scrollTo(window.scrollX, desiredScrollY);
        }

        viewportX = clamp(docPoint.x - window.scrollX, avatarMargin, maxX);
        viewportY = clamp(docPoint.y - window.scrollY, avatarMargin, maxY);
        avatar.style.left = viewportX + "px";
        avatar.style.top = viewportY + "px";
        avatar.style.setProperty("--egg-drop-x", "0px");
        avatar.style.setProperty("--egg-drop-y", "0px");
        wave.style.left = viewportX + "px";
        wave.style.top = viewportY + "px";
        hammer.style.left = clamp(viewportX + avatarMargin * 0.56 * facingDirection, avatarMargin, maxX) + "px";
        hammer.style.top = clamp(viewportY + avatarMargin * 0.12, avatarMargin, maxY) + "px";
      }

      function updateFacing(targetDocPoint) {
        var deltaX = targetDocPoint.x - currentDocPoint.x;

        if (Math.abs(deltaX) < 8) {
          return;
        }

        facingDirection = deltaX < 0 ? -1 : 1;
        avatar.classList.toggle("is-facing-left", facingDirection < 0);
        hammer.classList.toggle("is-facing-left", facingDirection < 0);
      }

      function pulseWave() {
        wave.classList.remove("is-speaking");
        void wave.offsetWidth;
        window.setTimeout(function () {
          if (runId === piSummonRun) {
            wave.classList.add("is-speaking");
          }
        }, 20);
      }

      function animateAvatarTo(targetDocPoint, duration, followScroll, onDone) {
        var fromPoint = {
          x: currentDocPoint.x,
          y: currentDocPoint.y
        };
        var startedAt = window.performance.now();

        if (activeFrame) {
          window.cancelAnimationFrame(activeFrame);
        }
        updateFacing(targetDocPoint);

        function step(now) {
          var progress;

          if (runId !== piSummonRun) {
            return;
          }

          progress = duration <= 1 ? 1 : clamp((now - startedAt) / duration, 0, 1);
          currentDocPoint = {
            x: fromPoint.x + (targetDocPoint.x - fromPoint.x) * progress,
            y: fromPoint.y + (targetDocPoint.y - fromPoint.y) * progress
          };
          renderAvatarAt(currentDocPoint, followScroll);

          if (progress < 1) {
            activeFrame = window.requestAnimationFrame(step);
            piPatrolFrames.push(activeFrame);
            return;
          }

          activeFrame = null;
          currentDocPoint = {
            x: targetDocPoint.x,
            y: targetDocPoint.y
          };
          renderAvatarAt(currentDocPoint, followScroll);
          if (onDone) {
            onDone();
          }
        }

        activeFrame = window.requestAnimationFrame(step);
        piPatrolFrames.push(activeFrame);
      }

      function pickNearbyRaidTarget(anchorCard) {
        var visibleCards = routeCards.filter(function (card) {
          var rect = card.getBoundingClientRect();
          return card !== anchorCard && rect.bottom > avatarMargin && rect.top < window.innerHeight - avatarMargin;
        });

        if (!visibleCards.length) {
          return anchorCard;
        }

        return visibleCards.sort(function (a, b) {
          var aPoint = cardCenter(a);
          var bPoint = cardCenter(b);
          var aDistance = Math.abs(aPoint.x - currentDocPoint.x) + Math.abs(aPoint.y - currentDocPoint.y);
          var bDistance = Math.abs(bPoint.x - currentDocPoint.x) + Math.abs(bPoint.y - currentDocPoint.y);
          return aDistance - bDistance;
        })[0];
      }

      function markPatrolStop(card, index, isRaid) {
        var mission = assignedMissions[index % assignedMissions.length];
        var direction = index % 4;
        var row = Math.floor(index / 4);
        var x = direction < 2 ? -1 : 1;
        var y = row % 2 === 0 ? 1 : -1;

        avatar.classList.add("is-speaking");
        pulseWave();

        visitedCards.forEach(function (visitedCard) {
          visitedCard.classList.remove("is-egg-patrol-stop");
        });
        visitedCards.push(card);

        card.classList.add("is-egg-patrol-stop");
        if (isRaid) {
          card.classList.add("is-egg-raid-target");
          card.setAttribute("data-egg-task-badge", mission[0]);
          card.setAttribute("data-egg-mission", mission[1]);
          card.style.setProperty("--egg-scatter-x", x * (16 + direction * 7) * scatterScale + "px");
          card.style.setProperty("--egg-scatter-y", y * (9 + row * 4) * scatterScale + "px");
          card.style.setProperty("--egg-scatter-rot", x * (1.2 + row * 0.32) * scatterScale + "deg");
        }
      }

      function moveAvatarTo(card, index, isRaid) {
        avatar.classList.toggle("is-raiding", !!isRaid);
        hammer.classList.toggle("is-raiding", !!isRaid);
        animateAvatarTo(cardCenter(card), isRaid ? raidTravelDuration : patrolTravelDuration, !isRaid, function () {
          markPatrolStop(card, index, isRaid);
        });
      }

      avatar.className = "egg-pi-drop-avatar is-patrolling";
      avatar.src = piImage ? piImage.src : "assets/people/zheng_pai.jpg";
      avatar.alt = "";
      body.appendChild(avatar);

      wave.className = "egg-pi-sound-wave";
      wave.style.left = startPoint.x + "px";
      wave.style.top = startPoint.y + "px";
      body.appendChild(wave);

      hammer.className = "egg-pi-hammer is-visible";
      hammer.setAttribute("aria-hidden", "true");
      body.appendChild(hammer);
      renderAvatarAt(currentDocPoint, true);
      if (routeCards[0]) {
        markPatrolStop(routeCards[0], 0, false);
      }

      animateAvatarTo(cardCenter(landingCard), 1, true);

      routeCards.forEach(function (card, index) {
        var earlierRaids = raidEvents.filter(function (event) {
          return event.step < index;
        }).length;
        var timeCursor;
        var patrolDelay;

        if (index === 0) {
          return;
        }

        timeCursor = patrolStartDelay + patrolInterval * (index - 1) + earlierRaids * raidPause;
        patrolDelay = timeCursor;
        var timer = window.setTimeout(function () {
          if (runId === piSummonRun) {
            moveAvatarTo(card, index, false);
          }
        }, patrolDelay);
        piPatrolTimers.push(timer);

        raidEvents.filter(function (event) {
          return event.step === index;
        }).forEach(function (event) {
          piPatrolTimers.push(window.setTimeout(function () {
            if (runId === piSummonRun) {
              var raidTarget = pickNearbyRaidTarget(card);
              moveAvatarTo(raidTarget, Math.max(0, routeCards.indexOf(raidTarget)), true);
            }
          }, timeCursor + patrolTravelDuration + 120));
        });
      });
    }, reducedMotion.matches ? 20 : 40);

    piSummonTimer = window.setTimeout(function () {
      if (runId !== piSummonRun) {
        return;
      }

      body.classList.remove("egg-pi-summon", "egg-pi-meeting");
      clearPiPatrolTimers();
      document.querySelectorAll("[data-egg-mission], [data-egg-task-badge], [data-egg-work-status]").forEach(function (card) {
        card.removeAttribute("data-egg-mission");
        card.removeAttribute("data-egg-task-badge");
        card.removeAttribute("data-egg-work-status");
        card.style.removeProperty("--egg-scatter-x");
        card.style.removeProperty("--egg-scatter-y");
        card.style.removeProperty("--egg-scatter-rot");
      });
      document.querySelectorAll(".is-egg-patrol-stop").forEach(function (card) {
        card.classList.remove("is-egg-patrol-stop");
      });
      document.querySelectorAll(".is-egg-raid-target").forEach(function (card) {
        card.classList.remove("is-egg-raid-target");
      });
      document.querySelectorAll(".egg-pi-target").forEach(function (card) {
        card.classList.remove("egg-pi-target");
      });
      document.querySelectorAll(".egg-pi-meeting-banner").forEach(function (banner) {
        banner.remove();
      });
      document.querySelectorAll(".egg-pi-drop-avatar").forEach(function (avatar) {
        avatar.classList.remove("is-patrolling", "is-raiding", "is-meeting", "is-facing-left");
        avatar.classList.add("is-leaving");
        window.setTimeout(function () {
          avatar.remove();
        }, 420);
      });
      document.querySelectorAll(".egg-pi-sound-wave").forEach(function (effect) {
        effect.classList.add("is-leaving");
        window.setTimeout(function () {
          effect.remove();
        }, 260);
      });
      document.querySelectorAll(".egg-pi-hammer").forEach(function (item) {
        item.classList.add("is-leaving");
        window.setTimeout(function () {
          item.remove();
        }, 180);
      });
      document.querySelectorAll(".egg-pi-megaphone").forEach(function (item) {
        item.classList.remove("is-visible");
        window.setTimeout(function () {
          item.remove();
        }, 220);
      });
      document.querySelectorAll(".egg-pi-meeting-speech").forEach(function (item) {
        item.classList.remove("is-visible");
        window.setTimeout(function () {
          item.remove();
        }, 220);
      });
    }, piSummonDuration);
  }

  function triggerDemoDebug() {
    var cards = document.querySelectorAll(".demos-page .demo-card");
    var videos = document.querySelectorAll(".demos-page .demo-video-wrap video");
    var phrases = [
      "works on my robot",
      "calibrating...",
      "unexpected success detected",
      "sim-to-real, allegedly",
      "do not unplug"
    ];

    if (!cards.length) {
      return;
    }

    videos.forEach(function (video) {
      video.pause();
    });

    cards.forEach(function (card, index) {
      var title = card.querySelector("h3");
      if (!title) {
        return;
      }
      title.setAttribute("data-egg-original", title.textContent);
      title.textContent = phrases[index % phrases.length];
    });

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
    var duration = reducedMotion.matches ? 8500 : 12500;
    var aliases = [
      "warp gate",
      "paper cannon",
      "robot runway",
      "grant vault",
      "citation radar",
      "human API",
      "demo reactor",
      "badge magnet",
      "coffee port"
    ];
    var lines = [
      "↑ ↑ ↓ ↓ ← → ← → B A accepted",
      "calibrating robot swarm...",
      "unlocking secret RAIDS tunnel...",
      "rerouting nav through the fun path",
      "lab mode online"
    ];
    var glyphs = ["↑", "↓", "←", "→", "B", "A", "π", "RAIDS", "404", "OK"];
    var panel = document.createElement("div");
    var status = document.createElement("div");
    var eyebrow = document.createElement("p");
    var title = document.createElement("h2");
    var list = document.createElement("ol");
    var meter = document.createElement("div");
    var fragment = document.createDocumentFragment();
    var navItems = nav.querySelectorAll("a, .nav-dropdown-toggle");
    var bitCount = reducedMotion.matches ? 6 : 18;

    clearKonamiLab();
    setTempTitle("RAIDS | Secret Lab", duration);
    body.classList.add("egg-konami");

    navItems.forEach(function (item, index) {
      item.setAttribute("data-konami-label", aliases[index % aliases.length]);
    });

    panel.className = "egg-konami-panel";
    panel.setAttribute("role", "status");
    panel.setAttribute("aria-live", "polite");

    status.className = "egg-konami-status";
    eyebrow.className = "egg-konami-eyebrow";
    eyebrow.textContent = "Konami protocol accepted";
    title.textContent = "Secret Lab is online";

    lines.forEach(function (line, index) {
      var item = document.createElement("li");
      item.textContent = line;
      item.style.setProperty("--line-index", index);
      list.appendChild(item);
    });

    meter.className = "egg-konami-meter";
    status.appendChild(eyebrow);
    status.appendChild(title);
    status.appendChild(list);
    status.appendChild(meter);
    panel.appendChild(status);
    fragment.appendChild(panel);

    for (var index = 0; index < bitCount; index += 1) {
      var bit = document.createElement("span");
      bit.className = "egg-konami-bit";
      bit.textContent = glyphs[index % glyphs.length];
      bit.style.setProperty("--bit-left", 8 + ((index * 19) % 84) + "vw");
      bit.style.setProperty("--bit-top", 12 + ((index * 29) % 68) + "vh");
      bit.style.setProperty("--bit-delay", (index % 6) * 0.14 + "s");
      bit.style.setProperty("--bit-drift", (index % 2 === 0 ? 1 : -1) * (18 + (index % 5) * 8) + "px");
      fragment.appendChild(bit);
    }

    ["top-left", "top-right", "bottom-left", "bottom-right"].forEach(function (position) {
      var beacon = document.createElement("span");
      beacon.className = "egg-konami-beacon is-" + position;
      fragment.appendChild(beacon);
    });

    body.appendChild(fragment);

    konamiLabTimer = window.setTimeout(function () {
      panel.classList.add("is-leaving");
      document.querySelectorAll(".egg-konami-bit, .egg-konami-beacon").forEach(function (item) {
        item.classList.add("is-leaving");
      });
      konamiLabTimers.push(window.setTimeout(clearKonamiLab, reducedMotion.matches ? 120 : 420));
    }, duration);
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
    if (Object.keys(commands).some(function (command) {
      if (typedKeys.endsWith(command)) {
        commands[command]();
        typedKeys = "";
        return true;
      }
      return false;
    })) {
      return;
    }

    if (hiddenCommands.some(function (command) {
      if (matchesHiddenCommand(command)) {
        command.action();
        typedKeys = "";
        return true;
      }
      return false;
    })) {
      return;
    }

    if (body.classList.contains("egg-pi-summon") && matchesHiddenCommand(hiddenPiShortcut)) {
      triggerPiMeetingShortcut();
      typedKeys = "";
    }
  }

  setupCobotLongPress();

  if (body.classList.contains("publication-page")) {
    document.querySelectorAll(".pub-list li, .pub-years-nav a").forEach(function (item) {
      item.addEventListener("click", triggerPublicationCombo);
    });
  }

  document.addEventListener("keydown", function (event) {
    handleKonami(event);
    handleTypedCommand(event);
  });
})();

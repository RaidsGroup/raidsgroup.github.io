(function () {
  if (window.RAIDSEggs && window.RAIDSEggs.loaded) {
    return;
  }

  var nav = document.getElementById("site-nav");
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
    debug: triggerDemoDebug
  };
  var hiddenCommands = [
    { length: 6, hash: "fcc15595", action: triggerPiSummon }
  ];
  var hiddenPiShortcut = { length: 3, hash: "4e55ed59", action: triggerPiMeetingShortcut };
  var konamiLabStorageKey = "raids-secret-lab-active";
  var konamiWordSwapSelector = ".top-nav > a, .nav-dropdown-toggle, h1.page-title, .people-block > h2, .people-subtitle";
  var konamiWordSwaps = {
    "Home": "Base Camp",
    "Research": "Mad Science",
    "Projects": "Contraptions",
    "Demos": "Live Tests",
    "People": "Personnel",
    "Publications": "Classified Files",
    "Honors": "Trophy Vault",
    "Our Team": "The Roster",
    "CobotAI Team & Ecosystem": "CobotAI Ops & Network",
    "Core Research Directions": "Mad-Science Directives",
    "Awards and Recognition": "Loot & Bragging Rights",
    "Funded Research Projects": "Funded Contraptions",
    "Industry & Innovation Awards": "Industry Loot Vault",
    "Robot and System Demonstrations": "Live Robot Trials",
    "Faculty": "Mission Control",
    "PhD / MPhil Students": "Junior Operatives",
    "MSc": "Trainee Squad",
    "Research Staff": "Lab Crew",
    "Visiting Staff and Visiting Students": "Guest Agents",
    "Former Staff / Student": "Retired Agents",
    "Alumni": "Lab Legends",
    "About Us": "Dossier",
    "Staff": "Field Agents",
    "Leadership": "Command Deck",
    "Product & Market": "Ops & Intel",
    "Future Technology": "R&D Skunkworks",
    "Software, Ecosystem & Operations": "Systems & Logistics",
    "Finance & Human Resources": "Resource Vault",
    "Ecosystem": "Network",
    "Honors & Awards": "Trophy Wall"
  };

  function setKonamiLabPersisted(active) {
    try {
      if (active) {
        window.sessionStorage.setItem(konamiLabStorageKey, "1");
      } else {
        window.sessionStorage.removeItem(konamiLabStorageKey);
      }
    } catch (error) {
      // Storage may be unavailable in strict privacy contexts.
    }
  }

  function isKonamiLabPersisted() {
    try {
      return window.sessionStorage.getItem(konamiLabStorageKey) === "1";
    } catch (error) {
      return false;
    }
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

  function getRaidsPeopleRoot() {
    return document.querySelector("main.people-page");
  }

  function applyKonamiWordSwaps() {
    document.querySelectorAll(konamiWordSwapSelector).forEach(function (el) {
      var current = el.textContent.trim();
      var replacement = konamiWordSwaps[current];

      if (!replacement) {
        return;
      }

      if (!el.hasAttribute("data-egg-original-text")) {
        el.setAttribute("data-egg-original-text", el.textContent);
      }
      el.textContent = replacement;
    });
  }

  function restoreKonamiWordSwaps() {
    document.querySelectorAll("[data-egg-original-text]").forEach(function (el) {
      el.textContent = el.getAttribute("data-egg-original-text");
      el.removeAttribute("data-egg-original-text");
    });
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
    konamiLabTimer = null;
    konamiLabTimers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    konamiLabTimers = [];
    window.clearTimeout(titleTimer);
    titleTimer = null;
    document.title = originalTitle;
    setKonamiLabPersisted(false);
    piSummonRun += 1;
    endPiSummon();
    body.classList.remove(
      "egg-konami",
      "egg-konami-global",
      "egg-konami-home",
      "egg-konami-people",
      "egg-konami-publications",
      "egg-konami-prototypes",
      "egg-konami-honors"
    );
    restoreKonamiWordSwaps();
    document.querySelectorAll("[data-egg-lab-label], [data-egg-lab-id], [data-egg-clearance]").forEach(function (item) {
      item.removeAttribute("data-egg-lab-label");
      item.removeAttribute("data-egg-lab-id");
      item.removeAttribute("data-egg-clearance");
      item.style.removeProperty("--egg-lab-index");
      item.style.removeProperty("--egg-lab-delay");
      item.style.removeProperty("--egg-lab-tilt");
      item.classList.remove("is-egg-lab-target", "is-egg-lab-personnel", "is-egg-prime-prototype");
    });
    document.querySelectorAll(".egg-konami-panel, .egg-konami-bit, .egg-konami-beacon, .egg-konami-stage").forEach(function (item) {
      item.remove();
    });
  }

  function dismissKonamiLab() {
    var exitDelay = reducedMotion.matches ? 120 : 420;

    if (!body.classList.contains("egg-konami")) {
      return;
    }

    setKonamiLabPersisted(false);
    window.clearTimeout(konamiLabTimer);
    document.querySelectorAll(".egg-konami-panel, .egg-konami-bit").forEach(function (item) {
      item.classList.add("is-leaving");
    });
    konamiLabTimer = window.setTimeout(clearKonamiLab, exitDelay);
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

  function endPiSummon() {
    window.clearTimeout(piSummonTimer);
    piSummonTimer = null;
    clearPiPatrolTimers();
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
        window.scrollTo({ left: window.scrollX, top: targetScrollY, behavior: "auto" });
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
      endPiSummon();
    }, 9000);
  }

  function triggerPiMeetingShortcut() {
    var peopleRoot = getRaidsPeopleRoot();
    var piCard = Array.prototype.find.call((peopleRoot || document).querySelectorAll(".faculty-profile, .profile-card"), function (profile) {
      return /pai\s+zheng/i.test(profile.textContent);
    });
    var piImage = piCard ? piCard.querySelector(".profile-image img") : null;

    if (body.classList.contains("egg-konami") || !peopleRoot || !body.classList.contains("egg-pi-summon")) {
      return;
    }

    triggerPiMeetingStage(peopleRoot, piCard, piImage);
  }

  function triggerPiSummon() {
    var runId = piSummonRun + 1;
    var peopleRoot = getRaidsPeopleRoot();
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
    var patrolSpeed = 0.22;
    var patrolMinDuration = reducedMotion.matches ? 1 : 320;
    var patrolMaxDuration = reducedMotion.matches ? 1 : 2400;
    var raidTravelDuration = reducedMotion.matches ? 1 : 220;
    var raidReactionDelay = reducedMotion.matches ? 0 : 120;
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

    if (body.classList.contains("egg-konami") || !peopleRoot) {
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

    function estimateTravelDuration(distance) {
      if (reducedMotion.matches) {
        return 1;
      }
      return Math.min(patrolMaxDuration, Math.max(patrolMinDuration, distance / patrolSpeed));
    }

    function pointCenter(card) {
      var rect = card.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + Math.min(rect.height / 2, 150)
      };
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
    var estimatedPatrolDuration = 0;
    for (var routeIndex = 1; routeIndex < routeCards.length; routeIndex += 1) {
      var fromPoint = pointCenter(routeCards[routeIndex - 1]);
      var toPoint = pointCenter(routeCards[routeIndex]);
      estimatedPatrolDuration += estimateTravelDuration(Math.hypot(toPoint.x - fromPoint.x, toPoint.y - fromPoint.y));
    }
    piSummonDuration = Math.max(piSummonDuration, patrolStartDelay + estimatedPatrolDuration + raidEvents.length * (raidTravelDuration + raidReactionDelay + raidPause) + 1800);

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
      var activeFrame = null;
      var avatar = document.createElement("img");
      var wave = document.createElement("span");
      var hammer = document.createElement("span");
      var facingDirection = 1;
      var scatterScale = window.matchMedia("(max-width: 740px)").matches ? 0.55 : 1;
      var assignedMissions = shuffled(missions);
      var startRect;
      var startPoint;
      var currentDocPoint;

      function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
      }

      function getAvatarMargin() {
        return Math.max(44, Math.min(78, window.innerWidth / 2 - 8, window.innerHeight / 2 - 8));
      }

      function getMaxX() {
        var margin = getAvatarMargin();
        return Math.max(margin, window.innerWidth - margin);
      }

      function getMaxY() {
        var margin = getAvatarMargin();
        return Math.max(margin, window.innerHeight - margin);
      }

      function maxScrollTop() {
        return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      }

      function cardCenter(card) {
        var rect = card.getBoundingClientRect();
        var margin = getAvatarMargin();
        return {
          x: window.scrollX + clamp(rect.left + rect.width / 2, margin, getMaxX()),
          y: window.scrollY + rect.top + Math.min(rect.height / 2, 150)
        };
      }

      function renderAvatarAt(docPoint, followScroll) {
        var margin = getAvatarMargin();
        var maxX = getMaxX();
        var maxY = getMaxY();
        var desiredScrollY = clamp(docPoint.y - window.innerHeight * 0.46, 0, maxScrollTop());
        var viewportX;
        var viewportY;

        if (followScroll !== false && !reducedMotion.matches) {
          window.scrollTo({ left: window.scrollX, top: desiredScrollY, behavior: "auto" });
        }

        viewportX = clamp(docPoint.x - window.scrollX, margin, maxX);
        viewportY = clamp(docPoint.y - window.scrollY, margin, maxY);
        avatar.style.left = viewportX + "px";
        avatar.style.top = viewportY + "px";
        avatar.style.setProperty("--egg-drop-x", "0px");
        avatar.style.setProperty("--egg-drop-y", "0px");
        wave.style.left = viewportX + "px";
        wave.style.top = viewportY + "px";
        hammer.style.left = clamp(viewportX + margin * 0.56 * facingDirection, margin, maxX) + "px";
        hammer.style.top = clamp(viewportY + margin * 0.12, margin, maxY) + "px";
      }

      startRect = landingCard.getBoundingClientRect();
      startPoint = {
        x: clamp(startRect.left + startRect.width / 2, getAvatarMargin(), getMaxX()),
        y: clamp(startRect.top + Math.min(startRect.height / 2, 150), getAvatarMargin(), getMaxY())
      };
      currentDocPoint = {
        x: window.scrollX + startPoint.x,
        y: window.scrollY + startRect.top + Math.min(startRect.height / 2, 150)
      };

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
        var margin = getAvatarMargin();
        var visibleCards = routeCards.filter(function (card) {
          var rect = card.getBoundingClientRect();
          return card !== anchorCard && rect.bottom > margin && rect.top < window.innerHeight - margin;
        });
        var unvisitedVisibleCards = visibleCards.filter(function (card) {
          return visitedCards.indexOf(card) === -1;
        });
        var candidates = unvisitedVisibleCards.length ? unvisitedVisibleCards : visibleCards;

        if (!candidates.length) {
          return anchorCard;
        }

        return candidates.sort(function (a, b) {
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

      function moveAvatarTo(card, index, isRaid, onArrive) {
        var targetPoint = cardCenter(card);
        var duration = isRaid ? raidTravelDuration : estimateTravelDuration(Math.hypot(targetPoint.x - currentDocPoint.x, targetPoint.y - currentDocPoint.y));

        avatar.classList.toggle("is-raiding", !!isRaid);
        hammer.classList.toggle("is-raiding", !!isRaid);
        animateAvatarTo(targetPoint, duration, !isRaid, function () {
          markPatrolStop(card, index, isRaid);
          if (onArrive) {
            onArrive();
          }
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

      function visitIndex(index) {
        if (runId !== piSummonRun || index >= routeCards.length) {
          return;
        }

        moveAvatarTo(routeCards[index], index, false, function () {
          var isRaidStep = raidEvents.some(function (event) {
            return event.step === index;
          });

          if (!isRaidStep) {
            visitIndex(index + 1);
            return;
          }

          piPatrolTimers.push(window.setTimeout(function () {
            if (runId !== piSummonRun) {
              return;
            }

            var raidTarget = pickNearbyRaidTarget(routeCards[index]);
            moveAvatarTo(raidTarget, Math.max(0, routeCards.indexOf(raidTarget)), true, function () {
              piPatrolTimers.push(window.setTimeout(function () {
                if (runId === piSummonRun) {
                  visitIndex(index + 1);
                }
              }, raidPause));
            });
          }, raidReactionDelay));
        });
      }

      if (routeCards.length > 1) {
        piPatrolTimers.push(window.setTimeout(function () {
          if (runId === piSummonRun) {
            visitIndex(1);
          }
        }, patrolStartDelay));
      }
    }, reducedMotion.matches ? 20 : 40);

    piSummonTimer = window.setTimeout(function () {
      if (runId !== piSummonRun) {
        return;
      }

      endPiSummon();
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

  function markKonamiTargets(targets, labels, idPrefix, maxItems) {
    Array.prototype.forEach.call(targets, function (target, index) {
      if (maxItems && index >= maxItems) {
        return;
      }
      target.classList.add("is-egg-lab-target");
      target.setAttribute("data-egg-lab-label", labels[index % labels.length]);
      target.setAttribute("data-egg-lab-id", idPrefix + "-" + String(index + 1).padStart(2, "0"));
      target.style.setProperty("--egg-lab-index", index);
      target.style.setProperty("--egg-lab-delay", (index % 12) * 0.035 + "s");
      target.style.setProperty("--egg-lab-tilt", ((index % 3) - 1) * 0.45 + "deg");
    });
  }

  function markKonamiPageTargets() {
    var main = document.querySelector("main") || body;
    var globalLabels = [
      "classified bay",
      "prototype cell",
      "lab clearance",
      "armory note",
      "reactor feed",
      "sealed file",
      "weapon r&d",
      "dark lab"
    ];
    var peopleLabels = [
      "CLEARANCE L4",
      "PROTOTYPE UNIT",
      "ARMORY CREW",
      "WEAPON R&D",
      "FIELD TESTER",
      "REACTOR TEAM",
      "ROBOT HANDLER",
      "CLASSIFIED"
    ];
    var peopleRoot = document.querySelector("main.people-page") || (body.classList.contains("people-page") ? main : null);
    var globalTargets = main.querySelectorAll([
      ".home-highlights",
      ".home-pillar",
      ".home-explore-card",
      ".home-updates li",
      ".research-theme",
      ".research-card",
      ".projects-stat",
      ".project-item",
      ".demo-card",
      ".pub-stat",
      ".pub-years-nav a",
      ".pub-list li",
      ".award-card",
      ".honors-stat",
      ".honors-timeline li",
      ".cobotai-about",
      ".cobotai-staff-group"
    ].join(", "));

    body.classList.add("egg-konami-global");
    markKonamiTargets(globalTargets, globalLabels, "LAB", 24);

    if (body.classList.contains("home-page")) {
      body.classList.add("egg-konami-home");
    }
    if (peopleRoot) {
      body.classList.add("egg-konami-people");
      markKonamiTargets(peopleRoot.querySelectorAll(".profile-card, .faculty-profile"), peopleLabels, "RND");
      peopleRoot.querySelectorAll(".profile-card, .faculty-profile").forEach(function (card, index) {
        card.classList.add("is-egg-lab-personnel");
        card.setAttribute("data-egg-clearance", peopleLabels[index % peopleLabels.length]);
        if (index % 11 === 0) {
          card.classList.add("is-egg-prime-prototype");
        }
      });
      markKonamiTargets(peopleRoot.querySelectorAll(".people-block"), [
        "personnel archive",
        "prototype roster",
        "restricted division",
        "night shift cell"
      ], "CELL");
    }
    if (body.classList.contains("publication-page") || main.querySelector(".pub-list")) {
      body.classList.add("egg-konami-publications");
    }
    if (body.classList.contains("demos-page") || main.querySelector(".research-card, .project-item, .demo-card")) {
      body.classList.add("egg-konami-prototypes");
    }
    if (body.classList.contains("honors-page") || main.querySelector(".award-card, .honors-timeline")) {
      body.classList.add("egg-konami-honors");
    }
  }

  function triggerKonamiLab() {
    var lines = [
      "↑ ↑ ↓ ↓ ← → ← → B A opens the Secret Lab",
      "Press Esc to return to the surface",
      "Inside: ultra-smart robots, next-gen Skynet prototypes, and suspiciously friendly robot collaborators"
    ];
    var glyphs = ["↑", "↓", "←", "→", "B", "A", "LAB", "R&D"];
    var panel = document.createElement("div");
    var status = document.createElement("div");
    var eyebrow = document.createElement("p");
    var title = document.createElement("h2");
    var list = document.createElement("ol");
    var meter = document.createElement("div");
    var fragment = document.createDocumentFragment();
    var bitCount = reducedMotion.matches ? 4 : 8;

    clearKonamiLab();
    setKonamiLabPersisted(true);
    window.clearTimeout(titleTimer);
    titleTimer = null;
    document.title = "RAIDS | Secret Lab";
    body.classList.add("egg-konami");
    markKonamiPageTargets();
    applyKonamiWordSwaps();

    panel.className = "egg-konami-panel";
    panel.setAttribute("role", "status");
    panel.setAttribute("aria-live", "polite");

    status.className = "egg-konami-status";
    eyebrow.className = "egg-konami-eyebrow";
    eyebrow.textContent = "Konami protocol accepted";
    title.textContent = "Secret Lab";

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

    body.appendChild(fragment);
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
    if (!body.classList.contains("egg-konami") && Object.keys(commands).some(function (command) {
      if (typedKeys.endsWith(command)) {
        commands[command]();
        typedKeys = "";
        return true;
      }
      return false;
    })) {
      return;
    }

    if (getRaidsPeopleRoot() && hiddenCommands.some(function (command) {
      if (matchesHiddenCommand(command)) {
        command.action();
        typedKeys = "";
        return true;
      }
      return false;
    })) {
      return;
    }

    if (getRaidsPeopleRoot() && body.classList.contains("egg-pi-summon") && matchesHiddenCommand(hiddenPiShortcut)) {
      triggerPiMeetingShortcut();
      typedKeys = "";
    }
  }


  window.RAIDSEggs = {
    loaded: true,
    dismissKonamiLab: dismissKonamiLab,
    handleKeydown: function (event) {
      handleKonami(event);
      handleTypedCommand(event);
    },
    trigger: function (action, event) {
      if (action === "konami") {
        triggerKonamiLab();
      } else if (action === "sure") {
        triggerSureDecoder();
      } else if (action === "debug") {
        triggerDemoDebug();
      } else if (action === "piSummon") {
        triggerPiSummon();
      } else if (action === "piMeeting") {
        triggerPiMeetingShortcut();
      }
    }
  };

  if (isKonamiLabPersisted()) {
    triggerKonamiLab();
  }
})();

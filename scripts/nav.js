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
  var publicationComboTriggered = false;
  var cobotNavTimer = null;
  var piSummonTimer = null;
  var piMeetingTimer = null;
  var piMeetingSpeechTimer = null;
  var piPatrolTimers = [];
  var piPatrolFrames = [];
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

    window.clearTimeout(cobotNavTimer);
    body.classList.remove("egg-cobot-nav");
    nav.querySelectorAll("[data-egg-label], [data-egg-status]").forEach(function (item) {
      item.removeAttribute("data-egg-label");
      item.removeAttribute("data-egg-status");
    });

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

    body.classList.add("egg-cobot-nav");

    cobotNavTimer = window.setTimeout(function () {
      body.classList.remove("egg-cobot-nav");
      nav.querySelectorAll("[data-egg-label], [data-egg-status]").forEach(function (item) {
        item.removeAttribute("data-egg-label");
        item.removeAttribute("data-egg-status");
      });
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
    if (publicationComboTriggered) {
      return;
    }

    window.clearTimeout(publicationClickTimer);
    publicationClicks += 1;
    publicationClickTimer = window.setTimeout(function () {
      publicationClicks = 0;
    }, 1600);

    if (publicationClicks === 5 || publicationClicks === 9) {
      publicationComboTriggered = true;
      window.clearTimeout(publicationClickTimer);
      setTempClass("egg-citation-combo", 2800);
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

    if (!avatar) {
      avatar = document.createElement("img");
      avatar.className = "egg-pi-drop-avatar is-patrolling";
      avatar.src = piImage ? piImage.src : "assets/people/zheng_pai.jpg";
      avatar.alt = "";
      body.appendChild(avatar);
    }

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
      megaphone.style.left = clamp(viewportX + 48, avatarMargin, window.innerWidth - avatarMargin) + "px";
      megaphone.style.top = clamp(viewportY - 34, avatarMargin, window.innerHeight - avatarMargin) + "px";
      speech.style.left = clamp(viewportX + 94, avatarMargin, window.innerWidth - avatarMargin) + "px";
      speech.style.top = clamp(viewportY - 72, avatarMargin, window.innerHeight - avatarMargin) + "px";
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
      document.querySelectorAll(".egg-pi-meeting-speech").forEach(function (item) {
        item.classList.remove("is-visible");
        window.setTimeout(function () {
          item.remove();
        }, 220);
      });
      document.querySelectorAll(".egg-pi-drop-avatar").forEach(function (item) {
        item.classList.remove("is-patrolling", "is-raiding", "is-meeting");
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
        avatar.classList.remove("is-patrolling", "is-raiding", "is-meeting");
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
    setTempTitle("RAIDS | Secret Lab", 12000);
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

    if (typedKeys.endsWith("pai") && body.classList.contains("egg-pi-summon")) {
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

(function () {
  if (!document.body.classList.contains("publication-page")) {
    return;
  }

  var body = document.body;
  var publicationClicks = 0;
  var publicationClickTimer = null;
  var publicationComboPulseTimer = null;
  var publicationComboToastTimer = null;
  var publicationComboTargetTimer = null;
  var effectsCssLoaded = false;

  function loadEffectsCss() {
    var href = "styles/effects.css";
    if (effectsCssLoaded || document.querySelector('link[href="' + href + '"]')) {
      effectsCssLoaded = true;
      return;
    }
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
    effectsCssLoaded = true;
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

    loadEffectsCss();
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

  document.querySelectorAll(".pub-list li, .pub-years-nav a").forEach(function (item) {
    item.addEventListener("click", triggerPublicationCombo);
  });
})();

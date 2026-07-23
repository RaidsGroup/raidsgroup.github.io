(function () {
  // Replace with your GoatCounter site URL after registering at https://www.goatcounter.com/
  // Example: "https://YOURCODE.goatcounter.com/count"
  var GOATCOUNTER_ENDPOINT = "https://raidsgroup.goatcounter.com/count";

  // Read-only API key for live visitor map (User menu → API).
  // Create a key with stats/read permission only, then paste it here.
  var GOATCOUNTER_API_KEY = "23d7c2z4v4b8919senl2h6hokj17yskwwl0n5ah108ko9l9uq4do";

  var host = window.location.hostname;
  var isLocal =
    !host ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    window.location.protocol === "file:";

  var isConfigured =
    !!GOATCOUNTER_ENDPOINT && GOATCOUNTER_ENDPOINT.indexOf("YOURCODE") === -1;

  function siteBaseFromEndpoint(endpoint) {
    try {
      return new URL(endpoint).origin;
    } catch (e) {
      return null;
    }
  }

  var siteBase = isConfigured ? siteBaseFromEndpoint(GOATCOUNTER_ENDPOINT) : null;

  window.RAIDS_ANALYTICS = {
    endpoint: GOATCOUNTER_ENDPOINT,
    apiKey: GOATCOUNTER_API_KEY,
    siteBase: siteBase,
  };

  function loadCounterScript() {
    if (!isConfigured || isLocal || !siteBase) {
      return;
    }

    window.goatcounter = { no_onload: false };

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://gc.zgo.at/count.js";
    script.setAttribute("data-goatcounter", GOATCOUNTER_ENDPOINT);
    document.head.appendChild(script);
  }

  function fetchCount(path) {
    return fetch(siteBase + "/counter/" + encodeURIComponent(path) + ".json")
      .then(function (res) {
        if (res.status === 404) {
          return { count: "0" };
        }
        if (!res.ok) {
          return null;
        }
        return res.json();
      })
      .then(function (data) {
        return data && data.count != null ? String(data.count) : null;
      })
      .catch(function () {
        return null;
      });
  }

  function pagePathForCounter() {
    if (window.goatcounter && typeof window.goatcounter.get_data === "function") {
      try {
        var data = window.goatcounter.get_data();
        if (data && data.p) {
          return data.p;
        }
      } catch (e) {
        /* fall through */
      }
    }
    return window.location.pathname || "/";
  }

  function setStat(root, key, value) {
    var el = (root || document).querySelector('[data-stat="' + key + '"]');
    if (el && value != null) {
      el.textContent = value;
    }
  }

  function fillHomeTotal() {
    if (!siteBase) {
      return;
    }

    var homeTotal = document.querySelector('[data-stat="home-total"]');
    if (!homeTotal) {
      return;
    }

    fetchCount("TOTAL").then(function (count) {
      if (count != null) {
        homeTotal.textContent = count;
      }
    });
  }

  function renderFooterStats() {
    if (!siteBase) {
      return;
    }

    var footerInner = document.querySelector(".footer-inner");
    if (!footerInner || footerInner.querySelector(".footer-stats")) {
      return;
    }

    var stats = document.createElement("p");
    stats.className = "footer-stats";
    stats.setAttribute("aria-live", "polite");
    stats.innerHTML =
      '<span class="footer-stats-item">Site visitors: <span data-stat="total">…</span></span>' +
      '<span class="footer-stats-sep" aria-hidden="true">·</span>' +
      '<span class="footer-stats-item">This page: <span data-stat="page">…</span></span>' +
      '<span class="footer-stats-sep" aria-hidden="true">·</span>' +
      '<a class="footer-stats-map" href="' +
      siteBase +
      '" target="_blank" rel="noopener noreferrer">Visitor map</a>';

    footerInner.appendChild(stats);

    fetchCount("TOTAL").then(function (count) {
      setStat(stats, "total", count);
    });

    function fillPageCount() {
      fetchCount(pagePathForCounter()).then(function (count) {
        setStat(stats, "page", count != null ? count : "0");
      });
    }

    if (window.goatcounter && typeof window.goatcounter.get_data === "function") {
      fillPageCount();
      return;
    }

    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if (
        (window.goatcounter && typeof window.goatcounter.get_data === "function") ||
        tries >= 20
      ) {
        clearInterval(timer);
        fillPageCount();
      }
    }, 100);
  }

  function initStatsUi() {
    fillHomeTotal();
    renderFooterStats();
  }

  loadCounterScript();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStatsUi);
  } else {
    initStatsUi();
  }
})();

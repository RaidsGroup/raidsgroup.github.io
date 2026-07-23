(function () {
  // Replace with your GoatCounter site URL after registering at https://www.goatcounter.com/
  // Example: "https://YOURCODE.goatcounter.com/count"
  var GOATCOUNTER_ENDPOINT = "https://raidsgroup.goatcounter.com/count";

  // Read-only API key for live visitor totals / map (User menu → API).
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

  function apiHeaders() {
    // Only Authorization — avoid Content-Type on GET (extra CORS preflight).
    return {
      Authorization: "Bearer " + GOATCOUNTER_API_KEY,
    };
  }

  function formatCount(n) {
    var num = Number(n);
    if (!isFinite(num)) {
      return null;
    }
    try {
      return num.toLocaleString("en-US");
    } catch (e) {
      return String(num);
    }
  }

  // Default GoatCounter range is the last week; that matches the dashboard and
  // avoids "not found" when start is before the site existed.
  function fetchSiteTotalFromApi() {
    if (!GOATCOUNTER_API_KEY || !siteBase) {
      return Promise.resolve(null);
    }

    return fetch(siteBase + "/api/v0/stats/total", {
      headers: apiHeaders(),
    })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("total " + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        if (!data) {
          return null;
        }
        // Prefer overall total; fall back to UTC total.
        if (data.total != null) {
          return formatCount(data.total);
        }
        if (data.total_utc != null) {
          return formatCount(data.total_utc);
        }
        return null;
      })
      .catch(function () {
        return null;
      });
  }

  function fillHomeTotal() {
    if (!siteBase) {
      return;
    }

    var homeTotal = document.querySelector('[data-stat="home-total"]');
    if (!homeTotal) {
      return;
    }

    fetchSiteTotalFromApi().then(function (count) {
      if (count != null) {
        homeTotal.textContent = count;
        return;
      }
      // Keep ellipsis rather than a misleading public-counter "0".
      homeTotal.textContent = "—";
    });
  }

  loadCounterScript();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fillHomeTotal);
  } else {
    fillHomeTotal();
  }
})();

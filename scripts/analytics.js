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

  function apiHeaders() {
    return {
      Authorization: "Bearer " + GOATCOUNTER_API_KEY,
      "Content-Type": "application/json",
    };
  }

  function isoDateTime(date) {
    return date.toISOString().replace(/\.\d{3}Z$/, "Z");
  }

  // Prefer the stats API when we have a key (public /counter/TOTAL.json is often 0 / heavily cached).
  function fetchSiteTotalFromApi() {
    if (!GOATCOUNTER_API_KEY || !siteBase) {
      return Promise.resolve(null);
    }

    return fetch(siteBase + "/api/v0/me", { headers: apiHeaders() })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("me " + res.status);
        }
        return res.json();
      })
      .then(function (me) {
        var created =
          (me.user && me.user.created_at) || new Date().toISOString();
        var start = new Date(created);
        start.setUTCMinutes(0, 0, 0);
        var end = new Date();
        end.setUTCMinutes(0, 0, 0);

        var url =
          siteBase +
          "/api/v0/stats/total?start=" +
          encodeURIComponent(isoDateTime(start)) +
          "&end=" +
          encodeURIComponent(isoDateTime(end));

        return fetch(url, { headers: apiHeaders() });
      })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("total " + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        if (data && data.total != null) {
          return String(data.total);
        }
        return null;
      })
      .catch(function () {
        return null;
      });
  }

  function fetchSiteTotal() {
    return fetchSiteTotalFromApi().then(function (count) {
      if (count != null) {
        return count;
      }

      return fetch(siteBase + "/counter/" + encodeURIComponent("TOTAL") + ".json")
        .then(function (res) {
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

    fetchSiteTotal().then(function (count) {
      if (count != null) {
        homeTotal.textContent = count;
      }
    });
  }

  loadCounterScript();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fillHomeTotal);
  } else {
    fillHomeTotal();
  }
})();

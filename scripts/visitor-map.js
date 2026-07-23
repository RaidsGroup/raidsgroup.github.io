(function () {
  var section = document.querySelector(".home-visitors-section");
  if (!section || typeof d3 === "undefined" || typeof topojson === "undefined") {
    return;
  }

  var svgEl = section.querySelector(".home-visitors-map-svg");
  var listEl = section.querySelector(".home-visitors-list");
  var statusEl = section.querySelector(".home-visitors-status");
  if (!svgEl || !listEl) {
    return;
  }

  var width = 960;
  var height = 480;
  var analytics = window.RAIDS_ANALYTICS || {};
  var siteBase = analytics.siteBase || "https://raidsgroup.goatcounter.com";
  var apiKey = analytics.apiKey || "";

  function assetUrl(path) {
    try {
      return new URL(path, window.location.href).href;
    } catch (e) {
      return path;
    }
  }

  function setStatus(text) {
    if (statusEl) {
      statusEl.textContent = text || "";
    }
  }

  function colorForCount(count, max) {
    if (!count || !max) {
      return "#e8eaed";
    }
    var t = Math.sqrt(count / max);
    t = Math.max(0.18, Math.min(1, t));
    var soft = { r: 247, g: 233, b: 236 };
    var hard = { r: 158, g: 36, b: 53 };
    var r = Math.round(soft.r + (hard.r - soft.r) * t);
    var g = Math.round(soft.g + (hard.g - soft.g) * t);
    var b = Math.round(soft.b + (hard.b - soft.b) * t);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function renderList(locations, max) {
    listEl.innerHTML = "";
    if (!locations.length) {
      listEl.innerHTML = "<li class=\"home-visitors-empty\">No location data yet.</li>";
      return;
    }

    locations.slice(0, 8).forEach(function (row) {
      var li = document.createElement("li");
      var pct = max ? Math.round((row.count / max) * 100) : 0;
      li.innerHTML =
        '<span class="home-visitors-list-name">' +
        row.name +
        "</span>" +
        '<span class="home-visitors-list-bar" aria-hidden="true"><span style="width:' +
        pct +
        '%"></span></span>' +
        '<span class="home-visitors-list-count">' +
        row.count +
        "</span>";
      listEl.appendChild(li);
    });
  }

  function renderMap(topo, centroids, locations) {
    var byCode = {};
    var max = 0;
    locations.forEach(function (row) {
      byCode[row.code] = row;
      if (row.count > max) {
        max = row.count;
      }
    });

    var numericToA2 = window.__RAIDS_ISO_NUMERIC__ || {};
    var projection = d3.geoNaturalEarth1().fitSize([width, height], { type: "Sphere" });
    var path = d3.geoPath(projection);

    var svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    svg.attr("viewBox", "0 0 " + width + " " + height).attr("role", "img");

    svg
      .append("path")
      .datum({ type: "Sphere" })
      .attr("class", "home-visitors-sphere")
      .attr("d", path);

    var countries = topojson.feature(topo, topo.objects.countries).features;

    svg
      .append("g")
      .attr("class", "home-visitors-countries")
      .selectAll("path")
      .data(countries)
      .join("path")
      .attr("d", path)
      .attr("class", "home-visitors-country")
      .attr("fill", function (d) {
        var a2 = numericToA2[String(d.id)];
        var row = a2 ? byCode[a2] : null;
        return colorForCount(row ? row.count : 0, max);
      })
      .append("title")
      .text(function (d) {
        var a2 = numericToA2[String(d.id)];
        var row = a2 ? byCode[a2] : null;
        return row ? row.name + ": " + row.count : a2 || String(d.id);
      });

    var bubbles = locations.filter(function (row) {
      return centroids[row.code];
    });

    svg
      .append("g")
      .attr("class", "home-visitors-bubbles")
      .selectAll("circle")
      .data(bubbles)
      .join("circle")
      .attr("class", "home-visitors-bubble")
      .attr("cx", function (d) {
        return projection([centroids[d.code].lon, centroids[d.code].lat])[0];
      })
      .attr("cy", function (d) {
        return projection([centroids[d.code].lon, centroids[d.code].lat])[1];
      })
      .attr("r", function (d) {
        return 4 + Math.sqrt(d.count / Math.max(max, 1)) * 14;
      })
      .append("title")
      .text(function (d) {
        return d.name + ": " + d.count;
      });

    renderList(locations, max);
  }

  function loadIsoNumeric() {
    return fetch("https://cdn.jsdelivr.net/npm/i18n-iso-countries@7.14.0/codes.json")
      .then(function (res) {
        return res.json();
      })
      .then(function (codes) {
        var map = {};
        codes.forEach(function (row) {
          if (row[0] && row[2]) {
            map[String(Number(row[2]))] = row[0];
          }
        });
        window.__RAIDS_ISO_NUMERIC__ = map;
        return map;
      })
      .catch(function () {
        window.__RAIDS_ISO_NUMERIC__ = {};
        return {};
      });
  }

  function normalizeLocations(rows) {
    var byCode = {};
    (rows || []).forEach(function (row) {
      var rawId = String(row.id || row.code || "").trim();
      if (!rawId || rawId === "(unknown)") {
        return;
      }
      var code = rawId.indexOf("-") >= 0 ? rawId.split("-")[0] : rawId;
      if (!/^[A-Z]{2}$/i.test(code)) {
        return;
      }
      code = code.toUpperCase();
      var count = Number(row.count) || 0;
      if (!byCode[code]) {
        byCode[code] = {
          code: code,
          name: row.name || code,
          count: 0,
        };
      }
      byCode[code].count += count;
      if (row.name && (!byCode[code].name || byCode[code].name === code)) {
        byCode[code].name = row.name;
      }
    });

    return Object.keys(byCode)
      .map(function (code) {
        return byCode[code];
      })
      .sort(function (a, b) {
        return b.count - a.count;
      });
  }

  function apiHeaders() {
    // Only Authorization — avoid Content-Type on GET (extra CORS preflight).
    return {
      Authorization: "Bearer " + apiKey,
    };
  }

  function fetchLiveLocations() {
    if (!apiKey || !siteBase) {
      return Promise.resolve(null);
    }

    // Default range is last week (same as GoatCounter dashboard).
    return fetch(siteBase + "/api/v0/stats/locations?limit=100", {
      headers: apiHeaders(),
    })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("GoatCounter locations API " + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        return {
          source: "live",
          updated: new Date().toISOString().slice(0, 10),
          locations: normalizeLocations(data.stats || []),
        };
      })
      .catch(function () {
        return null;
      });
  }

  function fetchCachedLocations() {
    return fetch(assetUrl("assets/data/visitor-locations.json"))
      .then(function (res) {
        return res.ok ? res.json() : { locations: [] };
      })
      .then(function (payload) {
        return {
          source: "cache",
          updated: payload.updated || "",
          locations: normalizeLocations(payload.locations || []),
        };
      })
      .catch(function () {
        return { source: "cache", updated: "", locations: [] };
      });
  }

  function loadLocations() {
    return fetchLiveLocations().then(function (live) {
      if (live && live.locations && live.locations.length) {
        return live;
      }
      if (live && apiKey) {
        // API worked but empty — still prefer live empty over stale cache.
        return live;
      }
      return fetchCachedLocations();
    });
  }

  Promise.all([
    loadIsoNumeric(),
    fetch(assetUrl("assets/data/countries-110m.json")).then(function (r) {
      return r.json();
    }),
    fetch(assetUrl("assets/data/country-centroids.json")).then(function (r) {
      return r.json();
    }),
    loadLocations(),
  ])
    .then(function (results) {
      var topo = results[1];
      var centroids = results[2];
      var payload = results[3] || { locations: [] };

      renderMap(topo, centroids, payload.locations || []);

      if (payload.source === "live") {
        setStatus(payload.updated ? "Live · " + payload.updated : "Live");
      } else if (payload.updated) {
        setStatus("Cached · " + payload.updated);
      } else if (!apiKey) {
        setStatus("Add API key for live map");
      } else {
        setStatus("");
      }
    })
    .catch(function () {
      setStatus("Could not load visitor map.");
      listEl.innerHTML = "<li class=\"home-visitors-empty\">Could not load visitor map.</li>";
    });
})();

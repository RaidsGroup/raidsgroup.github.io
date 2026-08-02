(function () {
  "use strict";

  var cards = Array.prototype.slice.call(document.querySelectorAll(".demos-page .demo-card"));
  if (!cards.length) {
    return;
  }

  var analytics = window.RAIDS_ANALYTICS || {};
  var siteBase = analytics.siteBase || "";
  var apiKey = analytics.apiKey || "";
  var statsStart = "2020-01-01T00:00:00Z";
  var refreshInterval = 60000;
  var refreshAfterEvent = 15000;
  var localHost =
    !window.location.hostname ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:";
  var numberFormatter = new Intl.NumberFormat("en");
  var entries = [];
  var entriesByEvent = {};
  var optimisticUntil = {};
  var eventQueue = [];
  var trackerPoll = null;
  var eventRefreshTimer = null;

  function eventName(kind, videoId) {
    return "demo-" + kind + "-" + videoId;
  }

  function videoIdFrom(video) {
    var source = video.querySelector("source");
    var src = source ? source.getAttribute("src") || "" : video.getAttribute("src") || "";
    var filename = src.split("/").pop().replace(/\.[^.]+$/, "");
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Likes still work for this page view when storage is unavailable.
    }
  }

  function setCount(element, count) {
    count = Math.max(0, Number(count) || 0);
    element.dataset.count = String(count);
    element.textContent = numberFormatter.format(count);
  }

  function displayedCount(element) {
    var count = Number(element.dataset.count);
    return Number.isFinite(count) ? count : 0;
  }

  function updateMetricLabel(entry, kind) {
    var countElement = kind === "play" ? entry.playCount : entry.likeCount;
    var labelElement = kind === "play" ? entry.playLabel : entry.likeLabel;
    var count = displayedCount(countElement);
    labelElement.textContent = kind === "play" ? (count === 1 ? "play" : "plays") : count === 1 ? "like" : "likes";
  }

  function incrementMetric(entry, kind) {
    var countElement = kind === "play" ? entry.playCount : entry.likeCount;
    var name = eventName(kind, entry.videoId);
    setCount(countElement, displayedCount(countElement) + 1);
    optimisticUntil[name] = Date.now() + 20000;
    updateMetricLabel(entry, kind);
  }

  function markLiked(entry) {
    entry.likeButton.classList.add("is-liked");
    entry.likeButton.setAttribute("aria-pressed", "true");
    entry.likeButton.setAttribute("aria-label", "You liked " + entry.title);
    entry.likeButton.title = "Liked";
    entry.likeButton.disabled = true;
  }

  function queueEvent(name, title, noSession) {
    if (localHost) {
      return;
    }

    eventQueue.push({
      path: name,
      title: title,
      event: true,
      no_session: noSession,
    });
    flushEventQueue();
  }

  function flushEventQueue() {
    if (window.goatcounter && typeof window.goatcounter.count === "function") {
      while (eventQueue.length) {
        window.goatcounter.count(eventQueue.shift());
      }
      if (trackerPoll) {
        window.clearInterval(trackerPoll);
        trackerPoll = null;
      }
      scheduleEventRefresh();
      return;
    }

    if (!trackerPoll && eventQueue.length) {
      var attempts = 0;
      trackerPoll = window.setInterval(function () {
        attempts += 1;
        if (window.goatcounter && typeof window.goatcounter.count === "function") {
          flushEventQueue();
        } else if (attempts >= 40) {
          window.clearInterval(trackerPoll);
          trackerPoll = null;
          eventQueue.length = 0;
        }
      }, 250);
    }
  }

  function scheduleEventRefresh() {
    if (eventRefreshTimer) {
      window.clearTimeout(eventRefreshTimer);
    }
    eventRefreshTimer = window.setTimeout(function () {
      eventRefreshTimer = null;
      refreshCounts();
    }, refreshAfterEvent);
  }

  function engagementMarkup() {
    return (
      '<span class="demo-engagement-item demo-play-stat" title="Video plays">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"></path><circle cx="12" cy="12" r="2.6"></circle></svg>' +
      '<span class="demo-play-count">0</span> <span class="demo-play-label">plays</span>' +
      "</span>" +
      '<button class="demo-like-button" type="button" aria-pressed="false">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"></path></svg>' +
      '<span class="demo-like-count">0</span> <span class="demo-like-label">likes</span>' +
      "</button>"
    );
  }

  function addEngagement(card) {
    var video = card.querySelector("video");
    var body = card.querySelector(".demo-card-body");
    if (!video || !body) {
      return;
    }

    var videoId = videoIdFrom(video);
    if (!videoId) {
      return;
    }

    var heading = card.querySelector(".demo-card-head h3");
    var title = heading ? heading.textContent.trim() : video.title || videoId;
    var row = document.createElement("div");
    row.className = "demo-engagement";
    row.setAttribute("aria-label", "Engagement for " + title);
    row.innerHTML = engagementMarkup();

    var meta = body.querySelector(".demo-card-meta");
    if (meta) {
      meta.insertAdjacentElement("afterend", row);
    } else {
      body.appendChild(row);
    }

    var entry = {
      video: video,
      videoId: videoId,
      title: title,
      playCount: row.querySelector(".demo-play-count"),
      playLabel: row.querySelector(".demo-play-label"),
      likeButton: row.querySelector(".demo-like-button"),
      likeCount: row.querySelector(".demo-like-count"),
      likeLabel: row.querySelector(".demo-like-label"),
    };

    var playEvent = eventName("play", videoId);
    var likeEvent = eventName("like", videoId);
    entries.push(entry);
    entriesByEvent[playEvent] = { entry: entry, kind: "play" };
    entriesByEvent[likeEvent] = { entry: entry, kind: "like" };
    entry.likeButton.setAttribute("aria-label", "Like " + title);
    entry.likeButton.title = "Like this video";

    if (safeStorageGet("raids-demo-liked:" + videoId) === "1") {
      markLiked(entry);
    }

    video.addEventListener(
      "play",
      function () {
        incrementMetric(entry, "play");
        queueEvent(playEvent, "Video play: " + title, true);
      },
      { once: true }
    );

    entry.likeButton.addEventListener("click", function () {
      if (entry.likeButton.getAttribute("aria-pressed") === "true") {
        return;
      }
      incrementMetric(entry, "like");
      safeStorageSet("raids-demo-liked:" + videoId, "1");
      markLiked(entry);
      queueEvent(likeEvent, "Video like: " + title, false);
    });
  }

  function applyCounts(hits) {
    var serverCounts = {};
    (hits || []).forEach(function (hit) {
      if (hit && hit.path) {
        serverCounts[hit.path] = Number(hit.count) || 0;
      }
    });

    Object.keys(entriesByEvent).forEach(function (name) {
      var target = entriesByEvent[name];
      var countElement = target.kind === "play" ? target.entry.playCount : target.entry.likeCount;
      var count = serverCounts[name] || 0;
      if (optimisticUntil[name] && Date.now() < optimisticUntil[name]) {
        count = Math.max(count, displayedCount(countElement));
      } else {
        delete optimisticUntil[name];
      }
      setCount(countElement, count);
      updateMetricLabel(target.entry, target.kind);
    });
  }

  function refreshCounts() {
    if (!siteBase || !apiKey || document.hidden) {
      return Promise.resolve();
    }

    var names = Object.keys(entriesByEvent);
    var params = new URLSearchParams();
    params.set("start", statsStart);
    params.set("limit", "100");
    params.set("path_by_name", "true");
    params.set("include_paths", names.join(","));

    return fetch(siteBase + "/api/v0/stats/hits?" + params.toString(), {
      cache: "no-store",
      headers: {
        Authorization: "Bearer " + apiKey,
      },
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("GoatCounter demo stats " + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        applyCounts(data.hits || []);
      })
      .catch(function () {
        // Keep the most recently displayed values if live statistics are unavailable.
      });
  }

  cards.forEach(addEngagement);
  if (!entries.length) {
    return;
  }

  refreshCounts();
  window.setInterval(refreshCounts, refreshInterval);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      refreshCounts();
    }
  });
})();

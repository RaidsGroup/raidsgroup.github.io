(function () {
  // Replace with your GoatCounter site URL after registering at https://www.goatcounter.com/
  // Example: "https://YOURCODE.goatcounter.com/count"
  var GOATCOUNTER_ENDPOINT = "https://raidsgroup.goatcounter.com/count";

  // Read-only API key for the live visitor map (User menu → API).
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

  if (!isConfigured || isLocal || !siteBase) {
    return;
  }

  window.goatcounter = { no_onload: false };

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://gc.zgo.at/count.js";
  script.setAttribute("data-goatcounter", GOATCOUNTER_ENDPOINT);
  document.head.appendChild(script);
})();

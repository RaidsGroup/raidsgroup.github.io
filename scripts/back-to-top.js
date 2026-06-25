(function () {
  var button = document.createElement("button");
  button.type = "button";
  button.className = "back-to-top";
  button.setAttribute("aria-label", "Back to top");
  button.innerHTML =
    '<svg class="back-to-top-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 4l-7 7h4v9h6v-9h4l-7-7z"/>' +
    "</svg>";
  document.body.appendChild(button);

  var threshold = 320;

  function updateVisibility() {
    button.classList.toggle("is-visible", window.scrollY > threshold);
  }

  button.addEventListener("click", function () {
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });

  window.addEventListener("scroll", updateVisibility, { passive: true });
  updateVisibility();
})();

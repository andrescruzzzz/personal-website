/* ==========================================================================
   Order form page logic.
   - Fills the material dropdown from shared data
   - Pre-selects a material if arriving via ?material= (from product cards)
   - Validates the form, then shows a demo confirmation with a sample Order ID
   No backend: everything is handled in the browser.
   ========================================================================== */
(function () {
  "use strict";
  if (!window.BQS) return;

  var form     = document.getElementById("order-form");
  var confirm  = document.getElementById("confirmation");
  var errorBox = document.getElementById("form-error");
  var materialSelect = document.getElementById("material");
  var dateInput = document.getElementById("date");

  /* --- Populate the material dropdown from shared data ------------------- */
  BQS.MATERIALS.forEach(function (name) {
    var opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    materialSelect.appendChild(opt);
  });

  /* --- Pre-select material from the URL (?material=Gravel) -------------- */
  var params = new URLSearchParams(window.location.search);
  var preset = params.get("material");
  if (preset) materialSelect.value = preset;

  /* --- Default the delivery date to tomorrow & block past dates --------- */
  var today = new Date();
  var tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  dateInput.min = toInputDate(today);
  dateInput.value = toInputDate(tomorrow);

  function toInputDate(d) {
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  /* --- Handle submit ----------------------------------------------------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Simple, friendly validation for the required fields.
    var required = ["fullName", "mobile", "address", "material", "trucks", "date", "time"];
    var missing = required.filter(function (id) {
      var el = document.getElementById(id);
      return !el || !String(el.value).trim();
    });

    if (missing.length) {
      errorBox.textContent = "Please fill in all required fields marked with *.";
      errorBox.style.display = "block";
      var first = document.getElementById(missing[0]);
      if (first) first.focus();
      return;
    }
    errorBox.style.display = "none";

    // Build a demo Order ID and confirmation details.
    var orderId = BQS.newOrderId();
    var material = materialSelect.value;
    var trucks = document.getElementById("trucks").value;
    var address = document.getElementById("address").value;

    document.getElementById("confirm-id").textContent = orderId;
    document.getElementById("confirm-details").innerHTML =
      "<strong>" + trucks + " truckload(s)</strong> of <strong>" + material +
      "</strong><br />Deliver to: " + address;

    // The "Track My Order" button carries the sample tracking ID so the demo
    // map loads immediately (the generated ID has no live trucks behind it).
    var trackBtn = document.getElementById("track-btn");
    trackBtn.setAttribute(
      "href",
      "/track?id=" + encodeURIComponent(BQS.SAMPLE_ORDER.id)
    );

    // Swap the form for the confirmation screen and scroll to top.
    form.style.display = "none";
    confirm.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

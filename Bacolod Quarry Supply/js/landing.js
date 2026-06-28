/* ==========================================================================
   Landing page – renders the product cards from shared demo data.
   ========================================================================== */
(function () {
  "use strict";

  var grid = document.getElementById("product-grid");
  if (!grid || !window.BQS) return;

  // Build one card per product. Each "Order This" button deep-links to the
  // order form with the material pre-selected via the ?material= query param.
  BQS.PRODUCTS.forEach(function (p) {
    var card = document.createElement("div");
    card.className = "card";
    card.innerHTML =
      '<div class="product-card__icon" aria-hidden="true">' + p.icon + '</div>' +
      '<h3>' + p.name + '</h3>' +
      '<p>' + p.desc + '</p>' +
      '<p class="use"><strong>Common use:</strong> ' + p.use + '</p>' +
      '<a class="btn btn--primary" href="/order?material=' +
        encodeURIComponent(p.name) + '">Order This</a>';
    grid.appendChild(card);
  });
})();

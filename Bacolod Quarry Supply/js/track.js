/* ==========================================================================
   Tracking page logic.
   - Reads an Order ID (from the search box or ?id= in the URL)
   - Shows the order summary for the demo order BQ-2026-001
   - Draws a Leaflet map centered on Bacolod City / Negros Occidental
   - Places 10 truck markers, animates them slowly toward Bacolod,
     and keeps a synced truck list with "View on Map" buttons
   All data is mock; movement is driven by a simple timer.
   ========================================================================== */
(function () {
  "use strict";
  if (!window.BQS) return;

  var BQS_ = window.BQS;

  /* --- DOM refs ---------------------------------------------------------- */
  var form      = document.getElementById("track-form");
  var input     = document.getElementById("order-input");
  var results   = document.getElementById("results");
  var notFound  = document.getElementById("not-found");
  var listEl    = document.getElementById("truck-list");

  /* --- Map state (created lazily on first successful search) ------------- */
  var map = null;
  var markers = {};        // truck.num -> Leaflet marker
  var trucks = [];         // live working copy with current lat/lng
  var animTimer = null;

  // Custom truck icon: a simple orange badge with the truck number.
  function truckIcon(truck) {
    var delivered = truck.status === "Delivered";
    var bg = delivered ? "#2e7d32" : "#e8731c";
    return L.divIcon({
      className: "truck-marker",
      html:
        '<div style="background:' + bg + ';color:#fff;border:2px solid #fff;' +
        'border-radius:8px;width:34px;height:34px;display:flex;align-items:center;' +
        'justify-content:center;font-weight:800;font-size:13px;' +
        'box-shadow:0 2px 6px rgba(0,0,0,.4)">🚚</div>',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -16]
    });
  }

  function popupHtml(t) {
    return (
      '<b>Truck ' + t.num + '</b><br />' +
      'Driver: ' + t.driver + '<br />' +
      'Plate: ' + t.plate + '<br />' +
      'Material: ' + t.material + '<br />' +
      'Status: ' + t.status + '<br />' +
      'ETA: ' + t.eta + '<br />' +
      '<em>' + BQS_.statusMessage(t.status) + '</em>'
    );
  }

  /* --- Build / initialize the map --------------------------------------- */
  function initMap() {
    if (map) return;

    map = L.map("map").setView([BQS_.BACOLOD.lat, BQS_.BACOLOD.lng], 11);

    // Free OpenStreetMap tiles.
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Mark the quarry yard and the Bacolod delivery point.
    L.marker([BQS_.QUARRY.lat, BQS_.QUARRY.lng], {
      icon: L.divIcon({
        className: "place-marker",
        html: '<div style="background:#2b2b29;color:#fff;padding:4px 8px;border-radius:6px;' +
              'font-weight:700;font-size:12px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.4)">⛏️ Quarry</div>',
        iconSize: [0, 0]
      })
    }).addTo(map).bindPopup("<b>" + BQS_.QUARRY.name + "</b><br />Loading point");

    L.marker([BQS_.BACOLOD.lat, BQS_.BACOLOD.lng], {
      icon: L.divIcon({
        className: "place-marker",
        html: '<div style="background:#cc5f10;color:#fff;padding:4px 8px;border-radius:6px;' +
              'font-weight:700;font-size:12px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.4)">📍 Bacolod City</div>',
        iconSize: [0, 0]
      })
    }).addTo(map).bindPopup("<b>" + BQS_.BACOLOD.name + "</b>");

    // Simple route line from the quarry to Bacolod City.
    L.polyline(
      [[BQS_.QUARRY.lat, BQS_.QUARRY.lng], [BQS_.BACOLOD.lat, BQS_.BACOLOD.lng]],
      { color: "#cc5f10", weight: 3, opacity: 0.6, dashArray: "8 8" }
    ).addTo(map);

    // Working copy of trucks with a mutable "cur" position.
    trucks = BQS_.TRUCKS.map(function (t) {
      return Object.assign({}, t, { cur: { lat: t.start.lat, lng: t.start.lng } });
    });

    // Place a marker per truck.
    trucks.forEach(function (t) {
      var m = L.marker([t.cur.lat, t.cur.lng], { icon: truckIcon(t) })
        .addTo(map)
        .bindPopup(popupHtml(t));
      // Clicking a marker highlights its card in the list.
      m.on("click", function () { highlightCard(t.num); });
      markers[t.num] = m;
    });

    startAnimation();
  }

  /* --- Slow animation: nudge moving trucks toward their destination ------ */
  function startAnimation() {
    if (animTimer) return;
    animTimer = setInterval(function () {
      trucks.forEach(function (t) {
        // Loading and delivered trucks stay put.
        if (t.status === "Loading at Quarry" || t.status === "Delivered") return;

        var dLat = t.dest.lat - t.cur.lat;
        var dLng = t.dest.lng - t.cur.lng;
        var dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < 0.0008) return; // basically arrived — hold position

        // Move a small fraction of the remaining distance each tick (slow drift).
        var step = 0.06;
        t.cur.lat += dLat * step;
        t.cur.lng += dLng * step;
        if (markers[t.num]) markers[t.num].setLatLng([t.cur.lat, t.cur.lng]);
      });
    }, 1500); // update every 1.5s
  }

  /* --- Truck list (cards beside the map) -------------------------------- */
  function renderList() {
    listEl.innerHTML = "";
    BQS_.TRUCKS.forEach(function (t) {
      var card = document.createElement("div");
      card.className = "truck-card";
      card.id = "truck-card-" + t.num;
      card.innerHTML =
        '<div class="truck-card__top">' +
          '<span class="truck-card__name">Truck ' + t.num + '</span>' +
          '<span class="status ' + BQS_.statusClass(t.status) + '">' + t.status + '</span>' +
        '</div>' +
        '<div class="truck-card__rows">' +
          '<div><span class="k">Driver</span><span class="v">' + t.driver + '</span></div>' +
          '<div><span class="k">Plate Number</span><span class="v">' + t.plate + '</span></div>' +
          '<div><span class="k">Material</span><span class="v">' + t.material + '</span></div>' +
          '<div><span class="k">ETA</span><span class="v">' + t.eta + '</span></div>' +
        '</div>' +
        '<button class="btn btn--primary" data-truck="' + t.num + '">View on Map</button>';
      listEl.appendChild(card);
    });

    // "View on Map" → zoom to the truck and open its popup.
    listEl.querySelectorAll("button[data-truck]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var num = parseInt(btn.getAttribute("data-truck"), 10);
        viewOnMap(num);
      });
    });
  }

  function viewOnMap(num) {
    var t = trucks.find(function (x) { return x.num === num; });
    var m = markers[num];
    if (!t || !m || !map) return;
    map.setView([t.cur.lat, t.cur.lng], 13, { animate: true });
    m.openPopup();
    highlightCard(num);
    // On mobile the map sits above the list — scroll up to show it.
    document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function highlightCard(num) {
    document.querySelectorAll(".truck-card").forEach(function (c) {
      c.classList.remove("is-focused");
    });
    var card = document.getElementById("truck-card-" + num);
    if (card) card.classList.add("is-focused");
  }

  /* --- Show order summary + reveal the map ------------------------------ */
  function showOrder(order) {
    document.getElementById("r-id").textContent = order.id;
    document.getElementById("r-material").textContent = order.material;
    document.getElementById("r-trucks").textContent = order.trucks;
    document.getElementById("r-eta").textContent = order.eta;
    document.getElementById("r-address").textContent = order.address;
    document.getElementById("r-assigned").textContent =
      order.assignedTrucks.map(function (n) { return "Truck " + n; }).join(", ");

    var statusEl = document.getElementById("r-status");
    statusEl.textContent = order.status;
    statusEl.className = "status " + BQS_.statusClass(order.status);
    document.getElementById("r-plain").textContent = BQS_.statusMessage(order.status);

    notFound.style.display = "none";
    results.style.display = "block";

    renderList();
    initMap();
    // Leaflet needs a size recalc when its container becomes visible.
    setTimeout(function () { if (map) map.invalidateSize(); }, 50);
  }

  /* --- Search handling --------------------------------------------------- */
  function search(rawId) {
    var id = String(rawId || "").trim().toUpperCase();
    if (!id) return;

    if (id === BQS_.SAMPLE_ORDER.id) {
      showOrder(BQS_.SAMPLE_ORDER);
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      results.style.display = "none";
      notFound.style.display = "block";
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    search(input.value);
  });

  /* --- Auto-search if arriving with ?id= (from the order confirmation) --- */
  var params = new URLSearchParams(window.location.search);
  var preId = params.get("id");
  if (preId) {
    input.value = preId;
    search(preId);
  }
})();

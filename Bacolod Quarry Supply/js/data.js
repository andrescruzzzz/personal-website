/* ==========================================================================
   Shared demo data for Bacolod Quarry Supply Co.
   Pure mock data — no backend, no real orders. Loaded by every page.
   Exposes a global `BQS` object.
   ========================================================================== */
(function (window) {
  "use strict";

  /* --- Products shown on the landing page -------------------------------- */
  var PRODUCTS = [
    {
      id: "washed-sand",
      icon: "🏖️",
      name: "Washed Sand",
      desc: "Clean, fine sand washed to remove silt and clay.",
      use: "Concrete mixing, plastering, finishing work."
    },
    {
      id: "filling-sand",
      icon: "🪣",
      name: "Filling Sand",
      desc: "Affordable sand for leveling and backfilling.",
      use: "Land filling, base layers, compaction."
    },
    {
      id: "gravel",
      icon: "🪨",
      name: "Gravel",
      desc: "Sorted gravel in common construction sizes.",
      use: "Concrete, roads, drainage, foundations."
    },
    {
      id: "crushed-rock",
      icon: "⛏️",
      name: "Crushed Rock",
      desc: "Crushed stone aggregate with strong binding.",
      use: "Road base, heavy concrete, sub-base."
    },
    {
      id: "boulders",
      icon: "🧱",
      name: "Boulders",
      desc: "Large rocks for heavy-duty groundwork.",
      use: "Riprap, retaining walls, erosion control."
    },
    {
      id: "mixed-aggregates",
      icon: "⛰️",
      name: "Mixed Aggregates",
      desc: "Balanced mix of sand, gravel and stone.",
      use: "General concrete and all-around projects."
    }
  ];

  /* Material options used by the order form dropdown */
  var MATERIALS = PRODUCTS.map(function (p) { return p.name; });

  /* --- Key map locations (demo coordinates) ------------------------------ */
  // The quarry sits inland near Murcia; deliveries head toward Bacolod City.
  var QUARRY = { name: "Bacolod Quarry Yard (Murcia)", lat: 10.6050, lng: 123.0450 };
  var BACOLOD = { name: "Bacolod City Delivery Point", lat: 10.6770, lng: 122.9550 };

  /* --- The sample order used by the tracking page ------------------------ */
  var SAMPLE_ORDER = {
    id: "BQ-2026-001",
    material: "Gravel",
    trucks: 3,                       // trucks assigned to THIS order
    address: "Lacson St, Mandalagan, Bacolod City, Negros Occidental",
    eta: "Today, 2:30 PM",
    status: "On the Way",
    assignedTrucks: [1, 4, 10]       // truck numbers assigned to this order
  };

  /* --- Plain-language messages per status (for non-technical users) ------ */
  var STATUS_MESSAGE = {
    "Loading at Quarry": "Your order is being loaded at the quarry.",
    "On the Way":        "Your truck is on the way.",
    "Near Bacolod":      "Your truck is near your delivery area.",
    "Arriving Soon":     "Your truck is arriving soon.",
    "Delivered":         "Your delivery has arrived."
  };

  /* CSS modifier class per status (matches styles.css) */
  var STATUS_CLASS = {
    "Loading at Quarry": "status--loading",
    "On the Way":        "status--onway",
    "Near Bacolod":      "status--near",
    "Arriving Soon":     "status--arriving",
    "Delivered":         "status--delivered"
  };

  /* --- 10 demo trucks ----------------------------------------------------
     Each truck has:
       start  – where it is now (mock coordinates across Negros Occidental)
       dest   – where it is heading (Bacolod delivery area)
       moving – whether it animates on the map
     "Loading at Quarry" trucks sit at the quarry; "Delivered" trucks sit at
     the destination. The rest slowly travel from start toward dest.        */
  var TRUCKS = [
    { num: 1,  driver: "Jun Reyes",        plate: "NQY 1423", material: "Gravel",           status: "On the Way",        eta: "2:30 PM", start: { lat: 10.4900, lng: 123.4100 }, dest: BACOLOD },          // from San Carlos
    { num: 2,  driver: "Mark Dela Cruz",   plate: "BCD 8812", material: "Washed Sand",      status: "Loading at Quarry", eta: "4:15 PM", start: QUARRY,                          dest: BACOLOD },
    { num: 3,  driver: "Rene Santos",      plate: "NEG 4371", material: "Crushed Rock",     status: "Near Bacolod",      eta: "1:10 PM", start: { lat: 10.6050, lng: 122.9700 }, dest: BACOLOD },          // Bago / outskirts
    { num: 4,  driver: "Carlo Villanueva", plate: "HIN 2098", material: "Filling Sand",     status: "On the Way",        eta: "3:00 PM", start: { lat: 10.2700, lng: 122.8500 }, dest: BACOLOD },          // from Hinigaran
    { num: 5,  driver: "Tony Garcia",      plate: "CAD 6720", material: "Boulders",         status: "Arriving Soon",     eta: "12:40 PM", start: { lat: 10.6600, lng: 122.9750 }, dest: BACOLOD },         // Talisay edge
    { num: 6,  driver: "Luis Ramos",       plate: "SIL 5521", material: "Mixed Aggregates", status: "On the Way",        eta: "2:50 PM", start: { lat: 10.7980, lng: 122.9750 }, dest: BACOLOD },          // from Silay
    { num: 7,  driver: "Benjie Flores",    plate: "TAL 3190", material: "Gravel",           status: "Loading at Quarry", eta: "5:00 PM", start: QUARRY,                          dest: BACOLOD },
    { num: 8,  driver: "Allan Cruz",       plate: "MUR 7488", material: "Washed Sand",      status: "Near Bacolod",      eta: "1:25 PM", start: { lat: 10.6300, lng: 122.9900 }, dest: BACOLOD },          // Murcia road approach
    { num: 9,  driver: "Paolo Mendoza",    plate: "VIC 1034", material: "Crushed Rock",     status: "Delivered",         eta: "Delivered", start: BACOLOD,                       dest: BACOLOD },
    { num: 10, driver: "Noel Fernandez",   plate: "LAK 9032", material: "Filling Sand",     status: "On the Way",        eta: "3:20 PM", start: { lat: 10.9000, lng: 123.0700 }, dest: BACOLOD }           // from Victorias
  ];

  /* --- Helpers ----------------------------------------------------------- */
  function statusClass(status) { return STATUS_CLASS[status] || "status--loading"; }
  function statusMessage(status) { return STATUS_MESSAGE[status] || ""; }

  /* Generate a demo order ID like BQ-2026-047 */
  function newOrderId() {
    var n = Math.floor(Math.random() * 900) + 100; // 100–999
    return "BQ-2026-" + n;
  }

  /* Expose everything under a single global, keeping it framework-free. */
  window.BQS = {
    PRODUCTS: PRODUCTS,
    MATERIALS: MATERIALS,
    QUARRY: QUARRY,
    BACOLOD: BACOLOD,
    SAMPLE_ORDER: SAMPLE_ORDER,
    TRUCKS: TRUCKS,
    STATUS_MESSAGE: STATUS_MESSAGE,
    STATUS_CLASS: STATUS_CLASS,
    statusClass: statusClass,
    statusMessage: statusMessage,
    newOrderId: newOrderId
  };
})(window);

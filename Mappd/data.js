// ============================================
// COUNTRY DATA & COORDINATES
// ============================================

const COUNTRIES = [
  { code: "AF", name: "Afghanistan", continent: "Asia", capital: "Kabul", lat: 33.93, lng: 67.71 },
  { code: "AL", name: "Albania", continent: "Europe", capital: "Tirana", lat: 41.15, lng: 20.17 },
  { code: "DZ", name: "Algeria", continent: "Africa", capital: "Algiers", lat: 28.03, lng: 1.66 },
  { code: "AR", name: "Argentina", continent: "South America", capital: "Buenos Aires", lat: -38.42, lng: -63.62 },
  { code: "AU", name: "Australia", continent: "Oceania", capital: "Canberra", lat: -25.27, lng: 133.78 },
  { code: "AT", name: "Austria", continent: "Europe", capital: "Vienna", lat: 47.52, lng: 14.55 },
  { code: "BD", name: "Bangladesh", continent: "Asia", capital: "Dhaka", lat: 23.68, lng: 90.36 },
  { code: "BE", name: "Belgium", continent: "Europe", capital: "Brussels", lat: 50.50, lng: 4.47 },
  { code: "BR", name: "Brazil", continent: "South America", capital: "Brasilia", lat: -14.24, lng: -51.93 },
  { code: "BG", name: "Bulgaria", continent: "Europe", capital: "Sofia", lat: 42.73, lng: 25.49 },
  { code: "KH", name: "Cambodia", continent: "Asia", capital: "Phnom Penh", lat: 12.57, lng: 104.99 },
  { code: "CM", name: "Cameroon", continent: "Africa", capital: "Yaounde", lat: 7.37, lng: 12.35 },
  { code: "CA", name: "Canada", continent: "North America", capital: "Ottawa", lat: 56.13, lng: -106.35 },
  { code: "CL", name: "Chile", continent: "South America", capital: "Santiago", lat: -35.68, lng: -71.54 },
  { code: "CN", name: "China", continent: "Asia", capital: "Beijing", lat: 35.86, lng: 104.20 },
  { code: "CO", name: "Colombia", continent: "South America", capital: "Bogota", lat: 4.57, lng: -74.30 },
  { code: "CR", name: "Costa Rica", continent: "North America", capital: "San Jose", lat: 9.75, lng: -83.75 },
  { code: "HR", name: "Croatia", continent: "Europe", capital: "Zagreb", lat: 45.10, lng: 15.20 },
  { code: "CU", name: "Cuba", continent: "North America", capital: "Havana", lat: 21.52, lng: -77.78 },
  { code: "CZ", name: "Czech Republic", continent: "Europe", capital: "Prague", lat: 49.82, lng: 15.47 },
  { code: "DK", name: "Denmark", continent: "Europe", capital: "Copenhagen", lat: 56.26, lng: 9.50 },
  { code: "DO", name: "Dominican Republic", continent: "North America", capital: "Santo Domingo", lat: 18.74, lng: -70.16 },
  { code: "EC", name: "Ecuador", continent: "South America", capital: "Quito", lat: -1.83, lng: -78.18 },
  { code: "EG", name: "Egypt", continent: "Africa", capital: "Cairo", lat: 26.82, lng: 30.80 },
  { code: "SV", name: "El Salvador", continent: "North America", capital: "San Salvador", lat: 13.79, lng: -88.90 },
  { code: "ET", name: "Ethiopia", continent: "Africa", capital: "Addis Ababa", lat: 9.15, lng: 40.49 },
  { code: "FI", name: "Finland", continent: "Europe", capital: "Helsinki", lat: 61.92, lng: 25.75 },
  { code: "FR", name: "France", continent: "Europe", capital: "Paris", lat: 46.23, lng: 2.21 },
  { code: "DE", name: "Germany", continent: "Europe", capital: "Berlin", lat: 51.17, lng: 10.45 },
  { code: "GH", name: "Ghana", continent: "Africa", capital: "Accra", lat: 7.95, lng: -1.02 },
  { code: "GR", name: "Greece", continent: "Europe", capital: "Athens", lat: 39.07, lng: 21.82 },
  { code: "GT", name: "Guatemala", continent: "North America", capital: "Guatemala City", lat: 15.78, lng: -90.23 },
  { code: "HN", name: "Honduras", continent: "North America", capital: "Tegucigalpa", lat: 15.20, lng: -86.24 },
  { code: "HU", name: "Hungary", continent: "Europe", capital: "Budapest", lat: 47.16, lng: 19.50 },
  { code: "IS", name: "Iceland", continent: "Europe", capital: "Reykjavik", lat: 64.96, lng: -19.02 },
  { code: "IN", name: "India", continent: "Asia", capital: "New Delhi", lat: 20.59, lng: 78.96 },
  { code: "ID", name: "Indonesia", continent: "Asia", capital: "Jakarta", lat: -0.79, lng: 113.92 },
  { code: "IR", name: "Iran", continent: "Asia", capital: "Tehran", lat: 32.43, lng: 53.69 },
  { code: "IQ", name: "Iraq", continent: "Asia", capital: "Baghdad", lat: 33.22, lng: 43.68 },
  { code: "IE", name: "Ireland", continent: "Europe", capital: "Dublin", lat: 53.14, lng: -7.69 },
  { code: "IL", name: "Israel", continent: "Asia", capital: "Jerusalem", lat: 31.05, lng: 34.85 },
  { code: "IT", name: "Italy", continent: "Europe", capital: "Rome", lat: 41.87, lng: 12.57 },
  { code: "JM", name: "Jamaica", continent: "North America", capital: "Kingston", lat: 18.11, lng: -77.30 },
  { code: "JP", name: "Japan", continent: "Asia", capital: "Tokyo", lat: 36.20, lng: 138.25 },
  { code: "JO", name: "Jordan", continent: "Asia", capital: "Amman", lat: 30.59, lng: 36.24 },
  { code: "KE", name: "Kenya", continent: "Africa", capital: "Nairobi", lat: -0.02, lng: 37.91 },
  { code: "KR", name: "South Korea", continent: "Asia", capital: "Seoul", lat: 35.91, lng: 127.77 },
  { code: "KW", name: "Kuwait", continent: "Asia", capital: "Kuwait City", lat: 29.31, lng: 47.48 },
  { code: "LB", name: "Lebanon", continent: "Asia", capital: "Beirut", lat: 33.85, lng: 35.86 },
  { code: "MY", name: "Malaysia", continent: "Asia", capital: "Kuala Lumpur", lat: 4.21, lng: 101.98 },
  { code: "MX", name: "Mexico", continent: "North America", capital: "Mexico City", lat: 23.63, lng: -102.55 },
  { code: "MA", name: "Morocco", continent: "Africa", capital: "Rabat", lat: 31.79, lng: -7.09 },
  { code: "NP", name: "Nepal", continent: "Asia", capital: "Kathmandu", lat: 28.39, lng: 84.12 },
  { code: "NL", name: "Netherlands", continent: "Europe", capital: "Amsterdam", lat: 52.13, lng: 5.29 },
  { code: "NZ", name: "New Zealand", continent: "Oceania", capital: "Wellington", lat: -40.90, lng: 174.89 },
  { code: "NG", name: "Nigeria", continent: "Africa", capital: "Abuja", lat: 9.08, lng: 8.68 },
  { code: "NO", name: "Norway", continent: "Europe", capital: "Oslo", lat: 60.47, lng: 8.47 },
  { code: "PK", name: "Pakistan", continent: "Asia", capital: "Islamabad", lat: 30.38, lng: 69.35 },
  { code: "PA", name: "Panama", continent: "North America", capital: "Panama City", lat: 8.54, lng: -80.78 },
  { code: "PY", name: "Paraguay", continent: "South America", capital: "Asuncion", lat: -23.44, lng: -58.44 },
  { code: "PE", name: "Peru", continent: "South America", capital: "Lima", lat: -9.19, lng: -75.02 },
  { code: "PH", name: "Philippines", continent: "Asia", capital: "Manila", lat: 12.88, lng: 121.77 },
  { code: "PL", name: "Poland", continent: "Europe", capital: "Warsaw", lat: 51.92, lng: 19.15 },
  { code: "PT", name: "Portugal", continent: "Europe", capital: "Lisbon", lat: 39.40, lng: -8.22 },
  { code: "QA", name: "Qatar", continent: "Asia", capital: "Doha", lat: 25.35, lng: 51.18 },
  { code: "RO", name: "Romania", continent: "Europe", capital: "Bucharest", lat: 45.94, lng: 24.97 },
  { code: "RU", name: "Russia", continent: "Europe", capital: "Moscow", lat: 61.52, lng: 105.32 },
  { code: "SA", name: "Saudi Arabia", continent: "Asia", capital: "Riyadh", lat: 23.89, lng: 45.08 },
  { code: "SN", name: "Senegal", continent: "Africa", capital: "Dakar", lat: 14.50, lng: -14.45 },
  { code: "RS", name: "Serbia", continent: "Europe", capital: "Belgrade", lat: 44.02, lng: 21.01 },
  { code: "SG", name: "Singapore", continent: "Asia", capital: "Singapore", lat: 1.35, lng: 103.82 },
  { code: "ZA", name: "South Africa", continent: "Africa", capital: "Pretoria", lat: -30.56, lng: 22.94 },
  { code: "ES", name: "Spain", continent: "Europe", capital: "Madrid", lat: 40.46, lng: -3.75 },
  { code: "LK", name: "Sri Lanka", continent: "Asia", capital: "Colombo", lat: 7.87, lng: 80.77 },
  { code: "SE", name: "Sweden", continent: "Europe", capital: "Stockholm", lat: 60.13, lng: 18.64 },
  { code: "CH", name: "Switzerland", continent: "Europe", capital: "Bern", lat: 46.82, lng: 8.23 },
  { code: "TW", name: "Taiwan", continent: "Asia", capital: "Taipei", lat: 23.70, lng: 120.96 },
  { code: "TZ", name: "Tanzania", continent: "Africa", capital: "Dodoma", lat: -6.37, lng: 34.89 },
  { code: "TH", name: "Thailand", continent: "Asia", capital: "Bangkok", lat: 15.87, lng: 100.99 },
  { code: "TR", name: "Turkey", continent: "Asia", capital: "Ankara", lat: 38.96, lng: 35.24 },
  { code: "UA", name: "Ukraine", continent: "Europe", capital: "Kyiv", lat: 48.38, lng: 31.17 },
  { code: "AE", name: "United Arab Emirates", continent: "Asia", capital: "Abu Dhabi", lat: 23.42, lng: 53.85 },
  { code: "GB", name: "United Kingdom", continent: "Europe", capital: "London", lat: 55.38, lng: -3.44 },
  { code: "US", name: "United States", continent: "North America", capital: "Washington D.C.", lat: 37.09, lng: -95.71 },
  { code: "UY", name: "Uruguay", continent: "South America", capital: "Montevideo", lat: -32.52, lng: -55.77 },
  { code: "VE", name: "Venezuela", continent: "South America", capital: "Caracas", lat: 6.42, lng: -66.59 },
  { code: "VN", name: "Vietnam", continent: "Asia", capital: "Hanoi", lat: 14.06, lng: 108.28 },
  { code: "ZW", name: "Zimbabwe", continent: "Africa", capital: "Harare", lat: -19.02, lng: 29.15 },
  { code: "UG", name: "Uganda", continent: "Africa", capital: "Kampala", lat: 1.37, lng: 32.29 },
  { code: "TN", name: "Tunisia", continent: "Africa", capital: "Tunis", lat: 33.89, lng: 9.54 },
  { code: "LY", name: "Libya", continent: "Africa", capital: "Tripoli", lat: 26.34, lng: 17.23 },
  { code: "SD", name: "Sudan", continent: "Africa", capital: "Khartoum", lat: 12.86, lng: 30.22 },
  { code: "CG", name: "Congo", continent: "Africa", capital: "Brazzaville", lat: -0.23, lng: 15.83 },
  { code: "AO", name: "Angola", continent: "Africa", capital: "Luanda", lat: -11.20, lng: 17.87 },
  { code: "MZ", name: "Mozambique", continent: "Africa", capital: "Maputo", lat: -18.67, lng: 35.53 },
  { code: "MG", name: "Madagascar", continent: "Africa", capital: "Antananarivo", lat: -18.77, lng: 46.87 },
  { code: "MM", name: "Myanmar", continent: "Asia", capital: "Naypyidaw", lat: 21.91, lng: 95.96 },
  { code: "KZ", name: "Kazakhstan", continent: "Asia", capital: "Astana", lat: 48.02, lng: 66.92 },
  { code: "UZ", name: "Uzbekistan", continent: "Asia", capital: "Tashkent", lat: 41.38, lng: 64.59 },
  { code: "MN", name: "Mongolia", continent: "Asia", capital: "Ulaanbaatar", lat: 46.86, lng: 103.85 }
];

const COUNTRY_EXPLORE_DATA = {
  default: {
    see: [
      { title: "Historical Landmarks", desc: "Explore centuries-old architecture, ancient ruins, and UNESCO World Heritage sites that tell the story of this nation." },
      { title: "Natural Wonders", desc: "From mountains to coastlines, discover breathtaking landscapes and protected natural areas." },
      { title: "Cultural Districts", desc: "Wander through vibrant neighborhoods, local markets, and arts districts for an authentic experience." },
      { title: "Museums & Galleries", desc: "World-class museums housing priceless artifacts, contemporary art, and cultural exhibitions." }
    ],
    expect: [
      { title: "Climate & Weather", desc: "Research the best time to visit based on seasonal weather patterns and tourist seasons." },
      { title: "Local Customs", desc: "Understanding local etiquette, tipping culture, and social norms will enhance your experience." },
      { title: "Transportation", desc: "Public transit, ride-sharing, and domestic flights make getting around convenient." },
      { title: "Safety Tips", desc: "Generally safe for tourists with standard precautions. Keep valuables secure and stay aware of your surroundings." }
    ],
    food: [
      { title: "Street Food", desc: "The best culinary experiences often come from local street vendors and food markets." },
      { title: "Traditional Cuisine", desc: "Don't miss the signature dishes that define this country's culinary identity." },
      { title: "Fine Dining", desc: "Award-winning restaurants blend traditional flavors with modern techniques." },
      { title: "Food Markets", desc: "Visit bustling local markets for fresh produce, spices, and authentic regional specialties." }
    ],
    hotels: [
      { title: "Luxury Stays", desc: "5-star hotels and resorts offering world-class amenities, spas, and stunning views." },
      { title: "Boutique Hotels", desc: "Unique, character-rich accommodations that reflect local architecture and culture." },
      { title: "Budget-Friendly", desc: "Comfortable hostels, guesthouses, and affordable hotels for budget-conscious travelers." },
      { title: "Unique Stays", desc: "Treehouses, converted castles, floating hotels - unforgettable accommodation experiences." }
    ],
    flights: [
      { title: "Major Airlines", desc: "Multiple international carriers operate direct and connecting flights." },
      { title: "Best Time to Book", desc: "Book 2-3 months in advance for the best fares. Mid-week flights tend to be cheaper." },
      { title: "Airport Tips", desc: "Major international airports with good connectivity. Allow extra time for immigration." },
      { title: "Budget Airlines", desc: "Low-cost carriers offer affordable options, especially for regional travel." }
    ]
  }
};

const FRIEND_DATA = {
  john: {
    name: "John",
    avatar: "J",
    avatarGradient: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    country: "US",
    countryName: "United States",
    visited: ["GB", "FR", "DE", "IT", "ES", "JP", "MX", "CA", "BR", "AU", "TH", "GR", "IS", "PT", "NL"],
    score: 4280,
    rankings: {
      "JP": { overall: 5, food: 5, culture: 5, scenery: 4, nightlife: 4 },
      "IT": { overall: 5, food: 5, culture: 5, scenery: 5, nightlife: 4 },
      "IS": { overall: 5, food: 3, culture: 4, scenery: 5, nightlife: 2 },
      "TH": { overall: 4, food: 5, culture: 4, scenery: 4, nightlife: 5 },
      "FR": { overall: 4, food: 5, culture: 5, scenery: 4, nightlife: 4 },
      "AU": { overall: 4, food: 3, culture: 3, scenery: 5, nightlife: 4 },
      "BR": { overall: 4, food: 4, culture: 5, scenery: 4, nightlife: 5 },
      "GR": { overall: 4, food: 4, culture: 4, scenery: 5, nightlife: 3 }
    }
  }
};

// Map GeoJSON country names -> our internal ISO codes
const NAME_TO_CODE = (() => {
  const map = {};
  COUNTRIES.forEach(c => { map[c.name.toLowerCase()] = c.code; });
  // Aliases where the boundary dataset uses a different label
  const aliases = {
    "united states of america": "US",
    "czechia": "CZ",
    "dominican rep.": "DO"
  };
  Object.entries(aliases).forEach(([name, code]) => { map[name] = code; });
  return map;
})();

function codeFromName(name) {
  if (!name) return null;
  return NAME_TO_CODE[name.toLowerCase()] || null;
}

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function calculateScore(homeCode, visitedCode) {
  const home = COUNTRIES.find(c => c.code === homeCode);
  const visited = COUNTRIES.find(c => c.code === visitedCode);
  if (!home || !visited) return 0;
  const dist = getDistance(home.lat, home.lng, visited.lat, visited.lng);
  let base = Math.round(dist / 50);
  if (home.continent !== visited.continent) base = Math.round(base * 1.5);
  return Math.max(base, 10);
}

// ============================================
// REGION DATA & SCORING
// ============================================
// Tier points: capital & famous = "standard" amount, lesser-known = bonus.
const REGION_POINTS = { capital: 25, famous: 25, standard: 35, remote: 55 };
const REGION_TIER_LABEL = {
  capital: 'Capital', famous: 'Popular', standard: 'Standard', remote: 'Hidden Gem'
};

// Real ADM1 region boundaries live in REGION_GEO (regiondata.js).
// Tiers are derived: the region containing the capital = capital, regions
// with another major city = popular, the rest split by area into standard
// (larger / well-trodden) and hidden-gem (smaller / lesser-known).

function _ringArea(r) {
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    a += (r[j][0] * r[i][1]) - (r[i][0] * r[j][1]);
  }
  return Math.abs(a / 2);
}

function _pointInRings(lng, lat, rings) {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      if (((yi > lat) !== (yj > lat)) &&
          (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) inside = !inside;
    }
  }
  return inside;
}

const _regionCache = {};

function getCountryRegions(code) {
  if (_regionCache[code]) return _regionCache[code];

  let regions;
  if (typeof REGION_GEO !== 'undefined' && REGION_GEO[code]) {
    const cities = (typeof getMajorCities === 'function') ? getMajorCities(code) : [];
    const raw = REGION_GEO[code].regions.map((rg, i) => {
      let hasCapital = false, hasMajor = false;
      cities.forEach(c => {
        if (_pointInRings(c.lng, c.lat, rg.r)) { hasMajor = true; if (c.capital) hasCapital = true; }
      });
      let maxA = 0;
      rg.r.forEach(ring => { const a = _ringArea(ring); if (a > maxA) maxA = a; });
      return { id: code + '-' + i, name: rg.n, rings: rg.r, area: maxA, hasCapital, hasMajor };
    });

    // median area among the "lesser-known" regions to split standard vs hidden-gem
    const plain = raw.filter(r => !r.hasCapital && !r.hasMajor).map(r => r.area).sort((a, b) => a - b);
    const median = plain.length ? plain[Math.floor(plain.length / 2)] : 0;

    regions = raw.map(r => {
      let tier;
      if (r.hasCapital) tier = 'capital';
      else if (r.hasMajor) tier = 'famous';
      else tier = (r.area < median) ? 'remote' : 'standard';
      return { id: r.id, name: r.name, tier, rings: r.rings };
    });
  } else {
    // fallback: whole country as one accurate region (from world boundaries)
    let rings = [];
    if (typeof getWorldFeatures === 'function') {
      const f = getWorldFeatures().find(x => x.code === code);
      if (f) rings = f.rings;
    }
    const name = (COUNTRIES.find(c => c.code === code) || {}).name || 'Region';
    regions = [{ id: code + '-0', name, tier: 'capital', rings }];
  }

  _regionCache[code] = regions;
  return regions;
}

function regionPoints(tier) {
  return REGION_POINTS[tier] || REGION_POINTS.standard;
}

function countryRegionScore(code, visitedRegionIds) {
  if (!visitedRegionIds || !visitedRegionIds.length) return 0;
  const regions = getCountryRegions(code);
  let total = 0;
  regions.forEach(r => { if (visitedRegionIds.includes(r.id)) total += regionPoints(r.tier); });
  return total;
}

// ============================================
// MAJOR CITIES (for the country page markers)
// ============================================
const COUNTRY_CITIES = {
  PH: [
    { name: 'Manila', lat: 14.60, lng: 120.98, capital: true },
    { name: 'Cebu City', lat: 10.32, lng: 123.90 },
    { name: 'Davao', lat: 7.07, lng: 125.61 },
    { name: 'Baguio', lat: 16.40, lng: 120.60 },
    { name: 'Iloilo', lat: 10.72, lng: 122.56 }
  ],
  US: [
    { name: 'Washington D.C.', lat: 38.90, lng: -77.04, capital: true },
    { name: 'New York', lat: 40.71, lng: -74.01 },
    { name: 'Los Angeles', lat: 34.05, lng: -118.24 },
    { name: 'Chicago', lat: 41.88, lng: -87.63 },
    { name: 'Miami', lat: 25.76, lng: -80.19 },
    { name: 'San Francisco', lat: 37.77, lng: -122.42 }
  ],
  JP: [
    { name: 'Tokyo', lat: 35.68, lng: 139.69, capital: true },
    { name: 'Osaka', lat: 34.69, lng: 135.50 },
    { name: 'Kyoto', lat: 35.01, lng: 135.77 },
    { name: 'Sapporo', lat: 43.06, lng: 141.35 },
    { name: 'Fukuoka', lat: 33.59, lng: 130.40 }
  ],
  FR: [
    { name: 'Paris', lat: 48.85, lng: 2.35, capital: true },
    { name: 'Marseille', lat: 43.30, lng: 5.37 },
    { name: 'Lyon', lat: 45.76, lng: 4.84 },
    { name: 'Bordeaux', lat: 44.84, lng: -0.58 },
    { name: 'Nice', lat: 43.70, lng: 7.27 }
  ],
  IT: [
    { name: 'Rome', lat: 41.90, lng: 12.50, capital: true },
    { name: 'Milan', lat: 45.46, lng: 9.19 },
    { name: 'Naples', lat: 40.85, lng: 14.27 },
    { name: 'Venice', lat: 45.44, lng: 12.32 },
    { name: 'Florence', lat: 43.77, lng: 11.26 }
  ],
  ES: [
    { name: 'Madrid', lat: 40.42, lng: -3.70, capital: true },
    { name: 'Barcelona', lat: 41.39, lng: 2.17 },
    { name: 'Valencia', lat: 39.47, lng: -0.38 },
    { name: 'Seville', lat: 37.39, lng: -5.99 },
    { name: 'Bilbao', lat: 43.26, lng: -2.93 }
  ],
  BR: [
    { name: 'Brasília', lat: -15.79, lng: -47.88, capital: true },
    { name: 'São Paulo', lat: -23.55, lng: -46.63 },
    { name: 'Rio de Janeiro', lat: -22.91, lng: -43.17 },
    { name: 'Salvador', lat: -12.97, lng: -38.50 },
    { name: 'Manaus', lat: -3.12, lng: -60.02 }
  ],
  MX: [
    { name: 'Mexico City', lat: 19.43, lng: -99.13, capital: true },
    { name: 'Guadalajara', lat: 20.67, lng: -103.35 },
    { name: 'Monterrey', lat: 25.69, lng: -100.32 },
    { name: 'Cancún', lat: 21.16, lng: -86.85 },
    { name: 'Oaxaca', lat: 17.07, lng: -96.72 }
  ],
  TH: [
    { name: 'Bangkok', lat: 13.76, lng: 100.50, capital: true },
    { name: 'Chiang Mai', lat: 18.79, lng: 98.99 },
    { name: 'Phuket', lat: 7.88, lng: 98.39 },
    { name: 'Pattaya', lat: 12.93, lng: 100.88 }
  ],
  GB: [
    { name: 'London', lat: 51.51, lng: -0.13, capital: true },
    { name: 'Manchester', lat: 53.48, lng: -2.24 },
    { name: 'Edinburgh', lat: 55.95, lng: -3.19 },
    { name: 'Birmingham', lat: 52.49, lng: -1.89 },
    { name: 'Glasgow', lat: 55.86, lng: -4.25 }
  ],
  DE: [
    { name: 'Berlin', lat: 52.52, lng: 13.40, capital: true },
    { name: 'Munich', lat: 48.14, lng: 11.58 },
    { name: 'Hamburg', lat: 53.55, lng: 9.99 },
    { name: 'Frankfurt', lat: 50.11, lng: 8.68 },
    { name: 'Cologne', lat: 50.94, lng: 6.96 }
  ],
  AU: [
    { name: 'Canberra', lat: -35.28, lng: 149.13, capital: true },
    { name: 'Sydney', lat: -33.87, lng: 151.21 },
    { name: 'Melbourne', lat: -37.81, lng: 144.96 },
    { name: 'Brisbane', lat: -27.47, lng: 153.03 },
    { name: 'Perth', lat: -31.95, lng: 115.86 }
  ],
  CA: [
    { name: 'Ottawa', lat: 45.42, lng: -75.70, capital: true },
    { name: 'Toronto', lat: 43.65, lng: -79.38 },
    { name: 'Vancouver', lat: 49.28, lng: -123.12 },
    { name: 'Montreal', lat: 45.50, lng: -73.57 },
    { name: 'Calgary', lat: 51.05, lng: -114.07 }
  ],
  IN: [
    { name: 'New Delhi', lat: 28.61, lng: 77.21, capital: true },
    { name: 'Mumbai', lat: 19.08, lng: 72.88 },
    { name: 'Bangalore', lat: 12.97, lng: 77.59 },
    { name: 'Kolkata', lat: 22.57, lng: 88.36 },
    { name: 'Chennai', lat: 13.08, lng: 80.27 }
  ],
  CN: [
    { name: 'Beijing', lat: 39.90, lng: 116.41, capital: true },
    { name: 'Shanghai', lat: 31.23, lng: 121.47 },
    { name: 'Guangzhou', lat: 23.13, lng: 113.26 },
    { name: 'Chengdu', lat: 30.57, lng: 104.07 },
    { name: "Xi'an", lat: 34.34, lng: 108.94 }
  ]
};

function getMajorCities(code) {
  if (COUNTRY_CITIES[code]) return COUNTRY_CITIES[code];
  const c = COUNTRIES.find(x => x.code === code);
  return c ? [{ name: c.capital, lat: c.lat, lng: c.lng, capital: true }] : [];
}

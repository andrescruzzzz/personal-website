// ============================================
// Mappd - tiny JSON file data store (no DB server needed)
// ============================================
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'data', 'db.json');

let db = { users: [], nextId: 1 };

function load() {
  try {
    db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (!db.users) db.users = [];
    if (!db.nextId) db.nextId = 1;
  } catch (e) {
    save();
  }
}

let saveTimer = null;
function save() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}
// debounced save for hot paths
function saveSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 150);
}

load();

const Store = {
  findByEmail(email) {
    email = (email || '').toLowerCase();
    return db.users.find(u => u.email === email) || null;
  },
  getById(id) {
    return db.users.find(u => u.id === id) || null;
  },
  create(user) {
    user.id = db.nextId++;
    user.email = user.email.toLowerCase();
    user.createdAt = Date.now();
    if (!user.data) user.data = {};
    db.users.push(user);
    save();
    return user;
  },
  update(id, fields) {
    const u = this.getById(id);
    if (!u) return null;
    Object.assign(u, fields);
    saveSoon();
    return u;
  },
  remove(id) {
    const i = db.users.findIndex(u => u.id === id);
    if (i >= 0) { db.users.splice(i, 1); save(); return true; }
    return false;
  }
};

module.exports = Store;

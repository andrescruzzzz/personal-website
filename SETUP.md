# Packet Cards — Setup Guide

This site lets anyone tap a blank NFC card, register their details, and get their
own public profile page. Data is stored in **Firebase** (Firestore + Auth).

You only have to do the Firebase setup **once**. After that, new people just tap a
card and register themselves.

---

## 1. Create a Firebase project (free)

1. Go to https://console.firebase.google.com and click **Add project**.
2. Name it (e.g. `packet-cards`). You can skip Google Analytics.
3. Wait for it to finish, then open the project.

## 2. Enable Email/Password sign-in

1. In the left menu: **Build → Authentication → Get started**.
2. Open the **Sign-in method** tab.
3. Click **Email/Password**, toggle the first switch **on**, and **Save**.

## 3. Create the database

1. Left menu: **Build → Firestore Database → Create database**.
2. Choose a location (closest to you) and start in **production mode**.
3. Once created, open the **Rules** tab, delete what's there, and paste in the
   contents of [`firestore.rules`](firestore.rules) from this project. Click **Publish**.

## 4. Get your web config and paste it in

1. Click the **gear icon (⚙️) → Project settings**.
2. Scroll to **Your apps**, click the **`</>` (Web)** icon.
3. Give it a nickname (e.g. `web`) and **Register app** (skip Hosting).
4. It shows a `firebaseConfig = { ... }` block. Copy those values.
5. Open [`firebase-config.js`](firebase-config.js) in this project and replace the
   `REPLACE_ME` values with yours. Save.

## 5. Allow your domain

1. Back in **Authentication → Settings → Authorized domains**.
2. Make sure these are listed (add if missing):
   - `packetcards.com`
   - `localhost` (for local testing)

That's it — push the changes and the site is live.

---

## How cards work

Every NFC card is encoded with a URL containing a **unique id**:

```
https://packetcards.com?id=qp5ifx2k
```

- **Unclaimed id** → the visitor is sent to the registration page to set it up.
- **Claimed id** → shows that person's profile.
- The owner (signed in) sees a pencil button to edit at `manage.html?id=...`.

### Pre-generated ids you can write to cards

Write one of these onto each blank card (any NFC writer app works — e.g.
**NFC Tools** on iOS/Android — write a "URL/URI" record):

```
https://packetcards.com?id=qp5ifx2k
https://packetcards.com?id=bz0dxk7u
https://packetcards.com?id=63du8eel
https://packetcards.com?id=utvp2mhw
https://packetcards.com?id=5qms0d9i
https://packetcards.com?id=yaz77a0z
https://packetcards.com?id=pgw54u8s
https://packetcards.com?id=8vlanfyp
https://packetcards.com?id=58wr2l3m
https://packetcards.com?id=2w22prl3
```

Need more? Any random string works — the first person to tap an unclaimed id claims it.
Use random (not sequential) ids so people can't guess and claim cards they don't hold.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Public profile page (reads `?id=`) |
| `register.html` | Sign-up + claim flow for a new card |
| `manage.html` | Edit page for the card's owner |
| `firebase-config.js` | **Your** Firebase keys (you edit this) |
| `firebase-init.js` | Initializes Firebase |
| `card-shared.js` | Shared icons, rendering, and form helpers |
| `firestore.rules` | Database security rules (paste into Firebase) |

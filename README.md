# MicroJobs

Monorepo pentru aplicația MicroJobs.

## Structură
- `backend/` – Node.js + Express, MongoDB, Stripe, JWT, WebSocket
- `frontend-web/` – React
- `frontend-mobile/` – React Native (Android & iOS)

## Instrucțiuni de pornire

### Backend
1. `cd backend`
2. `npm install`
3. `npm run dev`

### Frontend Web
1. `cd frontend-web`
2. `npm install`
3. `npm start`

### Frontend Mobile
1. `cd frontend-mobile`
2. `npm install`
3. `npx expo start`

---

## Funcționalități MVP
- Conectare beneficiari & prestatori servicii
- Plasare și ofertare comenzi
- Chat negociere
- Reviews ambele părți
- Plăți Stripe cu escrow
- Autentificare JWT

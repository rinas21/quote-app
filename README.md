# Quote Application

A MERN stack application for generating service quotes. Users select services (Web Development, SEO, Social Media Management), adjust quantities, see a real-time price estimate with 10% tax, and submit a quote request that is stored as a Lead in MongoDB.

---

## Design Flow

1. **Landing** – User sees the “Configure Your Plan” screen with three service cards and an empty quote summary.
2. **Select services** – User clicks a service card to add it (or clicks again to remove). Selected cards show a quantity/duration input.
3. **Adjust quantity** – For each selected service, user can change the number of units or months. The quote summary updates in real time (subtotal, 10% tax, total).
4. **Review** – Summary panel shows line items and total. Submit is disabled until at least one service is selected.
5. **Submit** – User clicks “Send Quote Request”. The app sends a `POST /api/quote` with the selection; the backend validates, calculates totals with 10% tax, saves a Lead to MongoDB, and returns success.
6. **Feedback** – On success, a message is shown and the selection is cleared. On error, an error message is displayed.

---

## Architecture

- **Frontend (React + Vite)** – `client/`
  - Single-page form: service selection, quantity inputs, live price summary, submit button.
  - State: selected services and quantities; derived state for subtotal, tax, total.
  - On submit: `POST` to backend `/api/quote` with `{ selection: [{ id, quantity }, ...] }`.
  - Uses `VITE_API_URL` (e.g. `http://localhost:5000`) for the API base URL.

- **Backend (Node.js + Express)** – `server/`
  - Single route: `POST /api/quote`.
  - Validates `selection` (array, at least one item; each item: valid `id`, positive integer `quantity`).
  - Uses in-memory service definitions (Web Dev $500, SEO $300, SMM $200) to compute subtotal, 10% tax, and grand total.
  - Persists a **Lead** document in MongoDB (services, totals, `createdAt`).
  - Returns 201 with computed totals on success; 400 for validation errors.

- **Database (MongoDB)** – Lead collection.
  - Schema: `services[]` (id, name, price, quantity), `totalPrice`, `taxAmount`, `grandTotal`, `createdAt`.

- **Deployment** – Optional Docker Compose: `mongo`, `server`, `client`; `.env` (or `.env.example`) for `MONGO_URI`, `VITE_API_URL`, ports.

```
┌─────────────┐     POST /api/quote      ┌─────────────┐     mongoose      ┌─────────────┐
│   Client    │ ───────────────────────► │   Server    │ ────────────────► │  MongoDB    │
│ (React/Vite)│   { selection: [...] }   │ (Express)   │   Lead.save()     │  (leads)    │
└─────────────┘ ◄─────────────────────── └─────────────┘                   └─────────────┘
                  { success, data }
```

---

## 🏃 Local Development (Recommended)

If you want to run the app locally (without Docker) for development:

### 1. Start the Backend
Open a terminal:
```bash
cd server
npm install
npm run dev
```
*Server runs on port 5000*

### 2. Start the Frontend
Open a **new** terminal:
```bash
cd client
npm install
npm run dev
```
*Frontend runs on port 5173*

### 3. Database
Ensure you have a MongoDB instance running locally on `mongodb://localhost:27017/quote-app`, OR update the `.env` file in `server` to point to your MongoDB URI.

---

## 🐳 Docker (Deployment / optional)

If you still want to run via Docker (and fix the missing dependency error), you must rebuild to install the new libraries:

```bash
# Stop containers and remove old volumes (fixes missing dependencies)
docker-compose down -v

# Rebuild and start
docker-compose up --build
```

---

## 🔍 Checking the Database (MongoDB)

To inspect the saved quotes inside the Docker container:

1. **Enter the MongoDB Container:**
   ```bash
   docker exec -it quote_mongo mongosh
   ```

2. **Switch to the Database:**
   ```javascript
   use quote-app
   ```

3. **View Saved Leads (Quotes):**
   ```javascript
   db.leads.find().pretty()
   ```

4. **Exit:**
   Type `exit` to leave the mongo shell.

---

## 🧪 Testing the API

You can test the quote submission API directly using `curl` or Postman.

### Using cURL (Terminal)

Run this command to send a test quote request:

```bash
curl -X POST http://localhost:5000/api/quote \
  -H "Content-Type: application/json" \
  -d '{
    "selection": [
      { "id": "web_dev", "quantity": 1 },
      { "id": "seo", "quantity": 3 }
    ]
  }'
```

**Expected Response in JSON:**
```json
{
  "success": true,
  "data": {
    "services": [...],
    "subtotal": 1400,
    "taxAmount": 140,
    "grandTotal": 1540
  }
}
```

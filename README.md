# Quote Application

A MERN stack application for generating service quotes.

## Local Development (Recommended)

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

## Docker (Deployment / optional)

If you still want to run via Docker (and fix the missing dependency error), you must rebuild to install the new libraries:

```bash
# Stop containers and remove old volumes (fixes missing dependencies)
docker-compose down -v

# Rebuild and start
docker-compose up --build
```

---

##  Checking the Database (MongoDB)

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

## Testing the API

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

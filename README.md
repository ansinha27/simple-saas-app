# 🗺 GeoTrack Pro

A full-stack geospatial web application that allows users to **log in**, **search locations**, **create map markers**, **draw land parcel polygons**, compute **area & perimeter**, and **store everything securely**.

Built to demonstrate concepts commonly used in **property intelligence**, **land management**, and **geospatial planning platforms**.

---

## 🚀 Tech Stack

| Layer         | Technology                 |
| ------------- | -------------------------- |
| **Frontend**  | React (Vite), Leaflet Maps |
| **Backend**   | ASP.NET Core Web API (C#)  |
| **Database**  | PostgreSQL                 |
| **Auth**      | JWT-Based Authentication   |
| **Geocoding** | OpenStreetMap / Nominatim  |

---

## ✅ Features

### Core Map Features

* Search any location by name or address (geocoding)
* Interactive map (zoom, pan, fly-to animations)
* Add **map markers** by clicking (only after enabling *Add Location* mode)
* Each marker stores:

  * Name
  * Description
  * Category (optional)
* View marker details via popups
* Edit & Delete saved markers

### Parcel Drawing (Polygon Feature)

* Create polygons representing **land parcels**
* Automatic **area** and **perimeter** calculation
* Parcels are stored in the database
* Parcels appear persistently on reload
* Edit & Delete your parcels anytime

### Boundary Overlay

* Uses open-source GIS dataset
* Toggle **Show Boundary** button to display region outline on the map

### Authentication & Authorization

* Secure login and registration
* JWT stored in localStorage
* Protected API routes

---

## 👥 User Types & Permissions

| Feature / Permission           |  **Normal User** |     **Admin**     |
| ------------------------------ | :--------------: | :---------------: |
| View own saved locations       |       ✅ Yes      | ✅ Yes (all users) |
| View others' locations         |       ❌ No       |       ✅ Yes       |
| Create / Edit / Delete markers | ✅ Only their own |   ✅ All markers   |
| Create / Edit / Delete parcels | ✅ Only their own |   ✅ All parcels   |
| View all registered users      |       ❌ No       |       ✅ Yes       |
| CRUD on users                  |       ❌ No       |       ✅ Yes       |

**In summary:**
**Users manage only their own data.**
**Admins can manage everything.**

---

## 🗂 Parcels (Land Drawings)

When drawing a polygon:

* Click to place vertices
* Close shape to finalize
* System calculates:

  * **Area**
  * **Perimeter**
* Saved parcel appears in sidebar + map

---

## 🌍 Map Interaction Controls

| Action                         | Outcome                                                 |
| ------------------------------ | ------------------------------------------------------- |
| **Click "Add Location" first** | Enables map-click marker placement (prevents accidents) |
| Click on map (when enabled)    | Adds new marker with form prompt                        |
| Marker click                   | Shows popup info                                        |
| Search bar                     | Zooms map to location                                   |
| Show Boundary button           | Toggles region outline overlay                          |
| Parcel draw tool               | Allows polygon creation                                 |

---

## 🛠️ Prerequisites

| Tool       | Version |
| ---------- | ------- |
| Node.js    | 18+     |
| .NET SDK   | 8.0+    |
| PostgreSQL | 14+     |

---

## 🗄 Database Setup

```sql
CREATE DATABASE simple_saas_db;
```

Edit `backend/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=simple_saas_db;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Prefer"
}
```

---

## ▶️ Run Locally

### Backend

```
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

Runs at → `http://localhost:5007`

### Frontend

```
cd frontend
npm install
npm run dev
```

Runs at → `http://localhost:5173`

Create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:5007
```

---

## 🌐 Deployment

This project is also deployed on **Render.com** (frontend + backend).
You can still run it locally without deployment.

---

## ✨ Author

Built by **Ananya Sinha**

---

## ⭐ Show Support

If you find this useful, **please star⭐ the repository** — it encourages continued development!

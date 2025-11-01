import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  ZoomControl,
  useMap,
  GeoJSON,
} from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import api from "../api";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import { FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import * as turf from "@turf/turf";


// --- Helpers ---
function ClickHandler({ onClick, enabled }) {
  useMapEvents({
    click(e) {
      if (enabled) onClick(e.latlng);
    },
  });
  return null;
}

function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 16, { duration: 1.5 });
    }
  }, [position]);
  return null;
}

function FlyToLocationOnSelect({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.latitude, location.longitude], 17, { duration: 1.5 });
    }
  }, [location]);
  return null;
}

function FlyToParcel({ parcel }) {
  const map = useMap();
  useEffect(() => {
    if (parcel?.parsed?.geometry?.coordinates) {
      const coords = parcel.parsed.geometry.coordinates[0];
      const lats = coords.map((c) => c[1]);
      const lngs = coords.map((c) => c[0]);
      const center = [
        (Math.min(...lats) + Math.max(...lats)) / 2,
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
      ];
      map.flyTo(center, 16, { duration: 1.3 });
    }
  }, [parcel]);
  return null;
}

const polygonStyle = {
  color: "#2d9cdb",
  weight: 3,
  opacity: 1,
  fillColor: "#2d9cdb",
  fillOpacity: 0.15,
};

function MapView() {
  const [locations, setLocations] = useState([]);
  const [polygons, setPolygons] = useState([]);

  const [adding, setAdding] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", category: "" });

  const [editingLocationId, setEditingLocationId] = useState(null);

  const [polyDraft, setPolyDraft] = useState(null);
  const [polyForm, setPolyForm] = useState({ name: "", description: "", category: "" });
  const [editingPolygonId, setEditingPolygonId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);

  const [isAddMode, setIsAddMode] = useState(false);

  const token = localStorage.getItem("token");

  const fetchLocations = async () => {
    const res = await api.get("/locations", { headers: { Authorization: `Bearer ${token}` } });
    setLocations(res.data || []);
  };

  const fetchPolygons = async () => {
    const res = await api.get("/polygons", { headers: { Authorization: `Bearer ${token}` } });
    setPolygons(res.data || []);
  };

  useEffect(() => {
    fetchLocations();
    fetchPolygons();
  }, []); // eslint-disable-line

  const handleMapClick = (latlng) => {
    setEditingLocationId(null);
    setAdding({ lat: latlng.lat, lng: latlng.lng });
    setForm({ name: "", description: "", category: "" });
  };

  const saveLocation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingLocationId) {
        await api.put(
          `/locations/${editingLocationId}`,
          {
            name: form.name.trim(),
            category: form.category || null,
            description: form.description || null,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await api.post(
          "/locations",
          {
            name: form.name.trim(),
            latitude: adding.lat,
            longitude: adding.lng,
            description: form.description || null,
            category: form.category || null,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setAdding(null);
      setEditingLocationId(null);
      setIsAddMode(false);
      await fetchLocations();
      alert("📍 Location saved!");
    } finally {
      setLoading(false);
    }
  };

  const onCreated = (e) => {
    const ring = e.layer.getLatLngs()[0].map((pt) => [pt.lng, pt.lat]);
    ring.push(ring[0]);
    setEditingPolygonId(null);
    setPolyDraft({
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: [ring] },
    });
    setPolyForm({ name: "", description: "", category: "" });
  };

 const savePolygon = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    // ✅ Ensure GeoJSON is Feature format
    const turfPoly =
      polyDraft.type === "Feature"
        ? polyDraft
        : turf.feature(polyDraft);

    // ✅ Calculate area and perimeter
    const areaSqM = turf.area(turfPoly);
    const areaHectares = areaSqM / 10000;
    const perimeterMeters = turf.length(turfPoly, { units: "meters" });

    if (editingPolygonId) {
      await api.put(
        `/polygons/${editingPolygonId}`,
        {
          name: polyForm.name.trim(),
          description: polyForm.description || null,
          category: polyForm.category || null,
          areaSqM,
          areaHectares,
          perimeterMeters,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      await api.post(
        "/polygons",
        {
          name: polyForm.name.trim(),
          description: polyForm.description || null,
          category: polyForm.category || null,
          geoJson: JSON.stringify(turfPoly),
          areaSqM,
          areaHectares,
          perimeterMeters,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    setEditingPolygonId(null);
    setPolyDraft(null);
    await fetchPolygons();
    alert("🟦 Parcel saved!");
  } finally {
    setLoading(false);
  }
};



  const parsedPolygons = useMemo(
  () => polygons.map((p) => {
    const parsed = JSON.parse(p.geoJson);

    // ✅ Ensure polygon data is always a Feature
    const feature = parsed.type === "Feature"
      ? parsed
      : { type: "Feature", properties: {}, geometry: parsed };

    return { ...p, parsed: feature };
  }),
  [polygons]
);


  return (
    <div style={{ display: "flex", height: "100vh", background: "#fafafa" }}>
      <Sidebar
        locations={locations}
        polygons={parsedPolygons}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        onSelectParcel={(p) => setSelectedParcel(p)}
      />

      <div
        style={{
          flex: 1,
          padding: "12px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            background: "#fafafa",
            paddingBottom: "8px",
            paddingTop: "4px",
            position: "sticky",
            top: 0,
            zIndex: 1000,
          }}
        >
          <SearchBar onSelectLocation={(pos) => setAdding(pos)} />
          <button
            onClick={() => {
              setIsAddMode((v) => !v);
              setAdding(null);
              setEditingLocationId(null);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: isAddMode ? "#d9534f" : "#2d9cdb",
              color: "white",
              fontWeight: 600,
            }}
          >
            {isAddMode ? "Cancel Adding" : "+ Add Location"}
          </button>
        </div>

        {/* LOCATION FORM */}
        {adding && (
          <div
            style={{
              position: "absolute",
              top: 60,
              left: 12,
              zIndex: 1000,
              background: "white",
              padding: "16px",
              borderRadius: "10px",
              width: "300px",
              maxHeight: "70vh",
              overflowY: "auto",
              boxShadow: "0px 4px 14px rgba(0,0,0,0.15)",
            }}
          >
            <button
              type="button"
              onClick={() => { setAdding(null); setEditingLocationId(null); }}
              style={{
                position: "absolute", top: "6px", right: "6px",
                background: "transparent", border: "none", fontSize: "18px", cursor: "pointer"
              }}
            >
              ✕
            </button>

            <div style={{ fontWeight: 600, marginBottom: "10px" }}>
              {editingLocationId ? "Edit Location" : "Add Location"}
            </div>

            <form onSubmit={saveLocation}>
              <input type="text" required placeholder="Name"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ width: "100%", padding: "8px", marginBottom: "8px" }} />

              <input type="text" placeholder="Category (optional)"
                value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ width: "100%", padding: "8px", marginBottom: "8px" }} />

              <textarea placeholder="Description (optional)"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ width: "100%", padding: "8px", minHeight: "60px" }} />

              <button type="submit" disabled={loading}
                style={{ width: "100%", padding: "8px", background: "#007bff", color: "white", borderRadius: "6px" }}>
                {loading ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        )}

        {/* PARCEL FORM */}
        {polyDraft && (
          <div
            style={{
              position: "absolute",
              top: 60,
              left: 330,
              zIndex: 1000,
              background: "white",
              padding: "16px",
              borderRadius: "10px",
              width: "300px",
              maxHeight: "70vh",
              overflowY: "auto",
              boxShadow: "0px 4px 14px rgba(0,0,0,0.15)",
            }}
          >
            <button
              type="button"
              onClick={() => { setPolyDraft(null); setEditingPolygonId(null); }}
              style={{
                position: "absolute", top: "6px", right: "6px",
                background: "transparent", border: "none", fontSize: "18px", cursor: "pointer"
              }}
            >
              ✕
            </button>

            <div style={{ fontWeight: 600, marginBottom: "10px" }}>
              {editingPolygonId ? "Edit Parcel" : "Save Parcel"}
            </div>

            <form onSubmit={savePolygon}>
              <input type="text" required placeholder="Name"
                value={polyForm.name} onChange={(e) => setPolyForm({ ...polyForm, name: e.target.value })}
                style={{ width: "100%", padding: "8px", marginBottom: "8px" }} />

              <input type="text" placeholder="Category (optional)"
                value={polyForm.category} onChange={(e) => setPolyForm({ ...polyForm, category: e.target.value })}
                style={{ width: "100%", padding: "8px", marginBottom: "8px" }} />

              <textarea placeholder="Description (optional)"
                value={polyForm.description} onChange={(e) => setPolyForm({ ...polyForm, description: e.target.value })}
                style={{ width: "100%", padding: "8px", minHeight: "60px" }} />

              <button type="submit"
                style={{ width: "100%", padding: "8px", background: "#2d9cdb", color: "white", borderRadius: "6px" }}>
                {loading ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        )}

        {/* MAP */}
        <MapContainer
          center={[51.509, -0.118]}
          zoom={12}
          style={{ width: "100%", flex: 1, borderRadius: "12px", overflow: "hidden" }}
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />
          <FlyToLocation position={adding} />
          <FlyToLocationOnSelect location={selectedLocation} />
          <FlyToParcel parcel={selectedParcel} />

          <ClickHandler onClick={handleMapClick} enabled={isAddMode} />

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FeatureGroup>
            <EditControl
              position="topright"
              draw={{ polygon: true, polyline: false, rectangle: false, circle: false, marker: false, circlemarker: false }}
              edit={{ edit: false, remove: false }}
              onCreated={onCreated}
            />
          </FeatureGroup>

          {parsedPolygons.map((p) => (
            <GeoJSON key={p.id} data={p.parsed} style={() => polygonStyle}>
              <Popup>
                <strong>{p.name}</strong><br />
                {p.category || ""}<br />
                {p.description || ""}
<br />
<b>Area:</b> {p.areaHectares?.toFixed(2)} ha ({p.areaSqM?.toLocaleString()} m²)<br />
<b>Perimeter:</b> {p.perimeterMeters?.toFixed(0)} m


                <button
                  style={{ marginTop: "8px", width: "100%", padding: "6px", borderRadius: "6px", background: "#007bff", color: "white", border: "none", cursor: "pointer" }}
                  onClick={() => {
                    setEditingPolygonId(p.id);
                    setPolyForm({ name: p.name || "", category: p.category || "", description: p.description || "" });
                    setPolyDraft(p.parsed);
                  }}
                >
                  Edit
                </button>

                <button
                  style={{ marginTop: "6px", width: "100%", padding: "6px", borderRadius: "6px", background: "#ff4d4d", color: "white", border: "none", cursor: "pointer" }}
                  onClick={async () => {
                    await api.delete(`/polygons/${p.id}`, { headers: { Authorization: `Bearer ${token}` } });
                    fetchPolygons();
                  }}
                >
                  Delete
                </button>
              </Popup>
            </GeoJSON>
          ))}

          {locations.map((loc) => (
            <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
              <Popup>
                <strong>{loc.name}</strong><br />
                {loc.category || ""}<br />
                {loc.description || ""}

                <button
                  style={{ marginTop: "8px", width: "100%", padding: "6px", borderRadius: "6px", background: "#007bff", color: "white", border: "none", cursor: "pointer" }}
                  onClick={() => {
                    setEditingLocationId(loc.id);
                    setForm({ name: loc.name, category: loc.category, description: loc.description });
                    setAdding({ lat: loc.latitude, lng: loc.longitude });
                    setIsAddMode(true);
                  }}
                >
                  Edit
                </button>

                <button
                  style={{ marginTop: "6px", width: "100%", padding: "6px", borderRadius: "6px", background: "#ff4d4d", color: "white", border: "none", cursor: "pointer" }}
                  onClick={async () => {
                    await api.delete(`/locations/${loc.id}`, { headers: { Authorization: `Bearer ${token}` } });
                    fetchLocations();
                  }}
                >
                  Delete
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapView;

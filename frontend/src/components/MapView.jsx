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
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import { FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

// -------- Helpers --------
function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
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

// Neon blue polygon style (Style 3)
const polygonStyle = {
  color: "#2d9cdb",        // outline
  weight: 3,
  opacity: 1,
  fillColor: "#2d9cdb",
  fillOpacity: 0.15,       // soft transparent fill
};

function MapView() {
  const [locations, setLocations] = useState([]);
  const [polygons, setPolygons] = useState([]);

  const [adding, setAdding] = useState(null); // marker draft { lat, lng }
  const [form, setForm] = useState({ name: "", description: "", category: "" });

  // polygon draft UI state
  const [polyDraft, setPolyDraft] = useState(null); // GeoJSON object
  const [polyForm, setPolyForm] = useState({ name: "", description: "", category: "" });
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const token = localStorage.getItem("token");

  // ----- API -----
  const fetchLocations = async () => {
    try {
      const res = await api.get("/locations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations(res.data || []);
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  const fetchPolygons = async () => {
    try {
      const res = await api.get("/polygons", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolygons(res.data || []);
    } catch (err) {
      console.error("Error fetching polygons:", err);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchPolygons();
  }, []); // eslint-disable-line

  // ----- Add marker flow -----
  const handleMapClick = (latlng) => {
    setAdding({ lat: latlng.lat, lng: latlng.lng });
    setForm({ name: "", description: "", category: "" });
  };

  const saveLocation = async (e) => {
    e.preventDefault();
    if (!adding) return;
    setLoading(true);
    try {
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
      setAdding(null);
      await fetchLocations();
      alert("📍 Location saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving location.");
    } finally {
      setLoading(false);
    }
  };

  // ----- Draw polygon flow -----
  const onCreated = (e) => {
    const layer = e.layer;
    if (e.layerType === "polygon") {
      const latlngs = layer.getLatLngs(); // could be multi dimensional
      // Normalize to [ [ [lng, lat], [lng, lat], ... ] ]
      const ring = (latlngs[0] || latlngs).map((pt) => [pt.lng, pt.lat]);

      // Ensure the ring is closed
      if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
        ring.push(ring[0]);
      }

      const geojson = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [ring],
        },
      };

      setPolyDraft(geojson);
      setPolyForm({ name: "", description: "", category: "" });
    }
  };

  const savePolygon = async (e) => {
    e.preventDefault();
    if (!polyDraft) return;
    setLoading(true);
    try {
      await api.post(
        "/polygons",
        {
          name: polyForm.name.trim(),
          description: polyForm.description || null,
          category: polyForm.category || null,
          geoJson: JSON.stringify(polyDraft),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPolyDraft(null);
      await fetchPolygons();
      alert("🟦 Parcel saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving parcel.");
    } finally {
      setLoading(false);
    }
  };

  // memoize parsed GeoJSONs for rendering
  const parsedPolygons = useMemo(() => {
    return polygons
      .map((p) => {
        try {
          return { ...p, parsed: JSON.parse(p.geoJson) };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }, [polygons]);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#fafafa" }}>
      {/* Sidebar with filter + list + logout (hover expand) */}
      <Sidebar
        locations={locations}
        onSelect={(loc) => setSelectedLocation(loc)}
      />

      {/* Main content */}
      <div style={{ flex: 1, padding: "12px", position: "relative" }}>
        {/* Search Bar */}
        <div style={{ marginBottom: "12px", maxWidth: "350px" }}>
          <SearchBar onSelectLocation={(pos) => setAdding(pos)} />
        </div>

        {/* Floating Add Location Form */}
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
              width: "260px",
              boxShadow: "0px 4px 14px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "10px" }}>Add Location</div>
            <form onSubmit={saveLocation}>
              <input
                type="text"
                placeholder="Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              />
              <input
                type="text"
                placeholder="Category (optional)"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  resize: "vertical",
                  minHeight: "60px",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
                Lat: {adding.lat.toFixed(5)} | Lng: {adding.lng.toFixed(5)}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(null)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: "#f1f1f1",
                    color: "#333",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Floating Polygon Form */}
        {polyDraft && (
          <div
            style={{
              position: "absolute",
              top: 60,
              left: 290, // sit next to marker form
              zIndex: 1000,
              background: "white",
              padding: "16px",
              borderRadius: "10px",
              width: "280px",
              boxShadow: "0px 4px 14px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "10px" }}>Save Parcel</div>
            <form onSubmit={savePolygon}>
              <input
                type="text"
                placeholder="Name"
                required
                value={polyForm.name}
                onChange={(e) => setPolyForm({ ...polyForm, name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              />
              <input
                type="text"
                placeholder="Category (optional)"
                value={polyForm.category}
                onChange={(e) => setPolyForm({ ...polyForm, category: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              />
              <textarea
                placeholder="Description (optional)"
                value={polyForm.description}
                onChange={(e) => setPolyForm({ ...polyForm, description: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  resize: "vertical",
                  minHeight: "60px",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: "#2d9cdb",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setPolyDraft(null)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: "#f1f1f1",
                    color: "#333",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MAP */}
        <MapContainer
          center={[51.509, -0.118]} // London-ish default; adjust to your demo area
          zoom={12}
          style={{ width: "100%", height: "100%", borderRadius: "12px" }}
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />
          <FlyToLocation position={adding} />
          <FlyToLocationOnSelect location={selectedLocation} />
          <ClickHandler onClick={handleMapClick} />

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Draw tools */}
          <FeatureGroup>
            <EditControl
              position="topright"
              draw={{
                polygon: true,
                polyline: false,
                rectangle: false,
                circle: false,
                marker: false,
                circlemarker: false,
              }}
              edit={{ edit: false, remove: false }}
              onCreated={onCreated}
            />
          </FeatureGroup>

          {/* Render saved polygons */}
          {parsedPolygons.map((p) => (
            <GeoJSON key={p.id} data={p.parsed} style={() => polygonStyle}>
              {/* You could add onEachFeature to bind popups with p.name, etc. */}
            </GeoJSON>
          ))}

          {/* Render saved markers */}
          {locations.map((loc) => (
            <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
              <Popup>
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>{loc.name}</div>
                {loc.category && <div style={{ fontSize: "13px" }}>Category: {loc.category}</div>}
                {loc.description && <div style={{ fontSize: "13px", marginTop: "4px" }}>{loc.description}</div>}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapView;

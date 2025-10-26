import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import api from "../api";
import Sidebar from "../components/Sidebar";

function MapView() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await api.get("/locations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLocations(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLocations();
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "10px" }}>
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ width: "100%", height: "100%", borderRadius: "8px" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {locations.map((loc) => (
            <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapView;

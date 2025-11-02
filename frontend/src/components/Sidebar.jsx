import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getUsername } from "../auth";
import { jwtDecode } from "jwt-decode";

function Sidebar({ locations, polygons, onSelectLocation, onSelectParcel, onHoverParcel, onHoverParcelEnd }) {
  const [open, setOpen] = useState(false);

  const [locationFilter, setLocationFilter] = useState("");
  const [parcelFilter, setParcelFilter] = useState("");

  const username = getUsername();
  const navigate = useNavigate();

  // ✅ Decode role from token
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const role =
    decoded?.role ||
    decoded?.Role ||
    decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    "User";

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/app");
  };

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(locationFilter.toLowerCase()) ||
    (loc.category && loc.category.toLowerCase().includes(locationFilter.toLowerCase()))
  );

  const filteredParcels = (polygons || []).filter((p) =>
    (p.name || "").toLowerCase().includes(parcelFilter.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(parcelFilter.toLowerCase()))
  );

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{
        width: open ? "240px" : "60px",
        background: "#333",
        color: "white",
        height: "100vh",
        transition: "0.3s width ease",
        padding: "10px",
        boxSizing: "border-box",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Greeting */}
      <div style={{ marginBottom: "20px", whiteSpace: "nowrap", fontWeight: 600 }}>
        {open ? `👋 Welcome, ${username}` : "👋"}
      </div>

      {/* Locations */}
      {open && (
        <>
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "6px" }}>Your Locations</div>
          <input
            type="text"
            placeholder="Search locations…"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{
              width: "100%", padding: "8px", borderRadius: "6px",
              border: "none", marginBottom: "12px", boxSizing: "border-box"
            }}
          />
          <div style={{ maxHeight: "28vh", overflowY: "auto", marginBottom: "14px" }}>
            {filteredLocations.map((loc) => (
              <div
                key={loc.id}
                onClick={() => onSelectLocation(loc)}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  marginBottom: "6px",
                  cursor: "pointer",
                  background: "#444"
                }}
              >
                <strong>{loc.name}</strong>
                {loc.category && (
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>{loc.category}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Parcels */}
      {open && (
        <>
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "6px" }}>Your Parcels</div>
          <input
            type="text"
            placeholder="Search parcels…"
            value={parcelFilter}
            onChange={(e) => setParcelFilter(e.target.value)}
            style={{
              width: "100%", padding: "8px", borderRadius: "6px",
              border: "none", marginBottom: "12px", boxSizing: "border-box"
            }}
          />
          <div style={{ maxHeight: "28vh", overflowY: "auto" }}>
            {filteredParcels.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectParcel(p)}
                onMouseEnter={() => onHoverParcel?.(p)}
                onMouseLeave={onHoverParcelEnd}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  marginBottom: "6px",
                  cursor: "pointer",
                  background: "#444",
                }}
              >
                <strong>{p.name}</strong>
                {p.category && (
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>{p.category}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      

      {/* Logout */}
      {open && (
        <button
          onClick={logout}
          style={{
            marginTop: "auto",
            width: "100%",
            padding: "8px",
            background: "#ff5757",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            color: "white",
          }}
        >
          Logout
        </button>
      )}
    </div>
  );
}

export default Sidebar;

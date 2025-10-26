import { useNavigate } from "react-router-dom";
import { getUsername } from "../auth";
import { useState } from "react";

function Sidebar({ locations, onSelect }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const username = getUsername();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(filter.toLowerCase()) ||
    (loc.category && loc.category.toLowerCase().includes(filter.toLowerCase()))
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
      }}
    >
      <div style={{ marginBottom: "20px", whiteSpace: "nowrap", fontWeight: 600 }}>
        {open ? `👋 Welcome, ${username}` : "👋"}
      </div>

      {open && (
        <input
          type="text"
          placeholder="Search locations…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "none",
            marginBottom: "12px",
            boxSizing: "border-box",
          }}
        />
      )}

      {open && (
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {filteredLocations.map((loc) => (
            <div
              key={loc.id}
              onClick={() => onSelect(loc)}
              style={{
                padding: "8px",
                borderRadius: "6px",
                marginBottom: "6px",
                cursor: "pointer",
                background: "#444",
              }}
            >
              <strong>{loc.name}</strong>
              {loc.category && (
                <div style={{ fontSize: "12px", opacity: 0.8 }}>{loc.category}</div>
              )}
            </div>
          ))}

          {filteredLocations.length === 0 && (
            <div style={{ fontSize: "12px", opacity: 0.7 }}>No results</div>
          )}
        </div>
      )}

      {open && (
        <button
          onClick={logout}
          style={{
            marginTop: "20px",
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

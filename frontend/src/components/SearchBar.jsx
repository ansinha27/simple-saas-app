import { useState } from "react";
import axios from "axios";

function SearchBar({ onSelectLocation }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
      value
    )}`;

    try {
      const res = await axios.get(url, {
        headers: { "Accept-Language": "en" },
      });
      setSuggestions(res.data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setSuggestions([]);
    onSelectLocation({
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      label: place.display_name,
    });
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "350px" }}>
      <input
        type="text"
        placeholder="Search address or place…"
        value={query}
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "14px",
          boxSizing: "border-box",
          background: "#fff",
          color: "#333",
        }}
      />

      {/* Suggestion Dropdown */}
      {suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "42px",
            width: "100%",
            maxHeight: "200px",
            overflowY: "auto",
            background: "white",
            borderRadius: "8px",
            border: "1px solid #ddd",
            boxShadow: "0px 4px 14px rgba(0,0,0,0.1)",
            zIndex: 2000,
          }}
        >
          {suggestions.map((place) => (
            <div
              key={place.place_id}
              onClick={() => handleSelect(place)}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                fontSize: "13px",
              }}
            >
              {place.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;

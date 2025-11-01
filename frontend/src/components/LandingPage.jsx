import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function LandingPage() {
  const navigate = useNavigate();

  // Auto-skip if already logged in
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/app");
    }
  }, [navigate]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #2d9cdb, #6c5ce7)",
        color: "white",
        textAlign: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ fontSize: "44px", fontWeight: 700, marginBottom: "14px" }}>
        GeoTrack Pro
      </h1>

      <p
        style={{
          fontSize: "18px",
          maxWidth: "520px",
          opacity: 0.9,
          marginBottom: "32px",
          lineHeight: "1.5",
        }}
      >
        Define sites. Save notes. Analyze parcels. Share insights.<br />
        Your lightweight land intelligence workspace.
      </p>

      <button
        onClick={() => navigate("/login")}
        style={{
          padding: "14px 32px",
          borderRadius: "8px",
          background: "white",
          color: "#222",
          border: "none",
          fontSize: "16px",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0px 4px 18px rgba(0,0,0,0.25)",
          transition: "0.2s transform ease, 0.2s opacity ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        Continue →
      </button>
    </div>
  );
}

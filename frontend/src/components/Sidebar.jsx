import { useNavigate } from "react-router-dom";
import { getUsername } from "../auth";
import { useState } from "react";

function Sidebar() {
  const [open, setOpen] = useState(false);
  const username = getUsername();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{
        width: open ? "200px" : "50px",
        background: "#333",
        color: "white",
        height: "100vh",
        transition: "0.3s width ease",
        padding: "10px",
        overflow: "hidden",
      }}
    >
      <div style={{ marginBottom: "20px", whiteSpace: "nowrap" }}>
        👋 {open ? `Welcome, ${username}` : ""}
      </div>

      {open && (
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "10px",
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

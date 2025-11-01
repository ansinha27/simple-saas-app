import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/register", { username, password });

      if (res.status === 200 && res.data.token) {
        alert("✅ Registration successful! Please log in.");
        navigate("/");
      } else {
        alert("Registration failed, please try again.");
      }
    } catch (err) {
      if (err.response) {
        alert(`Error: ${err.response.data}`);
      } else {
        alert("Network error, check your backend.");
      }
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoCircle}>🌍</div>
        <h1 style={styles.title}>GeoTrack Pro</h1>
        <p style={styles.subtitle}>Create your account</p>

        <form onSubmit={handleRegister} style={styles.form}>
          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Choose a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Register
          </button>
        </form>

        <p style={styles.linkText}>
          Already have an account?{" "}
          <a href="/" style={styles.link}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #2d9cdb, #1b75bb)",
    fontFamily: "Inter, sans-serif",
  },
  card: {
    width: "340px",
    background: "white",
    borderRadius: "14px",
    padding: "32px",
    boxShadow: "0px 8px 26px rgba(0,0,0,0.25)",
    textAlign: "center",
  },
  logoCircle: {
    fontSize: "42px",
    background: "#e8f4ff",
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    margin: "0 auto 10px auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    margin: "6px 0",
    fontWeight: 700,
  },
  subtitle: {
    marginTop: "-4px",
    marginBottom: "20px",
    color: "#555",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },
  button: {
    marginTop: "12px",
    background: "#2d9cdb",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.2s",
  },
  linkText: {
    marginTop: "14px",
    fontSize: "14px",
  },
  link: {
    color: "#2d9cdb",
    textDecoration: "none",
    fontWeight: 600,
  },
};

export default Register;

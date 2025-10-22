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

      // ✅ Handle success properly
      if (res.status === 200 && res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/map");
      } else {
        alert("Registration failed, please try again.");
      }
    } catch (err) {
      // 👇 Improved debugging
      if (err.response) {
        console.error("Backend error:", err.response.data);
        alert(`Error: ${err.response.data}`);
      } else {
        console.error("Network error:", err);
        alert("Network error, check your backend connection.");
      }
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <a href="/">Login</a>
      </p>
    </div>
  );
}

export default Register;

import { getUsername } from "../auth";
import { useNavigate } from "react-router-dom";

function NavBar() {
  const username = getUsername();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ padding: "10px", background: "#f2f2f2" }}>
      <span>Welcome, {username}</span>
      <button onClick={logout} style={{ float: "right" }}>Logout</button>
    </div>
  );
}

export default NavBar;

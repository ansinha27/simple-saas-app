import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  // Decode token to check role
  const decoded = jwtDecode(token);
  const userRole =
    decoded.role ||
    decoded.Role ||
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    "User";

  // If roles were passed, ensure user is allowed
  if (roles && !roles.includes(userRole)) {
    return <Navigate to="/map" replace />;
  }

  return children;
}

export default PrivateRoute;

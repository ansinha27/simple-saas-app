import { jwtDecode } from "jwt-decode";


export function getUsername() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const decoded = jwtDecode(token);

  return (
    decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
    null
  );
}

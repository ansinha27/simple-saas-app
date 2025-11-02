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

export function getUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const decoded = jwtDecode(token);

  return (
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    null
  );
}

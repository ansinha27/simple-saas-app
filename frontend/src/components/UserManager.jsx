import { useEffect, useState } from "react";
import api from "../api";

function UserManager({ onClose }) {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    const res = await api.get("/admin/users", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(res.data);
  };

  const deleteUser = async (id) => {
    await api.delete(`/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchUsers();
  };

  const changeRole = async (id, role) => {
    await api.put(`/admin/users/${id}/role`, { role }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        right: 20,
        background: "white",
        width: "380px",
        padding: "16px",
        borderRadius: "10px",
        boxShadow: "0px 4px 14px rgba(0,0,0,0.2)",
        zIndex: 2000,
        maxHeight: "80vh",
        overflowY: "auto"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>Manage Users</h3>
        <button onClick={onClose} style={{ border: "none", background: "transparent", fontSize: "18px", cursor: "pointer" }}>✖</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ccc" }}>
            <th>ID</th><th>Username</th><th>Role</th><th></th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  style={{ padding: "4px" }}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </td>
              <td>
                <button
                  onClick={() => deleteUser(u.id)}
                  style={{
                    background: "#ff4747",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: "white"
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default UserManager;

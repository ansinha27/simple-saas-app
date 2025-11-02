import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  Paper,
  Stack
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: "", password: "", role: "User" });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    const res = await api.get("/admin/users", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(res.data);
  };

  const saveUser = async (e) => {
    e.preventDefault();

    const payload = { username: form.username, role: form.role };
    if (form.password.trim() !== "") payload.password = form.password.trim();

    if (editingId) {
      await api.put(`/admin/users/${editingId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      await api.post(`/admin/users`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    setForm({ username: "", password: "", role: "User" });
    setEditingId(null);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user and all their data?")) return;
    await api.delete(`/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "username", headerName: "Username", flex: 1 },
    { field: "role", headerName: "Role", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 220,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={() => {
              setEditingId(params.row.id);
              setForm({
                username: params.row.username,
                password: "",
                role: params.row.role
              });
            }}
          >
            Edit
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={() => deleteUser(params.row.id)}
          >
            Delete
          </Button>
        </Stack>
      )
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 900, margin: "auto" }}>
      <Button variant="text" onClick={() => navigate("/map")}>
        ← Back to Map
      </Button>

      <Typography 
  variant="h4" 
  sx={{ 
    mt: 2, 
    mb: 2, 
    textAlign: "center", 
    color: "primary.main",       // MUI theme blue
    fontWeight: "bold"
  }}
>
  User Management
</Typography>


      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={saveUser}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />

            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editingId}
            />

            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </Select>

            <Button variant="contained" type="submit">
              {editingId ? "Save Changes" : "Add User"}
            </Button>
          </Stack>
        </form>
      </Paper>

      <Paper sx={{ height: 400 }}>
        <DataGrid
          rows={users}
          columns={columns}
          pageSize={5}
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
}

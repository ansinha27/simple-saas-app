import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Login";
import Register from "./components/Register";
import MapView from "./components/MapView";
import "./index.css";

function App() {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/map"
          element={
            <PrivateRoute>
              <MapView />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

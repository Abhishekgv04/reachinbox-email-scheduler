import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Senders from "./pages/Senders";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetails from "./pages/CampaignDetails";
import Login from "./pages/Login";

import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate
                to="/"
                replace
              />
            ) : (
              <Login />
            )
          }
        />

        {/* Protected Dashboard */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        <Route
          path="/senders"
          element={
            isAuthenticated ? (
              <Senders />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        <Route
          path="/campaigns"
          element={
            isAuthenticated ? (
              <Campaigns />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        <Route
          path="/campaigns/create"
          element={
            isAuthenticated ? (
              <CreateCampaign />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        <Route
          path="/campaigns/:id"
          element={
            isAuthenticated ? (
              <CampaignDetails />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? "/"
                  : "/login"
              }
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "../Components/Signup/Signup";
import Login from "../Components/Login/Login";
import Dashboard from "../Components/Dashboard/Dashboard";
import Friends from "../Components/Dashboard/TopNavbar/Friends";
import Videos from "../Components/Dashboard/TopNavbar/Videos";
import Meta from "../Components/Dashboard/TopNavbar/Meta";
import Messanger from "../Components/Dashboard/TopNavbar/Messanger";
import UserProfile from "../Components/Dashboard/UserProfile/UserProfile";
import ProtectedRoute from "./ProtectedRoute";

const Routing = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          }
        />

        <Route
          path="/videos"
          element={
            <ProtectedRoute>
              <Videos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/meta"
          element={
            <ProtectedRoute>
              <Meta />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messanger"
          element={
            <ProtectedRoute>
              <Messanger />
            </ProtectedRoute>
          }
        />

        <Route
          path="/userprofile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Signup />} />

      </Routes>
    </BrowserRouter>
  );
};

export default Routing;

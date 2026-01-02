import { lazy, Suspense } from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import LoadingSpinner from "./components/utils/LoadingSpinner";
import ProtectedRoute from "./routes/ProtectedRoute";
import Navbar from "./components/Navbar";


const Login = lazy(() => import("./components/Login"));
const Signup = lazy(() => import("./components/Signup"));
const Home = lazy(() => import("./components/Home"));
const User = lazy(() => import("./components/User"));
const Expert = lazy(() => import("./components/Expert"));
const UserSession = lazy(() => import("./components/UserSession"));
const ExpertSession = lazy(() => import("./components/ExpertSession"));

function App() {
  return (
    <div className="App min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="user" element={<User/>} />
            <Route path="expert" element={<Expert />} />
            <Route path="user_session/:id/:expert" element={<UserSession />} />
            <Route path="expert_session/:id" element={<ExpertSession />} />
          </Route>

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;

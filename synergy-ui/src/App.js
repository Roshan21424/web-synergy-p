import { lazy, Suspense } from 'react';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoadingSpinner from './components/utils/LoadingSpinner';
import Home from './components/Home';
import ProtectedRoute from './routes/ProtectedRoute';




const Login = lazy(() => import('./components/Login'));
const Signup = lazy(() => import('./components/Signup'));

function App() {
  return (
 <div className="App min-h-screen flex flex-col bg-gray-50">
       <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
          </Route>

        </Routes>
       </Suspense>
    </div>
  );
}

export default App;

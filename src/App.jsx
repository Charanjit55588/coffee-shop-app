import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from './AppContext.jsx';
import { Loading, TabBar } from './components/common.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Favorites from './pages/Favorites.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import OrderConfirmed from './pages/OrderConfirmed.jsx';
import Product from './pages/Product.jsx';
import Profile from './pages/Profile.jsx';
import ProfileAppearance from './pages/ProfileAppearance.jsx';
import ProfileNotifications from './pages/ProfileNotifications.jsx';
import ProfilePersonal from './pages/ProfilePersonal.jsx';
import Signup from './pages/Signup.jsx';

// Signed-out visitors are sent to /login and returned to where they were going.
function RequireAuth() {
  const { status } = useApp();
  const location = useLocation();
  if (status === 'loading') return <Loading label="Signing you in…" />;
  if (status === 'signedOut') return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

function WithTabs() {
  return (
    <>
      <Outlet />
      <TabBar />
    </>
  );
}

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<RequireAuth />}>
          <Route element={<WithTabs />}>
            <Route path="/" element={<Home />} />
            <Route path="/products/:id" element={<Product />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders/:id" element={<OrderConfirmed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/personal" element={<ProfilePersonal />} />
            <Route path="/profile/notifications" element={<ProfileNotifications />} />
            <Route path="/profile/appearance" element={<ProfileAppearance />} />
          </Route>
          <Route path="/checkout" element={<Checkout />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

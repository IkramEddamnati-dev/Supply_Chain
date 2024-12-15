import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PrivateRouteProps {
  element: React.ReactNode;
  isAuthenticated: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, isAuthenticated }) => {
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate("/login", { replace: true }); // Redirect to login page
    return null; // Render nothing until the redirect occurs
  }

  return <>{element}</>;
};

export default PrivateRoute;

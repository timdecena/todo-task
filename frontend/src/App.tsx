import React from 'react';
import AppRoutes from './routes/AppRoutes';

/*
  This component is the main wrapper of the frontend application.
  It delegates page rendering to the route configuration so navigation stays centralized.
*/
// App is only a wrapper for routes.
const App: React.FC = () => {
  return <AppRoutes />;
};

export default App;

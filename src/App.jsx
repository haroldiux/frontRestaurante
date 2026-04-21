import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RestaurantProvider } from './context/RestaurantContext';
import AppRoutes from './routes/AppRoutes';

import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RestaurantProvider>
          <AppRoutes />
          <Toaster richColors position="top-right" />
        </RestaurantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

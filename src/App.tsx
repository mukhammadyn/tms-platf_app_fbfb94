import React from 'react';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from '@/components/shared/AppProviders';
import { Layout } from '@/components/layout/Layout';

// Pages
import { DashboardPage } from '@/pages/DashboardPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { BidsPage } from '@/pages/BidsPage';
import { TrackingPage } from '@/pages/TrackingPage';
import { DriversPage } from '@/pages/DriversPage';
import { DriverDetailPage } from '@/pages/DriverDetailPage';
import { VehiclesPage } from '@/pages/VehiclesPage';
import { VehicleDetailPage } from '@/pages/VehicleDetailPage';
import { CarriersPage } from '@/pages/CarriersPage';
import { CarrierDetailPage } from '@/pages/CarrierDetailPage';
import { FinancePage } from '@/pages/FinancePage';
import { MessagingPage } from '@/pages/MessagingPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ReviewsPage } from '@/pages/ReviewsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { UsersPage } from '@/pages/UsersPage';
import { UserDetailPage } from '@/pages/UserDetailPage';

export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Redirect root to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Main */}
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Orders */}
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />

            {/* Bids */}
            <Route path="bids" element={<BidsPage />} />

            {/* Tracking */}
            <Route path="tracking" element={<TrackingPage />} />

            {/* Fleet */}
            <Route path="drivers" element={<DriversPage />} />
            <Route path="drivers/:id" element={<DriverDetailPage />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="carriers" element={<CarriersPage />} />
            <Route path="carriers/:id" element={<CarrierDetailPage />} />

            {/* Finance */}
            <Route path="finance" element={<FinancePage />} />

            {/* Communications */}
            <Route path="messages" element={<MessagingPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />

            {/* Admin */}
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { TripProvider } from './context/TripContext';
import { ItineraryProvider } from './context/ItineraryContext';
import { ExpenseProvider } from './context/ExpenseContext';

import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import DashboardPage from './pages/DashboardPage';
import CreateTripPage from './pages/CreateTripPage';
import ItineraryPage from './pages/ItineraryPage';
import MapPage from './pages/MapPage';
import BudgetPage from './pages/BudgetPage';
import ExpenseSplitterPage from './pages/ExpenseSplitterPage';
import SavedTripsPage from './pages/SavedTripsPage';

export default function App() {
  return (
    <NotificationProvider>
      <TripProvider>
        <ItineraryProvider>
          <ExpenseProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Landing & Explore */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                </Route>

                {/* Authenticated/Dashboard Style App Layout */}
                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="create" element={<CreateTripPage />} />
                  <Route path="itinerary" element={<ItineraryPage />} />
                  <Route path="map" element={<MapPage />} />
                  <Route path="budget" element={<BudgetPage />} />
                  <Route path="expenses" element={<ExpenseSplitterPage />} />
                  <Route path="trips" element={<SavedTripsPage />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ExpenseProvider>
        </ItineraryProvider>
      </TripProvider>
    </NotificationProvider>
  );
}

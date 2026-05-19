import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/LoginPage';
import ContactsPage from './pages/ContactsPage';
import DashboardPage from './pages/DashboardPage';
import InterviewPage from './pages/InterviewPage';
import LeadsPage from './pages/LeadsPage';
import LinksPage from './pages/LinksPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import ResumePage from './pages/ResumePage';
import NotificationsPage from './pages/NotificationsPage';
import './styles/tokens.css';
import '@ops-forward/keel/styles.css';
import './styles/app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/u/:slug" element={<PublicProfilePage />} />
        <Route element={<App />}>
          <Route index element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

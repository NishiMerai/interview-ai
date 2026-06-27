import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { store } from './store/store.js';
import AppLayout from './layouts/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Loader from './components/Loader.jsx';
import GlobalError from './components/GlobalError.jsx';
import './index.css';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const AdminLogin = lazy(() => import('./pages/AdminLogin.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const ResumeAnalyzer = lazy(() => import('./pages/ResumeAnalyzer.jsx'));
const LearningRoadmap = lazy(() => import('./pages/LearningRoadmap.jsx'));
const MockInterview = lazy(() => import('./pages/MockInterview.jsx'));
const Chatbot = lazy(() => import('./pages/Chatbot.jsx'));
const AdminPanel = lazy(() => import('./pages/AdminPanel.jsx'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1
    }
  }
});

const router = createBrowserRouter([
  { 
    path: '/', 
    element: <Suspense fallback={<Loader />}><Landing /></Suspense>,
    errorElement: <GlobalError />
  },
  { path: '/login', element: <Suspense fallback={<Loader />}><Login /></Suspense> },
  { path: '/admin-login', element: <Suspense fallback={<Loader />}><AdminLogin /></Suspense> },
  { path: '/register', element: <Suspense fallback={<Loader />}><Register /></Suspense> },
  {
    path: '/app',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Suspense fallback={<Loader />}><Dashboard /></Suspense> },
      { path: 'dashboard', element: <Suspense fallback={<Loader />}><Dashboard /></Suspense> },
      { path: 'resume', element: <Suspense fallback={<Loader />}><ResumeAnalyzer /></Suspense> },
      { path: 'roadmap', element: <Suspense fallback={<Loader />}><LearningRoadmap /></Suspense> },
      { path: 'interview', element: <Suspense fallback={<Loader />}><MockInterview /></Suspense> },
      { path: 'chatbot', element: <Suspense fallback={<Loader />}><Chatbot /></Suspense> },
      { path: 'admin', element: <AdminRoute><Suspense fallback={<Loader />}><AdminPanel /></Suspense></AdminRoute> },
      { path: 'skill-gap', element: <Navigate to="/app/dashboard" replace /> },
      { path: 'skillgap', element: <Navigate to="/app/dashboard" replace /> },
      { path: 'skill-gap-intelligence', element: <Navigate to="/app/dashboard" replace /> }
    ]
  },
  { 
    path: '*', 
    element: <ProtectedRoute><Navigate to="/app/dashboard" replace /></ProtectedRoute> 
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);

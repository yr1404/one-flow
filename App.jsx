import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { DataProvider } from './contexts/DataContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Tasks from './pages/Tasks.jsx';
import Analytics from './pages/Analytics.jsx';
import GlobalList from './pages/GlobalList.jsx';
import NotFound from './pages/NotFound.jsx';
import Landing from './pages/Landing.jsx';

// A wrapper for routes that require authentication
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/*" 
              element={
                <PrivateRoute>
                  <Layout>
                    <Routes>
                      <Route index element={<Navigate to="/dashboard" />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="projects" element={<Projects />} />
                      <Route path="projects/:projectId" element={<ProjectDetail />} />
                      <Route path="tasks" element={<Tasks />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="sales-orders" element={<GlobalList type="Sales Order" />} />
                      <Route path="purchase-orders" element={<GlobalList type="Purchase Order" />} />
                      <Route path="customer-invoices" element={<GlobalList type="Customer Invoice" />} />
                      <Route path="vendor-bills" element={<GlobalList type="Vendor Bill" />} />
                      <Route path="expenses" element={<GlobalList type="Expense" />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </PrivateRoute>
              } 
            />
          </Routes>
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;

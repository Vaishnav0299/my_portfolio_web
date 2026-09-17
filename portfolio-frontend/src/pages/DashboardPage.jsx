import React from 'react';
import { Dashboard } from '../components/Dashboard';

export function DashboardPage({ theme }) {
  return (
    <div className="dashboard-page-container">
      <Dashboard theme={theme} />
    </div>
  );
}

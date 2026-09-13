import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Topics from './pages/Topics';
import Planner from './pages/Planner';
import Progress from './pages/Progress';
import Insights from './pages/Insights';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { loadSampleData } = useApp();

  // Reset search when navigating
  const setPage = (page) => {
    setCurrentPage(page);
    setSearchQuery('');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setPage={setPage} loadSampleData={loadSampleData} />;
      case 'subjects':
        return <Subjects searchQuery={searchQuery} />;
      case 'topics':
        return <Topics searchQuery={searchQuery} />;
      case 'planner':
        return <Planner searchQuery={searchQuery} />;
      case 'progress':
        return <Progress />;
      case 'insights':
        return <Insights setPage={setPage} />;
      default:
        return <Dashboard setPage={setPage} loadSampleData={loadSampleData} />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      setPage={setPage}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

import React, { useState } from 'react';
import { Home, FileText, Users, Archive, Settings as SettingsIcon, Save } from 'lucide-react';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import ClientManagement from './components/ClientManagement';
import SavedItems from './components/SavedItems';
import Archive from './components/Archive';
import Settings from './components/Settings';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'invoices', name: 'Invoices', icon: FileText },
    { id: 'clients', name: 'Clients', icon: Users },
    { id: 'saved-items', name: 'Saved Items', icon: Save },
    { id: 'archive', name: 'Archive', icon: Archive },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'invoices':
        return <InvoiceList />;
      case 'clients':
        return <ClientManagement />;
      case 'saved-items':
        return <SavedItems />;
      case 'archive':
        return <Archive />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">InvoicePro</h1>
          <p className="text-sm text-gray-500">Desktop Edition</p>
        </div>

        <nav className="px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t">
          <p className="text-xs text-gray-500 text-center">
            InvoicePro Desktop v1.0.0
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderView()}
      </div>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { ProjectProvider } from './context/ProjectContext';
import Header from './components/Header';
import ProjectList from './components/ProjectList';
import Sidebar from './components/Sidebar';
import { Menu, X } from 'lucide-react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <ProjectProvider>
        <div className="flex h-screen overflow-hidden">
          {/* Mobile sidebar toggle */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden fixed z-50 bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Sidebar */}
          <div
            className={`fixed lg:static inset-y-0 left-0 transform ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 transition-transform duration-300 ease-in-out z-30 w-64 bg-slate-800 border-r border-slate-700`}
          >
            <Sidebar onProjectClick={() => setIsSidebarOpen(false)} />
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto px-4 pb-16">
              <div className="container mx-auto">
                <ProjectList />
              </div>
            </main>
          </div>

          {/* Mobile overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>
      </ProjectProvider>
    </div>
  );
}

export default App;
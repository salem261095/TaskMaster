import React from 'react';
import { ClipboardList } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800 text-white py-4 px-4 border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto flex items-center">
        <div className="flex items-center gap-2">
          <ClipboardList size={28} className="text-blue-500" />
          <h1 className="text-xl font-bold">TaskMaster</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
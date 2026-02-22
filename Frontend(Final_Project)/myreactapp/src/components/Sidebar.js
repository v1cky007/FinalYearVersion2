import React from 'react';
import { NavLink } from 'react-router-dom';
import { Lock, Unlock, Home, ShieldCheck } from 'lucide-react';

const Sidebar = () => {
  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium mb-2 ${
      isActive 
        ? "bg-gray-800 text-white shadow-lg" 
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
    }`;

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col p-6 fixed left-0 top-0">
      
      {/* Logo Area */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-blue-600 p-2 rounded-lg">
          <ShieldCheck className="text-white" size={24} />
        </div>
        <div>
          <h1 className="font-bold text-gray-800 text-lg leading-tight">StegoSafe</h1>
          <p className="text-xs text-gray-400 font-medium">Quantum Phase 2</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu</p>
        
        <NavLink to="/" className={linkClasses}>
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/embed" className={linkClasses}>
          <Lock size={20} />
          <span>Embed Secret</span>
        </NavLink>

        <NavLink to="/extract" className={linkClasses}>
          <Unlock size={20} />
          <span>Extract Secret</span>
        </NavLink>
      </nav>

      {/* Footer User Info */}
      <div className="mt-auto pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            U
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">User</p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
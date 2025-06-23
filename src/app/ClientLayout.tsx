'use client'

import Sidebar from "./components/Sidebar";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="font-sans bg-gris-claro min-h-screen">
      <div className="min-h-screen flex">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Botón para mostrar/ocultar sidebar */}
            <button
              onClick={toggleSidebar}
              className={`fixed top-4 z-50 p-2 bg-morado-oscuro hover:bg-verde-claro text-negro rounded-lg shadow-lg transition-all duration-300 ${sidebarOpen ? 'left-64' : 'left-4'}`}
              aria-label={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
            >
              {sidebarOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 
// src/components/Layout/MainLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { authService } from '../../features/auth/authService';
import { Header } from './Header';
import type { User } from '../../types/auth';

export const MainLayout: React.FC = () => {
  // Mantenemos el estado del usuario aquí arriba por si otras partes del layout 
  // (como un futuro Sidebar) necesitan acceder a sus datos.
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());

  const handleUserUpdated = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header user={user} onUserUpdated={handleUserUpdated} />
      
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
};
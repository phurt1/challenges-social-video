import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { AuthForm } from '@/components/AuthForm';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';

const Index: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <AuthForm />;
  }

  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
};

export default Index;
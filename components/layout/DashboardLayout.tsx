'use client';

import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-bg)' }}>
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* Main content area */}
          <div style={{
            flex: 1,
            marginLeft: sidebarCollapsed ? 72 : 260,
            transition: 'margin-left 0.25s ease',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <TopNav />
            <main style={{ flex: 1, padding: '28px 28px', overflowY: 'auto' }}>
              {children}
            </main>
          </div>
        </div>
      </QueryClientProvider>
    </SessionProvider>
  );
}

// src/app/layout.tsx (Updated version)
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/spotlight/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/nprogress/styles.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexClientProvider } from '@/components/ConvexClientProvider';

export const metadata = {
  title: 'Swiss Order Management',
  description: 'Special reinforcement order management for Swiss construction',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <ColorSchemeScript />
        </head>
        <body>
          <ConvexClientProvider>
            <MantineProvider theme={{
              primaryColor: 'yellow',
              colors: {
                yellow: [
                  '#fff9db',
                  '#fff3bf',
                  '#ffec99',
                  '#ffe066',
                  '#ffd43b',
                  '#ffcc02',
                  '#e6b800',
                  '#cc9900',
                  '#b38600',
                  '#997300'
                ]
              }
            }}>
              <Notifications />
              <ModalsProvider>
                {children}
              </ModalsProvider>
            </MantineProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
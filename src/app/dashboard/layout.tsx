'use client';

import { ClerkProvider, UserButton, useUser } from '@clerk/nextjs';
import { AppShell, Burger, Group, Title, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHome, IconFileText, IconBuilding } from '@tabler/icons-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <Skeleton height="100vh" />;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3} c="yellow.6">Swiss Order Management</Title>
          </Group>
          <UserButton />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {/* We'll add the tree navigation here */}
        <div>Navigation coming soon...</div>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
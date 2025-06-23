// src/app/dashboard/layout.tsx
'use client';

import { useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { AppShell, Burger, Group, Title, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { TreeNavigation } from '@/components/TreeNavigation';
import { CreateCompanyModal } from '@/components/modals/CreateCompanyModal';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { CreateOrderModal } from '@/components/modals/CreateOrderModal';
import type { Id } from '@/convex/_generated/dataModel';

interface SelectedItem {
  type: 'company' | 'project' | 'order';
  id: Id<'companies'> | Id<'projects'> | Id<'orders'>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();
  const { isLoaded } = useUser();
  
  // Modal states
  const [companyModalOpened, { open: openCompanyModal, close: closeCompanyModal }] = useDisclosure(false);
  const [projectModalOpened, { open: openProjectModal, close: closeProjectModal }] = useDisclosure(false);
  const [orderModalOpened, { open: openOrderModal, close: closeOrderModal }] = useDisclosure(false);
  
  // Selection state
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [selectedCompanyForProject, setSelectedCompanyForProject] = useState<Id<'companies'> | null>(null);
  const [selectedProjectForOrder, setSelectedProjectForOrder] = useState<Id<'projects'> | null>(null);

  const handleCreateProject = (companyId: Id<'companies'>) => {
    setSelectedCompanyForProject(companyId);
    openProjectModal();
  };

  const handleCreateOrder = (projectId: Id<'projects'>) => {
    setSelectedProjectForOrder(projectId);
    openOrderModal();
  };

  if (!isLoaded) {
    return <Skeleton height="100vh" />;
  }

  return (
    <>
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

        <AppShell.Navbar>
          <TreeNavigation
            onSelect={setSelectedItem}
            onCreateCompany={openCompanyModal}
            onCreateProject={handleCreateProject}
            onCreateOrder={handleCreateOrder}
          />
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>

      {/* Modals */}
      <CreateCompanyModal
        opened={companyModalOpened}
        onClose={closeCompanyModal}
      />
      
      <CreateProjectModal
        opened={projectModalOpened}
        onClose={closeProjectModal}
        companyId={selectedCompanyForProject}
      />
      
      <CreateOrderModal
        opened={orderModalOpened}
        onClose={closeOrderModal}
        projectId={selectedProjectForOrder}
      />
    </>
  );
}
// src/app/dashboard/layout.tsx
'use client';

import { useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { AppShell, Burger, Group, Title, Skeleton, Tabs } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ProjectsNavigation } from '@/components/ProjectNavigation';
import { CompaniesNavigation } from '@/components/CompaniesNavigation';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { CreateOrderModal } from '@/components/modals/CreateOrderModal';
import { CreateCompanyModal } from '@/components/modals/CreateCompanyModal';
import { CompletePendingCompaniesModal } from '@/components/modals/CompletePendingCompaniesModal';
import { IconBuilding, IconFolder } from '@tabler/icons-react';
import type { Id } from '@/convex/_generated/dataModel';
import { useRouter, useSearchParams } from 'next/navigation';

interface SelectedItem {
  type: 'project' | 'order' | 'company';
  id: Id<'projects'> | Id<'orders'> | Id<'companies'>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();
  const { isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get active tab from URL or default to projects
  const activeTab = searchParams.get('tab') || 'projects';
  
  // Modal states
  const [projectModalOpened, { open: openProjectModal, close: closeProjectModal }] = useDisclosure(false);
  const [orderModalOpened, { open: openOrderModal, close: closeOrderModal }] = useDisclosure(false);
  const [companyModalOpened, { open: openCompanyModal, close: closeCompanyModal }] = useDisclosure(false);
  const [pendingCompaniesModalOpened, { open: openPendingCompaniesModal, close: closePendingCompaniesModal }] = useDisclosure(false);
  
  // Selection state - only keep what we actually need
  const [selectedProjectForOrder, setSelectedProjectForOrder] = useState<Id<'projects'> | null>(null);
  const [selectedProjectForPending, setSelectedProjectForPending] = useState<Id<'projects'> | null>(null);

  // Simple selection handler that doesn't store the selection (since we don't use it)
  const handleItemSelect = (item: SelectedItem) => {
    // Navigation components expect an onSelect callback, but we don't need to store the selection
    console.log('Item selected:', item);
  };

  const handleTabChange = (value: string | null) => {
    if (value) {
      router.push(`/dashboard?tab=${value}`);
    }
  };

  const handleCreateOrder = (projectId: Id<'projects'>) => {
    setSelectedProjectForOrder(projectId);
    openOrderModal();
  };

  const handleProjectCreatedWithPending = (projectId: Id<'projects'>) => {
    setSelectedProjectForPending(projectId);
    openPendingCompaniesModal();
  };

  if (!isLoaded) {
    return <Skeleton height="100vh" />;
  }

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 320,
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
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            orientation="horizontal"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Tabs.List grow>
              <Tabs.Tab value="projects" leftSection={<IconFolder size={16} />}>
                Projects
              </Tabs.Tab>
              <Tabs.Tab value="companies" leftSection={<IconBuilding size={16} />}>
                Companies
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="projects" style={{ flex: 1, overflow: 'auto' }}>
              <ProjectsNavigation
                onSelect={handleItemSelect}
                onCreateProject={openProjectModal}
                onCreateOrder={handleCreateOrder}
                onCompletePending={handleProjectCreatedWithPending}
              />
            </Tabs.Panel>

            <Tabs.Panel value="companies" style={{ flex: 1, overflow: 'auto' }}>
              <CompaniesNavigation
                onSelect={handleItemSelect}
                onCreateCompany={openCompanyModal}
              />
            </Tabs.Panel>
          </Tabs>
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>

      {/* Modals */}
      <CreateProjectModal
        opened={projectModalOpened}
        onClose={closeProjectModal}
        onProjectCreatedWithPending={handleProjectCreatedWithPending}
      />
      
      <CreateOrderModal
        opened={orderModalOpened}
        onClose={closeOrderModal}
        projectId={selectedProjectForOrder}
      />
      
      <CreateCompanyModal
        opened={companyModalOpened}
        onClose={closeCompanyModal}
      />

      <CompletePendingCompaniesModal
        opened={pendingCompaniesModalOpened}
        onClose={closePendingCompaniesModal}
        projectId={selectedProjectForPending}
      />
    </>
  );
}
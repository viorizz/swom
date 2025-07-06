// src/app/dashboard/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Container, Title, Text, Stack, Card, Group, Badge, Button, Grid, Box, Skeleton } from '@mantine/core';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { IconFolder, IconUsers, IconPlus, IconCalendar } from '@tabler/icons-react';
import { CompaniesManagement } from '@/components/CompaniesManagement';

import { PartsNavigation } from '@/components/PartsNavigation';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';

// Projects Dashboard Component
function ProjectsDashboard() {
  const { user } = useUser();
  const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects"> | null>(null);
  
  const projects = useQuery(
    api.navigation.getNavigationTree,
    user?.id ? { tenantId: user.id } : 'skip'
  );

  if (projects === undefined) {
    return (
      <Container>
        <Stack gap="md">
          <Title order={2}>Projects</Title>
          <Text>Loading projects...</Text>
        </Stack>
      </Container>
    );
  }

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    planningProjects: projects.filter(p => p.status === 'planning').length,
    totalOrders: projects.reduce((sum, p) => sum + p.orders.length, 0),
  };

  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Title order={2}>Projects Dashboard</Title>
          <Button leftSection={<IconPlus size={16} />} color="yellow">
            Create Project
          </Button>
        </Group>

        {/* Stats Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">Total Projects</Text>
                  <Text size="xl" fw={700}>{stats.totalProjects}</Text>
                </div>
                <IconFolder size={32} color="var(--mantine-color-blue-6)" />
              </Group>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">Active Projects</Text>
                  <Text size="xl" fw={700}>{stats.activeProjects}</Text>
                </div>
                <IconCalendar size={32} color="var(--mantine-color-green-6)" />
              </Group>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">Planning</Text>
                  <Text size="xl" fw={700}>{stats.planningProjects}</Text>
                </div>
                <IconUsers size={32} color="var(--mantine-color-orange-6)" />
              </Group>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">Total Orders</Text>
                  <Text size="xl" fw={700}>{stats.totalOrders}</Text>
                </div>
                <IconFolder size={32} color="var(--mantine-color-purple-6)" />
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Recent Projects */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">Recent Projects</Title>
          {projects.length === 0 ? (
            <Stack align="center" gap="md" py="xl">
              <IconFolder size={48} color="var(--mantine-color-gray-5)" />
              <Text size="lg" c="dimmed">No projects yet</Text>
              <Text size="sm" c="dimmed" ta="center">
                Create your first project to get started with order management
              </Text>
              <Button leftSection={<IconPlus size={16} />} color="yellow">
                Create Project
              </Button>
            </Stack>
          ) : (
            <Stack gap="sm">
              {projects.slice(0, 5).map((project) => {
                const companyNames = [
                  project.companies.masonry?.name,
                  project.companies.architect?.name,
                  project.companies.engineer?.name,
                  project.companies.client?.name,
                ].filter(Boolean);

                return (
                  <Group key={project._id} justify="space-between" p="md" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 8, cursor: 'pointer' }} onClick={() => setSelectedProjectId(project._id)}>
                    <Box>
                      <Group gap="sm">
                        <IconFolder size={20} color="var(--mantine-color-blue-6)" />
                        <Text fw={500}>{project.name}</Text>
                        <Badge size="sm" variant="light">#{project.number}</Badge>
                      </Group>
                      {companyNames.length > 0 && (
                        <Text size="sm" c="dimmed" mt="xs">
                          Companies: {companyNames.join(', ')}
                        </Text>
                      )}
                    </Box>
                    <Group gap="xs">
                      <Badge 
                        size="sm" 
                        color={project.status === 'active' ? 'green' : project.status === 'planning' ? 'yellow' : 'gray'}
                      >
                        {project.status}
                      </Badge>
                      <Badge size="sm" variant="light" color="blue">
                        {project.orders.length} orders
                      </Badge>
                    </Group>
                  </Group>
                );
              })}
              
              {projects.length > 5 && (
                <Text size="sm" c="dimmed" ta="center" mt="md">
                  And {projects.length - 5} more projects...
                </Text>
              )}
            </Stack>
          )}
        </Card>

        {selectedProjectId && <PartsNavigation projectId={selectedProjectId} />}
      </Stack>
    </Container>
  );
}

// Companies Dashboard Component  
function CompaniesDashboard() {
  return <CompaniesManagement />;
}

// Dashboard Content Component that uses useSearchParams
function DashboardContent() {
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useUser();
  
  const activeTab = searchParams.get('tab') || 'projects';

  if (!isLoaded) {
    return (
      <Container>
        <Skeleton height={200} />
      </Container>
    );
  }

  if (!isSignedIn) {
    return (
      <Container>
        <Text>Please sign in</Text>
      </Container>
    );
  }

  return activeTab === 'companies' ? <CompaniesDashboard /> : <ProjectsDashboard />;
}

// Main Dashboard Page with Suspense boundary
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <Container>
        <Stack gap="md">
          <Skeleton height={40} />
          <Grid>
            <Grid.Col span={3}><Skeleton height={120} /></Grid.Col>
            <Grid.Col span={3}><Skeleton height={120} /></Grid.Col>
            <Grid.Col span={3}><Skeleton height={120} /></Grid.Col>
            <Grid.Col span={3}><Skeleton height={120} /></Grid.Col>
          </Grid>
          <Skeleton height={300} />
        </Stack>
      </Container>
    }>
      <DashboardContent />
    </Suspense>
  );
}
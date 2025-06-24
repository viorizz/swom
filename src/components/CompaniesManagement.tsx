// src/components/CompaniesManagement.tsx
'use client';

import { useState } from 'react';
import {
  Container,
  Title,
  Button,
  Stack,
  Group,
  Card,
  Text,
  Badge,
  ActionIcon,
  Select,
  TextInput,
  Grid,
  Loader,
  Modal,
  Divider,
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconBuilding,
  IconSearch,
  IconEye,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { notifications } from '@mantine/notifications';
import { CreateCompanyModal } from '@/components/modals/CreateCompanyModal';
import { EditCompanyModal } from '@/components/modals/EditCompanyModal';
import type { Id } from '@/convex/_generated/dataModel';

const COMPANY_TYPES = [
  { value: 'masonry', label: 'Masonry', color: 'blue', icon: '🧱' },
  { value: 'architect', label: 'Architect', color: 'green', icon: '📐' },
  { value: 'engineer', label: 'Engineer', color: 'orange', icon: '⚙️' },
  { value: 'client', label: 'Client', color: 'purple', icon: '👤' },
] as const;

export function CompaniesManagement() {
  const { user } = useUser();
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingCompany, setViewingCompany] = useState<Id<'companies'> | null>(null);
  
  // Modal states
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);
  const [editingCompany, setEditingCompany] = useState<Id<'companies'> | null>(null);

  // Fetch companies and delete mutation
  const companies = useQuery(
    api.companies.listByTenant,
    user?.id ? { tenantId: user.id } : 'skip'
  );
  
  const deleteCompany = useMutation(api.companies.remove);

  const handleEdit = (companyId: Id<'companies'>) => {
    setEditingCompany(companyId);
    openEditModal();
  };

  const handleView = (companyId: Id<'companies'>) => {
    setViewingCompany(companyId);
    openViewModal();
  };

  const handleDelete = async (companyId: Id<'companies'>) => {
    if (confirm('Are you sure you want to delete this company?')) {
      try {
        await deleteCompany({ id: companyId });
        notifications.show({
          title: 'Success',
          message: 'Company deleted successfully',
          color: 'green',
        });
      } catch (error: unknown) {
        console.error('Failed to delete company:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to delete company',
          color: 'red',
        });
      }
    }
  };

  const handleCloseEdit = () => {
    setEditingCompany(null);
    closeEditModal();
  };

  const handleCloseView = () => {
    setViewingCompany(null);
    closeViewModal();
  };

  if (companies === undefined) {
    return (
      <Container>
        <Group gap="sm">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">Loading companies...</Text>
        </Group>
      </Container>
    );
  }

  // Filter companies based on type and search term
  const filteredCompanies = companies.filter(company => {
    const matchesType = !selectedType || company.type === selectedType;
    const matchesSearch = !searchTerm || 
      company.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Group companies by type for display
  const companiesByType = filteredCompanies.reduce((acc, company) => {
    if (!acc[company.type]) {
      acc[company.type] = [];
    }
    acc[company.type].push(company);
    return acc;
  }, {} as Record<string, typeof companies>);

  const stats = {
    total: companies.length,
    masonry: companies.filter(c => c.type === 'masonry').length,
    architect: companies.filter(c => c.type === 'architect').length,
    engineer: companies.filter(c => c.type === 'engineer').length,
    client: companies.filter(c => c.type === 'client').length,
  };

  const viewingCompanyData = viewingCompany ? companies.find(c => c._id === viewingCompany) : null;

  return (
    <>
      <Container size="xl">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between">
            <div>
              <Title order={2}>Companies Management</Title>
              <Text size="sm" c="dimmed">
                Manage all companies involved in your projects
              </Text>
            </div>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={openCreateModal}
              color="yellow"
            >
              Add Company
            </Button>
          </Group>

          {/* Stats Cards */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" c="dimmed">Total</Text>
                    <Text size="xl" fw={700}>{stats.total}</Text>
                  </div>
                  <IconBuilding size={32} color="var(--mantine-color-gray-6)" />
                </Group>
              </Card>
            </Grid.Col>
            {COMPANY_TYPES.map((type) => (
              <Grid.Col key={type.value} span={{ base: 12, sm: 6, md: 2.4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">{type.label}</Text>
                      <Text size="xl" fw={700}>{stats[type.value as keyof typeof stats]}</Text>
                    </div>
                    <Text size="xl">{type.icon}</Text>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>

          {/* Filters */}
          <Card>
            <Group>
              <Select
                placeholder="Filter by type"
                data={[
                  { value: '', label: 'All Types' },
                  ...COMPANY_TYPES.map(type => ({ value: type.value, label: type.label }))
                ]}
                value={selectedType}
                onChange={(value) => setSelectedType(value || '')}
                clearable
              />
              <TextInput
                placeholder="Search companies..."
                leftSection={<IconSearch size={16} />}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
            </Group>
          </Card>

          {/* Companies List */}
          {Object.keys(companiesByType).length === 0 ? (
            <Card>
              <Stack align="center" gap="md" py="xl">
                <IconBuilding size={48} color="var(--mantine-color-gray-5)" />
                <Text size="lg" c="dimmed">No companies found</Text>
                <Text size="sm" c="dimmed" ta="center">
                  {companies.length === 0 
                    ? "Get started by creating your first company"
                    : "Try adjusting your filters"
                  }
                </Text>
              </Stack>
            </Card>
          ) : (
            <Stack gap="md">
              {COMPANY_TYPES.map(typeInfo => {
                const typeCompanies = companiesByType[typeInfo.value] || [];
                if (typeCompanies.length === 0) return null;

                return (
                  <Card key={typeInfo.value} withBorder>
                    <Group mb="md">
                      <Text size="lg">{typeInfo.icon}</Text>
                      <Title order={4}>{typeInfo.label} Companies</Title>
                      <Badge color={typeInfo.color} size="lg">
                        {typeCompanies.length}
                      </Badge>
                    </Group>
                    
                    <Grid>
                      {typeCompanies.map((company) => (
                        <Grid.Col key={company._id} span={{ base: 12, sm: 6, md: 4 }}>
                          <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group justify="space-between" mb="xs">
                              <Text fw={500} size="lg" truncate>
                                {company.name}
                              </Text>
                              <Group gap="xs">
                                <ActionIcon
                                  variant="light"
                                  color="blue"
                                  onClick={() => handleView(company._id)}
                                >
                                  <IconEye size={16} />
                                </ActionIcon>
                                <ActionIcon
                                  variant="light"
                                  color="green"
                                  onClick={() => handleEdit(company._id)}
                                >
                                  <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon 
                                  variant="light" 
                                  color="red"
                                  onClick={() => handleDelete(company._id)}
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Group>
                            </Group>

                            <Stack gap="xs">
                              {company.address && (
                                <Text size="sm" c="dimmed">
                                  📍 {company.address}
                                </Text>
                              )}
                              {company.phone && (
                                <Text size="sm" c="dimmed">
                                  📞 {company.phone}
                                </Text>
                              )}
                              {company.email && (
                                <Text size="sm" c="dimmed">
                                  ✉️ {company.email}
                                </Text>
                              )}
                              {!company.address && !company.phone && !company.email && (
                                <Text size="sm" c="dimmed" fs="italic">
                                  No additional details
                                </Text>
                              )}
                            </Stack>
                          </Card>
                        </Grid.Col>
                      ))}
                    </Grid>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Container>

      {/* Modals */}
      <CreateCompanyModal
        opened={createModalOpened}
        onClose={closeCreateModal}
      />
      
      {editingCompany && (
        <EditCompanyModal
          opened={editModalOpened}
          onClose={handleCloseEdit}
          companyId={editingCompany}
        />
      )}

      {/* View Company Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={handleCloseView}
        title="Company Details"
        size="md"
      >
        {viewingCompanyData && (
          <Stack gap="md">
            <Group>
              <Text size="xl">
                {COMPANY_TYPES.find(t => t.value === viewingCompanyData.type)?.icon}
              </Text>
              <div>
                <Title order={3}>{viewingCompanyData.name}</Title>
                <Badge color={COMPANY_TYPES.find(t => t.value === viewingCompanyData.type)?.color}>
                  {viewingCompanyData.type.charAt(0).toUpperCase() + viewingCompanyData.type.slice(1)}
                </Badge>
              </div>
            </Group>

            <Divider />

            <Stack gap="sm">
              {viewingCompanyData.address && (
                <Group>
                  <Text fw={500} w={80}>Address:</Text>
                  <Text>{viewingCompanyData.address}</Text>
                </Group>
              )}
              {viewingCompanyData.phone && (
                <Group>
                  <Text fw={500} w={80}>Phone:</Text>
                  <Text>{viewingCompanyData.phone}</Text>
                </Group>
              )}
              {viewingCompanyData.email && (
                <Group>
                  <Text fw={500} w={80}>Email:</Text>
                  <Text>{viewingCompanyData.email}</Text>
                </Group>
              )}
              {!viewingCompanyData.address && !viewingCompanyData.phone && !viewingCompanyData.email && (
                <Text c="dimmed" fs="italic">
                  No additional contact information available
                </Text>
              )}
            </Stack>

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={handleCloseView}>
                Close
              </Button>
              <Button 
                color="yellow" 
                onClick={() => {
                  handleCloseView();
                  handleEdit(viewingCompanyData._id);
                }}
              >
                Edit Company
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
}
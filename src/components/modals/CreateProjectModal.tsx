// src/components/modals/CreateProjectModal.tsx
'use client';

import { Modal, TextInput, Button, Stack, Group, Select, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import type { Id } from '@/convex/_generated/dataModel';

// Define proper interfaces to replace 'any' types
interface Company {
  _id: Id<'companies'>;
  name: string;
  type: 'masonry' | 'architect' | 'engineer' | 'client';
}

interface CreateProjectModalProps {
  opened: boolean;
  onClose: () => void;
  onProjectCreatedWithPending?: (projectId: Id<'projects'>) => void;
}

export function CreateProjectModal({ opened, onClose, onProjectCreatedWithPending }: CreateProjectModalProps) {
  const { user } = useUser();
  const createProjectWithNewCompanies = useMutation(api.projects.createWithNewCompanies);
  
  // Fetch companies by type with proper typing
  const masonryCompanies = useQuery(
    api.companies.listByTenantAndType,
    user?.id ? { tenantId: user.id, type: 'masonry' } : 'skip'
  ) as Company[] | undefined;
  
  const architectCompanies = useQuery(
    api.companies.listByTenantAndType,
    user?.id ? { tenantId: user.id, type: 'architect' } : 'skip'
  ) as Company[] | undefined;
  
  const engineerCompanies = useQuery(
    api.companies.listByTenantAndType,
    user?.id ? { tenantId: user.id, type: 'engineer' } : 'skip'
  ) as Company[] | undefined;
  
  const clientCompanies = useQuery(
    api.companies.listByTenantAndType,
    user?.id ? { tenantId: user.id, type: 'client' } : 'skip'
  ) as Company[] | undefined;

  const form = useForm({
    initialValues: {
      name: '',
      number: '',
      description: '',
      startDate: '',
      endDate: '',
      masonryCompany: '',
      architectCompany: '',
      engineerCompany: '',
      clientCompany: '',
    },
    validate: {
      name: (value: string) => value.length < 2 ? 'Project name must be at least 2 characters' : null,
      number: (value: string) => value.length < 1 ? 'Project number is required' : null,
    },
  });

  // Create select data for company dropdowns with proper typing
  const createSelectData = (companies: Company[] = []) => {
    return companies.map((company) => ({
      value: company._id,
      label: company.name,
    }));
  };

  const masonrySelectData = createSelectData(masonryCompanies);
  const architectSelectData = createSelectData(architectCompanies);
  const engineerSelectData = createSelectData(engineerCompanies);
  const clientSelectData = createSelectData(clientCompanies);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      // Determine if each company selection is new or existing with proper typing
      const getCompanyValue = (selectedValue: string, companies: Company[] = []): string | undefined => {
        if (!selectedValue) return undefined;
        
        const existingCompany = companies.find((c) => c._id === selectedValue);
        if (existingCompany) {
          return existingCompany._id; // Return ID for existing company
        } else {
          return selectedValue; // Return name for new company
        }
      };

      const projectData = {
        name: values.name,
        number: values.number,
        description: values.description || undefined,
        companies: {
          masonry: getCompanyValue(values.masonryCompany, masonryCompanies),
          architect: getCompanyValue(values.architectCompany, architectCompanies),
          engineer: getCompanyValue(values.engineerCompany, engineerCompanies),
          client: getCompanyValue(values.clientCompany, clientCompanies),
        },
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        tenantId: user?.id || 'default',
      };

      const result = await createProjectWithNewCompanies(projectData);
      
      let message = 'Project created successfully';
      if (result.pendingCompanies.length > 0) {
        message += `. You'll need to complete details for ${result.pendingCompanies.length} new companies.`;
        
        // Trigger pending companies modal after a short delay
        setTimeout(() => {
          onProjectCreatedWithPending?.(result.projectId);
        }, 500);
      }

      notifications.show({
        title: 'Success',
        message,
        color: 'green',
      });
      
      form.reset();
      onClose();
    } catch (error: unknown) {
      console.error('Failed to create project:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create project',
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New Project"
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Basic Information */}
          <Group grow>
            <TextInput
              label="Project Name"
              placeholder="Enter project name"
              required
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Project Number"
              placeholder="Enter project number"
              required
              {...form.getInputProps('number')}
            />
          </Group>

          <Textarea
            label="Description"
            placeholder="Project description (optional)"
            rows={3}
            {...form.getInputProps('description')}
          />

          {/* Company Assignments */}
          <Stack gap="sm">
            <Group grow>
              <Select
                label="Masonry Company"
                placeholder="Select masonry company or type new name"
                data={masonrySelectData}
                searchable
                allowDeselect
                {...form.getInputProps('masonryCompany')}
              />
              
              <Select
                label="Architecture Firm"
                placeholder="Select architecture firm or type new name"
                data={architectSelectData}
                searchable
                allowDeselect
                {...form.getInputProps('architectCompany')}
              />
            </Group>

            <Group grow>
              <Select
                label="Engineering Company"
                placeholder="Select engineering company or type new name"
                data={engineerSelectData}
                searchable
                allowDeselect
                {...form.getInputProps('engineerCompany')}
              />
              
              <Select
                label="Client"
                placeholder="Select client or type new name"
                data={clientSelectData}
                searchable
                allowDeselect
                {...form.getInputProps('clientCompany')}
              />
            </Group>
          </Stack>

          {/* Dates */}
          <Group grow>
            <TextInput
              label="Start Date"
              placeholder="YYYY-MM-DD"
              type="date"
              {...form.getInputProps('startDate')}
            />
            <TextInput
              label="End Date"
              placeholder="YYYY-MM-DD"
              type="date"
              {...form.getInputProps('endDate')}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" color="yellow">
              Create Project
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
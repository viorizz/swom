// src/components/modals/CreateCompanyModal.tsx
'use client';

import { Modal, TextInput, Button, Stack, Group, Fieldset } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';

interface CreateCompanyModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateCompanyModal({ opened, onClose }: CreateCompanyModalProps) {
  const { user } = useUser();
  const createCompany = useMutation(api.companies.create);

  const form = useForm({
    initialValues: {
      name: '',
      engineeringCompany: {
        name: '',
        address: '',
        phone: '',
      },
      masonryCompany: {
        name: '',
        address: '',
        phone: '',
      },
      defaultInitials: {
        designer: '',
        engineer: '',
      },
    },
    validate: {
      name: (value) => value.length < 2 ? 'Company name must be at least 2 characters' : null,
      'engineeringCompany.name': (value) => value.length < 2 ? 'Engineering company name is required' : null,
      'masonryCompany.name': (value) => value.length < 2 ? 'Masonry company name is required' : null,
      'defaultInitials.designer': (value) => value.length < 1 ? 'Designer initials are required' : null,
      'defaultInitials.engineer': (value) => value.length < 1 ? 'Engineer initials are required' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await createCompany({
        ...values,
        tenantId: user?.id || 'default', // Use Clerk user ID as tenant ID
      });
      
      notifications.show({
        title: 'Success',
        message: 'Company created successfully',
        color: 'green',
      });
      
      form.reset();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create company',
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New Company"
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Company Name"
            placeholder="Enter company name"
            required
            {...form.getInputProps('name')}
          />

          <Fieldset legend="Engineering Company">
            <Stack gap="sm">
              <TextInput
                label="Name"
                placeholder="Engineering company name"
                required
                {...form.getInputProps('engineeringCompany.name')}
              />
              <TextInput
                label="Address"
                placeholder="Company address"
                {...form.getInputProps('engineeringCompany.address')}
              />
              <TextInput
                label="Phone"
                placeholder="Phone number"
                {...form.getInputProps('engineeringCompany.phone')}
              />
            </Stack>
          </Fieldset>

          <Fieldset legend="Masonry Company">
            <Stack gap="sm">
              <TextInput
                label="Name"
                placeholder="Masonry company name"
                required
                {...form.getInputProps('masonryCompany.name')}
              />
              <TextInput
                label="Address"
                placeholder="Company address"
                {...form.getInputProps('masonryCompany.address')}
              />
              <TextInput
                label="Phone"
                placeholder="Phone number"
                {...form.getInputProps('masonryCompany.phone')}
              />
            </Stack>
          </Fieldset>

          <Fieldset legend="Default Initials">
            <Group grow>
              <TextInput
                label="Designer"
                placeholder="e.g., JD"
                required
                {...form.getInputProps('defaultInitials.designer')}
              />
              <TextInput
                label="Engineer"
                placeholder="e.g., MS"
                required
                {...form.getInputProps('defaultInitials.engineer')}
              />
            </Group>
          </Fieldset>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" color="yellow">
              Create Company
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
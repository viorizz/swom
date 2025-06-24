// src/components/modals/CreateCompanyModal.tsx
'use client';

import { Modal, TextInput, Button, Stack, Group, Select } from '@mantine/core';
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
      type: '',
      address: '',
      phone: '',
      email: '',
    },
    validate: {
      name: (value: string) => value.length < 2 ? 'Company name must be at least 2 characters' : null,
      type: (value: string) => !value ? 'Company type is required' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      // Validate that type is one of the expected values
      const validTypes = ['masonry', 'architect', 'engineer', 'client'] as const;
      if (!validTypes.includes(values.type as typeof validTypes[number])) {
        notifications.show({
          title: 'Error',
          message: 'Please select a valid company type',
          color: 'red',
        });
        return;
      }

      await createCompany({
        name: values.name,
        type: values.type as 'masonry' | 'architect' | 'engineer' | 'client',
        address: values.address || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        tenantId: user?.id || 'default',
      });
      
      notifications.show({
        title: 'Success',
        message: 'Company created successfully',
        color: 'green',
      });
      
      form.reset();
      onClose();
    } catch (error: unknown) {
      console.error('Failed to create company:', error);
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

          <Select
            label="Company Type"
            placeholder="Select company type"
            required
            data={[
              { value: 'masonry', label: 'Masonry Company' },
              { value: 'architect', label: 'Architecture Firm' },
              { value: 'engineer', label: 'Engineering Company' },
              { value: 'client', label: 'Client/Owner' },
            ]}
            {...form.getInputProps('type')}
          />

          <TextInput
            label="Address"
            placeholder="Company address (optional)"
            {...form.getInputProps('address')}
          />

          <Group grow>
            <TextInput
              label="Phone"
              placeholder="Phone number (optional)"
              {...form.getInputProps('phone')}
            />
            <TextInput
              label="Email"
              placeholder="Email address (optional)"
              type="email"
              {...form.getInputProps('email')}
            />
          </Group>

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
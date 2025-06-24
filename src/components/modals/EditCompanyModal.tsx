// src/components/modals/EditCompanyModal.tsx
'use client';

import { Modal, TextInput, Button, Stack, Group, Select, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect } from 'react';
import type { Id } from '@/convex/_generated/dataModel';

interface EditCompanyModalProps {
  opened: boolean;
  onClose: () => void;
  companyId: Id<'companies'>;
}

export function EditCompanyModal({ opened, onClose, companyId }: EditCompanyModalProps) {
  const updateCompany = useMutation(api.companies.update);
  const company = useQuery(api.companies.get, { id: companyId });

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

  // Update form when company data loads
  useEffect(() => {
    if (company) {
      form.setValues({
        name: company.name,
        type: company.type,
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
      });
    }
  }, [company, form]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await updateCompany({
        id: companyId,
        name: values.name,
        type: values.type as any,
        address: values.address || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
      });
      
      notifications.show({
        title: 'Success',
        message: 'Company updated successfully',
        color: 'green',
      });
      
      onClose();
    } catch (error: unknown) {
      console.error('Failed to update company:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update company',
        color: 'red',
      });
    }
  };

  if (!company) {
    return (
      <Modal opened={opened} onClose={onClose} title="Edit Company" size="md">
        <Group gap="sm" justify="center" py="md">
          <Loader size="sm" />
          Loading company details...
        </Group>
      </Modal>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Company"
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
            placeholder="Company address"
            {...form.getInputProps('address')}
          />

          <Group grow>
            <TextInput
              label="Phone"
              placeholder="Phone number"
              {...form.getInputProps('phone')}
            />
            <TextInput
              label="Email"
              placeholder="Email address"
              type="email"
              {...form.getInputProps('email')}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" color="yellow">
              Update Company
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
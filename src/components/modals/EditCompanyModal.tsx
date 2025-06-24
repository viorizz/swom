// src/components/modals/EditCompanyModal.tsx
'use client';

import { Modal, TextInput, Button, Stack, Group, Select, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect, useCallback } from 'react';
import type { Id } from '@/convex/_generated/dataModel';

// Define proper interface for Company to replace 'any' type
interface Company {
  _id: Id<'companies'>;
  name: string;
  type: 'masonry' | 'architect' | 'engineer' | 'client';
  address?: string;
  phone?: string;
  email?: string;
}

// Define the form values type
interface FormValues {
  name: string;
  type: string;
  address: string;
  phone: string;
  email: string;
}

interface EditCompanyModalProps {
  opened: boolean;
  onClose: () => void;
  companyId: Id<'companies'>;
}

export function EditCompanyModal({ opened, onClose, companyId }: EditCompanyModalProps) {
  const updateCompany = useMutation(api.companies.update);
  const company = useQuery(api.companies.get, { id: companyId }) as Company | null | undefined;

  const form = useForm<FormValues>({
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

  // Create a memoized callback to update form values
  const updateFormValues = useCallback((companyData: Company) => {
    form.setValues({
      name: companyData.name,
      type: companyData.type,
      address: companyData.address || '',
      phone: companyData.phone || '',
      email: companyData.email || '',
    });
  }, [form]);

  // Update form when company data loads - fixed dependency issue
  useEffect(() => {
    if (company) {
      updateFormValues(company);
    }
  }, [company, updateFormValues]);

  const handleSubmit = async (values: FormValues) => {
    try {
      // Validate that type is one of the expected values
      const validTypes = ['masonry', 'architect', 'engineer', 'client'] as const;
      if (!validTypes.includes(values.type as typeof validTypes[number])) {
        notifications.show({
          title: 'Error',
          message: 'Invalid company type selected',
          color: 'red',
        });
        return;
      }

      const companyType = values.type as 'masonry' | 'architect' | 'engineer' | 'client';
      
      await updateCompany({
        id: companyId,
        name: values.name,
        type: companyType,
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
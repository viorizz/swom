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
      name: (value: string) => value.length < 2 ? 'Company name must be at least 2 characters' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    // Manual validation for nested fields
    if (!values.engineeringCompany.name || values.engineeringCompany.name.length < 2) {
      form.setFieldError('engineeringCompany.name', 'Engineering company name is required');
      return;
    }
    if (!values.masonryCompany.name || values.masonryCompany.name.length < 2) {
      form.setFieldError('masonryCompany.name', 'Masonry company name is required');
      return;
    }
    if (!values.defaultInitials.designer || values.defaultInitials.designer.length < 1) {
      form.setFieldError('defaultInitials.designer', 'Designer initials are required');
      return;
    }
    if (!values.defaultInitials.engineer || values.defaultInitials.engineer.length < 1) {
      form.setFieldError('defaultInitials.engineer', 'Engineer initials are required');
      return;
    }

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

          <Fieldset legend="Engineering Company">
            <Stack gap="sm">
              <TextInput
                label="Name"
                placeholder="Engineering company name"
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
                {...form.getInputProps('defaultInitials.designer')}
              />
              <TextInput
                label="Engineer"
                placeholder="e.g., MS"
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
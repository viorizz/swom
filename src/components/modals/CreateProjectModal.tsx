'use client';

import { Modal, TextInput, Button, Stack, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import type { Id } from '@/convex/_generated/dataModel';

interface CreateProjectModalProps {
  opened: boolean;
  onClose: () => void;
  companyId: Id<'companies'> | null;
}

export function CreateProjectModal({ opened, onClose, companyId }: CreateProjectModalProps) {
  const { user } = useUser();
  const createProject = useMutation(api.projects.create);

  const form = useForm({
    initialValues: {
      name: '',
      number: '',
    },
    validate: {
      name: (value: string) => value.length < 2 ? 'Project name must be at least 2 characters' : null,
      number: (value: string) => value.length < 1 ? 'Project number is required' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!companyId) {
      notifications.show({
        title: 'Error',
        message: 'No company selected',
        color: 'red',
      });
      return;
    }

    try {
      await createProject({
        ...values,
        companyId,
        tenantId: user?.id || 'default',
      });
      
      notifications.show({
        title: 'Success',
        message: 'Project created successfully',
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
      size="sm"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
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
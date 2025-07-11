'use client';

import { Modal, TextInput, Button, Stack, Group, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import type { Id } from '@/convex/_generated/dataModel';

interface CreateOrderModalProps {
  opened: boolean;
  onClose: () => void;
  projectId: Id<'projects'> | null;
  partId: Id<'parts'> | null;
}

export function CreateOrderModal({ opened, onClose, projectId, partId }: CreateOrderModalProps) {
  const { user } = useUser();
  const createOrder = useMutation(api.orders.create);
  const project = useQuery(api.projects.get, projectId ? { id: projectId } : 'skip');
  const parts = useQuery(api.parts.getPartsForProject, projectId ? { projectId } : 'skip');

  const form = useForm({
    initialValues: {
      partId: partId || '',
      draftName: '',
      draftNumber: '',
      orderNumber: '',
      manufacturerId: 'halfen', // Default manufacturer
      templateName: 'standard',
      designerInitials: '',
      engineerInitials: '',
    },
    validate: {
      draftName: (value: string) => value.length < 2 ? 'Draft name must be at least 2 characters' : null,
      draftNumber: (value: string) => value.length < 1 ? 'Draft number is required' : null,
      orderNumber: (value: string) => value.length < 1 ? 'Order number is required' : null,
      designerInitials: (value: string) => value.length < 1 ? 'Designer initials are required' : null,
      engineerInitials: (value: string) => value.length < 1 ? 'Engineer initials are required' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!values.partId || !project) {
      notifications.show({
        title: 'Error',
        message: 'No part selected',
        color: 'red',
      });
      return;
    }

    try {
      await createOrder({
        partId: values.partId as Id<"parts">,
        draftName: values.draftName,
        draftNumber: values.draftNumber,
        orderNumber: values.orderNumber,
        manufacturerId: values.manufacturerId,
        templateName: values.templateName,
        metadata: {
          projectName: project.name,
          projectNumber: project.number,
          designerInitials: values.designerInitials,
          engineerInitials: values.engineerInitials,
        },
        status: 'draft',
        tenantId: user?.id || 'default',
      });
      
      notifications.show({
        title: 'Success',
        message: 'Order created successfully',
        color: 'green',
      });
      
      form.reset();
      onClose();
    } catch (error: unknown) {
      console.error('Failed to create order:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create order',
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New Order"
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            label="Part"
            placeholder="Select a part"
            data={parts?.map(part => ({ value: part._id, label: part.name })) || []}
            required
            {...form.getInputProps('partId')}
          />
          <TextInput
            label="Draft Name"
            placeholder="Enter draft name"
            required
            {...form.getInputProps('draftName')}
          />
          
          <Group grow>
            <TextInput
              label="Draft Number"
              placeholder="Draft number"
              required
              {...form.getInputProps('draftNumber')}
            />
            <TextInput
              label="Order Number"
              placeholder="Order number"
              required
              {...form.getInputProps('orderNumber')}
            />
          </Group>

          <Select
            label="Manufacturer"
            placeholder="Select manufacturer"
            data={[
              { value: 'halfen', label: 'Halfen' },
              { value: 'peikko', label: 'Peikko' },
              { value: 'ancon', label: 'Ancon' },
            ]}
            required
            {...form.getInputProps('manufacturerId')}
          />

          <Select
            label="Template"
            placeholder="Select template"
            data={[
              { value: 'standard', label: 'Standard Template' },
              { value: 'advanced', label: 'Advanced Template' },
            ]}
            required
            {...form.getInputProps('templateName')}
          />

          <Group grow>
            <TextInput
              label="Designer Initials"
              placeholder="e.g., JD"
              required
              {...form.getInputProps('designerInitials')}
            />
            <TextInput
              label="Engineer Initials"
              placeholder="e.g., MS"
              required
              {...form.getInputProps('engineerInitials')}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" color="yellow">
              Create Order
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
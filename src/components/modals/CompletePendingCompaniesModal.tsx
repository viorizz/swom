// src/components/modals/CompletePendingCompaniesModal.tsx
'use client';

import { 
  Modal, 
  TextInput, 
  Button, 
  Stack, 
  Group, 
  Card, 
  Text, 
  Badge,
  Divider,
  Title,
  Alert
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';
import { IconInfoCircle, IconBuilding } from '@tabler/icons-react';
import type { Id } from '@/convex/_generated/dataModel';

// Define proper interface for pending company
interface PendingCompany {
  _id: Id<'pendingCompanies'>;
  name: string;
  type: 'masonry' | 'architect' | 'engineer' | 'client';
}

interface CompletePendingCompaniesModalProps {
  opened: boolean;
  onClose: () => void;
  projectId: Id<'projects'> | null;
}

export function CompletePendingCompaniesModal({ 
  opened, 
  onClose, 
  projectId 
}: CompletePendingCompaniesModalProps) {
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0);
  
  const pendingCompanies = useQuery(
    api.pendingCompanies.listByProject,
    projectId ? { projectId } : 'skip'
  ) as PendingCompany[] | undefined;
  
  const completePendingCompany = useMutation(api.pendingCompanies.completePendingCompany);

  const form = useForm({
    initialValues: {
      address: '',
      phone: '',
      email: '',
    },
  });

  if (!pendingCompanies || pendingCompanies.length === 0) {
    return null;
  }

  const currentCompany = pendingCompanies[currentCompanyIndex];
  
  const handleSubmit = async (values: typeof form.values) => {
    if (!currentCompany) return;

    try {
      await completePendingCompany({
        pendingCompanyId: currentCompany._id,
        companyData: {
          address: values.address || undefined,
          phone: values.phone || undefined,
          email: values.email || undefined,
        },
      });
      
      notifications.show({
        title: 'Success',
        message: `${currentCompany.name} company details completed`,
        color: 'green',
      });
      
      // Move to next company or close if done
      if (currentCompanyIndex < pendingCompanies.length - 1) {
        setCurrentCompanyIndex(prev => prev + 1);
        form.reset();
      } else {
        // All companies completed
        notifications.show({
          title: 'All Complete!',
          message: 'All company details have been completed',
          color: 'green',
        });
        onClose();
        setCurrentCompanyIndex(0);
        form.reset();
      }
    } catch (error: unknown) {
      console.error('Failed to complete company:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to complete company details',
        color: 'red',
      });
    }
  };

  const handleSkip = () => {
    // Move to next company without saving details
    if (currentCompanyIndex < pendingCompanies.length - 1) {
      setCurrentCompanyIndex(prev => prev + 1);
      form.reset();
    } else {
      onClose();
      setCurrentCompanyIndex(0);
      form.reset();
    }
  };

  const getCompanyTypeColor = (type: string) => {
    switch (type) {
      case 'masonry': return 'blue';
      case 'architect': return 'green';
      case 'engineer': return 'orange';
      case 'client': return 'purple';
      default: return 'gray';
    }
  };

  const getCompanyTypeIcon = (type: string) => {
    switch (type) {
      case 'masonry': return '🧱';
      case 'architect': return '📐';
      case 'engineer': return '⚙️';
      case 'client': return '👤';
      default: return '🏢';
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Complete Company Details"
      size="md"
      closeOnClickOutside={false}
    >
      <Stack gap="md">
        {/* Progress indicator */}
        <Alert icon={<IconInfoCircle size={16} />} color="blue">
          Completing company {currentCompanyIndex + 1} of {pendingCompanies.length}
        </Alert>

        {/* Current company info */}
        <Card withBorder>
          <Group justify="space-between" mb="md">
            <Group gap="sm">
              <Text size="lg">{getCompanyTypeIcon(currentCompany.type)}</Text>
              <div>
                <Title order={4}>{currentCompany.name}</Title>
                <Badge color={getCompanyTypeColor(currentCompany.type)} size="sm">
                  {currentCompany.type.charAt(0).toUpperCase() + currentCompany.type.slice(1)}
                </Badge>
              </div>
            </Group>
            <IconBuilding size={24} color="var(--mantine-color-gray-6)" />
          </Group>
          
          <Text size="sm" c="dimmed">
            Please provide additional details for this company (optional but recommended)
          </Text>
        </Card>

        <Divider />

        {/* Form */}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
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

            <Group justify="space-between" mt="md">
              <Group>
                <Button variant="subtle" onClick={handleSkip}>
                  Skip for now
                </Button>
                <Text size="xs" c="dimmed">
                  You can add details later
                </Text>
              </Group>
              
              <Group>
                <Button variant="light" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" color="yellow">
                  {currentCompanyIndex < pendingCompanies.length - 1 ? 'Next Company' : 'Complete'}
                </Button>
              </Group>
            </Group>
          </Stack>
        </form>

        {/* Remaining companies preview */}
        {pendingCompanies.length > 1 && (
          <>
            <Divider />
            <div>
              <Text size="sm" fw={500} mb="xs">Remaining companies:</Text>
              <Group gap="xs">
                {pendingCompanies.slice(currentCompanyIndex + 1).map((company) => (
                  <Badge 
                    key={company._id} 
                    color={getCompanyTypeColor(company.type)} 
                    variant="light"
                    size="sm"
                  >
                    {getCompanyTypeIcon(company.type)} {company.name}
                  </Badge>
                ))}
              </Group>
            </div>
          </>
        )}
      </Stack>
    </Modal>
  );
}
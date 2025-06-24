// src/components/PendingCompaniesIndicator.tsx
'use client';

import { Card, Group, Text, Button, Badge, Stack, Alert } from '@mantine/core';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { IconAlertCircle, IconBuilding } from '@tabler/icons-react';
import type { Id } from '@/convex/_generated/dataModel';

// Define proper interfaces to replace 'any' types
interface PendingCompany {
  _id: Id<'pendingCompanies'>;
  projectId: Id<'projects'>;
  name: string;
  type: 'masonry' | 'architect' | 'engineer' | 'client';
  tenantId: string;
  createdAt: string;
}

interface PendingCompaniesIndicatorProps {
  onCompletePending?: (projectId: string) => void;
}

export function PendingCompaniesIndicator({ onCompletePending }: PendingCompaniesIndicatorProps) {
  const { user } = useUser();
  
  const pendingCompanies = useQuery(
    api.pendingCompanies.listByTenant,
    user?.id ? { tenantId: user.id } : 'skip'
  ) as PendingCompany[] | undefined;

  if (!pendingCompanies || pendingCompanies.length === 0) {
    return null;
  }

  // Group by project with proper typing - this replaces the 'any' types
  const pendingByProject = pendingCompanies.reduce((acc: Record<string, PendingCompany[]>, pending: PendingCompany) => {
    const projectId = pending.projectId;
    if (!acc[projectId]) {
      acc[projectId] = [];
    }
    acc[projectId].push(pending);
    return acc;
  }, {});

  return (
    <Card withBorder mb="md" style={{ borderColor: 'var(--mantine-color-orange-4)' }}>
      <Alert 
        icon={<IconAlertCircle size={16} />} 
        color="orange" 
        variant="light"
        mb="md"
      >
        <Text size="sm" fw={500}>
          Pending Company Details
        </Text>
        <Text size="xs" c="dimmed">
          {pendingCompanies.length} companies need completion
        </Text>
      </Alert>

      <Stack gap="xs">
        {Object.entries(pendingByProject).map(([projectId, companies]) => (
          <Group key={projectId} justify="space-between" p="xs" style={{ backgroundColor: 'var(--mantine-color-orange-0)', borderRadius: 4 }}>
            <div>
              <Group gap="xs">
                <IconBuilding size={14} />
                <Text size="sm" fw={500}>
                  {companies.length} pending companies
                </Text>
              </Group>
              <Group gap="xs" mt="xs">
                {companies.map((company: PendingCompany) => (
                  <Badge key={company._id} size="xs" variant="light" color="orange">
                    {company.name}
                  </Badge>
                ))}
              </Group>
            </div>
            <Button 
              size="xs" 
              variant="light" 
              color="orange"
              onClick={() => onCompletePending?.(projectId)}
            >
              Complete
            </Button>
          </Group>
        ))}
      </Stack>
    </Card>
  );
}
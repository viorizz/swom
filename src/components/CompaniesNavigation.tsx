// src/components/CompaniesNavigation.tsx
'use client';

import { useState } from 'react';
import {
  Box,
  Group,
  Text,
  Button,
  Stack,
  Badge,
  Loader,
  Card,
  ActionIcon,
  Collapse,
} from '@mantine/core';
import {
  IconPlus,
  IconBuilding,
  IconChevronRight,
  IconChevronDown,
} from '@tabler/icons-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import type { Id } from '@/convex/_generated/dataModel';

interface SelectedItem {
  type: 'company';
  id: Id<'companies'>;
}

interface CompaniesNavigationProps {
  onSelect?: (item: SelectedItem) => void;
  onCreateCompany?: () => void;
}

const COMPANY_TYPE_CONFIG = {
  masonry: { label: 'Masonry', color: 'blue', icon: '🧱' },
  architect: { label: 'Architecture', color: 'green', icon: '📐' },
  engineer: { label: 'Engineering', color: 'orange', icon: '⚙️' },
  client: { label: 'Clients', color: 'purple', icon: '👤' },
} as const;

export function CompaniesNavigation({
  onSelect,
  onCreateCompany,
}: CompaniesNavigationProps) {
  const { user } = useUser();
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(['masonry', 'architect', 'engineer', 'client']));
  const [selected, setSelected] = useState<SelectedItem | null>(null);

  const companiesTree = useQuery(
    api.navigation.getCompaniesTree,
    user?.id ? { tenantId: user.id } : 'skip'
  );

  const toggleType = (type: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  const handleSelect = (item: SelectedItem) => {
    setSelected(item);
    onSelect?.(item);
  };

  if (companiesTree === undefined) {
    return (
      <Box p="md">
        <Group gap="sm">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">Loading companies...</Text>
        </Group>
      </Box>
    );
  }

  const totalCompanies = Object.values(companiesTree).reduce((sum, companies) => sum + companies.length, 0);

  return (
    <Stack gap={0}>
      {/* Create Company Button */}
      <Box p="md" pb="sm">
        <Button
          leftSection={<IconPlus size={16} />}
          variant="light"
          size="sm"
          fullWidth
          onClick={onCreateCompany}
        >
          Add Company
        </Button>
      </Box>

      {/* Companies by Type */}
      <Box px="sm">
        {totalCompanies === 0 ? (
          <Card padding="md">
            <Stack align="center" gap="md">
              <IconBuilding size={32} color="var(--mantine-color-gray-5)" />
              <Text size="sm" c="dimmed" ta="center">
                No companies yet. Create your first company to get started.
              </Text>
            </Stack>
          </Card>
        ) : (
          Object.entries(COMPANY_TYPE_CONFIG).map(([type, config]) => {
            const companies = companiesTree[type] || [];
            const isTypeExpanded = expandedTypes.has(type);

            return (
              <Card key={type} mb="xs" padding="xs" withBorder={false}>
                {/* Type Header */}
                <Group
                  gap="xs"
                  wrap="nowrap"
                  p="xs"
                  style={{
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleType(type)}
                >
                  <ActionIcon variant="subtle" size="sm">
                    {isTypeExpanded ? (
                      <IconChevronDown size={16} />
                    ) : (
                      <IconChevronRight size={16} />
                    )}
                  </ActionIcon>
                  <Text size="sm">{config.icon}</Text>
                  <Text size="sm" fw={500} flex={1}>
                    {config.label}
                  </Text>
                  <Badge size="xs" variant="light" color={config.color}>
                    {companies.length}
                  </Badge>
                </Group>

                {/* Companies List */}
                <Collapse in={isTypeExpanded}>
                  <Box ml="md" mt="xs">
                    {companies.length === 0 ? (
                      <Text size="xs" c="dimmed" pl="sm">
                        No {config.label.toLowerCase()} companies yet
                      </Text>
                    ) : (
                      companies.map((company) => {
                        const isCompanySelected = selected?.type === 'company' && selected.id === company._id;

                        return (
                          <Group
                            key={company._id}
                            gap="xs"
                            wrap="nowrap"
                            p="xs"
                            ml="sm"
                            style={{
                              borderRadius: 4,
                              backgroundColor: isCompanySelected ? 'var(--mantine-color-yellow-1)' : 'transparent',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleSelect({ type: 'company', id: company._id })}
                          >
                            <IconBuilding size={12} color={`var(--mantine-color-${config.color}-6)`} />
                            <Box flex={1}>
                              <Text size="xs" fw={500} truncate>
                                {company.name}
                              </Text>
                              {company.address && (
                                <Text size="xs" c="dimmed" truncate>
                                  {company.address}
                                </Text>
                              )}
                            </Box>
                          </Group>
                        );
                      })
                    )}
                  </Box>
                </Collapse>
              </Card>
            );
          })
        )}
      </Box>
    </Stack>
  );
}
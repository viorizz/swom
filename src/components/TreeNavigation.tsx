// src/components/TreeNavigation.tsx
'use client';

import { useState } from 'react';
import {
  Box,
  Group,
  Text,
  ActionIcon,
  Button,
  Stack,
  Collapse,
  Badge,
  Loader,
} from '@mantine/core';
import {
  IconChevronRight,
  IconChevronDown,
  IconBuilding,
  IconFolder,
  IconFile,
  IconPlus,
} from '@tabler/icons-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

interface SelectedItem {
  type: 'company' | 'project' | 'order';
  id: Id<'companies'> | Id<'projects'> | Id<'orders'>;
}

interface TreeNavigationProps {
  onSelect?: (item: SelectedItem) => void;
  onCreateCompany?: () => void;
  onCreateProject?: (companyId: Id<'companies'>) => void;
  onCreateOrder?: (projectId: Id<'projects'>) => void;
}

export function TreeNavigation({
  onSelect,
  onCreateCompany,
  onCreateProject,
  onCreateOrder,
}: TreeNavigationProps) {
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<SelectedItem | null>(null);

  const navigationTree = useQuery(api.navigation.getNavigationTree);

  const toggleCompany = (companyId: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanies(newExpanded);
  };

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const handleSelect = (item: SelectedItem) => {
    setSelected(item);
    onSelect?.(item);
  };

  if (navigationTree === undefined) {
    return (
      <Box p="md">
        <Group gap="sm">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">Loading navigation...</Text>
        </Group>
      </Box>
    );
  }

  if (navigationTree.length === 0) {
    return (
      <Stack gap="md" p="md">
        <Text size="sm" c="dimmed">No companies yet</Text>
        <Button
          leftSection={<IconPlus size={16} />}
          variant="light"
          size="sm"
          onClick={onCreateCompany}
        >
          Add Company
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap={0}>
      {/* Add Company Button */}
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

      {/* Navigation Tree */}
      <Box px="sm">
        {navigationTree.map((company) => {
          const isCompanyExpanded = expandedCompanies.has(company._id);
          const isCompanySelected = selected?.type === 'company' && selected.id === company._id;

          return (
            <Box key={company._id} mb="xs">
              {/* Company Level */}
              <Group
                gap="xs"
                wrap="nowrap"
                p="xs"
                style={{
                  borderRadius: 4,
                  backgroundColor: isCompanySelected ? 'var(--mantine-color-yellow-1)' : 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => handleSelect({ type: 'company', id: company._id })}
              >
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCompany(company._id);
                  }}
                >
                  {isCompanyExpanded ? (
                    <IconChevronDown size={16} />
                  ) : (
                    <IconChevronRight size={16} />
                  )}
                </ActionIcon>
                <IconBuilding size={16} color="var(--mantine-color-blue-6)" />
                <Text size="sm" fw={500} flex={1} truncate>
                  {company.name}
                </Text>
                <Badge size="xs" variant="light">
                  {company.projects.length}
                </Badge>
              </Group>

              {/* Projects Level */}
              <Collapse in={isCompanyExpanded}>
                <Box ml="md" mt="xs">
                  {/* Add Project Button */}
                  <Button
                    leftSection={<IconPlus size={14} />}
                    variant="subtle"
                    size="xs"
                    mb="xs"
                    onClick={() => onCreateProject?.(company._id)}
                  >
                    Add Project
                  </Button>

                  {company.projects.map((project) => {
                    const isProjectExpanded = expandedProjects.has(project._id);
                    const isProjectSelected = selected?.type === 'project' && selected.id === project._id;

                    return (
                      <Box key={project._id} mb="xs">
                        {/* Project Level */}
                        <Group
                          gap="xs"
                          wrap="nowrap"
                          p="xs"
                          ml="sm"
                          style={{
                            borderRadius: 4,
                            backgroundColor: isProjectSelected ? 'var(--mantine-color-yellow-1)' : 'transparent',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleSelect({ type: 'project', id: project._id })}
                        >
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProject(project._id);
                            }}
                          >
                            {isProjectExpanded ? (
                              <IconChevronDown size={14} />
                            ) : (
                              <IconChevronRight size={14} />
                            )}
                          </ActionIcon>
                          <IconFolder size={14} color="var(--mantine-color-green-6)" />
                          <Text size="xs" flex={1} truncate>
                            {project.name}
                          </Text>
                          <Badge size="xs" variant="light" color="green">
                            {project.orders.length}
                          </Badge>
                        </Group>

                        {/* Orders Level */}
                        <Collapse in={isProjectExpanded}>
                          <Box ml="md" mt="xs">
                            {/* Add Order Button */}
                            <Button
                              leftSection={<IconPlus size={12} />}
                              variant="subtle"
                              size="xs"
                              mb="xs"
                              onClick={() => onCreateOrder?.(project._id)}
                            >
                              Add Order
                            </Button>

                            {project.orders.map((order) => {
                              const isOrderSelected = selected?.type === 'order' && selected.id === order._id;

                              return (
                                <Group
                                  key={order._id}
                                  gap="xs"
                                  wrap="nowrap"
                                  p="xs"
                                  ml="lg"
                                  style={{
                                    borderRadius: 4,
                                    backgroundColor: isOrderSelected ? 'var(--mantine-color-yellow-1)' : 'transparent',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => handleSelect({ type: 'order', id: order._id })}
                                >
                                  <IconFile size={12} color="var(--mantine-color-orange-6)" />
                                  <Text size="xs" flex={1} truncate>
                                    {order.draftName}
                                  </Text>
                                  <Badge
                                    size="xs"
                                    variant="light"
                                    color={order.status === 'submitted' ? 'blue' : 'gray'}
                                  >
                                    {order.status}
                                  </Badge>
                                </Group>
                              );
                            })}
                          </Box>
                        </Collapse>
                      </Box>
                    );
                  })}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}
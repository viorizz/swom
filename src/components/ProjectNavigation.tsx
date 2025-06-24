// src/components/ProjectNavigation.tsx (Complete Fix)
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
  Card,
  Tooltip,
} from '@mantine/core';
import {
  IconChevronRight,
  IconChevronDown,
  IconFolder,
  IconFile,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { PendingCompaniesIndicator } from '@/components/PendingCompaniesIndicator';
import type { Id } from '@/convex/_generated/dataModel';

interface SelectedItem {
  type: 'project' | 'order';
  id: Id<'projects'> | Id<'orders'>;
}

// Define proper interface for Order to replace 'any' type
interface Order {
  _id: Id<'orders'>;
  draftName: string;
  status: 'draft' | 'submitted';
}

// Define proper interface for Company
interface Company {
  name: string;
}

// Define proper interface for Project with populated data
interface ProjectWithData {
  _id: Id<'projects'>;
  name: string;
  number: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  orders: Order[];
  companies: {
    masonry?: Company | null;
    architect?: Company | null;
    engineer?: Company | null;
    client?: Company | null;
  };
}

interface ProjectsNavigationProps {
  onSelect?: (item: SelectedItem) => void;
  onCreateProject?: () => void;
  onCreateOrder?: (projectId: Id<'projects'>) => void;
  onCompletePending?: (projectId: Id<'projects'>) => void;
}

export function ProjectsNavigation({
  onSelect,
  onCreateProject,
  onCreateOrder,
  onCompletePending,
}: ProjectsNavigationProps) {
  const { user } = useUser();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<SelectedItem | null>(null);

  const projects = useQuery(
    api.navigation.getNavigationTree,
    user?.id ? { tenantId: user.id } : 'skip'
  );

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

  if (projects === undefined) {
    return (
      <Box p="md">
        <Group gap="sm">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">Loading projects...</Text>
        </Group>
      </Box>
    );
  }

  if (projects.length === 0) {
    return (
      <Stack gap="md" p="md">
        <Text size="sm" c="dimmed">No projects yet</Text>
        <Button
          leftSection={<IconPlus size={16} />}
          variant="light"
          size="sm"
          onClick={onCreateProject}
        >
          Create Project
        </Button>
      </Stack>
    );
  }

  // Type the projects properly - cast to our interface
  const typedProjects = projects as ProjectWithData[];

  return (
    <Stack gap={0}>
      {/* Pending Companies Indicator */}
      <Box p="md" pb="sm">
        <PendingCompaniesIndicator 
          onCompletePending={(projectId) => onCompletePending?.(projectId as Id<'projects'>)}
        />
      </Box>

      {/* Create Project Button */}
      <Box p="md" pb="sm">
        <Button
          leftSection={<IconPlus size={16} />}
          variant="light"
          size="sm"
          fullWidth
          onClick={onCreateProject}
        >
          Create Project
        </Button>
      </Box>

      {/* Projects List */}
      <Box px="sm">
        {typedProjects.map((project) => {
          const isProjectExpanded = expandedProjects.has(project._id);
          const isProjectSelected = selected?.type === 'project' && selected.id === project._id;

          // Get company names for display with proper typing
          const companyNames = [
            project.companies?.masonry?.name,
            project.companies?.architect?.name,
            project.companies?.engineer?.name,
            project.companies?.client?.name,
          ].filter((name): name is string => Boolean(name));

          return (
            <Card key={project._id} mb="xs" padding="xs" withBorder={false}>
              {/* Project Level */}
              <Group
                gap="xs"
                wrap="nowrap"
                p="xs"
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
                    <IconChevronDown size={16} />
                  ) : (
                    <IconChevronRight size={16} />
                  )}
                </ActionIcon>
                <IconFolder size={16} color="var(--mantine-color-blue-6)" />
                <Box flex={1}>
                  <Text size="sm" fw={500} truncate>
                    {project.name}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    #{project.number}
                  </Text>
                </Box>
                <Group gap="xs">
                  {companyNames.length > 0 && (
                    <Tooltip label={companyNames.join(', ')}>
                      <Badge size="xs" variant="light" color="gray">
                        <IconUsers size={10} />
                      </Badge>
                    </Tooltip>
                  )}
                  <Badge size="xs" variant="light" color="green">
                    {project.orders?.length || 0}
                  </Badge>
                </Group>
              </Group>

              {/* Orders Level */}
              <Collapse in={isProjectExpanded}>
                <Box ml="md" mt="xs">
                  {/* Add Order Button */}
                  <Button
                    leftSection={<IconPlus size={14} />}
                    variant="subtle"
                    size="xs"
                    mb="xs"
                    onClick={() => onCreateOrder?.(project._id)}
                  >
                    Add Order
                  </Button>

                  {!project.orders || project.orders.length === 0 ? (
                    <Text size="xs" c="dimmed" pl="sm">
                      No orders yet
                    </Text>
                  ) : (
                    project.orders.map((order) => {
                      const isOrderSelected = selected?.type === 'order' && selected.id === order._id;

                      return (
                        <Group
                          key={order._id}
                          gap="xs"
                          wrap="nowrap"
                          p="xs"
                          ml="sm"
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
                    })
                  )}
                </Box>
              </Collapse>
            </Card>
          );
        })}
      </Box>
    </Stack>
  );
}
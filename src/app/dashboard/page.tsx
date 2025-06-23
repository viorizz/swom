'use client';

import { Container, Title, Text } from '@mantine/core';

export default function DashboardPage() {
  return (
    <Container>
      <Title order={2} mb="md">Dashboard</Title>
      <Text>Welcome to your Swiss Order Management dashboard!</Text>
    </Container>
  );
}
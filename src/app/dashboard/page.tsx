'use client';

import { Container, Title, Text } from '@mantine/core';
import { useUser } from '@clerk/nextjs';

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return (
    <Container>
      <Title order={2} mb="md">Dashboard</Title>
      <Text>Welcome to your Swiss Order Management dashboard!</Text>
    </Container>
  );
}

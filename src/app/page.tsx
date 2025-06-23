'use client';

import { Container, Title, Text, Button, Stack } from '@mantine/core';

export default function HomePage() {
  return (
    <Container size="md" py="xl">
      <Stack align="center" gap="md">
        <Title order={1} c="yellow.6">
          Swiss Order Management
        </Title>
        <Text size="lg" c="dimmed" ta="center">
          Special reinforcement order management for Swiss construction
        </Text>
        <Button variant="filled" color="yellow" size="lg">
          Get Started
        </Button>
      </Stack>
    </Container>
  );
}
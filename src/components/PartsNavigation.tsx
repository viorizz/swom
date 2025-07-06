
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button, Card, Title } from "@mantine/core";
import { Id } from "../../convex/_generated/dataModel";

import { useDisclosure } from "@mantine/hooks";
import { CreatePartModal } from "./modals/CreatePartModal";
import { CreateOrderModal } from "./modals/CreateOrderModal";
import { useState } from "react";

function Part({ part, handleCreateOrderClick }: { part: any, handleCreateOrderClick: (partId: Id<"parts">) => void }) {
  const orders = useQuery(api.orders.listByPart, { partId: part._id });
  const generatePdf = useAction(api.generatePdf.generatePdf);

  const handleGeneratePdf = (orderId: Id<"orders">) => {
    generatePdf({ orderId });
  };

  return (
    <div key={part._id}>
      <p>{part.name}</p>
      {orders?.map((order) => (
        <div key={order._id}>
          <p>{order.draftName}</p>
          <Button onClick={() => handleGeneratePdf(order._id)}>Generate PDF</Button>
        </div>
      ))}
      <Button onClick={() => handleCreateOrderClick(part._id)}>Create Order</Button>
    </div>
  );
}

interface PartsNavigationProps {
  projectId: Id<"projects">;
}

export function PartsNavigation({ projectId }: PartsNavigationProps) {
  const parts = useQuery(api.parts.getPartsForProject, { projectId });
  const [createPartOpened, { open: openCreatePart, close: closeCreatePart }] = useDisclosure(false);
  const [createOrderOpened, { open: openCreateOrder, close: closeCreateOrder }] = useDisclosure(false);
  const [selectedPartId, setSelectedPartId] = useState<Id<"parts"> | null>(null);

  const handleCreateOrderClick = (partId: Id<"parts">) => {
    setSelectedPartId(partId);
    openCreateOrder();
  };

  return (
    <>
      <CreatePartModal opened={createPartOpened} onClose={closeCreatePart} projectId={projectId} />
      <CreateOrderModal opened={createOrderOpened} onClose={closeCreateOrder} projectId={projectId} partId={selectedPartId} />
      <Card withBorder shadow="sm" padding="lg" radius="md">
        <Title order={2}>Parts</Title>
        {parts?.map((part) => (
          <Part key={part._id} part={part} handleCreateOrderClick={handleCreateOrderClick} />
        ))}
        <Button onClick={openCreatePart}>Create Part</Button>
      </Card>
    </>
  );
}

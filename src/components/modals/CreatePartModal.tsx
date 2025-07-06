
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Id } from "../../../convex/_generated/dataModel";

interface CreatePartModalProps {
  opened: boolean;
  onClose: () => void;
  projectId: Id<"projects">;
}

export function CreatePartModal({ opened, onClose, projectId }: CreatePartModalProps) {
  const createPart = useMutation(api.parts.createPart);

  const form = useForm({
    initialValues: {
      name: "",
    },
  });

  const handleSubmit = async (values: {
    name: string;
  }) => {
    await createPart({ ...values, projectId });
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create Part">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Part Name"
          placeholder="Enter part name"
          {...form.getInputProps("name")}
        />
        <Button type="submit" mt="md">Create</Button>
      </form>
    </Modal>
  );
}

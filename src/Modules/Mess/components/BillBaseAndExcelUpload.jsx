import React, { useState } from "react";
import {
  TextInput,
  Button,
  Card,
  Text,
  FileInput,
  Grid,
  Space,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

function BillBase() {
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState(null);

  const updateBaseAmount = (event) => {
    event.preventDefault();
    notifications.show({
      title: "Success",
      message: `Updated base amount to: Rs. ${amount}`,
      color: "green",
    });
  };

  const uploadFile = (event) => {
    event.preventDefault();
    if (file) {
      notifications.show({
        title: "Success",
        message: `File uploaded: ${file.name}`,
        color: "green",
      });
    } else {
      notifications.show({
        title: "Error",
        message: "Please select a file to upload.",
        color: "red",
      });
    }
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text size="lg" fw={700} ta="center" mb="md" c="#3B82F6">
        Monthly Bill Base
      </Text>
      {/* Update Base Amount Form */}
      <form onSubmit={updateBaseAmount}>
        <Grid align="flex-end">
          <Grid.Col span={8}>
            <TextInput
              label="Current Base Amount"
              placeholder="Enter the new base amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              required
              radius="md"
              size="md"
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Button type="submit" color="blue">
              Update Base Amount
            </Button>
          </Grid.Col>
        </Grid>
      </form>
      <Space h="xl" />
      <hr />
      <Space h="xl" />
      {/* Upload Monthly Bill Form */}
      <form onSubmit={uploadFile}>
        <Grid align="flex-end">
          <Grid.Col span={8}>
            <FileInput
              label="Upload Monthly Bill"
              placeholder="Choose Excel file"
              value={file}
              onChange={setFile}
              accept=".xlsx,.xls"
              required
              radius="md"
              size="md"
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Button type="submit" color="blue">
              Update Bills
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </Card>
  );
}

export default BillBase;

import React, { useEffect, useState } from "react";
import {
  NumberInput,
  Button,
  Card,
  Text,
  FileInput,
  Grid,
  Space,
  Flex,
  Loader,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  fetchMessBillBase,
  getApiErrorMessage,
  updateMessBillBase,
  uploadBillExcel,
} from "../api";

function BillBase() {
  const [amount, setAmount] = useState(0);
  const [file, setFile] = useState(null);
  const [loadingBase, setLoadingBase] = useState(true);
  const [updatingBase, setUpdatingBase] = useState(false);
  const [uploading, setUploading] = useState(false);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const loadBaseAmount = async () => {
      if (!authToken) {
        setLoadingBase(false);
        return;
      }

      try {
        const response = await fetchMessBillBase(authToken);
        const records = response?.data?.payload || [];
        if (records.length > 0) {
          const latest = [...records].sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
          )[0];
          setAmount(Number(latest.bill_amount) || 0);
        }
      } catch (error) {
        notifications.show({
          title: "Error",
          message: getApiErrorMessage(
            error,
            "Failed to load current bill base.",
          ),
          color: "red",
        });
      } finally {
        setLoadingBase(false);
      }
    };

    loadBaseAmount();
  }, [authToken]);

  const updateBaseAmount = async (event) => {
    event.preventDefault();

    if (!Number.isFinite(Number(amount)) || Number(amount) < 0) {
      notifications.show({
        title: "Validation Error",
        message: "Base amount must be a non-negative number.",
        color: "red",
      });
      return;
    }

    setUpdatingBase(true);
    try {
      await updateMessBillBase(amount, authToken);
      notifications.show({
        title: "Success",
        message: `Updated base amount to Rs. ${amount}.`,
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to update base amount."),
        color: "red",
      });
    } finally {
      setUpdatingBase(false);
    }
  };

  const uploadFile = async (event) => {
    event.preventDefault();

    if (!file) {
      notifications.show({
        title: "Error",
        message: "Please select a file to upload.",
        color: "red",
      });
      return;
    }

    setUploading(true);
    try {
      const response = await uploadBillExcel(file, authToken);
      notifications.show({
        title: "Success",
        message:
          response?.data?.message ||
          `File uploaded and processed successfully: ${file.name}`,
        color: "green",
      });
      setFile(null);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to upload bill Excel file."),
        color: "red",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text size="lg" fw={700} ta="center" mb="md" c="#3B82F6">
        Monthly Bill Base
      </Text>
      {loadingBase && (
        <Flex justify="center" align="center" mb="md">
          <Loader size="sm" />
        </Flex>
      )}

      {/* Update Base Amount Form */}
      <form onSubmit={updateBaseAmount}>
        <Grid align="flex-end">
          <Grid.Col span={8}>
            <NumberInput
              label="Current Base Amount"
              placeholder="Enter the new base amount"
              value={amount}
              onChange={(value) => setAmount(value ?? 0)}
              required
              radius="md"
              size="md"
              min={0}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Button type="submit" color="blue" loading={updatingBase}>
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
            <Button type="submit" color="blue" loading={uploading}>
              Update Bills
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </Card>
  );
}

export default BillBase;

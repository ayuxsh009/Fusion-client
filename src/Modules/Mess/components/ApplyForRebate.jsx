import React, { useState } from "react";
import { Button, Paper, TextInput, Textarea, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { submitRebateApplication, getApiErrorMessage } from "../api";

function ApplyForRebate() {
  const [purpose, setPurpose] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      notifications.show({
        title: "Error",
        message: "Not authenticated",
        color: "red",
      });
      return;
    }
    if (!startDate || !endDate || !purpose) {
      notifications.show({
        title: "Error",
        message: "All fields are required",
        color: "red",
      });
      return;
    }

    if (startDate < tomorrowISO) {
      notifications.show({
        title: "Error",
        message: "Rebate start date must be a future date",
        color: "red",
      });
      return;
    }

    if (endDate < startDate) {
      notifications.show({
        title: "Error",
        message: "End date cannot be before start date",
        color: "red",
      });
      return;
    }

    if (purpose.trim().length < 3) {
      notifications.show({
        title: "Error",
        message: "Purpose must be at least 3 characters",
        color: "red",
      });
      return;
    }

    const payload = {
      purpose: purpose.trim(),
      start_date: startDate,
      end_date: endDate,
    };
    setLoading(true);
    try {
      await submitRebateApplication(payload, token);
      notifications.show({
        title: "Success",
        message: "Rebate application submitted",
        color: "green",
      });
      setPurpose("");
      setStartDate("");
      setEndDate("");
    } catch (err) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(err, "Submission failed"),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper shadow="md" radius="md" p="lg" withBorder mt="lg">
      <Title order={3} mb="md">
        Apply for Rebate
      </Title>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Start Date"
          placeholder="YYYY-MM-DD"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.currentTarget.value)}
          min={tomorrowISO}
          mb="md"
          required
        />
        <TextInput
          label="End Date"
          placeholder="YYYY-MM-DD"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.currentTarget.value)}
          min={startDate || tomorrowISO}
          mb="md"
          required
        />
        <Textarea
          label="Purpose"
          placeholder="Enter reason for rebate"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          mb="md"
          required
        />
        <Button type="submit" loading={loading} fullWidth>
          Submit Application
        </Button>
      </form>
    </Paper>
  );
}

export default ApplyForRebate;

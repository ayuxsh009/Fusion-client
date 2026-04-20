import React, { useState } from "react";
import {
  Button,
  Select,
  Card,
  Text,
  Group,
  Flex,
  TextInput,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { submitSpecialFoodRequest, getApiErrorMessage } from "../api";

function ApplyForSpecialFood() {
  const [food, setFood] = useState("");
  const [timing, setTiming] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const authToken = localStorage.getItem("authToken");
  const today = new Date();
  const minstartdate = new Date();
  minstartdate.setDate(today.getDate() + 3);
  const minStartDateISO = minstartdate.toISOString().split("T")[0];

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!fromDate || !toDate || !food || !timing || !purpose.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "All fields are required",
        color: "red",
      });
      return;
    }

    if (toDate < fromDate) {
      notifications.show({
        title: "Validation Error",
        message: "To date cannot be before from date",
        color: "red",
      });
      return;
    }

    const requestData = {
      start_date: fromDate,
      end_date: toDate,
      status: "1",
      app_date: new Date().toISOString().split("T")[0],
      request: purpose.trim(),
      item1: food,
      item2: timing,
    };

    try {
      const response = await submitSpecialFoodRequest(requestData, authToken);

      if (response.status === 200) {
        notifications.show({
          title: "Success",
          message: "Special food request submitted successfully!",
          color: "green",
        });
        setFood("");
        setTiming("");
        setFromDate("");
        setToDate("");
        setPurpose("");
      } else {
        notifications.show({
          title: "Error",
          message: response.data.message || "Submission failed.",
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Submission failed."),
        color: "red",
      });
    }
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text size="lg" fw={700} ta="center" mb="md" c="#3B82F6">
        Apply for Special Food
      </Text>

      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="md">
          <Select
            label="Select Food"
            placeholder="Choose food"
            data={[
              { value: "dal_chawal", label: "Dal Chawal" },
              { value: "khicdi", label: "Khicdi" },
              { value: "tomato_soup", label: "Tomato Soup" },
            ]}
            value={food}
            onChange={setFood}
            required
          />

          <Select
            label="Select Food Timing"
            placeholder="Choose timing"
            data={[
              { value: "breakfast", label: "Breakfast" },
              { value: "lunch", label: "Lunch" },
              { value: "dinner", label: "Dinner" },
            ]}
            value={timing}
            onChange={setTiming}
            required
          />

          <TextInput
            label="From"
            placeholder="YYYY-MM-DD"
            type="date"
            value={fromDate}
            min={minStartDateISO}
            onChange={(event) => setFromDate(event.currentTarget.value)}
            required
          />

          <TextInput
            label="To"
            placeholder="YYYY-MM-DD"
            type="date"
            value={toDate}
            min={fromDate || minStartDateISO}
            onChange={(event) => setToDate(event.currentTarget.value)}
            required
          />

          <Textarea
            label="Purpose"
            placeholder="Enter purpose"
            value={purpose}
            onChange={(event) => setPurpose(event.currentTarget.value)}
            required
          />
        </Flex>

        <Group justify="flex-end" mt="lg">
          <Button type="submit" color="blue" size="md">
            Submit
          </Button>
        </Group>
      </form>
    </Card>
  );
}

export default ApplyForSpecialFood;

import React, { useState } from "react";
import {
  Button,
  Container,
  Paper,
  Title,
  Space,
  Notification,
  Group,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { updateSemesterDates, getApiErrorMessage } from "../api";

function DateSelectionForm() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const todayISO = new Date().toISOString().split("T")[0];

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!startDate || !endDate) {
      notifications.show({
        title: "Failed",
        message: "Both dates are required",
        color: "red",
        position: "top-center",
      });
      return;
    }

    if (endDate <= startDate) {
      notifications.show({
        title: "Failed",
        message: "End date must be greater than start date",
        color: "red",
        position: "top-center",
      });
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("authToken");

      const response = await updateSemesterDates(
        {
          sem: "2024",
          start_reg: startDate,
          end_reg: endDate,
        },
        token,
      );

      if (response.status === 200) {
        notifications.show({
          title: "Success",
          message: "Semester dates updated successfully",
          color: "green",
          position: "top-center",
        });
        setStartDate("");
        setEndDate("");
      }
    } catch (err) {
      console.error("Server response:", err.response?.data);

      notifications.show({
        title: "Error",
        message: getApiErrorMessage(
          err,
          "Unable to update semester dates.",
        ),
        color: "red",
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      size="lg"
      style={{
        width: "max",
        marginTop: "100px",
      }}
    >
      <Paper
        shadow="md"
        radius="md"
        p="xl"
        withBorder
        style={{ width: "100%", padding: "30px" }}
      >
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Update Semester Dates
        </Title>

        {error && (
          <Notification color="red" onClose={() => setError(null)}>
            {error}
          </Notification>
        )}

        <form onSubmit={handleSubmit}>
          {/* Start Date input */}
          <Group grow>
            <TextInput
              label="Start Date"
              placeholder="YYYY-MM-DD"
              type="date"
              fullWidth
              value={startDate}
              min={todayISO}
              onChange={(event) => setStartDate(event.currentTarget.value)}
              required
              radius="md"
              size="md"
              mb="lg"
              styles={(theme) => ({
                input: {
                  backgroundColor: "#f0f3f7",
                  border: `1px solid ${theme.colors.blue[6]}`,
                },
                dropdown: {
                  backgroundColor: theme.colors.gray[0],
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                },
                day: {
                  "&[dataSelected]": {
                    backgroundColor: theme.colors.blue[6],
                  },
                  "&[dataToday]": {
                    backgroundColor: theme.colors.gray[2],
                    fontWeight: "bold",
                  },
                },
              })}
            />

            {/* End Date input */}
            <TextInput
              label="End Date"
              placeholder="YYYY-MM-DD"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.currentTarget.value)}
              fullWidth
              min={startDate || todayISO}
              required
              radius="md"
              size="md"
              mb="lg"
              styles={(theme) => ({
                input: {
                  backgroundColor: "#f0f3f7",
                  border: `1px solid ${theme.colors.blue[6]}`,
                },
                dropdown: {
                  backgroundColor: theme.colors.gray[0],
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                },
                day: {
                  "&[dataSelected]": {
                    backgroundColor: theme.colors.blue[6],
                  },
                  "&[dataToday]": {
                    backgroundColor: theme.colors.gray[2],
                    fontWeight: "bold",
                  },
                },
              })}
            />
          </Group>
          <Space h="xl" />

          {/* Submit button */}
          <Button
            type="submit"
            fullWidth
            size="md"
            radius="md"
            color="blue"
            loading={loading}
          >
            Update
          </Button>
        </form>
      </Paper>
      <Space h="xl" />
    </Container>
  );
}

export default DateSelectionForm;

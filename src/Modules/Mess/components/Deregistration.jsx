import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Group,
  Text,
  Stack,
  TextInput,
} from "@mantine/core";
import { useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";
import {
  submitDeregistrationRequest,
  deleteDeregistrationRequest,
  getApiErrorMessage,
  fetchStudentRegistrationStatus,
  fetchDeregistrationRequests,
} from "../api";

function Deregistration() {
  const roll_no = useSelector((state) => state.user.roll_no);
  const [endDate, setEndDate] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [latestRequest, setLatestRequest] = useState(null);
  const today = new Date();
  const nextMonthStartISO = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    1,
  )
    .toISOString()
    .split("T")[0];

  const getStatusColor = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "accept") {
      return "green";
    }
    if (normalized === "reject") {
      return "red";
    }
    return "yellow";
  };

  const getStatusLabel = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "accept") {
      return "Accepted";
    }
    if (normalized === "reject") {
      return "Rejected";
    }
    return "Pending";
  };

  useEffect(() => {
    const loadStatus = async () => {
      const token = localStorage.getItem("authToken");
      if (!token || !roll_no) {
        return;
      }

      try {
        const [statusResponse, deregResponse] = await Promise.all([
          fetchStudentRegistrationStatus(roll_no, token),
          fetchDeregistrationRequests(token),
        ]);

        setRegistrationStatus(
          statusResponse.data?.payload?.current_mess_status,
        );

        const studentRequests = (deregResponse.data?.payload || []).filter(
          (item) =>
            String(item.student_id).toUpperCase() ===
            String(roll_no).toUpperCase(),
        );

        const latest = studentRequests.reduce((prev, curr) => {
          if (!prev) {
            return curr;
          }
          return Number(curr.id || 0) > Number(prev.id || 0) ? curr : prev;
        }, null);

        setLatestRequest(latest);

        const pendingExists = studentRequests.some(
          (item) => String(item.status).toLowerCase() === "pending",
        );
        setHasPendingRequest(pendingExists);
      } catch (error) {
        notifications.show({
          title: "Error",
          message: getApiErrorMessage(
            error,
            "Failed to load deregistration status.",
          ),
          color: "red",
        });
      }
    };

    loadStatus();
  }, [roll_no]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (registrationStatus !== "Registered") {
      notifications.show({
        title: "Not Allowed",
        message: "Only registered students can apply for deregistration.",
        color: "orange",
      });
      return;
    }

    if (hasPendingRequest) {
      notifications.show({
        title: "Pending Request",
        message: "You already have a pending deregistration request.",
        color: "orange",
      });
      return;
    }

    if (!endDate) {
      notifications.show({
        title: "Validation",
        message: "Please select an end date.",
        color: "orange",
      });
      return;
    }

    const data = {
      student_id: roll_no,
      end_date: endDate,
    };

    try {
      const response = await submitDeregistrationRequest(
        data,
        localStorage.getItem("authToken"),
      );

      if (response.status === 200) {
        setHasPendingRequest(true);
        setLatestRequest({
          student_id: roll_no,
          end_date: data.end_date,
          status: "pending",
          deregistration_remark: "NA",
        });
        notifications.show({
          title: "Success",
          message: "Deregistration request submitted successfully!",
          color: "green",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(
          error,
          "Error submitting deregistration request",
        ),
        color: "red",
      });
    }
  };

  const handleDeletePendingRequest = async () => {
    const token = localStorage.getItem("authToken");
    if (!token || !latestRequest?.id) {
      return;
    }

    try {
      const response = await deleteDeregistrationRequest(
        latestRequest.id,
        token,
      );
      if (response.status === 200) {
        setHasPendingRequest(false);
        setLatestRequest(null);
        notifications.show({
          title: "Success",
          message: "Pending deregistration request deleted.",
          color: "green",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to delete pending request."),
        color: "red",
      });
    }
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Stack>
        <Text size="lg" fw={700} c="#3B82F6">
          Deregistration Request
        </Text>

        {registrationStatus !== "Registered" && (
          <Alert color="blue" mb="sm">
            You are currently not registered in mess. Registration option is
            available in the tabs.
          </Alert>
        )}

        {hasPendingRequest && (
          <Alert color="yellow" mb="sm">
            You already have a pending deregistration request. You can submit a
            new one only if this request is rejected.
          </Alert>
        )}

        {latestRequest && (
          <Alert color={getStatusColor(latestRequest.status)} mb="sm">
            <Text fw={600}>
              Current Deregistration Status:{" "}
              {getStatusLabel(latestRequest.status)}
            </Text>
            <Text size="sm">
              Requested End Date: {latestRequest.end_date || "-"}
            </Text>
            <Text size="sm">
              Remark: {latestRequest.deregistration_remark || "NA"}
            </Text>
            {String(latestRequest.status).toLowerCase() === "pending" && (
              <Button
                size="xs"
                color="red"
                variant="light"
                mt="sm"
                onClick={handleDeletePendingRequest}
              >
                Delete Pending Request
              </Button>
            )}
          </Alert>
        )}

        <Text size="sm">
          Click on the Deregister Button below to request deregistration. If
          your request is pending, view the status in the status bar. You will
          be deregistered from the mess on the date which you fill, and you
          can&apos;t eat on that day. Thus, advised to fill the next day instead
          of today.
          <br />
          <br />
          ** You can only deregister from the start of the next month.
        </Text>

        <form onSubmit={handleSubmit}>
          <Group align="flex-end">
            <TextInput
              label="End Date*"
              placeholder="YYYY-MM-DD"
              type="date"
              value={endDate}
              min={nextMonthStartISO}
              onChange={(event) => setEndDate(event.currentTarget.value)}
              required
              radius="md"
              size="md"
              labelProps={{ style: { marginBottom: "10px" } }}
              mb="lg"
            />
            <Button
              size="md"
              radius="md"
              color="blue"
              type="submit"
              mb="lg"
              disabled={
                registrationStatus !== "Registered" || hasPendingRequest
              }
            >
              Deregister
            </Button>
          </Group>
        </form>
      </Stack>
    </Card>
  );
}

export default Deregistration;

import React, { useEffect, useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Container,
  Title,
  Paper,
  FileInput,
  Textarea,
  Select,
  Group,
  Alert,
  Badge,
} from "@mantine/core";
import { useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";
import { FunnelSimple } from "@phosphor-icons/react";
import {
  fetchRegistrationRequests,
  fetchStudentRegistrationStatus,
  getApiErrorMessage,
  submitRegistrationRequest,
} from "../api";

function Registration() {
  const roll_no = useSelector((state) => state.user.roll_no);
  const [txnNo, setTxnNo] = useState("");
  const [amount, setAmount] = useState(0);
  const [file, setFile] = useState(null);
  const [paymentDate, setPaymentDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState(null);
  const [messOption, setMessOption] = useState("");
  const [remark, setRemark] = useState("");
  const [requestStatus, setRequestStatus] = useState(null);
  const [requestDate, setRequestDate] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const todayISO = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const loadStatus = async () => {
      const token = localStorage.getItem("authToken");
      if (!token || !roll_no) {
        setStatusLoading(false);
        return;
      }

      try {
        const [requestRes, regStatusRes] = await Promise.all([
          fetchRegistrationRequests(token),
          fetchStudentRegistrationStatus(roll_no, token),
        ]);

        const regPayload = regStatusRes?.data?.payload;
        const regPayloadList = Array.isArray(regPayload)
          ? regPayload
          : regPayload
            ? [regPayload]
            : [];

        const ownReg = regPayloadList.find(
          (item) =>
            String(item.student_id || "").toUpperCase() ===
            String(roll_no || "").toUpperCase(),
        );
        setIsRegistered(
          String(ownReg?.current_mess_status || "").toLowerCase() ===
            "registered",
        );

        const allRequests = requestRes?.data?.payload || [];
        const myRequests = allRequests
          .filter(
            (item) =>
              String(item.student_id || "").toUpperCase() ===
              String(roll_no || "").toUpperCase(),
          )
          .sort((a, b) => (b.id || 0) - (a.id || 0));

        const latestPendingRequest = myRequests.find((item) => {
          const statusValue = String(item.status || "").toLowerCase();
          return statusValue === "pending" || statusValue === "1";
        });

        if (latestPendingRequest) {
          setRequestStatus("pending");
          setRequestDate(latestPendingRequest.start_date || null);
        } else {
          setRequestStatus(null);
          setRequestDate(null);
        }
      } catch (statusError) {
        notifications.show({
          title: "Error",
          message: getApiErrorMessage(
            statusError,
            "Could not fetch registration status",
          ),
          color: "red",
        });
      } finally {
        setStatusLoading(false);
      }
    };

    loadStatus();
  }, [roll_no]);

  const isSubmissionLocked = requestStatus === "pending" || isRegistered;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmissionLocked) {
      notifications.show({
        title: "Info",
        message: "Your registration request is already pending.",
        color: "yellow",
      });
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      const msg = "Authentication token not found.";
      setError(msg);
      notifications.show({
        title: "Error",
        message: msg,
        color: "red",
      });
      return;
    }

    const formattedPaymentDate = paymentDate || "";
    const formattedStartDate = startDate || "";

    const formData = new FormData();
    formData.append("Txn_no", txnNo);
    formData.append("amount", amount);
    formData.append("img", file);
    formData.append("payment_date", formattedPaymentDate);
    formData.append("start_date", formattedStartDate);
    // formData.append("student_id", studentId);
    formData.append("mess_option", messOption);
    formData.append("student_id", roll_no);
    formData.append("registration_remark", remark);

    try {
      const response = await submitRegistrationRequest(formData, token);

      if (response.status === 200) {
        setError(null);
        setRequestStatus("pending");
        setRequestDate(formattedStartDate || null);
        notifications.show({
          title: "Success",
          message: "Form submitted successfully",
          color: "green",
        });
        // Reset form fields
        setTxnNo("");
        setAmount(0);
        setFile(null);
        setPaymentDate("");
        setStartDate("");
        setMessOption("");
        setRemark("");
      }
    } catch (errors) {
      const errorMessage = getApiErrorMessage(
        errors,
        "Error submitting the form. Please try again.",
      );
      setError(errorMessage);
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    }
  };

  return (
    <Container
      size="lg"
      style={{ maxWidth: "800px", width: "570px", marginTop: "25px" }}
    >
      <Paper
        shadow="md"
        radius="md"
        p="xl"
        withBorder
        style={{ width: "100%", padding: "30px" }}
      >
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Registration Form
        </Title>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {!statusLoading && requestStatus === "pending" && (
          <Alert color="yellow" mb="md">
            <Group justify="space-between" align="center">
              <span>
                Registration status: pending
                {requestDate ? ` (start date: ${requestDate})` : ""}
              </span>
              <Badge color="yellow" variant="light">
                PENDING
              </Badge>
            </Group>
          </Alert>
        )}

        {!statusLoading && isRegistered && (
          <Alert color="green" mb="md">
            You are already registered in mess. Deregister first before applying
            again.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Group grow mb="lg">
            <Select
              label="Select Mess"
              placeholder="Choose Mess"
              value={messOption}
              onChange={(value) => setMessOption(value)}
              data={[
                { value: "mess1", label: "Mess 1" },
                { value: "mess2", label: "Mess 2" },
              ]}
              radius="md"
              size="md"
              icon={<FunnelSimple size={18} />}
              required
              disabled={isSubmissionLocked}
            />
          </Group>

          <TextInput
            label="Transaction No."
            placeholder="Transaction No."
            value={txnNo}
            onChange={(e) => setTxnNo(e.target.value)}
            required
            disabled={isSubmissionLocked}
            radius="md"
            size="md"
            mt="xl"
            mb="md"
          />

          <NumberInput
            label="Amount"
            placeholder="Balance Amount"
            value={amount}
            onChange={setAmount}
            required
            disabled={isSubmissionLocked}
            radius="md"
            size="md"
            min={0}
            step={100}
            mb="lg"
          />

          <FileInput
            label="Image"
            placeholder="Choose file"
            value={file}
            onChange={setFile}
            accept="image/*"
            required
            disabled={isSubmissionLocked}
            size="md"
            mb="lg"
          />

          <TextInput
            label="Payment Date"
            placeholder="YYYY-MM-DD"
            type="date"
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.currentTarget.value)}
            max={todayISO}
            required
            disabled={isSubmissionLocked}
            radius="md"
            size="md"
            mb="lg"
          />

          <TextInput
            label="Start Date"
            placeholder="YYYY-MM-DD"
            type="date"
            value={startDate}
            min={todayISO}
            onChange={(event) => setStartDate(event.currentTarget.value)}
            required
            disabled={isSubmissionLocked}
            radius="md"
            size="md"
            mb="lg"
          />

          <Textarea
            label="Remark"
            placeholder="Add any remarks"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            radius="md"
            disabled={isSubmissionLocked}
            size="md"
            mb="lg"
          />

          <Button
            fullWidth
            size="md"
            radius="md"
            color="blue"
            type="submit"
            disabled={isSubmissionLocked}
          >
            {isSubmissionLocked ? "Request Pending" : "Submit"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default Registration;

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Flex,
  Group,
  NumberInput,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import {
  cancelRefundRequest,
  createRefundRequest,
  decideRefundRequest,
  fetchRefundRequests,
  getApiErrorMessage,
} from "../api";

const MANAGEMENT_ROLES = new Set(["mess_manager", "mess_warden", "mess_admin"]);

function RefundManagement() {
  const role = useSelector((state) => state.user.role);
  const isManager = MANAGEMENT_ROLES.has(role);

  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);

  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [financeCleared, setFinanceCleared] = useState(false);

  const [decisionRemarks, setDecisionRemarks] = useState({});
  const [decisionRefs, setDecisionRefs] = useState({});

  const token = localStorage.getItem("authToken");

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetchRefundRequests(token);
      setRequests(res.data?.payload || []);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to load refund requests."),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const pendingCount = useMemo(
    () => requests.filter((item) => String(item.status).toLowerCase() === "pending").length,
    [requests],
  );

  const onCreate = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0 || !reason.trim()) {
      notifications.show({
        title: "Validation",
        message: "Amount and reason are required.",
        color: "orange",
      });
      return;
    }
    try {
      await createRefundRequest(
        {
          amount: Number(amount),
          reason: reason.trim(),
          finance_cleared: financeCleared,
        },
        token,
      );
      notifications.show({
        title: "Submitted",
        message: "Refund request submitted.",
        color: "green",
      });
      setAmount(0);
      setReason("");
      setFinanceCleared(false);
      await loadRequests();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to submit refund request."),
        color: "red",
      });
    }
  };

  const onCancel = async (id) => {
    try {
      await cancelRefundRequest(id, token);
      notifications.show({
        title: "Cancelled",
        message: "Refund request cancelled.",
        color: "blue",
      });
      await loadRequests();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Could not cancel refund request."),
        color: "red",
      });
    }
  };

  const onDecision = async (id, status) => {
    try {
      await decideRefundRequest(
        {
          id,
          status,
          reviewer_remark: decisionRemarks[id] || "",
          reference_no: decisionRefs[id] || "",
        },
        token,
      );
      notifications.show({
        title: "Updated",
        message: `Refund request ${status}.`,
        color: "green",
      });
      await loadRequests();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to update refund request."),
        color: "red",
      });
    }
  };

  const statusBadge = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "approved") return <Badge color="green">Approved</Badge>;
    if (normalized === "rejected") return <Badge color="red">Rejected</Badge>;
    if (normalized === "cancelled") return <Badge color="gray">Cancelled</Badge>;
    return <Badge color="yellow">Pending</Badge>;
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Flex justify="space-between" align="center" mb="md">
        <Title order={3}>Refund Management</Title>
        <Button variant="light" onClick={loadRequests} loading={loading}>
          Refresh
        </Button>
      </Flex>

      {!isManager && (
        <form onSubmit={onCreate}>
          <Group grow mb="md">
            <NumberInput
              label="Refund Amount"
              min={1}
              value={amount}
              onChange={setAmount}
              required
            />
            <TextInput
              label="Finance Cleared"
              value={financeCleared ? "Yes" : "No"}
              onClick={() => setFinanceCleared((prev) => !prev)}
              readOnly
            />
          </Group>
          <Textarea
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            minRows={2}
            required
            mb="sm"
          />
          <Button type="submit" color="blue">
            Submit Refund Request
          </Button>
        </form>
      )}

      <Alert color="blue" mt="md" mb="md">
        Pending refund requests: {pendingCount}
      </Alert>

      <div style={{ overflowX: "auto" }}>
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Student</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Reason</Table.Th>
              <Table.Th>Finance Cleared</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Remark</Table.Th>
              <Table.Th>Ref</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {requests.map((item) => {
              const status = String(item.status || "").toLowerCase();
              return (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.id}</Table.Td>
                  <Table.Td>{item.student_id}</Table.Td>
                  <Table.Td>{item.amount}</Table.Td>
                  <Table.Td>{item.reason}</Table.Td>
                  <Table.Td>{item.finance_cleared ? "Yes" : "No"}</Table.Td>
                  <Table.Td>{statusBadge(item.status)}</Table.Td>
                  <Table.Td>
                    {isManager && status === "pending" ? (
                      <TextInput
                        size="xs"
                        value={decisionRemarks[item.id] || ""}
                        onChange={(e) =>
                          setDecisionRemarks((prev) => ({ ...prev, [item.id]: e.currentTarget.value }))
                        }
                        placeholder="Remark"
                      />
                    ) : (
                      item.reviewer_remark || "-"
                    )}
                  </Table.Td>
                  <Table.Td>
                    {isManager && status === "pending" ? (
                      <TextInput
                        size="xs"
                        value={decisionRefs[item.id] || ""}
                        onChange={(e) =>
                          setDecisionRefs((prev) => ({ ...prev, [item.id]: e.currentTarget.value }))
                        }
                        placeholder="Reference"
                      />
                    ) : (
                      "-"
                    )}
                  </Table.Td>
                  <Table.Td>
                    {isManager && status === "pending" ? (
                      <Group gap={6}>
                        <Button size="xs" color="green" onClick={() => onDecision(item.id, "approved")}>
                          Approve
                        </Button>
                        <Button size="xs" color="red" onClick={() => onDecision(item.id, "rejected")}>
                          Reject
                        </Button>
                      </Group>
                    ) : !isManager && status === "pending" ? (
                      <Button size="xs" color="gray" variant="outline" onClick={() => onCancel(item.id)}>
                        Cancel
                      </Button>
                    ) : (
                      <Text size="sm" c="dimmed">
                        -
                      </Text>
                    )}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </div>
    </Card>
  );
}

export default RefundManagement;

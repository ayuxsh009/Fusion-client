import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Group,
  Select,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import {
  assignRole,
  fetchRoleAssignments,
  getApiErrorMessage,
} from "../api";

const ASSIGNMENT_ROLES = new Set(["mess_warden", "mess_admin"]);

function RoleAssignmentManagement() {
  const role = useSelector((state) => state.user.role);
  const canAssign = ASSIGNMENT_ROLES.has(role);
  const token = localStorage.getItem("authToken");

  const [loading, setLoading] = useState(false);
  const [roleTypeFilter, setRoleTypeFilter] = useState("caretaker");
  const [assignments, setAssignments] = useState([]);
  const [transfers, setTransfers] = useState([]);

  const [roleType, setRoleType] = useState("caretaker");
  const [assigneeUsername, setAssigneeUsername] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetchRoleAssignments(token, {
        role_type: roleTypeFilter,
      });
      const payload = response.data?.payload || {};
      setAssignments(payload.assignments || []);
      setTransfers(payload.transfers || []);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to fetch role assignments."),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roleTypeFilter]);

  const onAssign = async (e) => {
    e.preventDefault();
    if (!assigneeUsername.trim()) {
      notifications.show({
        title: "Validation",
        message: "Assignee username is required.",
        color: "orange",
      });
      return;
    }

    try {
      await assignRole(
        {
          role_type: roleType,
          assignee_username: assigneeUsername.trim(),
          start_date: startDate || undefined,
          end_date: endDate || null,
          reason: reason.trim(),
        },
        token,
      );
      notifications.show({
        title: "Assigned",
        message: `${roleType} role assigned successfully.`,
        color: "green",
      });
      setAssigneeUsername("");
      setStartDate("");
      setEndDate("");
      setReason("");
      setRoleTypeFilter(roleType);
      await loadData();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to assign role."),
        color: "red",
      });
    }
  };

  if (!canAssign) {
    return (
      <Alert color="yellow">
        Role assignment is available only for mess warden/admin.
      </Alert>
    );
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Role Assignment</Title>
        <Button variant="light" onClick={loadData} loading={loading}>
          Refresh
        </Button>
      </Group>

      <form onSubmit={onAssign}>
        <Group grow mb="sm">
          <Select
            label="Role Type"
            value={roleType}
            onChange={(value) => setRoleType(value || "caretaker")}
            data={[
              { value: "caretaker", label: "Caretaker" },
              { value: "warden", label: "Warden" },
            ]}
          />
          <TextInput
            label="Assignee Username"
            value={assigneeUsername}
            onChange={(event) => setAssigneeUsername(event.currentTarget.value)}
            required
          />
        </Group>
        <Group grow mb="sm">
          <TextInput
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.currentTarget.value)}
          />
          <TextInput
            label="End Date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.currentTarget.value)}
          />
        </Group>
        <TextInput
          label="Reason"
          value={reason}
          onChange={(event) => setReason(event.currentTarget.value)}
          mb="sm"
        />
        <Button type="submit">Assign Role</Button>
      </form>

      <Group mt="lg" mb="sm" justify="space-between">
        <Title order={4}>Active/Recent Assignments</Title>
        <Select
          value={roleTypeFilter}
          onChange={(value) => setRoleTypeFilter(value || "caretaker")}
          data={[
            { value: "caretaker", label: "Caretaker" },
            { value: "warden", label: "Warden" },
          ]}
          style={{ minWidth: 160 }}
        />
      </Group>

      <div style={{ overflowX: "auto" }}>
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Role</Table.Th>
              <Table.Th>Assignee</Table.Th>
              <Table.Th>Active</Table.Th>
              <Table.Th>Start</Table.Th>
              <Table.Th>End</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {assignments.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" ta="center">
                    No role assignments found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              assignments.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.role_type}</Table.Td>
                  <Table.Td>{item.assignee}</Table.Td>
                  <Table.Td>{item.is_active ? "Yes" : "No"}</Table.Td>
                  <Table.Td>{item.start_date || "-"}</Table.Td>
                  <Table.Td>{item.end_date || "-"}</Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </div>

      <Title order={4} mt="lg" mb="sm">
        Transfer Log
      </Title>
      <div style={{ overflowX: "auto" }}>
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Role</Table.Th>
              <Table.Th>Previous</Table.Th>
              <Table.Th>New</Table.Th>
              <Table.Th>Pending Transferred</Table.Th>
              <Table.Th>At</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {transfers.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" ta="center">
                    No transfer logs found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              transfers.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.role_type}</Table.Td>
                  <Table.Td>{item.previous_assignee || "-"}</Table.Td>
                  <Table.Td>{item.new_assignee}</Table.Td>
                  <Table.Td>{item.transferred_pending_count}</Table.Td>
                  <Table.Td>{item.created_at}</Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </div>
    </Card>
  );
}

export default RoleAssignmentManagement;

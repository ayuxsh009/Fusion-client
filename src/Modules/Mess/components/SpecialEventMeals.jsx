import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Select,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import {
  createSpecialEventMeal,
  deleteSpecialEventMeal,
  fetchSpecialEventMeals,
  getApiErrorMessage,
} from "../api";

const MANAGEMENT_ROLES = new Set(["mess_manager", "mess_warden", "mess_admin"]);

function SpecialEventMeals() {
  const role = useSelector((state) => state.user.role);
  const canManage = MANAGEMENT_ROLES.has(role);
  const token = localStorage.getItem("authToken");

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [messOption, setMessOption] = useState("all");
  const [menu, setMenu] = useState("");
  const [budgetApproved, setBudgetApproved] = useState("yes");

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await fetchSpecialEventMeals(token, {
        active_only: !canManage,
      });
      setRows(response.data?.payload || []);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to fetch special event meals."),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !eventDate || !menu.trim()) {
      notifications.show({
        title: "Validation",
        message: "Title, event date, and menu are required.",
        color: "orange",
      });
      return;
    }

    try {
      await createSpecialEventMeal(
        {
          title: title.trim(),
          event_date: eventDate,
          mess_option: messOption,
          menu: menu.trim(),
          budget_approved: budgetApproved === "yes",
        },
        token,
      );
      notifications.show({
        title: "Created",
        message: "Special event meal published.",
        color: "green",
      });
      setTitle("");
      setEventDate("");
      setMessOption("all");
      setMenu("");
      setBudgetApproved("yes");
      await loadEvents();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to create special event meal."),
        color: "red",
      });
    }
  };

  const onDeactivate = async (id) => {
    try {
      await deleteSpecialEventMeal(id, token);
      notifications.show({
        title: "Updated",
        message: "Special event meal deactivated.",
        color: "blue",
      });
      await loadEvents();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to deactivate special event meal."),
        color: "red",
      });
    }
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Special Event Meals</Title>
        <Button variant="light" onClick={loadEvents} loading={loading}>
          Refresh
        </Button>
      </Group>

      {canManage && (
        <form onSubmit={onCreate}>
          <Group grow mb="sm">
            <TextInput
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
              required
            />
            <TextInput
              label="Event Date"
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.currentTarget.value)}
              required
            />
          </Group>
          <Group grow mb="sm">
            <Select
              label="Mess Option"
              value={messOption}
              onChange={(value) => setMessOption(value || "all")}
              data={[
                { value: "all", label: "All" },
                { value: "mess1", label: "Mess 1" },
                { value: "mess2", label: "Mess 2" },
              ]}
            />
            <Select
              label="Budget Approved"
              value={budgetApproved}
              onChange={(value) => setBudgetApproved(value || "yes")}
              data={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          </Group>
          <Textarea
            label="Menu"
            value={menu}
            onChange={(event) => setMenu(event.currentTarget.value)}
            minRows={2}
            required
            mb="sm"
          />
          <Button type="submit">Publish Event Meal</Button>
        </form>
      )}

      {!canManage && (
        <Alert color="blue" mb="md">
          Only active special event meals are visible to students.
        </Alert>
      )}

      <div style={{ overflowX: "auto" }}>
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Mess</Table.Th>
              <Table.Th>Menu</Table.Th>
              <Table.Th>Budget</Table.Th>
              <Table.Th>Status</Table.Th>
              {canManage && <Table.Th>Action</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={canManage ? 7 : 6}>
                  <Text c="dimmed" ta="center">
                    No special event meals found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              rows.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.title}</Table.Td>
                  <Table.Td>{item.event_date}</Table.Td>
                  <Table.Td>{item.mess_option}</Table.Td>
                  <Table.Td>{item.menu}</Table.Td>
                  <Table.Td>
                    {item.budget_approved ? (
                      <Badge color="green">Approved</Badge>
                    ) : (
                      <Badge color="yellow">Pending</Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {item.is_active ? (
                      <Badge color="green">Active</Badge>
                    ) : (
                      <Badge color="gray">Inactive</Badge>
                    )}
                  </Table.Td>
                  {canManage && (
                    <Table.Td>
                      {item.is_active ? (
                        <Button
                          size="xs"
                          color="red"
                          variant="outline"
                          onClick={() => onDeactivate(item.id)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Text size="sm" c="dimmed">
                          -
                        </Text>
                      )}
                    </Table.Td>
                  )}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </div>
    </Card>
  );
}

export default SpecialEventMeals;

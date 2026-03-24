import { useState, useEffect } from "react";
import {
  Button,
  Container,
  Flex,
  Grid,
  Loader,
  Paper,
  Select,
  SimpleGrid,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { fetchRegistrations, fetchFeedbackList } from "../api";

function StatCard({ label, value, color }) {
  return (
    <Paper
      shadow="xs"
      radius="md"
      p="md"
      withBorder
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <Text size="sm" color="dimmed">
        {label}
      </Text>
      <Text fw={700} size="xl">
        {value}
      </Text>
    </Paper>
  );
}

function MessReports() {
  const [loading, setLoading] = useState(true);
  const [messFilter, setMessFilter] = useState("all");
  const [registrations, setRegistrations] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [regRes, fbRes] = await Promise.all([
          fetchRegistrations(
            { type: "filter", status: "all", mess_option: "all" },
            token,
          ),
          fetchFeedbackList(token),
        ]);
        setRegistrations(regRes.data.payload || []);
        setFeedbackData(fbRes.data.payload || []);
      } catch {
        notifications.show({
          title: "Error",
          message: "Failed to load report data.",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredRegs =
    messFilter === "all"
      ? registrations
      : registrations.filter((r) => r.mess_option === messFilter);

  const totalStudents = filteredRegs.length;
  const registered = filteredRegs.filter(
    (r) => r.current_mess_status === "Registered",
  ).length;
  const deregistered = filteredRegs.filter(
    (r) => r.current_mess_status === "Deregistered",
  ).length;

  const filteredFeedback =
    messFilter === "all"
      ? feedbackData
      : feedbackData.filter((f) => f.mess === messFilter);
  const totalFeedback = filteredFeedback.length;
  const avgRating =
    totalFeedback > 0
      ? (
          filteredFeedback.reduce((s, f) => s + (f.mess_rating || 0), 0) /
          totalFeedback
        ).toFixed(2)
      : "N/A";

  const feedbackByType = filteredFeedback.reduce((acc, f) => {
    acc[f.feedback_type] = (acc[f.feedback_type] || 0) + 1;
    return acc;
  }, {});

  if (loading)
    return (
      <Flex justify="center" mt="xl">
        <Loader />
      </Flex>
    );

  return (
    <Container fluid mt="lg">
      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Mess Reports & Statistics
        </Title>

        <Flex justify="flex-end" mb="lg">
          <Select
            label="Filter by Mess"
            value={messFilter}
            onChange={setMessFilter}
            data={[
              { value: "all", label: "All Mess" },
              { value: "mess1", label: "Mess 1" },
              { value: "mess2", label: "Mess 2" },
            ]}
            style={{ width: 200 }}
          />
        </Flex>

        <Title order={4} mb="md">
          Registration Summary
        </Title>
        <SimpleGrid cols={3} mb="xl">
          <StatCard
            label="Total Students"
            value={totalStudents}
            color="#1c7ed6"
          />
          <StatCard label="Registered" value={registered} color="#40c057" />
          <StatCard label="Deregistered" value={deregistered} color="#fa5252" />
        </SimpleGrid>

        <Title order={4} mb="md">
          Feedback Summary
        </Title>
        <SimpleGrid cols={3} mb="xl">
          <StatCard
            label="Total Feedback"
            value={totalFeedback}
            color="#7950f2"
          />
          <StatCard label="Avg. Rating" value={avgRating} color="#fd7e14" />
          <StatCard
            label="Categories"
            value={Object.keys(feedbackByType).length}
            color="#15aabf"
          />
        </SimpleGrid>

        {Object.keys(feedbackByType).length > 0 && (
          <>
            <Title order={4} mb="sm">
              Feedback by Category
            </Title>
            <Table striped withBorder mb="xl">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Count</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {Object.entries(feedbackByType).map(([type, count]) => (
                  <Table.Tr key={type}>
                    <Table.Td style={{ textTransform: "capitalize" }}>
                      {type}
                    </Table.Td>
                    <Table.Td>{count}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </>
        )}

        <Title order={4} mb="sm">
          Student Registration List
        </Title>
        <Table striped withBorder highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Student ID</Table.Th>
              <Table.Th>Program</Table.Th>
              <Table.Th>Mess</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Balance</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredRegs.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text align="center" color="dimmed">
                    No records found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              filteredRegs.map((r, i) => (
                <Table.Tr key={i}>
                  <Table.Td>{r.student_id}</Table.Td>
                  <Table.Td>{r.program}</Table.Td>
                  <Table.Td>{r.mess_option}</Table.Td>
                  <Table.Td>
                    <Text
                      fw={600}
                      color={
                        r.current_mess_status === "Registered" ? "green" : "red"
                      }
                    >
                      {r.current_mess_status}
                    </Text>
                  </Table.Td>
                  <Table.Td>₹{r.balance}</Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}

export default MessReports;

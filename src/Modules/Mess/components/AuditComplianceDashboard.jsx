import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Group,
  Paper,
  SimpleGrid,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  fetchAuditCompliance,
  fetchFeedbackReports,
  generateFeedbackReport,
  getApiErrorMessage,
} from "../api";

function Metric({ label, value }) {
  return (
    <Paper p="md" withBorder radius="md">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="xl" fw={700}>
        {value}
      </Text>
    </Paper>
  );
}

function AuditComplianceDashboard() {
  const token = localStorage.getItem("authToken");
  const [loading, setLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [violations, setViolations] = useState([]);
  const [reports, setReports] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [auditRes, reportsRes] = await Promise.all([
        fetchAuditCompliance(token),
        fetchFeedbackReports(token),
      ]);
      const auditPayload = auditRes.data?.payload || {};
      setAuditLogs(auditPayload.audit_logs || []);
      setViolations(auditPayload.access_violations || []);
      setReports(reportsRes.data?.payload || []);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to load compliance data."),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onGenerateReport = async () => {
    try {
      await generateFeedbackReport(token);
      notifications.show({
        title: "Generated",
        message: "Weekly feedback report generated successfully.",
        color: "green",
      });
      await loadData();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to generate feedback report."),
        color: "red",
      });
    }
  };

  const latestReportSummary = useMemo(() => {
    if (reports.length === 0) {
      return null;
    }
    try {
      return JSON.parse(reports[0].report_snapshot || "{}");
    } catch {
      return null;
    }
  }, [reports]);

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Audit & Compliance</Title>
        <Group>
          <Button variant="light" onClick={loadData} loading={loading}>
            Refresh
          </Button>
          <Button onClick={onGenerateReport}>Generate Weekly Report</Button>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="md">
        <Metric label="Audit Logs (loaded)" value={auditLogs.length} />
        <Metric label="Access Violations (loaded)" value={violations.length} />
        <Metric label="Feedback Reports" value={reports.length} />
      </SimpleGrid>

      {latestReportSummary && (
        <Paper p="md" withBorder radius="md" mb="md">
          <Title order={5} mb="xs">
            Latest Weekly Report Snapshot
          </Title>
          <Text size="sm">
            Period: {latestReportSummary.week_start} to {latestReportSummary.week_end}
          </Text>
          <Text size="sm">
            Total: {latestReportSummary.total_feedback} | Food: {latestReportSummary.food} | Cleanliness:{" "}
            {latestReportSummary.cleanliness} | Maintenance: {latestReportSummary.maintenance} | Others:{" "}
            {latestReportSummary.others}
          </Text>
        </Paper>
      )}

      <Title order={4} mb="sm">
        Recent Audit Logs
      </Title>
      <div style={{ overflowX: "auto" }}>
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Time</Table.Th>
              <Table.Th>Action</Table.Th>
              <Table.Th>Entity</Table.Th>
              <Table.Th>Entity ID</Table.Th>
              <Table.Th>Details</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {auditLogs.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" ta="center">
                    No audit logs found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              auditLogs.slice(0, 30).map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.created_at}</Table.Td>
                  <Table.Td>{item.action}</Table.Td>
                  <Table.Td>{item.entity_type}</Table.Td>
                  <Table.Td>{item.entity_id || "-"}</Table.Td>
                  <Table.Td>{item.details || "-"}</Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </div>

      <Title order={4} mt="lg" mb="sm">
        Recent Access Violations
      </Title>
      <div style={{ overflowX: "auto" }}>
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Time</Table.Th>
              <Table.Th>Endpoint</Table.Th>
              <Table.Th>Method</Table.Th>
              <Table.Th>Reason</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {violations.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text c="dimmed" ta="center">
                    No access violations found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              violations.slice(0, 30).map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.occurred_at}</Table.Td>
                  <Table.Td>{item.endpoint}</Table.Td>
                  <Table.Td>{item.method}</Table.Td>
                  <Table.Td>{item.reason}</Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </div>
    </Card>
  );
}

export default AuditComplianceDashboard;

import React, { useState, useEffect } from "react";
import { Badge, Paper, Table, Text, Title } from "@mantine/core";
import { fetchRebateRequests } from "../api";
import PropTypes from "prop-types";

const STATUS_MAP = { "0": "Declined", "1": "Pending", "2": "Approved" };
const STATUS_COLOR = { "0": "red", "1": "yellow", "2": "green" };

const normalizeStatus = (status) => {
  const value = String(status ?? "").trim().toLowerCase();

  if (["1", "pending"].includes(value)) return "1";
  if (["2", "accept", "accepted", "approved"].includes(value)) return "2";
  if (["0", "reject", "rejected", "declined"].includes(value)) return "0";

  return "unknown";
};

function RebateStatus({ refreshToken }) {
  const [rebateData, setRebateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("authToken");
    fetchRebateRequests(token)
      .then((data) => setRebateData(data.payload || []))
      .catch((err) => setError(err.message || "Failed to load rebate data"))
      .finally(() => setLoading(false));
  }, [refreshToken]);

  if (loading) return <Text align="center">Loading...</Text>;
  if (error)
    return (
      <Text color="red" align="center">
        {error}
      </Text>
    );

  return (
    <Paper shadow="md" radius="md" p="lg" withBorder mt="lg">
      <Title order={3} mb="md">
        Rebate Status
      </Title>
      {rebateData.length === 0 ? (
        <Text align="center">No rebate applications found.</Text>
      ) : (
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Applied On</Table.Th>
              <Table.Th>Purpose</Table.Th>
              <Table.Th>From</Table.Th>
              <Table.Th>To</Table.Th>
              <Table.Th>Remark</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rebateData.map((item, idx) => {
              const normalizedStatus = normalizeStatus(item.status);

              return (
                <Table.Tr key={item.id || idx}>
                  <Table.Td>{item.app_date}</Table.Td>
                  <Table.Td>{item.purpose || "—"}</Table.Td>
                  <Table.Td>{item.start_date}</Table.Td>
                  <Table.Td>{item.end_date}</Table.Td>
                  <Table.Td>{item.rebate_remark || "—"}</Table.Td>
                  <Table.Td>
                    <Badge color={STATUS_COLOR[normalizedStatus] || "gray"}>
                      {STATUS_MAP[normalizedStatus] || "Unknown"}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      )}
    </Paper>
  );
}

RebateStatus.propTypes = {
  refreshToken: PropTypes.number,
};

RebateStatus.defaultProps = {
  refreshToken: 0,
};

export default RebateStatus;

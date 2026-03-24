import React, { useState, useEffect } from "react";
import { Table, Card, Button, TextInput, Flex, Text } from "@mantine/core";
import * as PhosphorIcons from "@phosphor-icons/react";
import { fetchRebateRequests, updateRebateRequest } from "../api";

function RespondToRebateRequest() {
  const [rebateData, setRebateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authToken = localStorage.getItem("authToken");
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const loadRebateRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRebateRequests(authToken);
        setRebateData(
          data.payload.map((item) => ({
            ...item,
            statusText:
              item.status === "2"
                ? "Approved"
                : item.status === "0"
                  ? "Declined"
                  : "Pending",
            status: item.status || "1",
            remark: item.rebate_remark || "",
          })),
        );
      } catch (err) {
        setError(err.message || "Failed to fetch rebate requests");
      } finally {
        setLoading(false);
      }
    };

    loadRebateRequests();
  }, [authToken]);

  // Update remark using a unique identifier (assumed item.id exists)
  const handleRemarkChange = (id, value) => {
    setRebateData((prev) =>
      prev.map((r) => (r.id === id ? { ...r, remark: value } : r)),
    );
  };

  // Update toggleApproval to use a unique identifier (id)
  const toggleApproval = async (id, newStatus) => {
    const item = rebateData.find((r) => r.id === id);
    if (!item) return;
    const updatedRequest = {
      ...item,
      rebate_remark: item.remark,
      status: newStatus,
    };

    try {
      const response = await updateRebateRequest(updatedRequest, authToken);
      if (response.status === 200) {
        setRebateData((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: newStatus,
                  statusText: newStatus === "2" ? "Approved" : "Declined",
                }
              : r,
          ),
        );
      } else {
        setError(`Failed to update approval: ${response.statusText}`);
      }
    } catch (errors) {
      setError(`Error updating approval: ${errors.message}`);
    }
  };

  const getFilteredRebateData = () => {
    switch (activeTab) {
      case "approved":
        return rebateData.filter((item) => item.status === "2");
      case "declined":
        return rebateData.filter((item) => item.status === "0");
      default:
        return rebateData.filter((item) => item.status === "1");
    }
  };

  const renderRows = () =>
    getFilteredRebateData().map((item) => (
      <Table.Tr key={item.id}>
        <Table.Td>{item.app_date}</Table.Td>
        <Table.Td>{item.student_id}</Table.Td>
        <Table.Td>{item.purpose || "No Purpose Provided"}</Table.Td>
        <Table.Td>{item.start_date}</Table.Td>
        <Table.Td>{item.end_date}</Table.Td>
        <Table.Td>
          {item.status === "1" ? (
            <TextInput
              placeholder="Enter remark"
              value={item.remark}
              onChange={(e) => handleRemarkChange(item.id, e.target.value)}
            />
          ) : (
            <Text>{item.remark || "No Remark Provided"}</Text>
          )}
        </Table.Td>
        <Table.Td>{item.statusText}</Table.Td>
        <Table.Td>
          {item.status === "1" ? (
            <>
              <Button
                onClick={() => toggleApproval(item.id, "2")}
                color="green"
              >
                Approve
              </Button>
              <Button onClick={() => toggleApproval(item.id, "0")} color="red">
                Decline
              </Button>
            </>
          ) : (
            <Text>No Actions Available</Text>
          )}
        </Table.Td>
      </Table.Tr>
    ));

  return loading ? (
    <Text ta="center">Loading data...</Text>
  ) : error ? (
    <Text color="red" ta="center">
      {error}
    </Text>
  ) : (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text size="lg" fw={700} ta="center" mb="md" c="#3B82F6">
        Respond to Rebate Request
      </Text>
      <Flex justify="center" gap={20} mb={30}>
        {["pending", "approved", "declined"].map((tab) => (
          <Button
            key={tab}
            leftSection={<PhosphorIcons.Clock size={20} />}
            variant={activeTab === tab ? "filled" : "outline"}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </Flex>
      {getFilteredRebateData().length === 0 ? (
        <Text ta="center">No {activeTab} requests.</Text>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <Table striped highlightOnHover withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Student ID</Table.Th>
                <Table.Th>Purpose</Table.Th>
                <Table.Th>From</Table.Th>
                <Table.Th>To</Table.Th>
                <Table.Th>Remark</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{renderRows()}</Table.Tbody>
          </Table>
        </div>
      )}
    </Card>
  );
}

export default RespondToRebateRequest;

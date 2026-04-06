import React, { useState, useEffect } from "react";
import { Table, Card, Text, Button, Flex, Loader, Alert } from "@mantine/core";
import { useSelector } from "react-redux";
import {
  fetchSpecialFoodRequests,
  getApiErrorMessage,
  getApiPayloadMessage,
  updateSpecialFoodRequest,
} from "../api";

const tableHeader = [
  "Date",
  "Student ID",
  "Food",
  "Reason",
  "From",
  "To",
  "Status",
  "Action",
];

const normalizeStatus = (status) => {
  const value = String(status ?? "").trim().toLowerCase();

  if (["1", "pending"].includes(value)) return "1";
  if (["2", "accept", "accepted", "approved"].includes(value)) return "2";
  if (["0", "reject", "rejected", "declined"].includes(value)) return "0";

  return "1";
};

const statusLabel = (status) => {
  if (status === "2") return "Approved";
  if (status === "0") return "Rejected";
  return "Pending";
};

function ViewSpecialFoodRequest() {
  const role = useSelector((state) => state.user.role);
  const canDecide = role === "mess_manager";

  const [foodRequestData, setFoodRequestData] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on mount
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const response = await fetchSpecialFoodRequests(token);
      if (response.data && response.data.payload) {
        setFoodRequestData(
          response.data.payload.map((item) => ({
            ...item,
            status: normalizeStatus(item.status),
          })),
        );
      } else {
        setFoodRequestData([]);
      }
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Failed to fetch special food requests."),
      );
      console.error("Error fetching special food requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect block
  useEffect(() => {
    fetchData();
  }, []);

  const updateApprovalStatus = async (newStatus, requestData) => {
    if (!canDecide) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const payload = {
        student_id: requestData.student_id,
        start_date: requestData.start_date,
        end_date: requestData.end_date,
        app_date: requestData.app_date,
        request: requestData.request,
        item1: requestData.item1,
        item2: requestData.item2,
        status: newStatus,
      };

      const response = await updateSpecialFoodRequest(payload, token);

      const apiStatus = Number(response?.data?.status || response.status || 0);
      if (apiStatus === 200) {
        const normalizedStatus = normalizeStatus(newStatus);
        setFoodRequestData((prevData) =>
          prevData.map((item) =>
            item.id === requestData.id
              ? { ...item, status: normalizedStatus }
              : item,
          ),
        );

        if (normalizedStatus === "2") {
          setActiveTab("approved");
        } else if (normalizedStatus === "0") {
          setActiveTab("rejected");
        }
      } else {
        setError(
          getApiPayloadMessage(
            response?.data,
            "Unable to update special food request status.",
          ),
        );
      }
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Unable to update special food request status.",
        ),
      );
      console.error("PUT error:", err);
    }
  };

  const getFilteredRequests = () => {
    if (activeTab === "approved") {
      return foodRequestData.filter((item) => item.status === "2");
    }
    if (activeTab === "rejected") {
      return foodRequestData.filter((item) => item.status === "0");
    }
    return foodRequestData.filter((item) => item.status === "1");
  };

  const renderHeader = (titles) =>
    titles.map((title, index) => (
      <Table.Th key={index}>
        <Flex align="center" justify="center" h="100%">
          {title}
        </Flex>
      </Table.Th>
    ));

  const renderRows = () =>
    getFilteredRequests().map((item, index) => (
      <Table.Tr key={item.id || `${item.student_id}-${item.app_date}-${index}`} h={50}>
        <Table.Td align="center">{item.app_date}</Table.Td>
        <Table.Td align="center">{item.student_id}</Table.Td>
        <Table.Td align="center">{item.item1}</Table.Td>
        <Table.Td align="center">{item.request}</Table.Td>
        <Table.Td align="center">{item.start_date}</Table.Td>
        <Table.Td align="center">{item.end_date}</Table.Td>
        <Table.Td align="center">{statusLabel(item.status)}</Table.Td>
        <Table.Td align="center">
          {canDecide && item.status === "1" ? (
            <Flex justify="center" gap={8}>
              <Button
                color="green"
                size="xs"
                onClick={() => updateApprovalStatus("2", item)}
              >
                Accept
              </Button>
              <Button
                color="red"
                size="xs"
                variant="outline"
                onClick={() => updateApprovalStatus("0", item)}
              >
                Reject
              </Button>
            </Flex>
          ) : (
            <Text size="sm" c="dimmed">
              {item.status === "1" ? "Monitor Only" : "No Action"}
            </Text>
          )}
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Flex justify="space-between" align="center" mb="lg">
        <Text size="lg" fw={700} c="#3B82F6">
          View Special Food Requests
        </Text>
        <Button onClick={fetchData} variant="light" color="blue" size="sm">
          Refresh
        </Button>
      </Flex>

      <Flex justify="center" gap={10} mb="md" wrap="wrap">
        <Button
          size="xs"
          variant={activeTab === "pending" ? "filled" : "outline"}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </Button>
        <Button
          size="xs"
          color="green"
          variant={activeTab === "approved" ? "filled" : "outline"}
          onClick={() => setActiveTab("approved")}
        >
          Approved
        </Button>
        <Button
          size="xs"
          color="red"
          variant={activeTab === "rejected" ? "filled" : "outline"}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" align="center" style={{ minHeight: "200px" }}>
          <Loader size="xl" />
        </Flex>
      ) : error ? (
        <Alert color="red" title="Error" mb="lg">
          {error}
        </Alert>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <Table striped highlightOnHover withColumnBorders>
            <Table.Thead>
              <Table.Tr>{renderHeader(tableHeader)}</Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {getFilteredRequests().length > 0 ? (
                renderRows()
              ) : (
                <Table.Tr>
                  <Table.Td
                    colSpan={tableHeader.length}
                    align="center"
                    style={{ fontStyle: "italic", color: "#888" }}
                  >
                    No {activeTab} food requests.
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </div>
      )}
    </Card>
  );
}

export default ViewSpecialFoodRequest;

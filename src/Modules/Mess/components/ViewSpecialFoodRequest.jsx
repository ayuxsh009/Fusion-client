import React, { useState, useEffect } from "react";
import { Table, Card, Text, Button, Flex, Loader, Alert } from "@mantine/core";
import { fetchSpecialFoodRequests, updateSpecialFoodRequest } from "../api";

const tableHeader = [
  "Date",
  "Student ID",
  "Food",
  "Reason",
  "From",
  "To",
  "Action",
];

function ViewSpecialFoodRequest() {
  const [foodRequestData, setFoodRequestData] = useState([]);
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
      console.log("Response:", response.data.payload);
      if (response.data && response.data.payload) {
        const filteredData = response.data.payload.filter(
          (item) => parseInt(item.status, 10) === 1,
        );
        setFoodRequestData(filteredData);
        console.log("Filtered Data:", filteredData);
      } else {
        setFoodRequestData([]);
      }
    } catch (err) {
      setError("Error fetching special food requests.");
      console.error("Error fetching special food requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect block
  useEffect(() => {
    fetchData();
  }, []);

  const updateApprovalStatus = async (status, requestData, index) => {
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
        status,
      };

      const response = await updateSpecialFoodRequest(payload, token);

      if (response.data.status === 200) {
        // Remove the request from table after updating status
        setFoodRequestData((prevData) =>
          prevData.filter((_, i) => i !== index),
        );
      }
    } catch (err) {
      setError("Failed to update request status.");
      console.error("PUT error:", err);
    }
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
    foodRequestData.map((item, index) => (
      <Table.Tr key={index} h={50}>
        <Table.Td align="center">{item.app_date}</Table.Td>
        <Table.Td align="center">{item.student_id}</Table.Td>
        <Table.Td align="center">{item.item1}</Table.Td>
        <Table.Td align="center">{item.request}</Table.Td>
        <Table.Td align="center">{item.start_date}</Table.Td>
        <Table.Td align="center">{item.end_date}</Table.Td>
        <Table.Td align="center">
          <Flex justify="center" gap={8}>
            <Button
              color="green"
              size="xs"
              onClick={() => updateApprovalStatus(2, item, index)}
            >
              Accept
            </Button>
            <Button
              color="red"
              size="xs"
              variant="outline"
              onClick={() => updateApprovalStatus(0, item, index)}
            >
              Reject
            </Button>
          </Flex>
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
              {foodRequestData.length > 0 ? (
                renderRows()
              ) : (
                <Table.Tr>
                  <Table.Td
                    colSpan={tableHeader.length}
                    align="center"
                    style={{ fontStyle: "italic", color: "#888" }}
                  >
                    No pending food requests.
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

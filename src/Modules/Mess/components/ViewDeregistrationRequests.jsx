import React, { useState, useEffect } from "react";
import { Table, Card, Text, Button, Flex, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  fetchDeregistrationRequests,
  getApiErrorMessage,
  updateDeregistrationRequest,
} from "../api";

function ViewDeregistrationRequests() {
  const [deregistrationData, setDeregistrationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDeregistrationRequests = async () => {
      try {
        const response = await fetchDeregistrationRequests(
          localStorage.getItem("authToken"),
        );
        console.log(response.data.payload);
        setDeregistrationData(
          response.data.payload.map((item) => ({
            ...item,
            remark: item.deregistration_remark,
          })),
        );
      } catch (err) {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    loadDeregistrationRequests();
  }, []);

  const handleUpdate = async (index, newStatus) => {
    try {
      const item = deregistrationData[index];
      const data = {
        student_id: item.student_id,
        end_date: item.end_date,
        status: newStatus,
        deregistration_remark: item.remark,
      };

      const response = await updateDeregistrationRequest(
        data,
        localStorage.getItem("authToken"),
      );

      if (response.status === 200) {
        setDeregistrationData((prevData) =>
          prevData.map((request, i) =>
            i === index ? { ...request, status: newStatus } : request,
          ),
        );
        notifications.show({
          title: "Success",
          message: "Request updated successfully",
          color: "green",
        });
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to update request",
          color: "red",
        });
      }
    } catch (err) {
      const message = getApiErrorMessage(err, "Error updating request");
      setError(message);
      notifications.show({
        title: "Error",
        message,
        color: "red",
      });
    }
  };

  const handleRemarkChange = (index, newRemark) => {
    setDeregistrationData((prevData) =>
      prevData.map((request, i) =>
        i === index ? { ...request, remark: newRemark } : request,
      ),
    );
  };

  const renderRows = () =>
    deregistrationData.map((item, index) => (
      <Table.Tr key={index}>
        <Table.Td align="center" p={12}>
          {item.student_id}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.end_date}
        </Table.Td>
        <Table.Td align="center" p={12}>
          <TextInput
            value={item.remark}
            onChange={(e) => handleRemarkChange(index, e.target.value)}
            placeholder="Enter remark"
          />
        </Table.Td>
        <Table.Td align="center" p={12}>
          <Button
            onClick={() => handleUpdate(index, "accept")}
            variant="filled"
            color="green"
            size="xs"
            disabled={item.status === "accept" || item.status === "reject"}
            style={{ marginRight: "8px" }}
          >
            Accept
          </Button>
          <Button
            onClick={() => handleUpdate(index, "reject")}
            variant="filled"
            color="red"
            size="xs"
            disabled={item.status === "accept" || item.status === "reject"}
          >
            Reject
          </Button>
        </Table.Td>
      </Table.Tr>
    ));

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text size="lg" fw={700} ta="center" mb="md" c="#3B82F6">
        Deregistration Requests
      </Text>

      <div style={{ overflowX: "auto" }}>
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Flex align="center" justify="center" h="100%">
                  Student ID
                </Flex>
              </Table.Th>
              <Table.Th>
                <Flex align="center" justify="center" h="100%">
                  End Date
                </Flex>
              </Table.Th>
              <Table.Th>
                <Flex align="center" justify="center" h="100%">
                  Remark
                </Flex>
              </Table.Th>
              <Table.Th>
                <Flex align="center" justify="center" h="100%">
                  Action
                </Flex>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>{renderRows()}</Table.Tbody>
        </Table>
      </div>
    </Card>
  );
}

export default ViewDeregistrationRequests;

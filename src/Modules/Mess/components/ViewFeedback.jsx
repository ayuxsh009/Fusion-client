import React, { useEffect, useState } from "react";
import { Table, Card, Text, Button, Flex } from "@mantine/core";
import { deleteFeedback, fetchFeedbackList } from "../api";

const tableHeader = [
  "Date",
  "Student ID",
  "Description",
  "Mess",
  "Status",
  "Actions",
];

function ViewFeedback() {
  const [activeTab, setActiveTab] = useState("food");
  const [feedbackData, setFeedbackData] = useState([]);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    fetchFeedbackList(authToken)
      .then((response) => response.data)
      .then((data) => {
        setFeedbackData(
          data.payload.map((feedback) => ({
            ...feedback,
            status: "Unread", // Initialize status
          })),
        );
      })
      .catch((error) => {
        console.error("Error fetching feedback data:", error);
      });
  }, [authToken]);

  const markAsRead = (index, feedback) => {
    deleteFeedback(
      {
        student_id: feedback.student_id,
        mess: feedback.mess,
        feedback_type: feedback.feedback_type,
        description: feedback.description,
        fdate: feedback.fdate,
      },
      authToken,
    )
      .then((response) => {
        if (response.status === 200) {
          // Update the status in the state instead of removing the item
          setFeedbackData((prevData) =>
            prevData.map((item, i) =>
              i === index ? { ...item, status: "Read" } : item,
            ),
          );
        } else {
          console.error("Failed to delete feedback:", response.statusText);
        }
      })
      .catch((error) => {
        console.error("Error deleting feedback:", error);
      });
  };

  const filteredFeedback = feedbackData.filter(
    (feedback) => feedback.feedback_type === activeTab,
  );

  const renderRows = () =>
    filteredFeedback.map((item, index) => (
      <Table.Tr key={index}>
        <Table.Td align="center">{item.fdate}</Table.Td>
        <Table.Td align="center">{item.student_id}</Table.Td>
        <Table.Td align="center">{item.description}</Table.Td>
        <Table.Td align="center">{item.mess}</Table.Td>
        <Table.Td align="center">{item.status}</Table.Td>
        <Table.Td align="center">
          <Button
            onClick={() => markAsRead(index, item)}
            variant="outline"
            color={item.status === "Unread" ? "red" : "gray"}
            size="xs"
            disabled={item.status === "Read"} // Disable button for "Read" feedback
          >
            {item.status === "Unread" ? "Mark as Read" : "Read"}
          </Button>
        </Table.Td>
      </Table.Tr>
    ));

  const renderHeader = (titles) => {
    return titles.map((title, index) => (
      <Table.Th key={index}>
        <Flex align="center" justify="center" h="100%">
          {title}
        </Flex>
      </Table.Th>
    ));
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text size="lg" fw={700} ta="center" mb="md" c="#3B82F6">
        View Feedback
      </Text>

      {/* Tabs for filtering feedback */}
      <Flex justify="center" align="center" mb={30} gap={20}>
        <Button
          onClick={() => setActiveTab("food")}
          variant={activeTab === "food" ? "filled" : "outline"}
          size="xs"
        >
          Food
        </Button>
        <Button
          onClick={() => setActiveTab("cleanliness")}
          variant={activeTab === "cleanliness" ? "filled" : "outline"}
          size="xs"
        >
          Cleanliness
        </Button>
        <Button
          onClick={() => setActiveTab("maintenance")}
          variant={activeTab === "maintenance" ? "filled" : "outline"}
          size="xs"
        >
          Maintenance
        </Button>
        <Button
          onClick={() => setActiveTab("others")}
          variant={activeTab === "others" ? "filled" : "outline"}
          size="xs"
        >
          Others
        </Button>
      </Flex>

      {/* Feedback Table */}
      <div style={{ overflowX: "auto" }}>
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>{renderHeader(tableHeader)}</Table.Tr>
          </Table.Thead>
          <Table.Tbody>{renderRows()}</Table.Tbody>
        </Table>
      </div>
    </Card>
  );
}

export default ViewFeedback;

import React, { useEffect, useState } from "react";
import { Table, Card, Text, Button, Flex, Alert, Loader } from "@mantine/core";
import { fetchFeedbackList, getApiErrorMessage } from "../api";

const tableHeader = [
  "Date",
  "Student ID",
  "Description",
  "Mess",
  "Status",
  "Actions",
];

const reviewedStorageKey = "mess_feedback_reviewed_keys";

const getFeedbackKey = (feedback) => {
  if (feedback?.id) {
    return String(feedback.id);
  }

  return [
    feedback?.student_id,
    feedback?.mess,
    feedback?.feedback_type,
    feedback?.description,
    feedback?.fdate,
  ].join("|");
};

function ViewFeedback() {
  const [activeTab, setActiveTab] = useState("food");
  const [feedbackData, setFeedbackData] = useState([]);
  const [reviewedFeedback, setReviewedFeedback] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    try {
      const storedKeys = JSON.parse(
        localStorage.getItem(reviewedStorageKey) || "[]",
      );
      setReviewedFeedback(new Set(storedKeys));
    } catch (error) {
      setReviewedFeedback(new Set());
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchFeedbackList(authToken)
      .then((response) => response.data)
      .then((data) => {
        setFeedbackData(data.payload || []);
      })
      .catch((error) => {
        setError(getApiErrorMessage(error, "Failed to fetch feedback data."));
        console.error("Error fetching feedback data:", error);
      })
      .finally(() => setLoading(false));
  }, [authToken]);

  const markAsRead = (feedback) => {
    const feedbackKey = getFeedbackKey(feedback);
    setReviewedFeedback((prev) => {
      const next = new Set(prev);
      next.add(feedbackKey);
      localStorage.setItem(reviewedStorageKey, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const filteredFeedback = feedbackData.filter(
    (feedback) => feedback.feedback_type === activeTab,
  );

  const renderRows = () =>
    filteredFeedback.map((item) => {
      const feedbackKey = getFeedbackKey(item);
      const isReviewed = reviewedFeedback.has(feedbackKey);

      return (
        <Table.Tr key={feedbackKey}>
        <Table.Td align="center">{item.fdate}</Table.Td>
        <Table.Td align="center">{item.student_id}</Table.Td>
        <Table.Td align="center">{item.description}</Table.Td>
        <Table.Td align="center">{item.mess}</Table.Td>
        <Table.Td align="center">{isReviewed ? "Reviewed" : "Unread"}</Table.Td>
        <Table.Td align="center">
          <Button
            onClick={() => markAsRead(item)}
            variant="outline"
            color={isReviewed ? "gray" : "red"}
            size="xs"
            disabled={isReviewed}
          >
            {isReviewed ? "Reviewed" : "Mark as Reviewed"}
          </Button>
        </Table.Td>
      </Table.Tr>
      );
    });

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

      {loading ? (
        <Flex justify="center" align="center" style={{ minHeight: "180px" }}>
          <Loader />
        </Flex>
      ) : error ? (
        <Alert color="red" title="Error">
          {error}
        </Alert>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <Table striped highlightOnHover withColumnBorders>
            <Table.Thead>
              <Table.Tr>{renderHeader(tableHeader)}</Table.Tr>
            </Table.Thead>
            <Table.Tbody>{renderRows()}</Table.Tbody>
          </Table>
        </div>
      )}
    </Card>
  );
}

export default ViewFeedback;

import React, { useState } from "react";
import {
  Textarea,
  Button,
  Container,
  Title,
  Paper,
  Select,
  Group,
} from "@mantine/core"; // Mantine UI components
import { PencilSimple, FunnelSimple } from "@phosphor-icons/react"; // Phosphor Icons
import { notifications } from "@mantine/notifications";
import { getApiErrorMessage, submitFeedback } from "../api";

function StudentFeedback() {
  const [messOption, setMessOption] = useState("mess1");
  const [feedbackType, setFeedbackType] = useState("cleanliness");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (description.trim() === "") {
      notifications.show({
        title: "Validation Error",
        message: "Feedback cannot be empty",
        color: "red",
      });
      return;
    }
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("authToken"); // Get the token from local storage
      const response = await submitFeedback(
        {
          mess: messOption, // Need to change the mess option based on the registration
          feedback_type: feedbackType,
          description,
        },
        token,
      );
      if (response.status === 200) {
        notifications.show({
          title: "Success",
          message: "Feedback submitted successfully",
          color: "green",
        });
        setDescription(""); // Clear the textarea after submission
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to submit feedback",
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(
          error,
          "An error occurred. Please try again.",
        ),
        color: "red",
      });
    } finally {
      setIsSubmitting(false); // Reset submission state
    }
  };

  return (
    <Container
      size="lg"
      style={{
        miw: "1100px",
        width: "1100px",
        marginTop: "25px",
      }}
    >
      <Paper
        shadow="md"
        radius="md"
        p="xl"
        withBorder
        style={{ padding: "30px" }}
      >
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Submit Feedback
        </Title>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* Dropdown for mess option */}
          <Group grow mb="lg">
            <Select
              label="Select Mess"
              placeholder="Choose Mess"
              value={messOption}
              onChange={setMessOption}
              data={[
                { value: "mess1", label: "Mess 1" },
                { value: "mess2", label: "Mess 2" },
              ]}
              radius="md"
              size="md"
              icon={<FunnelSimple size={18} />} // Phosphor icon
            />
          </Group>

          {/* Dropdown for description type */}
          <Group grow mb="lg">
            <Select
              label="Feedback Type"
              placeholder="Select Feedback Type"
              value={feedbackType}
              onChange={setFeedbackType}
              data={[
                { value: "cleanliness", label: "Cleanliness" },
                { value: "food", label: "Food" },
                { value: "maintenance", label: "Maintenance" },
                { value: "others", label: "Others" },
              ]}
              radius="md"
              size="md"
              icon={<FunnelSimple size={18} />} // Phosphor icon
            />
          </Group>

          {/* Textarea for description description */}
          <Textarea
            label="Description"
            placeholder="Enter your description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            radius="md"
            size="md"
            mb="lg"
            required
            minRows={4}
            icon={<PencilSimple size={18} />} // Phosphor icon
          />

          {/* Submit Button */}
          <Button
            fullWidth
            size="md"
            radius="md"
            color="blue"
            type="submit"
            disabled={isSubmitting}
            leftIcon={<PencilSimple size={18} />} // Phosphor icon
          >
            Submit Feedback
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default StudentFeedback;

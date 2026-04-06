import React, { useState } from "react";
import { Paper, Button, Textarea, Title, Group, Box } from "@mantine/core";
// import * as PhosphorIcons from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import {
  getApiErrorMessage,
  getApiPayloadMessage,
  submitFeedback,
} from "../api";

// Styles
const feedbackContainerStyle = {
  padding: "60px",
  backgroundColor: "#e6f7ff",
  borderRadius: "10px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  width: "90%",
  marginTop: "55px",
};

const headingStyle = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#0056b3",
  marginBottom: "30px",
};

const subHeadingStyle = {
  fontSize: "24px",
  fontWeight: "500",
  color: "#333",
  marginBottom: "20px",
};

const categoryButtonContainer = {
  marginBottom: "30px",
};

const formContainerStyle = {
  width: "100%", // Adjusted to make the form stretch fully horizontally
  padding: "30px",
  backgroundColor: "#fff",
  boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
  borderRadius: "10px",
};

const textareaStyle = {
  padding: "30px",
  marginBottom: "20px",
};

const submitButtonStyle = {
  backgroundColor: "#28a745",
  fontWeight: "bold",
};

function FeedbackPage() {
  const [selectedCategory, setSelectedCategory] = useState("food"); // Default category
  const [feedback, setFeedback] = useState(""); // State to store the feedback input
  const [isSubmitting, setIsSubmitting] = useState(false); // State to manage submission state

  const handleSubmit = async () => {
    if (feedback.trim() === "") {
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
          mess: "mess1", // Need to change the mess option based on the registration
          feedback_type: selectedCategory,
          description: feedback,
        },
        token,
      );
      const apiStatus = Number(response?.data?.status || response.status || 0);
      if (apiStatus === 200) {
        notifications.show({
          title: "Success",
          message: "Feedback submitted successfully",
          color: "green",
        });
        setFeedback(""); // Clear the textarea after submission
      } else {
        notifications.show({
          title: "Error",
          message: getApiPayloadMessage(
            response?.data,
            "Unable to submit feedback.",
          ),
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(
          error,
          "Unable to submit feedback.",
        ),
        color: "red",
      });
    } finally {
      setIsSubmitting(false); // Reset submission state
    }
  };

  return (
    <Box style={feedbackContainerStyle}>
      <Paper shadow="md" radius="md" p="lg" withBorder>
        <Title order={2} align="center" mb="lg" style={headingStyle}>
          Mess Feedback
        </Title>

        {/* Feedback category buttons */}
        <Group position="center" style={categoryButtonContainer}>
          <Button
            // leftIcon={<PhosphorIcons.ForkKnife size={20} />}
            variant={selectedCategory === "food" ? "filled" : "outline"}
            onClick={() => setSelectedCategory("food")}
            size="md"
          >
            Food
          </Button>
          <Button
            variant={selectedCategory === "cleanliness" ? "filled" : "outline"}
            onClick={() => setSelectedCategory("cleanliness")}
            size="md"
          >
            Cleanliness
          </Button>
          <Button
            variant={selectedCategory === "maintenance" ? "filled" : "outline"}
            onClick={() => setSelectedCategory("maintenance")}
            size="md"
          >
            Maintenance
          </Button>
          <Button
            variant={selectedCategory === "others" ? "filled" : "outline"}
            onClick={() => setSelectedCategory("others")}
            size="md"
          >
            Others
          </Button>
        </Group>

        {/* Feedback form */}
        <Box style={formContainerStyle}>
          <Title order={3} style={subHeadingStyle}>
            {selectedCategory} Feedback
          </Title>
          <Textarea
            placeholder={`Enter your feedback about ${selectedCategory}`}
            style={textareaStyle}
            value={feedback} // Bind feedback state
            onChange={(event) => setFeedback(event.currentTarget.value)} // Update feedback state
            minRows={5}
          />
          <Button
            // leftIcon={<PhosphorIcons.PaperPlaneTilt size={20} />}
            fullWidth
            style={submitButtonStyle}
            onClick={handleSubmit}
            disabled={isSubmitting} // Disable button while submitting
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default FeedbackPage;

import React, { useState, useEffect } from "react";
import {
  Button,
  Card as MantineCard,
  Flex,
  Loader,
  Paper,
  Select,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import {
  fetchAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getApiErrorMessage,
} from "../api";

function MessAnnouncements() {
  const role = useSelector((state) => state.user.role);
  const canPost = role === "mess_manager" || role === "mess_warden";

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [messOption, setMessOption] = useState("all");

  const token = localStorage.getItem("authToken");

  const loadAnnouncements = () => {
    fetchAnnouncements(token)
      .then((res) => setAnnouncements(res.data.payload))
      .catch((error) =>
        notifications.show({
          title: "Error",
          message: getApiErrorMessage(error, "Failed to load announcements"),
          color: "red",
        }),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      notifications.show({
        title: "Validation",
        message: "Title and content are required.",
        color: "orange",
      });
      return;
    }
    setSubmitting(true);
    try {
      await createAnnouncement(
        { title, content, mess_option: messOption },
        token,
      );
      notifications.show({
        title: "Success",
        message: "Announcement posted.",
        color: "green",
      });
      setTitle("");
      setContent("");
      setMessOption("all");
      loadAnnouncements();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to post announcement."),
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAnnouncement(id, token);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      notifications.show({
        title: "Deleted",
        message: "Announcement removed.",
        color: "blue",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to delete announcement."),
        color: "red",
      });
    }
  };

  return (
    <MantineCard shadow="sm" p="lg" radius="md" withBorder>
      <Text size="lg" fw={700} ta="center" mb="md" c="#3B82F6">
        Mess Announcements
      </Text>

      {canPost && (
        <Paper shadow="xs" radius="md" p="md" withBorder mb="xl">
          <Text fw={600} mb="sm">
            Post New Announcement
          </Text>
          <form onSubmit={handlePost}>
            <TextInput
              label="Title"
              placeholder="Announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              mb="sm"
              required
            />
            <Textarea
              label="Content"
              placeholder="Announcement content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minRows={3}
              mb="sm"
              required
            />
            <Select
              label="Mess"
              value={messOption}
              onChange={setMessOption}
              data={[
                { value: "all", label: "All Mess" },
                { value: "mess1", label: "Mess 1" },
                { value: "mess2", label: "Mess 2" },
              ]}
              mb="md"
            />
            <Button type="submit" loading={submitting} color="blue">
              Post Announcement
            </Button>
          </form>
        </Paper>
      )}

      {loading ? (
        <Flex justify="center" mt="xl">
          <Loader />
        </Flex>
      ) : announcements.length === 0 ? (
        <Text ta="center" c="dimmed" mt="xl">
          No announcements yet.
        </Text>
      ) : (
        announcements.map((announcement) => (
          <MantineCard
            key={announcement.id}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            mb="md"
          >
            <Flex justify="space-between" align="flex-start" mb="xs">
              <Text fw={600} size="lg">
                {announcement.title}
              </Text>
              <Flex gap="sm" align="center">
                <Text size="xs" c="dimmed">
                  {announcement.mess_option === "all"
                    ? "All Mess"
                    : announcement.mess_option === "mess1"
                      ? "Mess 1"
                      : "Mess 2"}
                </Text>
                {canPost && (
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    Delete
                  </Button>
                )}
              </Flex>
            </Flex>
            <Text mb="sm">{announcement.content}</Text>
            <Flex justify="space-between">
              <Text size="xs" c="dimmed">
                {announcement.created_by_name || "Staff"}
              </Text>
              <Text size="xs" c="dimmed">
                {new Date(announcement.created_at).toLocaleString()}
              </Text>
            </Flex>
          </MantineCard>
        ))
      )}
    </MantineCard>
  );
}

export default MessAnnouncements;

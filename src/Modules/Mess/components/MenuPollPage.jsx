import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Badge,
  Button,
  Card,
  Container,
  Flex,
  Loader,
  Paper,
  Progress,
  Radio,
  Select,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import {
  fetchPolls,
  createPoll,
  castPollVote,
  closePoll,
  deletePoll,
  getApiErrorMessage,
} from "../api";

function PollCard({ poll, canManage, onVote, onClose, onDelete }) {
  const [selected, setSelected] = useState(
    poll.user_vote ? String(poll.user_vote) : null,
  );
  const [voting, setVoting] = useState(false);

  const options = [
    { value: "1", label: poll.option1 },
    { value: "2", label: poll.option2 },
    poll.option3 && { value: "3", label: poll.option3 },
    poll.option4 && { value: "4", label: poll.option4 },
  ].filter(Boolean);

  const totalVotes = Object.values(poll.vote_counts).reduce((a, b) => a + b, 0);

  const handleVote = async () => {
    if (!selected) {
      notifications.show({
        title: "Select an option",
        message: "Please select an option to vote.",
        color: "orange",
      });
      return;
    }
    setVoting(true);
    try {
      await onVote(poll.id, parseInt(selected, 10));
      notifications.show({
        title: "Voted!",
        message: "Your vote has been recorded.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to cast vote."),
        color: "red",
      });
    } finally {
      setVoting(false);
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
      <Flex justify="space-between" align="flex-start" mb="sm">
        <div>
          <Text fw={600} size="lg">
            {poll.question}
          </Text>
          <Text size="xs" color="dimmed">
            {poll.mess_option === "all"
              ? "All Mess"
              : poll.mess_option === "mess1"
                ? "Mess 1"
                : "Mess 2"}
            {" · "}
            {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
          </Text>
        </div>
        <Flex gap="xs" align="center">
          <Badge color={poll.is_active ? "green" : "gray"}>
            {poll.is_active ? "Active" : "Closed"}
          </Badge>
          {canManage && (
            <>
              {poll.is_active && (
                <Button
                  size="xs"
                  color="orange"
                  variant="light"
                  onClick={() => onClose(poll.id)}
                >
                  Close
                </Button>
              )}
              <Button
                size="xs"
                color="red"
                variant="light"
                onClick={() => onDelete(poll.id)}
              >
                Delete
              </Button>
            </>
          )}
        </Flex>
      </Flex>

      {poll.is_active && !poll.user_vote ? (
        <>
          <Radio.Group value={selected} onChange={setSelected} mb="sm">
            {options.map((opt) => (
              <Radio
                key={opt.value}
                value={opt.value}
                label={opt.label}
                mb="xs"
              />
            ))}
          </Radio.Group>
          <Button size="sm" loading={voting} onClick={handleVote}>
            Submit Vote
          </Button>
        </>
      ) : (
        <div>
          {options.map((opt) => {
            const count = poll.vote_counts[`option${opt.value}`] || 0;
            const pct =
              totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isMyVote = poll.user_vote === parseInt(opt.value, 10);
            return (
              <div key={opt.value} style={{ marginBottom: 8 }}>
                <Flex justify="space-between" mb={2}>
                  <Text size="sm" fw={isMyVote ? 700 : 400}>
                    {opt.label} {isMyVote && "✓"}
                  </Text>
                  <Text size="sm" color="dimmed">
                    {count} ({pct}%)
                  </Text>
                </Flex>
                <Progress
                  value={pct}
                  color={isMyVote ? "blue" : "gray"}
                  size="sm"
                />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

PollCard.propTypes = {
  poll: PropTypes.shape({
    id: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    option1: PropTypes.string.isRequired,
    option2: PropTypes.string.isRequired,
    option3: PropTypes.string,
    option4: PropTypes.string,
    mess_option: PropTypes.string.isRequired,
    is_active: PropTypes.bool.isRequired,
    user_vote: PropTypes.number,
    vote_counts: PropTypes.object.isRequired,
  }).isRequired,
  canManage: PropTypes.bool.isRequired,
  onVote: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function MenuPollPage() {
  const role = useSelector((state) => state.user.role);
  const canManage = role === "mess_manager" || role === "mess_warden";

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [question, setQuestion] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [messOption, setMessOption] = useState("all");

  const token = localStorage.getItem("authToken");

  const loadPolls = () => {
    fetchPolls(token)
      .then((res) => setPolls(res.data.payload))
      .catch((error) =>
        notifications.show({
          title: "Error",
          message: getApiErrorMessage(error, "Failed to load polls."),
          color: "red",
        }),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPolls();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!question.trim() || !option1.trim() || !option2.trim()) {
      notifications.show({
        title: "Required",
        message: "Question and at least 2 options are required.",
        color: "orange",
      });
      return;
    }
    setSubmitting(true);
    try {
      await createPoll(
        {
          question,
          option1,
          option2,
          option3,
          option4,
          mess_option: messOption,
        },
        token,
      );
      notifications.show({
        title: "Created",
        message: "Poll created successfully.",
        color: "green",
      });
      setQuestion("");
      setOption1("");
      setOption2("");
      setOption3("");
      setOption4("");
      setShowForm(false);
      loadPolls();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to create poll."),
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (pollId, selectedOption) => {
    await castPollVote(pollId, selectedOption, token);
    loadPolls();
  };

  const handleClose = async (pollId) => {
    try {
      await closePoll(pollId, token);
      notifications.show({
        title: "Closed",
        message: "Poll has been closed.",
        color: "blue",
      });
      loadPolls();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to close poll."),
        color: "red",
      });
    }
  };

  const handleDelete = async (pollId) => {
    try {
      await deletePoll(pollId, token);
      setPolls((prev) => prev.filter((p) => p.id !== pollId));
      notifications.show({
        title: "Deleted",
        message: "Poll removed.",
        color: "blue",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to delete poll."),
        color: "red",
      });
    }
  };

  return (
    <Container fluid mt="lg">
      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Flex justify="space-between" align="center" mb="lg">
          <Title order={2} style={{ color: "#1c7ed6" }}>
            Menu Poll
          </Title>
          {canManage && (
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "Create Poll"}
            </Button>
          )}
        </Flex>

        {canManage && showForm && (
          <Paper shadow="xs" radius="md" p="md" withBorder mb="xl">
            <Title order={4} mb="sm">
              New Poll
            </Title>
            <form onSubmit={handleCreate}>
              <TextInput
                label="Question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                mb="sm"
                required
              />
              <TextInput
                label="Option 1"
                value={option1}
                onChange={(e) => setOption1(e.target.value)}
                mb="sm"
                required
              />
              <TextInput
                label="Option 2"
                value={option2}
                onChange={(e) => setOption2(e.target.value)}
                mb="sm"
                required
              />
              <TextInput
                label="Option 3 (optional)"
                value={option3}
                onChange={(e) => setOption3(e.target.value)}
                mb="sm"
              />
              <TextInput
                label="Option 4 (optional)"
                value={option4}
                onChange={(e) => setOption4(e.target.value)}
                mb="sm"
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
                Create Poll
              </Button>
            </form>
          </Paper>
        )}

        {loading ? (
          <Flex justify="center" mt="xl">
            <Loader />
          </Flex>
        ) : polls.length === 0 ? (
          <Text align="center" color="dimmed" mt="xl">
            No polls available.
          </Text>
        ) : (
          polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              canManage={canManage}
              onVote={handleVote}
              onClose={handleClose}
              onDelete={handleDelete}
            />
          ))
        )}
      </Paper>
    </Container>
  );
}

export default MenuPollPage;

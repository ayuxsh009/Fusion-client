import { useState, useEffect } from "react";
import {
  Badge,
  Button,
  Card,
  Container,
  Flex,
  Loader,
  Paper,
  Radio,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import {
  fetchVacationSurveys,
  createVacationSurvey,
  submitSurveyResponse,
  deleteVacationSurvey,
  getApiErrorMessage,
} from "../api";

const RESPONSE_LABELS = {
  staying: "Staying on campus (will need food)",
  leaving: "Leaving campus (will not need food)",
  undecided: "Not decided yet",
};

function SurveyCard({ survey, canManage, onRespond, onDelete }) {
  const [selected, setSelected] = useState(survey.user_response || "");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const totalResponses = Object.values(survey.response_counts).reduce(
    (a, b) => a + b,
    0,
  );

  const handleSubmit = async () => {
    if (!selected) {
      notifications.show({
        title: "Required",
        message: "Please select a response.",
        color: "orange",
      });
      return;
    }
    setSubmitting(true);
    try {
      await onRespond(survey.id, selected, remarks);
      notifications.show({
        title: "Submitted",
        message: "Your response has been recorded.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to submit response."),
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
      <Flex justify="space-between" align="flex-start" mb="sm">
        <div>
          <Text fw={600} size="lg">
            {survey.title}
          </Text>
          <Text size="sm" color="dimmed">
            {new Date(survey.vacation_start).toLocaleDateString()} –{" "}
            {new Date(survey.vacation_end).toLocaleDateString()}
          </Text>
          {survey.description && (
            <Text size="sm" mt={4}>
              {survey.description}
            </Text>
          )}
          <Text size="xs" color="dimmed" mt={4}>
            {survey.mess_option === "all"
              ? "All Mess"
              : survey.mess_option === "mess1"
                ? "Mess 1"
                : "Mess 2"}
            {" · "}
            {totalResponses} response{totalResponses !== 1 ? "s" : ""}
          </Text>
        </div>
        <Flex gap="xs" align="center">
          <Badge color={survey.is_active ? "green" : "gray"}>
            {survey.is_active ? "Active" : "Closed"}
          </Badge>
          {canManage && (
            <Button
              size="xs"
              color="red"
              variant="light"
              onClick={() => onDelete(survey.id)}
            >
              Delete
            </Button>
          )}
        </Flex>
      </Flex>

      {canManage && totalResponses > 0 && (
        <SimpleGrid cols={3} mb="sm">
          <Paper
            p="xs"
            radius="sm"
            style={{ background: "#e6fcf5", textAlign: "center" }}
          >
            <Text fw={700}>{survey.response_counts.staying}</Text>
            <Text size="xs">Staying</Text>
          </Paper>
          <Paper
            p="xs"
            radius="sm"
            style={{ background: "#fff5f5", textAlign: "center" }}
          >
            <Text fw={700}>{survey.response_counts.leaving}</Text>
            <Text size="xs">Leaving</Text>
          </Paper>
          <Paper
            p="xs"
            radius="sm"
            style={{ background: "#fff9db", textAlign: "center" }}
          >
            <Text fw={700}>{survey.response_counts.undecided}</Text>
            <Text size="xs">Undecided</Text>
          </Paper>
        </SimpleGrid>
      )}

      {!canManage && survey.is_active && (
        <>
          <Radio.Group value={selected} onChange={setSelected} mb="sm">
            {Object.entries(RESPONSE_LABELS).map(([val, label]) => (
              <Radio key={val} value={val} label={label} mb="xs" />
            ))}
          </Radio.Group>
          {!survey.user_response && (
            <Textarea
              placeholder="Additional remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              mb="sm"
            />
          )}
          {survey.user_response ? (
            <Text size="sm" color="green">
              Your response: {RESPONSE_LABELS[survey.user_response]}
            </Text>
          ) : (
            <Button size="sm" loading={submitting} onClick={handleSubmit}>
              Submit Response
            </Button>
          )}
        </>
      )}
    </Card>
  );
}

function VacationSurveyPage() {
  const role = useSelector((state) => state.user.role);
  const canManage = role === "mess_manager" || role === "mess_warden";

  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [vacationStart, setVacationStart] = useState("");
  const [vacationEnd, setVacationEnd] = useState("");
  const [messOption, setMessOption] = useState("all");

  const token = localStorage.getItem("authToken");

  const loadSurveys = () => {
    fetchVacationSurveys(token)
      .then((res) => setSurveys(res.data.payload))
      .catch((error) =>
        notifications.show({
          title: "Error",
          message: getApiErrorMessage(error, "Failed to load surveys."),
          color: "red",
        }),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !vacationStart || !vacationEnd) {
      notifications.show({
        title: "Required",
        message: "Title and vacation dates are required.",
        color: "orange",
      });
      return;
    }
    setSubmitting(true);
    try {
      await createVacationSurvey(
        {
          title,
          description,
          vacation_start: vacationStart,
          vacation_end: vacationEnd,
          mess_option: messOption,
        },
        token,
      );
      notifications.show({
        title: "Created",
        message: "Survey created.",
        color: "green",
      });
      setTitle("");
      setDescription("");
      setVacationStart("");
      setVacationEnd("");
      setShowForm(false);
      loadSurveys();
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to create survey.");
      notifications.show({ title: "Error", message: msg, color: "red" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (surveyId, response, remarks) => {
    await submitSurveyResponse(surveyId, response, remarks, token);
    loadSurveys();
  };

  const handleDelete = async (surveyId) => {
    try {
      await deleteVacationSurvey(surveyId, token);
      setSurveys((prev) => prev.filter((s) => s.id !== surveyId));
      notifications.show({
        title: "Deleted",
        message: "Survey removed.",
        color: "blue",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to delete survey."),
        color: "red",
      });
    }
  };

  return (
    <Container fluid mt="lg">
      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Flex justify="space-between" align="center" mb="lg">
          <Title order={2} style={{ color: "#1c7ed6" }}>
            Vacation Survey
          </Title>
          {canManage && (
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "Create Survey"}
            </Button>
          )}
        </Flex>

        {canManage && showForm && (
          <Paper shadow="xs" radius="md" p="md" withBorder mb="xl">
            <Title order={4} mb="sm">
              New Vacation Survey
            </Title>
            <form onSubmit={handleCreate}>
              <TextInput
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                mb="sm"
                required
              />
              <Textarea
                label="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                mb="sm"
              />
              <Flex gap="md" mb="sm">
                <TextInput
                  label="Vacation Start"
                  type="date"
                  value={vacationStart}
                  onChange={(e) => setVacationStart(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                <TextInput
                  label="Vacation End"
                  type="date"
                  value={vacationEnd}
                  onChange={(e) => setVacationEnd(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
              </Flex>
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
                Create Survey
              </Button>
            </form>
          </Paper>
        )}

        {loading ? (
          <Flex justify="center" mt="xl">
            <Loader />
          </Flex>
        ) : surveys.length === 0 ? (
          <Text align="center" color="dimmed" mt="xl">
            No vacation surveys available.
          </Text>
        ) : (
          surveys.map((survey) => (
            <SurveyCard
              key={survey.id}
              survey={survey}
              canManage={canManage}
              onRespond={handleRespond}
              onDelete={handleDelete}
            />
          ))
        )}
      </Paper>
    </Container>
  );
}

export default VacationSurveyPage;

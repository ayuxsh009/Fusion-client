import axios from "axios";
import { host } from "../../routes/globalRoutes";

const messRoute = "/mess/api";

// ---------------------------------------------------------------------------
// Route constants
// ---------------------------------------------------------------------------

export const updateBalanceRequestRoute = `${host}${messRoute}/updatePaymentRequestApi/`;
export const updateSemDatesRoute = `${host}${messRoute}/messRegApi/`;
export const viewRegistrationDataRoute = `${host}${messRoute}/get_mess_students/`;
export const viewMenuRoute = `${host}${messRoute}/menuApi/`;
export const viewUpdatePaymentRequestsRoute = `${host}${messRoute}/updatePaymentRequestApi/`;
export const viewRegistrationRequestsRoute = `${host}${messRoute}/registrationRequestApi/`;
export const specialFoodRequestRoute = `${host}${messRoute}/specialRequestApi/`;
export const feedbackRoute = `${host}${messRoute}/feedbackApi/`;
export const deregistrationRequestRoute = `${host}${messRoute}/deRegistrationRequestApi/`;
export const viewBillsRoute = `${host}${messRoute}/get_student_bill/`;
export const rebateRoute = `${host}${messRoute}/rebateApi/`;
export const registrationRequestRoute = `${host}${messRoute}/registrationRequestApi/`;
export const paymentRoute = `${host}${messRoute}/paymentsApi/`;
export const getMessStatusRoute = `${host}${messRoute}/get_mess_balance_statusApi/`;
export const announcementRoute = `${host}${messRoute}/announcementApi/`;
export const adminMessManagementRoute = `${host}${messRoute}/adminMessManagementApi/`;

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

const withAuth = (token, extraHeaders = {}) => ({
  headers: {
    Authorization: `Token ${token}`,
    ...extraHeaders,
  },
});

const stringifyValue = (value) => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => stringifyValue(item))
      .filter(Boolean)
      .join(", ");
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, val]) => {
        const parsed = stringifyValue(val);
        if (!parsed) {
          return "";
        }
        return `${key}: ${parsed}`;
      })
      .filter(Boolean);
    return entries.join(" | ");
  }

  return value ? String(value) : "";
};

const technicalKeys = new Set([
  "headers",
  "meta",
  "traceback",
  "stack",
  "exception",
  "config",
  "request",
  "response",
]);

const extractFirstReadableMessage = (value, depth = 0) => {
  if (!value || depth > 3) {
    return "";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }
    if (
      trimmed.startsWith("<!DOCTYPE") ||
      trimmed.startsWith("<html") ||
      trimmed.startsWith("<pre>") ||
      trimmed.includes("Traceback")
    ) {
      return "";
    }
    return trimmed;
  }

  if (Array.isArray(value)) {
    const parsed = value
      .map((item) => extractFirstReadableMessage(item, depth + 1))
      .find(Boolean);
    return parsed || "";
  }

  if (typeof value === "object") {
    const parsed = Object.entries(value)
      .filter(([key]) => !technicalKeys.has(String(key).toLowerCase()))
      .map(([, val]) => extractFirstReadableMessage(val, depth + 1))
      .find(Boolean);
    return parsed || "";
  }

  return "";
};

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong.",
) => {
  if (!error) {
    return fallback;
  }

  if (error.response?.data) {
    const { data } = error.response;

    if (typeof data === "string") {
      const parsedString = extractFirstReadableMessage(data);
      return parsedString || fallback;
    }

    const priorityKeys = [
      "message",
      "error",
      "detail",
      "reason",
      "non_field_errors",
    ];

    const priorityMessage = priorityKeys
      .map((key) => (data[key] ? stringifyValue(data[key]) : ""))
      .find(Boolean);
    if (priorityMessage) {
      return priorityMessage;
    }

    const parsedObject = extractFirstReadableMessage(data);
    if (parsedObject) {
      return parsedObject;
    }

    return fallback;
  }

  if (error.request) {
    return "Unable to reach the server. Please check your connection.";
  }

  if (error.message) {
    return error.message;
  }

  return fallback;
};

if (!axios.__fusionMessErrorInterceptorAdded) {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const parsedMessage = getApiErrorMessage(error, error.message);
      error.userMessage = parsedMessage;
      error.message = parsedMessage;
      return Promise.reject(error);
    },
  );

  axios.__fusionMessErrorInterceptorAdded = true;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export const fetchRegistrationRequests = (token) =>
  axios.get(viewRegistrationRequestsRoute, withAuth(token));

export const updateRegistrationRequest = (payload, token) =>
  axios.put(viewRegistrationRequestsRoute, payload, withAuth(token));

export const submitFeedback = (payload, token) =>
  axios.post(feedbackRoute, payload, withAuth(token));

export const fetchFeedbackList = (token) =>
  axios.get(
    feedbackRoute,
    withAuth(token, { "Content-Type": "application/json" }),
  );

export const deleteFeedback = (payload, token) =>
  axios.delete(feedbackRoute, {
    ...withAuth(token, { "Content-Type": "application/json" }),
    data: payload,
  });

export const submitDeregistrationRequest = (payload, token) =>
  axios.post(deregistrationRequestRoute, payload, withAuth(token));

export const deleteDeregistrationRequest = (id, token) =>
  axios.delete(deregistrationRequestRoute, {
    ...withAuth(token, { "Content-Type": "application/json" }),
    data: { id },
  });

export const fetchStudentRegistrationStatus = (studentId, token) =>
  axios.post(
    viewRegistrationDataRoute,
    { type: "search", student_id: studentId.toUpperCase() },
    withAuth(token),
  );

export const fetchMenu = (token) => axios.get(viewMenuRoute, withAuth(token));

export const updateMenuItems = (payload, token) =>
  axios.put(viewMenuRoute, payload, withAuth(token));

export const fetchPaymentHistory = (token) =>
  axios.get(
    paymentRoute,
    withAuth(token, { "Content-Type": "application/json" }),
  );

export const fetchRebateRequests = async (authToken) => {
  const response = await axios.get(
    rebateRoute,
    withAuth(authToken, { "Content-Type": "application/json" }),
  );
  return response.data;
};

export const updateRebateRequest = (payload, token) =>
  axios.put(
    rebateRoute,
    payload,
    withAuth(token, { "Content-Type": "application/json" }),
  );

export const submitSpecialFoodRequest = (payload, token) =>
  axios.post(
    specialFoodRequestRoute,
    payload,
    withAuth(token, { "Content-Type": "application/json" }),
  );

export const fetchSpecialFoodRequests = (token) =>
  axios.get(specialFoodRequestRoute, withAuth(token));

export const updateSpecialFoodRequest = (payload, token) =>
  axios.put(specialFoodRequestRoute, payload, withAuth(token));

export const submitBalanceUpdateRequest = (formData, token) =>
  axios.post(
    updateBalanceRequestRoute,
    formData,
    withAuth(token, { "Content-Type": "multipart/form-data" }),
  );

export const fetchBalanceRequests = (token) =>
  axios.get(updateBalanceRequestRoute, withAuth(token));

export const fetchBalanceRequestStatus = (studentId, token) =>
  axios.get(
    `${updateBalanceRequestRoute}?student_id=${studentId}`,
    withAuth(token),
  );

export const updateBalanceRequest = (payload, token) =>
  axios.put(updateBalanceRequestRoute, payload, withAuth(token));

export const updateSemesterDates = (payload, token) =>
  axios.post(updateSemDatesRoute, payload, withAuth(token));

export const fetchStudentBills = (studentId, token) =>
  axios.post(
    viewBillsRoute,
    { student_id: studentId },
    withAuth(token, { "Content-Type": "application/json" }),
  );

export const fetchMessStatus = (token) =>
  axios.get(
    getMessStatusRoute,
    withAuth(token, { "Content-Type": "application/json" }),
  );

export const submitRegistrationRequest = (formData, token) =>
  axios.post(
    registrationRequestRoute,
    formData,
    withAuth(token, { "Content-Type": "multipart/form-data" }),
  );

export const fetchAnnouncements = (token, messOption) =>
  axios.get(
    messOption
      ? `${announcementRoute}?mess_option=${messOption}`
      : announcementRoute,
    withAuth(token),
  );

export const createAnnouncement = (payload, token) =>
  axios.post(announcementRoute, payload, withAuth(token));

export const deleteAnnouncement = (id, token) =>
  axios.delete(announcementRoute, {
    ...withAuth(token, { "Content-Type": "application/json" }),
    data: { id },
  });

export const adminMessManagement = (payload, token) =>
  axios.post(adminMessManagementRoute, payload, withAuth(token));

export const menuPollRoute = `${host}${messRoute}/menuPollApi/`;

export const fetchPolls = (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return axios.get(
    query ? `${menuPollRoute}?${query}` : menuPollRoute,
    withAuth(token),
  );
};

export const createPoll = (payload, token) =>
  axios.post(menuPollRoute, payload, withAuth(token));

export const castPollVote = (pollId, selectedOption, token) =>
  axios.put(
    menuPollRoute,
    { poll_id: pollId, action: "vote", selected_option: selectedOption },
    withAuth(token),
  );

export const closePoll = (pollId, token) =>
  axios.put(
    menuPollRoute,
    { poll_id: pollId, action: "close" },
    withAuth(token),
  );

export const deletePoll = (pollId, token) =>
  axios.delete(menuPollRoute, {
    ...withAuth(token, { "Content-Type": "application/json" }),
    data: { poll_id: pollId },
  });

export const vacationSurveyRoute = `${host}${messRoute}/vacationSurveyApi/`;

export const fetchVacationSurveys = (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return axios.get(
    query ? `${vacationSurveyRoute}?${query}` : vacationSurveyRoute,
    withAuth(token),
  );
};

export const createVacationSurvey = (payload, token) =>
  axios.post(vacationSurveyRoute, payload, withAuth(token));

export const submitSurveyResponse = (surveyId, response, remarks, token) =>
  axios.put(
    vacationSurveyRoute,
    { survey_id: surveyId, response, remarks },
    withAuth(token),
  );

export const deleteVacationSurvey = (surveyId, token) =>
  axios.delete(vacationSurveyRoute, {
    ...withAuth(token, { "Content-Type": "application/json" }),
    data: { survey_id: surveyId },
  });

export const fetchDeregistrationRequests = (token) =>
  axios.get(deregistrationRequestRoute, withAuth(token));

export const updateDeregistrationRequest = (payload, token) =>
  axios.put(deregistrationRequestRoute, payload, withAuth(token));

export const fetchRegistrations = (payload, token) =>
  axios.post(viewRegistrationDataRoute, payload, withAuth(token));

export const submitRebateApplication = async (payload, authToken) => {
  const { data, ...response } = await axios.post(
    rebateRoute,
    payload,
    withAuth(authToken, { "Content-Type": "application/json" }),
  );
  return { response, data };
};

import React, { useEffect, useState } from "react";
import {
  TextInput,
  Button,
  Container,
  Title,
  Paper,
  Group,
  Select,
  Table,
  Space,
  Modal,
  Loader,
  Alert,
} from "@mantine/core";
import { MagnifyingGlass, Money, Receipt } from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import {
  fetchRegistrations,
  fetchStudentBills,
  fetchStudentPaymentsByStudent,
  getApiErrorMessage,
} from "../api";

function UpdateStudentBill() {
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [programFilter, setProgramFilter] = useState("All");
  const [messFilter, setMessFilter] = useState("All");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");
  const [openedBillModal, setOpenedBillModal] = useState(false);
  const [openedPaymentModal, setOpenedPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [billsData, setBillsData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);

  const token = localStorage.getItem("authToken");
  const monthIndex = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  const formatMessOption = (value) => {
    const normalized = String(value || "")
      .trim()
      .toLowerCase();
    if (normalized === "mess1") {
      return "Mess 1";
    }
    if (normalized === "mess2") {
      return "Mess 2";
    }
    if (normalized === "all") {
      return "All";
    }
    return value || "-";
  };

  const toMessFilterValue = (value) => {
    if (!value || value === "All") {
      return "all";
    }
    return value.toLowerCase().replace(/\s+/g, "");
  };

  // Function to handle filtering
  const handleFilter = async () => {
    setLoadingStudents(true);
    setStudentsError("");
    try {
      const requestData = searchQuery.trim()
        ? {
            type: "search",
            student_id: searchQuery.trim().toUpperCase(),
          }
        : {
            type: "filter",
            status: statusFilter === "All" ? "all" : statusFilter,
            program: programFilter === "All" ? "all" : programFilter,
            mess_option: toMessFilterValue(messFilter),
          };

      const response = await fetchRegistrations(requestData, token);
      const payload = response?.data?.payload;
      const rows = Array.isArray(payload) ? payload : payload ? [payload] : [];
      setFilteredStudents(rows);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Failed to fetch student bill management data.",
      );
      setStudentsError(message);
      notifications.show({
        title: "Error",
        message,
        color: "red",
      });
      setFilteredStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Open Bill Modal
  const handleViewBill = async (student) => {
    setSelectedStudent(student);
    setBillsData([]);
    setOpenedBillModal(true);
    setModalLoading(true);
    try {
      const response = await fetchStudentBills(student.student_id, token);
      const payload = response?.data?.payload || [];
      const bills = payload
        .map((bill) => ({
          month: bill.month,
          year: Number(bill.year) || 0,
          baseAmount: Number(bill.amount) || 0,
          rebateCount: Number(bill.rebate_count) || 0,
          rebateAmount: Number(bill.rebate_amount) || 0,
          yourAmount: Number(bill.total_bill) || 0,
        }))
        .sort((a, b) => {
          if (a.year !== b.year) {
            return b.year - a.year;
          }
          return (monthIndex[b.month] || 0) - (monthIndex[a.month] || 0);
        });
      setBillsData(bills);
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to fetch bills.");
      notifications.show({
        title: "Error",
        message,
        color: "red",
      });
    } finally {
      setModalLoading(false);
    }
  };

  // Open Payment Modal
  const handleViewPayments = async (student) => {
    setSelectedStudent(student);
    setPaymentData([]);
    setOpenedPaymentModal(true);
    setModalLoading(true);
    try {
      const response = await fetchStudentPaymentsByStudent(
        student.student_id,
        token,
      );
      const payload = response?.data?.payload || [];
      const payments = payload
        .map((payment) => ({
          month: payment.payment_month,
          year: String(payment.payment_year ?? ""),
          amountPaid: Number(payment.amount_paid) || 0,
        }))
        .sort((a, b) => {
          const yearA = Number(a.year) || 0;
          const yearB = Number(b.year) || 0;
          if (yearA !== yearB) {
            return yearB - yearA;
          }
          return (monthIndex[b.month] || 0) - (monthIndex[a.month] || 0);
        });
      setPaymentData(payments);
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to fetch payments.");
      notifications.show({
        title: "Error",
        message,
        color: "red",
      });
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    handleFilter();
  }, []);

  const centeredCellStyle = {
    textAlign: "center",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        marginTop: "0px",
      }}
    >
      <Container
        size="lg"
        miw="75rem"
        style={{
          maxWidth: "1250px",
          marginTop: "-180px", // Reduce the margin top of the container
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
            Student Bill Management
          </Title>

          <form>
            {/* Search section */}
            <TextInput
              label="Search by Roll Number"
              placeholder="Enter Roll Number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              radius="md"
              size="md"
              mb="lg"
              icon={<MagnifyingGlass size={18} />}
            />

            <Space h="md" />

            {/* Filter section */}
            <Group grow mb="lg">
              <Select
                label="Filter by Status"
                placeholder="Select Status"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                data={["Registered", "Deregistered", "All"]}
                radius="md"
                size="md"
              />
              <Select
                label="Filter by Program"
                placeholder="Select Program"
                value={programFilter}
                onChange={(value) => setProgramFilter(value)}
                data={["B.Tech", "M.Tech", "All"]}
                radius="md"
                size="md"
              />
              <Select
                label="Filter by Mess"
                placeholder="Select Mess"
                value={messFilter}
                onChange={(value) => setMessFilter(value)}
                data={["Mess 1", "Mess 2", "All"]}
                radius="md"
                size="md"
              />
            </Group>

            <Button
              fullWidth
              size="md"
              radius="md"
              color="blue"
              onClick={handleFilter}
            >
              Apply Filters
            </Button>

            <Space h="lg" />

            {/* Students Table */}
            {studentsError ? (
              <Alert color="red" title="Error">
                {studentsError}
              </Alert>
            ) : loadingStudents ? (
              <Group justify="center" my="md">
                <Loader size="sm" />
              </Group>
            ) : (
              <Table
                striped
                highlightOnHover
                withBorder
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <thead style={{ backgroundColor: "#f7f7f7" }}>
                  <tr>
                    <th style={centeredCellStyle}>Name</th>
                    <th style={centeredCellStyle}>Roll No</th>
                    <th style={centeredCellStyle}>Program</th>
                    <th style={centeredCellStyle}>Status</th>
                    <th style={centeredCellStyle}>Balance</th>
                    <th style={centeredCellStyle}>Mess</th>
                    <th style={centeredCellStyle}>View Bill</th>
                    <th style={centeredCellStyle}>View Payments</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => (
                      <tr
                        key={`${student.student_id}-${index}`}
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#fafafa" : "white",
                        }}
                      >
                        <td style={centeredCellStyle}>
                          {(student.first_name || "").trim()}{" "}
                          {(student.last_name || "").trim()}
                        </td>
                        <td style={centeredCellStyle}>{student.student_id}</td>
                        <td style={centeredCellStyle}>{student.program}</td>
                        <td style={centeredCellStyle}>
                          {student.current_mess_status}
                        </td>
                        <td style={centeredCellStyle}>{student.balance}</td>
                        <td style={centeredCellStyle}>
                          {formatMessOption(student.mess_option)}
                        </td>
                        <td style={centeredCellStyle}>
                          <Button
                            variant="outline"
                            size="xs"
                            radius="md"
                            onClick={() => handleViewBill(student)}
                            leftSection={<Receipt size={16} />}
                          >
                            View Bills
                          </Button>
                        </td>
                        <td style={centeredCellStyle}>
                          <Button
                            variant="outline"
                            size="xs"
                            radius="md"
                            onClick={() => handleViewPayments(student)}
                            leftSection={<Money size={16} />}
                          >
                            View Payments
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td style={centeredCellStyle} colSpan={8}>
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </form>
        </Paper>

        {/* Bill Modal */}
        <Modal
          opened={openedBillModal}
          onClose={() => setOpenedBillModal(false)}
          title={`Bills for ${selectedStudent?.first_name} ${selectedStudent?.last_name}`}
          centered
          size="lg"
        >
          {modalLoading ? (
            <Group justify="center" my="md">
              <Loader size="sm" />
            </Group>
          ) : (
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Base Amount</th>
                  <th>Rebate Count</th>
                  <th>Rebate Amount</th>
                  <th>Your Amount</th>
                </tr>
              </thead>
              <tbody>
                {billsData.length > 0 ? (
                  billsData.map((bill, index) => (
                    <tr key={`${bill.month}-${bill.year}-${index}`}>
                      <td>{bill.month}</td>
                      <td>{bill.year}</td>
                      <td>{bill.baseAmount}</td>
                      <td>{bill.rebateCount}</td>
                      <td>{bill.rebateAmount}</td>
                      <td>{bill.yourAmount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>
                      No bills found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Modal>

        {/* Payment Modal */}
        <Modal
          opened={openedPaymentModal}
          onClose={() => setOpenedPaymentModal(false)}
          title={`Payments for ${selectedStudent?.first_name} ${selectedStudent?.last_name}`}
          centered
          size="lg"
        >
          {modalLoading ? (
            <Group justify="center" my="md">
              <Loader size="sm" />
            </Group>
          ) : (
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {paymentData.length > 0 ? (
                  paymentData.map((payment, index) => (
                    <tr key={`${payment.month}-${payment.year}-${index}`}>
                      <td>{payment.month}</td>
                      <td>{payment.year}</td>
                      <td>{payment.amountPaid}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center" }}>
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Modal>
      </Container>
    </div>
  );
}

export default UpdateStudentBill;

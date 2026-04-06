import React, { useEffect, useState } from "react";
import { Table, Text, Card, Flex, Alert, Loader } from "@mantine/core";
import { fetchPaymentHistory, getApiErrorMessage } from "../api";

function PaymentHistory() {
  // const roleno = useSelector((state) => state.user.roll_no); // Use Redux state to get roll number
  const [paymentData, setPaymentData] = useState([]); // Store payment data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authToken = localStorage.getItem("authToken"); // Authorization token

  // Fetch payment data from API
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPaymentHistory(authToken)
      .then((response) => response.data)
      .then((data) => {
        // Map API response to the required format
        const mappedData = data.payload.map((payment) => ({
          paymentDate: payment.payment_date,
          amount: payment.amount_paid,
          month: payment.payment_month,
          year: payment.payment_year,
        }));
        setPaymentData(mappedData);
      })
      .catch((error) => {
        setError(getApiErrorMessage(error, "Failed to fetch payment history."));
        console.error("Error fetching payment data:", error);
      })
      .finally(() => setLoading(false));
  }, [authToken]);

  // Render table header
  const renderHeader = () => (
    <Table.Tr>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Payment Date
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Amount (₹)
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Month
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Year
        </Flex>
      </Table.Th>
    </Table.Tr>
  );

  // Render table rows dynamically from API data
  const renderRows = () =>
    paymentData.map((row, index) => (
      <Table.Tr key={index}>
        <Table.Td align="center" p={12}>
          {row.paymentDate}
        </Table.Td>
        <Table.Td align="center" p={12}>
          ₹{row.amount}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {row.month}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {row.year}
        </Table.Td>
      </Table.Tr>
    ));

  // Calculate total payments
  const totalPayments = paymentData.reduce(
    (total, item) => total + item.amount,
    0,
  );

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text size="lg" fw={700} ta="center" mb="md" c="#3B82F6">
        Payment History
      </Text>

      {loading ? (
        <Flex justify="center" align="center" style={{ minHeight: "180px" }}>
          <Loader />
        </Flex>
      ) : error ? (
        <Alert color="red" title="Error">
          {error}
        </Alert>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover withColumnBorders>
              <Table.Thead>{renderHeader()}</Table.Thead>
              <Table.Tbody>{renderRows()}</Table.Tbody>
            </Table>
          </div>

          <Flex direction="column" mt="lg">
            <Text size="lg" fw={700} ta="center" mt="md">
              Total Payments: ₹{totalPayments}
            </Text>
          </Flex>
        </>
      )}
    </Card>
  );
}

export default PaymentHistory;

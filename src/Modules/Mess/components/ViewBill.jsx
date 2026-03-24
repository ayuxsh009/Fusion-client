import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, Text, Button, Group, Card, Flex } from "@mantine/core";
import { DownloadSimple } from "@phosphor-icons/react";
import { fetchMessStatus, fetchStudentBills } from "../api";

function MessBilling() {
  const rollNo = useSelector((state) => state.user.roll_no); // Use Redux state to get roll number
  const [billData, setBillData] = useState([]); // Store fetched bill data
  const [totalBalance, setTotalBalance] = useState(0); // Track total remaining balance
  const [messStatus, setMessStatus] = useState(""); // Track current mess status
  const authToken = localStorage.getItem("authToken"); // Authorization token

  // Fetch payment data from API
  useEffect(() => {
    fetchStudentBills(rollNo, authToken)
      .then((response) => response.data)
      .then((data) => {
        if (data.payload) {
          // Map API response to the required format
          const mappedData = data.payload.map((bill) => ({
            month: `${bill.month}-${bill.year}`,
            baseAmount: bill.amount,
            rebateCount: bill.rebate_count,
            rebateAmount: bill.rebate_amount,
            monthlyBill: bill.total_bill,
          }));
          setBillData(mappedData);
        }
      })
      .catch((error) => {
        console.error("Error fetching payment data:", error);
      });
  }, [authToken, rollNo]);

  useEffect(() => {
    // Fetch registration status
    const fetchRegistrationStatus = async () => {
      try {
        const response = await fetchMessStatus(authToken);
        const { data } = response;
        setMessStatus(data.payload.current_mess_status);
        setTotalBalance(data.payload.current_rem_balance);
      } catch (error) {
        console.error("Error fetching registration status:", error);
      }
    };
    if (rollNo) {
      fetchRegistrationStatus();
    }
  });

  const renderHeader = () => (
    <Table.Tr>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Month
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Monthly Base Amount (₹)
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Rebate Count
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Rebate Amount (₹)
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Your Monthly Bill (₹)
        </Flex>
      </Table.Th>
    </Table.Tr>
  );

  const renderRows = () =>
    billData.map((row, index) => (
      <Table.Tr key={index}>
        <Table.Td align="center" p={12}>
          {row.month}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {row.baseAmount}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {row.rebateCount}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {row.rebateAmount}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {row.monthlyBill}
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text size="lg" fw={700} ta="center" mb="md" c="#3B82F6">
        View Bill
      </Text>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>{renderHeader()}</Table.Thead>
          <Table.Tbody>{renderRows()}</Table.Tbody>
        </Table>
      </div>

      <Flex direction="column" mt="lg">
        <Text size="lg" fw={700} mb="xs">
          Total Remaining Balance: ₹{totalBalance}
        </Text>
        <Text size="lg" fw={600}>
          Current Mess Status: {messStatus}
        </Text>
      </Flex>

      <Group justify="flex-end" mt="md">
        <Button
          variant="filled"
          color="blue"
          leftSection={<DownloadSimple size={16} />}
        >
          Download
        </Button>
      </Group>
    </Card>
  );
}

export default MessBilling;

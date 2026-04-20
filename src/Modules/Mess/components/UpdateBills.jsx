import React, { useState } from "react";
import {
  TextInput,
  NumberInput,
  Select,
  Button,
  Card,
  Text,
  Grid,
} from "@mantine/core";
import { User, Calendar } from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { host } from "../../../routes/globalRoutes";
import { getApiErrorMessage } from "../api";

function UpdateBill() {
  const [rollNo, setRollNo] = useState("");
  const [baseRate, setBaseRate] = useState(0);
  const [specialCharges, setSpecialCharges] = useState(0);
  const [previousBalance, setPreviousBalance] = useState(0);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [loading, setLoading] = useState(false);

  const monthToNumber = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rollNo || !month || !year || Number(baseRate) < 0) {
      notifications.show({
        title: "Validation Error",
        message:
          "Roll number, month, year and base rate are required. Values cannot be negative.",
        color: "red",
      });
      return;
    }

    const monthNo = monthToNumber[month];
    const billingMonth = `${year}-${monthNo}`;

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${host}/mess/api/monthlyBillApi/`,
        {
          student_id: rollNo.toUpperCase(),
          billing_month: billingMonth,
          base_rate: Number(baseRate) || 0,
          special_charges: Number(specialCharges) || 0,
          previous_balance: Number(previousBalance) || 0,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      if (response.status === 200) {
        const summary = response?.data?.payload || {};
        notifications.show({
          title: "Success",
          message: `Bill updated. Rebate days: ${summary.rebate_days ?? 0}, Total: ₹${summary.total_bill ?? 0}`,
          color: "green",
        });
        setRollNo("");
        setBaseRate(0);
        setSpecialCharges(0);
        setPreviousBalance(0);
        setMonth(null);
        setYear(null);
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to update bill"),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentYear - 2 + i),
    label: String(currentYear - 2 + i),
  }));

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text size="lg" fw={700} ta="center" mb="md" c="#3B82F6">
        Update Bill
      </Text>

      <form onSubmit={handleSubmit}>
        {/* Roll Number input */}
        <TextInput
          label="Roll No."
          placeholder="Roll No of Student"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          required
          radius="md"
          size="md"
          leftSection={<User size={20} />}
          mb="lg"
        />

        <Grid grow>
          {/* Base rate input (left side of the grid) */}
          <Grid.Col span={6}>
            <NumberInput
              label="Base Rate (per day)"
              placeholder="Enter daily base rate"
              value={baseRate}
              onChange={(value) => setBaseRate(value ?? 0)}
              required
              radius="md"
              size="md"
              min={0}
              step={1}
              mb="lg"
            />
          </Grid.Col>

          {/* Month select input (right side of the grid) */}
          <Grid.Col span={6}>
            <Select
              label="Month"
              placeholder="Select month"
              value={month}
              onChange={setMonth}
              required
              radius="md"
              size="md"
              leftSection={<Calendar size={20} />}
              data={[
                { value: "January", label: "January" },
                { value: "February", label: "February" },
                { value: "March", label: "March" },
                { value: "April", label: "April" },
                { value: "May", label: "May" },
                { value: "June", label: "June" },
                { value: "July", label: "July" },
                { value: "August", label: "August" },
                { value: "September", label: "September" },
                { value: "October", label: "October" },
                { value: "November", label: "November" },
                { value: "December", label: "December" },
              ]}
              mb="lg"
            />
          </Grid.Col>
        </Grid>

        <Grid grow>
          <Grid.Col span={6}>
            <NumberInput
              label="Special Charges"
              placeholder="Optional special charges"
              value={specialCharges}
              onChange={(value) => setSpecialCharges(value ?? 0)}
              radius="md"
              size="md"
              min={0}
              step={1}
              mb="lg"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="Previous Balance"
              placeholder="Optional previous balance"
              value={previousBalance}
              onChange={(value) => setPreviousBalance(value ?? 0)}
              radius="md"
              size="md"
              min={0}
              step={1}
              mb="lg"
            />
          </Grid.Col>
        </Grid>

        {/* Year select input */}
        <Select
          label="Year"
          placeholder="Select year"
          value={year}
          onChange={setYear}
          required
          radius="md"
          size="md"
          data={years}
          mb="lg"
        />

        {/* Submit button */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          radius="md"
          color="blue"
          loading={loading}
        >
          Update Bill
        </Button>
      </form>
    </Card>
  );
}

export default UpdateBill;

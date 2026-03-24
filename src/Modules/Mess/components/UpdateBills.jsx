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
  const [newAmount, setNewAmount] = useState("");
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rollNo || !newAmount || !month || !year) {
      notifications.show({
        title: "Validation Error",
        message: "All fields are required",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${host}/mess/api/monthlyBillApi/`,
        {
          student_id: rollNo.toUpperCase(),
          month,
          year,
          amount: newAmount,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      if (response.status === 200) {
        notifications.show({
          title: "Success",
          message: "Bill updated successfully",
          color: "green",
        });
        setRollNo("");
        setNewAmount("");
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
          {/* New Amount input (left side of the grid) */}
          <Grid.Col span={6}>
            <NumberInput
              label="New Amount"
              placeholder="New amount for this month's bill"
              value={newAmount}
              onChange={setNewAmount}
              required
              radius="md"
              size="md"
              min={0}
              step={100}
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

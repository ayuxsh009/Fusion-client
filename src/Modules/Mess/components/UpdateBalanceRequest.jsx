import React, { useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Card,
  Text,
  Space,
  FileInput,
  Grid,
} from "@mantine/core";
import { useSelector } from "react-redux";
import { User } from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import { submitBalanceUpdateRequest, getApiErrorMessage } from "../api";

function UpdateBalanceRequest() {
  const student_id = useSelector((state) => state.user.roll_no);
  const [image, setImage] = useState(null);
  const [paymentDate, setPaymentDate] = useState("");
  const [transactionNo, setTransactionNo] = useState("");
  const [amount, setAmount] = useState(null);
  const todayISO = new Date().toISOString().split("T")[0];

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("authToken");

    const formData = new FormData();
    formData.append("Txn_no", transactionNo);
    formData.append("amount", amount);
    formData.append("payment_date", dayjs(paymentDate).format("YYYY-MM-DD"));
    formData.append("img", image);
    formData.append("student_id", student_id);

    try {
      const response = await submitBalanceUpdateRequest(formData, token);
      console.log("Response:", response.data);

      setTransactionNo("");
      setAmount(null);
      setPaymentDate("");
      setImage(null);
      if (response.status === 200) {
        notifications.show({
          title: "Success",
          message: "Update Balance request submitted successfully!",
          color: "green",
        });
      }
    } catch (error) {
      console.error("Error posting data:", error);
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to submit request"),
        color: "red",
      });
    }
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text size="lg" fw={700} ta="center" mb="md" c="#3B82F6">
        Update Balance Request
      </Text>

      <form onSubmit={handleSubmit}>
        {/* Transaction Number input */}
        <TextInput
          label="Transaction No."
          placeholder="Transaction No."
          id="TxnNo"
          required
          radius="md"
          size="md"
          leftSection={<User size={20} />}
          labelProps={{ style: { marginBottom: "10px" } }}
          mt="xl"
          mb="md"
          value={transactionNo}
          onChange={(event) => setTransactionNo(event.currentTarget.value)}
        />
        <Grid grow>
          <Grid.Col span={6}>
            {/* Amount input */}
            <NumberInput
              label="Amount"
              placeholder="Balance Amount"
              id="amount"
              required
              radius="md"
              size="md"
              labelProps={{ style: { marginBottom: "10px" } }}
              min={0}
              step={100}
              mb="lg"
              value={amount}
              onChange={(value) => setAmount(value)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            {/* Image input */}
            <FileInput
              label="Image"
              placeholder="Choose file"
              value={image}
              onChange={setImage}
              accept="image/*"
              required
              size="md"
              labelProps={{ style: { marginBottom: "10px" } }}
              mb="lg"
            />
          </Grid.Col>
        </Grid>

        {/* Payment Date select */}
        <TextInput
          label="Payment Date"
          placeholder="YYYY-MM-DD"
          type="date"
          max={todayISO}
          value={paymentDate}
          onChange={(event) => setPaymentDate(event.currentTarget.value)}
          required
          radius="md"
          size="md"
          mb="lg"
          labelProps={{ style: { marginBottom: "10px" } }}
        />
        <Space h="xl" />

        {/* Submit button */}
        <Button type="submit" fullWidth size="md" radius="md" color="blue">
          Update
        </Button>
      </form>
    </Card>
  );
}

export default UpdateBalanceRequest;

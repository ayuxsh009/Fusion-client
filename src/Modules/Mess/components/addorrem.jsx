import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  FileInput,
  Group,
  Select,
  Space,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  FileArrowUp,
  MagnifyingGlass,
  PlusCircle,
  TrashSimple,
} from "@phosphor-icons/react";
import {
  fetchStudentRegistrationStatus,
  adminMessManagement,
  getApiErrorMessage,
} from "../api";

function ManageMess() {
  const [mess, setMess] = useState("mess1");
  const [rollNo, setRollNo] = useState("");
  const [amount, setAmount] = useState("0");
  const [excelFile, setExcelFile] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("authToken");

  const handleSearch = async () => {
    if (!rollNo.trim()) {
      notifications.show({
        title: "Required",
        message: "Enter a roll number to search.",
        color: "orange",
      });
      return;
    }
    setSearching(true);
    setStudentInfo(null);
    try {
      const res = await fetchStudentRegistrationStatus(rollNo.trim(), token);
      setStudentInfo(res.data.payload);
    } catch (error) {
      notifications.show({
        title: "Not Found",
        message: getApiErrorMessage(error, "Student not found."),
        color: "red",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!rollNo.trim()) {
      notifications.show({
        title: "Required",
        message: "Enter a roll number.",
        color: "orange",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await adminMessManagement(
        {
          action: "add",
          student_id: rollNo.trim(),
          mess_option: mess,
          amount: parseInt(amount) || 0,
        },
        token,
      );
      notifications.show({
        title: "Success",
        message: res.data.message,
        color: "green",
      });
      setStudentInfo(null);
    } catch (err) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(err, "Failed to add student."),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!rollNo.trim()) {
      notifications.show({
        title: "Required",
        message: "Enter a roll number.",
        color: "orange",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await adminMessManagement(
        { action: "remove", student_id: rollNo.trim() },
        token,
      );
      notifications.show({
        title: "Success",
        message: res.data.message,
        color: "blue",
      });
      setStudentInfo(null);
    } catch (err) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(err, "Failed to remove student."),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAll = async (messOption) => {
    setLoading(true);
    try {
      const res = await adminMessManagement(
        { action: "remove_all", mess_option: messOption },
        token,
      );
      notifications.show({
        title: "Done",
        message: res.data.message,
        color: "blue",
      });
    } catch (err) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(err, "Failed to remove students."),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text size="lg" fw={700} ta="center" mb="md" c="#3B82F6">
        Manage Mess Registrations
      </Text>

      <Space h="md" />
      <form onSubmit={(e) => e.preventDefault()}>
        <Group grow mb="md">
          <Select
            label="Mess*"
            placeholder="Select Mess"
            value={mess}
            onChange={setMess}
            data={[
              { value: "mess1", label: "Mess 1" },
              { value: "mess2", label: "Mess 2" },
            ]}
          />
          <TextInput
            label="Roll No*"
            placeholder="Student Roll Number Here"
            value={rollNo}
            onChange={(e) => setRollNo(e.currentTarget.value)}
          />
          <TextInput
            label="Initial Balance (for Add)"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.currentTarget.value)}
            type="number"
          />
        </Group>

        {studentInfo && (
          <Alert color="blue" mb="md">
            <Text fw={600}>{studentInfo.student_id}</Text>
            <Text size="sm">Status: {studentInfo.current_mess_status}</Text>
            <Text size="sm">Mess: {studentInfo.mess_option}</Text>
            <Text size="sm">Balance: ₹{studentInfo.balance}</Text>
          </Alert>
        )}

        <Group gap="sm" mb="md" justify="center">
          <Button
            leftSection={<MagnifyingGlass size={18} />}
            onClick={handleSearch}
            loading={searching}
          >
            Search
          </Button>
          <Button
            leftSection={<PlusCircle size={18} />}
            color="green"
            onClick={handleAdd}
            loading={loading}
          >
            Add
          </Button>
          <Button
            leftSection={<TrashSimple size={18} />}
            color="red"
            onClick={handleRemove}
            loading={loading}
          >
            Remove
          </Button>
        </Group>

        <Group gap="sm" mb="md" justify="center">
          <Button
            variant="outline"
            color="red"
            onClick={() => handleRemoveAll("mess1")}
            loading={loading}
          >
            Remove All from Mess 1
          </Button>
          <Button
            variant="outline"
            color="red"
            onClick={() => handleRemoveAll("mess2")}
            loading={loading}
          >
            Remove All from Mess 2
          </Button>
        </Group>

        <Text size="sm" fw={600} mb="sm">
          Add by uploading Excel
        </Text>
        <FileInput
          placeholder="Choose File"
          value={excelFile}
          onChange={setExcelFile}
          accept=".xlsx,.xls"
          leftSection={<FileArrowUp size={18} />}
          mb="md"
        />

        <Button
          leftSection={<FileArrowUp size={18} />}
          fullWidth
          color="blue"
          onClick={() => {
            notifications.show({
              title: "Info",
              message: "Excel bulk registration not yet implemented.",
              color: "blue",
            });
          }}
        >
          Register All
        </Button>

        <Space h="lg" />
        <div style={{ fontSize: "12px", color: "gray" }}>
          <ul>
            <li>
              The excel sheet should only contain three columns including the
              heading - Roll no, Balance, mess_option.
            </li>
            <li>File should be in .xlsx or .xls format.</li>
            <li>
              This registration will add the Students to the provided
              mess_option.
            </li>
          </ul>
        </div>
      </form>
    </Card>
  );
}

export default ManageMess;

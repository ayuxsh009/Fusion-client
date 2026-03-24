import React, { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  Card,
  Text,
  Table,
  Space,
  Group,
  Select,
} from "@mantine/core";
import { MagnifyingGlass, FunnelSimple } from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import { fetchRegistrations as fetchRegistrationsApi } from "../api";

function ViewRegistrations() {
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [programFilter, setProgramFilter] = useState("All");
  const [messFilter, setMessFilter] = useState("All");

  const loadRegistrations = async (search) => {
    try {
      const token = localStorage.getItem("authToken");
      let requestData = {};

      if (search) {
        requestData = {
          type: "search",
          student_id: searchQuery.toUpperCase(),
        };
      } else {
        requestData = {
          type: "filter",
          status: statusFilter === "All" ? "all" : statusFilter,
          program: programFilter === "All" ? "all" : programFilter,
          mess_option: messFilter.toLowerCase().replace(/\s+/g, ""),
        };
      }

      const response = await fetchRegistrationsApi(requestData, token);

      console.log("Fetched Data:", response.data); // Log the fetched data
      if (response.data.payload) {
        setFilteredStudents(
          Array.isArray(response.data.payload)
            ? response.data.payload
            : [response.data.payload],
        );
      } else {
        setFilteredStudents(
          Array.isArray(response.data) ? response.data : [response.data],
        );
      }
      console.log("Filtered Students Length:", filteredStudents.length);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      if (error.response && error.response.status === 404) {
        notifications.show({
          title: "Student Not Found",
          message: "The student does not exist.",
          color: "red",
        });
      } else {
        console.error("Error fetching registrations:", error);
      }
    }
  };

  useEffect(() => {
    loadRegistrations(false);
  }, []);

  const centeredCellStyle = {
    textAlign: "center",
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text size="lg" fw={700} ta="center" mb="md" c="#3B82F6">
        View Mess Registrations
      </Text>

      <form>
        {/* Search section with icon */}
        <Group grow mb="lg" align="flex-end">
          <TextInput
            label="Search by Roll Number"
            placeholder="Enter Roll Number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            radius="md"
            size="md"
            leftSection={<MagnifyingGlass size={18} />}
          />
          <Button
            size="md"
            radius="md"
            color="blue"
            onClick={() => loadRegistrations(true)}
            style={{ alignSelf: "flex-end", flex: "0 1 auto" }}
          >
            Search
          </Button>
        </Group>

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
            leftSection={<FunnelSimple size={18} />}
          />
          <Select
            label="Filter by Program"
            placeholder="Select Program"
            value={programFilter}
            onChange={(value) => setProgramFilter(value)}
            data={["B.Tech", "M.Tech", "All"]}
            radius="md"
            size="md"
            leftSection={<FunnelSimple size={18} />}
          />
          <Select
            label="Filter by Mess"
            placeholder="Select Mess"
            value={messFilter}
            onChange={(value) => setMessFilter(value)}
            data={["Mess 1", "Mess 2", "All"]}
            radius="md"
            size="md"
            leftSection={<FunnelSimple size={18} />}
          />
        </Group>

        <Button
          fullWidth
          size="md"
          radius="md"
          color="blue"
          onClick={() => loadRegistrations(false)}
        >
          Apply Filters
        </Button>

        <Space h="lg" />

        {/* Students Table */}
        <div style={{ overflowX: "auto" }}>
          <Table striped highlightOnHover withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={centeredCellStyle}>Name</Table.Th>
                <Table.Th style={centeredCellStyle}>Roll No</Table.Th>
                <Table.Th style={centeredCellStyle}>Program</Table.Th>
                <Table.Th style={centeredCellStyle}>Status</Table.Th>
                <Table.Th style={centeredCellStyle}>Mess</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <Table.Tr key={student.id}>
                    <Table.Td style={centeredCellStyle}>
                      {student.first_name}
                    </Table.Td>
                    <Table.Td style={centeredCellStyle}>
                      {student.student_id}
                    </Table.Td>
                    <Table.Td style={centeredCellStyle}>
                      {student.program}
                    </Table.Td>
                    <Table.Td style={centeredCellStyle}>
                      {student.current_mess_status}
                    </Table.Td>
                    <Table.Td style={centeredCellStyle}>
                      {student.mess_option}
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={5} style={{ textAlign: "center" }}>
                    No registrations found.
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </div>
      </form>
    </Card>
  );
}

export default ViewRegistrations;

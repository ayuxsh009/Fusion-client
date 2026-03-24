import React, { useState, useEffect } from "react";
import {
  Button,
  Divider,
  Flex,
  Loader,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { fetchMenu, updateMenuItems, getApiErrorMessage } from "../api";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEAL_CODE = {
  Monday: { breakfast: "MB", lunch: "ML", dinner: "MD" },
  Tuesday: { breakfast: "TB", lunch: "TL", dinner: "TD" },
  Wednesday: { breakfast: "WB", lunch: "WL", dinner: "WD" },
  Thursday: { breakfast: "THB", lunch: "THL", dinner: "THD" },
  Friday: { breakfast: "FB", lunch: "FL", dinner: "FD" },
  Saturday: { breakfast: "SB", lunch: "SL", dinner: "SD" },
  Sunday: { breakfast: "SUB", lunch: "SUL", dinner: "SUD" },
};

const emptyMenu = () =>
  Object.fromEntries(
    DAYS.map((d) => [d, { breakfast: "", lunch: "", dinner: "" }]),
  );

function buildMenuState(apiData, messOption) {
  const state = emptyMenu();
  apiData
    .filter((item) => item.mess_option === messOption)
    .forEach((item) => {
      for (const day of DAYS) {
        for (const meal of ["breakfast", "lunch", "dinner"]) {
          if (MEAL_CODE[day][meal] === item.meal_time) {
            state[day][meal] = item.dish;
          }
        }
      }
    });
  return state;
}

function UpdateMenu() {
  const [menu1, setMenu1] = useState(emptyMenu());
  const [menu2, setMenu2] = useState(emptyMenu());
  const [activeMess, setActiveMess] = useState("mess1");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    fetchMenu(token)
      .then((res) => {
        setMenu1(buildMenuState(res.data.payload, "mess1"));
        setMenu2(buildMenuState(res.data.payload, "mess2"));
      })
      .catch((error) =>
        notifications.show({
          title: "Error",
          message: getApiErrorMessage(error, "Failed to load menu"),
          color: "red",
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  const activeMenu = activeMess === "mess1" ? menu1 : menu2;
  const setActiveMenu = activeMess === "mess1" ? setMenu1 : setMenu2;

  const handleChange = (day, meal, value) => {
    setActiveMenu((prev) => ({
      ...prev,
      [day]: { ...prev[day], [meal]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    const items = [];
    for (const day of DAYS) {
      for (const meal of ["breakfast", "lunch", "dinner"]) {
        items.push({
          meal_time: MEAL_CODE[day][meal],
          dish: activeMenu[day][meal],
        });
      }
    }
    setSaving(true);
    try {
      await updateMenuItems({ mess_option: activeMess, items }, token);
      notifications.show({
        title: "Success",
        message: "Menu updated successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: getApiErrorMessage(error, "Failed to save menu"),
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Flex justify="center" mt="xl">
        <Loader />
      </Flex>
    );

  return (
    <div style={{ padding: "24px" }}>
      <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
        Update Mess Menu
      </Title>

      <Flex justify="center" gap="md" mb="md">
        <Button
          variant={activeMess === "mess1" ? "filled" : "outline"}
          onClick={() => setActiveMess("mess1")}
        >
          Mess 1
        </Button>
        <Button
          variant={activeMess === "mess2" ? "filled" : "outline"}
          onClick={() => setActiveMess("mess2")}
        >
          Mess 2
        </Button>
      </Flex>

      <Divider my="sm" />

      <form onSubmit={handleSubmit}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Day", "Breakfast", "Lunch", "Dinner"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "8px",
                    textAlign: "left",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  <Text fw={600}>{h}</Text>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day}>
                <td
                  style={{
                    padding: "8px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {day}
                </td>
                {["breakfast", "lunch", "dinner"].map((meal) => (
                  <td key={meal} style={{ padding: "6px" }}>
                    <TextInput
                      value={activeMenu[day][meal]}
                      onChange={(e) => handleChange(day, meal, e.target.value)}
                      placeholder={`${day} ${meal}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <Flex justify="center" mt="lg">
          <Button type="submit" loading={saving} color="blue" size="md">
            Save Menu
          </Button>
        </Flex>
      </form>
    </div>
  );
}

export default UpdateMenu;

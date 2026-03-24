import React from "react";
import { Tabs, Container, Paper, Title } from "@mantine/core";
import ApplyForRebate from "./ApplyForSpecialFood";
import SpecialFoodStatus from "./SpecialFoodStatus";

function SpecialFoodRequests() {
  return (
    <Container fluid mt="lg">
      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Special Food Requests
        </Title>

        {/* Tabs to switch between Apply for Special Food and Special Food Status */}
        <Tabs defaultValue="apply">
          <Tabs.List>
            <Tabs.Tab value="apply">Apply for Special Food</Tabs.Tab>
            <Tabs.Tab value="status">Special Food Status</Tabs.Tab>
          </Tabs.List>

          {/* Apply for Special Food Panel */}
          <Tabs.Panel value="apply" pt="md">
            <ApplyForRebate />{" "}
            {/* Render the Apply for Special Food component here */}
          </Tabs.Panel>

          {/* Special Food Status Panel */}
          <Tabs.Panel value="status" pt="md">
            <SpecialFoodStatus />{" "}
            {/* Render the Special Food Status component here */}
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
}

export default SpecialFoodRequests;

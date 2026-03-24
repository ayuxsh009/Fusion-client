import { Tabs } from "@mantine/core";
import ApplyForRebate from "./ApplyForRebate.jsx";
import RebateStatus from "./Rebatestatus.jsx";

function StudentRebatePage() {
  return (
    <Tabs defaultValue="apply">
      <Tabs.List>
        <Tabs.Tab value="apply">Apply for Rebate</Tabs.Tab>
        <Tabs.Tab value="status">Rebate Status</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="apply">
        <ApplyForRebate />
      </Tabs.Panel>
      <Tabs.Panel value="status">
        <RebateStatus />
      </Tabs.Panel>
    </Tabs>
  );
}

export default StudentRebatePage;

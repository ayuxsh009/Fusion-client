import { useState } from "react";
import { Tabs } from "@mantine/core";
import ApplyForRebate from "./ApplyForRebate.jsx";
import RebateStatus from "./Rebatestatus.jsx";

function StudentRebatePage() {
  const [activeTab, setActiveTab] = useState("apply");
  const [refreshToken, setRefreshToken] = useState(0);

  const handleRebateSubmitted = () => {
    setRefreshToken((prev) => prev + 1);
    setActiveTab("status");
  };

  return (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <Tabs.List>
        <Tabs.Tab value="apply">Apply for Rebate</Tabs.Tab>
        <Tabs.Tab value="status">Rebate Status</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="apply">
        <ApplyForRebate onSubmitted={handleRebateSubmitted} />
      </Tabs.Panel>
      <Tabs.Panel value="status">
        <RebateStatus refreshToken={refreshToken} />
      </Tabs.Panel>
    </Tabs>
  );
}

export default StudentRebatePage;

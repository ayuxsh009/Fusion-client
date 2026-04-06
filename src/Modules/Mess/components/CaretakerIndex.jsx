import {
  Box,
  Button,
  Container,
  Flex,
  Loader,
  Tabs,
  Text,
} from "@mantine/core";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import CustomBreadcrumbs from "../../../components/Breadcrumbs.jsx";
import classes from "../styles/messModule.module.css";
import UpdateSemDates from "./UpdateSemDates.jsx";
import MessActivities from "./MessActivities.jsx";
import ViewFeedback from "./ViewFeedback.jsx";
import RespondToRebateRequest from "./RespondRebate.jsx";
import ViewSpecialFoodRequest from "./ViewSpecialFoodRequest.jsx";
import RegDeregUpdatePayment from "./RegisterDeregisterUpdateRequest.jsx";
import UpdateMenu from "./UpdateMenu.jsx";
import MessRegistrations from "./MessRegistrations.jsx";
import ViewMenu from "./ViewMenu.jsx";
import MessAnnouncements from "./MessAnnouncements.jsx";
import MenuPollPage from "./MenuPollPage.jsx";
import VacationSurveyPage from "./VacationSurveyPage.jsx";
import RefundManagement from "./RefundManagement.jsx";
import SpecialEventMeals from "./SpecialEventMeals.jsx";
import AuditComplianceDashboard from "./AuditComplianceDashboard.jsx";

function Caretaker() {
  const [activeTab, setActiveTab] = useState("0");
  const tabsListRef = useRef(null);

  const tabItems = [
    { title: "View Feedback" },
    { title: "Requests " },
    { title: "Rebate Requests " },
    { title: "Special Food Requests " },
    { title: "View Menu" },
    { title: "Mess Activities" },
    { title: "Mess Registrations" },
    { title: "Update Menu" },
    { title: "Update Semester Dates" },
    { title: "Announcements" },
    { title: "Menu Poll" },
    { title: "Vacation Survey" },
    { title: "Refund Management" },
    { title: "Special Event Meals" },
    { title: "Audit & Compliance" },
  ];

  const handleTabChange = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(+activeTab + 1, tabItems.length - 1)
        : Math.max(+activeTab - 1, 0);
    setActiveTab(String(newIndex));
    tabsListRef.current.scrollBy({
      left: direction === "next" ? 50 : -50,
      behavior: "smooth",
    });
  };

  // Function to render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "0":
        return <ViewFeedback />;
      case "1":
        return <RegDeregUpdatePayment />;
      case "2":
        return <RespondToRebateRequest />;
      case "3":
        return <ViewSpecialFoodRequest />;
      case "4":
        return <ViewMenu />;
      case "5":
        return <MessActivities />;
      case "6":
        return <MessRegistrations />;
      case "7":
        return <UpdateMenu />;
      case "8":
        return <UpdateSemDates />;
      case "9":
        return <MessAnnouncements />;
      case "10":
        return <MenuPollPage />;
      case "11":
        return <VacationSurveyPage />;
      case "12":
        return <RefundManagement />;
      case "13":
        return <SpecialEventMeals />;
      case "14":
        return <AuditComplianceDashboard />;
      default:
        return <Loader />;
    }
  };

  return (
    <>
      {/* Navbar contents */}
      <CustomBreadcrumbs />
      <Flex justify="space-between" align="center" mt="lg">
        <Flex justify="flex-start" align="center" gap="1rem" mt="1.5rem">
          <Button
            onClick={() => handleTabChange("prev")}
            variant="default"
            p={0}
            bd={0}
            bg="transparent"
          >
            <CaretCircleLeft
              className={classes.fusionCaretCircleIcon}
              weight="light"
            />
          </Button>

          <Box className={classes.fusionTabsContainer} ref={tabsListRef}>
            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List style={{ display: "flex", flexWrap: "nowrap" }}>
                {tabItems.map((item, index) => (
                  <Tabs.Tab
                    value={`${index}`}
                    key={index}
                    className={
                      activeTab === `${index}`
                        ? classes.fusionActiveRecentTab
                        : ""
                    }
                  >
                    <Flex gap="4px">
                      <Text>{item.title}</Text>
                    </Flex>
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>
          </Box>

          <Button
            onClick={() => handleTabChange("next")}
            variant="default"
            p={0}
            bd={0}
            bg="transparent"
          >
            <CaretCircleRight
              className={classes.fusionCaretCircleIcon}
              weight="light"
            />
          </Button>
        </Flex>
      </Flex>

      <Container fluid>{renderTabContent()}</Container>
    </>
  );
}

export default Caretaker;

import { Loader } from "@mantine/core";
import { useSelector } from "react-redux";
import StudentIndex from "./components/StudentIndex.jsx";
import CaretakerIndex from "./components/CaretakerIndex.jsx";
import WardenIndex from "./components/WardenIndex.jsx";

function MessModulePage() {
  const role = useSelector((state) => state.user.role);

  if (role === "student") {
    return <StudentIndex />;
  }

  if (role === "mess_manager") {
    return <CaretakerIndex />;
  }

  if (role === "mess_warden") {
    return <WardenIndex />;
  }

  if (role === "mess_admin") {
    return <WardenIndex />;
  }

  return <Loader />;
}

export default MessModulePage;

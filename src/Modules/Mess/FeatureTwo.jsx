import { Loader } from "@mantine/core";
import { useSelector } from "react-redux";
import CaretakerIndex from "./components/CaretakerIndex.jsx";
import WardenIndex from "./components/WardenIndex.jsx";

function FeatureTwo() {
  const role = useSelector((state) => state.user.role);

  if (role === "mess_manager") {
    return <CaretakerIndex />;
  }

  if (role === "mess_warden") {
    return <WardenIndex />;
  }

  return <Loader />;
}

export default FeatureTwo;

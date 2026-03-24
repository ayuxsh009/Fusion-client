import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "../../components/layout";
import MessModule from "../../Modules/Mess";

function MessRoutes() {
  return (
    <Layout>
      <Routes>
        <Route index element={<MessModule />} />
        <Route path="*" element={<Navigate to="/mess" replace />} />
      </Routes>
    </Layout>
  );
}

export default MessRoutes;

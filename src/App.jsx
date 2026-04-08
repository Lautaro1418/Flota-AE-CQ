import { useState } from "react";
import LandingPage from "./LandingPage.jsx";
import FleetDashboard from "./FleetDashboard.jsx";
import FormsPage from "./FormsPage.jsx";
import AdminPanel from "./AdminPanel.jsx";

export default function App() {
  const [screen, setScreen] = useState("landing");

  if (screen === "dashboard") return <FleetDashboard onBack={() => setScreen("landing")} />;
  if (screen === "forms")     return <FormsPage onBack={() => setScreen("landing")} />;
  if (screen === "admin")     return <AdminPanel onBack={() => setScreen("landing")} />;

  return (
    <LandingPage
      onEnterDashboard={() => setScreen("dashboard")}
      onEnterForms={() => setScreen("forms")}
      onEnterAdmin={() => setScreen("admin")}
    />
  );
}

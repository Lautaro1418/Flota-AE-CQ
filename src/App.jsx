import { useState } from "react";
import LandingPage from "./LandingPage.jsx";
import FleetDashboard from "./FleetDashboard.jsx";

export default function App() {
  const [screen, setScreen] = useState("landing"); // "landing" | "dashboard"

  if (screen === "dashboard") {
    return <FleetDashboard onBack={() => setScreen("landing")} />;
  }

  return <LandingPage onEnterDashboard={() => setScreen("dashboard")} />;
}

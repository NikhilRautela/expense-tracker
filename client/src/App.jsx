import { useAuth } from "./context/AuthContext";

function App() {
  const { user } = useAuth();

  return (
    <div style={{ background: "#0f1117", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <h1 style={{ color: "white" }}>Welcome {user?.name} ✅</h1>
    </div>
  );
}

export default App;
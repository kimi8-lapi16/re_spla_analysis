import { useState } from "react";
import "./App.css";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";

function App() {
  const [page, setPage] = useState<"login" | "signup">("login");

  return (
    <div>
      <nav style={{ padding: "20px", borderBottom: "1px solid #ccc", textAlign: "center" }}>
        <button
          onClick={() => setPage("login")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: page === "login" ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ログイン
        </button>
        <button
          onClick={() => setPage("signup")}
          style={{
            padding: "10px 20px",
            backgroundColor: page === "signup" ? "#28a745" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          新規登録
        </button>
      </nav>

      {page === "login" ? <LoginPage /> : <SignupPage />}
    </div>
  );
}

export default App;

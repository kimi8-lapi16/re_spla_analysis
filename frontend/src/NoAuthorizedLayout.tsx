import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

export default function NotAuthorizedLayout() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
      }}
    >
      <Header />
      <div style={{ display: "flex", flexDirection: "row", height: "80vh" }}>
        <Suspense fallback={<>Loading ... </>}>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

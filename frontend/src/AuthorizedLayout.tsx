import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import SideBar from "./SideBar";

export default function AuthorizedLayout() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
      }}
    >
      <Header isLogin={true} />
      <div style={{ display: "flex", flexDirection: "row", height: "80vh" }}>
        <SideBar />
        <Suspense fallback={<>Loading ... </>}>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

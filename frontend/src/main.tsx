import { UIProvider } from "@yamada-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AuthorizedLayout from "./AuthorizedLayout";
import "./index.css";
import AnalysisPage from "./pages/AnalysisPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/Profile";
import SearchPage from "./pages/SearchPage";
import SignUpPage from "./pages/SignUpPage";
import UnAuthorizedLayout from "./UnAuthorizedLayout";

const routes = [
  {
    // 未ログイン時のレイアウト
    path: "/",
    element: <UnAuthorizedLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "signUp",
        element: <SignUpPage />,
      },
    ],
  },
  {
    path: "/",
    element: <AuthorizedLayout />,
    children: [
      {
        path: "analysis",
        element: <AnalysisPage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UIProvider>
      <RouterProvider router={router} />
    </UIProvider>
  </React.StrictMode>
);

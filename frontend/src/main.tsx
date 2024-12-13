import { UIProvider } from "@yamada-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AuthorizedLayout from "./AuthorizedLayout";
import "./index.css";
import AnalysisPage from "./pages/AnalysisPage";
import AuthorizationPage from "./pages/AuthorizationPage";
import ProfilePage from "./pages/Profile";
import SearchPage from "./pages/SearchPage";
import UnAuthorizedLayout from "./UnAuthorizedLayout";

const routes = [
  {
    // 未ログイン時のレイアウト
    path: "/",
    element: <UnAuthorizedLayout />,
    children: [
      {
        path: "/",
        element: <AuthorizationPage />,
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

import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { ConfigProvider } from "antd";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthService } from "./api";
import { NotificationProvider } from "./contexts/NotificationContext";
import "./index.css";
import { configureApiClient } from "./lib/api-client";
import { queryClient } from "./lib/query-client";
import { router } from "./router";
import { useAuthStore } from "./store/authStore";
import { antdTheme } from "./theme";

// Configure OpenAPI client with base URL, credentials, and logout handler
configureApiClient(() => {
  // Clear all cached queries on logout
  queryClient.clear();
  // Redirect to login page
  router.navigate({ to: "/login", replace: true });
});

// Try to restore session on app startup using refresh token (cookie)
async function initializeAuth() {
  try {
    const { accessToken } = await AuthService.authControllerRefresh();
    useAuthStore.getState().setAccessToken(accessToken);
  } catch {
    // Refresh failed - user needs to login
  }
}

// Initialize auth before rendering
initializeAuth().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ConfigProvider theme={antdTheme}>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <RouterProvider router={router} />
          </NotificationProvider>
        </QueryClientProvider>
      </ConfigProvider>
    </StrictMode>
  );
});

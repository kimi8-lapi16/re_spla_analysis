import { createRouter, createRoute, createRootRoute, redirect } from "@tanstack/react-router";
import { authUtils } from "./utils/auth";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MatchesPage } from "./pages/MatchesPage";
import { CreateMatchesPage } from "./pages/CreateMatchesPage";

const rootRoute = createRootRoute({});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    if (authUtils.isAuthenticated()) {
      throw redirect({ to: "/dashboard", replace: true });
    } else {
      throw redirect({ to: "/login", replace: true });
    }
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: () => {
    if (authUtils.isAuthenticated()) {
      throw redirect({ to: "/dashboard", replace: true });
    }
  },
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  beforeLoad: () => {
    if (authUtils.isAuthenticated()) {
      throw redirect({ to: "/dashboard", replace: true });
    }
  },
  component: SignupPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: () => {
    if (!authUtils.isAuthenticated()) {
      throw redirect({ to: "/login", replace: true });
    }
  },
  component: DashboardPage,
});

const matchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/matches",
  beforeLoad: () => {
    if (!authUtils.isAuthenticated()) {
      throw redirect({ to: "/login", replace: true });
    }
  },
  component: MatchesPage,
});

const matchesNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/matches/new",
  beforeLoad: () => {
    if (!authUtils.isAuthenticated()) {
      throw redirect({ to: "/login", replace: true });
    }
  },
  component: CreateMatchesPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  dashboardRoute,
  matchesRoute,
  matchesNewRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

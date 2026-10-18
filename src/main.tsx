import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { MarketingLayout } from "./components/SiteChrome";
import "./index.css";
import { ThemeProvider } from "./lib/theme";
import { DesignSystemsPage } from "./pages/DesignSystemsPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PricingPage } from "./pages/PricingPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { TemplateDetailPage } from "./pages/TemplateDetailPage";
import { TemplatesPage } from "./pages/TemplatesPage";

const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/build", element: <HomePage /> },
      { path: "/create", element: <HomePage /> },
      { path: "/templates", element: <TemplatesPage /> },
      { path: "/templates/:slug", element: <TemplateDetailPage /> },
      { path: "/pricing", element: <PricingPage /> },
      { path: "/design-systems", element: <DesignSystemsPage /> },
      { path: "/projects", element: <ProjectsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/build/:projectId",
    lazy: async () => ({ Component: (await import("./editor/EditorPage")).EditorPage }),
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);

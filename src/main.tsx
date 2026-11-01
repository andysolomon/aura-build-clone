import { StrictMode, type ComponentType } from "react";
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

/** Route-level code splitting for the library pages. */
const page = <M,>(load: () => Promise<M>, pick: (m: M) => ComponentType) => async () => ({ Component: pick(await load()) });

const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/build", element: <HomePage /> },
      { path: "/create", element: <HomePage /> },
      { path: "/templates", element: <TemplatesPage /> },
      { path: "/templates/:slug", element: <TemplateDetailPage /> },
      { path: "/components", lazy: page(() => import("./pages/ComponentsPage"), (m) => m.ComponentsPage) },
      { path: "/components/:slug", lazy: page(() => import("./pages/ComponentDetailPage"), (m) => m.ComponentDetailPage) },
      { path: "/agent-ui", lazy: page(() => import("./pages/AgentUIPage"), (m) => m.AgentUIPage) },
      { path: "/assets", lazy: page(() => import("./pages/AssetsPage"), (m) => m.AssetsPage) },
      { path: "/skills", lazy: page(() => import("./pages/SkillsPage"), (m) => m.SkillsPage) },
      { path: "/skills/:slug", lazy: page(() => import("./pages/SkillsPage"), (m) => m.SkillDetailPage) },
      { path: "/learn", lazy: page(() => import("./pages/LearnPage"), (m) => m.LearnPage) },
      { path: "/learn/:pageId", lazy: page(() => import("./pages/LearnPage"), (m) => m.LearnPage) },
      { path: "/changelog", lazy: page(() => import("./pages/ChangelogPage"), (m) => m.ChangelogPage) },
      { path: "/resources/tools/prompt-enhancer", lazy: page(() => import("./pages/PromptEnhancerPage"), (m) => m.PromptEnhancerPage) },
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

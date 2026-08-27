import { createBrowserRouter } from "react-router";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/routes/dashboard";
import Invoices from "@/routes/invoices";
import Clients from "@/routes/clients";
import { SignIn } from "@clerk/react";
import App from "./App";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <App /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "invoices", element: <Invoices /> },
      { path: "clients", element: <Clients /> },
    ],
  },
  {
    path: "/sign-in",
    element: (
      <div className="flex justify-center items-center min-h-screen">
        <SignIn />
      </div>
    ),
  },
]);

export default router;

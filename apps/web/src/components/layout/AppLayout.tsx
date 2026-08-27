import { useAuth, useUser } from "@clerk/react";
import { Outlet, Navigate } from "react-router";
import Sidebar from "./Sidebar";
import { useEffect } from "react";

function AppLayout() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    console.log("Effect triggered! State checks:", {
      isLoaded,
      isSignedIn,
      hasUser: !!user,
    });
    if (!isLoaded || !isSignedIn || !user) {
      console.log("Sync skipped: Auth is not fully ready yet.");
      return;
    }

    const syncUserWithBackend = async () => {
      try {
        console.log("Fetching token from Clerk...");
        const token = await getToken();
        console.log("Token received, firing fetch request to backend...");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/sync`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to sync user data");
        }

        const data = await response.json();
        console.log("User successfully synced:", data);
      } catch (error) {
        console.error("Error syncing user with backend:", error);
      }
    };

    syncUserWithBackend();
  }, [isLoaded, isSignedIn, user, getToken]);

  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;

  return (
    <div className="overflow-auto flex gap-2">
      <Sidebar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;

import { useUser } from "@clerk/react";

function App() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-white">
        Loading Auth...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-white">
        Please sign in.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 min-h-screen bg-background">
      <div>{user!.id}</div>
      <div>{user?.fullName}</div>
      <div>{user!.primaryEmailAddress?.emailAddress}</div>
    </div>
  );
}

export default App;

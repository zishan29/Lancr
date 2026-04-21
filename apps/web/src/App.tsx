import { Button } from "@/components/ui/button";
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'


function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <header>
        <Show when="signed-out">
          <Button variant={"outline"}>
            <SignInButton />
          </Button>
          <Button>
            <SignUpButton />
          </Button>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
    </div>
  );
}

export default App;

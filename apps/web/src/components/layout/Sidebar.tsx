import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";
import { NavLink } from "react-router";
import { Button } from "../ui/button";

function Sidebar() {
  return (
    <div className="flex flex-col justify-between min-h-screen min-w-1/7 max-w-1/6 bg-neutral-800 p-2 rounded-md">
      <div>
        <NavLink to="/" end>
          <h1 className="text-2xl font-bold my-2">Lancr</h1>
        </NavLink>
        <nav className="flex flex-col gap-2 justify-center ">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-white"
                : "text-muted-foreground hover:text-white"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/clients"
            end
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-white"
                : "text-muted-foreground hover:text-white"
            }
          >
            Clients
          </NavLink>
          <NavLink
            to="/invoices"
            end
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-white"
                : "text-muted-foreground hover:text-white"
            }
          >
            Invoices
          </NavLink>
        </nav>
      </div>
      <div className="flex justify-center gap-2 py-4">
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
      </div>
    </div>
  );
}

export default Sidebar;

import { useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import AddClientDialog from "@/components/clients/AddClientDialog";
import EditClientDialog from "@/components/clients/EditClientDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Client } from "@/types/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const Clients = () => {
  const { getToken } = useAuth();
  const [clients, setClients] = useState<Client[] | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/clients`,
        {
          method: "GET",
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
      setClients(data);
      console.log(data);
    };

    fetchClients();
  }, [getToken]);

  const handleClientAdded = (newClient: Client) => {
    setClients((prev) => (prev ? [...prev, newClient] : [newClient]));
  };

  const handleClientUpdate = (updatedClient: Client) => {
    setClients((prev) =>
      prev
        ? prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
        : [updatedClient],
    );
  };

  const handleClientDelete = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/clients/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Failed to delete client");
      setClients((prev) => (prev ? prev.filter((c) => c.id !== id) : []));
      setClientToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (clients === null) return <div>Loading...</div>;

  return (
    <>
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-muted-foreground text-sm">Manage your clients</p>
          </div>
          <AddClientDialog onClientAdded={handleClientAdded} />
        </div>
        {clientToEdit && (
          <EditClientDialog
            clientData={clientToEdit}
            open={!!clientToEdit}
            onOpenChange={(open) => !open && setClientToEdit(null)}
            onClientUpdate={(updated) => {
              handleClientUpdate(updated);
              setClientToEdit(null);
            }}
          />
        )}
        <AlertDialog
          open={!!clientToDelete}
          onOpenChange={(open) => !open && setClientToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {clientToDelete?.name}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this client and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() =>
                  clientToDelete?.id && handleClientDelete(clientToDelete.id)
                }
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div>
          {clients.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>GST Number</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client, index) => (
                    <TableRow key={client.id || `${client.name}-${index}`}>
                      <TableCell className="font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.company}</TableCell>
                      <TableCell>{client.gstNumber}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              •••
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onSelect={() => setClientToEdit(client)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() => setClientToDelete(client)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
              <p className="text-lg">No clients yet</p>
              <p className="text-sm">Add your first client to get started</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Clients;

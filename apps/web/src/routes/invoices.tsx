import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import type { Invoice } from "@/types/invoice";
import type { Client } from "@/types/client";
import { useAuth } from "@clerk/react";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import ReminderModal from "@/components/invoices/ReminderModal";

const statusColors = {
  draft: "secondary",
  sent: "default",
  paid: "success",
  overdue: "destructive",
} as const;

const Invoices = () => {
  const [invoices, setInvoices] = useState<
    { invoices: Invoice; clients: Client }[] | null
  >(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const { getToken } = useAuth();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [reminderState, setReminderState] = useState<{
    message: string;
    invoiceNumber: string;
    clientName: string;
  } | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/invoices`,
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
      setInvoices(data);
      console.log(data);
    };

    fetchClients();
  }, [getToken]);

  const handleInvoiceDelete = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/invoices/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Failed to delete invoice");
      toast.success("Invoice deleted");
      setInvoices((prev) =>
        prev ? prev.filter((c) => c.invoices.id !== id) : [],
      );
      setInvoiceToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "draft" | "sent" | "paid" | "overdue",
  ) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      const token = await getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/invoices/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!res.ok) throw new Error("Failed to update status");

      toast.success(`Invoice marked as ${newStatus}`);

      setInvoices((prev) =>
        prev
          ? prev.map((item) =>
              item.invoices.id === id
                ? { ...item, invoices: { ...item.invoices, status: newStatus } }
                : item,
            )
          : [],
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleGenerateReminder = async (
    invoiceId: string,
    invoiceNumber: string,
    clientName: string,
  ) => {
    setReminderState({ message: "", invoiceNumber, clientName });
    setGeneratingId(invoiceId);
    try {
      const token = await getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/invoices/${invoiceId}/remind`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to generate reminder");
      const data = await res.json();
      setReminderState({ message: data.message, invoiceNumber, clientName });
    } catch (err) {
      toast.error("Failed to generate reminder. Try again.");
    } finally {
      setGeneratingId(null);
    }
  };

  if (invoices === null) return <div>Loading...</div>;
  return (
    <>
      <AlertDialog
        open={!!invoiceToDelete}
        onOpenChange={(open) => !open && setInvoiceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {invoiceToDelete?.invoiceNumber}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {invoiceToDelete?.invoiceNumber} and
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                invoiceToDelete?.id && handleInvoiceDelete(invoiceToDelete.id)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ReminderModal
        reminderState={reminderState}
        setReminderState={setReminderState}
        generatingId={generatingId}
      />
      <div>
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Invoices</h1>
              <p className="text-muted-foreground text-sm">
                Manage your invoices
              </p>
            </div>
            <NavLink to={"/invoices/new"} end>
              <Button variant={"outline"}>Create Invoice</Button>
            </NavLink>
          </div>
        </div>
        <div>
          {" "}
          <div className="p-6 flex flex-col gap-6">
            {invoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="">Invoice Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(({ invoices: invoice, clients: client }) => (
                    <TableRow key={`${invoice.id}`}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{client?.name ?? "—"}</TableCell>
                      <TableCell>{invoice.totalAmount}</TableCell>
                      <TableCell>
                        <Badge
                          variant={statusColors[invoice.status ?? "draft"]}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={processingIds.has(invoice.id!)}
                            >
                              {processingIds.has(invoice.id!) ? "..." : "•••"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                Change status
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  {(
                                    [
                                      "draft",
                                      "sent",
                                      "paid",
                                      "overdue",
                                    ] as const
                                  ).map((statusOption) => (
                                    <DropdownMenuItem
                                      key={statusOption}
                                      disabled={invoice.status === statusOption}
                                      onSelect={() =>
                                        handleStatusChange(
                                          invoice.id!,
                                          statusOption,
                                        )
                                      }
                                      className="capitalize flex items-center justify-between"
                                    >
                                      {statusOption}
                                      {invoice.status === statusOption && (
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                      )}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuItem
                              onSelect={() =>
                                handleGenerateReminder(
                                  invoice.id!,
                                  invoice.invoiceNumber!,
                                  client.name,
                                )
                              }
                            >
                              Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() => setInvoiceToDelete(invoice)}
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
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
                <p className="text-lg">No invoices yet</p>
                <p className="text-sm">Add your first invoice to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Invoices;

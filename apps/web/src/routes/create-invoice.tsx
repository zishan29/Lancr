import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@clerk/react";
import type { Client } from "@/types/client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const CreateInvoice = () => {
  const [issueDate, setIssueDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();
  const [notes, setNotes] = useState<string>("");
  const [currency, setCurrency] = useState<string>("INR");
  const [clients, setClients] = useState<Client[] | null>(null);
  const [clientId, setClientId] = useState<string>();
  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { getToken } = useAuth();

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
      if (data && data.length > 0) {
        setClientId(data[0].id);
      }
      setClients(data);
      console.log(data);
    };

    fetchClients();
  }, [getToken]);

  const handleItemChange = (
    id: string,
    field: keyof LineItem,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      }),
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0,
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!clientId || !issueDate || !dueDate) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    const invoiceObj = {
      clientId,
      issueDate: issueDate.toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0],
      notes,
      currency,
    };

    const formattedItems = items.map(({ description, quantity, unitPrice }) => {
      const qty = Number(quantity) || 0;
      const price = Number(unitPrice) || 0;
      const itemAmount = qty * price;

      return {
        description,
        quantity,
        unitPrice: unitPrice,
        amount: itemAmount,
      };
    });
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invoice: invoiceObj, items: formattedItems }),
      });

      if (!res.ok) throw new Error("Failed to create invoice");

      toast.success("Invoice created successfully!");
      navigate("/invoices", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Invoice</h1>
          <p className="text-muted-foreground text-sm">Create a new invoice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FieldSet>
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field className="w-full col-span-2">
              <FieldLabel>Clients</FieldLabel>
              <Select
                value={clientId}
                onValueChange={(value) => setClientId(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id as string}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>Select your client.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>
                Issue Date <span className="text-destructive">*</span>
              </FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    data-empty={!issueDate}
                    className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                  >
                    {issueDate ? (
                      format(issueDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={issueDate}
                    onSelect={setIssueDate}
                    defaultMonth={issueDate}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field>
              <FieldLabel>
                Due Date <span className="text-destructive">*</span>
              </FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    data-empty={!dueDate}
                    className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                  >
                    {dueDate ? (
                      format(dueDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    disabled={(date) => (issueDate ? date < issueDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field className="col-span-2">
              <FieldLabel htmlFor="invoice-notes">Notes</FieldLabel>
              <Textarea
                id="invoice-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none"
              />
            </Field>

            <Field>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR — Indian Rupee</SelectItem>
                  <SelectItem value="USD">USD — US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR — Euro</SelectItem>
                  <SelectItem value="GBP">GBP — British Pound</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </FieldSet>

        <div className="flex flex-col gap-4 border rounded-lg p-4 bg-background">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Line Items</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="flex items-center gap-1"
            >
              <PlusIcon className="h-4 w-4" /> Add Item
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-12 gap-3 text-sm font-medium text-muted-foreground">
              <div className="col-span-5">
                Description <span className="text-destructive">*</span>
              </div>
              <div className="col-span-2">
                Quantity <span className="text-destructive">*</span>
              </div>
              <div className="col-span-2">
                Unit Price <span className="text-destructive">*</span>
              </div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-1"></div>
            </div>

            {items.map((item) => {
              const amount = (item.quantity || 0) * (item.unitPrice || 0);

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-3 items-center"
                >
                  <div className="col-span-5">
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(item.id, "description", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          "quantity",
                          Number(e.target.value),
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          "unitPrice",
                          Number(e.target.value),
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      disabled
                      value={amount.toFixed(2)}
                      className="bg-muted"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={items.length <= 1}
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <div className="text-right">
              <span className="text-sm text-muted-foreground">
                Total Amount:{" "}
              </span>
              <span className="text-xl font-bold ml-2">
                {currency} {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <Button type="submit" disabled={loading} className="self-center">
          {loading ? "Creating..." : "Create Invoice"}
        </Button>
        <Button
          className="self-center"
          variant="ghost"
          onClick={() => navigate(-1)}
        >
          ← Back
        </Button>
      </form>
    </div>
  );
};

export default CreateInvoice;

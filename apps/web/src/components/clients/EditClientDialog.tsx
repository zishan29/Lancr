import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@clerk/react";
import type { Client } from "@/types/client";

interface PropsT {
  onClientUpdate: (c: Client) => void;
  onOpenChange: (open: boolean) => void;
  clientData: Client;
  open: boolean;
}

const EditClientDialog = ({
  onClientUpdate,
  clientData,
  open,
  onOpenChange,
}: PropsT) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Client>(clientData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Client) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/clients/${formData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ client: formData }),
        },
      );

      if (!res.ok) throw new Error("Failed to create client");

      const response = await res.json();
      onClientUpdate(response.updatedClient);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        gstNumber: "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-sm"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Add a Client</DialogTitle>
              <DialogDescription>
                Add details of your client here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="grid grid-cols-2">
              <Field>
                <Label htmlFor="name-2">Name</Label>
                <Input
                  id="name-2"
                  name="name"
                  onChange={handleChange}
                  defaultValue={clientData.name}
                />
              </Field>
              <Field>
                <Label htmlFor="email-2">Email</Label>
                <Input
                  id="email-2"
                  name="email"
                  onChange={handleChange}
                  defaultValue={clientData.email}
                />
              </Field>
              <Field>
                <Label htmlFor="phone-2">Phone</Label>
                <Input
                  id="phone-2"
                  name="phone"
                  onChange={handleChange}
                  defaultValue={clientData.phone}
                />
              </Field>
              <Field>
                <Label htmlFor="company-2">Company</Label>
                <Input
                  id="company-2"
                  name="company"
                  onChange={handleChange}
                  defaultValue={clientData.company}
                />
              </Field>
              <Field className="col-span-2">
                <Label htmlFor="gstNumber-2">GST Number</Label>
                <Input
                  id="gstNumber-2"
                  name="gstNumber"
                  onChange={handleChange}
                  defaultValue={clientData.gstNumber}
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditClientDialog;

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id?: string;
  invoiceNumber?: string;
  clientId: string;
  status?: "draft" | "sent" | "paid" | "overdue";
  issueDate: string;
  dueDate: string;
  notes?: string;
  currency?: string;
  totalAmount?: string;
}

export interface Status {
  status: "draft" | "sent" | "paid" | "overdue";
}

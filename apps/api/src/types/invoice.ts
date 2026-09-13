export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface CreateInvoiceBody {
  invoice: {
    clientId: string;
    issueDate: string;
    dueDate: string;
    notes?: string;
    currency?: string;
  };
  items: InvoiceItemInput[];
}

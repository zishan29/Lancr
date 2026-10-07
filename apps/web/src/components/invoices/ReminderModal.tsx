import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner";
import { Button } from "../ui/button";

const ReminderModal = ({
  reminderState,
  setReminderState,
  generatingId,
}: {
  reminderState: {
    message: string;
    invoiceNumber: string;
    clientName: string;
  } | null;
  setReminderState: (
    value: {
      message: string;
      invoiceNumber: string;
      clientName: string;
    } | null,
  ) => void;
  generatingId: string | null;
}) => {
  const handleCopy = async () => {
    if (!reminderState?.message) return;

    try {
      await navigator.clipboard.writeText(reminderState.message);
      toast.success("Message copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy message");
    }
  };
  return (
    <>
      <Dialog
        open={!!reminderState}
        onOpenChange={(open) => !open && setReminderState(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Reminder</DialogTitle>
            <DialogDescription>
              Invoice: {reminderState?.invoiceNumber} | Client:{" "}
              {reminderState?.clientName}
            </DialogDescription>
          </DialogHeader>

          <div className="-mx-5 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {generatingId !== null
                ? "Generating message..."
                : reminderState?.message}
            </p>
            {generatingId === null && reminderState?.message && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="mt-4"
              >
                Copy to clipboard
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReminderModal;

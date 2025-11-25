// features/booking/PaymentDialog.tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IndianRupee, QrCode, AlertTriangle, Loader2 } from "lucide-react";

type PaymentIntentShape = {
  payment_id: number;
  amount: number;
  currency: string;
  upi_id: string;
  upi_name: string;
  qr_code_data_url: string;
  status: string;
} | null;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loadingPayment: boolean;
  paymentIntent: PaymentIntentShape;
  pendingBooking: { totalCharge: number } | null;
  copied: boolean;
  onCopyUpiId: () => void;
  onConfirmBooking: () => void;
  isSubmitting: boolean;
};

export function PaymentDialog({
  open,
  onOpenChange,
  loadingPayment,
  paymentIntent,
  pendingBooking,
  copied,
  onCopyUpiId,
  onConfirmBooking,
  isSubmitting,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <QrCode className="h-6 w-6 text-primary" />
            Complete Payment via UPI
          </DialogTitle>
          <DialogDescription>
            Scan the QR code or pay using UPI ID. After paying, click Confirm booking to finalize.
          </DialogDescription>
        </DialogHeader>

        {loadingPayment ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
              <QrCode className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">Generating payment QR code...</p>
          </div>
        ) : paymentIntent ? (
          <div className="space-y-5 py-2">
            <div className="bg-gradient-primary rounded-xl p-6 text-center shadow-elegant animate-scale-in">
              <p className="text-sm text-primary-foreground/80 mb-2">Amount to Pay</p>
              <p className="text-4xl md:text-5xl font-bold text-primary-foreground flex items-center justify-center gap-2">
                <IndianRupee className="h-7 w-7 md:h-8 md:w-8" />
                {pendingBooking?.totalCharge}
              </p>
            </div>

            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-xs ml-1 text-amber-800">
                Important: In-app payment verification is disabled. Please complete payment and then confirm your booking.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col items-center space-y-4 animate-fade-in">
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-elegant border-2 border-primary/20">
                <img
                  src={paymentIntent.qr_code_data_url}
                  alt="UPI Payment QR Code"
                  className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 object-contain"
                />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">Scan with any UPI app</p>
                <p className="text-xs text-muted-foreground">GPay • PhonePe • Paytm • Other UPI apps</p>
              </div>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 py-1 text-muted-foreground rounded-full border border-border">
                  Or pay manually using UPI ID
                </span>
              </div>
            </div>

            <div className="space-y-3 animate-fade-in">
              <label className="text-sm font-semibold">UPI ID</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input value={paymentIntent.upi_id} readOnly className="font-mono text-sm p-2 transition-none" />
                </div>
                <Button type="button" onClick={onCopyUpiId} className="transition-none">
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="transition-none">
                  Cancel
                </Button>
                <Button onClick={onConfirmBooking} disabled={isSubmitting} className="transition-none">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    "Confirm booking"
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

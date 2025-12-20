// components/features/bookings/PaymentDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, CheckCircle2, ExternalLink, Smartphone } from "lucide-react";
import { PaymentIntent, PendingBooking } from "./booking.types";
import { useState } from "react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loadingPayment: boolean;
  paymentIntent: PaymentIntent | null;
  pendingBooking: PendingBooking | null;
  copied: boolean;
  onCopyUpiId: () => void;
  onConfirmBooking: () => void;
  isSubmitting: boolean;
}

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
}: PaymentDialogProps) {
  const [qrError, setQrError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleOpenUpiApp = () => {
    if (paymentIntent?.upi_url) {
      window.open(paymentIntent.upi_url, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Complete Your Payment</DialogTitle>
          <DialogDescription className="text-base">
            Choose your preferred payment method below
          </DialogDescription>
        </DialogHeader>

        {loadingPayment ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-6 text-lg text-muted-foreground">Generating payment details...</p>
          </div>
        ) : paymentIntent ? (
          <div className="space-y-8 py-4">
            {/* Amount Display - Larger and more prominent */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 text-center border-2 border-primary/20">
              <p className="text-lg text-muted-foreground mb-2">Total Amount</p>
              <p className="text-5xl font-bold text-primary">₹{paymentIntent.amount}</p>
              <p className="text-sm text-muted-foreground mt-2">Indian Rupees</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - QR Code */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-xl font-semibold">Scan QR Code</h3>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-6 rounded-2xl border-4 border-primary/20 shadow-lg hover:shadow-xl transition-shadow relative group">
                    {!qrError && paymentIntent.qr_code ? (
                      <>
                        {!imageLoaded && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        )}
                        <img
                          src={paymentIntent.qr_code}
                          alt="UPI Payment QR Code"
                          className={`w-80 h-80 object-contain transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                          onLoad={() => setImageLoaded(true)}
                          onError={(e) => {
                            console.error("QR Code failed to load", e);
                            setQrError(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                          <p className="text-sm font-medium text-primary">Ready to scan</p>
                        </div>
                      </>
                    ) : (
                      <div className="w-80 h-80 flex flex-col items-center justify-center text-muted-foreground space-y-2">
                        <p className="text-lg">QR Code unavailable</p>
                        <p className="text-sm">Please use UPI ID instead</p>
                      </div>
                    )}
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-base font-medium">Scan with any UPI app</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Smartphone className="h-4 w-4" />
                      <span>GPay • PhonePe • Paytm • BHIM</span>
                    </div>
                  </div>

                  {/* Mobile: Open in UPI App Button */}
                  <Button
                    onClick={handleOpenUpiApp}
                    variant="outline"
                    size="lg"
                    className="w-full md:hidden"
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Open in UPI App
                  </Button>
                </div>
              </div>

              {/* Right Column - UPI ID & Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-xl font-semibold">Or Use UPI ID</h3>
                </div>

                {/* UPI ID Display - Larger */}
                <div className="space-y-3">
                  <p className="text-base font-medium text-muted-foreground">Pay to this UPI ID:</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted/50 rounded-lg p-4 border-2 border-border hover:border-primary/50 transition-colors">
                      <code className="text-lg font-mono font-semibold break-all">{paymentIntent.upi_id}</code>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={onCopyUpiId}
                      className="shrink-0 h-14 w-14"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Copy className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-sm text-green-600 font-medium animate-in fade-in">
                      ✓ Copied to clipboard!
                    </p>
                  )}
                </div>

                {/* Desktop: Open in UPI App Button */}
                <Button
                  onClick={handleOpenUpiApp}
                  variant="outline"
                  size="lg"
                  className="w-full hidden md:flex"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Open in UPI App
                </Button>

                {/* Payment Instructions - Enhanced */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-5 space-y-3">
                  <h4 className="font-semibold text-base text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">i</span>
                    Payment Steps
                  </h4>
                  <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li className="flex items-start gap-2">
                      <span className="font-bold min-w-[20px]">1.</span>
                      <span>Open your preferred UPI app (GPay, PhonePe, Paytm, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold min-w-[20px]">2.</span>
                      <span>Scan the QR code OR enter the UPI ID manually</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold min-w-[20px]">3.</span>
                      <span>Verify the amount is <strong>₹{paymentIntent.amount}</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold min-w-[20px]">4.</span>
                      <span>Complete the payment with your UPI PIN</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold min-w-[20px]">5.</span>
                      <span>Click the button below after successful payment</span>
                    </li>
                  </ol>
                </div>

                {/* Booking Details - Enhanced */}
                {pendingBooking && (
                  <div className="border-2 border-border rounded-xl p-5 space-y-3 bg-muted/30">
                    <h4 className="font-semibold text-base flex items-center gap-2">
                      <span>📅</span>
                      Booking Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">{pendingBooking.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">{pendingBooking.start_time} - {pendingBooking.end_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Room ID:</span>
                        <span className="font-medium">{pendingBooking.room_id}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium text-xs">{pendingBooking.email}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Confirm Button - Large and prominent */}
            <div className="space-y-3 pt-4 border-t-2">
              <Button
                onClick={onConfirmBooking}
                disabled={isSubmitting}
                className="w-full h-14 text-lg"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Confirming Your Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-6 w-6" />
                    I've Completed the Payment
                  </>
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                ⚠️ Only click this button after your payment is successful
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground space-y-4">
            <p className="text-lg">Unable to generate payment details</p>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Close and Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
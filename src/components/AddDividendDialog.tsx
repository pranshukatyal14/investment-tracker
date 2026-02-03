import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Dividend } from "@/types/investment";
import { toast } from "sonner";

interface AddDividendDialogProps {
  onAdd: (dividend: Omit<Dividend, "id">) => void;
}

export function AddDividendDialog({ onAdd }: AddDividendDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [company, setCompany] = useState("");
  const [stockSymbol, setStockSymbol] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !company || !stockSymbol) {
      toast.error("Please fill in all required fields");
      return;
    }

    const dividendAmount = parseFloat(amount);
    if (isNaN(dividendAmount) || dividendAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    onAdd({
      amount: dividendAmount,
      company: company.trim(),
      stockSymbol: stockSymbol.trim().toUpperCase(),
      date,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setAmount("");
    setCompany("");
    setStockSymbol("");
    setDate(new Date());
    setNotes("");
    setOpen(false);

    toast.success("Dividend recorded successfully!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-success hover:opacity-90 transition-opacity">
          <Plus className="mr-2 h-4 w-4" />
          Add Dividend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Dividend Received</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company Name *</Label>
            <Input
              id="company"
              type="text"
              placeholder="e.g., Apple Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stockSymbol">Stock Symbol *</Label>
            <Input
              id="stockSymbol"
              type="text"
              placeholder="e.g., AAPL"
              value={stockSymbol}
              onChange={(e) => setStockSymbol(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Dividend Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="Enter amount received"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date Received *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-success">
              Add Dividend
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

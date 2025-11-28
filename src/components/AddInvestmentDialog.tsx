import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Investment, Category } from "@/types/investment";
import { toast } from "sonner";

interface AddInvestmentDialogProps {
  categories: Category[];
  onAdd: (investment: Omit<Investment, "id">) => void;
}

export function AddInvestmentDialog({ categories, onAdd }: AddInvestmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [subcategory, setSubcategory] = useState("");
  const [notes, setNotes] = useState("");

  // Clear subcategory when category changes
  useEffect(() => {
    setSubcategory("");
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const investmentAmount = parseFloat(amount);
    if (isNaN(investmentAmount) || investmentAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    onAdd({
  amount: investmentAmount,
  category,
  subcategory: subcategory || undefined,
  date,
  notes: notes.trim() || undefined,
});


    // Reset form
    // Reset form
setAmount("");
setCategory("");
setSubcategory(""); // Add this line
setDate(new Date());
setNotes("");
setOpen(false);

    toast.success("Investment added successfully!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-success hover:opacity-90 transition-opacity">
          <Plus className="mr-2 h-4 w-4" />
          Add Investment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log New Investment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory field */}
          {categories.find(cat => cat.name === category)?.subcategories && (
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select value={subcategory} onValueChange={setSubcategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .find(cat => cat.name === category)
                    ?.subcategories?.map((subcat) => (
                      <SelectItem key={subcat.id} value={subcat.name}>
                        {subcat.name}
                      </SelectItem>
                    )) || []}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Date *</Label>
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
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this investment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-success hover:opacity-90">
              Add Investment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import React,{ useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PieChart, Wallet,ArrowRightLeft } from "lucide-react";
import { Category, MonthlyBudget } from "@/types/investment";
import { toast } from "sonner";

interface CategoryBudgetManagerProps {
  currentMonth: string;
  budget: MonthlyBudget | null;
  categories: Category[];
  onSetBudget: (budget: MonthlyBudget) => void;
}

export function CategoryBudgetManager({ currentMonth, budget, categories, onSetBudget }: CategoryBudgetManagerProps) {
  const [open, setOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState("");
  const [allocations, setAllocations] = useState<Record<string, string>>({});

  const handleAllocationChange = (categoryName: string, value: string) => {
    setAllocations(prev => ({
      ...prev,
      [categoryName]: value
    }));
  };

  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryAllocations = categories.map(cat => ({
      categoryName: cat.name,
      allocatedAmount: parseFloat(allocations[cat.name]) || 0,
      carryOver: 0,
      spent: 0,
      remaining: parseFloat(allocations[cat.name]) || 0
    }));

    onSetBudget({
      month: currentMonth,
      totalAmount: parseFloat(totalAmount),
      categoryAllocations,
      totalCarryOver: 0
    });

    setOpen(false);
    toast.success("Category budget set successfully!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PieChart className="mr-2 h-4 w-4" />
          Category Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Set Category-wise Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="total-budget">Total Monthly Budget (₹)</Label>
            <Input
              id="total-budget"
              type="number"
              step="0.01"
              placeholder="Enter total budget"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Category Allocations</Label>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-4 p-3 border rounded">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={allocations[category.name] || ""}
                    onChange={(e) => handleAllocationChange(category.name, e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">₹</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Allocated:</span>
              <span className="text-lg font-bold">₹{totalAllocated.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Budget
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// interface CategoryBudgetManagerProps {
//   currentMonth: string;
//   budget: MonthlyBudget | null;
//   categories: Category[];
//   onSetBudget: (budget: MonthlyBudget) => void;
// }

// export function CategoryBudgetManager({ currentMonth, budget, categories, onSetBudget }: CategoryBudgetManagerProps) {
//   const [open, setOpen] = useState(false);
//   const [totalAmount, setTotalAmount] = useState("");
//   const [allocations, setAllocations] = useState<Record<string, string>>({});

//   const handleAllocationChange = (categoryName: string, value: string) => {
//     setAllocations(prev => ({
//       ...prev,
//       [categoryName]: value
//     }));
//   };

//   const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
//   const remaining = parseFloat(totalAmount || "0") - totalAllocated;

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (remaining !== 0) {
//       toast.error(`Total allocation must equal total budget. Remaining: ₹${remaining}`);
//       return;
//     }

//     const categoryAllocations = categories.map(cat => ({
//       categoryName: cat.name,
//       allocatedAmount: parseFloat(allocations[cat.name]) || 0,
//       carryOver: 0,
//       spent: 0,
//       remaining: parseFloat(allocations[cat.name]) || 0
//     }));

//     onSetBudget({
//       month: currentMonth,
//       totalAmount: parseFloat(totalAmount),
//       categoryAllocations,
//       totalCarryOver: 0
//     });

//     setOpen(false);
//     toast.success("Category budget set successfully!");
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button variant="outline" size="sm">
//           <PieChart className="mr-2 h-4 w-4" />
//           Category Budget
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[600px]">
//         <DialogHeader>
//           <DialogTitle>Set Category-wise Budget</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4 mt-4">
//           <div className="space-y-2">
//             <Label htmlFor="total-budget">Total Monthly Budget (₹)</Label>
//             <Input
//               id="total-budget"
//               type="number"
//               step="0.01"
//               placeholder="Enter total budget"
//               value={totalAmount}
//               onChange={(e) => setTotalAmount(e.target.value)}
//               required
//             />
//           </div>

//           <div className="space-y-4">
//             <Label>Category Allocations</Label>
//             {categories.map((category) => (
//               <div key={category.id} className="flex items-center gap-4 p-3 border rounded">
//                 <div className="flex items-center gap-2 flex-1">
//                   <div
//                     className="h-4 w-4 rounded-full"
//                     style={{ backgroundColor: category.color }}
//                   />
//                   <span className="font-medium">{category.name}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Input
//                     type="number"
//                     step="0.01"
//                     placeholder="0"
//                     value={allocations[category.name] || ""}
//                     onChange={(e) => handleAllocationChange(category.name, e.target.value)}
//                     className="w-24"
//                   />
//                   <span className="text-sm text-muted-foreground">₹</span>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="border-t pt-4">
//             <div className="flex justify-between items-center">
//               <span className="font-medium">Total Allocated:</span>
//               <span className="text-lg font-bold">₹{totalAllocated.toLocaleString("en-IN")}</span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="font-medium">Remaining:</span>
//               <span className={`text-lg font-bold ${remaining === 0 ? 'text-success' : 'text-destructive'}`}>
//                 ₹{remaining.toLocaleString("en-IN")}
//               </span>
//             </div>
//           </div>

//           <div className="flex gap-3 pt-4">
//             <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
//               Cancel
//             </Button>
//             <Button type="submit" className="flex-1" disabled={remaining !== 0}>
//               Save Budget
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }


// Add this new CarryoverManager component
export function CarryoverManager({ currentMonth, budget, categories, onSetBudget }: {
  currentMonth: string;
  budget: MonthlyBudget | null;
  categories: Category[];
  onSetBudget: (budget: MonthlyBudget) => void;
}) {
  const [open, setOpen] = useState(false);
  const [totalCarryover, setTotalCarryover] = useState("");
  const [categoryCarryovers, setCategoryCarryovers] = useState<Record<string, string>>({});

  const handleCategoryCarryoverChange = (categoryName: string, value: string) => {
    setCategoryCarryovers(prev => ({
      ...prev,
      [categoryName]: value
    }));
  };

  const totalAllocated = Object.values(categoryCarryovers).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const remaining = parseFloat(totalCarryover || "0") - totalAllocated;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (remaining !== 0) {
      toast.error(`Total allocation must equal total carryover. Remaining: ₹${remaining}`);
      return;
    }

    const categoryAllocations = categories.map(cat => ({
      categoryName: cat.name,
      allocatedAmount: parseFloat(categoryCarryovers[cat.name]) || 0,
      carryOver: parseFloat(categoryCarryovers[cat.name]) || 0,
      spent: 0,
      remaining: parseFloat(categoryCarryovers[cat.name]) || 0
    }));

    onSetBudget({
      month: currentMonth,
      totalAmount: 0,
      categoryAllocations,
      totalCarryOver: parseFloat(totalCarryover),
    });

    setOpen(false);
    toast.success("Carryover allocated successfully!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Allocate Carryover
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Allocate Carryover by Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="total-carryover">Total Carryover Amount (₹)</Label>
            <Input
              id="total-carryover"
              type="number"
              step="0.01"
              placeholder="Enter total carryover amount"
              value={totalCarryover}
              onChange={(e) => setTotalCarryover(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Category Allocations</Label>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-4 p-3 border rounded">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={categoryCarryovers[category.name] || ""}
                    onChange={(e) => handleCategoryCarryoverChange(category.name, e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">₹</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Allocated:</span>
              <span className="text-lg font-bold">₹{totalAllocated.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Remaining:</span>
              <span className={`text-lg font-bold ${remaining === 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{remaining.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={remaining !== 0}>
              Allocate Carryover
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
// Keep the original BudgetManager for backward compatibility
export function BudgetManager({ currentMonth, budget, onSetBudget }: {
  currentMonth: string;
  budget: MonthlyBudget | null;
  onSetBudget: (budget: MonthlyBudget) => void;
}) {
  const [open, setOpen] = useState(false);
const [amount, setAmount] = useState(budget?.totalAmount?.toString() || "");

const [carryOver, setCarryOver] = useState(budget?.totalCarryOver?.toString() || "0");


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const budgetAmount = parseFloat(amount);
    const carryOverAmount = parseFloat(carryOver);
    
    if (isNaN(budgetAmount) || budgetAmount < 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }
    
    if (isNaN(carryOverAmount) || carryOverAmount < 0) {
      toast.error("Please enter a valid carry over amount");
      return;
    }

    // onSetBudget({
    //   month: currentMonth,
    //   totalAmount: budgetAmount,
    //   // amount: budgetAmount, // For backward compatibility
    //   carryOver: carryOverAmount,
    //   categoryAllocations: [],
    //   totalCarryOver: carryOverAmount,
    // });
// So the onSetBudget call becomes:
const budgetData = {
  month: currentMonth,
  totalAmount: budgetAmount,
  categoryAllocations: [],
  totalCarryOver: carryOverAmount,
};

console.log('🚀 BudgetManager sending:', budgetData);
onSetBudget(budgetData);

    setOpen(false);
    toast.success("Budget updated successfully!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wallet className="mr-2 h-4 w-4" />
          Set Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Monthly Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="budget-amount">Monthly Investment Budget (₹)</Label>
            <Input
              id="budget-amount"
              type="number"
              step="0.01"
              placeholder="Enter your monthly investment budget"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carry-over">Carry Over from Previous Month (₹)</Label>
            <Input
              id="carry-over"
              type="number"
              step="0.01"
              placeholder="Amount carried over"
              value={carryOver}
              onChange={(e) => setCarryOver(e.target.value)}
            />
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Total Available:</span>
              <span className="text-lg font-bold text-success">
                ₹{(parseFloat(amount || "0") + parseFloat(carryOver || "0")).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-success hover:opacity-90">
              Save Budget
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}



export function CarryoverEditDialog({ 
  currentMonth, 
  budget, 
  categories, 
  onSetBudget, 
  open, 
  onOpenChange ,
    remainingCarryover // Add this prop

}: {
  currentMonth: string;
  budget: MonthlyBudget | null;
  categories: Category[];
  onSetBudget: (budget: MonthlyBudget) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
    remainingCarryover: number; // Add this prop

}) {
  const [categoryCarryovers, setCategoryCarryovers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    budget?.categoryAllocations?.forEach(alloc => {
      initial[alloc.categoryName] = alloc.carryOver?.toString() || "0";
    });
    return initial;
  });

  const totalAllocated = Object.values(categoryCarryovers).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const totalCarryover = remainingCarryover;
  const remaining = totalCarryover - totalAllocated;

  const handleCategoryCarryoverChange = (categoryName: string, value: string) => {
    setCategoryCarryovers(prev => ({
      ...prev,
      [categoryName]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Math.abs(remaining) > 0.01) {
      toast.error(`Total allocation must equal total carryover. Remaining: ₹${remaining.toFixed(2)}`);
      return;
    }

    const updatedCategoryAllocations = (budget?.categoryAllocations || []).map(allocation => ({
      ...allocation,
      carryOver: parseFloat(categoryCarryovers[allocation.categoryName]) || 0,
    }));

    onSetBudget({
      ...budget!,
      categoryAllocations: updatedCategoryAllocations,
    });

    onOpenChange(false);
    toast.success("Carryover allocation updated successfully!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Carryover Allocation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex justify-between items-center">
              <span className="font-medium text-blue-800">Total Carryover Available</span>
              <span className="font-bold text-blue-800">₹{totalCarryover.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Allocate to Categories</Label>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-4 p-3 border rounded">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={categoryCarryovers[category.name] || ""}
                    onChange={(e) => handleCategoryCarryoverChange(category.name, e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">₹</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Allocated:</span>
              <span className="text-lg font-bold">₹{totalAllocated.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Remaining:</span>
              <span className={`text-lg font-bold ${Math.abs(remaining) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{remaining.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={Math.abs(remaining) > 0.01}>
              Update Allocation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

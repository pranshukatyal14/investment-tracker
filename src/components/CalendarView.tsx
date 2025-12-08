import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Investment, Category } from "@/types/investment";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";


interface CalendarViewProps {
  investments: Investment[];
  categories: Category[];
}

export function CalendarView({ investments, categories }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);


  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getInvestmentsForDay = (day: Date) => {
    return investments.filter((inv) => isSameDay(inv.date, day));
  };

  const getDayTotal = (day: Date) => {
    return getInvestmentsForDay(day).reduce((sum, inv) => sum + inv.amount, 0);
  };
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setShowDayDetails(true);
  };

  const getCategoryColor = (categoryName: string) => {
    return categories.find(cat => cat.name === categoryName)?.color || "#6b7280";
  };

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentDate.getMonth();
  };

  const isToday = (day: Date) => {
    return isSameDay(day, new Date());
  };

  const selectedDayInvestments = selectedDate ? getInvestmentsForDay(selectedDate) : [];
  const selectedDayTotal = selectedDate ? getDayTotal(selectedDate) : 0;


  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-muted-foreground p-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const dayInvestments = getInvestmentsForDay(day);
            const dayTotal = getDayTotal(day);
            const hasInvestments = dayInvestments.length > 0;

            return (
              <Card
                key={index}
                className={cn(
                  "min-h-[100px] p-2 transition-all hover:shadow-medium cursor-pointer",
                  !isCurrentMonth(day) && "bg-muted/30 text-muted-foreground",
                  isToday(day) && "ring-2 ring-success",
                  hasInvestments && "bg-success/5"
                )}
                onClick={() => handleDayClick(day)}
              >
                <div className="space-y-1">
                  <div className={cn(
                    "text-sm font-semibold",
                    isToday(day) && "text-success"
                  )}>
                    {format(day, "d")}
                  </div>
                  
                  {hasInvestments && (
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-success">
                        ₹{dayTotal.toLocaleString("en-IN")}
                      </div>
                      <div className="space-y-1">
                        {dayInvestments.map((inv, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1"
                          >
                            <div
                              className="h-2 w-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: getCategoryColor(inv.category) }}
                            />
                            <span className="text-xs truncate">
                              {inv.subcategory ? `${inv.category} - ${inv.subcategory}` : inv.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Month Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {format(currentDate, "MMMM")} Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Invested</p>
            <p className="text-2xl font-bold text-success">
              ₹{investments
                .filter(inv => inv.date.getMonth() === currentDate.getMonth() && inv.date.getFullYear() === currentDate.getFullYear())
                .reduce((sum, inv) => sum + inv.amount, 0)
                .toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">
              {investments.filter(inv => 
                inv.date.getMonth() === currentDate.getMonth() && 
                inv.date.getFullYear() === currentDate.getFullYear()
              ).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Days Invested</p>
            <p className="text-2xl font-bold">
              {new Set(
                investments
                  .filter(inv => inv.date.getMonth() === currentDate.getMonth() && inv.date.getFullYear() === currentDate.getFullYear())
                  .map(inv => format(inv.date, "yyyy-MM-dd"))
              ).size}
            </p>
          </div>
        </div>
      </Card>

      {/* Day Details Modal */}
      <Dialog open={showDayDetails} onOpenChange={setShowDayDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Investments on {selectedDate && format(selectedDate, "MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDayInvestments.length > 0 ? (
            <div className="space-y-4">
              {/* Total for the day */}
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Invested</span>
                  <span className="text-xl font-bold text-success">
                    ₹{selectedDayTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedDayInvestments.length} transaction{selectedDayInvestments.length > 1 ? 's' : ''}
                </div>
              </div>

              {/* Investment list */}
              <div className="space-y-3">
                <h4 className="font-medium">Investment Details</h4>
                {selectedDayInvestments.map((investment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: getCategoryColor(investment.category) }}
                      />
                      <div>
                        <div className="font-medium">
                          {investment.subcategory 
                            ? `${investment.category} - ${investment.subcategory}` 
                            : investment.category}
                        </div>
                        {investment.notes && (
                          <div className="text-sm text-muted-foreground">
                            {investment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ₹{investment.amount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(investment.date, "h:mm a")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No investments made on this day</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

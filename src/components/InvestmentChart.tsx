// import { Card } from "@/components/ui/card";
// import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
// import { InvestmentStats } from "@/types/investment";

// interface InvestmentChartProps {
//   stats: InvestmentStats;
// }

// export function InvestmentChart({ stats }: InvestmentChartProps) {
//   const data = stats.categoryBreakdown.map((item) => ({
//     name: item.subcategory ? `${item.category} - ${item.subcategory}` : item.category,
//     value: item.amount,
//     percentage: item.percentage,
//     color: item.color,
//   }));

//   if (data.length === 0 || stats.totalInvested === 0) {
//     return (
//       <Card className="p-12 text-center">
//         <p className="text-muted-foreground">
//           No investment data to display yet. Add your first investment to see the breakdown.
//         </p>
//       </Card>
//     );
//   }

//   return (
//     <Card className="p-6">
//       <h3 className="text-lg font-semibold mb-6">Investment Distribution</h3>
      
//       <ResponsiveContainer width="100%" height={300}>
//         <PieChart>
//           <Pie
//             data={data}
//             cx="50%"
//             cy="50%"
//             labelLine={false}
//             label={({ percentage }) => `${percentage.toFixed(1)}%`}
//             outerRadius={100}
//             fill="#8884d8"
//             dataKey="value"
//           >
//             {data.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={entry.color} />
//             ))}
//           </Pie>
//           <Tooltip
//             formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
//           />
//           <Legend />
//         </PieChart>
//       </ResponsiveContainer>

//       <div className="mt-6 space-y-3">
//         {stats.categoryBreakdown.map((item) => (
//           <div key={`${item.category}-${item.subcategory || 'main'}`} className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div
//                 className="h-3 w-3 rounded-full"
//                 style={{ backgroundColor: item.color }}
//               />
//               <span className="text-sm font-medium">
//                 {item.subcategory ? `${item.category} - ${item.subcategory}` : item.category}
//               </span>
//             </div>
//             <div className="text-right">
//               <p className="text-sm font-semibold">
//                 ₹{item.amount.toLocaleString("en-IN")}
//               </p>
//               <p className="text-xs text-muted-foreground">
//                 {item.percentage.toFixed(1)}%
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </Card>
//   );
// }


import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { InvestmentStats } from "@/types/investment";

interface InvestmentChartProps {
  stats: InvestmentStats;
}

export function InvestmentChart({ stats }: InvestmentChartProps) {
  const data = stats.categoryBreakdown.map((item) => ({
    name: item.subcategory ? `${item.category} - ${item.subcategory}` : item.category,
    value: item.amount,
    percentage: item.percentage,
    color: item.color,
  }));

  if (data.length === 0 || stats.totalInvested === 0) {
    return (
      <Card className="p-6 sm:p-12 text-center">
        <p className="text-muted-foreground text-sm sm:text-base">
          No investment data to display yet. Add your first investment to see the breakdown.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Investment Distribution</h3>
      
      <div className="block sm:hidden">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="hidden sm:block">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentage }) => `${percentage.toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
        {stats.categoryBreakdown.map((item) => (
          <div key={`${item.category}-${item.subcategory || 'main'}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs sm:text-sm font-medium truncate">
                {item.subcategory ? `${item.category} - ${item.subcategory}` : item.category}
              </span>
            </div>
            <div className="text-right ml-2">
              <p className="text-xs sm:text-sm font-semibold">
                ₹{item.amount.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

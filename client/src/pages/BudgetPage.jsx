import React, { useState, useMemo } from 'react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Users,
  Wallet,
  ArrowUpRight,
  ShieldAlert,
  Info,
  Check,
  Edit3
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useExpense } from '../context/ExpenseContext';
import { useNotification } from '../context/NotificationContext';

const CATEGORY_COLORS = {
  Accommodation: '#173F35',
  Food: '#F1A66A',
  Transportation: '#2B7A78',
  Activities: '#D97706',
  Miscellaneous: '#626B67'
};

export default function BudgetPage() {
  const { activeTrip, updateActiveTrip } = useTrip();
  const { totalSpent, categoryExpenses } = useExpense();
  const { showSuccess } = useNotification();

  const [isEditingBudget, setIsEditingBudget] = useState(false);

  // Category breakdown
  const budgetBreakdown = useMemo(() => {
    const defaultTotal = activeTrip?.totalEstimatedBudget || 50000;
    return activeTrip?.budgetBreakdown || {
      accommodation: Math.round(defaultTotal * 0.4),
      food: Math.round(defaultTotal * 0.25),
      transportation: Math.round(defaultTotal * 0.15),
      activities: Math.round(defaultTotal * 0.12),
      miscellaneous: Math.round(defaultTotal * 0.08)
    };
  }, [activeTrip]);

  const [editableCategories, setEditableCategories] = useState(budgetBreakdown);

  // Sync state when trip changes
  React.useEffect(() => {
    setEditableCategories(budgetBreakdown);
  }, [budgetBreakdown]);

  if (!activeTrip) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-charcoal-border">
        <Wallet className="w-8 h-8 text-forest mx-auto mb-3" />
        <h2 className="text-xl font-bold">No Active Trip Selected</h2>
      </div>
    );
  }

  const travelers = activeTrip.travelers || 1;
  const totalEstimated = Object.values(budgetBreakdown).reduce((a, b) => a + Number(b), 0);
  const remainingBudget = totalEstimated - totalSpent;
  const estimatedPerPerson = Math.round(totalEstimated / travelers);
  const actualPerPerson = Math.round(totalSpent / travelers);

  // Recharts Data: Pie Chart (Distribution)
  const pieData = [
    { name: 'Accommodation', value: budgetBreakdown.accommodation || 0, color: CATEGORY_COLORS.Accommodation },
    { name: 'Food', value: budgetBreakdown.food || 0, color: CATEGORY_COLORS.Food },
    { name: 'Transportation', value: budgetBreakdown.transportation || 0, color: CATEGORY_COLORS.Transportation },
    { name: 'Activities', value: budgetBreakdown.activities || 0, color: CATEGORY_COLORS.Activities },
    { name: 'Miscellaneous', value: budgetBreakdown.miscellaneous || 0, color: CATEGORY_COLORS.Miscellaneous }
  ];

  // Recharts Data: Bar Chart (Estimated vs Actual)
  const barData = [
    {
      category: 'Accommodation',
      Estimated: budgetBreakdown.accommodation || 0,
      Actual: categoryExpenses.Accommodation || 0
    },
    {
      category: 'Food',
      Estimated: budgetBreakdown.food || 0,
      Actual: categoryExpenses.Food || 0
    },
    {
      category: 'Transport',
      Estimated: budgetBreakdown.transportation || 0,
      Actual: categoryExpenses.Transportation || 0
    },
    {
      category: 'Activities',
      Estimated: budgetBreakdown.activities || 0,
      Actual: categoryExpenses.Activities || 0
    },
    {
      category: 'Misc',
      Estimated: budgetBreakdown.miscellaneous || 0,
      Actual: categoryExpenses.Miscellaneous || 0
    }
  ];

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const newTotal = Object.values(editableCategories).reduce((sum, v) => sum + (Number(v) || 0), 0);
    const newPerPerson = Math.round(newTotal / travelers);

    updateActiveTrip({
      budgetBreakdown: editableCategories,
      totalEstimatedBudget: newTotal,
      perPersonBudget: newPerPerson
    });

    setIsEditingBudget(false);
    showSuccess('Budget estimates updated successfully.');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-warmorange-dark">
            Trip Financials & Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Budget Planner & Forecast
          </h1>
        </div>

        <button
          onClick={() => setIsEditingBudget(!isEditingBudget)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-charcoal-border hover:border-forest text-xs font-bold text-charcoal transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 text-forest" />
          <span>{isEditingBudget ? 'Cancel Editing' : 'Edit Category Budgets'}</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Estimated Budget */}
        <div className="p-5 rounded-3xl bg-white border border-charcoal-border shadow-soft space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted flex items-center justify-between">
            <span>Total Estimated</span>
            <Wallet className="w-4 h-4 text-forest" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal">
            ₹{totalEstimated.toLocaleString()}
          </div>
          <div className="text-[11px] text-charcoal-muted">
            Planned for {travelers} travelers
          </div>
        </div>

        {/* Actual Expenses */}
        <div className="p-5 rounded-3xl bg-white border border-charcoal-border shadow-soft space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted flex items-center justify-between">
            <span>Actual Expenses</span>
            <ArrowUpRight className="w-4 h-4 text-warmorange" />
          </div>
          <div className="text-2xl font-extrabold text-forest">
            ₹{totalSpent.toLocaleString()}
          </div>
          <div className="text-[11px] text-charcoal-muted">
            Logged across all members
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="p-5 rounded-3xl bg-white border border-charcoal-border shadow-soft space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted flex items-center justify-between">
            <span>Remaining Budget</span>
            <ShieldAlert className="w-4 h-4 text-mint-dark" />
          </div>
          <div className={`text-2xl font-extrabold ${remainingBudget >= 0 ? 'text-forest' : 'text-red-600'}`}>
            ₹{remainingBudget.toLocaleString()}
          </div>
          <div className="text-[11px] text-charcoal-muted">
            {remainingBudget >= 0 ? 'Comfortably within budget' : 'Over budget'}
          </div>
        </div>

        {/* Estimated vs Actual Cost Per Person */}
        <div className="p-5 rounded-3xl bg-white border border-charcoal-border shadow-soft space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted flex items-center justify-between">
            <span>Cost Per Person</span>
            <Users className="w-4 h-4 text-forest" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal">
            ₹{estimatedPerPerson.toLocaleString()}
          </div>
          <div className="text-[11px] text-charcoal-muted">
            Actual spent: ₹{actualPerPerson.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Category Budget Editor Form (Collapsible) */}
      {isEditingBudget && (
        <form onSubmit={handleSaveBudget} className="p-6 rounded-3xl bg-mint/30 border border-mint-dark space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-forest uppercase tracking-wider">
              Adjust Estimated Category Budgets (₹)
            </h3>
            <span className="text-xs text-forest/80">Total will recalculate automatically</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {Object.keys(editableCategories).map((key) => (
              <div key={key}>
                <label className="block text-[11px] font-bold capitalize text-charcoal mb-1">
                  {key}
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={editableCategories[key]}
                  onChange={(e) =>
                    setEditableCategories({
                      ...editableCategories,
                      [key]: Math.max(0, parseFloat(e.target.value) || 0)
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-border text-xs font-semibold bg-white"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingBudget(false)}
              className="px-4 py-2 rounded-xl border border-charcoal-border text-xs font-bold text-charcoal bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-forest text-offwhite text-xs font-bold hover:bg-forest-hover shadow-soft"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply & Save</span>
            </button>
          </div>
        </form>
      )}

      {/* Visual Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Expense Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-charcoal-border shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-forest" />
              <h3 className="text-sm font-bold text-charcoal">Budget Distribution</h3>
            </div>
            <span className="text-[11px] text-charcoal-muted">Percentage breakdown</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `₹${Number(val).toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#252B29', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Estimated vs Actual */}
        <div className="p-6 rounded-3xl bg-white border border-charcoal-border shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-forest" />
              <h3 className="text-sm font-bold text-charcoal">Estimated vs Actual Spending</h3>
            </div>
            <span className="text-[11px] text-charcoal-muted">Synced from expenses</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#626B67' }} />
                <YAxis tick={{ fontSize: 10, fill: '#626B67' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val) => `₹${Number(val).toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#252B29', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Estimated" fill="#DCEFE5" stroke="#173F35" strokeWidth={1} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Actual" fill="#173F35" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Progress Breakdown */}
      <div className="p-6 rounded-3xl bg-white border border-charcoal-border shadow-soft space-y-4">
        <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider">
          Category Spending Utilization
        </h3>

        <div className="space-y-4">
          {Object.keys(budgetBreakdown).map((catKey) => {
            const label = catKey.charAt(0).toUpperCase() + catKey.slice(1);
            const normKey = Object.keys(categoryExpenses).find(k => k.toLowerCase() === catKey.toLowerCase()) || label;
            const allocated = Number(budgetBreakdown[catKey]) || 0;
            const spent = Number(categoryExpenses[normKey]) || 0;
            const percent = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;

            return (
              <div key={catKey} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-charcoal capitalize">{label}</span>
                  <span className="text-charcoal-muted">
                    ₹{spent.toLocaleString()} spent of ₹{allocated.toLocaleString()} ({percent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-offwhite overflow-hidden border border-charcoal-border/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      spent > allocated ? 'bg-red-500' : 'bg-forest'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-2xl bg-offwhite border border-charcoal-border flex items-center gap-2.5 text-xs text-charcoal-muted">
        <Info className="w-4 h-4 text-forest shrink-0" />
        <span>
          <strong>Important:</strong> All budget figures are approximate planning estimates based on regional travel norms and user settings, not live airline or hotel booking quotes.
        </span>
      </div>
    </div>
  );
}

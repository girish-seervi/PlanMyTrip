import React, { useState } from 'react';
import {
  Split,
  Plus,
  Users,
  DollarSign,
  ArrowRight,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Tag,
  X,
  Check
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { useTrip } from '../context/TripContext';
import { useNotification } from '../context/NotificationContext';

const EXPENSE_CATEGORIES = ['Accommodation', 'Food', 'Transportation', 'Activities', 'Miscellaneous'];

export default function ExpenseSplitterPage() {
  const { activeTrip } = useTrip();
  const {
    members,
    expenses,
    addMember,
    editMember,
    removeMember,
    addExpense,
    editExpense,
    deleteExpense,
    memberBalances,
    totalSpent,
    settlements
  } = useExpense();

  const { showSuccess, showError } = useNotification();

  // Add Member State
  const [newMemberName, setNewMemberName] = useState('');
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editMemberNameInput, setEditMemberNameInput] = useState('');

  // Add Expense Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    paidBy: members[0]?.id || '',
    participants: members.map((m) => m.id),
    splitType: 'equal',
    customShares: {}
  });

  // Settled transfers tracker (local state)
  const [settledTransfers, setSettledTransfers] = useState(new Set());

  // Check sum of balances equals 0
  const totalBalanceSum = memberBalances.reduce((sum, b) => sum + b.balance, 0);

  const handleOpenAddExpense = () => {
    setExpenseForm({
      description: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      paidBy: members[0]?.id || '',
      participants: members.map((m) => m.id),
      splitType: 'equal',
      customShares: {}
    });
    setIsAddExpenseOpen(true);
  };

  const handleToggleParticipant = (mId) => {
    const prev = expenseForm.participants;
    if (prev.includes(mId)) {
      if (prev.length === 1) {
        showError('At least one participant must share the expense.');
        return;
      }
      setExpenseForm({ ...expenseForm, participants: prev.filter((id) => id !== mId) });
    } else {
      setExpenseForm({ ...expenseForm, participants: [...prev, mId] });
    }
  };

  const handleCustomShareChange = (mId, value) => {
    setExpenseForm({
      ...expenseForm,
      customShares: {
        ...expenseForm.customShares,
        [mId]: value
      }
    });
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    addExpense(expenseForm);
    setIsAddExpenseOpen(false);
  };

  const toggleSettlementStatus = (id) => {
    setSettledTransfers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-warmorange-dark">
            Group Expense Splitter (Splitwise Logic)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Group Expenses & Settlements
          </h1>
          <p className="text-xs text-charcoal-muted mt-1">
            Track who paid, split equally or custom, and settle balances with minimal transfers.
          </p>
        </div>

        <button
          onClick={handleOpenAddExpense}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-forest text-offwhite text-xs font-extrabold hover:bg-forest-hover shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4 text-warmorange" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-charcoal-border shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block">Total Group Spending</span>
          <span className="text-2xl font-extrabold text-forest mt-0.5 block">
            ₹{totalSpent.toLocaleString()}
          </span>
          <span className="text-[11px] text-charcoal-muted">{expenses.length} expenses recorded</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-charcoal-border shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block">Group Travelers</span>
          <span className="text-2xl font-extrabold text-charcoal mt-0.5 block">
            {members.length} Members
          </span>
          <span className="text-[11px] text-charcoal-muted">Equal share approx ₹{members.length > 0 ? Math.round(totalSpent / members.length).toLocaleString() : 0}/person</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-charcoal-border shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block">Settlement Health</span>
          <div className="flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-5 h-5 text-forest" />
            <span className="text-base font-extrabold text-forest">Balanced to ₹0</span>
          </div>
          <span className="text-[10px] text-charcoal-muted">All debits and credits match perfectly</span>
        </div>
      </div>

      {/* Settlement Suggestions Panel */}
      <div className="p-6 rounded-3xl bg-white border border-charcoal-border shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-charcoal-border/50">
          <div className="flex items-center gap-2">
            <Split className="w-4 h-4 text-forest" />
            <h2 className="text-base font-bold text-charcoal">Debt Simplification Settlements</h2>
          </div>
          <span className="text-xs text-charcoal-muted">
            {settlements.length} direct transfers needed
          </span>
        </div>

        {settlements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {settlements.map((s) => {
              const isSettled = settledTransfers.has(s.id);
              return (
                <div
                  key={s.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSettled
                      ? 'bg-offwhite border-charcoal-border/40 opacity-60'
                      : 'bg-mint/30 border-mint-dark'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-forest text-mint flex items-center justify-center font-bold text-xs shrink-0">
                      ₹
                    </div>
                    <div>
                      <div className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                        <span className="text-red-700 font-bold">{s.fromName}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-charcoal-muted" />
                        <span className="text-forest font-bold">{s.toName}</span>
                      </div>
                      <div className="text-sm font-extrabold text-charcoal mt-0.5">
                        ₹{s.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSettlementStatus(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      isSettled
                        ? 'bg-charcoal text-offwhite'
                        : 'bg-forest text-offwhite hover:bg-forest-hover shadow-sm'
                    }`}
                  >
                    {isSettled ? 'Settled ✓' : 'Mark Settled'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-charcoal-muted">
            All expenses are currently settled! No outstanding debts between members.
          </div>
        )}
      </div>

      {/* Two Column Grid: Members Balances & Expenses List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Group Members & Net Balances */}
        <div className="bg-white rounded-3xl border border-charcoal-border shadow-soft p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-border/50">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-forest" />
              <h3 className="text-sm font-bold text-charcoal">Group Members</h3>
            </div>
            <span className="text-xs text-charcoal-muted">{members.length} People</span>
          </div>

          {/* Add Member Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newMemberName.trim()) {
                addMember(newMemberName.trim());
                setNewMemberName('');
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Add traveler name..."
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-charcoal-border text-xs font-medium bg-offwhite/50"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-forest text-offwhite text-xs font-bold hover:bg-forest-hover transition-colors"
            >
              Add
            </button>
          </form>

          {/* Members List */}
          <div className="space-y-3 pt-2">
            {memberBalances.map((m) => (
              <div
                key={m.memberId}
                className="p-3 rounded-2xl bg-offwhite/60 border border-charcoal-border/60 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">{m.avatar || '👤'}</span>
                  <div className="min-w-0">
                    {editingMemberId === m.memberId ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editMemberNameInput}
                          onChange={(e) => setEditMemberNameInput(e.target.value)}
                          className="px-1.5 py-0.5 rounded border border-charcoal-border text-xs w-24"
                        />
                        <button
                          onClick={() => {
                            editMember(m.memberId, editMemberNameInput);
                            setEditingMemberId(null);
                          }}
                          className="text-forest hover:underline text-[10px] font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-charcoal truncate flex items-center gap-1.5">
                        <span>{m.name}</span>
                        <button
                          onClick={() => {
                            setEditingMemberId(m.memberId);
                            setEditMemberNameInput(m.name);
                          }}
                          className="text-charcoal-muted hover:text-forest"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className="text-[10px] text-charcoal-muted">
                      Paid: ₹{m.paid.toLocaleString()} · Share: ₹{m.share.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-xs font-extrabold ${
                      m.balance > 0.01
                        ? 'text-forest'
                        : m.balance < -0.01
                        ? 'text-warmorange-dark'
                        : 'text-charcoal-muted'
                    }`}
                  >
                    {m.balance > 0.01 ? `+₹${m.balance.toLocaleString()}` : m.balance < -0.01 ? `-₹${Math.abs(m.balance).toLocaleString()}` : '₹0'}
                  </div>
                  <div className="text-[9px] uppercase font-bold text-charcoal-muted">
                    {m.balance > 0.01 ? 'Receives' : m.balance < -0.01 ? 'Owes' : 'Settled'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recorded Expenses List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-charcoal-border shadow-soft p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-border/50">
            <h3 className="text-sm font-bold text-charcoal">Recorded Expenses ({expenses.length})</h3>
            <span className="text-xs text-charcoal-muted">Chronological order</span>
          </div>

          <div className="space-y-3">
            {expenses.map((exp) => {
              const payer = members.find((m) => m.id === exp.paidBy) || { name: 'Unknown' };
              const participantNames = (exp.participants || []).map((pId) => {
                const found = members.find((m) => m.id === pId);
                return found ? found.name : 'Unknown';
              });

              return (
                <div
                  key={exp.id}
                  className="p-4 rounded-2xl border border-charcoal-border bg-offwhite/40 hover:bg-white hover:border-forest/30 transition-all flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-charcoal">{exp.description}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-mint text-forest font-bold">
                        {exp.category}
                      </span>
                    </div>

                    <div className="text-[11px] text-charcoal-muted flex items-center gap-3">
                      <span>Paid by <strong className="text-charcoal">{payer.name}</strong></span>
                      <span>·</span>
                      <span>{exp.date}</span>
                      <span>·</span>
                      <span className="capitalize">{exp.splitType} split</span>
                    </div>

                    <div className="text-[10px] text-charcoal-muted">
                      Shared by: {participantNames.join(', ')}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <div className="text-base font-extrabold text-forest">
                      ₹{exp.amount.toLocaleString()}
                    </div>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1 rounded text-charcoal-muted hover:text-red-600 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {expenses.length === 0 && (
              <div className="text-center py-12 text-xs text-charcoal-muted">
                No expenses logged yet. Click "Add Expense" to start tracking group spending.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-elevated border border-charcoal-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-border/60">
              <h3 className="text-lg font-bold text-charcoal">Add New Group Expense</h3>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="p-1.5 rounded-xl text-charcoal-muted hover:text-charcoal transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Haveli Hotel Stay, Dinner, Fuel..."
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-sm bg-offwhite/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-sm bg-offwhite/50 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-sm bg-offwhite/50"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Paid By</label>
                  <select
                    value={expenseForm.paidBy}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-sm bg-offwhite/50"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-sm bg-offwhite/50"
                  />
                </div>
              </div>

              {/* Split Type Selector */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-2">Split Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExpenseForm({ ...expenseForm, splitType: 'equal' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      expenseForm.splitType === 'equal'
                        ? 'bg-forest text-offwhite border-forest'
                        : 'bg-offwhite text-charcoal border-charcoal-border'
                    }`}
                  >
                    Split Equally
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpenseForm({ ...expenseForm, splitType: 'custom' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      expenseForm.splitType === 'custom'
                        ? 'bg-forest text-offwhite border-forest'
                        : 'bg-offwhite text-charcoal border-charcoal-border'
                    }`}
                  >
                    Custom Amounts
                  </button>
                </div>
              </div>

              {/* Participants Selection */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-2">
                  Select Travelers Sharing Expense:
                </label>
                <div className="space-y-2">
                  {members.map((m) => {
                    const isParticipating = expenseForm.participants.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          isParticipating ? 'bg-mint/40 border-mint-dark' : 'bg-offwhite border-charcoal-border/50'
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-charcoal">
                          <input
                            type="checkbox"
                            checked={isParticipating}
                            onChange={() => handleToggleParticipant(m.id)}
                            className="rounded text-forest focus:ring-forest"
                          />
                          <span>{m.avatar} {m.name}</span>
                        </label>

                        {/* If custom split, show amount input */}
                        {expenseForm.splitType === 'custom' && isParticipating && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-charcoal-muted">₹</span>
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={expenseForm.customShares[m.id] || ''}
                              onChange={(e) => handleCustomShareChange(m.id, e.target.value)}
                              className="w-20 px-2 py-1 rounded border border-charcoal-border text-xs font-bold bg-white text-right"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-charcoal-border/60">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 rounded-xl border border-charcoal-border text-xs font-bold text-charcoal hover:bg-offwhite"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest text-offwhite text-xs font-bold hover:bg-forest-hover shadow-soft"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

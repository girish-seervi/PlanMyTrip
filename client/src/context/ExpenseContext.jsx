import React, { createContext, useContext, useMemo } from 'react';
import { useTrip } from './TripContext';
import { useNotification } from './NotificationContext';

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const { activeTrip, updateActiveTrip } = useTrip();
  const { showSuccess, showError, showInfo } = useNotification();

  const members = useMemo(() => {
    return activeTrip?.members || [
      { id: 'mem_1', name: 'You (Organizer)', isLeader: true, avatar: '👤' }
    ];
  }, [activeTrip?.members]);

  const expenses = useMemo(() => {
    return activeTrip?.expenses || [];
  }, [activeTrip?.expenses]);

  // Add Member
  const addMember = (name) => {
    if (!name || !name.trim()) return;
    const newMember = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: name.trim(),
      isLeader: false,
      avatar: ['🎒', '🧗‍♂️', '📸', '🌊', '🚲', '✈️'][Math.floor(Math.random() * 6)]
    };

    const updatedMembers = [...members, newMember];
    updateActiveTrip({ members: updatedMembers });
    showSuccess(`Added traveler "${name.trim()}".`);
  };

  // Edit Member Name
  const editMember = (id, newName) => {
    if (!newName || !newName.trim()) return;
    const updatedMembers = members.map((m) => (m.id === id ? { ...m, name: newName.trim() } : m));
    updateActiveTrip({ members: updatedMembers });
    showSuccess('Member name updated.');
  };

  // Remove Member
  const removeMember = (id) => {
    if (members.length <= 1) {
      showError('A trip must have at least one traveler.');
      return;
    }
    // Check if member has expenses
    const hasPaid = expenses.some((e) => e.paidBy === id);
    if (hasPaid) {
      showError('Cannot remove a member who has paid for recorded expenses. Reassign or delete their expenses first.');
      return;
    }

    const updatedMembers = members.filter((m) => m.id !== id);
    // Also remove from any expense participants
    const updatedExpenses = expenses.map((e) => ({
      ...e,
      participants: (e.participants || []).filter((p) => p !== id)
    }));

    updateActiveTrip({ members: updatedMembers, expenses: updatedExpenses });
    showInfo('Member removed from trip.');
  };

  // Add Expense
  const addExpense = (expenseData) => {
    const {
      description,
      amount,
      category = 'Miscellaneous',
      date = new Date().toISOString().split('T')[0],
      paidBy,
      participants = [],
      splitType = 'equal',
      customShares = {}
    } = expenseData;

    if (!description || !description.trim()) {
      showError('Please provide an expense description.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showError('Please enter a valid expense amount greater than 0.');
      return;
    }

    if (!paidBy) {
      showError('Please select who paid for this expense.');
      return;
    }

    if (!participants || participants.length === 0) {
      showError('Please select at least one traveler sharing this expense.');
      return;
    }

    // Validate custom split if applicable
    if (splitType === 'custom') {
      const customSum = participants.reduce((sum, pId) => sum + (parseFloat(customShares[pId]) || 0), 0);
      if (Math.abs(customSum - parsedAmount) > 0.05) {
        showError(`Custom shares total (${customSum.toFixed(2)}) must exactly equal the total amount (${parsedAmount.toFixed(2)}).`);
        return;
      }
    }

    const newExpense = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      description: description.trim(),
      amount: parsedAmount,
      category,
      date,
      paidBy,
      participants,
      splitType,
      customShares: splitType === 'custom' ? customShares : {}
    };

    const updatedExpenses = [newExpense, ...expenses];
    updateActiveTrip({ expenses: updatedExpenses });
    showSuccess(`Added expense: "${description.trim()}"`);
  };

  // Edit Expense
  const editExpense = (id, updatedData) => {
    const updatedExpenses = expenses.map((e) => (e.id === id ? { ...e, ...updatedData } : e));
    updateActiveTrip({ expenses: updatedExpenses });
    showSuccess('Expense updated successfully.');
  };

  // Delete Expense
  const deleteExpense = (id) => {
    const updatedExpenses = expenses.filter((e) => e.id !== id);
    updateActiveTrip({ expenses: updatedExpenses });
    showInfo('Expense deleted.');
  };

  // Member Balances & Spending Calculations
  const { memberBalances, totalSpent, settlements, categoryExpenses } = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Initialize stats per member
    const balanceMap = {};
    const paidMap = {};
    const shareMap = {};

    members.forEach((m) => {
      balanceMap[m.id] = 0;
      paidMap[m.id] = 0;
      shareMap[m.id] = 0;
    });

    // Initialize category totals
    const catMap = {
      Accommodation: 0,
      Food: 0,
      Transportation: 0,
      Activities: 0,
      Miscellaneous: 0
    };

    expenses.forEach((exp) => {
      const amt = Number(exp.amount) || 0;
      const payerId = exp.paidBy;

      // Category accumulation
      const normCat = Object.keys(catMap).find(k => k.toLowerCase() === (exp.category || '').toLowerCase()) || 'Miscellaneous';
      catMap[normCat] += amt;

      // Credit the payer
      if (paidMap[payerId] !== undefined) {
        paidMap[payerId] += amt;
      }

      // Debit the participants
      const parts = exp.participants || [];
      if (parts.length > 0) {
        if (exp.splitType === 'custom' && exp.customShares) {
          parts.forEach((pId) => {
            const share = parseFloat(exp.customShares[pId]) || 0;
            if (shareMap[pId] !== undefined) {
              shareMap[pId] += share;
            }
          });
        } else {
          // Equal split among participants
          const splitAmount = amt / parts.length;
          parts.forEach((pId) => {
            if (shareMap[pId] !== undefined) {
              shareMap[pId] += splitAmount;
            }
          });
        }
      }
    });

    // Net balance = Paid - Share
    const resultBalances = members.map((m) => {
      const paid = paidMap[m.id] || 0;
      const share = shareMap[m.id] || 0;
      const net = paid - share;
      return {
        memberId: m.id,
        name: m.name,
        avatar: m.avatar,
        paid: Math.round(paid * 100) / 100,
        share: Math.round(share * 100) / 100,
        balance: Math.round(net * 100) / 100
      };
    });

    // Generate Debt Simplification Settlements
    // Creditors (balance > 0), Debtors (balance < 0)
    const creditors = [];
    const debtors = [];

    resultBalances.forEach((b) => {
      if (b.balance > 0.01) {
        creditors.push({ id: b.memberId, name: b.name, balance: b.balance });
      } else if (b.balance < -0.01) {
        debtors.push({ id: b.memberId, name: b.name, balance: -b.balance }); // positive debt
      }
    });

    // Sort descending by magnitude
    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => b.balance - a.balance);

    const settlementList = [];
    let cIdx = 0;
    let dIdx = 0;

    while (cIdx < creditors.length && dIdx < debtors.length) {
      const creditor = creditors[cIdx];
      const debtor = debtors[dIdx];

      const transferAmount = Math.min(creditor.balance, debtor.balance);
      const roundedAmount = Math.round(transferAmount);

      if (roundedAmount > 0) {
        settlementList.push({
          id: `settle_${debtor.id}_to_${creditor.id}_${roundedAmount}`,
          fromId: debtor.id,
          fromName: debtor.name,
          toId: creditor.id,
          toName: creditor.name,
          amount: roundedAmount,
          status: 'pending' // pending or settled
        });
      }

      creditor.balance -= transferAmount;
      debtor.balance -= transferAmount;

      if (creditor.balance < 0.01) cIdx++;
      if (debtor.balance < 0.01) dIdx++;
    }

    return {
      memberBalances: resultBalances,
      totalSpent: total,
      settlements: settlementList,
      categoryExpenses: catMap
    };
  }, [members, expenses]);

  return (
    <ExpenseContext.Provider
      value={{
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
        settlements,
        categoryExpenses
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
}

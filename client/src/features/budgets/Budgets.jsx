import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetSchema } from "@/lib/validators";
import api from "@/lib/api.client";
import { Plus, Wallet, AlertCircle, Loader2, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import MonthYearPicker from "@/components/ui/MonthYearPicker";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Budgets() {
  const queryClient = useQueryClient();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Fetch budgets
  const { data: budgetsData, isLoading } = useQuery({
    queryKey: ["budgets", selectedMonth, selectedYear],
    queryFn: async () => {
      const response = await api.get(`/budgets?month=${selectedMonth}&year=${selectedYear}`);
      return response.data;
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/categories");
      return response.data;
    },
  });

  // ── React Hook Form ──────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(budgetSchema),
  });

  // Add/Edit Budget Mutation (Upsert)
  const addBudgetMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/budgets", {
        category: data.category,
        amount: data.amount,
        month: selectedMonth,
        year: selectedYear,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["budgets"]);
      queryClient.invalidateQueries(["dashboardData"]);
      closeModal();
    },
  });

  // Delete Budget Mutation
  const deleteBudgetMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/budgets/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["budgets"]);
      queryClient.invalidateQueries(["dashboardData"]);
      setOpenMenuId(null);
    },
  });

  const openModalForNew = () => {
    setEditingBudget(null);
    reset({ category: "", amount: "" });
    setIsModalOpen(true);
  };

  const openModalForEdit = (budget) => {
    setEditingBudget(budget);
    setOpenMenuId(null);
    reset({ category: budget.category, amount: budget.amount });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  const onSubmit = (data) => {
    // If editing, preserve the original category
    addBudgetMutation.mutate({
      category: editingBudget ? editingBudget.category : data.category,
      amount: data.amount,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" onClick={() => setOpenMenuId(null)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground mt-1">Set limits and track your spending.</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthYearPicker 
            month={selectedMonth} 
            year={selectedYear} 
            onMonthChange={setSelectedMonth} 
            onYearChange={setSelectedYear} 
          />
          <button
            onClick={openModalForNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm h-9"
          >
            <Plus className="w-4 h-4" />
            Create Budget
          </button>
        </div>
      </div>

      {/* Budgets Grid */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : budgetsData?.budgets?.length === 0 ? (
        <div className="p-12 text-center border border-border/50 rounded-xl bg-card/30">
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No budgets set</h3>
          <p className="text-muted-foreground mt-1">Create a budget to start tracking your expenses.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgetsData?.budgets?.map((budget) => {
            const percentage = Math.min((budget.spent / budget.amount) * 100, 100) || 0;
            
            let barColor = "bg-primary";
            let alertColor = "";
            if (percentage >= 90) {
              barColor = "bg-rose-500";
              alertColor = "text-rose-500";
            } else if (percentage >= 75) {
              barColor = "bg-amber-500";
              alertColor = "text-amber-500";
            }

            return (
              <div
                key={budget._id}
                className="p-6 rounded-xl border border-border/50 bg-card/50 relative"
              >
                {percentage >= 100 && (
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 -z-10" 
                    style={{ background: 'radial-gradient(circle at top right, hsl(var(--destructive) / 0.15) 0%, transparent 70%)' }}
                  />
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize text-lg">
                        {categoriesData?.expense?.find(c => c.key === budget.category)?.label || budget.category}
                      </h3>
                      <p className="text-xs text-muted-foreground">Monthly Limit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {percentage >= 90 && (
                      <AlertCircle className={`w-5 h-5 ${alertColor}`} />
                    )}
                    
                    <div className="relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === budget._id ? null : budget._id); }}
                        className="p-1 rounded-md text-muted-foreground hover:bg-secondary transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuId === budget._id && (
                        <div className="absolute right-0 mt-1 w-36 bg-card border border-border rounded-md shadow-lg overflow-hidden z-20">
                          <button 
                            onClick={(e) => { e.stopPropagation(); openModalForEdit(budget); }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-secondary flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteBudgetMutation.mutate(budget._id); }}
                            className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{formatCurrency(budget.spent)}</span>
                    <span className="text-muted-foreground">{formatCurrency(budget.amount)}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${percentage}%`, transition: 'width 0.6s ease-out' }}
                      className={`h-full ${barColor} rounded-full`}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>{percentage.toFixed(1)}% used</span>
                    <span>{formatCurrency(Math.max(budget.amount - budget.spent, 0))} remaining</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-card border border-border shadow-2xl rounded-xl overflow-hidden"
            >
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold">{editingBudget ? "Edit Budget" : "Set Budget"}</h2>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select 
                    {...register("category")}
                    className={`w-full h-10 px-3 rounded-md border ${errors.category ? 'border-destructive' : 'border-input'} bg-background text-sm capitalize disabled:opacity-50`}
                    disabled={!!editingBudget}
                  >
                    <option value="">Select category</option>
                    {categoriesData?.expense?.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
                  {editingBudget && <p className="text-xs text-muted-foreground">Category cannot be changed during edit.</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Limit Amount</label>
                  <input 
                    type="number"
                    step="0.01"
                    {...register("amount", { valueAsNumber: true })}
                    className={`w-full h-10 px-3 rounded-md border ${errors.amount ? 'border-destructive' : 'border-input'} bg-background text-sm`}
                    placeholder="1000"
                  />
                  {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={addBudgetMutation.isPending} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
                    {addBudgetMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Budget
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

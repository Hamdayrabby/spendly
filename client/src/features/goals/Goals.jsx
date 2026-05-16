import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalSchema, addFundsSchema } from "@/lib/validators";
import api from "@/lib/api.client";
import { Plus, Target, CheckCircle2, Loader2, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Goals() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addFundsGoalId, setAddFundsGoalId] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // ── React Hook Form (Goal Create/Edit) ───────────
  const goalForm = useForm({
    resolver: zodResolver(goalSchema),
  });

  // ── React Hook Form (Add Funds) ──────────────────
  const fundsForm = useForm({
    resolver: zodResolver(addFundsSchema),
  });

  // Fetch goals
  const { data: goalsData, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const response = await api.get("/goals");
      return response.data;
    },
  });

  // Create/Edit Goal Mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goal) => {
      if (editingGoal) {
        const response = await api.put(`/goals/${editingGoal._id}`, goal);
        return response.data;
      } else {
        const response = await api.post("/goals", goal);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["goals"]);
      closeModal();
    },
  });

  // Delete Goal Mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/goals/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["goals"]);
      setOpenMenuId(null);
    },
  });

  // Add Funds Mutation
  const addFundsMutation = useMutation({
    mutationFn: async ({ id, amount }) => {
      const response = await api.patch(`/goals/${id}/add-funds`, { amount });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["goals"]);
      setAddFundsGoalId(null);
      fundsForm.reset();
    },
  });

  const openModalForNew = () => {
    setEditingGoal(null);
    goalForm.reset({ name: "", targetAmount: "", targetDate: "", color: "emerald" });
    setIsModalOpen(true);
  };

  const openModalForEdit = (goal) => {
    setEditingGoal(goal);
    setOpenMenuId(null);
    goalForm.reset({
      name: goal.name,
      targetAmount: goal.targetAmount,
      targetDate: (() => {
        const d = new Date(goal.targetDate);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      })(),
      color: goal.color,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const onGoalSubmit = (data) => {
    createGoalMutation.mutate(data);
  };

  const onFundsSubmit = (data) => {
    if (addFundsGoalId) {
      addFundsMutation.mutate({ id: addFundsGoalId, amount: data.amount });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" onClick={() => setOpenMenuId(null)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Savings Goals</h1>
          <p className="text-muted-foreground mt-1">Plan for the future and track your progress.</p>
        </div>
        <button
          onClick={openModalForNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Goal
        </button>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : goalsData?.goals?.length === 0 ? (
        <div className="p-12 text-center border border-border/50 rounded-xl bg-card/30">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No active goals</h3>
          <p className="text-muted-foreground mt-1">Create a savings goal to start tracking your progress.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goalsData?.goals?.map((goal) => {
            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isComplete = percentage >= 100;
            
            const colorMap = {
              emerald: "bg-emerald-500",
              purple: "bg-purple-500",
              amber: "bg-amber-500",
              blue: "bg-blue-500",
              rose: "bg-rose-500"
            };
            const barColor = colorMap[goal.color] || "bg-primary";

            return (
              <div
                key={goal._id}
                className="p-6 rounded-xl border border-border/50 bg-card/50 relative flex flex-col"
              >
                {isComplete && (
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 -z-10" 
                    style={{ background: `radial-gradient(circle at top right, var(--${goal.color}-500, hsl(142 71% 45%)) 0%, transparent 70%)`, opacity: 0.15 }}
                  />
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <Target className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{goal.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isComplete && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                    
                    <div className="relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === goal._id ? null : goal._id); }}
                        className="p-1 rounded-md text-muted-foreground hover:bg-secondary transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuId === goal._id && (
                        <div className="absolute right-0 mt-1 w-36 bg-card border border-border rounded-md shadow-lg overflow-hidden z-20">
                          <button 
                            onClick={(e) => { e.stopPropagation(); openModalForEdit(goal); }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-secondary flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteGoalMutation.mutate(goal._id); }}
                            className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-auto pt-6">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${percentage}%`, transition: 'width 0.6s ease-out' }}
                      className={`h-full ${barColor} rounded-full`}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
                    <span>{percentage.toFixed(1)}% complete</span>
                    
                    {!isComplete && (
                      <button 
                        onClick={() => { setAddFundsGoalId(goal._id); fundsForm.reset({ amount: "" }); }}
                        className="text-primary hover:underline font-medium"
                      >
                        Add Funds
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Goal Modal */}
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
              className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-xl overflow-hidden"
            >
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold">{editingGoal ? "Edit Savings Goal" : "Create Savings Goal"}</h2>
              </div>
              
              <form onSubmit={goalForm.handleSubmit(onGoalSubmit)} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Goal Name</label>
                  <input
                    type="text"
                    {...goalForm.register("name")}
                    className={`w-full h-10 px-3 rounded-md border ${goalForm.formState.errors.name ? 'border-destructive' : 'border-input'} bg-background text-sm`}
                    placeholder="New Car, Vacation, etc."
                  />
                  {goalForm.formState.errors.name && <p className="text-xs text-destructive">{goalForm.formState.errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      {...goalForm.register("targetAmount", { valueAsNumber: true })}
                      className={`w-full h-10 px-3 rounded-md border ${goalForm.formState.errors.targetAmount ? 'border-destructive' : 'border-input'} bg-background text-sm`}
                      placeholder="50000"
                    />
                    {goalForm.formState.errors.targetAmount && <p className="text-xs text-destructive">{goalForm.formState.errors.targetAmount.message}</p>}
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-sm font-medium">Target Date</label>
                    <Controller
                      control={goalForm.control}
                      name="targetDate"
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value ? new Date(field.value) : null}
                          onChange={(date) => field.onChange(date.toISOString().split("T")[0])}
                          className={`w-full h-10 px-3 rounded-md border ${goalForm.formState.errors.targetDate ? 'border-destructive' : 'border-input'} bg-background text-sm`}
                          dateFormat="yyyy-MM-dd"
                          placeholderText="Select a date"
                          wrapperClassName="w-full"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                        />
                      )}
                    />
                    {goalForm.formState.errors.targetDate && <p className="text-xs text-destructive">{goalForm.formState.errors.targetDate.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme Color</label>
                  <select
                    {...goalForm.register("color")}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm capitalize"
                  >
                    <option value="emerald">Emerald</option>
                    <option value="purple">Purple</option>
                    <option value="amber">Amber</option>
                    <option value="blue">Blue</option>
                    <option value="rose">Rose</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={createGoalMutation.isPending} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
                    {createGoalMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingGoal ? "Save Changes" : "Create Goal"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Funds Modal */}
      <AnimatePresence>
        {addFundsGoalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80"
              onClick={() => setAddFundsGoalId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-card border border-border shadow-2xl rounded-xl overflow-hidden"
            >
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold">Add Funds</h2>
                <p className="text-sm text-muted-foreground mt-1">Contribute to your savings goal.</p>
              </div>
              
              <form onSubmit={fundsForm.handleSubmit(onFundsSubmit)} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount to Add</label>
                  <input
                    type="number"
                    step="0.01"
                    {...fundsForm.register("amount", { valueAsNumber: true })}
                    className={`w-full h-10 px-3 rounded-md border ${fundsForm.formState.errors.amount ? 'border-destructive' : 'border-input'} bg-background text-sm`}
                    placeholder="1000"
                  />
                  {fundsForm.formState.errors.amount && <p className="text-xs text-destructive">{fundsForm.formState.errors.amount.message}</p>}
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setAddFundsGoalId(null)} className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={addFundsMutation.isPending} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
                    {addFundsMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Add Funds
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

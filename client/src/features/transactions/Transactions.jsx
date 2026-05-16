import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema } from "@/lib/validators";
import api from "@/lib/api.client";
import { Plus, ArrowUpRight, ArrowDownRight, Loader2, Edit2, Trash2, Search, X } from "lucide-react";
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

export default function Transactions() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // ── Filters ──────────────────────────────────────
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Fetch transactions
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["transactions", filterType],
    queryFn: async () => {
      const typeQuery = filterType !== "all" ? `?type=${filterType}` : "";
      const response = await api.get(`/transactions${typeQuery}`);
      return response.data;
    },
  });

  // Fetch categories for the form
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
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
  });

  // Add/Edit Transaction Mutation
  const addTxMutation = useMutation({
    mutationFn: async (tx) => {
      if (editingTx) {
        const response = await api.put(`/transactions/${editingTx._id}`, tx);
        return response.data;
      } else {
        const response = await api.post("/transactions", tx);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["dashboardData"]);
      closeModal();
    },
  });

  // Delete Transaction Mutation
  const deleteTxMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/transactions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["dashboardData"]);
    },
  });

  const openModalForNew = () => {
    setEditingTx(null);
    setIsCustomCategory(false);
    reset({
      type: "expense",
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (tx) => {
    setEditingTx(tx);
    // If the transaction category is not in the predefined lists, it's a custom category
    const isPredefined = [...(categoriesData?.expense || []), ...(categoriesData?.income || [])]
      .some(c => c.key === tx.category);
    setIsCustomCategory(!isPredefined);

    reset({
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      category: tx.category,
      date: new Date(tx.date).toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTx(null);
  };

  const onSubmit = (data) => {
    addTxMutation.mutate({
      ...data,
      date: data.date || new Date().toISOString(),
    });
  };

  // ── Client-side filtering ────────────────────────
  const filteredTransactions = (txData?.transactions || []).filter((tx) => {
    if (searchQuery && !tx.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCategory && tx.category !== filterCategory) return false;
    if (dateFrom && new Date(tx.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(tx.date) > new Date(dateTo + "T23:59:59")) return false;
    return true;
  });

  const hasActiveFilters = searchQuery || filterCategory || dateFrom || dateTo;

  // Build a flat category label lookup from both expense and income categories
  const categoryLabelMap = {};
  [...(categoriesData?.expense || []), ...(categoriesData?.income || [])].forEach(c => {
    categoryLabelMap[c.key] = c.label;
  });

  // Collect unique categories from current data
  const uniqueCategories = [...new Set((txData?.transactions || []).map((tx) => tx.category))].sort();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">Manage your income and expenses.</p>
        </div>
        <button
          onClick={openModalForNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Type Filters */}
      <div className="flex items-center gap-2 bg-card/50 p-1 rounded-lg border border-border/50 w-fit">
        {["all", "expense", "income"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
              filterType === type
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm capitalize"
        >
          <option value="">All Categories</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>{categoryLabelMap[cat] || cat}</option>
          ))}
        </select>

        <DatePicker
          selected={dateFrom ? new Date(dateFrom) : null}
          onChange={(date) => setDateFrom(date ? date.toISOString().split("T")[0] : "")}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm w-32"
          placeholderText="From"
          dateFormat="yyyy-MM-dd"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          isClearable
        />
        <DatePicker
          selected={dateTo ? new Date(dateTo) : null}
          onChange={(date) => setDateTo(date ? date.toISOString().split("T")[0] : "")}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm w-32"
          placeholderText="To"
          dateFormat="yyyy-MM-dd"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          isClearable
        />

        {hasActiveFilters && (
          <button
            onClick={() => { setSearchQuery(""); setFilterCategory(""); setDateFrom(""); setDateTo(""); }}
            className="h-9 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Transactions Table */}
      <div className="border border-border/50 rounded-xl bg-card/30 overflow-hidden">
        {txLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            {hasActiveFilters ? "No transactions match your filters." : "No transactions found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="group hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium">{tx.description}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {categoryLabelMap[tx.category] || tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      <div className="flex items-center justify-end gap-1.5">
                        {tx.type === "income" ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-rose-500" />
                        )}
                        <span className={tx.type === "income" ? "text-emerald-500" : "text-foreground"}>
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModalForEdit(tx)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteTxMutation.mutate(tx._id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results count */}
      {hasActiveFilters && filteredTransactions.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {filteredTransactions.length} of {txData?.transactions?.length} transactions
        </p>
      )}

      {/* Add/Edit Transaction Modal */}
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
              className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-xl overflow-hidden"
            >
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold">{editingTx ? "Edit Transaction" : "New Transaction"}</h2>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <select {...register("type")} className={`w-full h-10 px-3 rounded-md border ${errors.type ? 'border-destructive' : 'border-input'} bg-background text-sm`}>
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                    {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("amount", { valueAsNumber: true })}
                      className={`w-full h-10 px-3 rounded-md border ${errors.amount ? 'border-destructive' : 'border-input'} bg-background text-sm`}
                      placeholder="0.00"
                    />
                    {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <input
                    type="text"
                    {...register("description")}
                    className={`w-full h-10 px-3 rounded-md border ${errors.description ? 'border-destructive' : 'border-input'} bg-background text-sm`}
                    placeholder="Grocery run..."
                  />
                  {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Category</label>
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsCustomCategory(!isCustomCategory);
                          reset({ ...control._formValues, category: "" }); // Clear category when switching
                        }}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        {isCustomCategory ? "Select Existing" : "+ Add Custom"}
                      </button>
                    </div>
                    {isCustomCategory ? (
                      <input
                        type="text"
                        {...register("category")}
                        className={`w-full h-10 px-3 rounded-md border ${errors.category ? 'border-destructive' : 'border-input'} bg-background text-sm`}
                        placeholder="Type a new category..."
                      />
                    ) : (
                      <select
                        {...register("category")}
                        className={`w-full h-10 px-3 rounded-md border ${errors.category ? 'border-destructive' : 'border-input'} bg-background text-sm capitalize`}
                      >
                        <option value="">Select category</option>
                        <optgroup label="Expenses">
                          {categoriesData?.expense?.map(c => (
                            <option key={c.key} value={c.key}>{c.label}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Income">
                          {categoriesData?.income?.map(c => (
                            <option key={c.key} value={c.key}>{c.label}</option>
                          ))}
                        </optgroup>
                      </select>
                    )}
                    {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-sm font-medium">Date</label>
                    <Controller
                      control={control}
                      name="date"
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value ? new Date(field.value) : null}
                          onChange={(date) => field.onChange(date.toISOString().split("T")[0])}
                          className={`w-full h-10 px-3 rounded-md border ${errors.date ? 'border-destructive' : 'border-input'} bg-background text-sm`}
                          dateFormat="yyyy-MM-dd"
                          placeholderText="Select a date"
                          wrapperClassName="w-full"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                        />
                      )}
                    />
                    {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={addTxMutation.isPending} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
                    {addTxMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingTx ? "Save Changes" : "Save Transaction"}
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

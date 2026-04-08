"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { Calendar, X } from "lucide-react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    dateRange: 'all' | 'last7days' | 'last30days' | 'last90days' | 'thisYear';
    categories: string[];
    type: 'all' | 'expense' | 'income';
  };
  onFiltersChange: (filters: FilterModalProps['filters']) => void;
}

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'last90days', label: 'Last 90 Days' },
  { value: 'thisYear', label: 'This Year' },
] as const;

export function FilterModal({ isOpen, onClose, filters, onFiltersChange }: FilterModalProps) {
  const { categories } = useAppStore();
  const [tempFilters, setTempFilters] = React.useState(filters);

  React.useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      dateRange: 'all' as const,
      categories: [],
      type: 'all' as const,
    };
    setTempFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    onClose();
  };

  const toggleCategory = (categoryId: string) => {
    setTempFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
            <Calendar className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Filter Analytics</h2>
          <p className="text-foreground-secondary">
            Customize your financial insights
          </p>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Date Range</label>
          <div className="grid grid-cols-1 gap-2">
            {DATE_RANGE_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="dateRange"
                  value={option.value}
                  checked={tempFilters.dateRange === option.value}
                  onChange={(e) => setTempFilters(prev => ({ ...prev, dateRange: e.target.value as 'all' | 'last7days' | 'last30days' | 'last90days' | 'thisYear' }))}
                  className="text-primary-start focus:ring-primary-start"
                />
                <span className="text-foreground">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Transaction Type</label>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'expense', label: 'Expenses' },
              { value: 'income', label: 'Income' },
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors flex-1 justify-center">
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={tempFilters.type === option.value}
                  onChange={(e) => setTempFilters(prev => ({ ...prev, type: e.target.value as 'all' | 'expense' | 'income' }))}
                  className="text-primary-start focus:ring-primary-start"
                />
                <span className="text-foreground text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Categories</label>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center space-x-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={tempFilters.categories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="text-primary-start focus:ring-primary-start"
                />
                <span className="text-foreground flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="secondary"
            onClick={handleResetFilters}
            className="flex-1"
          >
            Reset All
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApplyFilters}
            className="flex-1"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </Modal>
  );
}
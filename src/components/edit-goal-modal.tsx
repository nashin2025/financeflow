"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Target, Calendar, DollarSign, Palette, Smile } from "lucide-react";

interface EditGoalModalProps {
  goal: {
    id: string;
    name: string;
    type: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    monthlyContribution: number;
    icon: string;
    color: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const GOAL_TYPES = [
  { value: 'savings', label: 'Savings' },
  { value: 'debt_payoff', label: 'Debt Payoff' },
  { value: 'emergency_fund', label: 'Emergency Fund' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'investment', label: 'Investment' },
  { value: 'custom', label: 'Custom' },
];

const GOAL_ICONS = [
  '🎯', '💰', '🏠', '🚗', '🎓', '✈️', '💍', '🏖️', '💼', '📈', '🏆', '🎨'
];

const GOAL_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
  '#EF4444', '#84CC16', '#F97316', '#06B6D4', '#A855F7', '#64748B'
];

export function EditGoalModal({ goal, isOpen, onClose }: EditGoalModalProps) {
  const { updateGoal } = useAppStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: goal.name,
    type: goal.type,
    targetAmount: goal.targetAmount.toString(),
    targetDate: goal.targetDate.split('T')[0], // Format for date input
    monthlyContribution: goal.monthlyContribution.toString(),
    icon: goal.icon,
    color: goal.color,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: goal.name,
        type: goal.type,
        targetAmount: goal.targetAmount.toString(),
        targetDate: goal.targetDate.split('T')[0],
        monthlyContribution: goal.monthlyContribution.toString(),
        icon: goal.icon,
        color: goal.color,
      });
      setErrors({});
    }
  }, [goal, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }

    const targetAmount = parseFloat(formData.targetAmount);
    if (!targetAmount || targetAmount <= 0) {
      newErrors.targetAmount = 'Please enter a valid target amount';
    } else if (targetAmount > 10000000) {
      newErrors.targetAmount = 'Target amount cannot exceed MVR 10,000,000';
    }

    const targetDate = new Date(formData.targetDate);
    if (!formData.targetDate || targetDate <= new Date()) {
      newErrors.targetDate = 'Please select a future date';
    }

    const monthlyContribution = parseFloat(formData.monthlyContribution);
    if (monthlyContribution < 0) {
      newErrors.monthlyContribution = 'Monthly contribution cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const updatedGoal = {
        name: formData.name.trim(),
        type: formData.type as any,
        targetAmount: parseFloat(formData.targetAmount),
        targetDate: formData.targetDate,
        monthlyContribution: parseFloat(formData.monthlyContribution) || 0,
        icon: formData.icon,
        color: formData.color,
      };

      // Update via API
      const response = await fetch(`/api/goals?id=${goal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedGoal),
      });

      if (!response.ok) {
        throw new Error('Failed to update goal');
      }

      // Update local store
      updateGoal(goal.id, updatedGoal);
      onClose();
    } catch (error) {
      console.error('Error updating goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ backgroundColor: `${formData.color}20` }}
          >
            {formData.icon}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Edit Goal</h2>
          <p className="text-foreground-secondary">Update your financial goal details</p>
        </div>

        <div className="space-y-4 mb-6">
          {/* Goal Name */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Goal Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter goal name"
              className={errors.name ? 'border-error' : ''}
            />
            {errors.name && (
              <p className="text-sm text-error mt-1">{errors.name}</p>
            )}
          </div>

          {/* Goal Type */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Goal Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-primary"
            >
              {GOAL_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Amount */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Target Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">MVR</span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.targetAmount}
                onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                placeholder="0.00"
                className={`pl-12 ${errors.targetAmount ? 'border-error' : ''}`}
              />
            </div>
            {errors.targetAmount && (
              <p className="text-sm text-error mt-1">{errors.targetAmount}</p>
            )}
          </div>

          {/* Target Date */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Target Date
            </label>
            <Input
              type="date"
              value={formData.targetDate}
              onChange={(e) => handleInputChange('targetDate', e.target.value)}
              className={errors.targetDate ? 'border-error' : ''}
            />
            {errors.targetDate && (
              <p className="text-sm text-error mt-1">{errors.targetDate}</p>
            )}
          </div>

          {/* Monthly Contribution */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Monthly Contribution (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">MVR</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.monthlyContribution}
                onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                placeholder="0.00"
                className={`pl-12 ${errors.monthlyContribution ? 'border-error' : ''}`}
              />
            </div>
            {errors.monthlyContribution && (
              <p className="text-sm text-error mt-1">{errors.monthlyContribution}</p>
            )}
          </div>

          {/* Icon Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {GOAL_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleInputChange('icon', icon)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg hover:bg-white/10 transition-colors ${
                    formData.icon === icon ? 'bg-primary-start/20 ring-2 ring-primary-start' : ''
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {GOAL_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange('color', color)}
                  className={`w-10 h-10 rounded-lg hover:ring-2 hover:ring-white/50 transition-all ${
                    formData.color === color ? 'ring-2 ring-primary-start scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Goal'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
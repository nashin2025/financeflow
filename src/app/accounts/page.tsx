"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { Account } from "@/types";
import { EditAccountModal } from "@/components/edit-account-modal";
import { DeleteAccountModal } from "@/components/delete-account-modal";
import { BankConnectionModal } from "@/components/bank-connection-modal";
import { TransactionHistoryModal } from "@/components/transaction-history-modal";
import {
  Plus,
  Landmark,
  TrendingUp,
  MoreHorizontal,
  RefreshCw,
  Link as LinkIcon
} from "lucide-react";
import Link from "next/link";

export default function AccountsPage() {
  const { accounts } = useAppStore();
  const [editingAccount, setEditingAccount] = React.useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = React.useState<Account | null>(null);
  const [syncingAccountId, setSyncingAccountId] = React.useState<string | null>(null);
  const [showBankConnection, setShowBankConnection] = React.useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = React.useState<Account | null>(null);
    
  if (accounts.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="lg:pl-[240px]">
          <Header title="Accounts" showSearch={false} showNotifications={false} />
          <main className="p-4 lg:p-6 pb-20 lg:pb-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
            <Card variant="glass" className="max-w-md w-full text-center p-8">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                <Landmark className="h-10 w-10 text-foreground-secondary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">No Accounts Yet</h1>
              <p className="text-foreground-secondary mb-6">Add your first bank account to start tracking your finances.</p>
              <Link href="/add-account">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Account
                </Button>
              </Link>
            </Card>
          </main>
        </div>
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    );
  }
  
  const totalAssets = accounts
    .filter(a => a.balance >= 0)
    .reduce((sum, a) => sum + a.balance, 0);
  
  const totalLiabilities = accounts
    .filter(a => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);
  
  const netWorth = totalAssets - totalLiabilities;

  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      checking: "Checking Account",
      savings: "Savings Account",
      credit_card: "Credit Card",
      cash: "Cash",
      investment: "Investment",
      loan: "Loan",
      mortgage: "Mortgage",
      crypto: "Cryptocurrency",
      other: "Other",
    };
    return labels[type] || type;
  };

  const groupedAccounts = accounts.reduce<Record<string, typeof accounts>>((acc, account) => {
    const type = account.type === "credit_card" || account.type === "loan" || account.type === "mortgage" 
      ? "Liabilities" 
      : "Assets";
    if (!acc[type]) acc[type] = [];
    acc[type].push(account);
    return acc;
  }, {});

  const handleEditAccount = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      setEditingAccount(account);
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      setDeletingAccount(account);
    }
  };

  const handleSyncAccount = async (accountId: string) => {
    setSyncingAccountId(accountId);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, this would sync with external APIs
      // For now, just show success
      alert(`Successfully synced ${accounts.find(a => a.id === accountId)?.name || 'account'}!`);
    } catch (error) {
      alert('Failed to sync account. Please try again.');
    } finally {
      setSyncingAccountId(null);
    }
  };

  const handleSyncAllAccounts = async () => {
    setSyncingAccountId('all');

    try {
      // Simulate syncing all accounts
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert(`Successfully synced all ${accounts.length} accounts!`);
    } catch (error) {
      alert('Failed to sync accounts. Please try again.');
    } finally {
      setSyncingAccountId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[240px]">
        <Header title="Accounts" showSearch showNotifications />
        
        <main className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Your Accounts
              </h1>
              <p className="text-foreground-secondary mt-1">
                Manage and track all your financial accounts
              </p>
            </div>
            <Link href="/add-account">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </Link>
          </div>

          {/* Net Worth Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="glass" className="col-span-1 md:col-span-2">
              <CardContent className="p-6">
                <p className="text-sm text-foreground-secondary">Net Worth</p>
                <p className="text-3xl font-bold font-mono text-foreground mt-1">
                  {formatCurrency(netWorth)}
                </p>
                <div className="flex items-center gap-6 mt-4">
                  <div>
                    <p className="text-xs text-foreground-tertiary">Assets</p>
                    <p className="text-lg font-bold font-mono text-success">{formatCurrency(totalAssets)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-tertiary">Liabilities</p>
                    <p className="text-lg font-bold font-mono text-error">{formatCurrency(totalLiabilities)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardContent className="p-6">
                <p className="text-sm text-foreground-secondary">Total Accounts</p>
                <p className="text-2xl font-bold font-mono text-foreground mt-1">
                  {accounts.length}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="success">{accounts.filter(a => a.isActive).length} active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Connected Banks */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary-start" />
                Connected Institutions
              </CardTitle>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSyncAllAccounts}
                disabled={syncingAccountId === 'all'}
              >
                {syncingAccountId === 'all' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></div>
                    Syncing...
                  </>
                ) : (
                  'Sync All'
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Add new connection */}
                <button
                  className="p-4 rounded-xl border-2 border-dashed border-white/10 hover:border-primary-start/50 hover:bg-primary-start/5 transition-all flex flex-col items-center justify-center gap-2 text-foreground-secondary hover:text-primary-start min-h-[120px]"
                  onClick={() => setShowBankConnection(true)}
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-sm">Connect New Bank</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Assets */}
          {groupedAccounts["Assets"] && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedAccounts["Assets"].map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${account.color}20` }}
                      >
                        <span className="text-xl">{account.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{account.name}</p>
                        <p className="text-sm text-foreground-tertiary">
                          {getAccountTypeLabel(account.type)} {account.institution && `• ${account.institution}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-mono font-semibold text-lg text-foreground">
                          {formatCurrency(account.balance)}
                        </p>
                        {account.isActive && (
                          <Badge variant="success" className="text-xs">Active</Badge>
                        )}
                      </div>
                      <DropdownMenu
                        trigger={
                          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <MoreHorizontal className="h-4 w-4 text-foreground-secondary" />
                          </button>
                        }
                        items={[
                          { label: "Edit", onClick: () => handleEditAccount(account.id) },
                          { label: "Delete", onClick: () => handleDeleteAccount(account.id), variant: "destructive" },
                        ]}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Liabilities */}
          {groupedAccounts["Liabilities"] && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-error" />
                  Liabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedAccounts["Liabilities"].map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${account.color}20` }}
                      >
                        <span className="text-xl">{account.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{account.name}</p>
                        <p className="text-sm text-foreground-tertiary">
                          {getAccountTypeLabel(account.type)} {account.institution && `• ${account.institution}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-mono font-semibold text-lg text-error">
                          -{formatCurrency(Math.abs(account.balance))}
                        </p>
                        <p className="text-xs text-foreground-tertiary">Balance</p>
                      </div>
                      <DropdownMenu
                        trigger={
                          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <MoreHorizontal className="h-4 w-4 text-foreground-secondary" />
                          </button>
                        }
                        items={[
                          { label: "Edit", onClick: () => handleEditAccount(account.id) },
                          { label: "Delete", onClick: () => handleDeleteAccount(account.id), variant: "destructive" },
                        ]}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center gap-2 text-center"
              onClick={() => setShowBankConnection(true)}
            >
              <div className="w-10 h-10 rounded-xl bg-primary-start/20 flex items-center justify-center">
                <LinkIcon className="h-5 w-5 text-primary-start" />
              </div>
              <span className="text-sm font-medium text-foreground">Connect Bank</span>
            </button>
            <Link href="/add-account">
              <button
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center gap-2 text-center w-full"
              >
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-success" />
                </div>
                <span className="text-sm font-medium text-foreground">Add Manual</span>
              </button>
            </Link>
            <button
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center gap-2 text-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSyncAllAccounts}
              disabled={syncingAccountId === 'all'}
            >
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                {syncingAccountId === 'all' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-warning/20 border-t-warning"></div>
                ) : (
                  <RefreshCw className="h-5 w-5 text-warning" />
                )}
              </div>
              <span className="text-sm font-medium text-foreground">
                {syncingAccountId === 'all' ? 'Syncing...' : 'Sync All'}
              </span>
            </button>
            <button
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center gap-2 text-center opacity-50 cursor-not-allowed"
              disabled
            >
              <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-info" />
              </div>
              <span className="text-sm font-medium text-foreground">View History</span>
            </button>
          </div>
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>

      {/* Edit Account Modal */}
      <EditAccountModal
        account={editingAccount}
        isOpen={!!editingAccount}
        onClose={() => setEditingAccount(null)}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        account={deletingAccount}
        isOpen={!!deletingAccount}
        onClose={() => setDeletingAccount(null)}
      />

      {/* Bank Connection Modal */}
      <BankConnectionModal
        isOpen={showBankConnection}
        onClose={() => setShowBankConnection(false)}
      />

      {/* Transaction History Modal */}
      <TransactionHistoryModal
        account={showTransactionHistory}
        isOpen={!!showTransactionHistory}
        onClose={() => setShowTransactionHistory(null)}
      />
    </div>
  );
}

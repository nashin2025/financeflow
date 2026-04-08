"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { AccountType } from "@/types";
import { Landmark, CreditCard, Building, Plus, Loader2 } from "lucide-react";

interface BankConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_BANKS = [
  { name: "Chase", icon: "🏦", type: "bank" },
  { name: "Bank of America", icon: "🏦", type: "bank" },
  { name: "Wells Fargo", icon: "🏦", type: "bank" },
  { name: "Citibank", icon: "🏦", type: "bank" },
  { name: "Capital One", icon: "💳", type: "credit_card" },
  { name: "Discover", icon: "💳", type: "credit_card" },
  { name: "American Express", icon: "💳", type: "credit_card" },
  { name: "PayPal", icon: "🅿️", type: "payment" },
  { name: "Venmo", icon: "💸", type: "payment" },
  { name: "Cash App", icon: "💵", type: "payment" },
];

export function BankConnectionModal({ isOpen, onClose }: BankConnectionModalProps) {
  const { addAccount } = useAppStore();
  const [connectingBank, setConnectingBank] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredBanks = POPULAR_BANKS.filter(bank =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnectBank = async (bankName: string) => {
    setConnectingBank(bankName);

    try {
      // Simulate OAuth/connection process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create a new account for the connected bank
      const bank = POPULAR_BANKS.find(b => b.name === bankName);
      if (bank) {
        const newAccount = {
          name: `${bankName} Account`,
          type: (bank.type === 'credit_card' ? 'credit_card' :
                bank.type === 'payment' ? 'cash' : 'checking') as AccountType,
          balance: Math.random() * 10000, // Mock balance
          currency: 'MVR',
          institution: bankName,
          color: '#3B82F6',
          icon: bank.icon,
          isActive: true,
        };

        // In a real app, this would be handled by the API
        // For now, we'll add it directly to the store
        const accountWithId = {
          ...newAccount,
          id: `connected_${Date.now()}`,
          userId: '1',
          plaidAccountId: `plaid_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        addAccount(accountWithId);

        alert(`Successfully connected to ${bankName}!`);
        onClose();
      }
    } catch (error) {
      alert(`Failed to connect to ${bankName}. Please try again.`);
    } finally {
      setConnectingBank(null);
    }
  };

  const getBankIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Landmark className="h-5 w-5" />;
      case 'credit_card':
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Building className="h-5 w-5" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
            <Landmark className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Connect Your Bank</h2>
          <p className="text-foreground-secondary">
            Link your financial accounts to automatically import transactions
          </p>
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search for your bank..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary-start"
          />
        </div>

        {/* Popular Banks */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {searchQuery ? 'Search Results' : 'Popular Banks & Services'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredBanks.map((bank) => (
              <div
                key={bank.name}
                className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <span className="text-lg">{bank.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{bank.name}</h4>
                      <p className="text-sm text-foreground-secondary capitalize">
                        {bank.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleConnectBank(bank.name)}
                    disabled={connectingBank === bank.name}
                  >
                    {connectingBank === bank.name ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredBanks.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <p className="text-foreground-secondary">No banks found matching &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs">🔒</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-400 mb-1">Secure Connection</h4>
              <p className="text-sm text-foreground-secondary">
                Your bank credentials are encrypted and never stored on our servers.
                We use read-only access to import your transaction data.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
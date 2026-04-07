"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { Link, Unlink, Plus } from "lucide-react";

interface ConnectedAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectedAccountsModal({ isOpen, onClose }: ConnectedAccountsModalProps) {
  const { accounts } = useAppStore();

  // Mock connected accounts - in a real app, this would come from a separate API
  const connectedAccounts = [
    { id: '1', name: 'Chase Checking', type: 'bank', status: 'connected', lastSync: '2024-01-07' },
    { id: '2', name: 'Capital One Credit', type: 'credit_card', status: 'connected', lastSync: '2024-01-07' },
    { id: '3', name: 'PayPal', type: 'payment', status: 'disconnected', lastSync: null },
  ];

  const handleConnect = (accountId: string) => {
    // In a real app, this would initiate OAuth flow or API connection
    alert(`Connecting to ${connectedAccounts.find(a => a.id === accountId)?.name}...`);
  };

  const handleDisconnect = (accountId: string) => {
    if (confirm('Are you sure you want to disconnect this account?')) {
      alert(`Disconnected from ${connectedAccounts.find(a => a.id === accountId)?.name}`);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'connected' ? 'text-success' : 'text-error';
  };

  const getStatusIcon = (status: string) => {
    return status === 'connected' ? <Link className="h-4 w-4" /> : <Unlink className="h-4 w-4" />;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
            <Link className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Connected Accounts</h2>
          <p className="text-foreground-secondary">
            Manage your connected financial accounts
          </p>
        </div>

        {/* Current Connections */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Connected Accounts</h3>
          <div className="space-y-3">
            {connectedAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <span className="text-lg">🏦</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{account.name}</h4>
                    <p className="text-sm text-foreground-secondary">
                      {account.status === 'connected' && account.lastSync
                        ? `Last synced: ${new Date(account.lastSync).toLocaleDateString()}`
                        : 'Not connected'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 ${getStatusColor(account.status)}`}>
                    {getStatusIcon(account.status)}
                    <span className="text-sm capitalize">{account.status}</span>
                  </div>
                  {account.status === 'connected' ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDisconnect(account.id)}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleConnect(account.id)}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Connection */}
        <div className="border-t border-white/10 pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Add New Connection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Bank Account', icon: '🏦', description: 'Connect your checking/savings accounts' },
              { name: 'Credit Card', icon: '💳', description: 'Monitor your credit card spending' },
              { name: 'Investment Account', icon: '📈', description: 'Track your investment portfolio' },
              { name: 'PayPal', icon: '🅿️', description: 'Connect your PayPal account' },
            ].map((service, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{service.icon}</span>
                  <div>
                    <h4 className="font-medium text-foreground">{service.name}</h4>
                    <p className="text-sm text-foreground-secondary">{service.description}</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="w-full" onClick={() => handleConnect(`new-${index}`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </div>
            ))}
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
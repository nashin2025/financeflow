"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { Modal } from "@/components/ui/modal";

interface PremiumLockProps {
  children: React.ReactNode;
  feature: string;
  className?: string;
}

export function PremiumLock({ children, feature, className }: PremiumLockProps) {
  const { isPremium } = useAppStore();
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <>
      <div className={`relative ${className || ""}`}>
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl">
          <div className="text-center p-6">
            <div className="w-14 h-14 rounded-full bg-primary-start/20 flex items-center justify-center mx-auto mb-3">
              <Lock className="h-7 w-7 text-primary-start" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Premium Feature</h3>
            <p className="text-sm text-foreground-secondary mb-4">{feature}</p>
            <Button onClick={() => setShowUpgradeModal(true)}>
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        </div>
        <div className="opacity-30 pointer-events-none select-none">
          {children}
        </div>
      </div>

      <Modal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} size="md">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary-start/20 flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-primary-start" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Unlock Premium</h2>
          <p className="text-foreground-secondary mb-4">
            Get access to {feature} and all other premium features.
          </p>
          <p className="text-sm text-foreground-tertiary mb-6">
            Contact your administrator to request a premium upgrade.
          </p>
          <Button onClick={() => setShowUpgradeModal(false)} className="w-full">
            Got it
          </Button>
        </div>
      </Modal>
    </>
  );
}

"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Search, HelpCircle, MessageCircle, Lightbulb, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";

export default function HelpCenterPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[240px]">
        <Header title="Help Center" showSearch={false} showNotifications={false} />
        
        <main className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          <BottomNav />

          <Card>
            <CardContent className="pt-6">
              <Input
                placeholder="Search help articles, FAQs, or guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Getting Started
              </CardTitle>
              <CardDescription>
                New to FinanceFlow? Follow these steps to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">1. Create Your Account</h3>
                  <div className="ml-4 space-y-1 text-sm text-foreground-secondary">
                    <p>• Tap "Sign Up" on the login screen</p>
                    <p>• Enter email and create secure password</p>
                    <p>• Verify email and complete profile</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">2. Add Your First Transaction</h3>
                  <div className="ml-4 space-y-1 text-sm text-foreground-secondary">
                    <p>• Tap "+" button in navigation or dashboard</p>
                    <p>• Choose Income or Expense type</p>
                    <p>• Select category and enter amount</p>
                    <p>• Add description and save</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">3. Set Up Budgets</h3>
                  <div className="ml-4 space-y-1 text-sm text-foreground-secondary">
                    <p>• Go to Budgets tab</p>
                    <p>• Create budget with category and limit</p>
                    <p>• Enable notifications for alerts</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">4. Connect Bank Accounts</h3>
                  <div className="ml-4 space-y-1 text-sm text-foreground-secondary">
                    <p>• Settings &gt; Connected Accounts</p>
                    <p>• Select bank and authenticate</p>
                    <p>• Grant read-only access</p>
                    <p>• Transactions sync automatically</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <details className="border border-white/10 rounded-xl p-4">
                  <summary className="cursor-pointer font-semibold hover:text-primary">
                    App Not Syncing <ChevronRight className="inline h-4 w-4 ml-2" />
                  </summary>
                  <div className="mt-3 space-y-2 text-sm text-foreground-secondary">
                    <p><strong>Check internet:</strong> Ensure stable connection</p>
                    <p><strong>Refresh:</strong> Pull down on dashboard</p>
                    <p><strong>Restart app:</strong> Close and reopen</p>
                    <p><strong>Check accounts:</strong> Verify bank connections</p>
                    <p><strong>Re-login:</strong> Sign out and back in</p>
                  </div>
                </details>

                <details className="border border-white/10 rounded-xl p-4">
                  <summary className="cursor-pointer font-semibold hover:text-primary">
                    Login Issues <ChevronRight className="inline h-4 w-4 ml-2" />
                  </summary>
                  <div className="mt-3 space-y-2 text-sm text-foreground-secondary">
                    <p><strong>Password reset:</strong> Use forgot password link</p>
                    <p><strong>Locked account:</strong> Wait 15 minutes</p>
                    <p><strong>2FA issues:</strong> Check authenticator app</p>
                    <p><strong>Email:</strong> Check spam folder</p>
                    <p><strong>Browser:</strong> Clear cache or use incognito</p>
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Still Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button onClick={() => router.push("/contact")}>
                  Contact Support
                </Button>
                <Button variant="secondary" onClick={() => window.open("mailto:support@financeflow.app", "_blank")}>
                  Email Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

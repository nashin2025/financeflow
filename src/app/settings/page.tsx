"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Palette, 
  CreditCard,
  Download,
  Trash2,
  ChevronRight,
  Moon,
  Sun,
  Shield,
  HelpCircle,
  MessageCircle,
  Star,
  FileText,
  ExternalLink,
  LogOut,
  CheckCircle,
  Info
} from "lucide-react";

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value?: string;
  onClick?: () => void;
  badge?: React.ReactNode;
  danger?: boolean;
}

function SettingsItem({ icon, label, description, value, onClick, badge, danger }: SettingsItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors text-left"
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          danger ? "bg-error/20 text-error" : "bg-white/10 text-foreground-secondary"
        )}>
          {icon}
        </div>
        <div>
          <p className={cn("font-medium", danger ? "text-error" : "text-foreground")}>{label}</p>
          {description && (
            <p className="text-sm text-foreground-tertiary">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {badge}
        {value && <span className="text-sm text-foreground-secondary">{value}</span>}
        <ChevronRight className="h-4 w-4 text-foreground-tertiary" />
      </div>
    </button>
  );
}

export default function SettingsPage() {
  const { 
    user, theme, setTheme, isPremium, 
    currency, setCurrency, language, setLanguage, 
    weekStartsOn, setWeekStartsOn, budgetPeriod, setBudgetPeriod,
    notifications, setNotifications,
    security, setSecurity
  } = useAppStore();
  const [showUpgradeMsg, setShowUpgradeMsg] = React.useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = React.useState(false);
  const [showLanguageModal, setShowLanguageModal] = React.useState(false);
  const [showWeekModal, setShowWeekModal] = React.useState(false);
  const [showBudgetPeriodModal, setShowBudgetPeriodModal] = React.useState(false);
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [showLoginHistoryModal, setShowLoginHistoryModal] = React.useState(false);
  const [passwordData, setPasswordData] = React.useState({ current: "", new: "", confirm: "" });

  const handleUpgrade = () => {
    setShowUpgradeMsg(true);
  };

  const handleExport = (format: string) => {
    const { transactions } = useAppStore.getState();
    if (format === "csv") {
      const csvContent = [
        "Type,Amount,Description,Date",
        ...transactions.map(t => `${t.type},${t.amount},"${t.description || ""}",${t.date}`),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "financeflow_export.csv";
      a.click();
    }
    setShowExportModal(false);
  };

  const handleImport = () => {
    alert("Import functionality coming soon!");
    setShowImportModal(false);
  };

  const handleDeleteAccount = () => {
    alert("Account deletion would require admin approval. Contact support.");
    setShowDeleteModal(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert("New passwords don't match!");
      return;
    }
    if (passwordData.new.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }
    alert("Password changed successfully!");
    setPasswordData({ current: "", new: "", confirm: "" });
    setShowPasswordModal(false);
  };

  const loginHistory = [
    { id: "1", device: "Chrome on Windows", location: "Male, Maldives", time: "2 hours ago", current: true },
    { id: "2", device: "Safari on iPhone", location: "Male, Maldives", time: "Yesterday", current: false },
    { id: "3", device: "Chrome on Android", location: "Addu City, Maldives", time: "3 days ago", current: false },
  ];

  const currencies = [
    { code: "MVR", name: "Maldivian Rufiyaa", symbol: "Rf" },
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "dv", name: "Dhivehi" },
    { code: "si", name: "Sinhala" },
    { code: "ta", name: "Tamil" },
  ];

  const currencyDisplay = currencies.find(c => c.code === currency)?.name || currency;

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[240px]">
        <Header title="Settings" showSearch={false} showNotifications={false} />
        
        <main className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          {/* Profile Card */}
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white">
                  {user?.name?.charAt(0) || "A"}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground">{user?.name || "Alex Chen"}</h2>
                  <p className="text-foreground-secondary">{user?.email || "alex@example.com"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {isPremium ? (
                      <Badge variant="success">Premium Plan</Badge>
                    ) : (
                      <>
                        <Badge variant="info">Free Plan</Badge>
                        <Button variant="ghost" size="sm" className="text-primary-start" onClick={handleUpgrade}>
                          Upgrade ✨
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <Button variant="secondary" size="sm">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-foreground-secondary" />
                General
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                <SettingsItem
                  icon={<Globe className="h-5 w-5" />}
                  label="Currency"
                  value={currencyDisplay}
                  onClick={() => setShowCurrencyModal(true)}
                />
                <SettingsItem
                  icon={<Globe className="h-5 w-5" />}
                  label="Language"
                  value={language}
                  onClick={() => setShowLanguageModal(true)}
                />
                <SettingsItem
                  icon={<Palette className="h-5 w-5" />}
                  label="Appearance"
                  value={theme === "dark" ? "Dark" : "Light"}
                  badge={
                    <button
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        theme === "dark" ? "bg-primary-start" : "bg-white/20"
                      )}
                    >
                      <span className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform flex items-center justify-center",
                        theme === "dark" ? "left-7" : "left-1"
                      )}>
                        {theme === "dark" ? <Moon className="h-2.5 w-2.5 text-primary-start" /> : <Sun className="h-2.5 w-2.5 text-amber-500" />}
                      </span>
                    </button>
                  }
                />
                <SettingsItem
                  icon={<Globe className="h-5 w-5" />}
                  label="Week starts on"
                  value={weekStartsOn === "monday" ? "Monday" : "Sunday"}
                  onClick={() => setShowWeekModal(true)}
                />
                <SettingsItem
                  icon={<Globe className="h-5 w-5" />}
                  label="Budget period"
                  value={budgetPeriod === "monthly" ? "Monthly" : budgetPeriod === "weekly" ? "Weekly" : "Yearly"}
                  onClick={() => setShowBudgetPeriodModal(true)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-foreground-secondary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-foreground-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Push Notifications</p>
                      <p className="text-sm text-foreground-tertiary">Receive notifications on your device</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications({ push: !notifications.push })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      notifications.push ? "bg-primary-start" : "bg-white/20"
                    )}
                  >
                    <span className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      notifications.push ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-foreground-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Email Reports</p>
                      <p className="text-sm text-foreground-tertiary">Weekly summary reports</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications({ email: !notifications.email })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      notifications.email ? "bg-primary-start" : "bg-white/20"
                    )}
                  >
                    <span className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      notifications.email ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-foreground-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Budget Alerts</p>
                      <p className="text-sm text-foreground-tertiary">Alerts when approaching budget limits</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications({ budgetAlerts: !notifications.budgetAlerts })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      notifications.budgetAlerts ? "bg-primary-start" : "bg-white/20"
                    )}
                  >
                    <span className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      notifications.budgetAlerts ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-foreground-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Bill Reminders</p>
                      <p className="text-sm text-foreground-tertiary">Reminders for upcoming bills</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications({ billReminders: !notifications.billReminders })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      notifications.billReminders ? "bg-primary-start" : "bg-white/20"
                    )}
                  >
                    <span className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      notifications.billReminders ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-foreground-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">AI Insights</p>
                      <p className="text-sm text-foreground-tertiary">Personalized financial insights</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications({ aiInsights: !notifications.aiInsights })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      notifications.aiInsights ? "bg-primary-start" : "bg-white/20"
                    )}
                  >
                    <span className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      notifications.aiInsights ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Lock className="h-5 w-5 text-foreground-secondary" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                <SettingsItem
                  icon={<Lock className="h-5 w-5" />}
                  label="Change Password"
                  description="Update your account password"
                  onClick={() => setShowPasswordModal(true)}
                />
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-foreground-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Two-Factor Authentication</p>
                      <p className="text-sm text-foreground-tertiary">Add an extra layer of security</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSecurity({ twoFactor: !security.twoFactor })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      security.twoFactor ? "bg-primary-start" : "bg-white/20"
                    )}
                  >
                    <span className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      security.twoFactor ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-foreground-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Biometric Lock</p>
                      <p className="text-sm text-foreground-tertiary">Use fingerprint or face to unlock</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSecurity({ biometric: !security.biometric })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      security.biometric ? "bg-primary-start" : "bg-white/20"
                    )}
                  >
                    <span className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      security.biometric ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
                <SettingsItem
                  icon={<Shield className="h-5 w-5" />}
                  label="Login History"
                  description="View recent login activity"
                  onClick={() => setShowLoginHistoryModal(true)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Download className="h-5 w-5 text-foreground-secondary" />
                Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                <SettingsItem
                  icon={<Download className="h-5 w-5" />}
                  label="Export Data"
                  description="Download your data as CSV"
                  onClick={() => setShowExportModal(true)}
                />
                <SettingsItem
                  icon={<Download className="h-5 w-5" />}
                  label="Import Transactions"
                  description="Import from CSV or other apps"
                  onClick={() => setShowImportModal(true)}
                />
                <SettingsItem
                  icon={<CreditCard className="h-5 w-5" />}
                  label="Connected Accounts"
                  description="Manage linked accounts"
                />
                <SettingsItem
                  icon={<Trash2 className="h-5 w-5" />}
                  label="Delete Account"
                  description="Permanently delete your account and data"
                  danger
                  onClick={() => setShowDeleteModal(true)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-foreground-secondary" />
                Support
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                <SettingsItem
                  icon={<HelpCircle className="h-5 w-5" />}
                  label="Help Center"
                />
                <SettingsItem
                  icon={<MessageCircle className="h-5 w-5" />}
                  label="Contact Support"
                />
                <SettingsItem
                  icon={<Star className="h-5 w-5" />}
                  label="Rate App"
                />
                <SettingsItem
                  icon={<FileText className="h-5 w-5" />}
                  label="Privacy Policy"
                />
                <SettingsItem
                  icon={<FileText className="h-5 w-5" />}
                  label="Terms of Service"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card variant="glass" className="!p-0">
            <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-error/10 transition-colors text-left group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center group-hover:bg-error/30">
                  <LogOut className="h-5 w-5 text-error" />
                </div>
                <p className="font-medium text-error">Sign Out</p>
              </div>
              <ChevronRight className="h-4 w-4 text-error/50" />
            </button>
          </Card>

          {/* Version */}
          <div className="text-center text-sm text-foreground-tertiary">
            <p>FinanceFlow v1.0.0</p>
            <p className="mt-1">Made with ❤️ for your financial wellbeing</p>
          </div>
        </main>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowUpgradeMsg(false)}
          />
          <div className="relative w-full max-w-md glass-elevated rounded-2xl p-6 animate-fadeIn">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-start/20 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary-start" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Upgrade to Premium</h2>
              <p className="text-foreground-secondary mb-4">
                Premium upgrades are managed by the admin. Please contact your administrator to request a premium upgrade.
              </p>
              <p className="text-sm text-foreground-tertiary mb-6">
                Or send upgrade request to: admin@financeflow.app
              </p>
              <Button onClick={() => setShowUpgradeMsg(false)} className="w-full">
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Currency Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCurrencyModal(false)}
          />
          <div className="relative w-full max-w-sm glass-elevated rounded-2xl p-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-foreground mb-4">Select Currency</h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {currencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setCurrency(c.code); setShowCurrencyModal(false); }}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                    currency === c.code ? "bg-primary-start/20 text-primary-start" : "hover:bg-white/5"
                  )}
                >
                  <span className="text-foreground">{c.name}</span>
                  <span className="text-foreground-secondary">{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowLanguageModal(false)}
          />
          <div className="relative w-full max-w-sm glass-elevated rounded-2xl p-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-foreground mb-4">Select Language</h2>
            <div className="space-y-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLanguage(l.name); setShowLanguageModal(false); }}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                    language === l.name ? "bg-primary-start/20 text-primary-start" : "hover:bg-white/5"
                  )}
                >
                  <span className="text-foreground">{l.name}</span>
                  <span className="text-foreground-secondary uppercase">{l.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Week Starts On Modal */}
      {showWeekModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowWeekModal(false)}
          />
          <div className="relative w-full max-w-sm glass-elevated rounded-2xl p-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-foreground mb-4">Week Starts On</h2>
            <div className="space-y-2">
              {["Monday", "Sunday"].map((day) => (
                <button
                  key={day}
                  onClick={() => { setWeekStartsOn(day === "Monday" ? "monday" : "sunday"); setShowWeekModal(false); }}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                    weekStartsOn === day.toLowerCase() ? "bg-primary-start/20 text-primary-start" : "hover:bg-white/5"
                  )}
                >
                  <span className="text-foreground">{day}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Budget Period Modal */}
      {showBudgetPeriodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowBudgetPeriodModal(false)}
          />
          <div className="relative w-full max-w-sm glass-elevated rounded-2xl p-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-foreground mb-4">Budget Period</h2>
            <div className="space-y-2">
              {["Weekly", "Monthly", "Yearly"].map((period) => (
                <button
                  key={period}
                  onClick={() => { setBudgetPeriod(period.toLowerCase() as "weekly" | "monthly" | "yearly"); setShowBudgetPeriodModal(false); }}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                    budgetPeriod === period.toLowerCase() ? "bg-primary-start/20 text-primary-start" : "hover:bg-white/5"
                  )}
                >
                  <span className="text-foreground">{period}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowExportModal(false)}
          />
          <div className="relative w-full max-w-sm glass-elevated rounded-2xl p-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-foreground mb-4">Export Data</h2>
            <p className="text-sm text-foreground-secondary mb-4">Choose export format:</p>
            <div className="space-y-2">
              <button
                onClick={() => handleExport("csv")}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5"
              >
                <span className="text-foreground">CSV (Spreadsheet)</span>
                <Download className="h-4 w-4 text-foreground-secondary" />
              </button>
              <button
                onClick={() => { alert("PDF export coming soon!"); setShowExportModal(false); }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5"
              >
                <span className="text-foreground">PDF Report</span>
                <FileText className="h-4 w-4 text-foreground-secondary" />
              </button>
            </div>
            <Button variant="ghost" className="w-full mt-4" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowImportModal(false)}
          />
          <div className="relative w-full max-w-sm glass-elevated rounded-2xl p-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-foreground mb-4">Import Transactions</h2>
            <p className="text-sm text-foreground-secondary mb-4">Upload a CSV file to import transactions:</p>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
              <Download className="h-8 w-8 text-foreground-tertiary mx-auto mb-2" />
              <p className="text-sm text-foreground-secondary">Click to upload CSV</p>
              <input type="file" accept=".csv" className="hidden" />
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleImport}>
                Import
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative w-full max-w-sm glass-elevated rounded-2xl p-6 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-error" />
            </div>
            <h2 className="text-lg font-semibold text-foreground text-center mb-2">Delete Account?</h2>
            <p className="text-sm text-foreground-secondary text-center mb-4">
              This action cannot be undone. All your data will be permanently deleted. This requires admin approval.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleDeleteAccount}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowPasswordModal(false)}
          />
          <div className="relative w-full max-w-sm glass-elevated rounded-2xl p-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-foreground mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-foreground-secondary mb-1 block">Current Password</label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData(p => ({ ...p, current: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-primary-start"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="text-sm text-foreground-secondary mb-1 block">New Password</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData(p => ({ ...p, new: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-primary-start"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="text-sm text-foreground-secondary mb-1 block">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData(p => ({ ...p, confirm: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-primary-start"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handlePasswordChange}>
                Update Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Login History Modal */}
      {showLoginHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowLoginHistoryModal(false)}
          />
          <div className="relative w-full max-w-md glass-elevated rounded-2xl p-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-foreground mb-4">Login History</h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {loginHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div>
                    <p className="font-medium text-foreground">{item.device}</p>
                    <p className="text-sm text-foreground-tertiary">{item.location}</p>
                    <p className="text-xs text-foreground-tertiary">{item.time}</p>
                  </div>
                  {item.current && (
                    <span className="px-2 py-1 text-xs rounded-full bg-success/20 text-success">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-4" onClick={() => setShowLoginHistoryModal(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
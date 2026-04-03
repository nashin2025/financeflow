"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Edit, 
  Camera,
  CreditCard,
  TrendingUp,
  Target,
  Award,
  Settings,
  ChevronRight,
  LogOut,
  X
} from "lucide-react";

export default function ProfilePage() {
  const { user, transactions, accounts, budgets, goals, setUser, isPremium } = useAppStore();
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editName, setEditName] = React.useState(user?.name || "");
  const [editEmail, setEditEmail] = React.useState(user?.email || "");

  const handleSaveProfile = () => {
    if (user) {
      setUser({
        ...user,
        name: editName,
        email: editEmail
      });
    }
    setShowEditModal(false);
  };

  const totalTransactions = transactions.length;
  const totalAccounts = accounts.length;
  const activeGoals = goals.filter(g => g.status === "active").length;
  const completedGoals = goals.filter(g => g.status === "completed").length;

  const achievements: { icon: string; title: string; description: string; date: string }[] = [];

  const stats = [
    { label: "Transactions", value: totalTransactions, icon: CreditCard },
    { label: "Accounts", value: totalAccounts, icon: TrendingUp },
    { label: "Active Goals", value: activeGoals, icon: Target },
    { label: "Achievements", value: achievements.length, icon: Award },
  ];

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[240px]">
        <Header title="Profile" showSearch={false} showNotifications />
        
        <main className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          {/* Profile Header */}
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center text-4xl font-bold text-white">
                    {user?.name?.split(" ").map(n => n[0]).join("") || "AC"}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background-elevated border-2 border-background flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Camera className="h-4 w-4 text-foreground-secondary" />
                  </button>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold text-foreground">{user?.name || "Alex Chen"}</h1>
                  <p className="text-foreground-secondary">{user?.email || "alex@example.com"}</p>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    {isPremium ? (
                      <Badge variant="success">Premium Plan</Badge>
                    ) : (
                      <Badge variant="info">Free Plan</Badge>
                    )}
                  </div>
                </div>

                <Button variant="secondary" onClick={() => setShowEditModal(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} variant="glass">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-primary-start/20 flex items-center justify-center mx-auto mb-2">
                    <stat.icon className="h-5 w-5 text-primary-start" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-foreground-tertiary">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Account Summary */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Account Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-foreground-secondary">Total Balance</p>
                  <p className="text-xl font-bold font-mono text-foreground mt-1">
                    {formatCurrency(accounts.reduce((sum, a) => sum + a.balance, 0))}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-foreground-secondary">This Month Income</p>
                  <p className="text-xl font-bold font-mono text-success mt-1">
                    {formatCurrency(transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0))}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-foreground-secondary">This Month Expenses</p>
                  <p className="text-xl font-bold font-mono text-error mt-1">
                    {formatCurrency(transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-warning" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 flex items-center gap-4">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div>
                      <h4 className="font-medium text-foreground">{achievement.title}</h4>
                      <p className="text-sm text-foreground-tertiary">{achievement.description}</p>
                      <p className="text-xs text-foreground-disabled mt-1">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Profile Info */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-foreground-secondary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-foreground-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-tertiary">Email</p>
                    <p className="text-foreground">{user?.email || "alex@example.com"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-foreground-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-tertiary">Member Since</p>
                    <p className="text-foreground">January 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-foreground-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-tertiary">Location</p>
                    <p className="text-foreground">Male&apos;, Maldives</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-foreground-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-tertiary">Currency</p>
                    <p className="text-foreground">MVR (Rf)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Link 
              href="/settings"
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-foreground-secondary" />
                <span className="text-foreground">Account Settings</span>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground-tertiary" />
            </Link>
            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5 text-error" />
                <span className="text-error">Sign Out</span>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground-tertiary" />
            </button>
          </div>
        </main>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative w-full max-w-md glass-elevated rounded-2xl p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Edit Profile</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-foreground-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Full Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
                icon={<User className="h-4 w-4" />}
              />
              <Input
                label="Email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Enter your email"
                icon={<Mail className="h-4 w-4" />}
              />

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
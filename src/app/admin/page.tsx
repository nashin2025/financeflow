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
  Crown,
  Users,
  Settings,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  Loader2
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const { setPremium } = useAppStore();
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [showSecret, setShowSecret] = React.useState(false);
  const [adminSecret, setAdminSecret] = React.useState("");
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    // Check if already logged in this session
    const stored = sessionStorage.getItem("admin_session");
    if (stored === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!adminSecret) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/users?secret=${adminSecret}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setIsAuthenticated(true);
        sessionStorage.setItem("admin_session", "true");
      } else {
        setError("Invalid admin secret");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const togglePremium = async (userId: string, currentPremium: boolean) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/users/${userId}?secret=${adminSecret}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isPremium: !currentPremium })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, isPremium: data.user.isPremium } : u
        ));
        
        if (userId === "1") {
          setPremium(data.user.isPremium);
        }
      } else {
        setError(data.error || "Failed to update user");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setIsAuthenticated(false);
    setAdminSecret("");
    setUsers([]);
    sessionStorage.removeItem("admin_session");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="glass" className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-warning" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-foreground-secondary mt-2">Enter admin credentials</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-foreground-secondary mb-2 block">Admin Secret</label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary-start"
                    placeholder="Enter admin secret"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showSecret ? <EyeOff className="h-5 w-5 text-foreground-secondary" /> : <Eye className="h-5 w-5 text-foreground-secondary" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-error/10 border border-error/20">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              <Button 
                className="w-full" 
                onClick={handleLogin} 
                disabled={!adminSecret || loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[240px]">
        <Header title="Admin Panel" showSearch={false} showNotifications={false} />
        
        <main className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
              {error}
            </div>
          )}
          {/* Admin Header */}
          <Card variant="glass" className="bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Admin Dashboard</h2>
                    <p className="text-sm text-foreground-secondary">Manage user accounts via API</p>
                  </div>
                </div>
                <Badge variant="warning">Connected via API</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="glass">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-primary-start mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
                <p className="text-sm text-foreground-tertiary">Total Users</p>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-4 text-center">
                <Crown className="h-8 w-8 text-warning mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{users.filter(u => u.isPremium).length}</p>
                <p className="text-sm text-foreground-tertiary">Premium Users</p>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-4 text-center">
                <Settings className="h-8 w-8 text-foreground-secondary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{users.filter(u => !u.isPremium).length}</p>
                <p className="text-sm text-foreground-tertiary">Free Users</p>
              </CardContent>
            </Card>
          </div>

          {/* User Management */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-foreground-secondary" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-medium">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name || "No name"}</p>
                      <p className="text-sm text-foreground-tertiary">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {user.isPremium ? (
                      <Badge variant="warning">Premium</Badge>
                    ) : (
                      <Badge variant="info">Free</Badge>
                    )}
                    <button
                      onClick={() => togglePremium(user.id, user.isPremium)}
                      disabled={loading}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        user.isPremium 
                          ? "bg-error/20 hover:bg-error/30 text-error" 
                          : "bg-success/20 hover:bg-success/30 text-success"
                      )}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : user.isPremium ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-foreground-tertiary mx-auto mb-2" />
                  <p className="text-foreground-secondary">No users found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logout */}
          <Button variant="secondary" className="w-full" onClick={resetSession}>
            <Settings className="h-4 w-4 mr-2" />
            Logout from Admin
          </Button>

          {/* Info */}
          <Card variant="glass" className="!bg-info/5 !border-info/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground font-medium">API-based Management</p>
                  <p className="text-xs text-foreground-secondary mt-1">
                    This admin connects to your backend API. Make sure your DATABASE_URL and ADMIN_SECRET environment variables are configured.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-foreground-tertiary">
            <p>FinanceFlow Admin v1.0.0</p>
          </div>
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
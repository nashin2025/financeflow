"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Info,
  Calendar,
  Trash2,
  Filter,
  Check
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: "budget_alert" | "goal_milestone" | "anomaly" | "insight" | "bill_reminder" | "system";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const sampleNotifications: Notification[] = [
  { id: "1", type: "budget_alert" as const, title: "Budget Alert", message: "Dining Out is at 75% of your monthly budget", isRead: false, createdAt: "2 hours ago" },
  { id: "2", type: "goal_milestone" as const, title: "Goal Milestone", message: "Emergency Fund reached 50% of target", isRead: false, createdAt: "Yesterday" },
  { id: "3", type: "insight" as const, title: "AI Insight", message: "Your grocery spending is 15% lower than last month. Great job!", isRead: true, createdAt: "2 days ago" },
  { id: "4", type: "bill_reminder" as const, title: "Bill Reminder", message: "Internet bill of Rf 450 is due in 3 days", isRead: true, createdAt: "3 days ago" },
  { id: "5", type: "system" as const, title: "Welcome", message: "Welcome to FinanceFlow! Start tracking your finances today.", isRead: true, createdAt: "1 week ago" },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = React.useState<"all" | "unread">("all");
  const [notifications, setNotifications] = React.useState<Notification[]>(sampleNotifications);

  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "budget_alert": return { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/20" };
      case "goal_milestone": return { icon: Target, color: "text-success", bg: "bg-success/20" };
      case "anomaly": return { icon: AlertTriangle, color: "text-error", bg: "bg-error/20" };
      case "insight": return { icon: Info, color: "text-info", bg: "bg-info/20" };
      case "bill_reminder": return { icon: Calendar, color: "text-primary-start", bg: "bg-primary-start/20" };
      case "system": return { icon: CheckCircle, color: "text-foreground-secondary", bg: "bg-white/10" };
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[240px]">
        <Header title="Notifications" showSearch={false} showNotifications={false} />
        
        <main className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Notifications
              </h1>
              <p className="text-foreground-secondary mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="secondary" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                  filter === f
                    ? "gradient-primary text-white"
                    : "glass text-foreground-secondary hover:text-foreground"
                )}
              >
                {f === "unread" && !notifications.some(n => n.isRead) && (
                  <span className="w-2 h-2 bg-error rounded-full inline-block mr-2" />
                )}
                {f}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card variant="glass" className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-foreground-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
                <p className="text-foreground-secondary">
                  {filter === "unread" ? "All caught up! No unread notifications." : "You're all caught up!"}
                </p>
              </Card>
            ) : (
              filteredNotifications.map((notification) => {
                const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
                
                return (
                  <Card 
                    key={notification.id} 
                    variant="glass" 
                    className={cn(
                      "transition-all",
                      !notification.isRead && "border-l-4 border-l-primary-start"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
                          <Icon className={cn("h-5 w-5", color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium text-foreground">{notification.title}</h4>
                              <p className="text-sm text-foreground-secondary mt-1">{notification.message}</p>
                              <p className="text-xs text-foreground-tertiary mt-2">{notification.createdAt}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="h-4 w-4 text-success" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-foreground-tertiary hover:text-error" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Notification Settings Link */}
          <Card variant="glass" className="!p-0">
            <button
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors text-left"
              onClick={() => router.push("/settings")}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-foreground-secondary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Notification Settings</p>
                  <p className="text-sm text-foreground-tertiary">Manage your notification preferences</p>
                </div>
              </div>
            </button>
          </Card>
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
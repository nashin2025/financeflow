"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GoalsPage() {
  const router = useRouter();
  const { goals, syncGoals } = useAppStore();
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Sync goals on page load
  React.useEffect(() => {
    const loadGoals = async () => {
      setIsSyncing(true);
      try {
        await syncGoals();
      } catch (error) {
        console.error('Failed to sync goals:', error);
      } finally {
        setIsSyncing(false);
      }
    };
    loadGoals();
  }, [syncGoals]);

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[240px]">
        <Header title="Goals" showSearch={false} showNotifications={false} />
        
        <main className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Financial Goals</h1>
              <p className="text-muted-foreground">Track your progress toward financial targets</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  setIsSyncing(true);
                  try {
                    await syncGoals();
                  } catch (error) {
                    console.error('Manual sync failed:', error);
                  } finally {
                    setIsSyncing(false);
                  }
                }}
                disabled={isSyncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync'}
              </Button>
              <Button onClick={() => router.push('/add-goal')}>
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </div>
          </div>

          {/* Goals List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No goals yet</p>
                  <Button onClick={() => router.push('/add-goal')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Goal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              goals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{goal.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {goal.type}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          ${goal.currentAmount?.toLocaleString() || 0} / ${goal.targetAmount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, ((goal.currentAmount || 0) / goal.targetAmount) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

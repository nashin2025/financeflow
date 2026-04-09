"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Apple, 
  Smartphone, 
  Heart,
  MessageSquare,
  ExternalLink,
  CheckCircle,
  Sparkles
} from "lucide-react";

const storeLinks = [
  {
    name: "App Store",
    icon: <Apple className="h-6 w-6" />,
    description: "Download on iOS",
    url: "https://apps.apple.com/app/financeflow/id1234567890",
    color: "bg-black hover:bg-gray-800"
  },
  {
    name: "Google Play",
    icon: <Smartphone className="h-6 w-6" />,
    description: "Get it on Android",
    url: "https://play.google.com/store/apps/details?id=com.financeflow.app",
    color: "bg-green-600 hover:bg-green-700"
  }
];

const ratingOptions = [
  { value: "5", label: "⭐⭐⭐⭐⭐ Excellent" },
  { value: "4", label: "⭐⭐⭐⭐ Very Good" },
  { value: "3", label: "⭐⭐⭐ Good" },
  { value: "2", label: "⭐⭐⭐ Fair" },
  { value: "1", label: "⭐ Poor" }
];

export default function RateAppPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold">Rate App</h1>
        <p>Rate our app on the app stores!</p>
      </div>
    </div>
  );
}

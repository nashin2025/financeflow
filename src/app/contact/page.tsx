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
  MessageSquare, 
  Mail, 
  Phone, 
  Clock,
  AlertCircle,
  CheckCircle,
  Send,
  HeadphonesIcon
} from "lucide-react";

const supportCategories = [
  { value: "general", label: "General Question" },
  { value: "account", label: "Account & Login" },
  { value: "transactions", label: "Transactions & Categories" },
  { value: "budgets", label: "Budgets & Goals" },
  { value: "reports", label: "Reports & Analytics" },
  { value: "security", label: "Security & Privacy" },
  { value: "billing", label: "Billing & Premium" },
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "other", label: "Other" }
];

const supportOptions = [
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "Live Chat",
    description: "Get instant help from our support team",
    available: "Mon-Fri 9AM-6PM EST",
    action: "Start Chat",
    onClick: () => alert("Live chat coming soon! Please use email support for now.")
  },
  {
    icon: <Mail className="h-5 w-5" />,
    title: "Email Support",
    description: "Send us a detailed message and we'll respond within 24 hours",
    available: "24/7",
    action: "Send Email",
    onClick: () => window.open("mailto:support@financeflow.app", "_blank")
  },
  {
    icon: <Phone className="h-5 w-5" />,
    title: "Phone Support",
    description: "Speak directly with our support specialists",
    available: "Mon-Fri 9AM-6PM EST",
    action: "Call Now",
    onClick: () => window.open("tel:+1-800-FINANCE", "_blank")
  }
];

export default function ContactSupportPage() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("Support ticket submitted:", formData);
    setSubmitted(true);
    setIsSubmitting(false);

    // Reset form
    setFormData({
      name: "",
      email: "",
      category: "",
      subject: "",
      message: ""
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <Header title="Contact Support" />
        <BottomNav />

        <main className="lg:pl-64 pb-20 lg:pb-0">
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Support Ticket Submitted!</h2>
                <p className="text-foreground-secondary mb-6">
                  Thank you for contacting us. We've received your support request and will get back to you within 24 hours.
                </p>
                <Button onClick={() => setSubmitted(false)}>
                  Submit Another Request
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header title="Contact Support" />
      <BottomNav />

      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
          {/* Support Options */}
          <div className="grid gap-4 md:grid-cols-3">
            {supportOptions.map((option, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={option.onClick}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary-start/10 rounded-lg">
                      {option.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{option.title}</h3>
                      <p className="text-xs text-foreground-tertiary flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {option.available}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground-secondary mb-4">
                    {option.description}
                  </p>
                  <Button size="sm" className="w-full">
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeadphonesIcon className="h-5 w-5" />
                Send us a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <Select
                  label="Support Category"
                  options={supportCategories}
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  required
                />

                <Input
                  label="Subject"
                  placeholder="Brief description of your issue"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-2">
                    Message
                  </label>
                  <textarea
                    className="flex min-h-32 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary-start focus:ring-2 focus:ring-primary-start/20 transition-all duration-200"
                    placeholder="Please provide as much detail as possible about your issue or question..."
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                  {!isSubmitting && <Send className="h-4 w-4 ml-2" />}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Before Contacting Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-foreground-secondary">
                <p>• Check our <a href="/help" className="text-primary hover:underline">Help Center</a> for quick answers to common questions</p>
                <p>• Make sure your app is updated to the latest version</p>
                <p>• Include screenshots or error messages when reporting bugs</p>
                <p>• For account issues, have your account details ready</p>
                <p>• Response times: Email within 24 hours, Phone during business hours</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

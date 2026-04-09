"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { 
  Search, 
  BookOpen, 
  HelpCircle, 
  MessageCircle, 
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I add a new transaction?",
    answer: "Tap the '+' button on the home screen, select the transaction type (income or expense), choose a category, enter the amount, and add any notes. The transaction will be automatically saved and reflected in your dashboard."
  },
  {
    question: "How can I set up recurring transactions?",
    answer: "Go to Settings > Transactions > Recurring. Add a new recurring transaction by specifying the amount, frequency (daily, weekly, monthly, yearly), category, and start date. FinanceFlow will automatically create these transactions for you."
  },
  {
    question: "How do budgets work?",
    answer: "Create budgets by category or overall spending limits in the Budgets section. Set monthly or yearly limits, and FinanceFlow will track your progress with visual indicators. You'll receive notifications when you're approaching or exceeding your budget."
  },
  {
    question: "Can I export my financial data?",
    answer: "Yes, go to Settings > Data > Export Data. You can export your transactions, accounts, and budgets in CSV or PDF format. This is useful for tax purposes or backing up your data."
  },
  {
    question: "How does the AI assistant work?",
    answer: "Our AI assistant analyzes your spending patterns and provides personalized insights, recommendations, and answers to financial questions. You can ask it questions like 'How much did I spend on groceries this month?' or 'What's my savings rate?'"
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use bank-level encryption to protect your financial data. All data is encrypted in transit and at rest, and we follow industry best practices for security. We never share your personal financial information with third parties."
  },
  {
    question: "How do I connect my bank accounts?",
    answer: "Go to Settings > Connected Accounts > Add Account. Select your bank from our secure list of partners. You'll be redirected to authenticate securely through your bank's official login. We use read-only access and never store your banking credentials."
  },
  {
    question: "Can I categorize transactions automatically?",
    answer: "Yes, FinanceFlow uses AI to automatically categorize most transactions based on merchant names and transaction details. You can also set up custom rules in Settings > Transactions > Auto-Categorization for specific merchants."
  }
];

function FAQSection({ searchQuery }: { searchQuery: string }) {
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Frequently Asked Questions
        </CardTitle>
        <CardDescription>
          Find answers to common questions about FinanceFlow
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredFaqs.length === 0 ? (
          <p className="text-center text-foreground-secondary py-8">
            No FAQs match your search. Try different keywords or contact support.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <details key={index} className="group">
                <summary className="flex items-center justify-between cursor-pointer py-3 font-medium hover:text-primary transition-colors">
                  <span>{faq.question}</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="pb-4 pt-2 text-foreground-secondary">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HelpCenterPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header title="Help Center" />
      <BottomNav />

      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
          {/* Search */}
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

          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Getting Started
              </CardTitle>
              <CardDescription>
                New to FinanceFlow? Here's how to get started with managing your finances.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                  <h3 className="font-semibold mb-2">Create Your Account</h3>
                  <p className="text-sm text-foreground-secondary mb-3">
                    Sign up with your email and start tracking your finances immediately.
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    Learn More <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <div className="p-4 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                  <h3 className="font-semibold mb-2">Add Your First Transaction</h3>
                  <p className="text-sm text-foreground-secondary mb-3">
                    Start by adding income and expenses to see your financial overview.
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    Learn More <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <div className="p-4 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                  <h3 className="font-semibold mb-2">Set Up Budgets</h3>
                  <p className="text-sm text-foreground-secondary mb-3">
                    Create budgets to stay on track with your spending goals.
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    Learn More <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <div className="p-4 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                  <h3 className="font-semibold mb-2">Connect Bank Accounts</h3>
                  <p className="text-sm text-foreground-secondary mb-3">
                    Automatically import transactions from your bank accounts.
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    Learn More <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <FAQSection searchQuery={searchQuery} />

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Troubleshooting
              </CardTitle>
              <CardDescription>
                Common issues and how to resolve them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-white/10 rounded-xl">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    App Not Syncing
                  </h3>
                  <p className="text-sm text-foreground-secondary mb-3">
                    If your data isn't syncing, check your internet connection and try refreshing the app.
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    View Solution <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <div className="p-4 border border-white/10 rounded-xl">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Login Issues
                  </h3>
                  <p className="text-sm text-foreground-secondary mb-3">
                    Can't log in? Reset your password or contact support if you're still having issues.
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    View Solution <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <div className="p-4 border border-white/10 rounded-xl">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Data Import Problems
                  </h3>
                  <p className="text-sm text-foreground-secondary mb-3">
                    Having trouble importing data? Ensure your file is in the correct format and try again.
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    View Solution <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Still Need Help?
              </CardTitle>
              <CardDescription>
                Can't find what you're looking for? Our support team is here to help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1" 
                  onClick={() => router.push('/contact')}
                >
                  Contact Support
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => window.open('mailto:support@financeflow.app', '_blank')}
                >
                  Email Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

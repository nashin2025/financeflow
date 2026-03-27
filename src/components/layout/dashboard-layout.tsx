import Sidebar from "@/components/layout/sidebar";
import BottomNav from "@/components/layout/bottom-nav";
import Header from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="lg:pl-[240px]">
        <Header />
        <main className="p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      
      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
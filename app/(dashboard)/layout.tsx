import MobileNav from "@/components/layout/MobileNav"
import Sidebar from "@/components/layout/sidebar"
import Topbar from "@/components/layout/Topbar"


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-(--background)">
            {/* Sidebar — desktop only */}
            <Sidebar />

            {/* Main content area */}
            <div className="md:ml-64">
                {/* Topbar */}
                <Topbar />

                {/* Page content */}
                <main className="pt-16 pb-20 md:pb-6 px-4 md:px-8 min-h-screen">
                    {children}
                </main>
            </div>

            {/* Bottom nav — mobile only */}
            <MobileNav />
        </div>
    )
}
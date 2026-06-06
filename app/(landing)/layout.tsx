import { NavbarLanding } from '@/components/landing/navbar-landing';
import { FooterLanding } from '@/components/landing/footer-landing';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-slate-950 text-foreground overflow-x-hidden">
      {/* Global background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.08),_transparent_60%),radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.05),_transparent_50%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <NavbarLanding />
        <main id="main-content" className="pt-16">{children}</main>
        <FooterLanding />
      </div>
    </div>
  );
}

import { NavbarLanding } from '@/components/landing/navbar-landing';
import { FooterLanding } from '@/components/landing/footer-landing';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,74,0.12),_transparent_32%),_linear-gradient(180deg,_#0f172a,_#08201b)] text-foreground">
      <NavbarLanding />
      <main id="main-content" className="pt-16">{children}</main>
      <FooterLanding />
    </div>
  );
}

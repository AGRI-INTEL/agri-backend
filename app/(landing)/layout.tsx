import { NavbarLanding } from '@/components/landing/navbar-landing';
import { FooterLanding } from '@/components/landing/footer-landing';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#0C1810', color: '#E8E0CC' }}>
      <div className="relative z-10">
        <NavbarLanding />
        <main id="main-content" className="pt-[68px]">{children}</main>
        <FooterLanding />
      </div>
    </div>
  );
}

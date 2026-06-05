import { DocsSection } from './_components/DocsSection';
import { FeaturesSection } from './_components/FeaturesSection';
import { HeroSection } from './_components/HeroSection';
import { LandingFooter } from './_components/LandingFooter';
import { LandingNav } from './_components/LandingNav';
import { OpenSourceSection } from './_components/OpenSourceSection';

export function Home() {
    return (
        <div className="min-h-screen bg-background text-(--color-text)">
            <LandingNav />
            <HeroSection />
            <FeaturesSection />
            <DocsSection />
            <OpenSourceSection />
            <LandingFooter />
        </div>
    );
}

'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { AnalyticsOverview } from '@/components/analytics/analytics-overview';

export default function AnalyticsPage() {
  return (
    <PageWrapper title="Analytics" description="Analyses et tendances de votre écosystème agricole">
      <AnalyticsOverview />
    </PageWrapper>
  );
}

import type { ReactNode } from 'react';
import '../marketing.css';
import { SiteChrome } from '@/components/marketing/SiteChrome';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}

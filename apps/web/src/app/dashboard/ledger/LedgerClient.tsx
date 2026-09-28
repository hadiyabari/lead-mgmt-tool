'use client';

import { useState } from 'react';
import { LedgerImport } from '@/components/LedgerImport';
import { LedgerTable } from '@/components/LedgerTable';

export function LedgerClient() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <LedgerImport onDone={() => setRefreshKey((k) => k + 1)} />
      <LedgerTable refreshKey={refreshKey} />
    </>
  );
}

// root/EntryLog/page.tsx
import React from 'react';
import EntryLogTable from '@/components/ui/EntryLogTable'

const EntryLogPage = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Entry Log</h1>
      <EntryLogTable />
    </div>
  );
};

export default EntryLogPage;
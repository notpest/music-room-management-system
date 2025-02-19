// components/ui/EntryLogTable.tsx
"use client";

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from '@nextui-org/react';
import axios from 'axios';

interface EntryLog {
  id: number;
  equipment_id: string;
  scanned_at: string;
}

const columns = [
  { key: 'id', name: 'ID' },
  { key: 'equipment_id', name: 'Equipment ID' },
  { key: 'scanned_at', name: 'Scanned At' },
];

const EntryLogTable = () => {
  const [logs, setLogs] = useState<EntryLog[]>([]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/entrylogs');
      setLogs(res.data);
    } catch (error) {
      console.error('Error fetching entry logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Table>
      <TableHeader>
        {columns.map(col => (
          <TableColumn key={col.key}>{col.name}</TableColumn>
        ))}
      </TableHeader>
      <TableBody>
        {logs.map(log => (
          <TableRow key={log.id}>
            {columns.map(col => (
              <TableCell key={col.key}>
                {col.key === 'scanned_at'
                  ? new Date(log.scanned_at).toLocaleString()
                  : log[col.key as keyof EntryLog]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default EntryLogTable;

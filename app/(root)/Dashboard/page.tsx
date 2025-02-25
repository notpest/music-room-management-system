"use client";

import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import { Button, Input, Table, TableBody, TableCell, TableHeader, TableRow, TableColumn } from '@nextui-org/react';

interface SlotConfig {
  id: number;
  start_time: string;
  end_time: string;
  enabled: boolean;
}

export default function AdminDashboard() {
  const [configs, setConfigs] = useState<SlotConfig[]>([]);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newEnabled, setNewEnabled] = useState(true);

  const fetchConfigs = async () => {
    try {
      const res = await axios.get("/api/slotconfig");
      setConfigs(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const addConfig = async () => {
    try {
      await axios.post("/api/slotconfig", {
        start_time: newStart,
        end_time: newEnd,
        enabled: newEnabled,
      });
      setNewStart("");
      setNewEnd("");
      fetchConfigs();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleEnabled = async (id: number, current: boolean) => {
    try {
      await axios.put("/api/slotconfig", {
        id,
        enabled: !current,
      });
      fetchConfigs();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Dashboard: Slot Configuration</h1>
      <div style={{ marginBottom: "1rem" }}>
        <Input
          placeholder="Start Time (HH:mm)"
          value={newStart}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewStart(e.target.value)}
        />
        <Input
          placeholder="End Time (HH:mm)"
          value={newEnd}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewEnd(e.target.value)}
        />
        <Button onPress={addConfig}>Add Slot</Button>
      </div>

      <Table>
      <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Start Time</TableColumn>
            <TableColumn>End Time</TableColumn>
            <TableColumn>Enabled</TableColumn>
            <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {configs.map((config) => (
            <TableRow key={config.id}>
              <TableCell>{config.id}</TableCell>
              <TableCell>{config.start_time}</TableCell>
              <TableCell>{config.end_time}</TableCell>
              <TableCell>{config.enabled ? "Yes" : "No"}</TableCell>
              <TableCell>
                <Button onPress={() => toggleEnabled(config.id, config.enabled)}>
                  Toggle
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

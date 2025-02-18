"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
  ChipProps,
} from "@nextui-org/react";
import { EyeIcon } from "./EyeIcon";
import { EditIcon } from "./EditIcon";
import { DeleteIcon } from "./DeleteIcon";

type Status = "active" | "paused" | "vacation";

type UserType = {
  id: number;
  name: string;
  role: string;
  team: string;
  status: Status;
  age: string;
  avatar: string;
  email: string;
};

const columns = [
  { key: "name", name: "NAME" },
  { key: "role", name: "ROLE" },
  { key: "status", name: "STATUS" },
  { key: "actions", name: "ACTIONS" },
];

const users: UserType[] = [
  {
    id: 1,
    name: "Tony Reichert",
    role: "CEO",
    team: "Management",
    status: "active",
    age: "29",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    email: "tony.reichert@example.com",
  },
  {
    id: 2,
    name: "Zoey Lang",
    role: "Technical Lead",
    team: "Development",
    status: "paused",
    age: "25",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    email: "zoey.lang@example.com",
  },
];

const statusColorMap: Record<Status, ChipProps["color"]> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

export default function App() {
  const renderCell = (user: UserType, columnKey: string) => {
    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", src: user.avatar }}
            description={user.email}
            name={user.name}
          />
        );
      case "role":
        return (
          <div>
            <p>{user.role}</p>
            <p className="text-default-400">{user.team}</p>
          </div>
        );
      case "status":
        return (
          <Chip color={statusColorMap[user.status]}>{user.status}</Chip>
        );
      case "actions":
        return (
          <div className="flex gap-2">
            <Tooltip content="View">
              <EyeIcon />
            </Tooltip>
            <Tooltip content="Edit">
              <EditIcon />
            </Tooltip>
            <Tooltip content="Delete">
              <DeleteIcon />
            </Tooltip>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Table>
      <TableHeader>
        {columns.map((column) => (
          <TableColumn key={column.key}>{column.name}</TableColumn>
        ))}
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            {columns.map((column) => (
              <TableCell key={column.key}>
                {renderCell(user, column.key)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

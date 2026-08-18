export type Role = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  type: "SYSTEM" | "CUSTOM";
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    users: number;
    permissions: number;
  };
};
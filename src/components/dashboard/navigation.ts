import type { PermissionKey } from "@/lib/permissions";

export type NavigationItem = {
  label: string;
  href: string;
  permission?: PermissionKey;
};

export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export const navigationGroups: NavigationGroup[] = [
  // =========================
  // MAIN
  // =========================
  {
    label: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        permission: "DASHBOARD.VIEW",
      },
    ],
  },

  // =========================
  // MASTER DATA
  // =========================
  {
    label: "Master Data",
    items: [
      {
        label: "Customers",
        href: "/dashboard/customers",
        permission: "CUSTOMER.VIEW",
      },
      {
        label: "Suppliers",
        href: "/dashboard/suppliers",
        permission: "SUPPLIER.VIEW",
      },
      {
        label: "Categories",
        href: "/dashboard/categories",
        permission: "CATEGORY.VIEW",
      },
      {
        label: "Products",
        href: "/dashboard/products",
        permission: "PRODUCT.VIEW",
      },
    ],
  },

  // =========================
  // INVENTORY
  // =========================
  {
    label: "Inventory",
    items: [
      {
        label: "Warehouses",
        href: "/dashboard/warehouses",
        permission: "WAREHOUSE.VIEW",
      },
      {
        label: "Inventory",
        href: "/dashboard/inventory",
        permission: "INVENTORY.VIEW",
      },
      {
        label: "Stock Movement",
        href: "/dashboard/stock-movements",
        permission: "STOCK_MOVEMENT.VIEW",
      },
    ],
  },

  // =========================
  // TRANSACTIONS
  // =========================
  {
    label: "Transactions",
    items: [
      {
        label: "Purchasing",
        href: "/dashboard/purchasing",
        permission: "PURCHASE.VIEW",
      },
      {
        label: "Sales",
        href: "/dashboard/sales",
        permission: "SALES.VIEW",
      },
      {
        label: "Invoices",
        href: "/dashboard/invoices",
        permission: "INVOICE.VIEW",
      },
      {
        label: "Payments",
        href: "/dashboard/payments",
        permission: "PAYMENT.VIEW",
      },
    ],
  },

  // =========================
  // FINANCE
  // =========================
  {
    label: "Finance",
    items: [
      {
        label: "Expenses",
        href: "/dashboard/expenses",
        permission: "EXPENSE.VIEW",
      },
      {
        label: "Revenue",
        href: "/dashboard/revenue",
        permission: "REVENUE.VIEW",
      },
      {
        label: "Cash Flow",
        href: "/dashboard/cash-flow",
        permission: "CASH_FLOW.VIEW",
      },
      {
        label: "Reports",
        href: "/dashboard/reports",
        permission: "REPORT.VIEW",
      },
    ],
  },

  // =========================
  // ADMINISTRATION
  // =========================
  {
    label: "Administration",
    items: [
      {
        label: "Users",
        href: "/dashboard/users",
        permission: "USER.VIEW",
      },
      {
        label: "Roles",
        href: "/dashboard/roles",
        permission: "ROLE.VIEW",
      },
      {
        label: "Permissions",
        href: "/dashboard/permissions",
        permission: "PERMISSION.VIEW",
      },
    ],
  },
];
export const PERMISSIONS = [
  // =========================
  // DASHBOARD
  // =========================
  {
    module: "DASHBOARD",
    action: "VIEW",
    name: "View Dashboard",
    description: "Can view the dashboard",
  },

  // =========================
  // USER
  // =========================
  {
    module: "USER",
    action: "VIEW",
    name: "View Users",
    description: "Can view users",
  },
  {
    module: "USER",
    action: "CREATE",
    name: "Create Users",
    description: "Can create users",
  },
  {
    module: "USER",
    action: "UPDATE",
    name: "Update Users",
    description: "Can update users",
  },
  {
    module: "USER",
    action: "DELETE",
    name: "Delete Users",
    description: "Can delete users",
  },

  // =========================
  // ROLE
  // =========================
  {
    module: "ROLE",
    action: "VIEW",
    name: "View Roles",
    description: "Can view roles",
  },
  {
    module: "ROLE",
    action: "CREATE",
    name: "Create Roles",
    description: "Can create roles",
  },
  {
    module: "ROLE",
    action: "UPDATE",
    name: "Update Roles",
    description: "Can update roles",
  },
  {
    module: "ROLE",
    action: "DELETE",
    name: "Delete Roles",
    description: "Can delete roles",
  },

  // =========================
  // PERMISSION
  // =========================
  {
    module: "PERMISSION",
    action: "VIEW",
    name: "View Permissions",
    description: "Can view permissions",
  },
  {
    module: "PERMISSION",
    action: "ASSIGN",
    name: "Assign Permissions",
    description: "Can assign permissions to roles",
  },

  // =========================
  // CUSTOMER
  // =========================
  {
    module: "CUSTOMER",
    action: "VIEW",
    name: "View Customers",
    description: "Can view customers",
  },
  {
    module: "CUSTOMER",
    action: "CREATE",
    name: "Create Customers",
    description: "Can create customers",
  },
  {
    module: "CUSTOMER",
    action: "UPDATE",
    name: "Update Customers",
    description: "Can update customers",
  },
  {
    module: "CUSTOMER",
    action: "DELETE",
    name: "Delete Customers",
    description: "Can delete customers",
  },

  // =========================
  // SUPPLIER
  // =========================
  {
    module: "SUPPLIER",
    action: "VIEW",
    name: "View Suppliers",
    description: "Can view suppliers",
  },
  {
    module: "SUPPLIER",
    action: "CREATE",
    name: "Create Suppliers",
    description: "Can create suppliers",
  },
  {
    module: "SUPPLIER",
    action: "UPDATE",
    name: "Update Suppliers",
    description: "Can update suppliers",
  },
  {
    module: "SUPPLIER",
    action: "DELETE",
    name: "Delete Suppliers",
    description: "Can delete suppliers",
  },

  // =========================
  // CATEGORY
  // =========================
  {
    module: "CATEGORY",
    action: "VIEW",
    name: "View Categories",
    description: "Can view categories",
  },
  {
    module: "CATEGORY",
    action: "CREATE",
    name: "Create Categories",
    description: "Can create categories",
  },
  {
    module: "CATEGORY",
    action: "UPDATE",
    name: "Update Categories",
    description: "Can update categories",
  },
  {
    module: "CATEGORY",
    action: "DELETE",
    name: "Delete Categories",
    description: "Can delete categories",
  },

  // =========================
  // PRODUCT
  // =========================
  {
    module: "PRODUCT",
    action: "VIEW",
    name: "View Products",
    description: "Can view products",
  },
  {
    module: "PRODUCT",
    action: "CREATE",
    name: "Create Products",
    description: "Can create products",
  },
  {
    module: "PRODUCT",
    action: "UPDATE",
    name: "Update Products",
    description: "Can update products",
  },
  {
    module: "PRODUCT",
    action: "DELETE",
    name: "Delete Products",
    description: "Can delete products",
  },

  // =========================
  // WAREHOUSE
  // =========================
  {
    module: "WAREHOUSE",
    action: "VIEW",
    name: "View Warehouses",
    description: "Can view warehouses",
  },
  {
    module: "WAREHOUSE",
    action: "CREATE",
    name: "Create Warehouses",
    description: "Can create warehouses",
  },
  {
    module: "WAREHOUSE",
    action: "UPDATE",
    name: "Update Warehouses",
    description: "Can update warehouses",
  },
  {
    module: "WAREHOUSE",
    action: "DELETE",
    name: "Delete Warehouses",
    description: "Can delete warehouses",
  },

  // =========================
  // INVENTORY
  // =========================
  {
    module: "INVENTORY",
    action: "VIEW",
    name: "View Inventory",
    description: "Can view inventory",
  },
  {
    module: "INVENTORY",
    action: "ADJUST",
    name: "Adjust Inventory",
    description: "Can adjust inventory",
  },

  // =========================
  // STOCK MOVEMENT
  // =========================
  {
    module: "STOCK_MOVEMENT",
    action: "VIEW",
    name: "View Stock Movements",
    description: "Can view stock movements",
  },
  {
    module: "STOCK_MOVEMENT",
    action: "CREATE",
    name: "Create Stock Movements",
    description: "Can create stock movements",
  },

  // =========================
  // PURCHASE
  // =========================
  {
    module: "PURCHASE",
    action: "VIEW",
    name: "View Purchases",
    description: "Can view purchases",
  },
  {
    module: "PURCHASE",
    action: "CREATE",
    name: "Create Purchases",
    description: "Can create purchases",
  },
  {
    module: "PURCHASE",
    action: "UPDATE",
    name: "Update Purchases",
    description: "Can update purchases",
  },
  {
    module: "PURCHASE",
    action: "DELETE",
    name: "Delete Purchases",
    description: "Can delete purchases",
  },

  // =========================
  // SALES
  // =========================
  {
    module: "SALES",
    action: "VIEW",
    name: "View Sales",
    description: "Can view sales",
  },
  {
    module: "SALES",
    action: "CREATE",
    name: "Create Sales",
    description: "Can create sales",
  },
  {
    module: "SALES",
    action: "UPDATE",
    name: "Update Sales",
    description: "Can update sales",
  },
  {
    module: "SALES",
    action: "DELETE",
    name: "Delete Sales",
    description: "Can delete sales",
  },

  // =========================
  // INVOICE
  // =========================
  {
    module: "INVOICE",
    action: "VIEW",
    name: "View Invoices",
    description: "Can view invoices",
  },
  {
    module: "INVOICE",
    action: "CREATE",
    name: "Create Invoices",
    description: "Can create invoices",
  },
  {
    module: "INVOICE",
    action: "UPDATE",
    name: "Update Invoices",
    description: "Can update invoices",
  },

  // =========================
  // PAYMENT
  // =========================
  {
    module: "PAYMENT",
    action: "VIEW",
    name: "View Payments",
    description: "Can view payments",
  },
  {
    module: "PAYMENT",
    action: "CREATE",
    name: "Create Payments",
    description: "Can create payments",
  },

  // =========================
  // EXPENSE
  // =========================
  {
    module: "EXPENSE",
    action: "VIEW",
    name: "View Expenses",
    description: "Can view expenses",
  },
  {
    module: "EXPENSE",
    action: "CREATE",
    name: "Create Expenses",
    description: "Can create expenses",
  },
  {
    module: "EXPENSE",
    action: "UPDATE",
    name: "Update Expenses",
    description: "Can update expenses",
  },
  {
    module: "EXPENSE",
    action: "DELETE",
    name: "Delete Expenses",
    description: "Can delete expenses",
  },

  // =========================
  // REVENUE
  // =========================
  {
    module: "REVENUE",
    action: "VIEW",
    name: "View Revenue",
    description: "Can view revenue",
  },
  {
    module: "REVENUE",
    action: "CREATE",
    name: "Create Revenue",
    description: "Can create revenue",
  },

  // =========================
  // CASH FLOW
  // =========================
  {
    module: "CASH_FLOW",
    action: "VIEW",
    name: "View Cash Flow",
    description: "Can view cash flow",
  },
  {
    module: "CASH_FLOW",
    action: "CREATE",
    name: "Create Cash Flow",
    description: "Can create cash flow",
  },

  // =========================
  // REPORT
  // =========================
  {
    module: "REPORT",
    action: "VIEW",
    name: "View Reports",
    description: "Can view reports",
  },
  {
    module: "REPORT",
    action: "EXPORT",
    name: "Export Reports",
    description: "Can export reports",
  },

  // =========================
  // AUDIT LOG
  // =========================
  {
    module: "AUDIT_LOG",
    action: "VIEW",
    name: "View Audit Logs",
    description: "Can view audit logs",
  },
] as const;

export type PermissionDefinition = (typeof PERMISSIONS)[number];

export type PermissionKey =
  `${PermissionDefinition["module"]}.${PermissionDefinition["action"]}`;
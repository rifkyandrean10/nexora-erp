import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organizationId: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    organizationId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    organizationId?: string;
  }
}
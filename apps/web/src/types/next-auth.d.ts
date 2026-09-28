import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role?: string;
      workspaceId?: string;
      mfaEnabled?: boolean;
    };
  }

  interface User {
    role?: string;
    workspaceId?: string;
    mfaEnabled?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    workspaceId?: string;
    mfaEnabled?: boolean;
  }
}

export interface JWTParams {
  token: Record<string, unknown> & { id?: string };
  user?: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

export interface SessionParams {
  session: {
    expires: string;
    user?: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  };
  token: Record<string, unknown> & { id: string };
}

export interface RedirectParams {
  url: string;
  baseUrl: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  provider: "google" | "github";
}

export interface TokenResponse {
  token: string;
  user: {
    uid: string;
    email: string;
    name: string;
    picture: string | null;
    provider: string;
  };
}

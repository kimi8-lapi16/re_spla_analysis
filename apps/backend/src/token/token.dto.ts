export interface TokenPayload {
  sub: string;
  email: string;
}

export interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
}

export interface GenerateTokenParameter {
  userId: string;
  email: string;
}

export interface TokenPayload {
  id: string;
  roles: string[];
}

export function generateAuthToken(payload: TokenPayload): string {
  // This is a simplified token generation for testing purposes
  // In a real application, you would use JWT or similar
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
  return `mock_token_${encodedPayload}`;
}

export function verifyAuthToken(token: string): TokenPayload {
  // This is a simplified token verification for testing purposes
  const tokenPart = token.replace('mock_token_', '');
  const decoded = Buffer.from(tokenPart, 'base64').toString();
  return JSON.parse(decoded);
}
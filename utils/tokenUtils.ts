export const verifyToken = (token: string) => {
  const tokenPattern = /^token-([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})-(\d+)$/;
  const match = token.match(tokenPattern);
  if (!match) return false;

  const uuid = match[1];
  const timestamp = parseInt(match[2]);

  if (!isValidUUID(uuid)) return false;

  const isExpired = checkTokenExpiration(timestamp, 7);

  if (isExpired) return false;

  return true;
};

// Helper functions (same as before)
const isValidUUID = (uuid: string) => {
  const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidPattern.test(uuid);
};

// (time, day)
const checkTokenExpiration = (timestamp: number, expirationDays: number) => {
  const expirationTime = expirationDays * 24 * 60 * 60 * 1000;
  return Date.now() - timestamp > expirationTime;
};

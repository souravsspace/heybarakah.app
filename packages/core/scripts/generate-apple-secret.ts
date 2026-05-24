#!/usr/bin/env bun
import { importPKCS8, SignJWT } from "jose";

const teamId = Bun.env.APPLE_TEAM_ID;
const keyId = Bun.env.APPLE_KEY_ID;
const clientId = Bun.env.APPLE_CLIENT_ID;
const privateKey = Bun.env.APPLE_PRIVATE_KEY;

if (!(teamId && keyId && clientId && privateKey)) {
  // biome-ignore lint/suspicious/noConsole: CLI script
  console.error(
    "Missing one of APPLE_TEAM_ID / APPLE_KEY_ID / APPLE_CLIENT_ID / APPLE_PRIVATE_KEY in packages/core/.env.local"
  );
  // biome-ignore lint/nursery/noProcessGlobal: CLI script
  process.exit(1);
}

const normalizedKey = privateKey.replace(/\\n/g, "\n");
const key = await importPKCS8(normalizedKey, "ES256");
const now = Math.floor(Date.now() / 1000);
const sixMonths = 180 * 24 * 60 * 60;

const jwt = await new SignJWT({})
  .setProtectedHeader({ alg: "ES256", kid: keyId })
  .setIssuer(teamId)
  .setSubject(clientId)
  .setAudience("https://appleid.apple.com")
  .setIssuedAt(now)
  .setExpirationTime(now + sixMonths)
  .sign(key);

// biome-ignore lint/suspicious/noConsole: CLI script
console.log(jwt);

import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import type { Database } from "@/db";
import { userLocations, users } from "@/db/schema";
import {
  CONFLICT,
  NOT_FOUND,
  UNPROCESSABLE_ENTITY,
} from "@/stoker/http-status-codes";

const NAME_MAX_LENGTH = 60;
const NAME_REGEX = /^[\p{L}\p{N}\s'\-.,]+$/u;
export const MAX_LOCATIONS = 20;

function badInput(message: string): never {
  throw new HTTPException(UNPROCESSABLE_ENTITY, { message });
}

export function validateName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    badInput("Location name is required");
  }
  if (trimmed.length > NAME_MAX_LENGTH) {
    badInput(`Name exceeds ${NAME_MAX_LENGTH} characters`);
  }
  if (!NAME_REGEX.test(trimmed)) {
    badInput("Name contains unsupported characters");
  }
  return trimmed;
}

function validateCoords(latitude: number, longitude: number): void {
  if (latitude < -90 || latitude > 90) {
    badInput("Invalid latitude");
  }
  if (longitude < -180 || longitude > 180) {
    badInput("Invalid longitude");
  }
}

function validateTimezone(timezone: string): void {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
  } catch {
    badInput("Invalid timezone");
  }
}

async function getProfile(db: Database, authUserId: string) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, authUserId))
    .limit(1);
  return row;
}

async function getOwned(db: Database, authUserId: string, id: string) {
  const [row] = await db
    .select()
    .from(userLocations)
    .where(
      and(eq(userLocations.id, id), eq(userLocations.authUserId, authUserId))
    )
    .limit(1);
  if (!row) {
    throw new HTTPException(NOT_FOUND, { message: "Location not found" });
  }
  return row;
}

export async function listMine(db: Database, authUserId: string) {
  const locations = await db
    .select()
    .from(userLocations)
    .where(eq(userLocations.authUserId, authUserId))
    .limit(MAX_LOCATIONS + 1);
  const profile = await getProfile(db, authUserId);
  return {
    locations: locations.sort((a, b) => a.createdAt - b.createdAt),
    activeId: profile?.activePrayerLocationId ?? null,
  };
}

export interface CreateLocationInput {
  city?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  name: string;
  setActive?: boolean;
  timezone: string;
}

export async function create(
  db: Database,
  authUserId: string,
  args: CreateLocationInput
): Promise<string> {
  const name = validateName(args.name);
  validateCoords(args.latitude, args.longitude);
  validateTimezone(args.timezone);

  const existing = await db
    .select({ id: userLocations.id })
    .from(userLocations)
    .where(eq(userLocations.authUserId, authUserId))
    .limit(MAX_LOCATIONS);
  if (existing.length >= MAX_LOCATIONS) {
    throw new HTTPException(CONFLICT, {
      message: `Maximum of ${MAX_LOCATIONS} saved locations`,
    });
  }

  const now = Date.now();
  const id = crypto.randomUUID();
  await db.insert(userLocations).values({
    id,
    authUserId,
    name,
    latitude: args.latitude,
    longitude: args.longitude,
    timezone: args.timezone,
    city: args.city,
    countryCode: args.countryCode,
    createdAt: now,
    updatedAt: now,
  });

  if (args.setActive) {
    await db
      .update(users)
      .set({ activePrayerLocationId: id })
      .where(eq(users.authUserId, authUserId));
  }
  return id;
}

export async function rename(
  db: Database,
  authUserId: string,
  id: string,
  rawName: string
): Promise<void> {
  await getOwned(db, authUserId, id);
  const name = validateName(rawName);
  await db
    .update(userLocations)
    .set({ name, updatedAt: Date.now() })
    .where(eq(userLocations.id, id));
}

export async function remove(
  db: Database,
  authUserId: string,
  id: string
): Promise<void> {
  await getOwned(db, authUserId, id);
  const profile = await getProfile(db, authUserId);
  if (profile?.activePrayerLocationId === id) {
    await db
      .update(users)
      .set({ activePrayerLocationId: null })
      .where(eq(users.authUserId, authUserId));
  }
  await db.delete(userLocations).where(eq(userLocations.id, id));
}

export async function setActive(
  db: Database,
  authUserId: string,
  id: string | null
): Promise<void> {
  if (id) {
    await getOwned(db, authUserId, id);
  }
  const profile = await getProfile(db, authUserId);
  if (!profile) {
    throw new HTTPException(NOT_FOUND, { message: "Profile not found" });
  }
  await db
    .update(users)
    .set({ activePrayerLocationId: id })
    .where(eq(users.authUserId, authUserId));
}

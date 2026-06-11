import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useMutation as useRqMutation,
  useQuery as useRqQuery,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@/contexts/user-context";
import { api } from "@/lib/api-client";

/** Opaque location id (formerly a Convex `Id<"userLocations">`). */
type Id<_T extends string> = string;

const STORAGE_KEY_PREFIX = "user-locations:v1:";

function storageKeyFor(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export interface SavedLocation {
  _id: Id<"userLocations">;
  authUserId: string;
  city?: string;
  countryCode?: string;
  createdAt: number;
  latitude: number;
  longitude: number;
  name: string;
  timezone: string;
  updatedAt: number;
}

interface CreateLocationInput {
  city?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  name: string;
  setActive?: boolean;
  timezone: string;
}

interface MirrorShape {
  activeId: Id<"userLocations"> | null;
  locations: SavedLocation[];
  version: 1;
}

interface RemoteShape {
  activeId: Id<"userLocations"> | null;
  locations: SavedLocation[];
}

export interface UseLocationsResult {
  activeId: Id<"userLocations"> | null;
  activeLocation: SavedLocation | null;
  create: (input: CreateLocationInput) => Promise<unknown>;
  hydrated: boolean;
  locations: SavedLocation[];
  remove: (id: Id<"userLocations">) => Promise<void>;
  rename: (id: Id<"userLocations">, name: string) => Promise<void>;
  setActive: (id: Id<"userLocations"> | null) => Promise<void>;
}

const EMPTY_MIRROR: MirrorShape = {
  version: 1,
  locations: [],
  activeId: null,
};

async function readMirror(userId: string): Promise<MirrorShape> {
  try {
    const raw = await AsyncStorage.getItem(storageKeyFor(userId));
    if (!raw) {
      return EMPTY_MIRROR;
    }
    const parsed = JSON.parse(raw) as Partial<MirrorShape>;
    if (parsed.version !== 1 || !Array.isArray(parsed.locations)) {
      return EMPTY_MIRROR;
    }
    return {
      version: 1,
      locations: parsed.locations as SavedLocation[],
      activeId: (parsed.activeId ?? null) as Id<"userLocations"> | null,
    };
  } catch {
    return EMPTY_MIRROR;
  }
}

async function writeMirror(userId: string, mirror: MirrorShape): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKeyFor(userId), JSON.stringify(mirror));
  } catch {
    // swallow
  }
}

/**
 * Shared local-mirror + derived state. Both the Convex and the Cloudflare
 * implementations feed it the same `RemoteShape`, so all offline/hydration
 * behavior stays identical across the cutover.
 */
function useLocationMirror(
  userId: string | null,
  remote: RemoteShape | null | undefined
) {
  const [mirror, setMirror] = useState<MirrorShape>(EMPTY_MIRROR);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!userId) {
      setMirror(EMPTY_MIRROR);
      setHydrated(true);
      return;
    }
    setHydrated(false);
    readMirror(userId)
      .then((m) => {
        setMirror(m);
        setHydrated(true);
      })
      .catch(() => undefined);
  }, [userId]);

  useEffect(() => {
    if (!(remote && userId)) {
      return;
    }
    const next: MirrorShape = {
      version: 1,
      locations: remote.locations,
      activeId: remote.activeId,
    };
    setMirror(next);
    writeMirror(userId, next).catch(() => undefined);
  }, [remote, userId]);

  const activeLocation = useMemo<SavedLocation | null>(() => {
    if (!mirror.activeId) {
      return null;
    }
    return mirror.locations.find((l) => l._id === mirror.activeId) ?? null;
  }, [mirror]);

  return { mirror, hydrated, activeLocation };
}

/** Map a Cloudflare location row to the shared `SavedLocation` shape. */
function toSavedLocation(row: {
  id: string;
  authUserId: string;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  city: string | null;
  countryCode: string | null;
  createdAt: number;
  updatedAt: number;
}): SavedLocation {
  return {
    _id: row.id as unknown as Id<"userLocations">,
    authUserId: row.authUserId,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    timezone: row.timezone,
    city: row.city ?? undefined,
    countryCode: row.countryCode ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const LOCATIONS_QUERY_KEY = ["cf", "locations"] as const;

export function useLocations(): UseLocationsResult {
  const { user } = useUser();
  const userId = user?._id ?? null;

  const query = useRqQuery({
    queryKey: LOCATIONS_QUERY_KEY,
    enabled: Boolean(userId),
    queryFn: async (): Promise<RemoteShape> => {
      const res = await api.api.v1.locations.$get();
      if (!res.ok) {
        throw new Error("Failed to load locations");
      }
      const data = await res.json();
      return {
        locations: data.locations.map(toSavedLocation),
        activeId: (data.activeId ?? null) as Id<"userLocations"> | null,
      };
    },
  });

  const { mirror, hydrated, activeLocation } = useLocationMirror(
    userId,
    query.data
  );

  const refetch = query.refetch;
  const createMutation = useRqMutation({
    mutationFn: async (input: CreateLocationInput) => {
      const res = await api.api.v1.locations.$post({ json: input });
      if (!res.ok) {
        throw new Error("Failed to create location");
      }
      return await res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });
  const renameMutation = useRqMutation({
    mutationFn: async (vars: { id: string; name: string }) => {
      const res = await api.api.v1.locations[":id"].rename.$post({
        param: { id: vars.id },
        json: { name: vars.name },
      });
      if (!res.ok) {
        throw new Error("Failed to rename location");
      }
    },
    onSuccess: () => {
      refetch();
    },
  });
  const removeMutation = useRqMutation({
    mutationFn: async (id: string) => {
      const res = await api.api.v1.locations[":id"].remove.$post({
        param: { id },
      });
      if (!res.ok) {
        throw new Error("Failed to remove location");
      }
    },
    onSuccess: () => {
      refetch();
    },
  });
  const setActiveMutation = useRqMutation({
    mutationFn: async (id: string) => {
      const res = await api.api.v1.locations[":id"].active.$post({
        param: { id },
      });
      if (!res.ok) {
        throw new Error("Failed to set active location");
      }
    },
    onSuccess: () => {
      refetch();
    },
  });

  const create = useCallback(
    (input: CreateLocationInput) => createMutation.mutateAsync(input),
    [createMutation]
  );
  const rename = useCallback(
    async (id: Id<"userLocations">, name: string) => {
      await renameMutation.mutateAsync({ id: id as unknown as string, name });
    },
    [renameMutation]
  );
  const remove = useCallback(
    async (id: Id<"userLocations">) => {
      await removeMutation.mutateAsync(id as unknown as string);
    },
    [removeMutation]
  );
  const setActive = useCallback(
    async (id: Id<"userLocations"> | null) => {
      if (id) {
        await setActiveMutation.mutateAsync(id as unknown as string);
      }
    },
    [setActiveMutation]
  );

  return {
    locations: mirror.locations,
    activeId: mirror.activeId,
    activeLocation,
    hydrated,
    create,
    rename,
    remove,
    setActive,
  };
}

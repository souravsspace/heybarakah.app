import { api } from "@barakah/core/convex/_generated/api";
import type { Id } from "@barakah/core/convex/_generated/dataModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "user-locations:v1";

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

interface MirrorShape {
  activeId: Id<"userLocations"> | null;
  locations: SavedLocation[];
  version: 1;
}

const EMPTY_MIRROR: MirrorShape = {
  version: 1,
  locations: [],
  activeId: null,
};

async function readMirror(): Promise<MirrorShape> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
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

async function writeMirror(mirror: MirrorShape): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mirror));
  } catch {
    // swallow
  }
}

export function useLocations() {
  const remote = useQuery(api.lib.userLocations.listMine);
  const [mirror, setMirror] = useState<MirrorShape>(EMPTY_MIRROR);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    readMirror().then((m) => {
      setMirror(m);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!remote) {
      return;
    }
    const next: MirrorShape = {
      version: 1,
      locations: remote.locations as SavedLocation[],
      activeId: remote.activeId as Id<"userLocations"> | null,
    };
    setMirror(next);
    writeMirror(next).catch(() => undefined);
  }, [remote]);

  const createRemote = useMutation(api.lib.userLocations.create);
  const renameRemote = useMutation(api.lib.userLocations.rename);
  const removeRemote = useMutation(api.lib.userLocations.remove);
  const setActiveRemote = useMutation(api.lib.userLocations.setActive);

  const create = useCallback(
    async (input: {
      name: string;
      latitude: number;
      longitude: number;
      timezone: string;
      city?: string;
      countryCode?: string;
      setActive?: boolean;
    }) => await createRemote(input),
    [createRemote]
  );

  const rename = useCallback(
    async (id: Id<"userLocations">, name: string) => {
      await renameRemote({ id, name });
    },
    [renameRemote]
  );

  const remove = useCallback(
    async (id: Id<"userLocations">) => {
      await removeRemote({ id });
    },
    [removeRemote]
  );

  const setActive = useCallback(
    async (id: Id<"userLocations"> | null) => {
      await setActiveRemote({ id });
    },
    [setActiveRemote]
  );

  const activeLocation = useMemo<SavedLocation | null>(() => {
    if (!mirror.activeId) {
      return null;
    }
    return mirror.locations.find((l) => l._id === mirror.activeId) ?? null;
  }, [mirror]);

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

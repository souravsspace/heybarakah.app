import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";
import { useLocations } from "@/hooks/use-locations";
import {
  getCurrentLocation,
  requestLocationPermission,
  reverseGeocodeLocation,
} from "@/hooks/use-permissions";

/** Opaque location id (formerly a Convex `Id<"userLocations">`). */
type Id<_T extends string> = string;

export default function Locations() {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const { locations, activeId, create, rename, remove, setActive, hydrated } =
    useLocations();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [renamingId, setRenamingId] = useState<Id<"userLocations"> | null>(
    null
  );
  const [renameValue, setRenameValue] = useState("");

  const addFromGps = async () => {
    const trimmed = newName.trim();
    if (!trimmed || busy) {
      return;
    }
    setBusy(true);
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        Alert.alert("Permission needed", "Location permission was denied.");
        return;
      }
      const pos = await getCurrentLocation();
      if (!pos) {
        Alert.alert("Unavailable", "Could not determine your location.");
        return;
      }
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const geo = await reverseGeocodeLocation(
        pos.coords.latitude,
        pos.coords.longitude
      );
      await create({
        name: trimmed,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        timezone: tz,
        city: geo?.city ?? undefined,
        countryCode: geo?.countryCode ?? undefined,
        setActive: locations.length === 0,
      });
      Haptics.selectionAsync().catch(() => undefined);
      setNewName("");
      setAdding(false);
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Could not save location."
      );
    } finally {
      setBusy(false);
    }
  };

  const onSetActive = async (id: Id<"userLocations"> | null) => {
    Haptics.selectionAsync().catch(() => undefined);
    try {
      await setActive(id);
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Could not switch location."
      );
    }
  };

  const onRemove = (id: Id<"userLocations">, name: string) => {
    Alert.alert("Delete location", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await remove(id);
          } catch (err) {
            Alert.alert(
              "Error",
              err instanceof Error ? err.message : "Could not delete."
            );
          }
        },
      },
    ]);
  };

  const onCommitRename = async (id: Id<"userLocations">) => {
    const value = renameValue.trim();
    if (!value) {
      setRenamingId(null);
      return;
    }
    try {
      await rename(id, value);
      setRenamingId(null);
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Could not rename."
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScreenHeader
          colors={colors}
          onBack={() => router.back()}
          title="Locations"
        />
        <ScrollView
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
            <Text
              style={{
                fontSize: 13,
                color: colors.inkMuted,
                lineHeight: 19,
                marginBottom: 18,
              }}
            >
              Saved places for prayer time calculation. The active location is
              used for the home screen and notifications.
            </Text>

            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                overflow: "hidden",
              }}
            >
              <ActiveRow
                colors={colors}
                onPress={() => onSetActive(null)}
                selected={activeId === null}
              />
              {locations.map((loc) => (
                <View key={loc._id}>
                  <Divider colors={colors} />
                  {renamingId === loc._id ? (
                    <RenameRow
                      colors={colors}
                      onCancel={() => setRenamingId(null)}
                      onChange={setRenameValue}
                      onCommit={() => onCommitRename(loc._id)}
                      value={renameValue}
                    />
                  ) : (
                    <SavedRow
                      colors={colors}
                      onLongPress={() => {
                        setRenamingId(loc._id);
                        setRenameValue(loc.name);
                      }}
                      onPress={() => onSetActive(loc._id)}
                      onRemove={() => onRemove(loc._id, loc.name)}
                      selected={activeId === loc._id}
                      subtitle={loc.city ?? "Saved place"}
                      title={loc.name}
                    />
                  )}
                </View>
              ))}
            </View>

            <View style={{ marginTop: 24 }}>
              {adding ? (
                <View
                  style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    padding: 16,
                    gap: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      letterSpacing: 2,
                      color: colors.inkMuted,
                      textTransform: "uppercase",
                    }}
                  >
                    New location
                  </Text>
                  <TextInput
                    autoFocus
                    onChangeText={setNewName}
                    placeholder="Name (e.g. Home, Work)"
                    placeholderTextColor={colors.inkSubtle}
                    style={{
                      fontSize: 16,
                      color: colors.ink,
                      paddingVertical: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                    value={newName}
                  />
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <Pressable
                      disabled={busy}
                      onPress={() => {
                        setAdding(false);
                        setNewName("");
                      }}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text style={{ color: colors.ink, fontWeight: "600" }}>
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable
                      disabled={busy || !newName.trim()}
                      onPress={addFromGps}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        alignItems: "center",
                        backgroundColor: colors.primary,
                        opacity: busy || !newName.trim() ? 0.5 : 1,
                      }}
                    >
                      <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
                        {busy ? "Saving…" : "Use current location"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  disabled={!hydrated}
                  onPress={() => setAdding(true)}
                  style={{
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: colors.primary,
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 14,
                      fontWeight: "700",
                    }}
                  >
                    + Add location
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ActiveRow({
  colors,
  onPress,
  selected,
}: {
  colors: ThemeColors;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            opacity: pressed ? 0.92 : 1,
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: colors.ink,
              }}
            >
              Current location
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.inkMuted,
                marginTop: 2,
              }}
            >
              Always live GPS
            </Text>
          </View>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: selected ? 7 : 1.5,
              borderColor: selected ? colors.primary : colors.border,
            }}
          />
        </View>
      )}
    </Pressable>
  );
}

function SavedRow({
  colors,
  onLongPress,
  onPress,
  onRemove,
  selected,
  subtitle,
  title,
}: {
  colors: ThemeColors;
  onLongPress: () => void;
  onPress: () => void;
  onRemove: () => void;
  selected: boolean;
  subtitle: string;
  title: string;
}) {
  return (
    <Pressable onLongPress={onLongPress} onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            opacity: pressed ? 0.92 : 1,
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: colors.ink,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.inkMuted,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          </View>
          <Pressable
            hitSlop={10}
            onPress={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <IconSymbol
              color={colors.inkMuted}
              name={"trash" as never}
              size={16}
            />
          </Pressable>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: selected ? 7 : 1.5,
              borderColor: selected ? colors.primary : colors.border,
            }}
          />
        </View>
      )}
    </Pressable>
  );
}

function RenameRow({
  colors,
  onCancel,
  onChange,
  onCommit,
  value,
}: {
  colors: ThemeColors;
  onCancel: () => void;
  onChange: (next: string) => void;
  onCommit: () => void;
  value: string;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
      }}
    >
      <TextInput
        autoFocus
        onChangeText={onChange}
        onSubmitEditing={onCommit}
        placeholder="Location name"
        placeholderTextColor={colors.inkSubtle}
        style={{
          fontSize: 15,
          color: colors.ink,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
        value={value}
      />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable
          onPress={onCancel}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.ink, fontWeight: "600" }}>Cancel</Text>
        </Pressable>
        <Pressable
          disabled={!value.trim()}
          onPress={onCommit}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: "center",
            backgroundColor: colors.primary,
            opacity: value.trim() ? 1 : 0.5,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Divider({ colors }: { colors: ThemeColors }) {
  return (
    <View
      style={{ height: 1, marginLeft: 16, backgroundColor: colors.divider }}
    />
  );
}

function ScreenHeader({
  colors,
  onBack,
  title,
}: {
  colors: ThemeColors;
  onBack: () => void;
  title: string;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync().catch(() => undefined);
          onBack();
        }}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.surfaceSoft,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <IconSymbol
          color={colors.ink}
          name={"chevron.left" as never}
          size={16}
        />
      </Pressable>
      <Text
        style={{
          flex: 1,
          textAlign: "center",
          fontSize: 16,
          fontWeight: "700",
          color: colors.ink,
          marginRight: 36,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

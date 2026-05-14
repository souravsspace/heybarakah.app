import { api } from "@barakah/core/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";

const SPLIT_RE = /\s+/;
const MAX_DIMENSION = 512;
const COMPRESS_QUALITY = 0.85;

export default function PersonalDetails() {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const profile = useQuery(api.lib.users.getMyProfile);
  const upsertProfile = useMutation(api.lib.users.upsertProfile);
  const generateUploadUrl = useMutation(api.lib.users.generateAvatarUploadUrl);
  const setAvatar = useMutation(api.lib.users.setAvatar);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (profile !== undefined && !hydrated) {
      setName(profile?.name ?? "");
      setHydrated(true);
    }
  }, [profile, hydrated]);

  const dirty = hydrated && name.trim() !== (profile?.name ?? "");
  const imageUrl = profile?.imageUrl ?? null;

  const parts = name.trim().split(SPLIT_RE).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase()
      : (parts[0]?.slice(0, 2) ?? "S").toUpperCase();

  const pickImage = async () => {
    Haptics.selectionAsync().catch(() => undefined);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission required",
        "Enable photo access in Settings to upload a picture."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) {
      return;
    }
    const asset = result.assets[0];

    setUploading(true);
    try {
      const manipulated = await manipulateToWebp(asset.uri);
      const uploadUrl = await generateUploadUrl();
      const blob = await (await fetch(manipulated.uri)).blob();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": manipulated.mime },
        body: blob,
      });
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`);
      }
      const { storageId } = (await res.json()) as { storageId: string };
      await setAvatar({ storageId: storageId as never });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined
      );
    } catch (err) {
      Alert.alert(
        "Upload failed",
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (saving) {
      return;
    }
    setSaving(true);
    Haptics.selectionAsync().catch(() => undefined);
    try {
      if (dirty) {
        await upsertProfile({ name: name.trim() || undefined });
      }
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header
          colors={colors}
          onBack={() => router.back()}
          title="Edit Profile"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ alignItems: "center", marginTop: 24, gap: 12 }}>
              <Pressable disabled={uploading} onPress={pickImage}>
                <View>
                  <AvatarView
                    imageUrl={imageUrl}
                    initials={initials}
                    size={120}
                    uploading={uploading}
                  />
                  <View
                    style={{
                      position: "absolute",
                      right: -2,
                      bottom: 6,
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colors.bgElevated,
                      borderWidth: 2,
                      borderColor: colors.bg,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconSymbol
                      color={colors.ink}
                      name={"pencil" as never}
                      size={14}
                    />
                  </View>
                </View>
              </Pressable>
              <Pressable disabled={uploading} onPress={pickImage}>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.inkMuted,
                    fontWeight: "500",
                  }}
                >
                  {uploading ? "Uploading…" : "Change Photo"}
                </Text>
              </Pressable>
            </View>

            <View style={{ paddingHorizontal: 20, marginTop: 28, gap: 12 }}>
              <FloatingInput
                autoCapitalize="words"
                colors={colors}
                label="Name"
                onChangeText={setName}
                placeholder="Your name"
                value={name}
              />
            </View>
          </ScrollView>

          <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
            <Pressable
              disabled={saving}
              onPress={save}
              style={({ pressed }) => ({
                paddingVertical: 18,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: scheme === "dark" ? "#FFFFFF" : colors.ink,
                opacity: pressed ? 0.92 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: scheme === "dark" ? "#000000" : "#FFFFFF",
                  letterSpacing: 0.2,
                }}
              >
                {saving ? "Saving…" : "Continue"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

async function manipulateToWebp(
  uri: string
): Promise<{ uri: string; mime: string }> {
  const actions: ImageManipulator.Action[] = [
    { resize: { width: MAX_DIMENSION, height: MAX_DIMENSION } },
  ];
  try {
    const result = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: COMPRESS_QUALITY,
      format: ImageManipulator.SaveFormat.WEBP,
    });
    return { uri: result.uri, mime: "image/webp" };
  } catch {
    const fallback = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: COMPRESS_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return { uri: fallback.uri, mime: "image/jpeg" };
  }
}

function AvatarView({
  imageUrl,
  initials,
  size,
  uploading,
}: {
  imageUrl: string | null;
  initials: string;
  size: number;
  uploading: boolean;
}) {
  if (imageUrl) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <Image
          contentFit="cover"
          source={{ uri: imageUrl }}
          style={{ width: size, height: size }}
        />
      </View>
    );
  }
  return <GradientAvatar initials={initials} size={size} />;
}

function GradientAvatar({
  initials,
  size,
}: {
  initials: string;
  size: number;
}) {
  const r = size / 2;
  return (
    <View style={{ width: size, height: size }}>
      <Svg height={size} width={size}>
        <Defs>
          <LinearGradient id="grad" x1="0%" x2="100%" y1="0%" y2="100%">
            <Stop offset="0%" stopColor="#00E5A0" />
            <Stop offset="100%" stopColor="#00A98F" />
          </LinearGradient>
        </Defs>
        <Circle cx={r} cy={r} fill="url(#grad)" r={r} />
      </Svg>
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: size * 0.36,
            fontWeight: "700",
            letterSpacing: 1,
          }}
        >
          {initials}
        </Text>
      </View>
    </View>
  );
}

function FloatingInput({
  autoCapitalize,
  colors,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  autoCapitalize: "none" | "words" | "sentences" | "characters";
  colors: ThemeColors;
  label: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  value: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: focused ? colors.ink : colors.border,
        backgroundColor: colors.card,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: "500",
          color: colors.inkMuted,
          marginBottom: 2,
        }}
      >
        {label}
      </Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        placeholderTextColor={colors.inkSubtle}
        style={{
          fontSize: 17,
          fontWeight: "500",
          color: colors.ink,
          padding: 0,
          margin: 0,
        }}
        value={value}
      />
    </View>
  );
}

function Header({
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
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 8,
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
        style={({ pressed }) => ({
          width: 38,
          height: 38,
          borderRadius: 19,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.surfaceSoft,
          opacity: pressed ? 0.8 : 1,
        })}
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
          marginRight: 38,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

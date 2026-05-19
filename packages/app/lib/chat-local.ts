import AsyncStorage from "@react-native-async-storage/async-storage";

export type LocalChatRole = "user" | "assistant";

export type LocalChatMessage = {
  id: string;
  role: LocalChatRole;
  content: string;
  createdAt: number;
};

export type LocalConversationSummary = {
  id: string;
  title: string;
  updatedAt: number;
};

const CONVERSATIONS_KEY = "barakah.chat.conversations.v1";
const messagesKey = (conversationId: string) =>
  `barakah.chat.messages.${conversationId}.v1`;
const MAX_CACHED_MESSAGES = 100;

export async function getCachedConversations(): Promise<
  LocalConversationSummary[]
> {
  const raw = await AsyncStorage.getItem(CONVERSATIONS_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as LocalConversationSummary[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setCachedConversations(
  list: LocalConversationSummary[]
): Promise<void> {
  await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(list));
}

export async function getCachedMessages(
  conversationId: string
): Promise<LocalChatMessage[]> {
  const raw = await AsyncStorage.getItem(messagesKey(conversationId));
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as LocalChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setCachedMessages(
  conversationId: string,
  messages: LocalChatMessage[]
): Promise<void> {
  const trimmed = messages.slice(-MAX_CACHED_MESSAGES);
  await AsyncStorage.setItem(
    messagesKey(conversationId),
    JSON.stringify(trimmed)
  );
}

export async function clearCachedMessages(
  conversationId: string
): Promise<void> {
  await AsyncStorage.removeItem(messagesKey(conversationId));
}

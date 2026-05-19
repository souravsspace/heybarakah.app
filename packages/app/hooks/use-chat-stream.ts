import type { api } from "@barakah/core/convex/_generated/api";
import { useQuery } from "convex/react";
import { fetch as expoFetch } from "expo/fetch";
import { useEffect, useMemo, useRef, useState } from "react";

type StreamStatus = "pending" | "streaming" | "done" | "error";

export interface StreamBody {
  status: StreamStatus;
  text: string;
}

export interface StreamOpts {
  authToken?: string;
  headers?: Record<string, string>;
}

export function useChatStream(
  getPersistentBody: typeof api.lib.chat.getStreamBody,
  streamUrl: URL,
  driven: boolean,
  streamId: string,
  opts?: StreamOpts
): StreamBody {
  const [streamBody, setStreamBody] = useState("");
  const [streamEnded, setStreamEnded] = useState<null | boolean>(null);
  const activeStreamRef = useRef<string | undefined>(undefined);

  const usePersistence = useMemo(() => {
    if (streamEnded === false) {
      return true;
    }
    if (!driven) {
      return true;
    }
    return false;
  }, [driven, streamEnded]);

  const persistentBody = useQuery(
    getPersistentBody,
    usePersistence && streamId ? { streamId } : "skip"
  );

  const fetchOptsRef = useRef({
    urlString: streamUrl.toString(),
    authToken: opts?.authToken,
    extraHeaders: opts?.headers,
  });
  fetchOptsRef.current = {
    urlString: streamUrl.toString(),
    authToken: opts?.authToken,
    extraHeaders: opts?.headers,
  };

  useEffect(() => {
    if (!(driven && streamId)) {
      return;
    }
    if (activeStreamRef.current === streamId) {
      return;
    }
    activeStreamRef.current = streamId;
    setStreamBody("");
    setStreamEnded(null);

    const controller = new AbortController();
    (async () => {
      const { urlString, authToken, extraHeaders } = fetchOptsRef.current;
      try {
        const response = await expoFetch(urlString, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...(extraHeaders ?? {}),
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({ streamId }),
        });

        if (response.status === 205) {
          setStreamEnded(false);
          return;
        }
        if (!response.ok) {
          setStreamEnded(false);
          return;
        }
        if (!response.body) {
          setStreamEnded(false);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          const text = decoder.decode(value, { stream: !done });
          if (text) {
            setStreamBody((prev) => prev + text);
          }
          if (done) {
            setStreamEnded(true);
            return;
          }
        }
      } catch {
        if (!controller.signal.aborted) {
          setStreamEnded(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [driven, streamId]);

  return useMemo<StreamBody>(() => {
    if (persistentBody) {
      return persistentBody as StreamBody;
    }
    let status: StreamStatus;
    if (streamEnded === null) {
      status = streamBody.length > 0 ? "streaming" : "pending";
    } else {
      status = streamEnded ? "done" : "error";
    }
    return { text: streamBody, status };
  }, [persistentBody, streamBody, streamEnded]);
}

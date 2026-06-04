import { Linking } from "react-native";

import { useForcedUpdate } from "@/hooks/use-forced-update";
import { ForceUpdateModal } from "./force-update-modal";

export function ForceUpdateGate() {
  const { blocked, currentVersion, storeUrl } = useForcedUpdate();

  const onUpdate = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl).catch(() => undefined);
    }
  };

  return (
    <ForceUpdateModal
      currentVersion={currentVersion}
      onUpdate={onUpdate}
      visible={blocked}
    />
  );
}

import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

export async function requestLocationPermission(): Promise<boolean> {
  try {
    const res = await Location.requestForegroundPermissionsAsync();
    return res.granted;
  } catch {
    return false;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const res = await Notifications.requestPermissionsAsync();
    return res.granted || res.status === "granted";
  } catch {
    return false;
  }
}

export async function getCurrentLocation() {
  try {
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  } catch {
    return null;
  }
}

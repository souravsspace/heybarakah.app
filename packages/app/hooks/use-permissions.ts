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

export interface ReverseGeocodeResult {
  city: string | null;
  countryCode: string | null;
}

export async function reverseGeocodeLocation(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    const first = places[0];

    if (!first) {
      return null;
    }

    return {
      city: first.city ?? first.subregion ?? first.region ?? null,
      countryCode: first.isoCountryCode ?? null,
    };
  } catch {
    return null;
  }
}

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

const LOCATION_TIMEOUT_MS = 12_000;
const LOCATION_ATTEMPTS = 2;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("location-timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export async function getCurrentLocation() {
  // The first getCurrentPositionAsync right after a fresh permission grant can
  // hang indefinitely while iOS finishes propagating authorization, wedging the
  // UI on "Locating…". Race each attempt against a timeout and retry; on the
  // retry the authorization has usually settled and the fix returns fast.
  for (let attempt = 0; attempt < LOCATION_ATTEMPTS; attempt++) {
    try {
      return await withTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        LOCATION_TIMEOUT_MS
      );
    } catch {
      // retry once on the first-grant hang / transient failure
    }
  }

  // Last resort: a cached fix beats leaving the UI stuck on "Locating…".
  try {
    return await Location.getLastKnownPositionAsync();
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

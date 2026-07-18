import { appConfig } from "@/app-config";

export type CheckoutInfo = {
  /** Checkout URL to send the visitor to. */
  url: string;
  /** True when the 20% is applied silently via the preset link. */
  autoApplied: boolean;
  /** True when the visitor should be shown the code to apply themselves. */
  showCode: boolean;
  code: string;
  percent: number;
};

const { pricing, discount } = appConfig;

/**
 * Resolve the checkout for a visitor's country (ISO 3166-1 alpha-2, from the
 * Cloudflare `cf-ipcountry` header). Auto-discount countries with a preset
 * link get a silent 20% off; everyone else sees the code and gets it prefilled
 * on the base checkout so applying it is one tap.
 */
export function resolveCheckout(country: string | null): CheckoutInfo {
  const cc = (country ?? "").toUpperCase();
  const isAuto = cc !== "" && discount.autoCountries.includes(cc);

  if (isAuto && discount.presetCheckoutUrl) {
    return {
      url: discount.presetCheckoutUrl,
      autoApplied: true,
      showCode: false,
      code: discount.code,
      percent: discount.percent,
    };
  }

  const sep = pricing.checkoutUrl.includes("?") ? "&" : "?";
  return {
    url: `${pricing.checkoutUrl}${sep}discount_code=${encodeURIComponent(discount.code)}`,
    autoApplied: false,
    showCode: true,
    code: discount.code,
    percent: discount.percent,
  };
}

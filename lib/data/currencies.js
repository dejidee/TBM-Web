// lib/data/currencies.js
//
// Option list for the admin payment settings currency picker. Reference data,
// not a fixture — it moved out of lib/mock/settings.js when that file was
// deleted, because the value it produces (`defaultCurrency`) is a real field on
// GET /api/v1/admin/settings/payment.
//
// NGN is first and is the default: the catalogue is priced in naira and every
// storefront price renders with ₦. The list previously led with USD and did not
// include NGN at all, which is why the settings page showed "USD" over a naira
// catalogue.

export const currencyOptions = [
  { value: "NGN", label: "NGN — Nigerian Naira", symbol: "₦" },
  { value: "USD", label: "USD — United States Dollar", symbol: "$" },
  { value: "EUR", label: "EUR — Euro", symbol: "€" },
  { value: "GBP", label: "GBP — British Pound", symbol: "£" },
];

/** The symbol for a currency code, falling back to the code itself. */
export function currencySymbol(code) {
  return currencyOptions.find((c) => c.value === code)?.symbol ?? code ?? "";
}

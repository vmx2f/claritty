/**
 * Currency utilities for Peruvian Soles (PEN)
 * Uses S/ as the symbol for Peruvian Soles
 */

export const CURRENCY_SYMBOL = "S/";
export const CURRENCY_CODE = "PEN";

/**
 * Format a number as Peruvian Soles
 * @param amount - The amount to format
 * @param options - Intl.NumberFormat options
 */
export function formatCurrency(
  amount: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}

/**
 * Format amount with S/ prefix (simpler, no locale)
 */
export function formatPEN(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`;
}

// src/utils/conversions.ts

const GRAMS_PER_OUNCE = 28.3495;
const ML_PER_FL_OUNCE = 29.5735;
const ML_PER_US_CUP = 236.588;

interface ConversionOptions {
  precision?: number;
}

/**
 * Converts grams to ounces.
 * @param grams - The weight in grams.
 * @param options - Conversion options, including precision.
 * @returns The weight in ounces.
 */
export function gramsToOunces(grams: number, options: ConversionOptions = {}): number {
  const ounces = grams / GRAMS_PER_OUNCE;
  return parseFloat(ounces.toFixed(options.precision === undefined ? 2 : options.precision));
}

/**
 * Converts ounces to grams.
 * @param ounces - The weight in ounces.
 * @param options - Conversion options, including precision.
 * @returns The weight in grams.
 */
export function ouncesToGrams(ounces: number, options: ConversionOptions = {}): number {
  const grams = ounces * GRAMS_PER_OUNCE;
  return parseFloat(grams.toFixed(options.precision === undefined ? 0 : options.precision)); // Grams often whole numbers or 1 decimal
}

/**
 * Converts milliliters to fluid ounces.
 * @param ml - The volume in milliliters.
 * @param options - Conversion options, including precision.
 * @returns The volume in fluid ounces.
 */
export function mlToFluidOunces(ml: number, options: ConversionOptions = {}): number {
  const flOunces = ml / ML_PER_FL_OUNCE;
  return parseFloat(flOunces.toFixed(options.precision === undefined ? 1 : options.precision));
}

/**
 * Converts fluid ounces to milliliters.
 * @param flOunces - The volume in fluid ounces.
 * @param options - Conversion options, including precision.
 * @returns The volume in milliliters.
 */
export function fluidOuncesToMl(flOunces: number, options: ConversionOptions = {}): number {
  const ml = flOunces * ML_PER_FL_OUNCE;
  return parseFloat(ml.toFixed(options.precision === undefined ? 0 : options.precision)); // mL often whole numbers
}

/**
 * Converts milliliters to US cups.
 * @param ml - The volume in milliliters.
 * @param options - Conversion options, including precision.
 * @returns The volume in US cups (e.g., 0.25, 0.5, 0.75, 1).
 */
export function mlToUsCups(ml: number, options: ConversionOptions = {}): number {
  const cups = ml / ML_PER_US_CUP;
  // Common to display cups in fractions or simple decimals like 0.25, 0.5, 0.75
  // For simplicity, using a fixed precision. More complex fraction logic could be added.
  return parseFloat(cups.toFixed(options.precision === undefined ? 2 : options.precision));
}

/**
 * Converts US cups to milliliters.
 * @param cups - The volume in US cups.
 * @param options - Conversion options, including precision.
 * @returns The volume in milliliters.
 */
export function usCupsToMl(cups: number, options: ConversionOptions = {}): number {
  const ml = cups * ML_PER_US_CUP;
  return parseFloat(ml.toFixed(options.precision === undefined ? 0 : options.precision));
}

/**
 * Converts Celsius to Fahrenheit.
 * @param celsius - The temperature in Celsius.
 * @param options - Conversion options, including precision.
 * @returns The temperature in Fahrenheit.
 */
export function celsiusToFahrenheit(celsius: number, options: ConversionOptions = {}): number {
  const fahrenheit = celsius * (9 / 5) + 32;
  return parseFloat(fahrenheit.toFixed(options.precision === undefined ? 0 : options.precision));
}

/**
 * Converts Fahrenheit to Celsius.
 * @param fahrenheit - The temperature in Fahrenheit.
 * @param options - Conversion options, including precision.
 * @returns The temperature in Celsius.
 */
export function fahrenheitToCelsius(fahrenheit: number, options: ConversionOptions = {}): number {
  const celsius = (fahrenheit - 32) * (5 / 9);
  return parseFloat(celsius.toFixed(options.precision === undefined ? 0 : options.precision));
}

// TODO:
// - Consider adding more units (tsp, tbsp, pints, quarts, kg, lbs) if needed.
// - For cup conversions, especially for dry ingredients, this system is simplistic.
//   A more advanced system might involve density lookups or guiding users to use weights.
// - Consider a more robust way to handle precision and rounding, perhaps common fraction display for cups (1/4, 1/3, 1/2).

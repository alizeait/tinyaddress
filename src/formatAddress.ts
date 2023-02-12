import { data, defaultFormat, CountryCode } from "./data";

export interface Address {
  /**
   * Name of the person
   */
  name?: string;
  /**
   * The organization, firm, company, or institution at the address.
   */
  organization?: string;
  /**
   * A sorted array of address lines
   */
  addressLines?: string[];
  /**
   * Postal code or ZIP code, also known as PIN code in India.
   */
  postalCode?: string;

  /**
   * The city/town portion of the address.
   */
  city?: string;
  /**
   * The country of the address. Will always be the last line in the address
   */
  country?: string;

  /**
   * An ISO 3166-2 country code for the given country. Only used to
   * format the address and will not be included in it.
   * Use "country" field to add a country in the address
   */
  countryCode: CountryCode;
  /**
   * The top level administrative subdivision of the country. For example, this can be a state, a province, an oblast, or a prefecture.
   * Also known as `administrativeArea` or `district`
   */
  region?: string;
  /**
   * Dependent locality or sublocality within a city. For example, neighborhoods, boroughs, districts, or UK dependent localities
   */
  dependentLocality?: string;
  /**
   * Sorting code system, such as the CEDEX system used in France.
   */
  sortingCode?: string;
}

const map: Record<string, keyof Address> = {
  N: "name",
  O: "organization",
  A: "addressLines",
  C: "city",
  S: "region",
  D: "dependentLocality",
  Z: "postalCode",
  X: "sortingCode",
};

export interface Options {
  /**
   * The address format type, can be of type `local` or `latin`.
  Default is `local`. Some countries have a `latin` alternative.
   */
  format: "local" | "latin";
}

const regex = /(%n)*(\s*\w*-*\s*)*(,*\s*)*%(N|O|A|C|S|D|Z|X)/g;

export const formatAddress = (address: Address, options?: Options) => {
  const fmt =
    data.get(address.countryCode)?.[options?.format === "latin" ? 1 : 0] ||
    defaultFormat;

  const formattedString = fmt.replace(regex, (_, g1, g2, g3, g4) => {
    const value = address[map[g4]];
    if (!value) return "";
    const newValue = g4 === "A" ? (value as string[]).join("%n") : value;
    return `${g1 || ""}${g2 || ""}${g3 || ""}${newValue}`;
  });

  const formattedArray = formattedString
    .split("%n")
    .map((f) => f.replace(/^,*\s*/, ""))
    .filter(Boolean);

  if (address.country) {
    formattedArray.push(address.country);
  }
  return formattedArray;
};

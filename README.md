# tinyaddress · ![License](https://img.shields.io/github/license/alizeait/tinyaddress) ![version](https://img.shields.io/npm/v/tinyaddress) ![Check](https://github.com/alizeait/tinyaddress/workflows/Check/badge.svg) ![Coverage](https://img.shields.io/codecov/c/github/alizeait/tinyaddress) ![PRs](https://img.shields.io/badge/PRs-Welcome-green)

> A tiny (~1.6KB), universal, zero-dependency localized address formatter for postal addresses.

This package uses [address metadata](https://github.com/google/libaddressinput/wiki/AddressValidationMetadata)
from Google's [Address Data Service](https://chromium-i18n.appspot.com/ssl-address/data) to format _postal addresses_ from all over the world.

## Installation

```bash
$ npm install tinyaddress
```

or using `yarn`

```bash
$ yarn add tinyaddress
```

## Usage

```ts
import { formatAddress } from "tinyaddress";

const address = formatAddress({
  name: "Mr John Smith",
  region: "New York",
  city: "Kingston",
  addressLines: ["132, My Street"],
  postalCode: "12401",
  countryCode: "US",
});

/* 
	["Mr John Smith",
	"132, My Street",
	"Kingston, New York 12401"]
*/
```

`formatAddress` returns an array of sorted lines which can then be joined to generate a string.
This can be done automatically by passing `string` as `options.output`:

```ts
import { formatAddress } from "tinyaddress";

const address = formatAddress(
  {
    name: "Mr John Smith",
    region: "New York",
    city: "Kingston",
    addressLines: ["132, My Street"],
    postalCode: "12401",
    countryCode: "US",
  },
  { output: "string" }
);

/*
	"Mr John Smith
	132, My Street
	Kingston, New York 12401
*/
```

### Properties

- `countryCode` (required): An ISO 3166-2 country code for the given country. Only used to format the address and will not be included in it. Use the `country` field to add a country in the address.

- `name` (optional): The name of the person.

- `organization` (optional): The organization, firm, company, or institution at the address.
  addressLines (optional): A sorted array of address lines.

- `postalCode` (optional): The postal code or ZIP code, also known as PIN code in India.
  city (optional): The city/town portion of the address.

- `country` (optional): The country of the address. Will always be the last line in the address.

- `region` (optional): The top-level administrative subdivision of the country. For example, this can be a state, a province, an oblast, or a prefecture. Also known as administrativeArea or district.

- `dependentLocality` (optional): Dependent locality or sublocality within a city. For example, neighborhoods, boroughs, districts, or UK dependent localities.

- `sortingCode` (optional): Sorting code system, such as the CEDEX system used in France.

### Options

- `format` (optional): `local | latin` The address format type, can be of type `local` or `latin`.
  Default is `local`. Some countries have a `latin` alternative.
- `output` (optional): `string | array` The type of the output, default is a sorted `array`, but
  can be changed to `string`, which joins the array with `'/n'`.

### Inspired by [localized-address-format](https://github.com/DASPRiD/localized-address-format)

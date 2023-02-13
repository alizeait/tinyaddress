import { formatAddress } from "../src";

describe("formatAddress", () => {
  test("does not include missing fields", () => {
    expect(formatAddress({ countryCode: "SE" })).toStrictEqual([]);

    expect(
      formatAddress({ countryCode: "US", region: "New York" })
    ).toStrictEqual(["New York"]);

    expect(
      formatAddress({
        countryCode: "SE",
        region: "Blekinge",
        city: "Karlskrona",
      })
    ).toStrictEqual(["Karlskrona"]);

    expect(
      formatAddress({
        name: "Mr John Smith",
        region: "New York",
        city: "Kingston",
        addressLines: ["132, My Street"],
        country: "United States",
        postalCode: "12401",
        countryCode: "US",
      })
    ).toMatchInlineSnapshot(`
      [
        "Mr John Smith",
        "132, My Street",
        "Kingston, New York 12401",
        "United States",
      ]
    `);
  });

  test("includes country last when provided", () => {
    expect(
      formatAddress({ countryCode: "SE", country: "Sweden" })
    ).toStrictEqual(["Sweden"]);

    expect(
      formatAddress({
        countryCode: "SE",
        city: "Karlskrona",
        country: "Sweden",
      })
    ).toStrictEqual(["Karlskrona", "Sweden"]);

    expect(
      formatAddress({
        countryCode: "SE",
        city: "City",
        postalCode: "34565",
        country: "Sweden",
      })
    ).toStrictEqual(["SE-34565 City", "Sweden"]);
  });

  test("does not include empty fields", () => {
    expect(
      formatAddress({
        countryCode: "US",
        addressLines: ["street1", "", "street3"],
      })
    ).toStrictEqual(["street1", "street3"]);

    expect(
      formatAddress({ countryCode: "US", addressLines: [""] })
    ).toStrictEqual([]);

    expect(
      formatAddress({
        countryCode: "US",
        addressLines: [],
        city: "",
        region: "",
        postalCode: "",
        country: "",
        name: "",
        organization: "",
        sortingCode: "",
        dependentLocality: "",
      })
    ).toStrictEqual([]);
  });

  test("falls back to a default format when countryCode does not match supported list", () => {
    expect(
      formatAddress({
        countryCode: "XX",
        name: "AZ",
        organization: "Organization",
        addressLines: ["Line 1", "Line 2"],
        city: "City",
        region: "Region",
        country: "XXXXX",
        postalCode: "34545",
      })
    ).toMatchInlineSnapshot(`
      [
        "AZ",
        "Organization",
        "Line 1",
        "Line 2",
        "34545 City",
        "XXXXX",
      ]
    `);

    expect(
      formatAddress({
        organization: "Org",
        city: "City",
        addressLines: ["Street 1"],
        countryCode: "YY",
        postalCode: "333333",
      })
    ).toMatchInlineSnapshot(`
      [
        "Org",
        "Street 1",
        "333333 City",
      ]
    `);
  });

  test("uses latin format when options.format is 'latin'", () => {
    expect(
      formatAddress(
        {
          countryCode: "CN",
          name: "Name",
          organization: "Org",
          addressLines: ["Line 1", "Line 2"],
          city: "City",
          postalCode: "333333",
        },
        { format: "latin" }
      )
    ).toMatchInlineSnapshot(`
      [
        "Name",
        "Org",
        "Line 1",
        "Line 2",
        "City, 333333",
      ]
    `);

    expect(
      formatAddress({
        countryCode: "CN",
        name: "Name",
        organization: "Org",
        addressLines: ["Line 1", "Line 2"],
        city: "City",
        postalCode: "333333",
      })
    ).toMatchInlineSnapshot(`
      [
        "333333City",
        "Line 1",
        "Line 2",
        "Org",
        "Name",
      ]
    `);
  });

  test("properly formats addresses with postprefix", () => {
    expect(
      formatAddress({
        name: "Name",
        addressLines: ["Line 1"],
        postalCode: "333333",
        region: "JJJJ",
        city: "City",
        countryCode: "AX",
      })
    ).toMatchInlineSnapshot(`
      [
        "Name",
        "Line 1",
        "AX-333333 City",
        "ÅLAND",
      ]
    `);

    expect(
      formatAddress({
        name: "Name",
        addressLines: ["Line 1"],
        postalCode: "333333",
        region: "BRBRBR",
        city: "City",
        countryCode: "BR",
      })
    ).toMatchInlineSnapshot(`
      [
        "Name",
        "Line 1",
        "City-BRBRBR",
        "333333",
      ]
    `);

    expect(
      formatAddress({
        name: "Name",
        addressLines: ["Line 1"],
        postalCode: "333333",
        region: "LULULULU",
        city: "City",
        countryCode: "LU",
      })
    ).toMatchInlineSnapshot(`
      [
        "Name",
        "Line 1",
        "L-333333 City",
      ]
    `);
  });

  test("adds address prefix for countries that require it", () => {
    expect(
      formatAddress({
        name: "Name",
        addressLines: ["Line 1"],
        postalCode: "333333",
        region: "JJJJ",
        city: "City",
        countryCode: "JP",
      })
    ).toMatchInlineSnapshot(`
      [
        "〒333333",
        "JJJJ",
        "Line 1",
        "Name",
      ]
    `);
  });

  test("keeps extra inline text for countries that require it", () => {
    expect(
      formatAddress({
        name: "Name",
        addressLines: ["Line 1"],
        postalCode: "333333",
        region: "GGGGG",
        city: "City",
        countryCode: "GG",
      })
    ).toMatchInlineSnapshot(`
      [
        "Name",
        "Line 1",
        "City",
        "GUERNSEY",
        "333333",
      ]
    `);

    expect(
      formatAddress({
        name: "Name",
        addressLines: ["Line 1"],
        postalCode: "333333",
        region: "SGSGSG",
        city: "City",
        countryCode: "SG",
      })
    ).toMatchInlineSnapshot(`
      [
        "Name",
        "Line 1",
        "SINGAPORE 333333",
      ]
    `);
  });
  test("returns a string when options.output is 'string'", () => {
    expect(
      formatAddress(
        {
          name: "Name",
          addressLines: ["Line 1"],
          postalCode: "333333",
          region: "GGGGG",
          city: "City",
          countryCode: "GG",
        },
        { output: "string" }
      )
    ).toMatchInlineSnapshot(`
      "Name
      Line 1
      City
      GUERNSEY
      333333"
    `);

    expect(
      formatAddress(
        {
          name: "Name",
          addressLines: ["Line 1"],
          postalCode: "333333",
          region: "SGSGSG",
          city: "City",
          countryCode: "SG",
        },
        { output: "string" }
      )
    ).toMatchInlineSnapshot(`
      "Name
      Line 1
      SINGAPORE 333333"
    `);
  });
});

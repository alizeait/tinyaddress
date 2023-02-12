import path from "path";
import { writeFile } from "fs/promises";
import { fetch } from "undici";
import prettier from "prettier";
import ts, { factory } from "typescript";

const defaultFormat = "%N%n%O%n%A%n%C";

const chromeSslAddressUrl =
  "https://chromium-i18n.appspot.com/ssl-address/data";

(async () => {
  const countryCodes = await fetchCountryCodes();
  const data: Record<string, CountryData> = {};

  for (const countryCode of countryCodes) {
    const countryData = await fetchCountryData(countryCode);
    data[countryCode] = countryData;
  }

  let tsFile = ts.createSourceFile("data", "", ts.ScriptTarget.ES2022);
  const fileData = [
    factory.createTypeAliasDeclaration(
      undefined,
      factory.createIdentifier("Format"),
      undefined,
      factory.createArrayTypeNode(
        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
      )
    ),
    factory.createTypeAliasDeclaration(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      factory.createIdentifier("CountryCode"),
      undefined,
      factory.createUnionTypeNode([
        ...Object.keys(data).map((countryCode) =>
          factory.createLiteralTypeNode(
            factory.createStringLiteral(countryCode)
          )
        ),
        factory.createParenthesizedType(
          factory.createIntersectionTypeNode([
            factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            factory.createTypeLiteralNode([]),
          ])
        ),
      ])
    ),
    factory.createVariableStatement(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier("data"),
            undefined,
            undefined,
            factory.createNewExpression(
              factory.createIdentifier("Map"),
              [
                factory.createTypeReferenceNode(
                  factory.createIdentifier("CountryCode"),
                  undefined
                ),
                factory.createTypeReferenceNode(
                  factory.createIdentifier("Format"),
                  undefined
                ),
              ],
              [
                factory.createArrayLiteralExpression(
                  createMapData(data as any),
                  true
                ),
              ]
            )
          ),
        ],
        ts.NodeFlags.Const
      )
    ),
    factory.createVariableStatement(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier("defaultFormat"),
            undefined,
            undefined,
            factory.createStringLiteral(defaultFormat)
          ),
        ],
        ts.NodeFlags.Const
      )
    ),
  ];

  tsFile = ts.factory.updateSourceFile(tsFile, fileData);

  const finalFile = `/* eslint-disable @typescript-eslint/ban-types */
  // This file is autgenerated. Generate again by running 'yarn generate'.\n\n${printFile(
    tsFile
  )}`;

  await writeFormattedFile(
    path.resolve(process.cwd(), "src", "data.ts"),
    finalFile
  );
  console.log("Successfully generated data.ts file");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function fetchCountryCodes(): Promise<string[]> {
  console.log("Fetching country codes...");

  const response = await fetch(chromeSslAddressUrl);

  if (!response.ok) {
    throw new Error("Faild loading country codes");
  }

  const data: any = await response.json();
  return data.countries.split("~");
}
interface CountryData {
  key: string;
  fmt: string;
  lfmt?: string;
  zip?: string;
  require?: string;
}

async function fetchCountryData(countryCode: string): Promise<CountryData> {
  console.log("Fetching data for", countryCode, "...");

  const response = await fetch(`${chromeSslAddressUrl}/${countryCode}`);

  if (!response.ok) {
    throw new Error(`Failed fetching data for ${countryCode}`);
  }

  return response.json() as any;
}

function createMapData(data: Record<string, CountryData>) {
  return Object.entries(data).map(([countryCode, data]) => {
    return factory.createArrayLiteralExpression(
      [
        factory.createStringLiteral(countryCode),
        factory.createArrayLiteralExpression(
          [
            factory.createStringLiteral(data.fmt || defaultFormat),
            data.lfmt && (factory.createStringLiteral(data.lfmt) as any),
          ].filter(Boolean),
          false
        ),
      ],
      false
    );
  });
}

export function printFile(file: ts.SourceFile): string {
  return ts
    .createPrinter({
      removeComments: false,
    })
    .printFile(file);
}
export async function writeFormattedFile(filepath: string, code: string) {
  const formatted = prettier.format(code, {
    filepath,
  });
  return writeFile(filepath, formatted, "utf8");
}

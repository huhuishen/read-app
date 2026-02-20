import fs from "fs";
import type { Schema, SchemaDef } from "./core";


function defToTs(def: SchemaDef, indent = 2): string {
    const pad = (n: number) => " ".repeat(n);

    switch (def.kind) {
        case "string":
        case "number":
        case "boolean":
        case "Date":
        case "ObjectId":
            return def.kind;

        case "literal":
            return JSON.stringify(def.value);

        case "array": {
            const inner = defToTs(def.element, indent);
            // 如果是 union / object，需要加括号
            const needParens =
                def.element.kind === "union" || def.element.kind === "object";
            return needParens ? `(${inner})[]` : `${inner}[]`;
        }

        case "union":
            return def.items.map(i => defToTs(i, indent)).join(" | ");

        case "object":
            return `{\n${Object.entries(def.shape)
                .map(
                    ([k, v]) =>
                        `${pad(indent)}${k}: ${defToTs(v, indent + 2)};`
                )
                .join("\n")}\n}`;
    }
}


export function generateInterfaces(
    schemas: Record<string, Schema<any, any>>,
    outputFile: string
) {
    const blocks = Object.entries(schemas).map(
        ([name, schema]) => {
            const body = defToTs(schema._def);
            return `export interface ${name} ${body}`;
        }
    );

    const content = `/* AUTO-GENERATED FILE, DO NOT EDIT */

${blocks.join("\n\n")}
`;

    // ✅ 强制 UTF-8，修复中文乱码
    fs.writeFileSync(outputFile, content, { encoding: "utf-8" });
}
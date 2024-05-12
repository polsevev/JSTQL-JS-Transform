import type { Model } from "../language/generated/ast.js";

import { AstNode, EmptyFileSystem, LangiumDocument } from "langium";
import { parseDocument } from "langium/test";
import { createJstqlServices } from "../language/jstql-module.js";
const services = createJstqlServices(EmptyFileSystem).Jstql;

export async function parseDSLtoAST(modelText: string): Promise<Model> {
    var doc: LangiumDocument<AstNode> = await parseDocument(
        services,
        modelText
    );
    const db = services.shared.workspace.DocumentBuilder;
    await db.build([doc], { validation: true });
    const model = doc.parseResult.value as Model;
    return model;
}

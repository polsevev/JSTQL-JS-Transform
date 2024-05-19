import { TransformRecipe, Proposal as LocalProp } from "../transform/transform";
import { parseDSLtoAST } from "../../JSTQL/src/JSTQL_interface/api";
import { Model, Case } from "../../JSTQL/src/language/generated/ast";

export async function parseJSTQL(jstql: string): Promise<LocalProp[]> {
    let model: Model = await parseDSLtoAST(jstql);
    let localProposals: LocalProp[] = [];
    for (let proposal of model.proposals) {
        let cases: TransformRecipe[] = [];

        for (let singleCase of proposal.case) {
            cases.push({
                applicableTo: singleCase.aplTo.apl_to_code,
                transformTo: singleCase.traTo.transform_to_code,
            });
        }
        localProposals.push({ cases });
    }
    return localProposals;
}

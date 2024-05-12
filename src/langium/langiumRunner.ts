import { TransformRecipe, Proposal as LocalProp } from "../transform/transform";
import { parseDSLtoAST } from "../../JSTQL/src/JSTQL_interface/api";
import { Model, Proposal } from "../../JSTQL/src/language/generated/ast";

export async function parseJSTQL(jstql: string): Promise<LocalProp[]> {
    let model: Model = await parseDSLtoAST(jstql);
    let proposals: LocalProp[] = [];
    for (let proposal of model.proposals) {
        let pairs: TransformRecipe[] = [];
        for (let pair of proposal.pair) {
            pairs.push({
                applicableTo: pair.aplTo.apl_to_code,
                transformTo: pair.traTo.transform_to_code,
            });
        }
        proposals.push({ pairs });
    }
    return proposals;
}

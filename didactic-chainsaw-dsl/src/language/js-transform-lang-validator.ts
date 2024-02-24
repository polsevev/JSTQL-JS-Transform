import type { ValidationChecks } from "langium";
import type { JsTransformLangAstType } from "./generated/ast.js";
import type { JsTransformLangServices } from "./js-transform-lang-module.js";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: JsTransformLangServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.JsTransformLangValidator;
    const checks: ValidationChecks<JsTransformLangAstType> = {
        //Person: validator.checkPersonStartsWithCapital,
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class JsTransformLangValidator {
    /*
    checkPersonStartsWithCapital(
        proposal: Proposal,
        accept: ValidationAcceptor
    ): void {
        if (proposal.code) {
            if (proposal.code === "") {
                accept("warning", "You are running with empty code here", {
                    node: proposal,
                    property: "code",
                });
            }
        }
    }
    */
}

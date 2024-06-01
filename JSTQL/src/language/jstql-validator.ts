import type { ValidationAcceptor, ValidationChecks } from "langium";
import type { JstqlAstType, Case } from "./generated/ast.js";
import type { JstqlServices } from "./jstql-module.js";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: JstqlServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.JstqlValidator;
    const checks: ValidationChecks<JstqlAstType> = {
        Case: validator.validateWildcards,
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class JstqlValidator {
    validateWildcards(case_: Case, accept: ValidationAcceptor): void {
        try {
            let validationResultAplTo = validateWildcardAplTo(
                collectWildcard(case_.aplTo.apl_to_code.split(""))
            );
            if (validationResultAplTo.errors.length != 0) {
                accept("error", validationResultAplTo.errors.join("\n"), {
                    node: case_.aplTo,
                    property: "apl_to_code",
                });
            }

            let validationResultTraTo = validateWildcardTraTo(
                collectWildcard(case_.traTo.transform_to_code.split("")),
                validationResultAplTo.env
            );

            if (validationResultTraTo.length != 0) {
                accept("error", validationResultTraTo.join("\n"), {
                    node: case_.traTo,
                    property: "transform_to_code",
                });
            }
        } catch (e) {}
    }
}

function validateWildcardTraTo(wildcards: string[], env: string[]): string[] {
    let errors: string[] = [];
    for (let wildcard of wildcards) {
        if (!env.includes(wildcard)) {
            errors.push(
                "Wildcard " +
                    wildcard +
                    " Is not declared in applicable to block"
            );
        }
    }
    return errors;
}

interface ValidationResultAplTo {
    env: string[];
    errors: string[];
}

function validateWildcardAplTo(wildcards: string[]): ValidationResultAplTo {
    let env = [];
    let errors = [];
    for (let wildcard of wildcards) {
        let [identifier, types, ..._] = wildcard.split(":");
        env.push(identifier);
        if (_.length > 0) {
            errors.push("Too many : in wildcard");
        }

        if (!types) {
            errors.push("No types given for wildcard " + identifier);
        }
    }
    return { env, errors };
}

function collectWildcard(code: string[]): string[] {
    let flag = false;
    let wildcards: string[] = [];
    let wildcard = "";
    for (let i = 0; i < code.length; i++) {
        if (i != code.length && code[i] === ">" && code[i + 1] === ">") {
            flag = false;
            wildcards.push(wildcard.replace(/\s/g, ""));
            wildcard = "";
            i += 1;
        }
        if (flag) {
            wildcard += code[i];
        }

        if (i != code.length - 1 && code[i] === "<" && code[i + 1] === "<") {
            flag = true;
            i += 1;
        }
    }
    return wildcards;
}

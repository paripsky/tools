import {Path, TransformExitResult} from "@romefrontend/compiler";
import {descriptions} from "@romefrontend/diagnostics";
import {jsxFragment} from "@romefrontend/ast";
import {hasJSXAttribute} from "@romefrontend/js-ast-utils";
import {doesNodeMatchReactPattern} from "../../utils/react";

export default {
	name: "react/jsxFragments",
	enter(path: Path): TransformExitResult {
		const {node, context, scope} = path;

		if (
			node.type === "JSXElement" &&
			(doesNodeMatchReactPattern(node.name, scope, "Fragment") ||
			doesNodeMatchReactPattern(node.name, scope, "React.Fragment")) &&
			!hasJSXAttribute(node, "key")
		) {
			return context.addFixableDiagnostic(
				{
					old: node,
					fixed: jsxFragment.create({
						children: node.children,
					}),
				},
				descriptions.LINT.REACT_JSX_FRAGMENTS,
			);
		}

		return node;
	},
};

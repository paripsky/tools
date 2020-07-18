/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Path, TransformExitResult} from "@romefrontend/compiler";
import {
	JSVariableDeclarationStatement,
	jsVariableDeclaration,
	jsVariableDeclarationStatement,
} from "@romefrontend/ast";
import {descriptions} from "@romefrontend/diagnostics";

export default {
	name: "js/singleVarDeclarator",
	enter(path: Path): TransformExitResult {
		const {node} = path;

		if (
			node.type === "JSVariableDeclarationStatement" &&
			node.declaration.declarations.length > 1
		) {
			const fixed: Array<JSVariableDeclarationStatement> = [];
			const {kind} = node.declaration;

			for (const declarator of node.declaration.declarations) {
				fixed.push(
					jsVariableDeclarationStatement.quick(
						jsVariableDeclaration.create({
							kind,
							declarations: [declarator],
						}),
					),
				);
			}

			return path.context.addFixableDiagnostic(
				{old: node, fixed},
				descriptions.LINT.JS_SINGLE_VAR_DECLARATOR,
			);
		}

		return node;
	},
};

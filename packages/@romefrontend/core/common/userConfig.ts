/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {consumeJSON} from "@romefrontend/codec-json";
import {VERSION} from "./constants";
import {ROME_CONFIG_FILENAMES} from "@romefrontend/project";
import {AbsoluteFilePath, HOME_PATH, TEMP_PATH} from "@romefrontend/path";
import {existsSync, readFileTextSync} from "@romefrontend/fs";
import {Consumer} from "@romefrontend/consume";
import {descriptions} from "@romefrontend/diagnostics";

export type UserConfig = {
	configPath: undefined | AbsoluteFilePath;
	cachePath: AbsoluteFilePath;
	syntaxTheme: undefined | Consumer;
};

export const DEFAULT_USER_CONFIG: UserConfig = {
	configPath: undefined,
	cachePath: TEMP_PATH.append(`rome-${VERSION}`),
	syntaxTheme: undefined,
};

export function normalizeUserConfig(
	consumer: Consumer,
	configPath: AbsoluteFilePath,
): UserConfig {
	const userConfig: UserConfig = {
		...DEFAULT_USER_CONFIG,
	};

	if (consumer.has("cachePath")) {
		userConfig.cachePath = consumer.get("cachePath").asAbsoluteFilePath(
			undefined,
			configPath.getParent(),
		);
	}

	if (consumer.has("vscodeTheme")) {
		const prop = consumer.get("vscodeTheme");
		const path = prop.asAbsoluteFilePath(undefined, configPath.getParent());

		if (existsSync(path)) {
			const input = readFileTextSync(path);

			userConfig.syntaxTheme = consumeJSON({
				consumeDiagnosticCategory: "parse/vscodeTheme",
				input,
				path,
			});
		} else {
			throw prop.unexpected(descriptions.USER_CONFIG.VSCODE_THEME_NOT_FOUND);
		}
	}

	consumer.enforceUsedProperties("config property");

	return userConfig;
}

let loadedUserConfig: undefined | UserConfig;

export function loadUserConfig(): UserConfig {
	if (loadedUserConfig !== undefined) {
		return loadedUserConfig;
	}

	for (const configFilename of ROME_CONFIG_FILENAMES) {
		const configPath = HOME_PATH.appendList(".config", configFilename);

		if (!existsSync(configPath)) {
			continue;
		}

		const configFile = readFileTextSync(configPath);
		const consumer = consumeJSON({
			path: configPath,
			input: configFile,
		});

		loadedUserConfig = normalizeUserConfig(consumer, configPath);
		return loadedUserConfig;
	}

	loadedUserConfig = DEFAULT_USER_CONFIG;
	return loadedUserConfig;
}

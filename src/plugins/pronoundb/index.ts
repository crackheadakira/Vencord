/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

import PronounsAboutComponent from "./components/PronounsAboutComponent";
import PronounsChatComponent from "./components/PronounsChatComponent";
import PronounsProfileWrapper from "./components/PronounsProfileWrapper";

export enum PronounsFormat {
    Lowercase = "LOWERCASE",
    Capitalized = "CAPITALIZED"
}

export default definePlugin({
    name: "PronounDB",
    authors: [Devs.Tyman],
    description: "Adds pronouns to user messages using pronoundb",
    patches: [
        // Patch the chat timestamp element
        {
            find: "showCommunicationDisabledStyles",
            replacement: {
                match: /(?<=return\s*\(0,\w{1,3}\.jsxs?\)\(.+!\w{1,3}&&)(\(0,\w{1,3}.jsxs?\)\(.+?\{.+?\}\))/,
                replace: "[$1, $self.PronounsChatComponent(e)]"
            }
        },
        // Hijack the discord pronouns section and add a wrapper around the text section
        {
            find: ".Messages.BOT_PROFILE_SLASH_COMMANDS",
            replacement: {
                match: /\(0,.\.jsx\)\((?<PronounComponent>.{1,2}\..),(?<pronounProps>{currentPronouns.+?:(?<fullProps>.{1,2})\.pronouns.+?})\)/,
                replace: "$<fullProps>&&$self.PronounsProfileWrapper($<PronounComponent>,$<pronounProps>,$<fullProps>)"
            }
        },
        // Force enable pronouns component ignoring the experiment value
        {
            find: ".Messages.USER_POPOUT_PRONOUNS",
            replacement: {
                match: /\i\.\i\.useExperiment\({}\)\.showPronouns/,
                replace: "true"
            }
        }
    ],

    options: {
        pronounsFormat: {
            type: OptionType.SELECT,
            description: "The format for pronouns to appear in chat",
            options: [
                {
                    label: "Lowercase",
                    value: PronounsFormat.Lowercase,
                    default: true
                },
                {
                    label: "Capitalized",
                    value: PronounsFormat.Capitalized
                }
            ]
        },
        showSelf: {
            type: OptionType.BOOLEAN,
            description: "Enable or disable showing pronouns for the current user",
            default: true
        }
    },
    settingsAboutComponent: PronounsAboutComponent,
    // Re-export the components on the plugin object so it is easily accessible in patches
    PronounsChatComponent,
    PronounsProfileWrapper
});

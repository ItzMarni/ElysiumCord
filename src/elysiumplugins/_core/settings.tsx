/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ElysiumPluginsTab from "@components/VencordSettings/ElysiumPluginsTab";
import ElysiumTab from "@components/VencordSettings/ElysiumTab";
import { Devs } from "@utils/constants";
import definePlugin, { PluginType } from "@utils/types";
import { i18n } from "@webpack/common";
import { Settings } from "Vencord";

type SectionType = "HEADER" | "DIVIDER" | "CUSTOM";
type SectionTypes = Record<SectionType, SectionType>;

export default definePlugin({
    name: "ElysiumSettings",
    description: "Add settings for Elysium",
    authors: [Devs.Marni],
    pluginType: PluginType.elysium,
    required: true,

    patches: [
        {
            find: "Messages.ACTIVITY_SETTINGS",
            replacement: [
                {
                    match: /(?<=section:(.{0,50})\.DIVIDER\}\))([,;])(?=.{0,200}(\i)\.push.{0,100}label:(\i)\.header)/,
                    replace: (_, sectionTypes, commaOrSemi, elements, element) => `${commaOrSemi} $self.addSettings(${elements}, ${element}, ${sectionTypes}) ${commaOrSemi}`
                },
                {
                    match: /({(?=.+?function (\i).{0,120}(\i)=\i\.useMemo.{0,60}return \i\.useMemo\(\(\)=>\i\(\3).+?function\(\){return )\2(?=})/,
                    replace: (_, rest, settingsHook) => `${rest}$self.wrapSettingsHook(${settingsHook})`
                }
            ]
        },
        {
            find: "Messages.USER_SETTINGS_ACTIONS_MENU_LABEL",
            replacement: {
                match: /(?<=function\((\i),\i\)\{)(?=let \i=Object.values\(\i.\i\).*?(\i\.\i)\.open\()/,
                replace: "$2.open($1);return;"
            }
        }
    ],

    customSections: [] as ((SectionTypes: SectionTypes) => any)[],

    makeSettingsCategories(SectionTypes: SectionTypes) {
        return [
            {
                section: SectionTypes.HEADER,
                label: "Elysium",
                className: "ec-settings-header"
            },
            {
                section: "ElysiumSettings",
                label: "Elysium",
                element: ElysiumTab,
                className: "ec-settings"
            },
            {
                section: "ElysiumPlugins",
                label: "Plugins",
                element: ElysiumPluginsTab,
                className: "ec-plugins"
            },
            ...this.customSections.map(func => func(SectionTypes)),
            {
                section: SectionTypes.DIVIDER
            }
        ].filter(Boolean);
    },

    isRightSpot({ header, settings }: { header?: string; settings?: string[]; }) {
        const firstChild = settings?.[0];
        // lowest two elements... sanity backup
        if (firstChild === "LOGOUT" || firstChild === "SOCIAL_LINKS") return true;

        const { settingsLocation } = Settings.plugins.Settings;

        if (settingsLocation === "bottom") return firstChild === "LOGOUT";
        if (settingsLocation === "belowActivity") return firstChild === "CHANGELOG";

        if (!header) return;

        const names = {
            top: i18n.Messages.USER_SETTINGS,
            aboveNitro: i18n.Messages.BILLING_SETTINGS,
            belowNitro: i18n.Messages.APP_SETTINGS,
            aboveActivity: i18n.Messages.ACTIVITY_SETTINGS
        };
        return header === names[settingsLocation];
    },

    patchedSettings: new WeakSet(),

    addSettings(elements: any[], element: { header?: string; settings: string[]; }, sectionTypes: SectionTypes) {
        if (this.patchedSettings.has(elements) || !this.isRightSpot(element)) return;

        this.patchedSettings.add(elements);

        elements.push(...this.makeSettingsCategories(sectionTypes));
    },

    wrapSettingsHook(originalHook: (...args: any[]) => Record<string, unknown>[]) {
        return (...args: any[]) => {
            const elements = originalHook(...args);
            if (!this.patchedSettings.has(elements))
                elements.unshift(...this.makeSettingsCategories({
                    HEADER: "HEADER",
                    DIVIDER: "DIVIDER",
                    CUSTOM: "CUSTOM"
                }));

            return elements;
        };
    },

});

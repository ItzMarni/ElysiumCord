/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useSettings } from "@api/Settings";
import { classNameFactory } from "@api/Styles";
import { Margins } from "@utils/margins";
import { useAwaiter } from "@utils/react";
import { Forms, Switch } from "@webpack/common";

import { SettingsTab, wrapTab } from "./shared";

const cl = classNameFactory("ec-settings-"); // ec = ElysiumCord

type KeysOfType<Object, Type> = {
    [K in keyof Object]: Object[K] extends Type ? K : never;
}[keyof Object];


function ElysiumSettings() {
    const [settingsDir, , settingsDirPending] = useAwaiter(VencordNative.settings.getSettingsDir, {
        fallbackValue: "Loading..."
    });
    const settings = useSettings();

    // const donateImage = React.useMemo(() => Math.random() > 0.5 ? DEFAULT_DONATE_IMAGE : SHIGGY_DONATE_IMAGE, []);

    const isWindows = navigator.platform.toLowerCase().startsWith("win");
    const isMac = navigator.platform.toLowerCase().startsWith("mac");
    const needsVibrancySettings = IS_DISCORD_DESKTOP && isMac;

    const Switches: Array<false | {
        key: KeysOfType<typeof settings, boolean>;
        title: string;
        note: string;
    }> = [
            {
                key: "elysiumHideDonorBadges",
                title: "Hide Vencord Donor Badges",
                note: "(Requires a full restart) Hides vencord donor badges so they don't take up even more space in the already limited profile"
            }
        ];

    return (
        <SettingsTab title="Elysium">
            <Forms.FormSection className={Margins.top16} title="Settings" tag="h5">
                {Switches.map(s => s && (
                    <Switch
                        key={s.key}
                        value={settings[s.key]}
                        onChange={v => settings[s.key] = v}
                        note={s.note}
                    >
                        {s.title}
                    </Switch>
                ))}
            </Forms.FormSection>
        </SettingsTab>
    );
}

export default wrapTab(ElysiumSettings, "Elysium Settings");

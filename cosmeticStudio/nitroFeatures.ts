interface BuiltinPlugin { settings?: {store: Record<string,unknown>}; }
export function enableBuiltinFeatures(names: string[], preferences: Record<string,Record<string,unknown>>, plugins: Record<string,BuiltinPlugin>, values: Record<string,Record<string,unknown>> = {}) {
    const enabled: string[] = [];
    for (const name of names) {
        if (!plugins[name] || !preferences[name]) continue;
        preferences[name].enabled = true;
        if (plugins[name].settings) Object.assign(plugins[name].settings!.store,values[name] ?? {});
        enabled.push(name);
    }
    return enabled;
}

export const fakeNitroOptions = {
    enableEmojiBypass:true, enableStickerBypass:true, transformEmojis:true, transformStickers:true,
    transformCompoundSentence:true, enableStreamQualityBypass:true
};
export const typingOptions = {
    TypingIndicator:{includeCurrentChannel:true,indicatorMode:3},
    TypingTweaks:{showAvatars:true,showRoleColors:true,alternativeFormatting:true}
};
export function profileThemeColors(primary: string, accent: string): [number,number] | null {
    if (![primary,accent].every(color=>/^#[a-f0-9]{6}$/i.test(color))) return null;
    return [parseInt(primary.slice(1),16),parseInt(accent.slice(1),16)];
}
export function encodeCompatibleTheme(primary: string, accent: string) {
    const colors = profileThemeColors(primary,accent);
    if (!colors) return "";
    const message = `[#${colors[0].toString(16).padStart(6,"0")},#${colors[1].toString(16).padStart(6,"0")}]`;
    return " " + Array.from(message,char=>String.fromCodePoint(char.codePointAt(0)!+0xe0000)).join("");
}

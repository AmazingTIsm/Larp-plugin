export interface GroupableBadge { id: string; description: string; icon: string; }

const familyNames: Record<string, string> = {
    nitro: "Nitro", boosts: "Server Booster", gifting: "Gifting", streaming: "Streaming",
    "account-age": "Account Age", "game-time": "Game Time", "game-variety": "Game Variety",
    "server-boost": "Server Boost Level", "bug-hunter": "Bug Hunter", "hypesquad-house": "HypeSquad House"
};

export function badgeFamily(badge: GroupableBadge) {
    const nativeFamily = /^(streaming|gifting|account_age|game_time|game_variety)(?:_|$)/.exec(badge.id);
    if (nativeFamily) return nativeFamily[1].replaceAll("_", "-");
    if (/^premium(?:_|$)/.test(badge.id) && !badge.id.includes("early_supporter")) return "nitro";
    if (badge.id.startsWith("guild_booster_lvl")) return "boosts";
    if (badge.icon.startsWith("subscriptions/")) return "nitro";
    if (/^server\/boost-/.test(badge.icon)) return "server-boost";
    if (/^bug_hunter/.test(badge.id)) return "bug-hunter";
    if (/^hypesquad_(?:online_)?house_/.test(badge.id)) return "hypesquad-house";
    const folder = badge.icon.split("/")[0];
    return familyNames[folder] ? folder : badge.id;
}

export function isProfileBadge(badge: GroupableBadge) {
    if (/^(fame|guilds|server|special)\//.test(badge.icon)) return false;
    return !/^(automod\.svg|premium-bot\.png|supports-commands\.svg|last-meadow\.png|discord-nitro-basic\.svg)$/.test(badge.icon);
}

export function nativeBadgeDirectoryId(badge: GroupableBadge) {
    const family = badgeFamily(badge);
    const families: Record<string,number> = {nitro:1,boosts:12,gifting:17,"account-age":18,streaming:19,"game-time":20,"game-variety":21};
    if (families[family]) return families[family];
    const ids: Record<string,number> = {staff:22,partner:2,certified_moderator:3,hypesquad:4,hypesquad_house_1:5,hypesquad_house_2:6,hypesquad_house_3:7,bug_hunter_level_1:8,bug_hunter_level_2:9,verified_developer:10,early_supporter:11,legacy_username:13,quest:14,quest_completed:14,orb:16};
    return ids[badge.id];
}

export function localBadgeDirectoryEntry(badge: GroupableBadge, variants: GroupableBadge[], icon: string) {
    const badgeId = nativeBadgeDirectoryId(badge);
    if (badgeId == null) return;
    const key = badgeFamily(badge);
    const label = familyNames[key] ?? badge.description;
    const tierName = (entry: GroupableBadge) => entry.description.replace(/^.*?\s*\/\s*/, "").replace(new RegExp(`^${label}\\s*`, "i"), "").trim() || entry.description;
    return {
        badge_id: badgeId, name: label, description: badge.description,
        info_label: "Local preview", rarity: 1, owned: true, hidden: false, is_earnable: false,
        simple_icon_url: icon, complex_icon_static_url: icon,
        current_tier: variants.length > 1 ? badge.id : undefined,
        progress: [],
        tiers: variants.length > 1 ? variants.map(entry=>({key:entry.id,name:tierName(entry),requirements:[],simple_icon_url:entry.icon,complex_icon_static_url:entry.icon})) : []
    };
}

export function groupBadgeEntries<T extends GroupableBadge>(badges: T[], selectedIds: Set<string>) {
    const groups = new Map<string, { key: string; label: string; selected: T; variants: T[] }>();
    for (const badge of badges) {
        const key = badgeFamily(badge);
        const group = groups.get(key);
        if (!group) groups.set(key, { key, label: familyNames[key] ?? badge.description, selected: badge, variants: [badge] });
        else {
            if (!group.variants.some(b => b.icon === badge.icon)) group.variants.push(badge);
            if (selectedIds.has(badge.id)) group.selected = badge;
        }
    }
    return [...groups.values()];
}

export function nativeNitroBadge(years: number, icon: string, now = new Date()) {
    const months = Math.max(1, Math.min(1200, Math.round(years * 12)));
    const stages = [[1, "bronze"], [3, "silver"], [6, "gold"], [12, "platinum"], [24, "diamond"], [36, "emerald"], [60, "ruby"], [72, "opal"]] as const;
    const index = stages.findLastIndex(([threshold]) => months >= threshold);
    const stage = stages[index][1];
    const since = new Date(now);
    since.setUTCMonth(since.getUTCMonth() - months);
    const obtainedAt = since.toISOString();
    return {
        badge_id: 1, name: "Nitro", description: "Nitro subscriber", rarity: 1,
        owned: true, hidden: false, is_earnable: false,
        simple_icon_url: icon, complex_icon_static_url: icon,
        obtained_at: obtainedAt, current_tier: stage, next_tier: stages[index + 1]?.[1],
        tiers: stages.map(([threshold, key]) => ({ key, name: key[0].toUpperCase() + key.slice(1), requirements: [{ threshold }], simple_icon_url: icon })),
        progress: [{ current: months, threshold: stages[index + 1]?.[0] ?? months }]
    };
}

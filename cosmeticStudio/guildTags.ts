export const LOCAL_GUILD_TAG_ID = "0";

export function guildTagIcons(icons: Record<string,string>) {
    return Object.entries(icons).flatMap(([path,src]) => {
        const match = /^guilds\/(\d+)\.svg$/.exec(path);
        return match ? [{id:`local-guild:${match[1]}`,name:`Icon ${match[1]}`,src,number:Number(match[1])}] : [];
    }).sort((a,b)=>a.number-b.number);
}

export function resolveLocalGuildTagIcon(guildId: string, badge: string, icons: Record<string,string>) {
    if (guildId !== LOCAL_GUILD_TAG_ID) return;
    const match = /^local-guild:(\d+)$/.exec(badge);
    return match ? icons[`guilds/${match[1]}.svg`] : undefined;
}

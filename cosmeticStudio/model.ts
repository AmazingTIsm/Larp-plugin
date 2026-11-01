import {LOCAL_GUILD_TAG_ID} from "./guildTags";

export interface NameStyle {font_id:number;effect_id:number;colors:number[];}
export function makeNameStyle(font:number,effect:number,color:string):NameStyle {
    return {
        font_id:Number.isFinite(font)?Math.max(0,Math.min(1000,Math.trunc(font))):0,
        effect_id:Number.isFinite(effect)?Math.max(0,Math.min(1000,Math.trunc(effect))):0,
        colors:[/^#[a-f0-9]{6}$/i.test(color)?parseInt(color.slice(1),16):0xb6a0ff]
    };
}

export function nitroPreview(years:number,now=new Date()) {
    const months=Math.max(1,Math.min(1200,Math.round(years*12)));
    const tiers:[[number,string],...Array<[number,string]>]=[[72,"opal"],[60,"ruby"],[36,"emerald"],[24,"diamond"],[12,"platinum"],[6,"gold"],[3,"silver"],[1,"bronze"]];
    const stage=tiers.find(([minimum])=>months>=minimum)![1];
    const since=new Date(now);since.setUTCMonth(since.getUTCMonth()-months);
    return {id:"premium_"+stage,since:since.toISOString(),months};
}
export function localGuildTag(tag:string,guildId:string,badge:string){
    if(!tag.trim())return null;
    const localIcon = /^local-guild:\d+$/.test(badge);
    if(!localIcon&&!/^\d{15,22}$/.test(guildId))return null;
    return {tag:Array.from(tag.trim()).slice(0,4).join(""),identityGuildId:localIcon?LOCAL_GUILD_TAG_ID:guildId,identityEnabled:true,badge:badge.trim()||null};
}

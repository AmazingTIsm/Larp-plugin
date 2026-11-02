export const rpcFields = ["appID","appName","details","detailsURL","state","stateURL","type","streamLink","timestampMode","startTime","endTime","imageBig","imageBigURL","imageBigTooltip","imageSmall","imageSmallURL","imageSmallTooltip","buttonOneText","buttonOneURL","buttonTwoText","buttonTwoURL","partySize","partyMaxSize"] as const;
export interface RpcPreset {name:string;values:Record<string,string|number>;}
export function snapshotRpc(values: Record<string,unknown>) {
    const snapshot: Record<string,string|number> = {};
    for (const key of rpcFields) {
        const value=values[key];
        if (typeof value==="string" || (typeof value==="number" && Number.isFinite(value))) snapshot[key]=value;
    }
    return snapshot;
}
export function loadRpcPreset(target: Record<string,unknown>, preset: RpcPreset) {
    const values=snapshotRpc(preset.values);
    for (const key of rpcFields) target[key]=values[key];
}
export function rpcDuration(minutes: number, countdown: boolean, now=Date.now()) {
    if (!Number.isFinite(minutes) || minutes<0 || minutes>52560000) throw new Error("Enter a duration between 0 and 52,560,000 minutes.");
    const duration=Math.round(minutes*60000);
    return {timestampMode:3,startTime:countdown?now:now-duration,endTime:countdown?now+duration:undefined};
}

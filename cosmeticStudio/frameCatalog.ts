export interface FrameEntry {
    skuId:string;
    name:string;
    previewUrl:string;
    frame:Record<string,unknown>;
}
export function collectProfileFrames(input:unknown):FrameEntry[]{
    const entries=new Map<string,FrameEntry>();
    const seen=new Set<object>();
    function visit(value:unknown,parentSku="",parentName="",parentPreview=""){
        if(!value||typeof value!=="object"||seen.has(value))return;
        seen.add(value);
        if(value instanceof Map){for(const child of value.values())visit(child);return;}
        if(Array.isArray(value)){for(const child of value)visit(child,parentSku,parentName,parentPreview);return;}
        const record=value as Record<string,unknown>;
        const sku=String(record.skuId??record.sku_id??parentSku);
        const name=String(record.name??record.label??parentName??"Profile frame")||"Profile frame";
        const assets=record.assets as Record<string,unknown>|undefined;
        const preview=String(assets?.static_image_url??assets?.staticImageUrl??record.thumbnailPreviewSrc??record.thumbnail_preview_src??record.previewUrl??parentPreview);
        if(record.type===3&&sku&&!Array.isArray(record.items)){
            const frame:Record<string,unknown>={...record,skuId:sku,type:3,expiresAt:null};
            for(const [camel,snake] of [["innerWidth","inner_width"],["overflowTop","overflow_top"],["overflowBottom","overflow_bottom"],["overflowHorizontal","overflow_horizontal"]]){
                if(record[camel]===undefined&&record[snake]!==undefined)(frame as Record<string,unknown>)[camel]=record[snake];
            }
            const existing=entries.get(sku);
            if(!existing||Array.isArray(frame.layers))entries.set(sku,{skuId:sku,name,previewUrl:preview||`https://cdn.discordapp.com/media/v1/collectibles-shop/${sku}/static`,frame});
        }
        for(const key of ["items","products","product","categories","collections","variants","bundledProducts","bundled_products"])visit(record[key],sku,name,preview);
    }
    visit(input);
    return [...entries.values()];
}
export function mergeFrameEntries(...lists:FrameEntry[][]):FrameEntry[]{
    const entries=new Map<string,FrameEntry>();
    for(const list of lists)for(const entry of list)entries.set(entry.skuId,entry);
    return [...entries.values()];
}

export function completeProfileFrame(frame:Record<string,unknown>){
    return frame.type===3&&Array.isArray(frame.layers)&&frame.layers.length>0&&frame.layers.every(layer=>layer&&typeof layer==="object"&&typeof layer.id==="string"&&layer.type!=null&&layer.order!=null&&layer.anchor!=null)&&["innerWidth","overflowTop","overflowBottom","overflowHorizontal"].every(key=>typeof frame[key]==="number"&&Number.isFinite(frame[key]));
}

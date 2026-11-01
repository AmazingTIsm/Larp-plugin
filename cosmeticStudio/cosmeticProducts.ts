export function typedCosmeticItem(product:Record<string,unknown>|undefined,type:number){
    const items=Array.isArray(product?.items)?product.items as Record<string,unknown>[]:[];
    return items.find(item=>item?.type===type||(item?.type==null&&product?.type===type))??null;
}
export function resolveAvatarSelection(value:unknown,lookup:(sku:string)=>Record<string,unknown>|undefined){
    if(value===null)return null;
    if(!value||typeof value!=="object")throw new Error("No avatar decoration selected.");
    const selection=value as Record<string,unknown>;
    const skuId=String(selection.skuId??selection.sku_id??"");
    if(!skuId)throw new Error("This decoration has no product ID.");
    const product=lookup(skuId);
    const catalogItem=typedCosmeticItem(product,0);
    const item=catalogItem??(typeof selection.asset==="string"&&selection.asset?selection:null);
    if(!item||typeof item.asset!=="string"||!item.asset)throw new Error("Could not resolve this decoration's exact asset. Reload the catalog and try again.");
    return {...selection,...item,skuId,asset:item.asset,...(catalogItem?{previewUrl:undefined}:{})};
}

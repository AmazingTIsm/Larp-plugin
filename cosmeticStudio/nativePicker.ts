export interface CosmeticProduct { skuId: string; type?: number; items?: unknown[]; [key: string]: unknown; }
export interface PurchaseStore {
    getPurchase(skuId: string): CosmeticProduct | undefined;
    getPurchases(skuIds: string[]): CosmeticProduct[];
    purchases: Map<string, CosmeticProduct>;
}
export function installLocalPurchasePreview(store: PurchaseStore, products: () => Map<string,CosmeticProduct>, enabled: () => boolean) {
    const originalGet=store.getPurchase;
    const originalMany=store.getPurchases;
    const ownDescriptor=Object.getOwnPropertyDescriptor(store,"purchases");
    let proto=Object.getPrototypeOf(store), descriptor=ownDescriptor;
    while(!descriptor&&proto){descriptor=Object.getOwnPropertyDescriptor(proto,"purchases");proto=Object.getPrototypeOf(proto);}
    const readReal=()=>descriptor?.get?descriptor.get.call(store):(descriptor?.value??new Map());
    const cache=new WeakMap<object,CosmeticProduct>();
    const preview=(product:CosmeticProduct)=>{
        if(!cache.has(product))cache.set(product,Object.assign(Object.create(Object.getPrototypeOf(product)),product,{localPreviewOnly:true,purchasedAt:new Date(0)}));
        return cache.get(product)!;
    };
    const getProduct=(id:string)=>{const product=products().get(id);return product&&[0,1,2,3].some(type=>product.type===type||(product.items as {type?:number}[]|undefined)?.some(item=>item.type===type))?preview(product):undefined;};
    store.getPurchase=function(id){return originalGet.call(this,id)??(enabled()?getProduct(id):undefined);};
    store.getPurchases=function(ids){return enabled()?ids.map(id=>this.getPurchase(id)).filter((p):p is CosmeticProduct=>!!p):originalMany.call(this,ids);};
    let previousReal:Map<string,CosmeticProduct>|undefined, previousProducts:Map<string,CosmeticProduct>|undefined, previousSize=-1, merged:Map<string,CosmeticProduct>;
    Object.defineProperty(store,"purchases",{configurable:true,get(){
        const real=readReal();if(!enabled())return real;
        const catalog=products();
        if(real!==previousReal||catalog!==previousProducts||catalog.size!==previousSize){
            merged=new Map(real);for(const id of catalog.keys()){const item=getProduct(id);if(item&&!merged.has(id))merged.set(id,item);}
            previousReal=real;previousProducts=catalog;previousSize=catalog.size;
        }
        return merged;
    }});
    return ()=>{store.getPurchase=originalGet;store.getPurchases=originalMany;if(ownDescriptor)Object.defineProperty(store,"purchases",ownDescriptor);else delete (store as Partial<PurchaseStore>).purchases;};
}
export const cosmeticKeys=["avatarDecoration","profileEffect","nameplate","profileFrame","themeColors","customTypingIndicatorStyle"] as const;
export function consumeLocalCosmetics(input:Record<string,unknown>, apply:(key:typeof cosmeticKeys[number],value:unknown)=>void){
    const rest={...input};
    for(const key of cosmeticKeys)if(Object.hasOwn(rest,key)){if(rest[key]!==undefined)apply(key,rest[key]);delete rest[key];}
    return Object.keys(rest).every(key=>key==="guildId")?null:rest;
}

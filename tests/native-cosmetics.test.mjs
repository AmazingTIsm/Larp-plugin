import test from 'node:test';
import assert from 'node:assert/strict';
import {installLocalPurchasePreview,consumeLocalCosmetics} from '../src/userplugins/cosmeticStudio/nativePicker.ts';
import {nitroPreview,localGuildTag} from '../src/userplugins/cosmeticStudio/model.ts';
import {validateLocalImage,readLocalImage} from '../src/userplugins/cosmeticStudio/localImages.ts';
import {groupBadgeEntries,nativeNitroBadge,isProfileBadge} from '../src/userplugins/cosmeticStudio/badgeGroups.ts';

test('profile badge catalog excludes server, bot, guild-tag and miscellaneous artwork',()=>{
 for(const icon of ['server/boost-1.svg','guilds/1.svg','special/bot.svg','fame/wumpus.png','automod.svg','supports-commands.svg','premium-bot.png'])assert.equal(isProfileBadge({id:'catalog',description:'',icon}),false,icon);
 for(const icon of ['streaming/star.svg','game-time/casual.svg','game-variety/explorer.svg','gifting/legend.png','account-age/bud.svg','subscriptions/badges/opal.png','boosts/discord-boost-9.svg'])assert.equal(isProfileBadge({id:'catalog',description:'',icon}),true,icon);
});

test('stage variants collapse into one streaming, Nitro, gifting and boost entry',()=>{
 const badges=[
  {id:'stream1',description:'Streaming / Newcomer',icon:'streaming/newcomer.svg'},
  {id:'stream2',description:'Streaming / Star',icon:'streaming/star.svg'},
  {id:'premium',description:'Nitro',icon:'subscriptions/badges/bronze.png'},
  {id:'premium_bronze',description:'Bronze',icon:'subscriptions/badges/bronze.png'},
  {id:'premium_opal',description:'Opal',icon:'subscriptions/badges/opal.png'},
  {id:'guild_booster_lvl1',description:'Boost 1',icon:'boosts/1.svg'},
  {id:'guild_booster_lvl9',description:'Boost 9',icon:'boosts/9.svg'},
  {id:'gift1',description:'Gift 1',icon:'gifting/1.png'},
  {id:'gift2',description:'Gift 2',icon:'gifting/2.png'},
  {id:'early_supporter',description:'Early Supporter',icon:'early.svg'}];
 const groups=groupBadgeEntries(badges,new Set(['stream2','premium_opal']));
 assert.equal(groups.length,5);
 assert.equal(groups.find(g=>g.key==='streaming').selected.id,'stream2');
 assert.equal(groups.find(g=>g.key==='streaming').variants.length,2);
 assert.equal(groups.find(g=>g.key==='nitro').variants.length,2);
 assert.equal(groups.find(g=>g.key==='nitro').selected.id,'premium_opal');
});

test('native Nitro popup has the numeric native id, date, tier and progress',()=>{
 const badge=nativeNitroBadge(3,'local-icon',new Date('2026-11-01T12:00:00Z'));
 assert.equal(badge.badge_id,1);assert.equal(badge.current_tier,'emerald');
 assert.equal(badge.obtained_at,'2023-11-01T12:00:00.000Z');
 assert.equal(badge.tiers.find(t=>t.key===badge.current_tier).name,'Emerald');
 assert.equal(badge.next_tier,'ruby');assert.equal(badge.simple_icon_url,'local-icon');
 assert.deepEqual(badge.progress,[{current:36,threshold:60}]);
 assert.equal(nativeNitroBadge(10,'icon').next_tier,undefined);
});

test('native picker treats supported catalog cosmetics as locally available and restores original store',()=>{
 const realMap=new Map([['owned',{skuId:'owned',type:0}]]);
 const store={get purchases(){return realMap;},getPurchase(id){return realMap.get(id);},getPurchases(ids){return ids.flatMap(id=>realMap.has(id)?[realMap.get(id)]:[]);}};
 const original=store.getPurchase;
 const catalog=new Map([['frame',{skuId:'frame',type:3,items:[{type:3}]}],['nameplate',{skuId:'nameplate',type:2}],['subscription',{skuId:'subscription',type:100}]]);
 let enabled=true;
 const stop=installLocalPurchasePreview(store,()=>catalog,()=>enabled);
 assert.equal(store.getPurchase('frame').localPreviewOnly,true);
 assert.equal(store.getPurchase('subscription'),undefined);
 assert.equal(store.getPurchase('frame'),store.getPurchase('frame'));
 assert.equal(realMap.has('frame'),false);assert.equal(catalog.get('frame').localPreviewOnly,undefined);
 assert.equal(store.purchases.has('frame'),true);assert.equal(store.purchases,store.purchases);
 catalog.set('new',{skuId:'new',type:0});assert.equal(store.purchases.has('new'),true);
 enabled=false;assert.equal(store.purchases,realMap);assert.equal(store.getPurchase('frame'),undefined);
 stop();assert.equal(store.getPurchase,original);assert.equal(store.purchases,realMap);
});
test('native Apply consumes only cosmetic changes and leaves unrelated fields intact',()=>{
 const selected={skuId:'frame',type:3};const input={guildId:'guild',profileFrame:selected,bio:'unchanged'};const applied=[];
 assert.deepEqual(consumeLocalCosmetics(input,(...args)=>applied.push(args)),{guildId:'guild',bio:'unchanged'});
 assert.deepEqual(applied,[['profileFrame',selected]]);assert.equal(input.profileFrame,selected);
 assert.equal(consumeLocalCosmetics({profileFrame:null},()=>{}),null);
 let called=false;consumeLocalCosmetics({profileFrame:undefined},()=>called=true);assert.equal(called,false);
});
test('Nitro year selection follows actual subscription milestones and UTC dates',()=>{
 const now=new Date('2026-11-01T12:00:00Z');
 for(const [years,tier] of [[0,'bronze'],[.25,'silver'],[.5,'gold'],[1,'platinum'],[2,'diamond'],[3,'emerald'],[5,'ruby'],[6,'opal'],[10,'opal']])assert.equal(nitroPreview(years,now).id,'premium_'+tier);
 assert.equal(nitroPreview(3,now).since,'2023-11-01T12:00:00.000Z');
 assert.equal(localGuildTag('WUMP','123456789012345678','hash').identityEnabled,true);
 assert.equal(localGuildTag('WUMP','invalid',''),null);
});
test('local image picker reads image data without a network upload and rejects unsupported files',async()=>{
 assert.throws(()=>validateLocalImage({type:'image/svg+xml',size:100}));
 assert.throws(()=>validateLocalImage({type:'image/png',size:5*1024*1024}));
 const old=globalThis.FileReader;
 globalThis.FileReader=class {readAsDataURL(){this.result='data:image/png;base64,fixture';this.onload();}};
 try{assert.equal(await readLocalImage({type:'image/png',size:100}),'data:image/png;base64,fixture');}finally{globalThis.FileReader=old;}
});

test('frame catalog handles API categories, variants, bundles and native Map records',async()=>{
 const {collectProfileFrames,mergeFrameEntries}=await import('../src/userplugins/cosmeticStudio/frameCatalog.ts');
 const layer={id:'frame-layer',type:1,order:0,anchor:0};
 const a={sku_id:'111111111111111111',name:'Crystal',items:[{type:3,layers:[layer],inner_width:300,overflow_top:5,overflow_bottom:10,overflow_horizontal:15}]};
 const b={skuId:'222222222222222222',name:'Flames',type:3,items:[{type:3,layers:[layer],innerWidth:320,overflowTop:8,overflowBottom:9,overflowHorizontal:10}]};
 const body={categories:[{products:[{type:1000,bundled_products:[a],variants:[b]},{sku_id:'333333333333333333',type:0,items:[{type:0,asset:'avatar'}]}]}]};
 const frames=collectProfileFrames(body);assert.equal(frames.length,2);
 assert.equal(frames.find(f=>f.skuId===a.sku_id).frame.innerWidth,300);assert.equal(frames.find(f=>f.skuId===b.skuId).frame.innerWidth,320);
 assert.equal(collectProfileFrames(new Map([['b',b]])).length,1);
 assert.equal(mergeFrameEntries(frames,frames).length,2);
});

test('cosmetic types and variant assets never fall back to another cosmetic',async()=>{
 const {typedCosmeticItem,resolveAvatarSelection}=await import('../src/userplugins/cosmeticStudio/cosmeticProducts.ts');
 const avatar={skuId:'snow',type:0,items:[{type:0,asset:'snow-asset'}]};
 const frame={skuId:'frame',type:3,items:[{type:3,layers:[{id:'layer'}]}]};
 const effect={skuId:'effect',type:1,items:[{type:1,effects:[{id:'effect-layer'}]}]};
 assert.equal(typedCosmeticItem(avatar,1),null);assert.equal(typedCosmeticItem(frame,1),null);
 assert.equal(typedCosmeticItem(effect,1).type,1);
 const selected=resolveAvatarSelection({skuId:'snow',asset:'wrong-wizard-asset',previewUrl:'wrong-image'},()=>avatar);
 assert.equal(selected.asset,'snow-asset');assert.equal(selected.skuId,'snow');assert.equal(selected.previewUrl,undefined);
 assert.throws(()=>resolveAvatarSelection({skuId:'frame'},()=>frame));
});

import assert from "node:assert/strict";
import {createRequire} from "node:module";
import test from "node:test";
import {build} from "esbuild";

const common=`export const AuthenticationStore={getId:()=>"own"};
export const Constants={UserFlags:{}};
export const FluxDispatcher={dispatch:()=>{},subscribe:()=>{},unsubscribe:()=>{}};
export const GuildMemberStore={getMember:()=>null};
export const UserStore={getUser:()=>null,getCurrentUser:()=>null};
export const UserProfileStore={getUserProfile:()=>null};
export const IconUtils={getUserAvatarURL:()=>"real-avatar",getUserBannerURL:()=>"real-banner"};
export const DisplayProfileUtils={},UsernameUtils={},ReactDOM={},MessageStore={},Parser={parse:x=>x};
export const RestAPI={get:options=>globalThis.__csRestHandler?globalThis.__csRestHandler(options):Promise.resolve({body:{}})};
export const openModal=()=>"modal",closeModal=()=>{},Modal=()=>null,TextInput=()=>null,ScrollerThin=()=>null,TabBar={Item:()=>null};
export const useState=x=>globalThis.__csHooks?.useState(x)??[x,()=>{}],useRef=x=>({current:x}),useEffect=(fn)=>{globalThis.__csHooks?.useEffect(fn);},useMemo=f=>f(),useStateFromStores=(_,f)=>f(),showToast=()=>{};`;
const result=await build({entryPoints:["src/userplugins/cosmeticStudio/index.tsx"],bundle:true,write:false,platform:"node",format:"cjs",jsx:"transform",plugins:[{name:"discord-test-runtime",setup(b){
 b.onResolve({filter:/^@/},a=>({path:a.path,namespace:"stub"}));
 b.onLoad({filter:/.*/,namespace:"stub"},a=>{
  let contents;
  if(a.path==="@utils/types")contents='export default x=>x; export const OptionType={BOOLEAN:1,STRING:2,CUSTOM:3,COMPONENT:4,NUMBER:5};';
  else if(a.path==="@api/Settings")contents='export const Settings={plugins:globalThis.__csPrefs=Object.fromEntries(["FakeNitro","TypingIndicator","TypingTweaks","FakeProfileThemes","Decor","CustomRPC"].map(name=>[name,{enabled:false}]))}; export function definePluginSettings(def){return {store:Object.fromEntries(Object.entries(def).map(([k,v])=>[k,v.default])),use:()=>{}}}';
  else if(a.path==="@components/ErrorBoundary")contents='export default {wrap:f=>f};';
  else if(a.path==="@components/Button")contents='export const Button=()=>null;';
  else if(a.path==="@components/Text")contents='export const Text=()=>null;';
  else if(a.path==="@webpack/common")contents=common;
  else if(a.path==="@utils/react")contents='export const useIntersection=()=>[()=>{},!!globalThis.__csIntersection];';
  else if(a.path==="@api/PluginManager")contents='export const plugins=globalThis.__csPlugins=Object.fromEntries(["FakeNitro","TypingIndicator","TypingTweaks","FakeProfileThemes","Decor","CustomRPC"].map(name=>[name,{name,started:false,settings:{store:{}}}]));export function startPlugin(plugin){plugin.started=true;return true;} export const startDependenciesRecursive=()=>({restartNeeded:false,failures:[]});';
  else if(a.path==="@components/settings/tabs/plugins/PluginModal")contents='export const openPluginModal=()=>{};';
  else if(a.path==="@utils/discord")contents='export const copyWithToast=value=>{globalThis.__csCopied=value;};';
  else if(a.path==="@plugins/customRPC")contents='export const setRpc=async(disable)=>{(globalThis.__csRpcCalls??=[]).push(disable);};';
  else if(a.path==="@webpack")contents='export const findStore=()=>null,waitFor=()=>{},filters={byCode:()=>true},findByCodeLazy=()=>()=>"",findByPropsLazy=()=>({});';
  else throw Error("Unexpected module "+a.path);
  return {contents,loader:"js"};
 });
}}]});
const mod={exports:{}};
new Function("module","exports","require",result.outputFiles[0].text)(mod,mod.exports,createRequire(import.meta.url));
const plugin=mod.exports.default;
const store=plugin.settings.store;

test("Nitro, typing and existing sharing integrations configure the intended Vencord plugins",()=>{
 store.enabled=false;store.nativeLocalApply=false;
 plugin.enableNitroCustomization();assert.equal(store.enabled,true);assert.equal(store.nativeLocalApply,true);
 assert.equal(globalThis.__csPrefs.FakeNitro.enabled,true);
 assert.equal(globalThis.__csPlugins.FakeNitro.settings.store.transformCompoundSentence,true);
 assert.equal(globalThis.__csPlugins.FakeNitro.settings.store.disableEmbedPermissionCheck,undefined);
 plugin.enableTypingFeatures();assert.equal(globalThis.__csPrefs.TypingIndicator.enabled,true);assert.equal(globalThis.__csPrefs.TypingTweaks.enabled,true);
 assert.equal(globalThis.__csPlugins.TypingIndicator.settings.store.indicatorMode,3);
 plugin.enableSharedThemes();assert.equal(globalThis.__csPrefs.FakeProfileThemes.enabled,true);
 store.larpAvatarDecoration={skuId:'local',asset:'override'};store.hiddenAvatarDecoration=true;
 plugin.enableSharedDecor();assert.equal(globalThis.__csPrefs.Decor.enabled,true);assert.equal(store.larpAvatarDecoration,null);assert.equal(store.hiddenAvatarDecoration,false);
});

test("native local Apply consumes profile colors and custom typing styles without server fields",()=>{
 store.enabled=true;store.nativeLocalApply=true;
 assert.deepEqual(plugin.handleNativeSelection({themeColors:[0x123456,0xabcdef],customTypingIndicatorStyle:{id:'style'},bio:'Keep bio'}),{bio:'Keep bio'});
 assert.deepEqual(plugin.getLocalProfileTheme(),[0x123456,0xabcdef]);assert.equal(plugin.getLocalProfileTheme(),plugin.getLocalProfileTheme());
 const user={id:'own',themeColors:[0,0],typingIndicatorStyle:null};const own=plugin.withLarpUser(user);
 assert.deepEqual(own.themeColors,[0x123456,0xabcdef]);assert.deepEqual(own.typingIndicatorStyle,{id:'style'});
 assert.deepEqual(user.themeColors,[0,0]);assert.equal(user.typingIndicatorStyle,null);
 const other={...user,id:'other'};assert.equal(plugin.withLarpUser(other),other);
 plugin.handleNativeSelection({themeColors:null,customTypingIndicatorStyle:null});assert.equal(plugin.getLocalProfileTheme(),null);
 store.localTypingOverride=false;store.localTypingStyle=null;
});

test("RPC preset save is local and Apply updates the existing CustomRPC activity",async()=>{
 const rpc=globalThis.__csPlugins.CustomRPC.settings.store;
 Object.assign(rpc,{appName:'My activity',type:0,details:'Editing',token:'never save'});
 globalThis.__csRpcCalls=[];
 plugin.saveRpcPreset('Work');assert.equal(globalThis.__csRpcCalls.length,0);
 assert.equal(store.rpcPresets[0].values.appName,'My activity');assert.equal(store.rpcPresets[0].values.token,undefined);
 rpc.details='Updated';plugin.saveRpcPreset('Work');assert.equal(store.rpcPresets.length,1);
 assert.throws(()=>plugin.saveRpcPreset('   '));
 await plugin.applyCustomRpc();assert.deepEqual(globalThis.__csRpcCalls,[true,undefined]);
 assert.equal(globalThis.__csPrefs.CustomRPC.enabled,true);assert.equal(rpc.enablePresence,true);
 store.rpcPresets=[];
});

test("guild tag Apply uses every bundled guild icon without a server ID and remains local",()=>{
 store.enabled=true;
 const icons=plugin.getGuildTagIcons();assert.equal(icons.length,41);
 assert.equal(new Set(icons.map(icon=>icon.id)).size,41);
 assert.ok(icons.every(icon=>icon.src.startsWith('data:image/svg+xml;base64,')));
 const previous={tag:store.guildTagText,badge:store.guildTagBadge,id:store.guildTagId,enabled:store.guildTagEnabled};
 assert.equal(plugin.applyLocalGuildTag('TEST',icons[40].id),true);
 assert.equal(store.guildTagId,'');assert.equal(store.guildTagEnabled,true);
 const user={id:'own',primaryGuild:null};
 const local=plugin.withLarpUser(user).primaryGuild;
 assert.equal(local.tag,'TEST');assert.equal(local.identityGuildId,'0');assert.equal(local.badge,icons[40].id);
 assert.equal(user.primaryGuild,null);assert.equal(plugin.withLarpUser({...user,id:'other'}).primaryGuild,null);
 assert.equal(plugin.getLocalGuildTagIcon(local.identityGuildId,local.badge),icons[40].src);
 assert.equal(plugin.getLocalGuildTagIcon('123456789012345678',local.badge),undefined);
 assert.equal(plugin.applyLocalGuildTag('',icons[0].id),false);
 assert.equal(plugin.applyLocalGuildTag('TAG','local-guild:99999'),false);
 store.guildTagEnabled=false;assert.equal(plugin.getLocalGuildTagIcon('0',icons[40].id),undefined);
 Object.assign(store,{guildTagText:previous.tag,guildTagBadge:previous.badge,guildTagId:previous.id,guildTagEnabled:previous.enabled});
});

test("native clan-badge URL hook renders the bundled tag icon and preserves normal CDN paths",()=>{
 const replacement=plugin.patches.find(p=>p.find==='/clan-badges/').replacement;
 const regex=new RegExp(replacement.match.source.replaceAll(String.raw`\i`,String.raw`[A-Za-z_$][\w$]*`));
 const source='return function resolve(guild,badge){return "https://cdn.discordapp.com/clan-badges/"+guild+"/"+badge+".png"}';
 assert.ok(regex.test(source));
 const resolve=new Function('plugin',source.replace(regex,replacement.replace).replaceAll('$self','plugin'))(plugin);
 store.enabled=true;store.guildTagEnabled=true;
 assert.equal(resolve('0','local-guild:1'),plugin.getGuildTagIcons()[0].src);
 assert.equal(resolve('real-guild','real-hash'),'https://cdn.discordapp.com/clan-badges/real-guild/real-hash.png');
 store.guildTagEnabled=false;
});

test("badges have one registration route and repeated native profile merges stay unique",()=>{
 assert.equal(plugin.userProfileBadge,undefined);
 store.enabled=true;store.stackBadgeStages=false;
 store.addedBadges=['gifting_legend','premium_opal','catalog_streaming_star_svg'];
 let badges=plugin.mergeLarpDisplayBadges({userId:'own'},[{id:'staff'},{id:'staff'}]);
 for(let i=0;i<4;i++)badges=plugin.mergeLarpDisplayBadges({userId:'own'},[...badges,...badges]);
 assert.equal(badges.length,4);
 for(const id of ['staff',...store.addedBadges])assert.equal(badges.filter(b=>b.id===id).length,1,id);
 const other=[{id:'staff'},{id:'staff'}];assert.deepEqual(plugin.mergeLarpDisplayBadges({userId:'other'},other),other);
 store.addedBadges=[];
});

test("local badges use Discord's native popup when its discovery display flag is off",()=>{
 const replacement=plugin.patches.find(p=>p.find==='legacyBadgeId:').replacement[1];
 const regex=new RegExp(replacement.match.source.replaceAll(String.raw`\i`,String.raw`[A-Za-z_$][\w$]*`));
 const source='if(flag)return(0,runtime.jsx)(NativePopup,{shouldShow:!open,legacyBadgeId:badge.id,userId:profile?.userId});return "legacy-tooltip"';
 assert.ok(regex.test(source));
 const render=new Function('plugin','flag','runtime','NativePopup','open','badge','profile',source.replace(regex,replacement.replace).replaceAll('$self','plugin'));
 store.enabled=true;store.addedBadges=['gifting_legend'];
 const runtime={jsx:(component,props)=>({component,props})};
 const output=render(plugin,false,runtime,'native-popup',false,{id:'gifting_legend'},{userId:'own'});
 assert.equal(output.component,'native-popup');assert.equal(output.props.legacyBadgeId,'gifting_legend');
 assert.equal(render(plugin,false,runtime,'native-popup',false,{id:'gifting_legend'},{userId:'other'}),'legacy-tooltip');
 assert.equal(render(plugin,false,runtime,'native-popup',false,{id:'staff'},{userId:'own'}),'legacy-tooltip');
 store.enabled=false;assert.equal(render(plugin,false,runtime,'native-popup',false,{id:'gifting_legend'},{userId:'own'}),'legacy-tooltip');
 store.enabled=true;store.addedBadges=[];
});

test("selecting an evolving badge replaces its previous stage without changing other families",()=>{
 store.enabled=true;store.stackBadgeStages=true;
 store.addedBadges=['catalog_streaming_newcomer_svg','catalog_streaming_star_svg','premium_opal'];
 plugin.selectBadgeStage('catalog_streaming_headliner_svg');
 assert.deepEqual(store.addedBadges,['premium_opal','catalog_streaming_headliner_svg']);
 assert.equal(store.stackBadgeStages,false);
 plugin.selectBadgeStage('premium_diamond');
 assert.equal(store.nitroYears,2);
 assert.ok(!store.addedBadges.includes('premium_opal'));
 assert.ok(store.addedBadges.includes('catalog_streaming_headliner_svg'));
 store.addedBadges=[];store.nitroYears=-1;
});

test("Nitro directory overrides only the current user and native tier lookup consumes it",()=>{
 store.enabled=true;store.nitroYears=3;
 assert.equal(plugin.getLocalBadgeDirectoryId('premium_emerald'),1);
 assert.equal(plugin.getLocalBadgeDirectoryId('staff'),22);
 assert.equal(plugin.getLocalBadgeDirectoryBadge(1,'someone-else'),undefined);
 assert.equal(plugin.getLocalBadgeDirectoryBadge(12,'own'),undefined);
 const patch=plugin.patches.find(p=>p.find==='"BadgeDirectoryStore"').replacement;
 const regex=new RegExp(patch.match.source.replaceAll(String.raw`\i`,String.raw`[A-Za-z_$][\w$]*`));
 const input='return {getBadgeById(key,user){return {badge_id:key,name:"Original"}},getCurrentTier(key,user){const badge=this.getBadgeById(key,user);return badge.tiers?.find(t=>t.key===badge.current_tier)}}';
 const output=input.replace(regex,patch.replace).replaceAll('$self','plugin');
 const directory=new Function('plugin',output)(plugin);
 assert.equal(directory.getBadgeById(1,'own').badge_id,1);
 assert.equal(directory.getCurrentTier(1,'own').name,'Emerald');
 assert.equal(directory.getBadgeById(1,'other').name,'Original');
 store.nitroYears=-1;assert.equal(plugin.getLocalBadgeDirectoryBadge(1,'own'),undefined);
});

test("native popup resolves spoofed Nitro ids while preserving Discord's original badge mapping",()=>{
 const patch=plugin.patches.find(p=>p.find==='legacyBadgeId:').replacement[0];
 const regex=new RegExp(patch.match.source.replaceAll(String.raw`\i`,String.raw`[A-Za-z_$][\w$]*`));
 const source='let mapped=(0,resolver.lookup)(id),{badgeData:data}={};return mapped';
 const output=source.replace(regex,patch.replace).replaceAll('$self','plugin');
 assert.notEqual(output,source);
 const resolve=new Function('plugin','id','resolver',output);
 store.enabled=true;
 assert.equal(resolve(plugin,'premium_opal',{lookup:()=>undefined}),1);
 assert.equal(resolve(plugin,'staff',{lookup:()=>22}),22);
 store.enabled=false;assert.equal(resolve(plugin,'premium_opal',{lookup:()=>undefined}),undefined);store.enabled=true;
});

test("every evolving catalog family supports replacing its stage, including legacy Nitro art",async()=>{
 const {groupBadgeEntries}=await import('../src/userplugins/cosmeticStudio/badgeGroups.ts');
 const groups=groupBadgeEntries(plugin.getBadgeCatalog(),new Set());
 for(const family of ['nitro','boosts','gifting','streaming','account-age','game-time','game-variety','bug-hunter','hypesquad-house']) {
  const group=groups.find(g=>g.key===family);
  assert.ok(group?.variants.length>1,family);
  store.addedBadges=[];
  plugin.selectBadgeStage(group.variants[0].id);
  plugin.selectBadgeStage(group.variants.at(-1).id);
  assert.deepEqual(store.addedBadges,[group.variants.at(-1).id],family);
 }
 const legacy=plugin.getBadgeCatalog().find(b=>b.icon==='subscriptions/legacy/ruby.svg');
 plugin.selectBadgeStage(legacy.id);assert.equal(store.nitroYears,5);
 assert.equal(plugin.getLocalBadgeDirectoryId(legacy.id),1);
 const badge=plugin.getLocalBadgeDirectoryBadge(1,'own');
 assert.equal(badge.current_tier,'ruby');assert.ok(badge.simple_icon_url.startsWith('data:image/'));
 store.nitroYears=-1;store.addedBadges=[];
});

test("all evolving profile badges supply their selected tier to the native popup",()=>{
 for(const [id,directoryId] of [['gifting_legend',17],['catalog_account_age_bud_svg',18],['catalog_streaming_star_svg',19],['catalog_game_time_casual_svg',20]]) {
  store.addedBadges=[];plugin.selectBadgeStage(id);
  assert.equal(plugin.getLocalBadgeDirectoryId(id),directoryId,id);
  const entry=plugin.getLocalBadgeDirectoryBadge(directoryId,'own');
  assert.equal(entry.badge_id,directoryId);assert.equal(entry.current_tier,id);
  assert.ok(entry.tiers.some(t=>t.key===id));assert.ok(entry.simple_icon_url.startsWith('data:image/'));
  assert.equal(plugin.getLocalBadgeDirectoryBadge(directoryId,'other'),undefined);
 }
 store.addedBadges=[];
});

test("nameplate hook subscribes to settings and invalidates native memo for equip, hide and disable",()=>{
 const patch=plugin.patches.find(p=>p.find==='.collectibles?.nameplate)??');
 const source='return function hook({user:person,guildId:guild}){let member=null;return React.useMemo(()=>{if(null!=person)return(0,normalizer.WK)(member?.collectibles?.nameplate)??person.nameplate},[member,person])}';
 let output=source;
 for(const replacement of patch.replacement){const regex=new RegExp(replacement.match.source.replaceAll(String.raw`\i`,String.raw`[A-Za-z_$][\w$]*`));assert.ok(regex.test(output));output=output.replace(regex,replacement.replace);}
 output=output.replaceAll('$self','plugin');
 let cached,deps;
 const React={useMemo(fn,next){if(!deps||next.some((value,i)=>value!==deps[i])){cached=fn();deps=next;}return cached;}};
 const hook=new Function('plugin','React','normalizer',output)(plugin,React,{WK:x=>x});
 const person={id:'own',nameplate:{asset:'real'}};
 store.enabled=true;store.nativeLocalApply=true;
 plugin.handleNativeSelection({nameplate:{skuId:'one',asset:'first',palette:'crimson'}});
 assert.equal(hook({user:person}).asset,'first');
 plugin.handleNativeSelection({nameplate:{skuId:'two',asset:'second',palette:'crimson'}});
 assert.equal(hook({user:person}).asset,'second');
 plugin.handleNativeSelection({nameplate:null});assert.equal(hook({user:person}),null);
 store.enabled=false;assert.equal(hook({user:person}).asset,'real');
 assert.equal(hook({user:{id:'other',nameplate:{asset:'other'}}}).asset,'other');
 store.enabled=true;store.hiddenNameplate=false;store.larpNameplate=null;
});

test("only the current account receives name overrides, without modifying the original",()=>{
 store.enabled=true;store.customUsername="local-name";store.customDisplayName="Local display";
 const own={id:"own",username:"real",globalName:"Real display",avatarDecorationData:null,nameplate:null};
 const other={...own,id:"someone-else"};
 const wrapped=plugin.withLarpUser(own);
 assert.equal(wrapped.username,"local-name");assert.equal(wrapped.globalName,"Local display");
 assert.equal(own.username,"real");assert.equal(own.globalName,"Real display");
 assert.equal(plugin.withLarpUser(other),other);
 store.enabled=false;assert.equal(plugin.withLarpUser(own),own);store.enabled=true;
});
test("native name styles are stable, bounded and invalid colors fall back",()=>{
 store.nameStylesEnabled=true;store.nameFont=4;store.nameEffect=2;store.nameColor="#112233";
 const user={id:"own",username:"real",avatarDecorationData:null,nameplate:null};
 const a=plugin.withLarpUser(user);
 assert.deepEqual(a.displayNameStyles,{font_id:4,effect_id:2,colors:[0x112233]});
 assert.equal(a.displayNameStyles,a.displayNameStyles);
 store.nameFont=Infinity;store.nameEffect=-2;store.nameColor="bad";
 assert.deepEqual(plugin.withLarpUser(user).displayNameStyles,{font_id:0,effect_id:0,colors:[0xb6a0ff]});
});
test("all-stage mode keeps Nitro and boost stages while badge changes stay on the owner",async()=>{
 const {catalogBadges,bundledIcons}=await import("../src/userplugins/cosmeticStudio/badgeCatalog.ts");
 store.stackBadgeStages=true;
 store.addedBadges=plugin.getBadgeCatalog().map(b=>b.id);
 const badges=plugin.mergeLarpDisplayBadges({userId:"own"},[]);
 assert.ok(badges.some(b=>["premium","premium_bronze"].includes(b.id)));
 for(const id of ["premium_opal","guild_booster_lvl1","guild_booster_lvl9"])assert.ok(badges.some(b=>b.id===id),id);
 assert.ok(badges.length>=70);assert.ok(!badges.some(b=>b.id.startsWith("catalog_special_")||b.id.startsWith("catalog_server_")||b.id.startsWith("catalog_fame_")||b.id.startsWith("catalog_guilds_")));
 assert.ok(badges.every(b=>b.iconSrc?.startsWith("data:image/")));
 const other=[{id:"real-badge"}];assert.deepEqual(plugin.mergeLarpDisplayBadges({userId:"other"},other),other);
 assert.equal(Object.keys(bundledIcons).length,182);
 store.addedBadges=[];assert.deepEqual(plugin.mergeLarpDisplayBadges({userId:"own"},[]),[]);
});

test("guild display-name styles remain local, stable, and owner-scoped",()=>{
 store.enabled=true;store.nameStylesEnabled=true;store.customDisplayName="Local nickname";
 const member={nick:"Original",displayNameStyles:null};
 const result=plugin.withLocalMember(member,"own");
 assert.equal(result.nick,"Local nickname");assert.equal(member.nick,"Original");
 assert.equal(plugin.withLocalMember(member,"own"),result);
 assert.equal(plugin.withLocalMember(member,"other"),member);
});

test("existing native custom fonts survive name color/effect overrides",()=>{
 store.enabled=true;store.nameStylesEnabled=true;store.preserveNameFont=true;store.nameFont=0;
 const user={id:"own",username:"real",avatarDecorationData:null,nameplate:null,displayNameStyles:{font_id:7,effect_id:0,colors:[123]}};
 assert.equal(plugin.withLarpUser(user).displayNameStyles.font_id,7);
 const member={nick:"Original",displayNameStyles:{font_id:9,effect_id:0,colors:[123]}};
 assert.equal(plugin.withLocalMember(member,"own").displayNameStyles.font_id,9);
});
test("guild tag and local image overrides do not change other users",()=>{
 store.enabled=true;store.guildTagEnabled=true;store.guildTagText="WUMP";store.guildTagId="123456789012345678";store.guildTagBadge="asset";
 store.localAvatarImage="data:image/png;base64,fixture";
 const user={id:"own",username:"real",avatarDecorationData:null,nameplate:null,primaryGuild:null};
 const local=plugin.withLarpUser(user);
 assert.equal(local.primaryGuild.tag,"WUMP");assert.equal(local.getAvatarURL(),store.localAvatarImage);
 assert.equal(user.primaryGuild,null);
 const other={...user,id:"other"};assert.equal(plugin.withLarpUser(other),other);
});

test("scroll sentinel reveals successive decoration pages and stops at catalog end",()=>{
 const oldReact=globalThis.React;
 globalThis.React={createElement:(type,props,...children)=>({type,props:{...props,children:children.length===1?children[0]:children}})};
 const items=Array.from({length:39},(_,i)=>({skuId:String(i),name:"Item "+i,previewUrl:""}));
 let count,intersection=false;
 globalThis.__csHooks={useState:initial=>{count??=initial;return[count,next=>{count=typeof next==="function"?next(count):next;}];},useEffect:fn=>fn()};
 const render=()=>plugin.renderProgressiveDecorations({items,children:visible=>visible.map(item=>item.skuId)});
 const nodes=tree=>{const result=[];const walk=node=>{if(!node||typeof node!=="object")return;if(Array.isArray(node)){node.forEach(walk);return;}result.push(node);walk(node.props?.children);};walk(tree);return result;};
 try{
  let tree=render();assert.equal(tree.props.children[0].length,16);
  let sentinel=nodes(tree).find(node=>node.props?.onReveal);
  globalThis.__csIntersection=false;sentinel.type(sentinel.props);assert.equal(count,16);
  globalThis.__csIntersection=true;sentinel.type(sentinel.props);tree=render();assert.equal(tree.props.children[0].length,32);
  sentinel=nodes(tree).find(node=>node.props?.onReveal);sentinel.type(sentinel.props);tree=render();
  assert.equal(tree.props.children[0].length,39);assert.equal(nodes(tree).some(node=>node.props?.onReveal),false);
 }finally{globalThis.React=oldReact;delete globalThis.__csHooks;delete globalThis.__csIntersection;}
});

test("native pending-changes patch matches renamed function identifiers",()=>{
 const patch=plugin.patches.find(p=>p.find==='"globalName"in');
 const normalized=new RegExp(patch.replacement.match.source.replaceAll(String.raw`\i`,String.raw`[A-Za-z_$][\w$]*`));
 for(const source of ['function change(input){let{guildId:g,...n}=input;if("globalName"in n)return n;}','function z(q){let{guildId:a,...b}=q;if("globalName"in b)return b;}']){
  const result=source.replace(normalized,patch.replacement.replace);
  assert.ok(result.includes('$self.handleNativeSelection('));assert.ok(result.includes('==null)return;'));
 }
});

test("frame browser fetches and recognizes actual type-3 catalog entries",async()=>{
 const requests=[];
 globalThis.__csRestHandler=async options=>{
  requests.push(options.url);
  return {body:{collections:[{products:[{sku_id:"123456789012345678",name:"Test frame",type:3,items:[{type:3,layers:[{id:"layer",type:1,order:0,anchor:0}],inner_width:320,overflow_top:12,overflow_bottom:6,overflow_horizontal:8}]}]}]}};
 };
 try{
  const frames=await plugin.fetchFrameCatalog();
  assert.equal(frames.length,1);assert.equal(frames[0].name,"Test frame");
  assert.equal(frames[0].frame.type,3);assert.equal(frames[0].frame.innerWidth,320);
  assert.deepEqual(requests,["/collectibles-categories/v2"]);
 }finally{delete globalThis.__csRestHandler;}
});

test("every decoration card keeps its explicit preview instead of the equipped item",()=>{
 const equipped={skuId:"wizard",asset:"wizard-hat"};
 const snow={skuId:"snow",asset:"snow-leopard"};
 const butterfly={skuId:"butterfly",asset:"butterfly"};
 assert.equal(plugin.resolveLarpAvatarDecorationValue(equipped,null,snow),snow);
 assert.equal(plugin.resolveLarpAvatarDecorationValue(equipped,null,butterfly),butterfly);
 assert.equal(plugin.resolveLarpAvatarDecorationValue(equipped,snow,null),null);
 assert.equal(plugin.resolveLarpAvatarDecorationValue(equipped,snow,undefined),equipped);
 assert.equal(plugin.resolveLarpAvatarDecorationValue({__larpRemoved:true},snow,snow),snow);
});
test("native decoration save omits the local selection from the server body",()=>{
 store.enabled=true;store.nativeLocalApply=true;
 const value={skuId:"123456789012345678",asset:"selected-asset"};
 const body={avatar_decoration_sku_id:plugin.getDecorationSaveSku(value),global_name:"Keep this edit"};
 assert.equal(store.larpAvatarDecoration.asset,"selected-asset");
 assert.equal(JSON.stringify(body),'{"global_name":"Keep this edit"}');
 store.nativeLocalApply=false;assert.equal(plugin.getDecorationSaveSku(value),value.skuId);store.nativeLocalApply=true;
 const patches=plugin.patches.filter(p=>p.find===".avatar_decoration_sku_id="||p.find==="avatar_decoration_sku_id:void");
 const samples=['body.avatar_decoration_sku_id=selected?.skuId??null','avatar_decoration_sku_id:void 0!==selected?selected?.skuId??null:void 0'];
 patches.forEach((patch,index)=>{const regex=new RegExp(patch.replacement.match.source.replaceAll(String.raw`\i`,String.raw`[A-Za-z_$][\w$]*`));assert.match(samples[index].replace(regex,patch.replacement.replace),/getDecorationSaveSku\(selected\)/);});
});

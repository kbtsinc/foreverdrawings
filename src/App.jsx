import { useState } from "react";

const CHILDREN = [
  { id:"c1", name:"Emma",  avatar_color:"#E8640A", avatar_emoji:"🎨", school_name:"Maple Street Elementary" },
  { id:"c2", name:"Liam",  avatar_color:"#2563EB", avatar_emoji:"🚀", school_name:"Maple Street Elementary" },
  { id:"c3", name:"Sofia", avatar_color:"#7C3AED", avatar_emoji:"🦋", school_name:"Riverside Pre-K" },
];
const TAGS = [
  { id:"t1",  name:"Kindergarten",  slug:"kindergarten",  color:"#7C3AED", icon:"⭐" },
  { id:"t2",  name:"1st Grade",     slug:"1st-grade",     color:"#2563EB", icon:"📚" },
  { id:"t3",  name:"2nd Grade",     slug:"2nd-grade",     color:"#0891B2", icon:"📚" },
  { id:"t4",  name:"Christmas",     slug:"christmas",     color:"#16A34A", icon:"🎄" },
  { id:"t5",  name:"Halloween",     slug:"halloween",     color:"#EA580C", icon:"🎃" },
  { id:"t6",  name:"Valentine",     slug:"valentine",     color:"#DB2777", icon:"❤️" },
  { id:"t7",  name:"Self Portrait", slug:"self-portrait", color:"#9333EA", icon:"🪞" },
  { id:"t8",  name:"Favorite",      slug:"favorite",      color:"#E8640A", icon:"⭐" },
  { id:"t9",  name:"Watercolor",    slug:"watercolor",    color:"#0284C7", icon:"🎨" },
  { id:"t10", name:"Spring",        slug:"spring",        color:"#65A30D", icon:"🌸" },
  { id:"t11", name:"Summer",        slug:"summer",        color:"#CA8A04", icon:"☀️" },
  { id:"t12", name:"Crayon",        slug:"crayon",        color:"#D97706", icon:"🖍️" },
];
const ALBUMS = [
  { id:"a1", child_id:"c1", name:"Best of Emma",   icon:"⭐", color:"#E8640A", count:6,  is_smart:false, cover:"https://picsum.photos/seed/art1/300/300" },
  { id:"a2", child_id:"c1", name:"1st Grade",      icon:"📚", color:"#2563EB", count:8,  is_smart:true,  cover:"https://picsum.photos/seed/art3/300/300", smart_rules:{tags:["1st-grade"]} },
  { id:"a3", child_id:"c1", name:"Christmas Art",  icon:"🎄", color:"#16A34A", count:3,  is_smart:true,  cover:"https://picsum.photos/seed/art5/300/300", smart_rules:{tags:["christmas"]} },
  { id:"a4", child_id:"c2", name:"Liam's Rockets", icon:"🚀", color:"#2563EB", count:4,  is_smart:false, cover:"https://picsum.photos/seed/art7/300/300" },
  { id:"a5", child_id:"c2", name:"Kindergarten",   icon:"⭐", color:"#7C3AED", count:5,  is_smart:true,  cover:"https://picsum.photos/seed/art9/300/300", smart_rules:{tags:["kindergarten"]} },
  { id:"a6", child_id:"c3", name:"Sofia Gallery",  icon:"🦋", color:"#7C3AED", count:3,  is_smart:false, cover:"https://picsum.photos/seed/art11/300/300" },
];
const mkA = (id,cid,title,tids,date,s) => ({ id, child_id:cid, title, tags:TAGS.filter(t=>tids.includes(t.id)), artwork_date:date, is_favorite:Math.random()>.6, url:`https://picsum.photos/seed/${s}/400/500` });
const ALL_ARTWORKS = [
  mkA("w1","c1","Sunshine Dragon",  ["t2","t8"],"2026-03-15","aa1"),
  mkA("w2","c1","Blue Horse",       ["t2"],     "2026-03-10","aa2"),
  mkA("w3","c1","My Family",        ["t2","t7"],"2026-02-28","aa3"),
  mkA("w4","c1","Christmas Tree",   ["t4","t2"],"2025-12-10","aa4"),
  mkA("w5","c1","Halloween Witch",  ["t5","t1"],"2025-10-30","aa5"),
  mkA("w6","c1","Valentine Heart",  ["t6","t1"],"2025-02-14","aa6"),
  mkA("w7","c1","Rainbow Cat",      ["t1","t9"],"2025-11-08","aa7"),
  mkA("w8","c1","Butterfly Garden", ["t10","t9"],"2026-01-18","aa8"),
  mkA("w9","c2","Space Rocket",     ["t1","t8"],"2026-03-05","aa9"),
  mkA("w10","c2","Big Red Truck",   ["t1"],     "2025-12-05","aa10"),
  mkA("w11","c2","Astronaut",       ["t1","t7"],"2025-11-22","aa11"),
  mkA("w12","c2","Christmas Star",  ["t4","t1"],"2025-12-20","aa12"),
  mkA("w13","c3","Purple Butterfly",["t12"],    "2026-02-10","aa13"),
  mkA("w14","c3","Mommy and Me",    ["t7","t12"],"2026-01-05","aa14"),
  mkA("w15","c3","Spring Flowers",  ["t10","t12"],"2025-04-15","aa15"),
];

const T = { bg:"#FAFAF8", white:"#FFFFFF", ink:"#1C1410", muted:"#7A6655", border:"#EAE0D8", orange:"#E8640A", shadow:"0 2px 14px rgba(28,20,16,0.07)", shadowMd:"0 6px 28px rgba(28,20,16,0.12)", ff:"'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif" };
const CHILD_COLORS=["#E8640A","#2563EB","#7C3AED","#059669","#DC2626","#D97706","#0891B2","#DB2777","#0F766E","#9333EA"];
const CHILD_EMOJIS=["🎨","🚀","🦋","🌟","🎭","🦄","🌈","🎸","⚽","🎯"];
const TAG_COLORS=["#E8640A","#2563EB","#7C3AED","#059669","#DC2626","#D97706","#0891B2","#DB2777","#16A34A","#EA580C"];
const ICONS_LIST=["📁","⭐","🎨","📚","🎄","🎃","❤️","🌸","🚀","🦋","🏆","🌈"];
const TAG_ICONS=["⭐","📚","🎄","🎃","❤️","🌸","☀️","🦃","🪞","🎨","🖍️","🚀","🦋","🎭","⚽","🎸"];
const delay = ms => new Promise(r=>setTimeout(r,ms));

function Btn({children,onClick,variant="primary",small,disabled,style={}}) {
  const v={primary:{bg:T.orange,color:"#fff",shadow:"0 3px 12px rgba(232,100,10,0.28)"},secondary:{bg:T.ink,color:"#fff",shadow:"none"},outline:{bg:"transparent",color:T.muted,shadow:"none",border:`1.5px solid ${T.border}`},ghost:{bg:"transparent",color:T.orange,shadow:"none"}}[variant];
  return <button onClick={disabled?undefined:onClick} style={{fontFamily:T.ff,fontWeight:700,border:v.border||"none",cursor:disabled?"default":"pointer",borderRadius:30,padding:small?"7px 15px":"11px 20px",fontSize:small?12:14,opacity:disabled?.5:1,background:v.bg,color:v.color,boxShadow:v.shadow,transition:"all .15s",...style}}>{children}</button>;
}
function Modal({children,onClose,title,wide}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(28,20,16,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:20,padding:32,width:"100%",maxWidth:wide?680:480,maxHeight:"90vh",overflowY:"auto",boxShadow:T.shadowMd}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{margin:0,fontSize:20,color:T.ink,fontFamily:T.ff,fontWeight:900}}>{title}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:T.muted}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Input({label,value,onChange,placeholder,type="text"}) {
  return (
    <div style={{marginBottom:14}}>
      {label&&<label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:5,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>{label}</label>}
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
        style={{width:"100%",padding:"11px 13px",border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:14,fontFamily:T.ff,background:T.bg,color:T.ink,outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
}
function ChildAvatar({child,size=40,active}) {
  return <div style={{width:size,height:size,borderRadius:"50%",background:child.avatar_color+"22",border:`2.5px solid ${active?child.avatar_color:"transparent"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.44,flexShrink:0,transition:"all .2s",boxShadow:active?`0 0 0 3px ${child.avatar_color}33`:"none"}}>{child.avatar_emoji}</div>;
}
function TagPill({tag,onRemove,small,onClick}) {
  return <span onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:4,background:tag.color+"18",color:tag.color,borderRadius:20,padding:small?"3px 9px":"4px 11px",fontSize:small?11:12,fontWeight:700,fontFamily:T.ff,cursor:onClick?"pointer":"default",border:`1px solid ${tag.color}30`}}>{tag.icon&&<span style={{fontSize:small?10:11}}>{tag.icon}</span>}{tag.name}{onRemove&&<span onClick={e=>{e.stopPropagation();onRemove();}} style={{marginLeft:2,opacity:.6,cursor:"pointer",fontSize:11}}>✕</span>}</span>;
}

function AddChildModal({onClose,onAdd}) {
  const [name,setName]=useState(""); const [emoji,setEmoji]=useState("🎨"); const [color,setColor]=useState(CHILD_COLORS[0]); const [school,setSchool]=useState(""); const [dob,setDob]=useState(""); const [saving,setSaving]=useState(false);
  async function save(){if(!name.trim())return;setSaving(true);await delay(400);onAdd({id:`c${Date.now()}`,name:name.trim(),avatar_color:color,avatar_emoji:emoji,school_name:school,date_of_birth:dob});onClose();}
  return (
    <Modal onClose={onClose} title="Add a Child">
      <div style={{display:"flex",alignItems:"center",gap:14,background:T.bg,borderRadius:14,padding:"14px 18px",marginBottom:22}}>
        <div style={{width:54,height:54,borderRadius:"50%",background:color+"22",border:`3px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{emoji}</div>
        <div><div style={{fontWeight:900,fontSize:18,color:T.ink,fontFamily:T.ff}}>{name||"Child's name"}</div>{school&&<div style={{fontSize:12,color:T.muted,fontFamily:T.ff}}>{school}</div>}</div>
      </div>
      <Input label="Name" value={name} onChange={setName} placeholder="e.g. Emma"/>
      <Input label="School (optional)" value={school} onChange={setSchool} placeholder="e.g. Maple Street Elementary"/>
      <Input label="Date of birth (optional)" value={dob} onChange={setDob} type="date"/>
      <div style={{marginBottom:14}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>Avatar</label>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{CHILD_EMOJIS.map(e=><button key={e} onClick={()=>setEmoji(e)} style={{width:38,height:38,borderRadius:10,border:`2px solid ${emoji===e?color:T.border}`,background:emoji===e?color+"18":T.white,fontSize:20,cursor:"pointer"}}>{e}</button>)}</div>
      </div>
      <div style={{marginBottom:22}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>Color</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{CHILD_COLORS.map(c=><button key={c} onClick={()=>setColor(c)} style={{width:30,height:30,borderRadius:"50%",background:c,border:`3px solid ${color===c?T.ink:"transparent"}`,cursor:"pointer"}}/>)}</div>
      </div>
      <Btn onClick={save} disabled={!name.trim()||saving} style={{width:"100%",borderRadius:12}}>{saving?"Adding…":"Add Child"}</Btn>
    </Modal>
  );
}

function TagManagerModal({tags,onClose,onChange}) {
  const [local,setLocal]=useState(tags); const [newName,setNewName]=useState(""); const [newColor,setNewColor]=useState(TAG_COLORS[0]); const [newIcon,setNewIcon]=useState("");
  function addTag(){if(!newName.trim())return;setLocal(p=>[...p,{id:`t${Date.now()}`,name:newName.trim(),slug:newName.toLowerCase().replace(/[^a-z0-9]+/g,"-"),color:newColor,icon:newIcon||null}]);setNewName("");setNewIcon("");}
  return (
    <Modal onClose={()=>{onChange(local);onClose();}} title="Manage Tags" wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div>
          <p style={{fontSize:12,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.4px",margin:"0 0 12px",fontFamily:T.ff}}>Your Tags ({local.length})</p>
          <div style={{maxHeight:380,overflowY:"auto"}}>
            {local.map(tag=>(
              <div key={tag.id} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:tag.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{tag.icon||"🏷️"}</div>
                <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:T.ink,fontFamily:T.ff}}>{tag.name}</div></div>
                <div style={{display:"flex",gap:4}}>{TAG_COLORS.slice(0,5).map(c=><div key={c} onClick={()=>setLocal(p=>p.map(t=>t.id===tag.id?{...t,color:c}:t))} style={{width:16,height:16,borderRadius:"50%",background:c,cursor:"pointer",border:`2px solid ${tag.color===c?T.ink:"transparent"}`}}/>)}</div>
                <button onClick={()=>setLocal(p=>p.filter(t=>t.id!==tag.id))} style={{background:"none",border:"none",color:"#DC2626",cursor:"pointer",fontSize:15}}>🗑</button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p style={{fontSize:12,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.4px",margin:"0 0 12px",fontFamily:T.ff}}>Create New Tag</p>
          <Input label="Tag name" value={newName} onChange={setNewName} placeholder='"3rd Grade" or "Easter"'/>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>Icon</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{TAG_ICONS.map(ic=><button key={ic} onClick={()=>setNewIcon(newIcon===ic?"":ic)} style={{width:34,height:34,borderRadius:8,border:`2px solid ${newIcon===ic?newColor:T.border}`,background:newIcon===ic?newColor+"18":T.white,fontSize:18,cursor:"pointer"}}>{ic}</button>)}</div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>Color</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{TAG_COLORS.map(c=><button key={c} onClick={()=>setNewColor(c)} style={{width:28,height:28,borderRadius:"50%",background:c,border:`3px solid ${newColor===c?T.ink:"transparent"}`,cursor:"pointer"}}/>)}</div>
          </div>
          {newName&&<div style={{marginBottom:14}}><TagPill tag={{name:newName,color:newColor,icon:newIcon}}/></div>}
          <Btn onClick={addTag} disabled={!newName.trim()} style={{width:"100%",borderRadius:12}}>+ Create Tag</Btn>
        </div>
      </div>
      <div style={{marginTop:24,paddingTop:20,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"flex-end"}}>
        <Btn onClick={()=>{onChange(local);onClose();}} style={{borderRadius:12}}>Save Changes</Btn>
      </div>
    </Modal>
  );
}

function CreateAlbumModal({children,tags,childId,onClose,onCreate}) {
  const [name,setName]=useState(""); const [icon,setIcon]=useState("📁"); const [color,setColor]=useState(T.orange); const [selChild,setSelChild]=useState(childId||""); const [isSmart,setIsSmart]=useState(false); const [smartTags,setSmartTags]=useState([]);
  function toggleST(id){setSmartTags(p=>p.includes(id)?p.filter(t=>t!==id):[...p,id]);}
  function save(){if(!name.trim())return;onCreate({id:`a${Date.now()}`,name:name.trim(),icon,color,child_id:selChild||null,is_smart:isSmart,smart_rules:isSmart?{tags:smartTags}:null,count:0,cover:null});onClose();}
  return (
    <Modal onClose={onClose} title="New Album">
      <div style={{display:"flex",alignItems:"center",gap:14,background:color+"14",borderRadius:14,padding:"14px 18px",marginBottom:22,border:`1.5px solid ${color}30`}}>
        <div style={{width:48,height:48,borderRadius:12,background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{icon}</div>
        <div><div style={{fontWeight:900,fontSize:17,color:T.ink,fontFamily:T.ff}}>{name||"Album name"}</div><div style={{fontSize:12,color:T.muted,fontFamily:T.ff}}>{selChild?children.find(c=>c.id===selChild)?.name:"All children"}{isSmart?" · Smart Album":""}</div></div>
      </div>
      <Input label="Album name" value={name} onChange={setName} placeholder='"Best of 2026"'/>
      <div style={{marginBottom:14}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>For child</label>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          <button onClick={()=>setSelChild("")} style={{padding:"7px 14px",borderRadius:20,border:`1.5px solid ${!selChild?T.orange:T.border}`,background:!selChild?"#FFF5EE":T.white,color:!selChild?T.orange:T.muted,cursor:"pointer",fontSize:12,fontFamily:T.ff,fontWeight:700}}>All Children</button>
          {children.map(c=><button key={c.id} onClick={()=>setSelChild(c.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:20,border:`1.5px solid ${selChild===c.id?c.avatar_color:T.border}`,background:selChild===c.id?c.avatar_color+"18":T.white,color:selChild===c.id?c.avatar_color:T.muted,cursor:"pointer",fontSize:12,fontFamily:T.ff,fontWeight:700}}>{c.avatar_emoji} {c.name}</button>)}
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>Icon</label>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{ICONS_LIST.map(ic=><button key={ic} onClick={()=>setIcon(ic)} style={{width:36,height:36,borderRadius:9,border:`2px solid ${icon===ic?color:T.border}`,background:icon===ic?color+"18":T.white,fontSize:18,cursor:"pointer"}}>{ic}</button>)}</div>
      </div>
      <div style={{marginBottom:18}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>Color</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{TAG_COLORS.map(c=><button key={c} onClick={()=>setColor(c)} style={{width:28,height:28,borderRadius:"50%",background:c,border:`3px solid ${color===c?T.ink:"transparent"}`,cursor:"pointer"}}/>)}</div>
      </div>
      <div style={{background:T.bg,borderRadius:12,padding:"14px 16px",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:isSmart?14:0}}>
          <div><div style={{fontWeight:700,color:T.ink,fontSize:13,fontFamily:T.ff}}>✨ Smart Album</div><div style={{color:T.muted,fontSize:11,fontFamily:T.ff}}>Auto-fills based on tags</div></div>
          <button onClick={()=>setIsSmart(s=>!s)} style={{width:44,height:24,borderRadius:12,background:isSmart?T.orange:T.border,border:"none",cursor:"pointer",position:"relative",transition:"all .2s"}}>
            <div style={{width:18,height:18,borderRadius:"50%",background:"white",position:"absolute",top:3,left:isSmart?23:3,transition:"all .2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
          </button>
        </div>
        {isSmart&&<div style={{marginTop:4}}>
          <p style={{fontSize:11,color:T.muted,margin:"0 0 10px",fontFamily:T.ff}}>Auto-include artworks with any of these tags:</p>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{tags.map(tag=><button key={tag.id} onClick={()=>toggleST(tag.id)} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:20,border:`1.5px solid ${smartTags.includes(tag.id)?tag.color:T.border}`,background:smartTags.includes(tag.id)?tag.color+"18":T.white,color:smartTags.includes(tag.id)?tag.color:T.muted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:T.ff}}>{tag.icon} {tag.name}</button>)}</div>
        </div>}
      </div>
      <Btn onClick={save} disabled={!name.trim()} style={{width:"100%",borderRadius:12}}>Create Album</Btn>
    </Modal>
  );
}

function ArtworkTagEditor({artwork,tags,onSave,onClose}) {
  const [sel,setSel]=useState(new Set(artwork.tags?.map(t=>t.id)||[]));
  function toggle(id){setSel(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});}
  return (
    <Modal onClose={onClose} title={`Tags — "${artwork.title}"`}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:22}}>
        {tags.map(tag=>(
          <button key={tag.id} onClick={()=>toggle(tag.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:20,border:`1.5px solid ${sel.has(tag.id)?tag.color:T.border}`,background:sel.has(tag.id)?tag.color+"18":T.white,color:sel.has(tag.id)?tag.color:T.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.ff,transition:"all .15s"}}>
            {tag.icon&&<span>{tag.icon}</span>}{tag.name}{sel.has(tag.id)&&<span style={{fontSize:10}}>✓</span>}
          </button>
        ))}
      </div>
      <Btn onClick={()=>{onSave(artwork.id,[...sel]);onClose();}} style={{width:"100%",borderRadius:12}}>Save Tags</Btn>
    </Modal>
  );
}

function AlbumsGrid({albums,children,onOpen,onCreate,onDelete}) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(165px, 1fr))",gap:14}}>
      {albums.map(album=>{
        const child=children.find(c=>c.id===album.child_id);
        return (
          <div key={album.id} onClick={()=>onOpen(album)} style={{cursor:"pointer",borderRadius:16,overflow:"hidden",background:T.white,boxShadow:T.shadow,transition:"transform .2s",position:"relative"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{height:115,background:album.color+"22",position:"relative",overflow:"hidden"}}>
              {album.cover?<img src={album.cover} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:42}}>{album.icon}</div>}
              {album.is_smart&&<div style={{position:"absolute",top:7,right:7,background:"rgba(255,255,255,0.92)",borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,color:T.ink,fontFamily:T.ff}}>✨ Smart</div>}
              <button onClick={e=>{e.stopPropagation();onDelete(album.id);}} style={{position:"absolute",top:7,left:7,width:26,height:26,borderRadius:"50%",background:"rgba(255,255,255,0.88)",border:"none",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity .15s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="0"}>🗑</button>
            </div>
            <div style={{padding:"10px 12px"}}>
              <div style={{fontWeight:700,fontSize:13,color:T.ink,fontFamily:T.ff,marginBottom:3}}>{album.name}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:11,color:T.muted,fontFamily:T.ff}}>{album.count} artwork{album.count!==1?"s":""}</span>
                {child&&<span style={{fontSize:11,color:child.avatar_color,fontWeight:700,fontFamily:T.ff}}>{child.avatar_emoji} {child.name}</span>}
              </div>
            </div>
            <div style={{height:3,background:album.color}}/>
          </div>
        );
      })}
      <div onClick={onCreate} style={{cursor:"pointer",borderRadius:16,border:`2.5px dashed ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:160,transition:"all .2s",color:T.muted}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=T.orange;e.currentTarget.style.color=T.orange;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.muted;}}>
        <div style={{fontSize:28,marginBottom:6}}>+</div>
        <div style={{fontSize:12,fontWeight:700,fontFamily:T.ff}}>New Album</div>
      </div>
    </div>
  );
}

function ArtworkGrid({artworks,tags,onTagEdit}) {
  const [active,setActive]=useState([]);
  const filtered=active.length===0?artworks:artworks.filter(a=>active.every(slug=>a.tags?.some(t=>t.slug===slug)));
  const relevant=tags.filter(tag=>artworks.some(a=>a.tags?.some(t=>t.id===tag.id)));
  return (
    <div>
      {relevant.length>0&&(
        <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:18}}>
          {relevant.map(tag=>(
            <button key={tag.id} onClick={()=>setActive(p=>p.includes(tag.slug)?p.filter(s=>s!==tag.slug):[...p,tag.slug])} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:20,border:`1.5px solid ${active.includes(tag.slug)?tag.color:T.border}`,background:active.includes(tag.slug)?tag.color+"18":T.white,color:active.includes(tag.slug)?tag.color:T.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.ff,transition:"all .15s"}}>
              {tag.icon} {tag.name}
            </button>
          ))}
          {active.length>0&&<button onClick={()=>setActive([])} style={{padding:"5px 12px",borderRadius:20,border:"none",background:"none",color:T.muted,fontSize:12,cursor:"pointer",fontFamily:T.ff}}>Clear ✕</button>}
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(148px, 1fr))",gap:13}}>
        {filtered.map(art=>(
          <div key={art.id} style={{borderRadius:16,overflow:"hidden",background:T.white,boxShadow:T.shadow,cursor:"pointer"}}>
            <div style={{aspectRatio:"4/5",position:"relative",overflow:"hidden"}}>
              <img src={art.url} alt={art.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 55%, rgba(20,12,8,0.75))",pointerEvents:"none"}}/>
              <div style={{position:"absolute",bottom:8,left:8,right:8}}>
                <div style={{color:"white",fontSize:11,fontWeight:700,fontFamily:T.ff,marginBottom:4}}>{art.title}</div>
                <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                  {art.tags?.slice(0,2).map(tag=><span key={tag.id} style={{background:tag.color,color:"white",borderRadius:20,padding:"1px 7px",fontSize:9,fontWeight:700,fontFamily:T.ff}}>{tag.icon} {tag.name}</span>)}
                </div>
              </div>
              {art.is_favorite&&<div style={{position:"absolute",top:8,left:8,fontSize:14}}>❤️</div>}
              <button onClick={e=>{e.stopPropagation();onTagEdit(art);}} style={{position:"absolute",top:8,right:8,background:"rgba(255,255,255,0.88)",border:"none",borderRadius:20,padding:"3px 8px",fontSize:11,cursor:"pointer",fontFamily:T.ff,fontWeight:700}}>🏷</button>
            </div>
          </div>
        ))}
        {filtered.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"48px 20px",color:T.muted,fontFamily:T.ff}}><div style={{fontSize:44,marginBottom:12}}>🔍</div><p>No artworks match these tags.</p></div>}
      </div>
    </div>
  );
}

export default function App() {
  const [children,setChildren]=useState(CHILDREN);
  const [tags,setTags]=useState(TAGS);
  const [albums,setAlbums]=useState(ALBUMS);
  const [artworks,setArtworks]=useState(ALL_ARTWORKS);
  const [activeChild,setActiveChild]=useState("all");
  const [activeTab,setActiveTab]=useState("gallery");
  const [showAddChild,setShowAddChild]=useState(false);
  const [showTagMgr,setShowTagMgr]=useState(false);
  const [showNewAlbum,setShowNewAlbum]=useState(false);
  const [tagEditArt,setTagEditArt]=useState(null);
  const [openAlbum,setOpenAlbum]=useState(null);

  const visibleArtworks=activeChild==="all"?artworks:artworks.filter(a=>a.child_id===activeChild);
  const visibleAlbums=activeChild==="all"?albums:albums.filter(a=>a.child_id===activeChild||!a.child_id);
  const activeChildObj=children.find(c=>c.id===activeChild);

  function handleTagSave(artworkId,tagIds){setArtworks(p=>p.map(a=>a.id===artworkId?{...a,tags:tags.filter(t=>tagIds.includes(t.id))}:a));}

  function handleAlbumOpen(album){
    let arts=[];
    if(album.is_smart&&album.smart_rules?.tags){
      const slugs=album.smart_rules.tags;
      arts=artworks.filter(a=>(album.child_id?a.child_id===album.child_id:true)&&a.tags?.some(t=>slugs.includes(t.slug)));
    } else {
      arts=artworks.filter(a=>album.child_id?a.child_id===album.child_id:true).slice(0,album.count||6);
    }
    setOpenAlbum({...album,artworks:arts});
  }

  return (
    <div style={{background:T.bg,minHeight:"100vh",fontFamily:T.ff}}>
      {/* Header */}
      <div style={{background:T.white,boxShadow:T.shadow,position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:960,margin:"0 auto",padding:"14px 20px",display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:26}}>🎨</span>
          <span style={{fontSize:17,fontWeight:900,color:T.ink,letterSpacing:"-0.5px"}}>Little Masterpiece</span>
          <div style={{flex:1}}/>
          <button onClick={()=>setShowTagMgr(true)} style={{background:"none",border:`1.5px solid ${T.border}`,borderRadius:20,padding:"7px 14px",color:T.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.ff}}>🏷 Tags</button>
        </div>

        {/* Children tabs */}
        <div style={{maxWidth:960,margin:"0 auto",padding:"0 20px 14px",display:"flex",gap:8,alignItems:"center",overflowX:"auto"}}>
          <button onClick={()=>setActiveChild("all")} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 16px",borderRadius:20,border:`1.5px solid ${activeChild==="all"?T.orange:T.border}`,background:activeChild==="all"?"#FFF5EE":T.white,color:activeChild==="all"?T.orange:T.muted,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:T.ff,whiteSpace:"nowrap",flexShrink:0}}>
            👨‍👩‍👧‍👦 All
            <span style={{background:T.orange+"22",color:T.orange,borderRadius:10,padding:"1px 7px",fontSize:11}}>{artworks.length}</span>
          </button>
          {children.map(child=>{
            const count=artworks.filter(a=>a.child_id===child.id).length;
            const active=activeChild===child.id;
            return (
              <button key={child.id} onClick={()=>setActiveChild(child.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 16px 7px 10px",borderRadius:20,border:`1.5px solid ${active?child.avatar_color:T.border}`,background:active?child.avatar_color+"14":T.white,color:active?child.avatar_color:T.muted,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:T.ff,whiteSpace:"nowrap",flexShrink:0,transition:"all .15s"}}>
                <ChildAvatar child={child} size={26} active={active}/>
                {child.name}
                <span style={{background:active?child.avatar_color+"22":T.border,color:active?child.avatar_color:T.muted,borderRadius:10,padding:"1px 7px",fontSize:11}}>{count}</span>
              </button>
            );
          })}
          <button onClick={()=>setShowAddChild(true)} style={{width:36,height:36,borderRadius:"50%",border:`2px dashed ${T.border}`,background:"none",cursor:"pointer",fontSize:18,color:T.muted,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
        </div>

        {/* Gallery/Albums tabs */}
        <div style={{maxWidth:960,margin:"0 auto",padding:"0 20px",display:"flex",borderTop:`1px solid ${T.border}`}}>
          {[["gallery","🖼️ Gallery"],["albums","📁 Albums"]].map(([tab,label])=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"11px 20px",border:"none",background:"none",color:activeTab===tab?T.orange:T.muted,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:T.ff,borderBottom:`2.5px solid ${activeTab===tab?T.orange:"transparent"}`,transition:"all .15s"}}>{label}</button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{maxWidth:960,margin:"0 auto",padding:20}}>
        {/* Child hero bar */}
        {activeChildObj&&(
          <div style={{display:"flex",alignItems:"center",gap:16,background:T.white,borderRadius:16,padding:"18px 22px",marginBottom:22,boxShadow:T.shadow,borderLeft:`5px solid ${activeChildObj.avatar_color}`}}>
            <ChildAvatar child={activeChildObj} size={52}/>
            <div style={{flex:1}}>
              <div style={{fontSize:22,fontWeight:900,color:T.ink,fontFamily:T.ff}}>{activeChildObj.name}</div>
              {activeChildObj.school_name&&<div style={{fontSize:13,color:T.muted,fontFamily:T.ff}}>{activeChildObj.school_name}</div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:26,fontWeight:900,color:activeChildObj.avatar_color,fontFamily:T.ff}}>{visibleArtworks.length}</div>
              <div style={{fontSize:11,color:T.muted,fontFamily:T.ff}}>artworks</div>
            </div>
          </div>
        )}

        {activeTab==="gallery"&&<ArtworkGrid artworks={visibleArtworks} tags={tags} onTagEdit={setTagEditArt}/>}
        {activeTab==="albums"&&<AlbumsGrid albums={visibleAlbums} children={children} onOpen={handleAlbumOpen} onCreate={()=>setShowNewAlbum(true)} onDelete={id=>setAlbums(p=>p.filter(a=>a.id!==id))}/>}
      </div>

      {showAddChild&&<AddChildModal onClose={()=>setShowAddChild(false)} onAdd={c=>{setChildren(p=>[...p,c]);setShowAddChild(false);}}/>}
      {showTagMgr&&<TagManagerModal tags={tags} onClose={()=>setShowTagMgr(false)} onChange={setTags}/>}
      {showNewAlbum&&<CreateAlbumModal children={children} tags={tags} childId={activeChild!=="all"?activeChild:""} onClose={()=>setShowNewAlbum(false)} onCreate={a=>{setAlbums(p=>[...p,a]);setShowNewAlbum(false);}}/>}
      {tagEditArt&&<ArtworkTagEditor artwork={tagEditArt} tags={tags} onSave={handleTagSave} onClose={()=>setTagEditArt(null)}/>}

      {/* Album drilldown */}
      {openAlbum&&(
        <div style={{position:"fixed",inset:0,background:T.bg,zIndex:500,overflowY:"auto"}}>
          <div style={{maxWidth:960,margin:"0 auto",padding:20}}>
            <button onClick={()=>setOpenAlbum(null)} style={{background:"none",border:"none",color:T.orange,cursor:"pointer",fontSize:15,fontFamily:T.ff,fontWeight:700,marginBottom:20}}>← Back to Albums</button>
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:26}}>
              <div style={{width:56,height:56,borderRadius:14,background:openAlbum.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{openAlbum.icon}</div>
              <div>
                <div style={{fontSize:24,fontWeight:900,color:T.ink,fontFamily:T.ff}}>{openAlbum.name}</div>
                <div style={{fontSize:13,color:T.muted,fontFamily:T.ff}}>{openAlbum.artworks?.length||0} artworks{openAlbum.is_smart?" · Smart Album":""}</div>
              </div>
            </div>
            {openAlbum.is_smart&&openAlbum.smart_rules?.tags&&(
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
                <span style={{fontSize:12,color:T.muted,fontFamily:T.ff,alignSelf:"center"}}>Tagged:</span>
                {tags.filter(t=>openAlbum.smart_rules.tags.includes(t.slug)).map(t=><TagPill key={t.id} tag={t}/>)}
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(148px, 1fr))",gap:13}}>
              {(openAlbum.artworks||[]).map(art=>(
                <div key={art.id} style={{borderRadius:16,overflow:"hidden",boxShadow:T.shadow,aspectRatio:"4/5",position:"relative"}}>
                  <img src={art.url} alt={art.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(20,12,8,0.75))",padding:"20px 10px 10px"}}>
                    <div style={{color:"white",fontSize:11,fontWeight:700,fontFamily:T.ff}}>{art.title}</div>
                  </div>
                </div>
              ))}
              {openAlbum.artworks?.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"48px 20px",color:T.muted,fontFamily:T.ff}}><div style={{fontSize:44,marginBottom:12}}>📂</div><p>No artworks match this album's rules yet.</p></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

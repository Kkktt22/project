import {verbs} from "./data/verbs.js";
import {cinema,fill} from "./data/questions.js";

const $=s=>document.querySelector(s);
const app=$("#app"),nav=$("#nav");
const KEY="cinemalingua_v2";
const today=new Date().toISOString().slice(0,10);
let state=JSON.parse(localStorage.getItem(KEY)||"null")||{
  answered:0,correct:0,learned:[],missed:[],streak:0,lastDay:null,dailyDone:null,history:[],achievements:[]
};
let page="home", learnIndex=0, session=null;

function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function esc(s){return String(s).replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[x]))}
function speak(text){if("speechSynthesis"in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text))}}
function accuracy(){return state.answered?Math.round(state.correct/state.answered*100):0}
function record(ok,verb){
  state.answered++;if(ok){state.correct++;if(!state.learned.includes(verb))state.learned.push(verb);state.streak++}
  else{state.missed.push(verb);state.streak=0}
  state.history.push({date:today,verb,ok});checkAchievements();save()
}
function checkAchievements(){
  const a=state.achievements;
  if(state.learned.length>=1&&!a.includes("first"))a.push("first");
  if(state.learned.length>=10&&!a.includes("ten"))a.push("ten");
  if(state.learned.length>=25&&!a.includes("twentyfive"))a.push("twentyfive");
  if(state.streak>=5&&!a.includes("streak"))a.push("streak");
}
function go(p){page=p;nav.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===p));nav.classList.remove("open");render();scrollTo({top:0,behavior:"smooth"})}
document.addEventListener("click",e=>{let x=e.target.closest("[data-page]");if(x)go(x.dataset.page)});
$("#menuBtn").onclick=()=>nav.classList.toggle("open");

function render(){
  const f={home:home,learn:learn,practice:practice,library:library,progress:progress}[page]||home;
  app.innerHTML=`<section class="page">${f()}</section>`;bind()
}
function home(){
  const remaining=verbs.length-state.learned.length;
  return `<div class="hero">
    <span class="eyebrow">Interactive English learning</span>
    <h1>Cinema<span>Lingua</span></h1>
    <p>Learn phrasal verbs through context, then train until you can use them yourself.</p>
    <div class="actions center"><button class="btn primary" data-page="learn">Start learning</button><button class="btn secondary" data-page="practice">Practice</button></div>
  </div>
  <div class="section"><h2>Today</h2><p>Your short daily learning session.</p></div>
  <div class="card daily"><div><span class="pill">Daily challenge</span><h3>${state.dailyDone===today?"Completed 🎉":"5 minutes of practice"}</h3><p class="muted">${state.dailyDone===today?"Come back tomorrow for a new challenge.":"Review a few expressions and keep your progress moving."}</p></div><button class="btn primary" id="dailyBtn">${state.dailyDone===today?"Practice again":"Start daily"}</button></div>
  <div class="section"><h2>Your dashboard</h2></div>
  <div class="grid g3"><div class="card stat"><strong>${state.learned.length}</strong>learned</div><div class="card stat"><strong>${accuracy()}%</strong>accuracy</div><div class="card stat"><strong>${state.streak}</strong>correct streak</div></div>
  <div class="section"><h2>Learning cycle</h2></div>
  <div class="grid g3"><div class="card"><div class="icon">🎬</div><h3>Context</h3><p class="muted">See a phrase in a meaningful situation.</p></div><div class="card"><div class="icon">🧩</div><h3>Practice</h3><p class="muted">Recall, recognize and use the expression.</p></div><div class="card"><div class="icon">🔁</div><h3>Review</h3><p class="muted">Return to expressions that need more practice.</p></div></div>`
}
function learn(){
 const v=verbs[learnIndex];
 return `<div class="lesson"><div class="card">
 <span class="pill">${esc(v.level)} · ${esc(v.category)}</span><h1 class="verb">${esc(v.verb)}</h1><div class="meaning">${esc(v.meaning)}</div>
 <div class="example">“${esc(v.example)}”</div><div class="context"><strong>Why this context?</strong><br>${esc(v.context)}</div>
 <div class="toolbar" style="margin-top:15px"><button class="audio" id="audio">🔊 Listen</button><button class="btn secondary" id="practiceVerb">Practice this</button></div>
 <hr style="border:0;border-top:1px solid var(--line);margin:24px 0">
 <div class="toolbar"><button class="btn secondary" id="prev">← Previous</button><button class="btn primary" id="next">Next →</button></div>
 <p class="muted">Card ${learnIndex+1} of ${verbs.length}</p></div></div>`
}
function practice(){
 if(!session)return `<div class="section"><h1>Practice</h1><p>Choose how you want to train.</p></div>
 <div class="grid g3">${[
 ["🎯","Choose","Choose the phrasal verb that fits.","choose"],
 ["✍️","Fill the gap","Recall the expression without options.","fill"],
 ["🧠","Meaning","Identify what a phrase means in context.","meaning"],
 ["🎭","Context","Infer meaning from a situation.","context"],
 ["🔄","Review","Practice expressions you missed.","review"],
 ["🎲","Mixed","A balanced mix of exercise types.","mixed"]
 ].map(x=>`<div class="card"><div class="icon">${x[0]}</div><h3>${x[1]}</h3><p class="muted">${x[2]}</p><button class="btn primary start" data-mode="${x[3]}">Start</button></div>`).join("")}</div>`;
 if(session.done)return result();
 const q=session.items[session.i],pct=Math.round(session.i/session.items.length*100);
 if(session.type==="fill")return quiz(`<h1>Fill in the gap</h1><div class="example">${esc(q.sentence)}</div><input class="input" id="answer" placeholder="Type the phrasal verb"><br><br><button class="btn primary" id="check">Check</button><div id="feedback"></div>`,pct);
 if(session.type==="meaning"||session.type==="context")return quiz(`<h1>${session.type==="meaning"?"What does it mean?":"Understand the context"}</h1><div class="context">${esc(q.context)}</div><div class="example">${esc(q.sentence)}</div><div id="options">${shuffle(q.options).map(o=>`<button class="option" data-answer="${esc(o)}">${esc(o)}</button>`).join("")}</div><div id="feedback"></div>`,pct);
 return quiz(`<h1>Choose the phrasal verb</h1><p class="muted">🎬 ${esc(q.source)}</p><div class="example">${esc(q.sentence)}</div><div id="options">${shuffle(q.options).map(o=>`<button class="option" data-answer="${esc(o)}">${esc(o)}</button>`).join("")}</div><div id="feedback"></div>`,pct)
}
function quiz(content,pct){return `<div class="lesson"><div class="card"><span class="pill">Question ${session.i+1} of ${session.items.length}</span><div class="progressline" style="margin:14px 0 22px"><span style="width:${pct}%"></span></div>${content}<br><button class="btn secondary" id="exit">Exit</button></div></div>`}
function result(){let p=Math.round(session.score/session.items.length*100);return `<div class="result card"><span class="pill">Session complete</span><div class="score">${session.score}/${session.items.length}</div><h2>${p}% correct</h2><p class="muted">${p>=80?"Great work — now keep the expressions active by using them in new contexts.":"Good practice. Review your missed expressions and try again."}</p><div class="actions center"><button class="btn primary" id="again">Try again</button><button class="btn secondary" data-page="progress">Progress</button></div></div>`}
function library(){
 return `<div class="section"><h1>📚 Phrasal Verb Library</h1><p>Browse by level, category or search.</p></div>
 <div class="toolbar"><input class="input search" id="search" placeholder="Search..."><div class="filters"><button class="filter active" data-filter="all">All</button><button class="filter" data-filter="A2">A2</button><button class="filter" data-filter="B1">B1</button><button class="filter" data-filter="B2">B2</button></div></div>
 <div class="grid g3" id="cards">${verbs.map(card).join("")}</div>`
}
function card(v){
 const learned=state.learned.includes(v.verb),miss=state.missed.includes(v.verb);
 return `<article class="card library"><span class="pill">${esc(v.level)}</span><span class="status">${learned?"🟢":miss?"🟡":"⚪"}</span><h3>${esc(v.verb)}</h3><p><strong>${esc(v.meaning)}</strong></p><p class="muted">${esc(v.context)}</p><p class="tag">${esc(v.category)}</p><button class="audio" data-speak="${esc(v.example)}">🔊 Example</button></article>`
}
function progress(){
 const ach=[
 ["first","🌱","First step","Learn your first phrasal verb."],
 ["ten","📚","10 verbs","Learn ten expressions."],
 ["twentyfive","🚀","25 verbs","Learn twenty-five expressions."],
 ["streak","🔥","5 streak","Get five correct answers in a row."]
 ];
 return `<div class="section"><h1>📈 Progress</h1><p>Your learning data is stored locally on this device.</p></div>
 <div class="grid g3"><div class="card stat"><strong>${state.learned.length}</strong>learned</div><div class="card stat"><strong>${accuracy()}%</strong>accuracy</div><div class="card stat"><strong>${state.answered}</strong>answers</div></div>
 <div class="section"><h2>Library progress</h2></div><div class="card"><div class="bar"><span style="width:${Math.min(100,state.learned.length/verbs.length*100)}%"></span></div><p>${state.learned.length} / ${verbs.length} expressions learned.</p></div>
 <div class="section"><h2>Achievements</h2></div><div class="grid g2">${ach.map(a=>`<div class="card achievement"><div class="badge">${a[1]}</div><div><strong>${a[2]}</strong><div class="muted">${a[3]}</div>${state.achievements.includes(a[0])?"<span class='check'>Unlocked ✓</span>":"<span class='tag'>Locked</span>"}</div></div>`).join("")}</div>
 <div class="section"><h2>Needs review</h2></div>${[...new Set(state.missed)].slice(-8).map(v=>verbs.find(x=>x.verb===v)).filter(Boolean).map(card).join("")||`<div class="card"><p class="muted">Nothing here yet. Great start!</p></div>`}
 <div class="section"><button class="btn danger" id="reset">Reset all progress</button></div>`
}
function start(mode){
 let items;
 if(mode==="choose")items=shuffle(cinema).slice(0,8);
 if(mode==="fill")items=shuffle(fill).slice(0,8);
 if(mode==="meaning"||mode==="context")items=shuffle(cinema).slice(0,8);
 if(mode==="review"){let missed=[...new Set(state.missed)];items=shuffle(cinema.filter(q=>missed.includes(q.verb))).slice(0,8);if(!items.length)items=shuffle(cinema).slice(0,5)}
 if(mode==="mixed")items=shuffle([...cinema.slice(0,5),...fill.slice(0,4),...cinema.slice(5,7)]).slice(0,10);
 session={mode,type:mode==="mixed"?"mixed":mode,items:items.map(q=>normalize(q,mode)),i:0,score:0,done:false};render()
}
function normalize(q,mode){
 if(Array.isArray(q)){if(q.length===6)return {verb:q[0],source:q[1],sentence:q[2],answer:q[3],options:[q[3],...q[4].split("|")],explanation:q[5],context:cinema.find(x=>x[0]===q[0])?.context||""};return {verb:q[0],sentence:q[1],answer:q[2],explanation:q[3]}}
 return q
}
function answer(selected){
 let q=session.items[session.i],correct=q.answer;
 if(session.type==="meaning"||session.type==="context")correct=verbs.find(v=>v.verb===q.verb)?.meaning;
 let ok=selected===correct;if(ok)session.score++;record(ok,q.verb);
 document.querySelectorAll(".option").forEach(x=>x.disabled=true);
 let b=[...document.querySelectorAll(".option")];let clicked=b.find(x=>x.dataset.answer===selected);clicked?.classList.add(ok?"correct":"wrong");b.find(x=>x.dataset.answer===correct)?.classList.add("correct");
 $("#feedback").innerHTML=`<div class="feedback"><strong>${ok?"Correct! ✓":"Not quite."}</strong><p>${esc(q.explanation||"Review the expression in context.")}</p>${!ok?`<p><strong>Answer:</strong> ${esc(correct)}</p>`:""}<button class="btn primary" id="nextQ">Next</button></div>`
}
function bind(){
 document.querySelectorAll(".start").forEach(b=>b.onclick=()=>start(b.dataset.mode));
 $("#next")?.addEventListener("click",()=>{learnIndex=(learnIndex+1)%verbs.length;render()});
 $("#prev")?.addEventListener("click",()=>{learnIndex=(learnIndex-1+verbs.length)%verbs.length;render()});
 $("#audio")?.addEventListener("click",()=>speak(verbs[learnIndex].example));
 $("#practiceVerb")?.addEventListener("click",()=>startForVerb(verbs[learnIndex].verb));
 document.querySelectorAll("[data-speak]").forEach(b=>b.onclick=()=>speak(b.dataset.speak));
 document.querySelectorAll(".option").forEach(b=>b.onclick=()=>answer(b.dataset.answer));
 $("#nextQ")?.addEventListener("click",()=>{session.i++;if(session.i>=session.items.length)session.done=true;render()});
 $("#exit")?.addEventListener("click",()=>{session=null;render()});
 $("#check")?.addEventListener("click",checkFill);
 $("#answer")?.addEventListener("keydown",e=>{if(e.key==="Enter")checkFill()});
 $("#again")?.addEventListener("click",()=>start(session.mode));
 $("#dailyBtn")?.addEventListener("click",()=>{state.dailyDone=today;save();start("mixed")});
 $("#reset")?.addEventListener("click",()=>{if(confirm("Reset all progress?")){state={answered:0,correct:0,learned:[],missed:[],streak:0,lastDay:null,dailyDone:null,history:[],achievements:[]};save();render()}});
 $("#search")?.addEventListener("input",filterLibrary);
 document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");filterLibrary()});
}
function startForVerb(verb){let q=cinema.find(x=>x[0]===verb);if(!q)return;session={mode:"choose",type:"choose",items:[normalize(q)],i:0,score:0,done:false};go("practice")}
function filterLibrary(){let term=($("#search")?.value||"").toLowerCase();let f=document.querySelector(".filter.active")?.dataset.filter||"all";$("#cards").innerHTML=verbs.filter(v=>(f==="all"||v.level.includes(f))&&[v.verb,v.meaning,v.category,v.context].join(" ").toLowerCase().includes(term)).map(card).join("")||`<div class="card"><p class="muted">Nothing found.</p></div>`}
render();

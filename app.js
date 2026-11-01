const L="ABCD";const D=window.DAY;const KEY="toeic-day"+D.day;const SV=JSON.parse(localStorage.getItem(KEY)||"{}");const picked=SV.picked||{},shown={};const t0=SV.t0||Date.now();let submitted=SV.submitted||false;function save(){localStorage.setItem(KEY,JSON.stringify({picked,t0,submitted}))}let tsec=1200,ton=false,tlab="閱讀",tid=null;
const $=s=>document.querySelector(s);const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=s=>Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
function tick(){$("#tm").textContent=tlab+" "+fmt(tsec);$("#tm").classList.toggle("end",tsec===0);$("#tgo").textContent=ton?"暫停":"開始"}
function setT(s,l){tsec=s;tlab=l;ton=false;tick()}
setInterval(()=>{if(ton&&tsec>0){tsec--;tick()}},1000);
const groups={grammar:[],reading:[],listening:[]};
function card(q,part2){const p=picked[q.n],ans=p!==undefined,hide=part2&&!shown[q.n];
 let h=`<div class="card" id="q${q.n}"><div><b>${q.n}. </b>${hide?'<span class="hid">（聽音檔作答，題目文字已隱藏）</span>':esc(q.stem)}</div>`;
 if(q.audio)h+=`<audio controls preload="none" src="audio/${q.audio}"></audio><button class="b" onclick="tog(${q.n})">${shown[q.n]?"隱藏":"顯示"}文字稿</button>`;
 q.opts.forEach((o,i)=>{const c=ans&&i===q.ans?"ok":ans&&i===p?"ng":"";h+=`<button class="opt ${c}" onclick="pick(${q.n},${i})">(${L[i]}) ${hide&&!ans?"":esc(o)}</button>`});
 if(ans)h+=`<div class="exp"><b class="${p===q.ans?"ok":"ng"}">${p===q.ans?"答對":"答錯，正解 ("+L[q.ans]+")"}</b>　${esc(q.exp)}</div>`;
 return h+"</div>"}
const Q={};D.sections.forEach(s=>s.qs.forEach(q=>{Q[q.n]=[q,s.kind==="part2"];(s.kind==="p5"?groups.grammar:s.kind==="p7"?groups.reading:groups.listening).push(q)}));
function re(n){const a=document.querySelector("#q"+n);const pl=a.querySelector("audio");const t=pl&&pl.currentTime;a.outerHTML=card(...Q[n]);score()}
window.pick=(n,i)=>{if(picked[n]!==undefined)return;picked[n]=i;save();re(n)};window.tog=n=>{shown[n]=!shown[n];re(n)};
window.togS=i=>{const e=$("#s"+i);e.hidden=!e.hidden};
function sc(a){return[a.filter(q=>picked[q.n]===q.ans).length,a.filter(q=>picked[q.n]!==undefined).length,a.length]}
function score(){const all=[...groups.grammar,...groups.reading,...groups.listening];const g=sc(groups.grammar),r=sc(groups.reading),l=sc(groups.listening),t=sc(all);
 const m=(v,lab)=>`<div class="met"><div class="v">${v[0]} / ${v[2]}</div><div>${lab}</div><div class="tip">已作答 ${v[1]}</div></div>`;
 $("#score").innerHTML=`<div class="grid">${m(g,"Part 5 文法")}${m(r,"Part 7 閱讀")}${m(l,"聽力")}${m(t,"總分")}</div><div class="box">${t[1]===t[2]?`全部做完了。請在聊天室回覆：<b>Day ${D.day} 文法 ${g[0]}/${g[2]}、閱讀 ${r[0]}/${r[2]}、聽力 ${l[0]}/${l[2]}</b>，並說明哪幾題是用猜的。`:`做完 ${t[2]} 題後，把三個分項分數回報到聊天室。`}</div>`}
let h=`<p><a href="./">← 所有日期</a></p><h1>${esc(D.title)}</h1><p class="sum">${esc(D.summary)}</p>
<div class="timer"><span class="tm" id="tm"></span><button class="b p" id="tgo" onclick="ton=!ton;tick()">開始</button><button class="b" onclick="setT(1200,'閱讀')">閱讀 20 分</button><button class="b" onclick="setT(600,'聽力')">聽力 10 分</button></div>`;
D.sections.forEach((s,i)=>{h+=`<h2>${esc(s.heading)}</h2>`+(s.tip?`<p class="tip">${esc(s.tip)}</p>`:"");
 if(s.passage)h+=`<div class="box">${s.passage.map(x=>`<div>${esc(x)||"&nbsp;"}</div>`).join("")}</div>`;
 if(s.audio)h+=`<audio controls preload="none" src="audio/${s.audio}"></audio>`;
 h+=s.qs.map(q=>card(q,s.kind==="part2")).join("");
 if(s.script)h+=`<button class="b" onclick="togS(${i})">顯示／隱藏文字稿</button><div class="box" id="s${i}" hidden>${s.script.map(x=>`<div>${esc(x)}</div>`).join("")}</div>`});
h+=`<h2>今日成績</h2><div id="score"></div><button class="b p" id="sub" onclick="submitAll()">交卷</button><span id="subst" class="tip"></span><br><button class="b" onclick="if(confirm('清除作答重新開始？')){localStorage.removeItem(KEY);location.reload()}">重新作答</button>`;
$("main").innerHTML=h;tick();score();

window.submitAll=async()=>{const all=[...groups.grammar,...groups.reading,...groups.listening];const un=all.filter(q=>picked[q.n]===undefined).length;
 if(un&&!confirm("還有 "+un+" 題沒作答，確定交卷？"))return;
 const g=sc(groups.grammar),r=sc(groups.reading),l=sc(groups.listening),t=sc(all);
 const res={v:1,day:D.day,date:D.date,ts:new Date().toISOString(),secondsUsed:Math.round((Date.now()-t0)/1000),
  scores:{grammar:[g[0],g[2]],reading:[r[0],r[2]],listening:[l[0],l[2]],total:[t[0],t[2]]},
  answers:all.map(q=>({n:q.n,picked:picked[q.n]===undefined?null:L[picked[q.n]],correct:L[q.ans],ok:picked[q.n]===q.ans}))};
 $("#subst").textContent=" 傳送中…";
 try{const x=await fetch("https://ntfy.sh/"+window.TOPIC,{method:"POST",body:JSON.stringify(res)});if(!x.ok)throw 0;submitted=true;save();
  $("#subst").textContent=" ✅ 已交卷（總分 "+t[0]+"/"+t[2]+"），老師會直接看到你的答案，不用貼到聊天室。"}
 catch(e){$("#subst").textContent=" ❌ 傳送失敗，請檢查網路後再按一次交卷。"}};
if(submitted)$("#subst").textContent=" ✅ 這份已經交過卷了（可以再交一次，會以最新的為準）。";

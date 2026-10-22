(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia("(prefers-reduced-motion:reduce)").matches;
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),2400)};
const esc=s=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---- sound: generated in-browser (cinematic boom + ambient pad) ---- */
let ac,pad,soundOn=false;
const ctx=()=>ac||(ac=new(window.AudioContext||window.webkitAudioContext)());
function boom(){try{const a=ctx(),t=a.currentTime,o=a.createOscillator(),g=a.createGain();o.type="sine";o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(32,t+1.6);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.7,t+.04);g.gain.exponentialRampToValueAtTime(.0001,t+2.2);o.connect(g).connect(a.destination);o.start(t);o.stop(t+2.3)}catch(e){}}
function ambient(on){try{const a=ctx();if(on){pad=a.createGain();pad.gain.value=.0001;pad.gain.exponentialRampToValueAtTime(.05,a.currentTime+2);pad.connect(a.destination);pad.o=[55,82.4,110,164.8].map((f,i)=>{const o=a.createOscillator();o.type=i%2?"triangle":"sine";o.frequency.value=f;o.detune.value=i*4;o.connect(pad);o.start();return o})}else if(pad){pad.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.6);const p=pad;setTimeout(()=>p.o.forEach(o=>o.stop()),700);pad=null}}catch(e){}}
$("#snd").onclick=e=>{soundOn=!soundOn;ambient(soundOn);e.currentTarget.setAttribute("aria-pressed",soundOn);e.currentTarget.textContent=(soundOn?"🔊":"🔇")+" Sound"};

/* ---- cinematic intro ---- */
const intro=$("#intro"),hv=$("#hv");
const startHero=()=>{if(RM||navigator.connection&&navigator.connection.saveData)return;hv.src="assets/video/v1.mp4";hv.play().catch(()=>{})};
const close=()=>{intro.classList.add("out");document.body.classList.remove("locked");startHero();setTimeout(()=>intro.remove(),1000)};
$("#enter").onclick=()=>{boom();close()};
$("#skip").onclick=close;
setTimeout(()=>{const e=$("#enter");if(e)e.hidden=false},RM?300:5600);
addEventListener("keydown",e=>{if(e.key==="Escape"){if(!$("#player").hidden)closePlayer();else if(!$("#modal").hidden)closeModal();else if($("#intro"))close()}});

/* ---- data ---- */
const V=[{n:3,t:"The Rebel Star: Grand Entry",d:"0:57",hero:1},{n:5,t:"Standing Tall",d:"0:09"},{n:1,t:"Rebel Rising",d:"0:10"},{n:4,t:"The Lover Boy Era",d:"0:14"},{n:2,t:"The Darling Vibe",d:"0:12"}];
const TOP=["f3_2","f1_2","f5_2","f2_1","f4_2","f3_3","f1_4","f4_3","f5_4","f2_2"];

/* ---- rows ---- */
const mk=(h,c="card")=>{const d=document.createElement("button");d.className=c;d.innerHTML=h;return d};
V.forEach((v,i)=>{const c=mk(`<img src="assets/frames/f${v.n}_3.jpg" alt="" loading="lazy"><span class="ep">${v.hero?"MAIN · EP 3":"EP "+v.n}</span><span class="pl">▶</span><span class="cap">${v.t}<small>${v.d} · Tribute reel</small></span>`);
 let pv;const stopPrev=()=>{pv&&pv.remove();pv=null};
 c.onclick=()=>{stopPrev();openPlayer(i)};
 if(!RM&&matchMedia("(hover:hover)").matches&&!v.hero){c.onmouseenter=()=>{pv=document.createElement("video");pv.src=`assets/video/v${v.n}.mp4`;pv.muted=pv.loop=pv.playsInline=true;c.prepend(pv);pv.play().catch(()=>{})};c.onmouseleave=stopPrev}
 $("#r-reels").append(c)});
TOP.forEach((s,i)=>{const w=document.createElement("div");w.className="tw";w.innerHTML=`<span class="num" aria-hidden="true">${i+1}</span>`;const c=mk(`<img src="assets/frames/${s}.jpg" alt="Moment ${i+1}" loading="lazy">`);c.onclick=()=>openImg(s,i+1);w.append(c);$("#r-top").append(w)});
$$(".rw").forEach(w=>{const r=$(".row",w);$(".l",w).onclick=()=>r.scrollBy({left:-r.clientWidth*.8,behavior:"smooth"});$(".r",w).onclick=()=>r.scrollBy({left:r.clientWidth*.8,behavior:"smooth"})});

/* ---- modal ---- */
const M=$("#modal");let lastFocus;
function show(media,info){lastFocus=document.activeElement;$("#mm").innerHTML=media;$("#mi").innerHTML=info;M.hidden=false;document.body.classList.add("locked");$("#mx").focus()}
function closeModal(){const v=$("video",M);v&&v.pause();$("#mm").innerHTML="";M.hidden=true;document.body.classList.remove("locked");lastFocus&&lastFocus.focus()}
$("#mx").onclick=closeModal;$(".mb").onclick=closeModal;
function openImg(s,n){show(`<img src="assets/frames/${s}.jpg" alt="Moment ${n}">`,`<h4>#${n} Moment</h4><p>Top ${n} in Fan Land today. ❤️‍🔥</p>`)}
$("#play").onclick=()=>openPlayer(0);$("#playall").onclick=()=>openPlayer(0);
$("#more").onclick=()=>{$("#wishes").scrollIntoView({behavior:"smooth"});setTimeout(()=>$("#wname").focus({preventScroll:true}),700)};

/* ---- tribute player: ONE <video> element, plays reels 1 -> 5 back to back ---- */
const P=$("#player"),pv=$("#pv"),pbg=$("#pbg"),spin=$("#spin"),upn=$("#upn");let cur=-1,upT,preIdx=-1,heroWasOn=false;
const pre=document.createElement("video");pre.preload="auto";pre.muted=true;
$("#plist").innerHTML=V.map((v,i)=>`<button class="pi" data-i="${i}"><img src="assets/frames/f${v.n}_3.jpg" alt="" loading="lazy"><span class="pt"><b>${i+1}. ${v.t}</b><small>${v.d}${v.hero?" · Main feature":""}</small></span><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span></button>`).join("");
$$(".pi").forEach(b=>b.onclick=()=>playAt(+b.dataset.i));
function clearUp(){clearInterval(upT);upn.hidden=true}
function playAt(i){clearUp();cur=i;const v=V[i];
 pv.poster=`assets/frames/f${v.n}_3.jpg`;pv.src=`assets/video/v${v.n}.mp4`;pv.load();P.classList.remove("fill");pbg.removeAttribute("src");pbg.load();spin.hidden=false;
 $("#ptitle").textContent=v.t;$("#pmeta").innerHTML=`<span class="match">100% Match</span><span>Episode ${i+1} of ${V.length}</span><span>${v.d}</span><span class="box">HD</span>`;
 $$(".pi").forEach((b,k)=>{b.classList.toggle("on",k===i);b.setAttribute("aria-current",k===i)});
 const pr=pv.play();if(pr)pr.catch(()=>{spin.hidden=true;toast("Tap ▶ to play")})}
function openPlayer(i){ambient(false);soundOn=false;$("#snd").setAttribute("aria-pressed",false);$("#snd").textContent="🔇 Sound";
 heroWasOn=!!hv.src&&!hv.paused;hv.pause();P.hidden=false;document.body.classList.add("locked");playAt(i);$("#px").focus()}
function closePlayer(){clearUp();pv.pause();pv.removeAttribute("src");pv.load();pbg.pause();pbg.removeAttribute("src");pbg.load();P.classList.remove("fill");P.hidden=true;cur=-1;preIdx=-1;document.body.classList.remove("locked");if(heroWasOn)hv.play().catch(()=>{})}
$("#px").onclick=closePlayer;$(".pbk").onclick=closePlayer;
function showUp(i){clearUp();upn.hidden=false;const last=i<0;let n=4;
 $("#upl").textContent=last?"That's a wrap":"Up next · Episode "+(i+1);$("#upt").textContent=last?"Happy Birthday, Rebel Star! ❤️‍🔥":V[i].t;
 $("#upgo").textContent=last?"↻ Watch again":"▶ Play now";$("#upgo").onclick=()=>playAt(last?0:i);$("#upcx").onclick=clearUp;
 if(last)return;const tk=()=>{n--;$("#upc").textContent=n>0?`Playing in ${n}…`:"";if(n<=0)playAt(i)};$("#upc").textContent=`Playing in ${n}…`;upT=setInterval(tk,1000)}
pv.onended=()=>{if(cur<V.length-1)showUp(cur+1);else{showUp(-1);confetti()}};
pv.onwaiting=()=>spin.hidden=false;pv.onplaying=pv.oncanplay=()=>spin.hidden=true;
pv.onloadedmetadata=()=>{if(!pv.videoWidth)return;const ar=pv.videoWidth/pv.videoHeight;P.style.setProperty("--ar",ar);
 if(Math.abs(ar-16/9)>.04){P.classList.add("fill");pbg.src=pv.src;pbg.currentTime=pv.currentTime;if(!pv.paused)pbg.play().catch(()=>{})}else P.classList.remove("fill")};
/* blurred mirror behind portrait/square reels so the whole stage is filled (video itself is never cropped) */
const bgSync=()=>{if(!P.classList.contains("fill")||!pbg.src)return;if(Math.abs(pbg.currentTime-pv.currentTime)>.35)pbg.currentTime=pv.currentTime};
pv.addEventListener("play",()=>{if(P.classList.contains("fill")){bgSync();pbg.play().catch(()=>{})}});
pv.addEventListener("pause",()=>pbg.pause());pv.addEventListener("seeked",bgSync);pv.addEventListener("timeupdate",bgSync);pv.addEventListener("waiting",()=>pbg.pause());pv.addEventListener("playing",()=>{if(P.classList.contains("fill"))pbg.play().catch(()=>{})});
pv.ontimeupdate=()=>{const nx=cur+1;if(pv.duration&&pv.currentTime/pv.duration>.4&&V[nx]&&preIdx!==nx){preIdx=nx;pre.src=`assets/video/v${V[nx].n}.mp4`}};
pv.onerror=()=>{if(!pv.getAttribute("src"))return;spin.hidden=true;if(cur<V.length-1){toast("Couldn't load that reel — skipping");setTimeout(()=>{if(!P.hidden)playAt(cur+1)},1200)}else toast("Couldn't load that reel")};

/* ---- A CINEMATIC JOURNEY (timeline) ---- */
// ["h",title,range] era · ["c",year,title,tag,desc,upcoming?] film card · ["k",[[year,title,note?],...]] chips
const T=[
["h","THE RISE","2002 – 2013"],
["c","2002","Eeswar","Debut","Prabhas makes his Telugu film debut and begins a journey that would span the nation."],
["c","2004","Varsham","Film","A romantic action hit that firmly established him as a leading man in Telugu cinema."],
["k",[["2003","Raghavendra"],["2004","Adavi Ramudu"],["2005","Chakram"],["2005","Chatrapathi"],["2006","Pournami"],["2007","Yogi"],["2007","Munna"],["2008","Bujjigaadu"],["2009","Billa"],["2009","Ek Niranjan"],["2010","Darling"],["2011","Mr. Perfect"],["2012","Rebel"],["2013","Mirchi"]]],
["h","THE BAAHUBALI ERA","2015 – 2017"],
["c","2015","Baahubali: The Beginning","10 July 2015","S. S. Rajamouli's epic puts Prabhas at the centre of a story that travelled far beyond Telugu cinema."],
["c","2017","Baahubali 2: The Conclusion","28 April 2017","The saga concludes, with Prabhas in the dual roles of Amarendra and Mahendra Baahubali."],
["h","PAN-INDIA STAR","2019 – 2026"],
["c","2019","Saaho","30 August 2019","A large-scale action thriller released simultaneously in Telugu, Hindi and Tamil."],
["k",[["2022","Radhe Shyam"],["2023","Adipurush"]]],
["c","2023","Salaar: Part 1 – Ceasefire","22 December 2023","Directed by Prashanth Neel, a grim, high-intensity action drama with Prabhas as Deva."],
["c","2024","Kalki 2898 AD","27 June 2024","Nag Ashwin's sci-fi epic blending mythology and the far future, with Prabhas as Bhairava."],
["k",[["2025","Kannappa","cameo role"],["2026","The Raja Saab","horror-comedy"]]],
["h","WHAT'S NEXT","Upcoming"],
["c","2027","Spirit","Directed by Sandeep Reddy Vanga","",1],
["c","2027","Fauzi","Directed by Hanu Raghavapudi","",1],
["c","SOON","Salaar: Part 2 – Shouryaanga Parvam","Release date to be announced","",1],
["c","SOON","Kalki 2898 AD – Part 2","Release date to be announced","",1]];
const tl=$("#tl");
tl.innerHTML=T.map(r=>r[0]==="h"?`<li class="th rv"><h3>${r[1]}</h3><small>${r[2]}</small></li>`
 :r[0]==="c"?`<li class="tc rv${r[5]?" up":""}"><div class="yr">${r[1]}</div><h3>${r[2]}</h3><small>${r[3]}</small>${r[4]?`<p>${r[4]}</p>`:""}</li>`
 :`<li class="tk rv">${r[1].map(f=>`<span><b>${f[0]}</b>${f[1]}${f[2]?` <em>· ${f[2]}</em>`:""}</span>`).join("")}</li>`).join("");
const tlp=()=>{const r=tl.getBoundingClientRect();tl.style.setProperty("--tp",RM?1:Math.min(1,Math.max(0,(innerHeight*.7-r.top)/r.height)))};
addEventListener("scroll",tlp,{passive:true});addEventListener("resize",tlp);tlp();
if("IntersectionObserver"in window&&!RM){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{rootMargin:"0px 0px -8% 0px"});$$(".rv",tl).forEach(el=>io.observe(el))}else $$(".rv",tl).forEach(el=>el.classList.add("in"));

/* ---- nav ---- */
const nav=$("#nav");addEventListener("scroll",()=>nav.classList.toggle("sc",scrollY>40),{passive:true});

/* ---- countdown to 23 Oct, IST ---- */
const IST=330*6e4;
function target(){const n=Date.now(),y=new Date(n+IST).getUTCFullYear();let t=Date.UTC(y,9,23)-IST;if(n>=t+864e5)t=Date.UTC(y+1,9,23)-IST;return t}
function tick(){const n=Date.now(),t=target();if(n>=t&&n<t+864e5){$("#cdt").textContent="It's the big day! 🎂";["d","h","m","s"].forEach(k=>$("#"+k).textContent="0");return}
 let s=Math.max(0,Math.floor((t-n)/1e3));const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);
 $("#d").textContent=d;$("#h").textContent=String(h).padStart(2,"0");$("#m").textContent=String(m).padStart(2,"0");$("#s").textContent=String(s%60).padStart(2,"0")}
tick();setInterval(tick,1000);
const age=new Date(Date.now()+IST).getUTCFullYear()-1979;$("#born").textContent=`Born 23 October 1979 · turning ${age}`;

/* ---- wish / cake ---- */
$("#wish").onclick=()=>{$(".cake").classList.add("off");boom();$("#wn").textContent="Wish made. Happy Birthday, Rebel Star! ❤️‍🔥";confetti();setTimeout(()=>{$(".cake").classList.remove("off")},5000)};
function confetti(){if(RM)return;const c=document.createElement("canvas");c.style.cssText="position:fixed;inset:0;z-index:95;pointer-events:none";document.body.append(c);const x=c.getContext("2d");c.width=innerWidth;c.height=innerHeight;const col=["#e50914","#f5c66b","#fff","#ff6b35"];const P=Array.from({length:150},()=>({x:innerWidth/2,y:innerHeight*.6,vx:(Math.random()-.5)*16,vy:-Math.random()*17-4,s:4+Math.random()*6,c:col[Math.random()*4|0],r:Math.random()*6}));let f=0;(function a(){x.clearRect(0,0,c.width,c.height);P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.35;p.r+=.2;x.fillStyle=p.c;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);x.restore()});if(++f<170)requestAnimationFrame(a);else c.remove()})()}

/* ---- wishes (demo: localStorage) ---- */
const K="rs_wishes";let W=[];try{W=JSON.parse(localStorage.getItem(K))||[]}catch(e){}
const seed=[{n:"Fans worldwide",m:"Happy Birthday, Darling! Love you always ❤️‍🔥"}];
function draw(){$("#r-wish").innerHTML=[...W,...seed].map(w=>`<div class="card"><p>“${esc(w.m)}”</p><b>— ${esc(w.n)}</b></div>`).join("")}draw();
$("#wf").onsubmit=e=>{e.preventDefault();if($("#hp2").value)return;const n=$("#wname").value.trim(),m=$("#wmsg").value.trim();if(!n||!m){toast("Add your name and wish");return}
 W.unshift({n,m});W=W.slice(0,30);try{localStorage.setItem(K,JSON.stringify(W))}catch(e){}draw();e.target.reset();toast("Wish posted ❤️");$("#r-wish").scrollTo({left:0,behavior:"smooth"})};

/* ---- share ---- */
const url=location.href.split("#")[0].split("?")[0],msg="Happy Birthday to the Rebel Star, Prabhas! ❤️‍🔥 Celebrate with us:",q=encodeURIComponent;
$("#wa").href="https://wa.me/?text="+q(msg+" "+url);$("#tw").href=`https://twitter.com/intent/tweet?text=${q(msg)}&url=${q(url)}`;$("#fb").href="https://www.facebook.com/sharer/sharer.php?u="+q(url);$("#tg").href=`https://t.me/share/url?url=${q(url)}&text=${q(msg)}`;
navigator.share?$("#ns").onclick=()=>navigator.share({title:document.title,text:msg,url}).catch(()=>{}):$("#ns").hidden=true;
$("#cp").onclick=()=>navigator.clipboard?.writeText(url).then(()=>toast("Link copied"),()=>toast("Copy failed"));
})();

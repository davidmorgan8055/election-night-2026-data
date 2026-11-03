(function(){"use strict";
function E(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function M(v){if(v==null||v===""||isNaN(+v))return"–";v=+v;return v===0?"Even":(v>0?"D+":"R+")+Math.abs(v).toFixed(1);}
function L(u,t){return u?'<a href="'+E(u)+'" target="_blank" rel="noopener">'+E(t||"source")+"</a>":"";}
var SITE="https://davidmorgan8055.github.io/election-night-2026-data/";
/* ---------- glossary ---------- */
var G={"D+ / R+":"How far ahead a party is, in percentage points. D+5 means Democrats lead by 5 points; R+5 means Republicans lead by 5.",
"% in / expected vote":"The share of all the votes expected in a race that have been counted so far. 60% in means about 40% of the votes are still to be counted.",
"Bellwether":"A county or state that has often voted the same way as the overall winner, so it is watched as an early hint.",
"Red mirage / blue shift":"Votes are counted in batches. If Election Day ballots (which lean Republican) are counted first, Republicans can look ahead early (red mirage); as mail ballots (which lean Democratic) are added, the count moves toward Democrats (blue shift). It can also happen in the other order.",
"Swing":"How much the margin moved compared with an earlier election in the same place.",
"Polling miss":"The final result margin minus the polling average. A positive miss means Democrats did better than polls showed; negative means Republicans did.",
"Called vs projected":"A call is made by AP or a network decision desk when they are confident who won. A projection on this site is our own model's estimate and is never a call.",
"Trader odds":"Prices on betting or prediction markets. They show what traders are wagering, not a forecast or a poll."};
window.ENR=window.ENR||{};
function glossary(){document.getElementById("glossary").innerHTML=Object.keys(G).map(function(k){return"<dt>"+E(k)+"</dt><dd>"+E(G[k])+"</dd>";}).join("");}
var gid=0;function term(label,key){gid++;return'<span class="gl"><button type="button" class="glb" aria-describedby="gl'+gid+'" aria-expanded="false">'+E(label)+' <span aria-hidden="true">ⓘ</span></button><span role="tooltip" id="gl'+gid+'" class="gltip" hidden>'+E(G[key])+"</span></span>";}
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".glb");document.querySelectorAll(".gltip").forEach(function(t){if(!b||t.id!==b.getAttribute("aria-describedby")){t.hidden=true;}});if(b){var t=document.getElementById(b.getAttribute("aria-describedby"));t.hidden=!t.hidden;b.setAttribute("aria-expanded",String(!t.hidden));}});
document.addEventListener("focusin",function(e){if(e.target.classList&&e.target.classList.contains("glb")){document.getElementById(e.target.getAttribute("aria-describedby")).hidden=false;}});
document.addEventListener("focusout",function(e){if(e.target.classList&&e.target.classList.contains("glb")){document.getElementById(e.target.getAttribute("aria-describedby")).hidden=true;}});
document.addEventListener("keydown",function(e){if(e.key==="Escape")document.querySelectorAll(".gltip").forEach(function(t){t.hidden=true;});});
function headTerms(){var th=document.querySelectorAll("#races thead th");if(th.length&&!th[3].querySelector(".gl")){th[3].innerHTML="Poll avg "+term("D+/R+","D+ / R+");th[8].innerHTML=term("% in","% in / expected vote");th[9].innerHTML="Model proj. "+term("vs call","Called vs projected");th[4].innerHTML+=" "+term("miss","Polling miss");}}
/* ---------- what's still out ---------- */
function out(D){var rs=D.races||[];var any=rs.some(function(r){return r.outstanding_note||r.pct_in!=null;});
 document.getElementById("out").innerHTML=any?"<ul class=outl>"+rs.map(function(r){var o=r.outstanding||{},b=(o.by_type||[]).map(function(x){return E(x.type)+(x.est_votes!=null?": ~"+(+x.est_votes).toLocaleString():"")+(x.lean_hist?" (has leaned "+E(x.lean_hist)+")":"");}).join("; ");
  return"<li><b>"+E(r.name||r.state)+":</b> "+E(r.outstanding_note||(r.pct_in!=null?r.pct_in+"% of expected votes counted.":"Updates once counting begins."))+(b?" <span class=small>"+b+"</span>":"")+(o.can_flip_leader!=null?' <span class="trust">'+(o.can_flip_leader?"Enough left to change the leader":"Not enough left to change the leader")+"</span>":"")+(o.source?" "+L(o.source):"")+"</li>";}).join("")+"</ul>":'<p class="empty">Updates once counting begins. For each race, this will say in one sentence how much vote is left, what kind (mail, Election Day, which counties), which way that vote has leaned before, and whether it is enough to change the leader.</p>';}
/* ---------- perspectives ---------- */
function persp(D){var p=D.perspectives||{},l=p.left||[],r=p.right||[];
 function col(t,a){return'<div class="card"><h3>'+t+'</h3>'+(a.length?"<ul class=pl>"+a.map(function(x){return'<li><span class="trust">Opinion</span> '+(x.trust?'<span class="trust">'+E(x.trust)+"</span> ":"")+E(x.paraphrase)+' — '+L(x.url,x.author)+(x.time_mt?" <span class=small>"+E(x.time_mt)+"</span>":"")+'<br><span class="small"><b>Fact check:</b> '+E(x.fact_check||"not yet checked")+" "+L(x.fact_check_url)+"</span></li>";}).join("")+"</ul>":'<p class="empty">No items yet. Paraphrased commentary will appear here once collected, each with a link and a fact check.</p>')+"</div>";}
 document.getElementById("persp").innerHTML='<p class="small">Short paraphrases of commentary, labeled Opinion. Inclusion is not endorsement; each side gets equal scrutiny.'+(p.updated_at?" Updated "+E(p.updated_at)+".":"")+'</p><div class="grid2">'+col("Left-leaning analysts",l)+col("Right-leaning analysts",r)+"</div>";}
/* ---------- if trends hold ---------- */
function trends(D){var t=D.if_trends_hold||{},s=t.senate,h=t.house;
 function c(title,x,need,extra){return'<div class="card"><b>'+title+'</b> <span class="trust">Model projection, not a call</span><p>'+(x&&x.D!=null?'<span class="D">D '+x.D+'</span> · <span class="R">R '+x.R+"</span>"+(x.note?" <span class=small>"+E(x.note)+"</span>":"")+(x.source?" "+L(x.source):""):'<span class="empty">Updates once counting begins.</span>')+'</p><p class="small">'+need+extra+"</p></div>";}
 document.getElementById("trends").innerHTML=c("Senate",s,"51 seats for control. Republicans hold 53 now; Democrats need a net gain of 4. ","At 50-50 the Vice President breaks ties, which favors Republicans.")+c("House",h,"218 seats for a majority.","")+'<p class="small" style="grid-column:1/-1">If every race ended with its current leader, the seats would split as shown. This is separate from the called-seat tracker below.'+(t.updated_at?" As of "+E(t.updated_at)+".":"")+"</p>";}
/* ---------- shift arrows ---------- */
function shifts(D,v){var o=[];(D.races||[]).forEach(function(r){var val=null,basis="";
 if(r.current_margin!=null){var b=r[v==="shift22"?"margin_2022":"margin_2024"];if(b&&b.value!=null){val=+r.current_margin-b.value;basis="Results swing vs "+(v==="shift22"?"2022 ":"2024 ")+b.race;}}
 else if(v==="shift22"){var e=((D.early_vote||{}).states||{})[r.state],f=e&&e.figures||{};if(f.gap_now!=null&&f.gap_2022!=null){val=+f.gap_now-+f.gap_2022;basis="Early-vote signal: change in party-registration gap of early ballots vs 2022 (not votes)";}}
 if(val!=null)o.push({st:r.state,name:r.name,val:Math.round(val*10)/10,basis:basis});});return o;}
var FIPS={"02":"AK","19":"IA","20":"KS","23":"ME","26":"MI","39":"OH","48":"TX","37":"NC","45":"SC"};
function arrows(){var D=window.ENR.DATA,G2=window.ENR.GEO,v=window.ENR.VIEW,svg=d3.select("#map");svg.selectAll("g.arrows").remove();var list=document.getElementById("shiftlist");
 if(!D||!G2||!/^shift/.test(v)){list.innerHTML="";return;}var s=shifts(D,v),by={};s.forEach(function(x){by[x.st]=x;});
 var g=svg.append("g").attr("class","arrows").attr("aria-hidden","true"),path=d3.geoPath();
 G2.forEach(function(f){var x=by[FIPS[f.id]];if(!x)return;var c=path.centroid(f),len=Math.min(90,8+Math.abs(x.val)*6),dir=x.val>0?-1:1,x2=c[0]+dir*len;
  g.append("line").attr("x1",c[0]).attr("y1",c[1]).attr("x2",x2).attr("y2",c[1]).attr("stroke",x.val>0?"#2166ac":"#b2182b").attr("stroke-width",5);
  g.append("path").attr("d","M"+x2+","+(c[1]-9)+"L"+(x2+dir*14)+","+c[1]+"L"+x2+","+(c[1]+9)+"Z").attr("fill",x.val>0?"#2166ac":"#b2182b");
  g.append("text").attr("x",c[0]).attr("y",c[1]-12).attr("text-anchor","middle").attr("font-size",14).attr("font-weight",700).attr("paint-order","stroke").attr("stroke","#fff").attr("stroke-width",3).text(x.st+" "+(x.val>0?"toward D ":"toward R ")+Math.abs(x.val).toFixed(1));});
 list.innerHTML=s.length?"<p><b>Text list:</b></p><ul>"+s.map(function(x){return"<li>"+E(x.name)+": "+(x.val>0?"toward Democrats":"toward Republicans")+" by "+Math.abs(x.val).toFixed(1)+" points — "+E(x.basis)+"</li>";}).join("")+"</ul>":'<p class="empty">'+(v==="shift24"?"Updates once counting begins (no early-vote comparison to 2024 is available).":"No comparable data yet.")+"</p>";}
/* ---------- timeline ---------- */
var HIST=null,TI=null;
function timeline(){var el=document.getElementById("timeline");if(!HIST||HIST.length<2){el.innerHTML='<p class="empty">Updates once counting begins. Each data update saves a snapshot of key margins and seat counts; you will be able to step through them here.'+(HIST&&HIST.length?" ("+HIST.length+" snapshot so far.)":"")+"</p>";return;}
 if(TI==null||TI>=HIST.length)TI=HIST.length-1;var s=HIST[TI];
 el.innerHTML='<label for="tl">Snapshot '+(TI+1)+" of "+HIST.length+': <b>'+E(s.t)+'</b></label><br><input type="range" id="tl" min="0" max="'+(HIST.length-1)+'" value="'+TI+'" style="width:100%"><div aria-live="polite"><p>Senate called: D '+M0(s.sen_D)+" · R "+M0(s.sen_R)+" | House called: D "+M0(s.house_D)+" · R "+M0(s.house_R)+'</p><ul>'+Object.keys(s.m||{}).map(function(k){var r=s.m[k];return"<li>"+k+": "+M(r[0])+(r[1]!=null?" ("+r[1]+"% in)":"")+(r[2]?" · "+E(r[2]):"")+"</li>";}).join("")+"</ul></div>";
 document.getElementById("tl").oninput=function(){TI=+this.value;timeline();document.getElementById("tl").focus();};}
function M0(v){return v==null?"–":v;}
function loadHist(){fetch("history.json?t="+Date.now(),{cache:"no-store"}).then(function(r){return r.ok?r.json():[];}).then(function(h){HIST=h||[];timeline();}).catch(function(){HIST=[];timeline();});}
/* ---------- share card ---------- */
function share(D){var el=document.getElementById("share"),rs=D.races||[];var cur=(document.getElementById("scsel")||{}).value||rs[0].state;
 el.innerHTML='<label for="scsel">Race: </label><select id="scsel">'+rs.map(function(r){return"<option"+(r.state===cur?" selected":"")+' value="'+r.state+'">'+E(r.name)+"</option>";}).join("")+'</select> <button type="button" id="scdl">Download image</button> <button type="button" id="scsh">Share</button><br><canvas id="sccv" width="1200" height="630" role="img" aria-label="Race card preview" style="max-width:100%;height:auto;border:1px solid #ccc;margin-top:8px"></canvas><p id="scalt" class="small"></p>';
 var sel=document.getElementById("scsel");sel.onchange=function(){draw();};draw();
 function draw(){var r=rs.filter(function(x){return x.state===sel.value;})[0],cv=document.getElementById("sccv"),c=cv.getContext("2d"),t=window.ENR.trustOf(r)||"No votes counted yet";
  var src=(r.results_sources||{}).ap||(r.results_sources||{}).official||"";
  c.fillStyle="#fff";c.fillRect(0,0,1200,630);c.fillStyle="#111";c.fillRect(0,0,1200,90);c.fillStyle="#fff";c.font="bold 40px system-ui,sans-serif";c.fillText("Election Night 2026 · US Senate",40,60);
  c.fillStyle="#111";c.font="bold 64px system-ui,sans-serif";c.fillText(r.name,40,190);c.font="34px system-ui,sans-serif";
  var cd=(r.candidates||[]).map(function(x){return x.name+" ("+x.party+")";}).join("  vs  ");c.fillText(cd,40,250);
  c.font="bold 80px system-ui,sans-serif";c.fillText(r.current_margin==null?"Counting not started":M(r.current_margin),40,360);
  c.font="34px system-ui,sans-serif";c.fillText((r.pct_in==null?"0":r.pct_in)+"% of expected vote counted",40,420);
  c.strokeStyle="#111";c.lineWidth=3;c.strokeRect(40,445,c.measureText(t).width+30,52);c.fillText(t,55,483);
  c.font="24px system-ui,sans-serif";c.fillStyle="#333";c.fillText("Source: "+src,40,545);c.fillText("As of "+(D.updated_at||"")+" · "+SITE,40,585);
  document.getElementById("scalt").textContent="Card text: "+r.name+", "+cd+", "+(r.current_margin==null?"counting not started":M(r.current_margin))+", "+(r.pct_in||0)+"% in, "+t+". Source "+src+". As of "+(D.updated_at||"")+".";
  document.getElementById("scdl").onclick=function(){var a=document.createElement("a");a.download="race-"+r.state+".png";a.href=cv.toDataURL("image/png");a.click();};
  var sh=document.getElementById("scsh");sh.onclick=function(){cv.toBlob(function(b){var f=new File([b],"race-"+r.state+".png",{type:"image/png"});var d={title:"Election Night 2026: "+r.name,text:r.name+" Senate: "+document.getElementById("scalt").textContent,url:SITE};
   if(navigator.canShare&&navigator.canShare({files:[f]}))d.files=[f];if(navigator.share)navigator.share(d).catch(function(){});else{navigator.clipboard&&navigator.clipboard.writeText(SITE);sh.textContent="Link copied";}});};}}
glossary();
document.addEventListener("enr-data",function(){var D=window.ENR.DATA;headTerms();out(D);persp(D);trends(D);share(D);loadHist();arrows();});
document.addEventListener("enr-map",arrows);
})();

(function(){
"use strict";
var FIPS={"02":"AK","19":"IA","20":"KS","23":"ME","26":"MI","39":"OH","48":"TX","37":"NC","45":"SC"};
var DATA=null,VIEW="status",GEO=null;window.ENR={};
var VIEWS=[["status","Senate status"],["current","Current margin"],["projected","Model projection"],["miss","Polling miss"],["ev","Early-vote signal"],["shift22","Shift vs 2022"],["shift24","Shift vs 2024"]];
var NOTE={status:"Called = AP or a network decision desk has called the race (caller shown). Leading = votes counted, no call.",
 current:"Current vote margin, Democrat minus Republican, from counted votes.",
 projected:"Independent model projection, not a call.",
 miss:"Polling miss = result margin minus polling average (D minus R). Positive (purple) = Democrat beat the polls; negative (orange) = Republican beat the polls.",
shift22:"Arrows show the shift vs 2022: left arrow = toward Democrats, right arrow = toward Republicans; longer = bigger. Before counting starts this uses the early-vote registration signal (NC, IA, ME only); after counting starts it uses the results margin vs the 2022 result.",shift24:"Arrows show the shift vs the 2024 result once counting starts. No early-vote comparison to 2024 is shown before then.",
 ev:"Party-registration share of early ballots vs. the same point in 2022. Registration is not vote choice. Low confidence."};
var DASH="–";
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function m(v){if(v==null||v==="")return DASH;v=+v;if(isNaN(v))return DASH;return v===0?"Even":(v>0?"D+":"R+")+Math.abs(v).toFixed(1);}
function mc(v){return v==null?"":(+v>0?"D":+v<0?"R":"");}
function link(u,t){return u?'<a href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(t||"source")+"</a>":"";}
var marg=d3.scaleLinear().domain([-15,0,15]).range(["#b2182b","#f7f7f7","#2166ac"]).clamp(true);
var missS=d3.scaleLinear().domain([-8,0,8]).range(["#e66101","#f7f7f7","#5e3c99"]).clamp(true);
function race(st){return DATA&&DATA.races.filter(function(r){return r.state===st;})[0];}
function fill(st){var r=race(st);if(!r)return"#e4e4e4";if(/^shift/.test(VIEW))return"#e8e8e8";var mp=r.map||{};
 if(VIEW==="status"){var c=r.call||{};if(c.status==="called"){return c.winner==="D"?"#2166ac":c.winner==="R"?"#b2182b":"#777";}
  if(r.current_margin!=null)return +r.current_margin>0?"#92c5de":+r.current_margin<0?"#f4a582":"#ddd";return"#bdbdbd";}
 if(VIEW==="current")return r.current_margin==null?"#bdbdbd":marg(r.current_margin);
 if(VIEW==="projected")return r.projected_margin==null?"#bdbdbd":marg(r.projected_margin);
 if(VIEW==="miss"){var pm=missOf(r);return pm==null?"#bdbdbd":missS(pm);}
 if(VIEW==="ev"){var s=(evOf(st)||{}).signal||"";return /leans D/.test(s)?"#92c5de":/leans R/.test(s)?"#f4a582":"#d9d9d9";}
}
function missOf(r){if(r.current_margin==null||!r.polling_avg||r.polling_avg.margin_dem_minus_rep==null)return null;return +r.current_margin-+r.polling_avg.margin_dem_minus_rep;}
function evOf(st){return DATA.early_vote&&DATA.early_vote.states?DATA.early_vote.states[st]:null;}
function cands(r,p){var c=(r.candidates||[]).filter(function(x){return x.party===p;})[0];return c?c.name:DASH;}
function callTxt(r){var c=r.call||{};if(c.status==="called")return"Called"+(c.winner?" ("+c.winner+")":"")+" by "+esc(c.by||DASH)+(c.time_mt?" · "+esc(c.time_mt):"");return c.status?esc(c.status):"not called";}
function tipHtml(st){var r=race(st);if(!r)return"<b>No tracked Senate race</b>";var pa=r.polling_avg||{},e=evOf(st)||{};
 var srcs=(pa.inputs||[]).map(function(i){return link(i.url,i.source);}).join(", ");
 return"<b>"+esc(r.name)+" · Senate</b><br>"+esc(cands(r,"D"))+" (D) vs "+esc(cands(r,"R"))+" (R)<br>Status: "+callTxt(r)+
 "<br>Current: "+m(r.current_margin)+" · "+(r.pct_in==null?DASH:r.pct_in+"%")+" in<br>Model projection (not a call): "+m(r.projected_margin)+
 "<br>Poll avg: "+m(pa.margin_dem_minus_rep)+(srcs?" ("+srcs+")":"")+"<br>Polling miss: "+m(missOf(r))+
 "<br>Early vote: "+esc(e.signal||DASH)+(e.confidence?" ("+esc(e.confidence)+" conf.)":"")+
 "<br>Polls close: "+esc(r.poll_close_mt||DASH)+"<br>"+link((r.results_sources||{}).ap,"AP results")+" "+link((r.results_sources||{}).official,"Official");}
function legend(){var L={status:[["#2166ac","Called D"],["#b2182b","Called R"],["#92c5de","D leading"],["#f4a582","R leading"],["#bdbdbd","Not reporting"],["#e4e4e4","No tracked race"]],
 current:[[marg(-15),"R+15"],[marg(-5),"R+5"],[marg(0),"Even"],[marg(5),"D+5"],[marg(15),"D+15"],["#bdbdbd","No results"]],
 miss:[[missS(-8),"R beat polls 8+"],[missS(-3),"R +3"],[missS(0),"On polls"],[missS(3),"D +3"],[missS(8),"D beat polls 8+"],["#bdbdbd","No results"]],
 ev:[["#92c5de","Leans D vs 2022"],["#d9d9d9","Neutral / no party data"],["#f4a582","Leans R vs 2022"],["#e4e4e4","No tracked race"]]};L.projected=L.current;L.shift22=L.shift24=[["#555","← toward D","→ toward R"]].map(function(x){return[x[0],x[1]+" · "+x[2]];});
 document.getElementById("legend").innerHTML=L[VIEW].map(function(x){return'<span><i class="sw" style="background:'+x[0]+'"></i>'+esc(x[1])+"</span>";}).join("");
 document.getElementById("viewnote").textContent=NOTE[VIEW];}
function drawMap(){if(!GEO)return;var svg=d3.select("#map"),tip=document.getElementById("tip"),box=document.getElementById("mapbox");
 var p=svg.selectAll("path.st").data(GEO,function(d){return d.id;});
 p.enter().append("path").attr("class",function(d){return"st"+(FIPS[d.id]?" key":"");}).attr("d",d3.geoPath())
  .on("mousemove click",function(ev,d){var st=FIPS[d.id];if(!st){tip.hidden=true;return;}tip.innerHTML=tipHtml(st);tip.hidden=false;
   var b=box.getBoundingClientRect(),x=ev.clientX-b.left+12,y=ev.clientY-b.top+12;if(x>b.width-270)x=Math.max(0,x-280);tip.style.left=x+"px";tip.style.top=y+"px";ev.stopPropagation();})
  .on("mouseleave",function(){tip.style.pointerEvents="none";})
  .merge(p).attr("fill",function(d){return fill(FIPS[d.id]);});
 svg.selectAll("path.key").raise();window.ENR.GEO=GEO;window.ENR.VIEW=VIEW;document.dispatchEvent(new CustomEvent("enr-map"));document.body.addEventListener("click",function(){tip.hidden=true;},{once:false});legend();}
function views(){document.getElementById("views").innerHTML=VIEWS.map(function(v){return'<button type="button" aria-pressed="'+(v[0]===VIEW)+'" data-v="'+v[0]+'" class="'+(v[0]===VIEW?"on":"")+'">'+v[1]+"</button>";}).join("");
 Array.prototype.forEach.call(document.querySelectorAll("#views button"),function(b){b.onclick=function(){VIEW=b.dataset.v;views();drawMap();};});}
function seats(){var s=DATA.seat_tracker||{},se=s.senate||{},h=s.house||{},c=se.current||{},pc=s.paths_to_control||{};
 var D=(c.D||0)+(c.I_caucus_D||0),tot=D+(c.R||0)||100,cal=se.called||{};
 var html='<div class="card"><b>Senate (current composition)</b><div class="bar"><div style="width:'+(D/tot*100)+'%;background:var(--D)"></div><div style="width:'+(c.R/tot*100)+'%;background:var(--R)"></div></div>'+
 '<span class="D">D '+c.D+' + '+c.I_caucus_D+' I</span> · <span class="R">R '+c.R+'</span> · '+link(c.source)+'<br><span class="small">Called tonight: D '+(cal.D==null?DASH:cal.D)+' · R '+(cal.R==null?DASH:cal.R)+' · '+esc(se.seats_up||"")+' seats up ('+esc(se.seats_up_note||"")+')</span>'+
 '<p>'+esc(pc.senate||se.control_math||"")+" "+link(pc.source||se.source)+"</p></div>";
 var hc=h.current||{};html+='<div class="card"><b>House</b><div class="bar"><div style="width:'+(hc.D/435*100)+'%;background:var(--D)"></div><div style="width:'+((435-hc.D-hc.R)/435*100)+'%;background:#ccc"></div><div style="width:'+(hc.R/435*100)+'%;background:var(--R)"></div></div>'+
 '<span class="D">D '+hc.D+'</span> · <span class="R">R '+hc.R+'</span> · I '+(hc.I||0)+' · vacant '+((hc.vacancies||[]).join(", ")||0)+' · '+link(h.source)+'<p>'+esc(pc.house||("Majority: "+h.majority))+'</p></div>';
 document.getElementById("seats").innerHTML=html;}
function hist(r,y){var p=r["poll_"+y]||{},res=r["margin_"+y]||{},lab=esc(p.race||res.race||"");
 var tip=p.margin_dem_minus_rep==null?(p.note||"No final polling average found"):(p.label?p.label+". ":"")+"Final poll average = mean of: "+(p.inputs||[]).map(function(i){return i.source+" "+m(i.margin_dem_minus_rep)+" ("+i.as_of+"; "+(i.archive||i.url)+")";}).join("; ")+"."+(p.note?" "+p.note:"");
 var miss=p.miss==null?"":'<span class="small">Miss: '+(p.miss>0?"D beat polls by ":p.miss<0?"R beat polls by ":"on polls ")+(p.miss?Math.abs(p.miss).toFixed(1):"")+"</span>";
 return'<td class="stack"><span class="small">'+lab+'</span><span>Poll: <abbr tabindex="0" title="'+esc(tip)+'" aria-label="Poll average '+esc(m(p.margin_dem_minus_rep))+'. '+esc(tip)+'">'+(p.margin_dem_minus_rep==null?"—":m(p.margin_dem_minus_rep))+'</abbr>'+(p.label?' <span class="trust">'+esc(p.label)+'</span>':"")+'</span><span>Result: <b class="'+mc(res.value)+'">'+m(res.value)+"</b></span>"+miss+"</td>";}
function trustOf(r){var c=r.call||{};if(c.status==="called")return"Called by AP/network";if(r.current_margin!=null)return"Official count";if(r.projected_margin!=null)return"Model projection";return null;}
window.ENR.trustOf=trustOf;
function table(){document.querySelector("#races tbody").innerHTML=DATA.races.map(function(r){var pa=r.polling_avg||{},t=trustOf(r);
 return"<tr><th scope=row>"+esc(r.state)+"</th><td class=D>"+esc(cands(r,"D"))+"</td><td class=R>"+esc(cands(r,"R"))+"</td><td class="+mc(pa.margin_dem_minus_rep)+">"+m(pa.margin_dem_minus_rep)+
 "</td>"+hist(r,"2022")+hist(r,"2024")+"<td>"+esc(r.poll_close_mt||DASH)+
 "</td><td class="+mc(r.current_margin)+">"+m(r.current_margin)+(t&&r.current_margin!=null?' <span class="trust">'+esc(t)+"</span>":"")+"</td><td>"+(r.pct_in==null?DASH:r.pct_in+"%")+"</td><td>"+m(r.projected_margin)+(r.projected_margin!=null?' <span class="trust">Model projection</span>':"")+(r.projection_confidence?" <span class=small>("+esc(r.projection_confidence)+")</span>":"")+"</td><td>"+callTxt(r)+"</td></tr>";}).join("")+
 '<tr><td colspan=11 class=small>Poll avg: simple mean of listed averages. 2022/2024: final polling average (mean of final aggregator averages, with RealClearPolling taken from RCP\'s own archived page; "RCP only" = RCP was the only average found; hover or focus the number for sources and dates) over the MEDSL statewide result; "miss" = result minus poll average. Where no Senate race was held, the comparison race is named (e.g. Governor, President 2024). — = no final polling average found. Results: AP / state election offices once polls close.</td></tr>';}
function early(){var e=DATA.early_vote||{},o=e.overall_direction_vs_2022||{},h="";
 h+='<div class="card"><b>Direction vs 2022:</b> <span class="trust" title="From an independent early-vote tracker; not yet checked against official state data">Tracker data</span> '+esc(o.summary||DASH)+' <span class="pill">'+esc(o.confidence||"")+' confidence</span><br><span class="small">'+esc(o.source||"")+"</span></div>";
 h+='<div class="tblwrap"><table><thead><tr><th>State</th><th>Ballots</th><th>vs 2022</th><th>Reg. gap now</th><th>Gap 2022</th><th>Signal</th><th>Conf.</th><th>As of</th><th>Source</th></tr></thead><tbody>';
 Object.keys(e.states||{}).forEach(function(k){var s=e.states[k],f=s.figures||{};var g=function(v){return v==null?DASH:m(v);};
  h+="<tr><td><b>"+k+"</b></td><td>"+(f.total?(+f.total).toLocaleString():DASH)+"</td><td>"+esc(f.vs_2022_change||DASH)+"</td><td>"+g(f.gap_now)+"</td><td>"+g(f.gap_2022)+"</td><td>"+esc(s.signal||DASH)+"</td><td>"+esc(s.confidence||DASH)+"</td><td class=small>"+esc(s.as_of_mt||"")+"</td><td>"+(s.sources||[]).map(function(x){return link(x.url,x.name.split(",")[0]);}).join("<br>")+"</td></tr>";});
 h+='</tbody></table></div><p class="small">Reg. gap = Democratic minus Republican share of early ballots by party registration (points). Caveats: '+esc((e.general_caveats||[]).join("; "))+".</p>";
 document.getElementById("ev").innerHTML=h;}
function closings(){var c=DATA.poll_closings_mt||{};var keys=["AK","IA","KS","ME","MI","OH","TX","NC","SC"];
 document.getElementById("closings").innerHTML='<div class="tblwrap"><table><tbody>'+Object.keys(c).filter(function(k){return k!=="source";}).map(function(k){
  var s=esc(c[k]).replace(/\b(AK|IA|KS|ME|MI|OH|TX|NC|SC)\b/g,"<b>$1</b>");return"<tr><td><b>"+esc(k)+" MT</b></td><td style='white-space:normal'>"+s+"</td></tr>";}).join("")+"</tbody></table></div><p class=small>Bold = key races tracked here. "+link((c.source||"").split(" ")[0],"Source")+" "+esc((c.source||"").replace(/^\S+\s*/,""))+"</p>";}
function alerts(){var a=[].concat((DATA.calls_log||[]).map(function(x){x._t="Call";return x;}),(DATA.alerts||[]));
 document.getElementById("alerts").innerHTML=a.length?a.map(function(x){return'<div class="card"><span class="pill">'+esc(x._t||x.type||"Alert")+"</span> "+(x.trust||x._t==="Call"?'<span class="trust">'+esc(x.trust||"Called by AP/network")+"</span> ":"")+"<b>"+esc(x.time_mt||"")+"</b> "+esc(x.text||x.summary||(x.state?x.state+" called for "+x.winner+" by "+x.by:""))+" "+link(x.source||x.url)+"</div>";}).join(""):'<p class="small">No calls or alerts yet. Results begin after polls close.</p>';}
function notes(){document.getElementById("notes").innerHTML=(DATA.notes||[]).map(function(n){return"<li>"+esc(n)+"</li>";}).join("")+(DATA.map_notes?"<li>"+esc(DATA.map_notes)+"</li>":"");}
var TK_ALL=false;
function takeaways(){var t=DATA.takeaways||[],s=DATA.takeaways_summary,f=document.getElementById("tk-feed"),b=document.getElementById("tk-more");
 document.getElementById("tk-sum").innerHTML=s?'<h3>Bottom line right now</h3><p>'+esc(s)+'</p>':"";
 var n=TK_ALL?t.length:Math.min(6,t.length);
 f.innerHTML=t.slice(0,n).map(function(x){var cls=String(x.tag||"note").replace(/[^a-z]/g,"");return'<li><article class="tk-card"><div class="tk-meta"><span class="tk-tag tag-'+cls+'">'+esc(x.tag||"note")+'</span> <time>'+esc(x.time_mt||"")+'</time>'+(x.trust?' <span class="trust"'+(x.trust==="Tracker data"?' title="From an independent early-vote tracker; not yet checked against official state data"':'')+'>'+esc(x.trust)+'</span>':'')+(x.confidence?' <span class="tk-conf">Confidence: '+esc(x.confidence)+'</span>':"")+'</div><h3>'+esc(x.headline)+'</h3><p>'+esc(x.detail||"")+'</p>'+(x.source_url||x.source_label?'<p class="tk-src">Source: '+(x.source_url?link(x.source_url,x.source_label||x.source_url):esc(x.source_label))+'</p>':"")+'</article></li>';}).join("")||"<li>No takeaways yet.</li>";
 b.hidden=t.length<=6;b.textContent=TK_ALL?"Show fewer":"Show more ("+(t.length-6)+" more)";b.setAttribute("aria-expanded",TK_ALL?"true":"false");
 b.onclick=function(){TK_ALL=!TK_ALL;takeaways();};}
function render(){var ud=new Date(String(DATA.updated_at||"").replace(/\s*\(.*\)\s*$/,""));document.getElementById("updated").textContent=isNaN(ud)?(DATA.updated_at||DASH):ud.toLocaleString("en-US",{timeZone:"America/Denver",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})+" MT";
 var anyRes=DATA.races.some(function(r){return r.current_margin!=null;});
 document.getElementById("status").textContent=(DATA.status_note||"")+(anyRes||/polls close/.test(DATA.status_note||"")?"":" Results begin after polls close.");
window.ENR.DATA=DATA; takeaways();seats();table();early();closings();alerts();notes();drawMap();document.dispatchEvent(new CustomEvent("enr-data"));}
function load(){var dot=document.getElementById("dot");fetch("data.json?t="+Date.now(),{cache:"no-store"}).then(function(r){if(!r.ok)throw r.status;return r.json();})
 .then(function(d){DATA=d;render();dot.className="dot ok";document.getElementById("refresh").textContent="checked "+new Date().toLocaleTimeString("en-US",{timeZone:"America/Denver",hour:"numeric",minute:"2-digit",second:"2-digit"})+" MT · refreshes every 60s";})
 .catch(function(e){dot.className="dot err";document.getElementById("refresh").textContent="refresh failed; retrying in 60s";console.error(e);});}
views();
fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json").then(function(r){return r.json();}).then(function(us){GEO=topojson.feature(us,us.objects.states).features;if(DATA)drawMap();}).catch(function(e){console.error("map",e);});
load();setInterval(load,60000);
})();

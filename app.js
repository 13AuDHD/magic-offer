'use strict';
const defaults={mpg:'11',price:'4.599',minHourly:'10',goodHourly:'16',minNet:'3',returnMultiplier:'2',returnTime:'0.5',theme:'system'};
const fields=['offer','miles','minutes',...Object.keys(defaults)];
const $=id=>document.getElementById(id);
const readSettings=()=>{try{return {...defaults,...JSON.parse(localStorage.getItem('moc-settings')||'{}')}}catch{return {...defaults}}};
let settings=readSettings();
for(const [k,v] of Object.entries(settings)){if($(k))$(k).value=v}
function num(id){const s=$(id).value.trim();return s===''?NaN:Number(s)}
function money(n){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n)}
function calculate(){const pay=num('offer'),miles=num('miles'),mins=num('minutes'),mpg=num('mpg'),price=num('price'),distanceFactor=num('returnMultiplier'),timeFactor=num('returnTime');const valid=[pay,miles,mins,mpg,price,distanceFactor,timeFactor].every(Number.isFinite)&&pay>0&&miles>=0&&mins>0&&mpg>0&&price>=0&&distanceFactor>=1&&timeFactor>=0;const verdict=$('verdict');if(!valid){verdict.textContent='ENTER OFFER';verdict.className='verdict neutral';$('net').textContent='$0.00';$('fuelCost').textContent='$0.00';$('totalMiles').textContent='0.0 mi';$('hourly').textContent='$0.00';return}const totalMiles=miles*distanceFactor,fuelCost=totalMiles/mpg*price,net=pay-fuelCost,hourly=net/(mins*(1+timeFactor)/60);$('net').textContent=money(net);$('fuelCost').textContent=money(fuelCost);$('totalMiles').textContent=totalMiles.toFixed(1)+' mi';$('hourly').textContent=money(hourly);const minimum=num('minHourly'),good=num('goodHourly'),minimumNet=num('minNet');let label='MAYBE',cls='maybe';if(net<minimumNet||hourly<minimum){label='DECLINE';cls='bad'}else if(hourly>=good){label='ACCEPT';cls='good'}verdict.textContent=label;verdict.className='verdict '+cls}
for(const id of fields){$(id).addEventListener('input',()=>{if(Object.hasOwn(defaults,id)){settings[id]=$(id).value;try{localStorage.setItem('moc-settings',JSON.stringify(settings))}catch{}if(id==='theme')applyTheme()}calculate()});$(id).addEventListener('change',calculate)}
function applyTheme(){const theme=$('theme').value;document.documentElement.dataset.theme=theme}
applyTheme();calculate();
$('settingsButton').addEventListener('click',()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settingsButton').setAttribute('aria-expanded',String(open))});
$('clearButton').addEventListener('click',()=>{for(const id of ['offer','miles','minutes'])$(id).value='';calculate();$('offer').focus()});
$('resetButton').addEventListener('click',()=>{settings={...defaults};for(const [k,v] of Object.entries(settings))$(k).value=v;try{localStorage.setItem('moc-settings',JSON.stringify(settings))}catch{}applyTheme();calculate()});
$('shareButton').addEventListener('click',async()=>{const url=location.href.split('#')[0].split('?')[0];try{if(navigator.share)await navigator.share({title:'Magic Offer Check',url});else if(navigator.clipboard){await navigator.clipboard.writeText(url);$('shareButton').textContent='Link copied';setTimeout(()=>$('shareButton').textContent='Share app',1800)}else prompt('Copy app link:',url)}catch(e){if(e.name!=='AbortError')prompt('Copy app link:',url)}});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

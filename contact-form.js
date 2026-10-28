/* Home Organizers LI — Contact form (contact-form.js). Progressive enhancement: without JS the full form shows on one page.
   Analytics go through window.hoTrack (analytics.js): form_step, contact_modal_open, generate_lead. No names,
   emails, phones or towns are ever sent to GA4.
   Works for <section id="contact" class="hc-root"> (home) and <dialog id="contactModal" class="hc-root hc-modal"> (internal pages).
   Modal triggers: <a href="/#contact" data-open-contact="Closet">…</a> (value = a `need` option, or empty). */
(function(){
var form=document.getElementById('contactForm');if(!form)return;
var root=form.closest('.hc-root'),modal=root.tagName==='DIALOG'?root:null;
function $(id){return document.getElementById(id)}
var steps=[].slice.call(form.querySelectorAll('.hc-step'));
var stepNames=['Your space','Where & when','How to reach you'];
var progress=$('hcProgress'),bars=root.querySelectorAll('.hc-bar span'),status=$('hcStatus'),formError=$('formError'),success=$('hcSuccess'),photoInput=$('hcPhoto'),thumbs=$('hcThumbs'),sendRow=form.querySelector('.hc-send');
var MAX_PHOTOS=3,MAX_BYTES=8*1024*1024,cur=0,files=[],sending=false,lastKey='',pointer=false,adv=0,opener=null,stepsSeen={0:true};
function track(name,params){if(window.hoTrack)window.hoTrack(name,params||{})}
function where(){return modal?'modal':'home'}
var M={ /* error copy — draft, review */
 need:'Pick the space that’s on your mind most — you can tell us about the rest later.',
 location:'Add your town or ZIP so we know where you are.',
 timeline:'Choose one — “Just exploring” is perfectly fine.',
 fullName:'What should we call you?',
 contactPref:'Let us know how you’d like to hear from us.',
 phoneReq:'Add a phone number so we can text or call you.',
 phoneBad:'That number looks a little short — mind double-checking it?',
 emailReq:'Add your email so we can write back.',
 emailBad:'That email doesn’t look quite right — mind double-checking it?',
 photoMax:'Up to 3 photos, please — your first 3 are saved.',
 photoSize:'Those photos add up to more than 8 MB. Try fewer, or text them to us later.'
};
function enhanced(){return root.classList.contains('is-enhanced')}
function val(n){var el=form.elements[n];if(!el)return'';if(el instanceof RadioNodeList||(el.length!==undefined&&el.tagName!=='INPUT'&&el.tagName!=='TEXTAREA')){for(var i=0;i<el.length;i++)if(el[i].checked)return el[i].value;return''}return el.type==='radio'?(el.checked?el.value:''):(el.value||'').trim()}
function setErr(n,msg){var p=$('err-'+n);if(!p)return;var wrap=form.querySelector('[data-for="'+n+'"]'),inputs=form.querySelectorAll('[name="'+n+'"]');
 if(msg){p.lastElementChild.textContent=msg;p.hidden=false;wrap&&wrap.classList.add('is-invalid');inputs.forEach(function(i){i.setAttribute('aria-invalid','true')})}
 else{p.hidden=true;wrap&&wrap.classList.remove('is-invalid');inputs.forEach(function(i){i.removeAttribute('aria-invalid')})}}
function check(n){var v=val(n),pref=val('contactPref');
 switch(n){
 case'need':case'location':case'timeline':case'fullName':case'contactPref':return v?'':M[n];
 case'phone':if(!v)return(pref==='Text'||pref==='Call')?M.phoneReq:'';return v.replace(/\D/g,'').length<10?M.phoneBad:'';
 case'email':if(!v)return pref==='Email'?M.emailReq:'';return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)?'':M.emailBad;
 case'photo':return files.reduce(function(a,f){return a+f.size},0)>MAX_BYTES?M.photoSize:'';}
 return''}
var fieldsByStep=[['need'],['location','timeline'],['fullName','contactPref','phone','email','photo']];
function validate(i,noFocus){var first=null;fieldsByStep[i].forEach(function(n){var m=check(n);setErr(n,m);if(m&&!first)first=n});
 if(first&&!noFocus){var el=form.querySelector('[name="'+first+'"]:checked')||form.querySelector('[name="'+first+'"]');el&&el.focus()}return !first}
function show(i,focus){root.classList.toggle('is-back',i<cur);cur=i;
 if(!stepsSeen[i]){stepsSeen[i]=true;track('form_step',{step:i+1,step_name:stepNames[i],form_location:where(),need:val('need')})}
 steps.forEach(function(s,k){s.hidden=k!==i});
 bars.forEach(function(b,k){b.classList.toggle('is-on',k<=i)});
 progress.innerHTML='<b>Step '+(i+1)+' of 3</b> · '+stepNames[i];
 sendRow.hidden=i!==2;
 if(modal){var body=modal.querySelector('.hc-modal-body');if(body)body.scrollTop=0}
 if(focus){var s=steps[i],t=pointer?s:(s.querySelector('input:checked')||s.querySelector('input:not([type=hidden]):not([type=file]),textarea')||s);t.focus({preventScroll:true});
  if(!modal){var top=root.querySelector('.hc-panel').getBoundingClientRect().top;if(top<0)window.scrollBy({top:top-24,behavior:'smooth'})}}}
function pickNeed(){if(!enhanced())return;setErr('need','');form.dataset.touched='1';clearTimeout(adv);adv=setTimeout(function(){if(cur===0&&val('need'))show(1,true)},240)}
function updateReq(){var p=val('contactPref'),ph=$('hcPhone'),em=$('hcEmail'),phReq=p==='Text'||p==='Call',emReq=p==='Email';ph.required=phReq;em.required=emReq;
 [['phone',phReq],['email',emReq]].forEach(function(x){var t=$('tag-'+x[0]);t.textContent=p?(x[1]?'Required':'(optional)'):'';t.classList.toggle('is-req',x[1])});
 ['phone','email'].forEach(function(n){if(!$('err-'+n).hidden)setErr(n,check(n))})}
function renderThumbs(){thumbs.innerHTML='';files.forEach(function(f,i){var li=document.createElement('li'),img=document.createElement('img');img.alt='';img.src=URL.createObjectURL(f);
 var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Remove photo '+(i+1)+' ('+f.name+')');b.innerHTML='<span class="ms" aria-hidden="true">close</span>';
 b.onclick=function(){files.splice(i,1);sync();renderThumbs();setErr('photo',check('photo'));photoInput.focus()};li.append(img,b);thumbs.appendChild(li)})}
function sync(){try{var dt=new DataTransfer();files.forEach(function(f){dt.items.add(f)});photoInput.files=dt.files}catch(e){}}
function addFiles(list){var inc=[].slice.call(list).filter(function(f){return /^image\//.test(f.type)}),over=files.length+inc.length>MAX_PHOTOS;
 files=files.concat(inc).slice(0,MAX_PHOTOS);sync();renderThumbs();setErr('photo',over?M.photoMax:check('photo'))}
function setSending(on){sending=on;form.classList.toggle('is-sending',on);form.querySelector('.hc-btn-main').setAttribute('aria-disabled',on?'true':'false');form.setAttribute('aria-busy',on?'true':'false');status.textContent=on?'Sending your request…':''}
function showError(on){formError.hidden=!on}
function done(){form.hidden=true;var n=val('fullName').split(' ')[0];$('hcSuccessName').textContent=n?', '+n:'';success.hidden=false;success.querySelector('h3').focus()}
function send(fd){['photo','photo2','photo3'].forEach(function(n){fd.delete(n)});
 files.forEach(function(f,i){fd.append(i?'photo'+(i+1):'photo',f,f.name)});
 return fetch('/',{method:'POST',body:fd}).then(function(r){if(!r.ok)throw new Error(r.status)})}
function enable(){root.classList.add('is-enhanced');form.noValidate=true;show(cur,false);updateReq()}
function disable(){root.classList.remove('is-enhanced');form.noValidate=false;steps.forEach(function(s){s.hidden=false});sendRow.hidden=false}
function reset(){clearTimeout(adv);form.reset();delete form.dataset.touched;files=[];renderThumbs();form.hidden=false;success.hidden=true;showError(false);setSending(false);
 ['need','location','timeline','fullName','contactPref','phone','email','photo'].forEach(function(n){setErr(n,'')});cur=0;stepsSeen={0:true};enable();updateReq()}
/* events */
form.addEventListener('pointerdown',function(){pointer=true;lastKey=''},true);
form.addEventListener('keydown',function(e){pointer=false;lastKey=e.key;if(e.key==='Enter'&&e.target.name==='need'){e.preventDefault();e.target.checked=true;pickNeed()}},true);
form.addEventListener('click',function(e){var t=e.target;
 if(t.name==='need'){if(/^Arrow/.test(lastKey)){lastKey='';return}pickNeed();return}
 var n=t.closest('[data-next]'),b=t.closest('[data-back]');
 if(n&&validate(cur))show(cur+1,true);if(b&&cur>0&&!sending)show(cur-1,true)});
form.addEventListener('submit',function(e){if(!enhanced())return;e.preventDefault();if(sending)return;
 if(cur<2){if(validate(cur))show(cur+1,true);return}
 for(var i=0;i<3;i++){if(!validate(i,true)){show(i,false);validate(i);return}}
 showError(false);setSending(true);
 (window.HOContactSubmit||send)(new FormData(form)).then(function(){setSending(false);
  track('generate_lead',{need:val('need')||'not specified',timeline:val('timeline'),contact_pref:val('contactPref'),photos:files.length,form_location:where()});
  done()},function(){setSending(false);showError(true)})});
form.addEventListener('change',function(e){var n=e.target.name;if(n==='contactPref')updateReq();if(n==='photo'){addFiles(e.target.files);return}
 var p=n&&$('err-'+n);if(p&&!p.hidden)setErr(n,check(n))});
form.addEventListener('input',function(e){var n=e.target.name,p=n&&$('err-'+n);if(p&&!p.hidden)setErr(n,check(n))});
var drop=root.querySelector('.hc-drop');
['dragenter','dragover'].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.add('is-over')})});
['dragleave','drop'].forEach(function(t){drop.addEventListener(t,function(){drop.classList.remove('is-over')})});
drop.addEventListener('drop',function(e){e.preventDefault();addFiles(e.dataTransfer.files)});
/* modal */
function open(need,trigger){if(!modal)return;opener=trigger||document.activeElement;if(!success.hidden)reset();
 if(need&&!form.dataset.touched){var r=form.querySelector('[name="need"][value="'+need+'"]');if(r)r.checked=true}
 if(!modal.open){modal.showModal();track('contact_modal_open',{preset:need||'none'})}show(cur,false);
 var f=cur===0?(form.querySelector('[name=need]:checked')||form.querySelector('[name=need]')):steps[cur];f&&f.focus()}
function close(){if(modal&&modal.open)modal.close()}
if(modal){
 document.addEventListener('click',function(e){var t=e.target.closest('[data-open-contact]');if(!t)return;e.preventDefault();open(t.getAttribute('data-open-contact'),t)});
 modal.addEventListener('click',function(e){if(e.target===modal)close();if(e.target.closest('[data-close]'))close()});
 modal.addEventListener('close',function(){if(!success.hidden)reset();if(opener&&opener.focus)opener.focus()});
}
enable();
window.HOContact={show:show,validate:validate,setErr:setErr,setSending:setSending,showError:showError,done:done,enable:enable,disable:disable,reset:reset,open:open,close:close,modal:modal,updateReq:updateReq};
})();

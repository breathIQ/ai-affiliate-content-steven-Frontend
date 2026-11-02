(async()=>{
 const central='https://carbogenetics.com';
 const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
 try{
 const p=new URLSearchParams(location.hash.slice(1));
 if(p.has('code')){
  history.replaceState(null,'','/affiliate-connect.html');
  const saved=JSON.parse(sessionStorage.getItem('affiliate_network_connect')||'null');
  sessionStorage.removeItem('affiliate_network_connect');
  if(!saved||saved.state!==p.get('state')||saved.expires<Date.now())throw new Error('This sign-in request expired. Please start again.');
  const r=await fetch(central+'/api/affiliate/network/consume',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:p.get('code'),verifier:saved.verifier,brand:'co2body'})});
  const data=await r.json();if(!r.ok)throw new Error(data.error||'Sign-in failed.');
  localStorage.setItem('user',JSON.stringify(data.user));localStorage.setItem('access_token',data.user.access_token);
  location.replace('/u/dashboard');
 }else{
  const verifier=hex(crypto.getRandomValues(new Uint8Array(32))),state=hex(crypto.getRandomValues(new Uint8Array(16)));
  const challenge=hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
  sessionStorage.setItem('affiliate_network_connect',JSON.stringify({verifier,state,expires:Date.now()+600000}));
  location.replace(central+'/affiliate/brands?'+new URLSearchParams({brand:'co2body',challenge,state}));
 }
 }catch(e){document.getElementById('status').textContent=e.message;const a=document.createElement('a');a.href='/affiliate-connect.html';a.textContent='Try sign-in again';document.querySelector('main').append(a);}
})();

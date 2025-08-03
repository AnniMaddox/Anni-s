/* iPhone PWA fix */
document.addEventListener('DOMContentLoaded', () => {
  const isiPhonePWA = /iphone|ipod/i.test(navigator.userAgent) && !!window.navigator.standalone;
  if (!isiPhonePWA) return;
  const input = [...document.querySelectorAll('input,textarea')].find(el => el && el.offsetParent !== null);
  if (!input) return;
  const holder = input.closest('[style*="position:fixed"], .fixed, footer, .footer, #input-bar') || input.parentElement || document.body;
  const origPos = getComputedStyle(holder).position;
  function forceFocus(){
    holder.style.position='static';
    requestAnimationFrame(()=>{ input.focus(); setTimeout(()=>{ input.focus(); holder.style.position = origPos || ''; }, 50); });
  }
  window.addEventListener('pageshow', ()=>setTimeout(forceFocus,0), {once:true});
  input.addEventListener('touchend', ()=>setTimeout(forceFocus,0), {passive:true});
});

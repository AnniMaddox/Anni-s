// Tools drawer functionality
(() => {
  const init = () => {
    const area  = document.getElementById('chat-input-area');
    const input = document.getElementById('chat-input');
    if (!area) return;

    // Create + button if missing
    let plusBtn = document.getElementById('plus-btn');
    if (!plusBtn) {
      const sample = area.querySelector('button');
      plusBtn = document.createElement('button');
      plusBtn.id = 'plus-btn';
      if (sample) plusBtn.className = sample.className;
      plusBtn.textContent = '+';
      plusBtn.setAttribute('aria-label', '+');
      area.insertBefore(plusBtn, area.firstChild);
    }

    // Rename sticker button to emoji-btn
    const stickerBtn = document.getElementById('open-sticker-panel-btn');
    if (stickerBtn) {
      stickerBtn.id = 'emoji-btn';
      stickerBtn.setAttribute('aria-label', '表情');
      if (stickerBtn.childNodes.length === 1 && stickerBtn.childNodes[0].nodeType === 3) {
        stickerBtn.textContent = '😊';
      }
    }

    // Set up drawer container
    let drawer = document.getElementById('tools-drawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'tools-drawer';
      drawer.hidden = true;
      drawer.innerHTML = `
        <div class="drawer-mask" data-close></div>
        <div class="drawer-panel" role="dialog" aria-label="tools">
          <div class="drawer-header">
            <button class="drawer-close" data-close aria-label="關閉">✕</button>
            <button class="drawer-emoji" id="drawer-emoji-btn" aria-label="表情">😊</button>
          </div>
          <div class="drawer-body" id="drawer-body"></div>
        </div>`;
      area.insertAdjacentElement('afterend', drawer);
    }
    const bodyBox = drawer.querySelector('#drawer-body');

    // Assemble or find tool strip
    let strip = document.getElementById('tool-strip');
    if (!strip) {
      const candidates = [...area.querySelectorAll('button,a,[role="button"]')]
        .filter(el => !['plus-btn','emoji-btn','send-btn'].includes(el.id));
      if (candidates.length) {
        strip = document.createElement('div');
        strip.id = 'tool-strip';
        candidates.forEach(el => strip.appendChild(el));
        area.appendChild(strip);
      }
    }
    if (strip) {
      bodyBox.appendChild(strip);
    }

    const openDrawer = () => {
      drawer.hidden = false;
      requestAnimationFrame(() => drawer.classList.add('open'));
      if (input) input.blur();
      document.body.style.overflow = 'hidden';
    };
    const closeDrawer = () => {
      drawer.classList.remove('open');
      setTimeout(() => {
        drawer.hidden = true;
        document.body.style.overflow = '';
      }, 200);
    };

    plusBtn.addEventListener('click', () => {
      if (drawer.hidden) openDrawer(); else closeDrawer();
    });
    drawer.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) closeDrawer();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !drawer.hidden) closeDrawer();
    });
    if (strip) {
      strip.addEventListener('click', e => {
        const btn = e.target.closest('button,a,[role="button"]');
        if (!btn) return;
        setTimeout(closeDrawer, 100);
      });
    }
    const emojiBtnInDrawer = drawer.querySelector('#drawer-emoji-btn');
    if (emojiBtnInDrawer) {
      emojiBtnInDrawer.addEventListener('click', () => {
        if (typeof window.handleEmojiPanel === 'function') {
          window.handleEmojiPanel();
        }
      });
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// Tools drawer functionality
(() => {
  const init = () => {
    // 主輸入區與工具區容器
    const area  = document.getElementById('chat-input-area');
    const actionsTop = document.getElementById('chat-input-actions-top');
    const input = document.getElementById('chat-input');
    if (!area || !actionsTop) return;

    // Create drawer toggle button (smiley) if missing
    let toggleBtn = document.getElementById('drawer-toggle-btn');
    if (!toggleBtn) {
      const sampleBtn = actionsTop.querySelector('button');
      toggleBtn = document.createElement('button');
      toggleBtn.id = 'drawer-toggle-btn';
      toggleBtn.className = sampleBtn ? sampleBtn.className : '';
      toggleBtn.textContent = '😊';
      toggleBtn.setAttribute('aria-label', '更多工具');
      // 將開關插入工具列的最前面
      actionsTop.insertBefore(toggleBtn, actionsTop.firstChild);
    }

    // 不變更原本的 open-sticker-panel-btn （+號）

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
      // 將抽屜放在輸入區之後
      area.insertAdjacentElement('afterend', drawer);
    }
    const bodyBox = drawer.querySelector('#drawer-body');

    // Assemble or find tool strip
    let strip = document.getElementById('tool-strip');
    /**
     * 將工具按鈕搬移到抽屜
     */
    const moveToolsIntoDrawer = () => {
      // 取得 actionsTop 內的所有候選工具按鈕（排除 + 號、笑臉開關與 send）
      const candidates = Array.from(actionsTop.querySelectorAll('button,a,[role="button"]')).filter(
        el => !['open-sticker-panel-btn', 'drawer-toggle-btn', 'send-btn'].includes(el.id)
      );
      if (!candidates.length) return;
      // 一旦找到候選按鈕就停止掃描
      if (scanTimer) {
        clearInterval(scanTimer);
        scanTimer = null;
      }
      // 如果 strip 尚未存在，建立一個並指定 id
      if (!strip) {
        strip = document.createElement('div');
        strip.id = 'tool-strip';
      }
      // 將候選按鈕全部搬入 strip
      candidates.forEach(el => strip.appendChild(el));
      // 把 strip 放入抽屜內部
      bodyBox.appendChild(strip);
      // 為 strip 上的工具添加點擊事件，點擊後稍後關閉抽屜
      strip.addEventListener('click', e => {
        const btn = e.target.closest('button,a,[role="button"]');
        if (!btn) return;
        setTimeout(closeDrawer, 100);
      });
    };
    // 如果初始沒有 strip 或沒有按鈕，定時掃描等待工具按鈕載入
    let scanTimer = null;
    if (!strip) {
      scanTimer = setInterval(moveToolsIntoDrawer, 300);
    } else {
      // 若 strip 已存在於 DOM，直接放入抽屜
      bodyBox.appendChild(strip);
      // 確保點擊 strip 會關閉抽屜
      strip.addEventListener('click', e => {
        const btn = e.target.closest('button,a,[role="button"]');
        if (!btn) return;
        setTimeout(closeDrawer, 100);
      });
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

    // 當點擊新建的笑臉按鈕時切換抽屜
    toggleBtn.addEventListener('click', () => {
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
  // 等待所有資源載入完成後再初始化，以確保工具列已渲染
  window.addEventListener('load', init);
})();

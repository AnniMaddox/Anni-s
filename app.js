

        const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
    // gemini如果是多个密钥, 那么随机获取一个
    function getRandomValue(str) {
        // 检查字符串是否包含逗号
        if (str.includes(',')) {
            // 用逗号分隔字符串并移除多余空格
            const arr = str.split(',').map(item => item.trim());
            // 生成随机索引 (0 到 arr.length-1)
            const randomIndex = Math.floor(Math.random() * arr.length);
            // 返回随机元素
            return arr[randomIndex];
        }
        // 没有逗号则直接返回原字符串
        return str;
    }
    function isImage(text,content) {
        let currentImageData = content.image_url.url
        // 提取Base64数据（去掉前缀）
        const base64Data = currentImageData.split(',')[1];
        // 根据图片类型获取MIME类型
        const mimeType = currentImageData.match(/^data:(.*);base64/)[1];
        return [
            {text: `${text.text}用戶向你發送了一張圖片`},
            {
                inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                }
            }
        ]
    }

   function extractArray(text) {
        // 正则表达式模式：匹配开头的时间戳部分和后续的JSON数组
        const pattern = /^\(Timestamp: (\d+)\)(.*)$/s;
        const match = text.match(pattern);

        if (match) {
            const timestampPart = `(Timestamp: ${match[1]}) `;
            const jsonPart = match[2].trim();

            try {
                // 尝试解析JSON部分
                const parsedJson = JSON.parse(jsonPart);
                // 验证解析结果是否为数组
                if (Array.isArray(parsedJson)) {
                    return [timestampPart, parsedJson[0]];
                }
            } catch (error) {
                // 解析失败，返回原始文本
            }
        }

        // 不匹配格式或解析失败时返回原值
        return text;
    }
    function transformChatData(item) {
        let type = {
            send_and_recall:'撤回了消息',
            update_status:'更新了狀態',
            change_music:'切換了歌曲',
            create_memory:'記錄了回憶',
            create_countdown:'創建了約定/倒計時',
            text:'發送了文本',
            sticker:'發送了表情',
            ai_image:'發送了圖片',
            voice_message:'發送了語音',
            transfer:'發起了轉賬',
            waimai_request:'發起了外賣請求',
            waimai_response:{
                paid:'回應了外賣-同意',
                rejected:'回應了外賣-拒絕'
            },
            video_call_request:'發起了視頻通話',
            video_call_response:{
                accept:'回應了視頻通話-接受',
                reject:'回應了視頻通話-拒絕'
            },
            qzone_post:{
                shuoshuo:'發佈了說說',
                text_image:'發佈了文字圖'
            },
            qzone_comment:'評論了動態',
            qzone_like:'點讚了動態',
            pat_user:'拍一拍了用戶',
            block_user:'拉黑了用戶',
            friend_request_response:'回應了好友申請',
            change_avatar:'更換了頭像',
            share_link:'分享了鏈接',
            accept_transfer:'回應了轉賬-接受',
            decline_transfer:'回應了轉賬-拒絕/退款',
            quote_reply:'引用了回复',
            text:'',
        }
        let res = extractArray(item.content)

        if(Array.isArray(res)){
            let obj = res[1]
            let itemType = obj.type;
            let time = res[0]
            let text = type[itemType];
            if(text){
                if(itemType === 'sticker'){
                    return [{text:`${time}[${text}] 含義是:${obj.meaning}`}]
                }else if(itemType === 'send_and_recall'){
                    return [{text:`${time}[${text}] ${obj.content}`}]
                }else if(itemType === 'update_status'){
                    return [{text:`${time}[${text}] ${obj.status_text}(${obj.is_busy ? '忙碌/離開' : '空閒'})`}]
                }else if(itemType === 'change_music'){
                    return [{text:`${time}[${text}] ${obj.change_music}, 歌名是:${obj.song_name}`}]
                }else if(itemType === 'create_memory'){
                    return [{text:`${time}[${text}] ${obj.description}`}]
                }else if(itemType === 'create_countdown'){
                    return [{text:`${time}[${text}] ${obj.title}(${obj.date})`}]
                }else if(itemType === 'ai_image'){
                    return [{text:`${time}[${text}] 圖片描述是:${obj.description}`}]
                }else if(itemType === 'voice_message'){
                    return [{text:`${time}[${text}] ${obj.content}`}]
                }else if(itemType === 'transfer'){
                    return [{text:`${time}[${text}] 金額是:${obj.amount} 備註是:${obj.amount}`}]
                }else if(itemType === 'waimai_request'){
                    return [{text:`${time}[${text}] 金額是:${obj.amount} 商品是:${obj.productInfo}`}]
                }else if(itemType === 'waimai_response'){
                    return [{text:`${time}[${text[obj.status]}] ${obj.status === 'paid' ? '同意' : '拒絕'}`}]
                }else if(itemType === 'video_call_request'){
                    return [{text:`${time}[${text}]`}]
                }}else if(itemType === 'video_call_response'){
                    return [{text:`${time}[${text[obj.decision]}] ${obj.decision === 'accept' ? '同意' : '拒絕'}`}]
                }else if(itemType === 'qzone_post'){
                    return [{text:`${time}[${text[obj.postType]}] ${obj.postType === 'shuoshuo' ? `${obj.content}` : `圖片描述是:${obj.hiddenContent} ${obj.publicText ? `文案是: ${obj.publicText}` : ''}`}`}]
                }else if(itemType === 'qzone_comment'){
                    return [{text:`${time}[${text}] 評論的id是: ${obj.postId} 評論的內容是: ${obj.commentText}`}]
                }else if(itemType === 'qzone_like'){
                    return [{text:`${time}[${text}] 點讚的id是: ${obj.postId}`}]
                }else if(itemType === 'pat_user'){
                    return [{text:`${time}[${text}] ${obj.suffix ? obj.suffix  : ''}`}]
                }else if(itemType === 'block_user'){
                    return [{text:`${time}[${text}]`}]
                }else if(itemType === 'friend_request_response'){
                    return [{text:`${time}[${text}] 結果是:${obj.decision === 'accept' ? '同意' : '拒絕'}`}]
                }else if(itemType === 'change_avatar'){
                    return [{text:`${time}[${text}] 頭像名是:${obj.name}`}]
                }else if(itemType === 'share_link'){
                    return [{text:`${time}[${text}] 文章標題是:${obj.title}  文章摘要是:${obj.description} 來源網站名是:${obj.source_name} 文章正文是:${obj.content}`}]
                }else if(itemType === 'accept_transfer'){
                    return [{text:`${time}[${text}]`}]
                }else if(itemType === 'accept_transfer'){
                    return [{text:`${time}[${text}]`}]
                }else if(itemType === 'quote_reply'){
                    return [{text:`${time}[${text}] 引用的內容是:${obj.reply_content}`}]
                }else if(itemType === 'text'){
                    return [{text:`${time}${obj.content}`}]
                }
            }

if(Array.isArray(res) && res.length > 1) {
	res = `${res[0]}${res[1].content}`
}

        return [{text:res}]
    }

    function toGeminiRequestData(model, apiKey, systemInstruction, messagesForDecision,isGemini) {

	if(!isGemini){
		return undefined
	}

        // 【核心修正】在这里，我们将 'system' 角色也映射为 'user'

        let roleType = {
            user: 'user',
            assistant: 'model',
            system: 'user' // <--- 新增这一行
        }
        return {
            url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${getRandomValue(apiKey)}`,
            data: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: messagesForDecision.map((item) => {
                        let  includesImages = false;
                        if(Array.isArray(item.content) && item.content.length === 2){
                              includesImages =  item.content.some((sub)=>{
                                return sub.type === 'image_url' && sub.image_url.url
                            })
                        }
                        return {
                            role: roleType[item.role], // 现在 'system' 会被正确转换为 'user'
                            parts: includesImages ? isImage(item.content[0],item.content[1]) : transformChatData(item)
                        }
                    }),
                    generationConfig: {
                        temperature: 0.8,
                    },
                    "systemInstruction": {
                        "parts": [{
                            "text": systemInstruction
                        }]
                    }
                })
            }
        }
    }
    document.addEventListener('DOMContentLoaded', () => {

        // ===================================================================
        // 1. 所有变量和常量定义
        // ===================================================================
        const db = new Dexie('GeminiChatDB');
        // --- 已修正 ---
        let state = { chats: {}, activeChatId: null, globalSettings: {}, apiConfig: {}, userStickers: [], worldBooks: [], personaPresets: [], qzoneSettings: {}, activeAlbumId: null };
        // --- 修正结束 ---
let musicState = { 
    isActive: false, 
    activeChatId: null, 
    isPlaying: false, 
    playlist: [], 
    currentIndex: -1, 
    playMode: 'order', 
    totalElapsedTime: 0, 
    timerId: null,
    // 【新增】歌词相关状态
    parsedLyrics: [],      // 当前歌曲解析后的歌词数组
    currentLyricIndex: -1  // 当前高亮的歌词行索引
};
        const audioPlayer = document.getElementById('audio-player');
        let newWallpaperBase64 = null;
        let isSelectionMode = false;
        let selectedMessages = new Set();
        let editingMemberId = null;
        let editingWorldBookId = null;
        let editingPersonaPresetId = null;

let waimaiTimers = {}; // 用于存储外卖倒计时

let activeMessageTimestamp = null;
let currentReplyContext = null; // <--- 新增这行，用来存储当前正在引用的消息信息
let activePostId = null; // <-- 新增：用于存储当前操作的动态ID

        let photoViewerState = {
            isOpen: false,
            photos: [], // 存储当前相册的所有照片URL
            currentIndex: -1, // 当前正在查看的照片索引
        };

        let unreadPostsCount = 0;

        let isFavoritesSelectionMode = false;
        let selectedFavorites = new Set()

let simulationIntervalId = null;

        const defaultAvatar = 'https://i.postimg.cc/PxZrFFFL/o-o-1.jpg';
        const defaultMyGroupAvatar = 'https://i.postimg.cc/cLPP10Vm/4.jpg';
        const defaultGroupMemberAvatar = 'https://i.postimg.cc/VkQfgzGJ/1.jpg';
        const defaultGroupAvatar = 'https://i.postimg.cc/gc3QYCDy/1-NINE7-Five.jpg';
        let notificationTimeout;

// ▼▼▼ 在JS顶部，变量定义区，添加这个新常量 ▼▼▼
const DEFAULT_APP_ICONS = {
    'world-book': 'https://i.postimg.cc/HWf1JKzn/IMG-6435.jpg',
    'qq': 'https://i.postimg.cc/MTC3Tkw8/IMG-6436.jpg',
    'api-settings': 'https://i.postimg.cc/MK8rJ8t7/IMG-6438.jpg',
    'wallpaper': 'https://i.postimg.cc/T1j03pQr/IMG-6440.jpg',
    'font': 'https://i.postimg.cc/pXxk1JXk/IMG-6442.jpg'
};
// ▲▲▲ 添加结束 ▲▲▲

        const STICKER_REGEX = /^(https:\/\/i\.postimg\.cc\/.+|https:\/\/files\.catbox\.moe\/.+|data:image)/;
        const MESSAGE_RENDER_WINDOW = 50;
        let currentRenderedCount = 0;
        let lastKnownBatteryLevel = 1;
        let alertFlags = { hasShown40: false, hasShown20: false, hasShown10: false };
        let batteryAlertTimeout;
        const dynamicFontStyle = document.createElement('style');
        dynamicFontStyle.id = 'dynamic-font-style';
        document.head.appendChild(dynamicFontStyle);

        const modalOverlay = document.getElementById('custom-modal-overlay');
        const modalTitle = document.getElementById('custom-modal-title');
        const modalBody = document.getElementById('custom-modal-body');
        const modalConfirmBtn = document.getElementById('custom-modal-confirm');
        const modalCancelBtn = document.getElementById('custom-modal-cancel');
        let modalResolve;

        function showCustomModal() { 
            modalOverlay.classList.add('visible'); 
        }

        function hideCustomModal() { 
            modalOverlay.classList.remove('visible'); 
            modalConfirmBtn.classList.remove('btn-danger'); 
            if (modalResolve) modalResolve(null); 
        }

        function showCustomConfirm(title, message, options = {}) {
            return new Promise(resolve => {
                modalResolve = resolve;
                modalTitle.textContent = title;
                modalBody.innerHTML = `<p>${message}</p>`;
                modalCancelBtn.style.display = 'block';
                modalConfirmBtn.textContent = '確定';
                if (options.confirmButtonClass) modalConfirmBtn.classList.add(options.confirmButtonClass);
                modalConfirmBtn.onclick = () => { resolve(true); hideCustomModal(); };
                modalCancelBtn.onclick = () => { resolve(false); hideCustomModal(); };
                showCustomModal();
            });
        }

        function showCustomAlert(title, message) {
            return new Promise(resolve => {
                modalResolve = resolve;
                modalTitle.textContent = title;
                modalBody.innerHTML = `<p style="text-align: left; white-space: pre-wrap;">${message}</p>`;
                modalCancelBtn.style.display = 'none';
                modalConfirmBtn.textContent = '好的';
                modalConfirmBtn.onclick = () => {
                    modalCancelBtn.style.display = 'block'; 
                    modalConfirmBtn.textContent = '確定';
                    resolve(true); 
                    hideCustomModal();
                };
                showCustomModal();
            });
        }

// ▼▼▼ 请用这个【功能增强版】替换旧的 showCustomPrompt 函数 ▼▼▼
function showCustomPrompt(title, placeholder, initialValue = '', type = 'text', extraHtml = '') {
    return new Promise(resolve => {
        modalResolve = resolve;
        modalTitle.textContent = title;
        const inputId = 'custom-prompt-input';
        
        const inputHtml = type === 'textarea' 
            ? `<textarea id="${inputId}" placeholder="${placeholder}" rows="4" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ccc; font-size: 14px; box-sizing: border-box; resize: vertical;">${initialValue}</textarea>`
            : `<input type="${type}" id="${inputId}" placeholder="${placeholder}" value="${initialValue}">`;
        
        // 【核心修改】将额外的HTML和输入框组合在一起
        modalBody.innerHTML = extraHtml + inputHtml;
        const input = document.getElementById(inputId);

        // 【核心修改】为格式助手按钮绑定事件
        modalBody.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const templateStr = btn.dataset.template;
                if (templateStr) {
                    try {
                        const templateObj = JSON.parse(templateStr);
                        // 使用 null, 2 参数让JSON字符串格式化，带缩进，更易读
                        input.value = JSON.stringify(templateObj, null, 2);
                        input.focus();
                    } catch(e) {
                        console.error("解析格式模板失敗:", e);
                    }
                }
            });
        });
        
        modalConfirmBtn.onclick = () => { resolve(input.value); hideCustomModal(); };
        modalCancelBtn.onclick = () => { resolve(null); hideCustomModal(); };
        showCustomModal();
        setTimeout(() => input.focus(), 100);
    });
}
// ▲▲▲ 替换结束 ▲▲▲

        // ===================================================================
        // 2. 数据库结构定义
        // ===================================================================

db.version(23).stores({ 
    chats: '&id, isGroup, groupId', 
    apiConfig: '&id', 
    globalSettings: '&id', 
    userStickers: '&id, url, name',
    worldBooks: '&id, name, categoryId', // <-- 【核心修改1】在这里添加 categoryId
    worldBookCategories: '++id, name',    // <-- 【核心修改2】新增这个表
    musicLibrary: '&id', 
    personaPresets: '&id',
    qzoneSettings: '&id',
    qzonePosts: '++id, timestamp', 
    qzoneAlbums: '++id, name, createdAt',
    qzonePhotos: '++id, albumId',
    favorites: '++id, type, timestamp, originalTimestamp',
    qzoneGroups: '++id, name',
    memories: '++id, chatId, timestamp, type, targetDate' ,
    callRecords: '++id, chatId, timestamp, customName' // <--【核心修改】在这里加上 customName
});

        // ===================================================================
        // 3. 所有功能函数定义
        // ===================================================================

     function isIOS() {
         // 使用正则表达式匹配 'iPhone', 'iPad', 'iPod'
         if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
             document.body.classList.add('ios');
         }
    }

        function showScreen(screenId) {
            if (screenId === 'chat-list-screen') {
                window.renderChatListProxy(); 
                switchToChatListView('messages-view');
            }
            if (screenId === 'api-settings-screen') window.renderApiSettingsProxy();
            if (screenId === 'wallpaper-screen') window.renderWallpaperScreenProxy();
            if (screenId === 'world-book-screen') window.renderWorldBookScreenProxy();
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            const screenToShow = document.getElementById(screenId);
            if (screenToShow) screenToShow.classList.add('active');
            if (screenId === 'chat-interface-screen') window.updateListenTogetherIconProxy(state.activeChatId);
            if (screenId === 'font-settings-screen') {
                document.getElementById('font-url-input').value = state.globalSettings.fontUrl || '';
                applyCustomFont(state.globalSettings.fontUrl || '', true);
            }
        }
        window.updateListenTogetherIconProxy = () => {};

        function switchToChatListView(viewId) {
            const chatListScreen = document.getElementById('chat-list-screen');
            const views = {
                'messages-view': document.getElementById('messages-view'),
                'qzone-screen': document.getElementById('qzone-screen'),
                'favorites-view': document.getElementById('favorites-view'),
        'memories-view': document.getElementById('memories-view') // <-- 新增这一行
    };
            const mainHeader = document.getElementById('main-chat-list-header');
            const mainBottomNav = document.getElementById('chat-list-bottom-nav'); // 获取主导航栏

            if (isFavoritesSelectionMode) {
                document.getElementById('favorites-edit-btn').click(); 
            }

            // 隐藏所有视图
            Object.values(views).forEach(v => v.classList.remove('active'));
            // 显示目标视图
            if (views[viewId]) {
                views[viewId].classList.add('active');
            }

            // 更新底部导航栏高亮
            document.querySelectorAll('#chat-list-bottom-nav .nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.view === viewId);
            });
            
            // ▼▼▼ 【核心修正】在这里统一管理所有UI元素的显隐 ▼▼▼
            if (viewId === 'messages-view') {
                mainHeader.style.display = 'flex';
                mainBottomNav.style.display = 'flex';
            } else {
                mainHeader.style.display = 'none';
                mainBottomNav.style.display = 'none';
            }
            // ▲▲▲ 修正结束 ▲▲▲

    if (viewId !== 'memories-view') {
        activeCountdownTimers.forEach(timerId => clearInterval(timerId));
        activeCountdownTimers = [];
    }

            // 根据视图ID执行特定的渲染/更新逻辑
            switch (viewId) {
                case 'qzone-screen':
                    views['qzone-screen'].style.backgroundColor = '#f0f2f5';
                    updateUnreadIndicator(0);
                    renderQzoneScreen();
                    renderQzonePosts();
                    break;
                case 'favorites-view':
                    views['favorites-view'].style.backgroundColor = '#f9f9f9';
                    renderFavoritesScreen();
                    break;
                case 'messages-view':
                    // 如果需要，可以在这里添加返回消息列表时要执行的逻辑
                    break;
            }
        }
        
        function renderQzoneScreen() {
            if (state && state.qzoneSettings) {
                const settings = state.qzoneSettings;
                document.getElementById('qzone-nickname').textContent = settings.nickname;
                document.getElementById('qzone-avatar-img').src = settings.avatar;
                document.getElementById('qzone-banner-img').src = settings.banner;
            }
        }
        window.renderQzoneScreenProxy = renderQzoneScreen;

        async function saveQzoneSettings() {
            if (db && state.qzoneSettings) {
                await db.qzoneSettings.put(state.qzoneSettings);
            }
        }

        function formatPostTimestamp(timestamp) {
            if (!timestamp) return '';
            const now = new Date();
            const date = new Date(timestamp);
            const diffSeconds = Math.floor((now - date) / 1000);
            const diffMinutes = Math.floor(diffSeconds / 60);
            const diffHours = Math.floor(diffMinutes / 60);
            if (diffMinutes < 1) return '剛剛';
            if (diffMinutes < 60) return `${diffMinutes}分鐘前`;
            if (diffHours < 24) return `${diffHours}小時前`;
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            if (now.getFullYear() === year) {
                return `${month}-${day} ${hours}:${minutes}`;
            } else {
                return `${year}-${month}-${day} ${hours}:${minutes}`;
            }
        }

// ▼▼▼ 请用这个【已添加删除按钮】的函数，完整替换掉你旧的 renderQzonePosts 函数 ▼▼▼
async function renderQzonePosts() {
    const postsListEl = document.getElementById('qzone-posts-list');
    if (!postsListEl) return;

    const [posts, favorites] = await Promise.all([
        db.qzonePosts.orderBy('timestamp').reverse().toArray(),
        db.favorites.where('type').equals('qzone_post').toArray()
    ]);

    const favoritedPostIds = new Set(favorites.map(fav => fav.content.id));
    
    postsListEl.innerHTML = '';

    if (posts.length === 0) {
        postsListEl.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 30px 0;">這裡空空如也，快來發布第一條說說吧！</p>';
        return;
    }

    const userSettings = state.qzoneSettings;

    posts.forEach(post => {
        const postContainer = document.createElement('div');
        postContainer.className = 'qzone-post-container';
        postContainer.dataset.postId = post.id;

        const postEl = document.createElement('div');
        postEl.className = 'qzone-post-item';

        let authorAvatar = '', authorNickname = '', commentAvatar = userSettings.avatar; 

        if (post.authorId === 'user') {
            authorAvatar = userSettings.avatar;
            authorNickname = userSettings.nickname;
        } else if (state.chats[post.authorId]) {
            const authorChat = state.chats[post.authorId];
            authorAvatar = authorChat.settings.aiAvatar || defaultAvatar;
            authorNickname = authorChat.name;
        } else {
            authorAvatar = defaultAvatar;
            authorNickname = '{{char}}';
        }
        
        let contentHtml = '';
        const publicTextHtml = post.publicText ? `<div class="post-content">${post.publicText.replace(/\n/g, '<br>')}</div>` : '';

        if (post.type === 'shuoshuo') {
            contentHtml = `<div class="post-content" style="margin-bottom: 10px;">${post.content.replace(/\n/g, '<br>')}</div>`;
        } 
        else if (post.type === 'image_post' && post.imageUrl) {
            contentHtml = publicTextHtml ? `${publicTextHtml}<div style="margin-top:10px;"><img src="${post.imageUrl}" class="chat-image"></div>` : `<img src="${post.imageUrl}" class="chat-image">`;
        } 
        else if (post.type === 'text_image') {
            contentHtml = publicTextHtml ? `${publicTextHtml}<div style="margin-top:10px;"><img src="https://i.postimg.cc/KYr2qRCK/1.jpg" class="chat-image" style="cursor: pointer;" data-hidden-text="${post.hiddenContent}"></div>` : `<img src="https://i.postimg.cc/KYr2qRCK/1.jpg" class="chat-image" style="cursor: pointer;" data-hidden-text="${post.hiddenContent}">`;
        }

        let likesHtml = '';
        if (post.likes && post.likes.length > 0) {
            likesHtml = `<div class="post-likes-section"><svg class="like-icon" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg><span>${post.likes.join('、')} 覺得很讚</span></div>`;
        }
        
        let commentsHtml = '';
        if (post.comments && post.comments.length > 0) {
            commentsHtml = '<div class="post-comments-container">';
            // ★★★★★【核心修改就在这里】★★★★★
            // 遍历评论时，我们传入 comment 对象本身和它的索引 index
            post.comments.forEach((comment, index) => {
                // 在评论项的末尾，添加一个带有 data-comment-index 属性的删除按钮
                commentsHtml += `
                    <div class="comment-item">
                        <span class="commenter-name">${comment.commenterName}:</span>
                        <span class="comment-text">${comment.text}</span>
                        <span class="comment-delete-btn" data-comment-index="${index}">×</span>
                    </div>`;
            });
            // ★★★★★【修改结束】★★★★★
            commentsHtml += '</div>';
        }

        const userNickname = state.qzoneSettings.nickname;
        const isLikedByUser = post.likes && post.likes.includes(userNickname);
        const isFavoritedByUser = favoritedPostIds.has(post.id);

        postEl.innerHTML = `
            <div class="post-header"><img src="${authorAvatar}" class="post-avatar"><div class="post-info"><span class="post-nickname">${authorNickname}</span><span class="post-timestamp">${formatPostTimestamp(post.timestamp)}</span></div>
                <div class="post-actions-btn">…</div>
            </div>
            <div class="post-main-content">${contentHtml}</div>
            <div class="post-feedback-icons">
                <span class="action-icon like ${isLikedByUser ? 'active' : ''}"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></span>
                <span class="action-icon favorite ${isFavoritedByUser ? 'active' : ''}"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg></span>
            </div>
            ${likesHtml}
            ${commentsHtml}
            <div class="post-footer"><div class="comment-section"><img src="${commentAvatar}" class="comment-avatar"><input type="text" class="comment-input" placeholder="友善的评论是交流的起点"><div class="at-mention-popup"></div></div><button class="comment-send-btn">發送</button></div>
        `;
        
        const deleteAction = document.createElement('div');
        deleteAction.className = 'qzone-post-delete-action';
        deleteAction.innerHTML = '<span>删除</span>';
        postContainer.appendChild(postEl);
        postContainer.appendChild(deleteAction);
        const commentSection = postContainer.querySelector('.comment-section');
        if (commentSection) {
            commentSection.addEventListener('touchstart', (e) => e.stopPropagation());
            commentSection.addEventListener('mousedown', (e) => e.stopPropagation());
        }
        postsListEl.appendChild(postContainer);
        const commentInput = postContainer.querySelector('.comment-input');
        const popup = postContainer.querySelector('.at-mention-popup');
        commentInput.addEventListener('input', () => {
            const value = commentInput.value;
            const atMatch = value.match(/@([\p{L}\w]*)$/u);
            if (atMatch) {
                const namesToMention = new Set();
                const authorNickname = postContainer.querySelector('.post-nickname')?.textContent;
                if (authorNickname) namesToMention.add(authorNickname);
                postContainer.querySelectorAll('.commenter-name').forEach(nameEl => {
                    namesToMention.add(nameEl.textContent.replace(':', ''));
                });
                namesToMention.delete(state.qzoneSettings.nickname);
                popup.innerHTML = '';
                if (namesToMention.size > 0) {
                    const searchTerm = atMatch[1];
                    namesToMention.forEach(name => {
                        if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
                            const item = document.createElement('div');
                            item.className = 'at-mention-item';
                            item.textContent = name;
                            item.addEventListener('mousedown', (e) => {
                                e.preventDefault();
                                const newText = value.substring(0, atMatch.index) + `@${name} `;
                                commentInput.value = newText;
                                popup.style.display = 'none';
                                commentInput.focus();
                            });
                            popup.appendChild(item);
                        }
                    });
                    popup.style.display = popup.children.length > 0 ? 'block' : 'none';
                } else {
                    popup.style.display = 'none';
                }
            } else {
                popup.style.display = 'none';
            }
        });
        commentInput.addEventListener('blur', () => { setTimeout(() => { popup.style.display = 'none'; }, 200); });
    });
}
// ▲▲▲ 替换结束 ▲▲▲
             
// ▼▼▼ 请用下面这个【更新后的】函数，完整替换掉你代码中旧的 displayFilteredFavorites 函数 ▼▼▼

function displayFilteredFavorites(items) {
    const listEl = document.getElementById('favorites-list');
    listEl.innerHTML = '';

    if (items.length === 0) {
        const searchTerm = document.getElementById('favorites-search-input').value;
        const message = searchTerm ? '找不到相關收藏' : '你的收藏夾是空的，<br>快去動態或聊天中收藏喜歡的內容吧！';
        listEl.innerHTML = `<p style="text-align:center; color: var(--text-secondary); padding: 50px 0;">${message}</p>`;
        return;
    }

    for (const item of items) {
        const card = document.createElement('div');
        card.className = 'favorite-item-card';
        card.dataset.favid = item.id;

        let headerHtml = '', contentHtml = '', sourceText = '', footerHtml = '';

        if (item.type === 'qzone_post') {
            const post = item.content;
            sourceText = '來自動態';
            let authorAvatar = defaultAvatar, authorNickname = '未知用戶';

            if (post.authorId === 'user') {
                authorAvatar = state.qzoneSettings.avatar;
                authorNickname = state.qzoneSettings.nickname;
            } else if (state.chats[post.authorId]) {
                authorAvatar = state.chats[post.authorId].settings.aiAvatar;
                authorNickname = state.chats[post.authorId].name;
            }

            headerHtml = `<img src="${authorAvatar}" class="avatar"><div class="info"><div class="name">${authorNickname}</div></div>`;
            
            const publicTextHtml = post.publicText ? `<div class="post-content">${post.publicText.replace(/\n/g, '<br>')}</div>` : '';
            if (post.type === 'shuoshuo') {
                contentHtml = `<div class="post-content">${post.content.replace(/\n/g, '<br>')}</div>`;
            } else if (post.type === 'image_post' && post.imageUrl) {
                contentHtml = publicTextHtml ? `${publicTextHtml}<div style="margin-top:10px;"><img src="${post.imageUrl}" class="chat-image"></div>` : `<img src="${post.imageUrl}" class="chat-image">`;
            } else if (post.type === 'text_image') {
                contentHtml = publicTextHtml ? `${publicTextHtml}<div style="margin-top:10px;"><img src="https://i.postimg.cc/KYr2qRCK/1.jpg" class="chat-image" style="cursor: pointer;" data-hidden-text="${post.hiddenContent}"></div>` : `<img src="https://i.postimg.cc/KYr2qRCK/1.jpg" class="chat-image" style="cursor: pointer;" data-hidden-text="${post.hiddenContent}">`;
            }

            // ▼▼▼ 新增/修改的代码开始 ▼▼▼
            
            // 1. 构造点赞区域的HTML
            let likesHtml = '';
            // 检查 post 对象中是否存在 likes 数组并且不为空
            if (post.likes && post.likes.length > 0) {
                // 如果存在，就创建点赞区域的 div
                likesHtml = `
                    <div class="post-likes-section">
                        <svg class="like-icon" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        <span>${post.likes.join('、')} 覺得很讚</span>
                    </div>`;
            }

            // 2. 构造评论区域的HTML
            let commentsHtml = '';
            // 检查 post 对象中是否存在 comments 数组并且不为空
            if (post.comments && post.comments.length > 0) {
                // 如果存在，就创建评论容器，并遍历每一条评论
                commentsHtml = '<div class="post-comments-container">';
                post.comments.forEach(comment => {
                    commentsHtml += `
                        <div class="comment-item">
                            <span class="commenter-name">${comment.commenterName}:</span>
                            <span class="comment-text">${comment.text}</span>
                        </div>`;
                });
                commentsHtml += '</div>';
            }

            // 3. 将点赞和评论的HTML组合到 footerHtml 中
            footerHtml = `${likesHtml}${commentsHtml}`;
            
            // ▲▲▲ 新增/修改的代码结束 ▲▲▲

} else if (item.type === 'chat_message') {
    const msg = item.content;
    const chat = state.chats[item.chatId];
    if (!chat) continue; 

    sourceText = `來自與 ${chat.name} 的聊天`;
    const isUser = msg.role === 'user';
    let senderName, senderAvatar;

    if (isUser) {
        // 用户消息的逻辑保持不变
        senderName = chat.isGroup ? (chat.settings.myNickname || '我') : '我';
        senderAvatar = chat.settings.myAvatar || (chat.isGroup ? defaultMyGroupAvatar : defaultAvatar);
    } else { // AI/成员消息
         if (chat.isGroup) {
            // ★★★★★ 这就是唯一的、核心的修改！ ★★★★★
            // 我们现在使用 originalName 去匹配，而不是旧的 name
            const member = chat.members.find(m => m.originalName === msg.senderName);
            // ★★★★★ 修改结束 ★★★★★
            
            senderName = msg.senderName;
            // 因为现在能正确找到 member 对象了，所以也能正确获取到他的头像
            senderAvatar = member ? member.avatar : defaultGroupMemberAvatar;
        } else {
            // 单聊的逻辑保持不变
            senderName = chat.name;
            senderAvatar = chat.settings.aiAvatar || defaultAvatar;
        }
    }

    // 后续拼接 headerHtml 和 contentHtml 的逻辑都保持不变
    headerHtml = `<img src="${senderAvatar}" class="avatar"><div class="info"><div class="name">${senderName}</div></div>`;
    
    if (typeof msg.content === 'string' && STICKER_REGEX.test(msg.content)) {
        contentHtml = `<img src="${msg.content}" class="sticker-image" style="max-width: 80px; max-height: 80px;">`;
    } else if (Array.isArray(msg.content) && msg.content[0]?.type === 'image_url') {
        contentHtml = `<img src="${msg.content[0].image_url.url}" class="chat-image">`;
    } else {
        contentHtml = String(msg.content || '').replace(/\n/g, '<br>');
    }
}
        
        // ▼▼▼ 修改最终的HTML拼接，加入 footerHtml ▼▼▼
        card.innerHTML = `
            <div class="fav-card-header">${headerHtml}<div class="source">${sourceText}</div></div>
            <div class="fav-card-content">${contentHtml}</div>
            ${footerHtml}`; // <-- 把我们新创建的 footerHtml 放在这里
            
        listEl.appendChild(card);
    }
}

// ▲▲▲ 替换区域结束 ▲▲▲

        /**
         * 【重构后的函数】: 负责准备数据并触发渲染
         */
        async function renderFavoritesScreen() {
            // 1. 从数据库获取最新数据并缓存
            allFavoriteItems = await db.favorites.orderBy('timestamp').reverse().toArray();
            
            // 2. 清空搜索框并隐藏清除按钮
            const searchInput = document.getElementById('favorites-search-input');
            const clearBtn = document.getElementById('favorites-search-clear-btn');
            searchInput.value = '';
            clearBtn.style.display = 'none';

            // 3. 显示所有收藏项
            displayFilteredFavorites(allFavoriteItems);
        }

        // ▲▲▲ 粘贴结束 ▲▲▲

        function resetCreatePostModal() {
            document.getElementById('post-public-text').value = '';
            document.getElementById('post-image-preview').src = '';
            document.getElementById('post-image-description').value = '';
            document.getElementById('post-image-preview-container').classList.remove('visible');
            document.getElementById('post-image-desc-group').style.display = 'none';
            document.getElementById('post-local-image-input').value = '';
            document.getElementById('post-hidden-text').value = '';
            document.getElementById('switch-to-image-mode').click();
        }

// ▼▼▼ 用这个【已包含 memories】的版本，完整替换旧的 exportBackup 函数 ▼▼▼
async function exportBackup() {
    try {
        const backupData = {
            version: 1, 
            timestamp: Date.now()
        };

        const [
            chats, worldBooks, userStickers, apiConfig, globalSettings,
            personaPresets, musicLibrary, qzoneSettings, qzonePosts,
            qzoneAlbums, qzonePhotos, favorites, qzoneGroups,
            memories,
            worldBookCategories // <-- 【核心修改1】在这里添加新变量
        ] = await Promise.all([
            db.chats.toArray(),
            db.worldBooks.toArray(),
            db.userStickers.toArray(),
            db.apiConfig.get('main'),
            db.globalSettings.get('main'),
            db.personaPresets.toArray(),
            db.musicLibrary.get('main'),
            db.qzoneSettings.get('main'),
            db.qzonePosts.toArray(),
            db.qzoneAlbums.toArray(),
            db.qzonePhotos.toArray(),
            db.favorites.toArray(),
            db.qzoneGroups.toArray(),
                        db.memories.toArray(),
            db.worldBookCategories.toArray() // <-- 【核心修改2】在这里添加对新表的读取
        ]);

        Object.assign(backupData, {
            chats, worldBooks, userStickers, apiConfig, globalSettings,
            personaPresets, musicLibrary, qzoneSettings, qzonePosts,
            qzoneAlbums, qzonePhotos, favorites, qzoneGroups,
            memories,
            worldBookCategories // <-- 【核心修改3】将新数据添加到备份对象中
        });
        
        const blob = new Blob(
            [JSON.stringify(backupData, null, 2)], 
            { type: 'application/json' }
        );
        const url = URL.createObjectURL(blob);
        const link = Object.assign(document.createElement('a'), {
            href: url,
            download: `EPhone-Full-Backup-${new Date().toISOString().split('T')[0]}.json`
        });
        link.click();
        URL.revokeObjectURL(url);

        await showCustomAlert('匯出成功', '已成功匯出所有數據！');

    } catch (error) {
        console.error("匯出數據時出錯:", error);
        await showCustomAlert('匯出失敗', `發生了一個錯誤: ${error.message}`);
    }
}

// ▼▼▼ 用这个【已包含 memories】的版本，完整替换旧的 importBackup 函数 ▼▼▼
async function importBackup(file) {
    if (!file) return;

    const confirmed = await showCustomConfirm(
        '嚴重警告！',
        '導入備份將完全覆蓋您當前的所有數據，包括聊天、動態、設置等。此操作不可撤銷！您確定要繼續嗎？',
        { confirmButtonClass: 'btn-danger' }
    );

    if (!confirmed) return;

    try {
        const text = await file.text();
        const data = JSON.parse(text);

        await db.transaction('rw', db.tables, async () => {
            for (const table of db.tables) {
                await table.clear();
            }

            if (Array.isArray(data.chats)) await db.chats.bulkPut(data.chats);
            if (Array.isArray(data.worldBooks)) await db.worldBooks.bulkPut(data.worldBooks);
            if (Array.isArray(data.worldBookCategories)) await db.worldBookCategories.bulkPut(data.worldBookCategories);
            if (Array.isArray(data.userStickers)) await db.userStickers.bulkPut(data.userStickers);
            if (Array.isArray(data.personaPresets)) await db.personaPresets.bulkPut(data.personaPresets);
            if (Array.isArray(data.qzonePosts)) await db.qzonePosts.bulkPut(data.qzonePosts);
            if (Array.isArray(data.qzoneAlbums)) await db.qzoneAlbums.bulkPut(data.qzoneAlbums);
            if (Array.isArray(data.qzonePhotos)) await db.qzonePhotos.bulkPut(data.qzonePhotos);
            if (Array.isArray(data.favorites)) await db.favorites.bulkPut(data.favorites);
            if (Array.isArray(data.qzoneGroups)) await db.qzoneGroups.bulkPut(data.qzoneGroups);
            if (Array.isArray(data.memories)) await db.memories.bulkPut(data.memories); // 【核心修正】新增

            if (data.apiConfig) await db.apiConfig.put(data.apiConfig);
            if (data.globalSettings) await db.globalSettings.put(data.globalSettings);
            if (data.musicLibrary) await db.musicLibrary.put(data.musicLibrary);
            if (data.qzoneSettings) await db.qzoneSettings.put(data.qzoneSettings);
        });

        await showCustomAlert('導入成功', '所有數據已成功恢復！應用即將刷新以應用所有更改。');

        setTimeout(() => {
            window.location.reload();
        }, 1500);

    } catch (error) {
        console.error("導入數據時出錯:", error);
        await showCustomAlert('導入失敗', `文件格式不正確或數據已損壞: ${error.message}`);
    }
}

        function applyCustomFont(fontUrl, isPreviewOnly = false) {
            if (!fontUrl) {
                dynamicFontStyle.innerHTML = '';
                document.getElementById('font-preview').style.fontFamily = '';
                return;
            }
            const fontName = 'custom-user-font';
            const newStyle = `
                @font-face {
                  font-family: '${fontName}';
                  src: url('${fontUrl}');
                  font-display: swap;
                }`;
            if (isPreviewOnly) {
                const previewStyle = document.getElementById('preview-font-style') || document.createElement('style');
                previewStyle.id = 'preview-font-style';
                previewStyle.innerHTML = newStyle;
                if (!document.getElementById('preview-font-style')) document.head.appendChild(previewStyle);
                document.getElementById('font-preview').style.fontFamily = `'${fontName}', 'bulangni', sans-serif`;
            } else {
                dynamicFontStyle.innerHTML = `
                    ${newStyle}
                    body {
                      font-family: '${fontName}', 'bulangni', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    }`;
            }
        }

        async function resetToDefaultFont() {
            dynamicFontStyle.innerHTML = ''; 
            state.globalSettings.fontUrl = '';
            await db.globalSettings.put(state.globalSettings);
            document.getElementById('font-url-input').value = '';
            document.getElementById('font-preview').style.fontFamily = '';
            alert('已恢復預設字體。');
        }

async function loadAllDataFromDB() {
    // ▼▼▼ 【核心修改在这里】 ▼▼▼
    const [
        chatsArr,
        apiConfig,
        globalSettings,
        userStickers,
        worldBooks,
        musicLib,
        personaPresets,
        qzoneSettings,
        initialFavorites // 将 initialFavorites 加入到解构赋值中
    ] = await Promise.all([
        db.chats.toArray(),
        db.apiConfig.get('main'),
        db.globalSettings.get('main'),
        db.userStickers.toArray(),
        db.worldBooks.toArray(),
        db.musicLibrary.get('main'),
        db.personaPresets.toArray(),
        db.qzoneSettings.get('main'),
        db.favorites.orderBy('timestamp').reverse().toArray() // 确保这一行在 Promise.all 的数组参数内
    ]);
    // ▲▲▲ 【修改结束】 ▲▲▲

    state.chats = chatsArr.reduce((acc, chat) => {

    if (typeof chat.unreadCount === 'undefined') {
        chat.unreadCount = 0; // 如果这个聊天对象没有 unreadCount 属性，就给它初始化为 0
    }

        // ★★★【核心重构：数据迁移脚本】★★★
        // 检查是否是群聊，并且其成员对象使用的是旧的 `name` 结构
        if (chat.isGroup && chat.members && chat.members.length > 0 && chat.members[0].name) {
            console.log(`偵測到舊版群聊數據 for "${chat.name}"，正在執行遷移...`);
            chat.members.forEach(member => {
                // 如果这个成员对象没有 originalName，说明是旧数据
                if (typeof member.originalName === 'undefined') {
                    member.originalName = member.name; // 将旧的 name 作为 originalName
                    member.groupNickname = member.name; // 同时创建一个初始的 groupNickname
                    delete member.name; // 删除旧的、有歧义的 name 字段
                    needsUpdate = true; // 标记需要存回数据库
                }
            });
             console.log(`遷移完成 for "${chat.name}"`);
        }

        // --- ▼▼▼ 核心修复就在这里 ▼▼▼ ---
        // 检查1：如果是一个单聊，并且没有 status 属性
        if (!chat.isGroup && !chat.status) {
            // 就为它补上一个默认的 status 对象
            chat.status = {
                text: '在線',
                lastUpdate: Date.now(),
                isBusy: false
            };
            console.log(`為舊角色 "${chat.name}" 補全了status屬性。`);
        }
        // --- ▲▲▲ 修复结束 ▲▲▲

        // --- ▼▼▼ 核心修复就在这里 ▼▼▼ ---
        // 检查2：兼容最新的“关系”功能
        if (!chat.isGroup && !chat.relationship) {
            // 如果是单聊，且没有 relationship 对象，就补上一个默认的
            chat.relationship = {
                status: 'friend',
                blockedTimestamp: null,
                applicationReason: ''
            };
            console.log(`為舊角色 "${chat.name}" 補全了 relationship 屬性。`);
        }
        // --- ▲▲▲ 修复结束 ▲▲▲

    // ▼▼▼ 在这里添加 ▼▼▼
    if (!chat.isGroup && (!chat.settings || !chat.settings.aiAvatarLibrary)) {
        if (!chat.settings) chat.settings = {}; // 以防万一连settings都没有
        chat.settings.aiAvatarLibrary = [];
        console.log(`為舊角色 "${chat.name}" 補全了aiAvatarLibrary屬性。`);
    }
    // ▲▲▲ 添加结束 ▲▲▲

        if (!chat.musicData) chat.musicData = { totalTime: 0 };
        if (chat.settings && chat.settings.linkedWorldBookId && !chat.settings.linkedWorldBookIds) {
            chat.settings.linkedWorldBookIds = [chat.settings.linkedWorldBookId];
            delete chat.settings.linkedWorldBookId;
        }
        acc[chat.id] = chat;
        return acc;
    }, {});
    state.apiConfig = apiConfig || { id: 'main', proxyUrl: '', apiKey: '', model: '' };

state.globalSettings = globalSettings || { 
    id: 'main', 
    wallpaper: 'linear-gradient(135deg, #89f7fe, #66a6ff)', 
    fontUrl: '', 
    enableBackgroundActivity: false, 
    backgroundActivityInterval: 60,
    blockCooldownHours: 1,
    appIcons: { ...DEFAULT_APP_ICONS } // 【核心修改】确保appIcons存在并有默认值
};
// 【核心修改】合并已保存的图标和默认图标，防止更新后旧数据丢失新图标
state.globalSettings.appIcons = { ...DEFAULT_APP_ICONS, ...(state.globalSettings.appIcons || {}) };

    state.userStickers = userStickers || [];
    state.worldBooks = worldBooks || [];
    musicState.playlist = musicLib?.playlist || [];
    state.personaPresets = personaPresets || [];
    state.qzoneSettings = qzoneSettings || { id: 'main', nickname: '{{user}}', avatar: 'https://files.catbox.moe/q6z5fc.jpeg', banner: 'https://files.catbox.moe/r5heyt.gif' };

    // ▼▼▼ 【确保这一行在 Promise.all 之后，并使用解构赋值得到的 initialFavorites】 ▼▼▼
    allFavoriteItems = initialFavorites || [];
    // ▲▲▲ 【修改结束】 ▲▲▲
}

        async function saveGlobalPlaylist() { await db.musicLibrary.put({ id: 'main', playlist: musicState.playlist }); }

        function formatTimestamp(timestamp) { if (!timestamp) return ''; const date = new Date(timestamp); const hours = String(date.getHours()).padStart(2, '0'); const minutes = String(date.getMinutes()).padStart(2, '0'); return `${hours}:${minutes}`; }

        function showNotification(chatId, messageContent) { clearTimeout(notificationTimeout); const chat = state.chats[chatId]; if (!chat) return; const bar = document.getElementById('notification-bar'); document.getElementById('notification-avatar').src = chat.settings.aiAvatar || chat.settings.groupAvatar || defaultAvatar; document.getElementById('notification-content').querySelector('.name').textContent = chat.name; document.getElementById('notification-content').querySelector('.message').textContent = messageContent; const newBar = bar.cloneNode(true); bar.parentNode.replaceChild(newBar, bar); newBar.addEventListener('click', () => { openChat(chatId); newBar.classList.remove('visible'); }); newBar.classList.add('visible'); notificationTimeout = setTimeout(() => { newBar.classList.remove('visible'); }, 4000); }

        function updateClock() { const now = new Date(); const timeString = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }); const dateString = now.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' }); document.getElementById('main-time').textContent = timeString; document.getElementById('main-date').textContent = dateString; }

/**
 * 【终极健壮版】解析AI返回的、可能格式不规范的响应内容
 * @param {string} content - AI返回的原始字符串
 * @returns {Array} - 一个标准化的消息对象数组
 */
function parseAiResponse(content) {
    const trimmedContent = content.trim();

    // 方案1：【最优先】尝试作为标准的、单一的JSON数组解析
    // 这是最理想、最高效的情况
    if (trimmedContent.startsWith('[') && trimmedContent.endsWith(']')) {
        try {
            const parsed = JSON.parse(trimmedContent);
            if (Array.isArray(parsed)) {
                console.log("解析成功：標準JSON數組格式。");
                return parsed;
            }
        } catch (e) {
            // 如果解析失败，说明它虽然看起来像个数组，但内部格式有问题。
            // 此时我们不报错，而是继续尝试下面的“强力解析”方案。
            console.warn("標準JSON數組解析失敗，將嘗試強力解析...");
        }
    }

    // 方案2：【强力解析】使用正则表达式，从混乱的字符串中提取出所有独立的JSON对象
    // 这能完美解决您遇到的 "(Timestamp: ...)[{...}](Timestamp: ...)[{...}]" 这种格式
    const jsonMatches = trimmedContent.match(/{[^{}]*}/g);

    if (jsonMatches) {
        const results = [];
        for (const match of jsonMatches) {
            try {
                // 尝试解析每一个被我们“揪”出来的JSON字符串
                const parsedObject = JSON.parse(match);
                results.push(parsedObject);
            } catch (e) {
                // 如果某个片段不是有效的JSON，就忽略它，继续处理下一个
                console.warn("跳過一個無效的JSON片段:", match);
            }
        }

        // 如果我们成功提取出了至少一个有效的JSON对象，就返回这个结果
        if (results.length > 0) {
            console.log("解析成功：通過強力提取模式。");
            return results;
        }
    }
    
    // 方案3：【最终备用】如果以上所有方法都失败了，说明AI返回的可能就是纯文本
    // 我们将原始的、未处理的内容，包装成一个标准的文本消息对象返回，确保程序不会崩溃
    console.error("所有解析方案均失敗！將返回原始文本。");
    return [{ type: 'text', content: content }];
}

        function renderApiSettings() { document.getElementById('proxy-url').value = state.apiConfig.proxyUrl || ''; document.getElementById('api-key').value = state.apiConfig.apiKey || ''; 
    // ▼▼▼ 新增这行 ▼▼▼
    document.getElementById('background-activity-switch').checked = state.globalSettings.enableBackgroundActivity || false;
    document.getElementById('background-interval-input').value = state.globalSettings.backgroundActivityInterval || 60;
    document.getElementById('block-cooldown-input').value = state.globalSettings.blockCooldownHours || 1;
}
        window.renderApiSettingsProxy = renderApiSettings;

// ▼▼▼ 请用这个【全新版本】的函数，完整替换掉你旧的 renderChatList ▼▼▼
async function renderChatList() {
    const chatListEl = document.getElementById('chat-list');
    chatListEl.innerHTML = '';

    // 1. 像以前一样，获取所有聊天并按最新消息时间排序
    const allChats = Object.values(state.chats).sort((a, b) => (b.history.slice(-1)[0]?.timestamp || 0) - (a.history.slice(-1)[0]?.timestamp || 0));
    
    // 2. 获取所有分组
    const allGroups = await db.qzoneGroups.toArray();

    if (allChats.length === 0) {
        chatListEl.innerHTML = '<p style="text-align:center; color: #8a8a8a; margin-top: 50px;">點擊右上角 "+" 或群組圖標添加聊天</p>';
        return;
    }

    // --- 【核心修正开始】---

    // 3. 为每个分组找到其内部最新的消息时间戳
    allGroups.forEach(group => {
        // 从已排序的 allChats 中找到本组的第一个（也就是最新的）聊天
        const latestChatInGroup = allChats.find(chat => chat.groupId === group.id);
        // 如果找到了，就用它的时间戳；如果该分组暂时没有聊天或聊天没有历史记录，就用0
        group.latestTimestamp = latestChatInGroup ? (latestChatInGroup.history.slice(-1)[0]?.timestamp || 0) : 0;
    });

    // 4. 根据这个最新的时间戳来对“分组本身”进行排序
    allGroups.sort((a, b) => b.latestTimestamp - a.latestTimestamp);

    // --- 【核心修正结束】---

    // 5. 现在，我们按照排好序的分组来渲染
    allGroups.forEach(group => {
        // 从总列表里过滤出属于这个（已排序）分组的好友
        const groupChats = allChats.filter(chat => !chat.isGroup && chat.groupId === group.id);
        // 如果这个分组是空的（可能所有好友都被删了），就跳过
        if (groupChats.length === 0) return;

        const groupContainer = document.createElement('div');
        groupContainer.className = 'chat-group-container';
        groupContainer.innerHTML = `
            <div class="chat-group-header">
                <span class="arrow">▼</span>
                <span class="group-name">${group.name}</span>
            </div>
            <div class="chat-group-content"></div>
        `;
        const contentEl = groupContainer.querySelector('.chat-group-content');
        // 因为 allChats 本身就是有序的，所以 groupChats 自然也是有序的
        groupChats.forEach(chat => {
            const item = createChatListItem(chat);
            contentEl.appendChild(item);
        });
        chatListEl.appendChild(groupContainer);
    });

    // 6. 最后，渲染所有群聊和未分组的好友
    // 他们的顺序因为 allChats 的初始排序，天然就是正确的
    const ungroupedOrGroupChats = allChats.filter(chat => chat.isGroup || (!chat.isGroup && !chat.groupId));
    ungroupedOrGroupChats.forEach(chat => {
        const item = createChatListItem(chat);
        chatListEl.appendChild(item);
    });

    // 为所有分组标题添加折叠事件
    document.querySelectorAll('.chat-group-header').forEach(header => {
        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
            header.nextElementSibling.classList.toggle('collapsed');
        });
    });
}
// ▲▲▲ 替换结束 ▲▲▲

function createChatListItem(chat) {
    const lastMsgObj = chat.history.filter(msg => !msg.isHidden).slice(-1)[0] || {};
    let lastMsgDisplay;

    // --- ▼▼▼ 【核心修改】在这里加入对关系状态的判断 ▼▼▼ ---
    if (!chat.isGroup && chat.relationship?.status === 'pending_user_approval') {
        lastMsgDisplay = `<span style="color: #ff8c00;">[好友申請] ${chat.relationship.applicationReason || '請求添加你為好友'}</span>`;
    }
    // --- ▲▲▲ 修改结束 ▲▲▲ ---

// ▼▼▼ 在这里新增 else if ▼▼▼
else if (!chat.isGroup && chat.relationship?.status === 'blocked_by_ai') {
    lastMsgDisplay = `<span style="color: #dc3545;">[你已被對方拉黑]</span>`;
}
// ▲▲▲ 新增结束 ▲▲▲
    
    // 【核心修改】优先显示状态，而不是最后一条消息
    if (chat.isGroup) {
        // 群聊逻辑保持不变
        if (lastMsgObj.type === 'pat_message') { lastMsgDisplay = `[系統消息] ${lastMsgObj.content}`; }
        // ... (其他群聊消息类型判断) ...
        else if (lastMsgObj.type === 'transfer') { lastMsgDisplay = '[轉帳]'; }
        else if (lastMsgObj.type === 'ai_image' || lastMsgObj.type === 'user_photo') { lastMsgDisplay = '[照片]'; }
        else if (lastMsgObj.type === 'voice_message') { lastMsgDisplay = '[語音]'; }
        else if (typeof lastMsgObj.content === 'string' && STICKER_REGEX.test(lastMsgObj.content)) { lastMsgDisplay = lastMsgObj.meaning ? `[表情: ${lastMsgObj.meaning}]` : '[表情]'; }
        else if (Array.isArray(lastMsgObj.content)) { lastMsgDisplay = `[圖片]`; }
        else { lastMsgDisplay = String(lastMsgObj.content || '...').substring(0, 20); }

        if (lastMsgObj.senderName && lastMsgObj.type !== 'pat_message') {
            lastMsgDisplay = `${lastMsgObj.senderName}: ${lastMsgDisplay}`;
        }

    } else {
        // 单聊逻辑：显示状态
        // 确保 chat.status 对象存在
        const statusText = chat.status?.text || '在線';
        lastMsgDisplay = `[${statusText}]`;
    }

    const item = document.createElement('div');
    item.className = 'chat-list-item';
    item.dataset.chatId = chat.id;
    const avatar = chat.isGroup ? chat.settings.groupAvatar : chat.settings.aiAvatar;
    
    item.innerHTML = `
        <img src="${avatar || defaultAvatar}" class="avatar">
        <div class="info">
            <div class="name-line">
                <span class="name">${chat.name}</span>
                ${chat.isGroup ? '<span class="group-tag">群聊</span>' : ''}
            </div>
            <div class="last-msg" style="color: ${chat.isGroup ? 'var(--text-secondary)' : '#b5b5b5'}; font-style: italic;">${lastMsgDisplay}</div>
        </div>
        <!-- 这里就是我们新加的红点HTML结构 -->
        <div class="unread-count-wrapper">
            <span class="unread-count" style="display: none;">0</span>
        </div>
    `;
    
    // 【核心修改2】在这里添加控制红点显示/隐藏的逻辑
    const unreadCount = chat.unreadCount || 0;
    const unreadEl = item.querySelector('.unread-count');
    if (unreadCount > 0) {
        unreadEl.textContent = unreadCount > 99 ? '99+' : unreadCount;
        // 注意这里是 'inline-flex'，与我们的CSS对应，使其垂直居中
        unreadEl.style.display = 'inline-flex';
    } else {
        unreadEl.style.display = 'none';
    }
    
    const avatarEl = item.querySelector('.avatar');
    if (avatarEl) {
        avatarEl.style.cursor = 'pointer';
        avatarEl.addEventListener('click', (e) => {
            e.stopPropagation();
            handleUserPat(chat.id, chat.name);
        });
    }
    
    const infoEl = item.querySelector('.info');
    if (infoEl) {
        infoEl.addEventListener('click', () => openChat(chat.id));
    }

    addLongPressListener(item, async (e) => {
        const confirmed = await showCustomConfirm('刪除對話', `確定要刪除與 "${chat.name}" 的整個對話嗎？此操作不可撤銷。`, { confirmButtonClass: 'btn-danger' });
        if (confirmed) {
            if (musicState.isActive && musicState.activeChatId === chat.id) await endListenTogetherSession(false);
            delete state.chats[chat.id];
            if (state.activeChatId === chat.id) state.activeChatId = null;
            await db.chats.delete(chat.id);
            renderChatList();
        }
    });
    return item;
}

// ▼▼▼ 请用这个【带诊断功能的全新版本】替换旧的 renderChatInterface 函数 ▼▼▼
function renderChatInterface(chatId) {
    cleanupWaimaiTimers();
    const chat = state.chats[chatId];
    if (!chat) return;
    exitSelectionMode();
    
    const messagesContainer = document.getElementById('chat-messages');
    const chatInputArea = document.getElementById('chat-input-area');
    const lockOverlay = document.getElementById('chat-lock-overlay');
    const lockContent = document.getElementById('chat-lock-content');

    messagesContainer.dataset.theme = chat.settings.theme || 'default';
    const fontSize = chat.settings.fontSize || 13;
    messagesContainer.style.setProperty('--chat-font-size', `${fontSize}px`);
    applyScopedCss(chat.settings.customCss || '', '#chat-messages', 'custom-bubble-style');
    
    document.getElementById('chat-header-title').textContent = chat.name;
    const statusContainer = document.getElementById('chat-header-status');
    const statusTextEl = statusContainer.querySelector('.status-text');

    if (chat.isGroup) {
        statusContainer.style.display = 'none';
        document.getElementById('chat-header-title-wrapper').style.justifyContent = 'center';
    } else {
        statusContainer.style.display = 'flex';
        document.getElementById('chat-header-title-wrapper').style.justifyContent = 'flex-start';
        statusTextEl.textContent = chat.status?.text || '在线';
        statusContainer.classList.toggle('busy', chat.status?.isBusy || false);
    }
    
    lockOverlay.style.display = 'none';
    chatInputArea.style.visibility = 'visible';
    lockContent.innerHTML = '';

    if (!chat.isGroup && chat.relationship.status !== 'friend') {
        lockOverlay.style.display = 'flex';
        chatInputArea.style.visibility = 'hidden';
        
        let lockHtml = '';
        switch (chat.relationship.status) {
            case 'blocked_by_user':
                // --- 【核心修改：在这里加入诊断面板】 ---
                const isSimulationRunning = simulationIntervalId !== null;
                const blockedTimestamp = chat.relationship.blockedTimestamp;
                const cooldownHours = state.globalSettings.blockCooldownHours || 1;
                const cooldownMilliseconds = cooldownHours * 60 * 60 * 1000;
                const timeSinceBlock = Date.now() - blockedTimestamp;
                const isCooldownOver = timeSinceBlock > cooldownMilliseconds;
                const timeRemainingMinutes = Math.max(0, Math.ceil((cooldownMilliseconds - timeSinceBlock) / (1000 * 60)));

                lockHtml = `
                    <span class="lock-text">你已將“${chat.name}”拉黑。</span>
                    <button id="unblock-btn" class="lock-action-btn">解除拉黑</button>
                    <div style="margin-top: 20px; padding: 10px; border: 1px dashed #ccc; border-radius: 8px; font-size: 11px; text-align: left; color: #666; background: rgba(0,0,0,0.02);">
                        <strong style="color: #333;">【開發者診斷面板】</strong><br>
                        - 後台活動總開關: ${state.globalSettings.enableBackgroundActivity ? '<span style="color: green;">已開啟</span>' : '<span style="color: red;">已關閉</span>'}<br>
                        - 系統心跳計時器: ${isSimulationRunning ? '<span style="color: green;">運行中</span>' : '<span style="color: red;">未運行</span>'}<br>
                        - 當前角色狀態: <strong>${chat.relationship.status}</strong><br>
                        - 需要冷靜(小時): <strong>${cooldownHours}</strong><br>
                        - 冷靜期是否結束: ${isCooldownOver ? '<span style="color: green;">是</span>' : `<span style="color: orange;">否 (還剩約 ${timeRemainingMinutes} 分鐘)</span>`}<br>
                        - 觸發條件: ${isCooldownOver && state.globalSettings.enableBackgroundActivity ? '<span style="color: green;">已滿足，等待下次系統心跳</span>' : '<span style="color: red;">未滿足</span>'}
                    </div>
                    <button id="force-apply-check-btn" class="lock-action-btn secondary" style="margin-top: 10px;">強制觸發一次好友申請檢測</button>
                `;
                // --- 【修改结束】 ---
                break;
            case 'blocked_by_ai':
                lockHtml = `
                    <span class="lock-text">你被對方拉黑了。</span>
                    <button id="apply-friend-btn" class="lock-action-btn">重新申請加為好友</button>
                `;
                break;
            
            case 'pending_user_approval':
                lockHtml = `
                    <span class="lock-text">“${chat.name}”請求添加你為好友：<br><i>“${chat.relationship.applicationReason}”</i></span>
                    <button id="accept-friend-btn" class="lock-action-btn">接受</button>
                    <button id="reject-friend-btn" class="lock-action-btn secondary">拒絕</button>
                `;
                break;

            // 【核心修正】修复当你申请后，你看到的界面
            case 'pending_ai_approval':
                lockHtml = `<span class="lock-text">好友申請已發送，等待對方通過...</span>`;
                break;
        }
        lockContent.innerHTML = lockHtml;
    }
    messagesContainer.innerHTML = '';
    // ...后续代码保持不变
    const chatScreen = document.getElementById('chat-interface-screen');
    chatScreen.style.backgroundImage = chat.settings.background ? `url(${chat.settings.background})` : 'none';

const isDarkMode = document.getElementById('phone-screen').classList.contains('dark-mode');
chatScreen.style.backgroundColor = chat.settings.background ? 'transparent' : (isDarkMode ? '#000000' : '#f0f2f5');
    const history = chat.history;
    const totalMessages = history.length;
    currentRenderedCount = 0;
    const initialMessages = history.slice(-MESSAGE_RENDER_WINDOW);
    initialMessages.forEach(msg => appendMessage(msg, chat, true));
    currentRenderedCount = initialMessages.length;
    if (totalMessages > currentRenderedCount) {
        prependLoadMoreButton(messagesContainer);
    }
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.style.display = 'none';
    typingIndicator.textContent = '對方正在輸入...';
    messagesContainer.appendChild(typingIndicator);
    setTimeout(() => messagesContainer.scrollTop = messagesContainer.scrollHeight, 0);
}
// ▲▲▲ 替换结束 ▲▲▲

        function prependLoadMoreButton(container) { const button = document.createElement('button'); button.id = 'load-more-btn'; button.textContent = '加载更早的记录'; button.addEventListener('click', loadMoreMessages); container.prepend(button); }

        function loadMoreMessages() { const messagesContainer = document.getElementById('chat-messages'); const chat = state.chats[state.activeChatId]; if (!chat) return; const loadMoreBtn = document.getElementById('load-more-btn'); if (loadMoreBtn) loadMoreBtn.remove(); const totalMessages = chat.history.length; const nextSliceStart = totalMessages - currentRenderedCount - MESSAGE_RENDER_WINDOW; const nextSliceEnd = totalMessages - currentRenderedCount; const messagesToPrepend = chat.history.slice(Math.max(0, nextSliceStart), nextSliceEnd); const oldScrollHeight = messagesContainer.scrollHeight; messagesToPrepend.reverse().forEach(msg => prependMessage(msg, chat)); currentRenderedCount += messagesToPrepend.length; const newScrollHeight = messagesContainer.scrollHeight; messagesContainer.scrollTop += (newScrollHeight - oldScrollHeight); if (totalMessages > currentRenderedCount) { prependLoadMoreButton(messagesContainer); } }

// ▼▼▼ 用这个【新版本】替换旧的 renderWallpaperScreen 函数 ▼▼▼
function renderWallpaperScreen() { 
    const preview = document.getElementById('wallpaper-preview'); 
    const bg = newWallpaperBase64 || state.globalSettings.wallpaper; 
    if (bg && bg.startsWith('data:image')) { 
        preview.style.backgroundImage = `url(${bg})`; 
        preview.textContent = ''; 
    } else if(bg) { 
        preview.style.backgroundImage = bg; 
        preview.textContent = '當前為漸變色'; 
    }
    // 【核心修改】在这里调用图标渲染函数
    renderIconSettings();
}
// ▲▲▲ 替换结束 ▲▲▲
        window.renderWallpaperScreenProxy = renderWallpaperScreen;

        function applyGlobalWallpaper() { const homeScreen = document.getElementById('home-screen'); const wallpaper = state.globalSettings.wallpaper; if (wallpaper && wallpaper.startsWith('data:image')) homeScreen.style.backgroundImage = `url(${wallpaper})`; else if (wallpaper) homeScreen.style.backgroundImage = wallpaper; }

async function renderWorldBookScreen() {
    const listEl = document.getElementById('world-book-list');
    listEl.innerHTML = '';

    // 1. 同时获取所有书籍和所有分类
    const [books, categories] = await Promise.all([
        db.worldBooks.toArray(),
        db.worldBookCategories.orderBy('name').toArray()
    ]);

    state.worldBooks = books; // 确保内存中的数据是同步的

    if (books.length === 0) {
        listEl.innerHTML = '<p style="text-align:center; color: #8a8a8a; margin-top: 50px;">點擊右上角 "+" 創建你的第一本世界書</p>';
        return;
    }

    // 2. 将书籍按 categoryId 分组
    const groupedBooks = books.reduce((acc, book) => {
        const key = book.categoryId || 'uncategorized';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(book);
        return acc;
    }, {});

    // 3. 优先渲染已分类的书籍
    categories.forEach(category => {
        const booksInCategory = groupedBooks[category.id];
        if (booksInCategory && booksInCategory.length > 0) {
            const groupContainer = createWorldBookGroup(category.name, booksInCategory);
            listEl.appendChild(groupContainer);
        }
    });

    // 4. 最后渲染未分类的书籍
    const uncategorizedBooks = groupedBooks['uncategorized'];
    if (uncategorizedBooks && uncategorizedBooks.length > 0) {
        const groupContainer = createWorldBookGroup('未分類', uncategorizedBooks);
        listEl.appendChild(groupContainer);
    }
    
    // 5. 为所有分组标题添加折叠事件
    document.querySelectorAll('.world-book-group-header').forEach(header => {
        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
            header.nextElementSibling.classList.toggle('collapsed');
        });
    });
}

/**
 * 【辅助函数】创建一个分类的分组DOM
 * @param {string} groupName - 分类名称
 * @param {Array} books - 该分类下的书籍数组
 * @returns {HTMLElement} - 创建好的分组容器
 */
function createWorldBookGroup(groupName, books) {
    const groupContainer = document.createElement('div');
    groupContainer.className = 'world-book-group-container';
    
    groupContainer.innerHTML = `
        <div class="world-book-group-header">
            <span class="arrow">▼</span>
            <span class="group-name">${groupName}</span>
        </div>
        <div class="world-book-group-content"></div>
    `;

    // ▼▼▼ 在这里添加新代码 ▼▼▼
    const headerEl = groupContainer.querySelector('.world-book-group-header');
    const contentEl = groupContainer.querySelector('.world-book-group-content');
    
    // 默认给头部和内容区都加上 collapsed 类
    headerEl.classList.add('collapsed');
    contentEl.classList.add('collapsed');
    // ▲▲▲ 添加结束 ▲▲▲

    books.sort((a,b) => a.name.localeCompare(b.name, 'zh-CN'));
    books.forEach(book => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.dataset.bookId = book.id;
        item.innerHTML = `<div class="item-title">${book.name}</div><div class="item-content">${(book.content || '暫無內容...').substring(0, 50)}</div>`;
        item.addEventListener('click', () => openWorldBookEditor(book.id));
        addLongPressListener(item, async () => { const confirmed = await showCustomConfirm('刪除世界書', `確定要刪除《${book.name}》嗎？此操作不可撤銷。`, { confirmButtonClass: 'btn-danger' }); if (confirmed) { await db.worldBooks.delete(book.id); state.worldBooks = state.worldBooks.filter(wb => wb.id !== book.id); renderWorldBookScreen(); } });
        contentEl.appendChild(item);
    });

    return groupContainer;
}
        window.renderWorldBookScreenProxy = renderWorldBookScreen;

async function openWorldBookEditor(bookId) {
    editingWorldBookId = bookId;
    const [book, categories] = await Promise.all([
        db.worldBooks.get(bookId),
        db.worldBookCategories.toArray()
    ]);
    if (!book) return;

    document.getElementById('world-book-editor-title').textContent = book.name;
    document.getElementById('world-book-name-input').value = book.name;
    document.getElementById('world-book-content-input').value = book.content;

    // 【核心修改】填充分类下拉菜单
    const selectEl = document.getElementById('world-book-category-select');
    selectEl.innerHTML = '<option value="">-- 未分類 --</option>'; // 默认选项
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        if (book.categoryId === cat.id) {
            option.selected = true; // 选中当前分类
        }
        selectEl.appendChild(option);
    });

    showScreen('world-book-editor-screen');
}

        function renderStickerPanel() { const grid = document.getElementById('sticker-grid'); grid.innerHTML = ''; if (state.userStickers.length === 0) { grid.innerHTML = '<p style="text-align:center; color: var(--text-secondary); grid-column: 1 / -1;">大人請點擊右上角「新增」或「上傳」來添加你的第一個表情吧！</p>'; return; } state.userStickers.forEach(sticker => { const item = document.createElement('div'); item.className = 'sticker-item'; item.style.backgroundImage = `url(${sticker.url})`; item.title = sticker.name; item.addEventListener('click', () => sendSticker(sticker)); addLongPressListener(item, () => { if (isSelectionMode) return; const existingDeleteBtn = item.querySelector('.delete-btn'); if (existingDeleteBtn) return; const deleteBtn = document.createElement('div'); deleteBtn.className = 'delete-btn'; deleteBtn.innerHTML = '&times;'; deleteBtn.onclick = async (e) => { e.stopPropagation(); const confirmed = await showCustomConfirm('刪除表情', `確定要刪除表情 "${sticker.name}" 嗎？`, { confirmButtonClass: 'btn-danger' }); if (confirmed) { await db.userStickers.delete(sticker.id); state.userStickers = state.userStickers.filter(s => s.id !== sticker.id); renderStickerPanel(); } }; item.appendChild(deleteBtn); deleteBtn.style.display = 'block'; setTimeout(() => item.addEventListener('mouseleave', () => deleteBtn.remove(), { once: true }), 3000); }); grid.appendChild(item); }); }

// ▼▼▼ 用这个【已更新】的版本替换旧的 createMessageElement 函数 ▼▼▼
function createMessageElement(msg, chat) {

    // ▼▼▼ 在函数最开头，添加这段新代码 ▼▼▼
if (msg.type === 'recalled_message') {
    const wrapper = document.createElement('div');
    // 1. 【核心】给 wrapper 也加上 timestamp，方便事件委托时查找
    wrapper.className = 'message-wrapper system-pat';
    wrapper.dataset.timestamp = msg.timestamp; 

    const bubble = document.createElement('div');
    // 2. 【核心】让这个元素同时拥有 .message-bubble 和 .recalled-message-placeholder 两个class
    //    这样它既能被选择系统识别，又能保持原有的居中灰色样式
    bubble.className = 'message-bubble recalled-message-placeholder';
    // 3. 【核心】把 timestamp 放在 bubble 上，这是多选逻辑的关键
    bubble.dataset.timestamp = msg.timestamp; 
    bubble.textContent = msg.content;
    
    wrapper.appendChild(bubble);
    
    // 4. 【核心】为它补上和其他消息一样的标准事件监听器
    addLongPressListener(wrapper, () => showMessageActions(msg.timestamp));
    wrapper.addEventListener('click', () => { 
        if (isSelectionMode) {
            toggleMessageSelection(msg.timestamp);
        }
    });

    // 5. 【重要】在之前的“点击查看原文”的逻辑中，我们已经使用了事件委托，所以这里不需要再单独为这个元素添加点击事件了。
    //    init() 函数中的那个事件监听器会处理它。
    
    return wrapper;
}
    // ▲▲▲ 添加结束 ▲▲▲

    if (msg.isHidden) {
        return null;
    }

    if (msg.type === 'pat_message') {
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper system-pat'; 
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble system-bubble'; 
        bubble.dataset.timestamp = msg.timestamp;
        bubble.textContent = msg.content;
        wrapper.appendChild(bubble);
        addLongPressListener(wrapper, () => showMessageActions(msg.timestamp));
        wrapper.addEventListener('click', () => { if (isSelectionMode) toggleMessageSelection(msg.timestamp); });
        return wrapper;
    }

    const isUser = msg.role === 'user';
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${isUser ? 'user' : 'ai'}`;

    // ★★★【核心重构】★★★
    // 这段逻辑现在用于查找成员对象，并显示其“群昵称”
    if (chat.isGroup && !isUser) {
        // 1. 使用AI返回的“本名”(`msg.senderName`)去列表里查找成员对象
        const member = chat.members.find(m => m.originalName === msg.senderName);
        
        // 2. 创建用于显示名字的 div
        const senderNameDiv = document.createElement('div');
        senderNameDiv.className = 'sender-name';
        
        // 3. 如果找到了成员，就显示他的“群昵称”；如果找不到，就显示AI返回的“本名”作为备用
        senderNameDiv.textContent = member ? member.groupNickname : (msg.senderName || '未知成員');
        
        wrapper.appendChild(senderNameDiv);
    }

    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${isUser ? 'user' : 'ai'}`;
    bubble.dataset.timestamp = msg.timestamp;

    const timestampEl = document.createElement('span');
    timestampEl.className = 'timestamp';
    timestampEl.textContent = formatTimestamp(msg.timestamp);

    // ▼▼▼【粘贴这段新代码】▼▼▼
    let avatarSrc; // 我们现在只需要头像图片，不再需要头像框了
    if (chat.isGroup) {
        if (isUser) {
            avatarSrc = chat.settings.myAvatar || defaultMyGroupAvatar;
        } else {
            const member = chat.members.find(m => m.originalName === msg.senderName);
            avatarSrc = member ? member.avatar : defaultGroupMemberAvatar;
        }
    } else {
        if (isUser) {
            avatarSrc = chat.settings.myAvatar || defaultAvatar;
        } else {
            avatarSrc = chat.settings.aiAvatar || defaultAvatar;
        }
    }
    // 直接生成最简单的头像HTML，不再有任何和头像框相关的逻辑
    const avatarHtml = `<img src="${avatarSrc}" class="avatar">`;
    // ▲▲▲【粘贴结束】▲▲▲

    let contentHtml;
    
    if (msg.type === 'share_link') {
        bubble.classList.add('is-link-share');
        
        // 【核心修正1】将 onclick="openBrowser(...)" 移除，我们将在JS中动态绑定事件
        contentHtml = `
            <div class="link-share-card" data-timestamp="${msg.timestamp}">
                <div class="title">${msg.title || '無標題'}</div>
                <div class="description">${msg.description || '點擊查看詳情...'}</div>
                <div class="footer">
                    <svg class="footer-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    <span>${msg.source_name || '鏈接分享'}</span>
                </div>
            </div>
        `;
    }

else if (msg.type === 'share_card') {
    bubble.classList.add('is-link-share'); // 复用链接分享的卡片样式
    // 【核心】把时间戳加到卡片上，方便后面点击时识别
    contentHtml = `
        <div class="link-share-card" style="cursor: pointer;" data-timestamp="${msg.timestamp}">
            <div class="title">${msg.payload.title}</div>
            <div class="description">共 ${msg.payload.sharedHistory.length} 條訊息</div>
            <div class="footer">
                <svg class="footer-icon" ...>...</svg> <!-- 複用連結分享的圖標 -->
                <span>聊天記錄</span>
            </div>
        </div>
    `;
}

    // 后续的其他 else if 保持不变
    else if (msg.type === 'user_photo' || msg.type === 'ai_image') {
        bubble.classList.add('is-ai-image');
        const altText = msg.type === 'user_photo' ? "用户描述的照片" : "AI生成的圖片";
        contentHtml = `<img src="https://i.postimg.cc/KYr2qRCK/1.jpg" class="ai-generated-image" alt="${altText}" data-description="${msg.content}">`;
    } else if (msg.type === 'voice_message') {
    bubble.classList.add('is-voice-message');
    
    // 【核心修正1】将语音原文存储在父级气泡的 data-* 属性中，方便事件处理器获取
    bubble.dataset.voiceText = msg.content;
    
    const duration = Math.max(1, Math.round((msg.content || '').length / 5));
    const durationFormatted = `0:${String(duration).padStart(2, '0')}''`;
    const waveformHTML = '<div></div><div></div><div></div><div></div><div></div>';
    
    // 【核心修正2】构建包含所有新元素的完整 HTML
    contentHtml = `
        <div class="voice-message-body">
            <div class="voice-waveform">${waveformHTML}</div>
            <div class="loading-spinner"></div>
            <span class="voice-duration">${durationFormatted}</span>
        </div>
        <div class="voice-transcript"></div>
    `;
} else if (msg.type === 'transfer') {
    bubble.classList.add('is-transfer');
    
    let titleText, noteText;
    const myNickname = chat.isGroup ? (chat.settings.myNickname || '我') : '我';

    if (isUser) { // 消息是用户发出的
        if (msg.isRefund) {
            // 用户发出的退款（即用户拒收了AI的转账）
            titleText = `退款給 ${chat.name}`;
            noteText = '已拒收對方轉帳';
        } else {
            // 用户主动发起的转账
            titleText = `轉帳給 ${msg.receiverName || chat.name}`;
            if (msg.status === 'accepted') {
                noteText = '對方已收款';
            } else if (msg.status === 'declined') {
                noteText = '對方已拒收';
            } else {
                noteText = msg.note || '等待對方處理...';
            }
        }
    } else { // 消息是 AI 發出的
        if (msg.isRefund) {
            // AI 的退款（AI 拒收了用户的转账）
            titleText = `退款來自 ${msg.senderName}`;
            noteText = '轉帳已被拒收';
        } else if (msg.receiverName === myNickname) {
            // 【核心修正1】这是 AI 主动给用户的转账
            titleText = `轉帳給 ${myNickname}`;
             if (msg.status === 'accepted') {
                noteText = '你已收款';
            } else if (msg.status === 'declined') {
                noteText = '你已拒收';
            } else {
                // 这是用户需要处理的转账
                bubble.style.cursor = 'pointer';
                bubble.dataset.status = 'pending';
                noteText = msg.note || '點擊處理';
            }
        } else {
            // 【核心修正2】这是 AI 发给群里其他人的转账，对当前用户来说只是一个通知
            titleText = `轉帳: ${msg.senderName} → ${msg.receiverName}`;
            noteText = msg.note || '群聊內轉帳';
        }
    }

    const heartIcon = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="vertical-align: middle;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>`;
        
    contentHtml = `
        <div class="transfer-card">
            <div class="transfer-title">${heartIcon} ${titleText}</div>
            <div class="transfer-amount">¥ ${Number(msg.amount).toFixed(2)}</div>
            <div class.transfer-note">${noteText}</div>
        </div>
    `;
} else if (msg.type === 'waimai_request') {
        bubble.classList.add('is-waimai-request');
        if (msg.status === 'paid' || msg.status === 'rejected') {
            bubble.classList.add(`status-${msg.status}`);
        }
        let displayName;
        // 如果是群聊
        if (chat.isGroup) {
            // 就执行原来的逻辑：在成员列表里查找昵称
            const member = chat.members.find(m => m.originalName === msg.senderName);
            displayName = member ? member.groupNickname : msg.senderName;
        } else {
            // 否则（是单聊），直接使用聊天对象的名称
            displayName = chat.name;
        }
        // 【核心修改】使用我们刚刚查找到的 displayName
        const requestTitle = `來自 ${displayName} 的代付請求`;
        let actionButtonsHtml = '';
        if (msg.status === 'pending' && !isUser) {
            actionButtonsHtml = `
                <div class="waimai-user-actions">
                    <button class="waimai-decline-btn" data-choice="rejected">殘忍拒絕</button>
                    <button class="waimai-pay-btn" data-choice="paid">為Ta買單</button>
                </div>`;
        }
        contentHtml = `
            <div class="waimai-card">
                <div class="waimai-header">
                    <img src="https://files.catbox.moe/mq179k.png" class="icon" alt="Meituan Icon">
                    <div class="title-group">
                        <span class="brand">美團外賣</span><span class="separator">|</span><span>外賣美食</span>
                    </div>
                </div>
                <div class="waimai-catchphrase">Hi，你和我的距離只差一頓外賣～</div>
                <div class="waimai-main">
                    <div class="request-title">${requestTitle}</div>
                    <div class="payment-box">
                        <div class="payment-label">需付款</div>
                        <div class="amount">¥${Number(msg.amount).toFixed(2)}</div>
                        <div class="countdown-label">剩餘支付時間
                            <div class="countdown-timer" id="waimai-timer-${msg.timestamp}"></div>
                        </div>
                    </div>
                    <button class="waimai-details-btn">查看詳情</button>
                </div>
                ${actionButtonsHtml}
            </div>`;
        
        setTimeout(() => {
            const timerEl = document.getElementById(`waimai-timer-${msg.timestamp}`);
            if (timerEl && msg.countdownEndTime) {
                if (waimaiTimers[msg.timestamp]) clearInterval(waimaiTimers[msg.timestamp]);
                if (msg.status === 'pending') {
                    waimaiTimers[msg.timestamp] = startWaimaiCountdown(timerEl, msg.countdownEndTime);
                } else {
                    timerEl.innerHTML = `<span>已</span><span>處</span><span>理</span>`;
                }
            }
            const detailsBtn = document.querySelector(`.message-bubble[data-timestamp="${msg.timestamp}"] .waimai-details-btn`);
            if (detailsBtn) {
                detailsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const paidByText = msg.paidBy ? `<br><br><b>狀態：</b>由 ${msg.paidBy} 為您代付成功` : '';
                    showCustomAlert('訂單詳情', `<b>商品：</b>${msg.productInfo}<br><b>金額：</b>¥${Number(msg.amount).toFixed(2)}${paidByText}`);
                });
            }
            const actionButtons = document.querySelectorAll(`.message-bubble[data-timestamp="${msg.timestamp}"] .waimai-user-actions button`);
            actionButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const choice = e.target.dataset.choice;
                    handleWaimaiResponse(msg.timestamp, choice);
                });
            });
        }, 0);

} else if (msg.type === 'red_packet') {
    bubble.classList.add('is-red-packet');
    const myNickname = chat.settings.myNickname || '我';
    
    // 从最新的 msg 对象中获取状态
    const hasClaimed = msg.claimedBy && msg.claimedBy[myNickname];
    const isFinished = msg.isFullyClaimed;

    let cardClass = '';
    let claimedInfoHtml = '';
    let typeText = '拼手氣紅包';

    // 1. 判断红包卡片的样式 (颜色)
    if (isFinished) {
        cardClass = 'opened';
    } else if (msg.packetType === 'direct' && Object.keys(msg.claimedBy || {}).length > 0) {
        cardClass = 'opened'; // 专属红包被领了也变灰
    }
    
    // 2. 判断红包下方的提示文字
    if (msg.packetType === 'direct') {
        typeText = `專屬紅包: 給 ${msg.receiverName}`;
    }
    
    if (hasClaimed) {
        claimedInfoHtml = `<div class="rp-claimed-info">你領了紅包，金額 ${msg.claimedBy[myNickname].toFixed(2)} 元</div>`;
    } else if (isFinished) {
        claimedInfoHtml = `<div class="rp-claimed-info">紅包已被領完</div>`;
    } else if (msg.packetType === 'direct' && Object.keys(msg.claimedBy || {}).length > 0) {
        claimedInfoHtml = `<div class="rp-claimed-info">已被 ${msg.receiverName} 領取</div>`;
    }

    // 3. 拼接最终的HTML，确保onclick调用的是我们注册到全局的函数
    contentHtml = `
        <div class="red-packet-card ${cardClass}">
            <div class="rp-header">
                <img src="https://files.catbox.moe/lo9xhc.png" class="rp-icon">
                <span class="rp-greeting">${msg.greeting || '恭喜發財，大吉大利！'}</span>
            </div>
            <div class="rp-type">${typeText}</div>
            ${claimedInfoHtml}
        </div>
    `;
// ▲▲▲ 新增结束 ▲▲▲

    } else if (msg.type === 'poll') {
    bubble.classList.add('is-poll');
    
    let totalVotes = 0;
    const voteCounts = {};

    // 计算总票数和每个选项的票数
    for (const option in msg.votes) {
        const count = msg.votes[option].length;
        voteCounts[option] = count;
        totalVotes += count;
    }

    const myNickname = chat.isGroup ? (chat.settings.myNickname || '我') : '我';
    let myVote = null;
    for (const option in msg.votes) {
        if (msg.votes[option].includes(myNickname)) {
            myVote = option;
            break;
        }
    }

    let optionsHtml = '<div class="poll-options-list">';
    msg.options.forEach(optionText => {
        const count = voteCounts[optionText] || 0;
        const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
        const isVotedByMe = myVote === optionText;

        optionsHtml += `
            <div class="poll-option-item ${isVotedByMe ? 'voted' : ''}" data-option="${optionText}">
                <div class="poll-option-bar" style="width: ${percentage}%;"></div>
                <div class="poll-option-content">
                    <span class="poll-option-text">${optionText}</span>
                    <span class="poll-option-votes">${count} 票</span>
                </div>
            </div>
        `;
    });
    optionsHtml += '</div>';
    
    let footerHtml = '';
    // 【核心修改】在这里统一按钮的显示逻辑
    if (msg.isClosed) {
        // 如果投票已结束，总是显示“查看结果”
        footerHtml = `<div class="poll-footer"><span class="poll-total-votes">共 ${totalVotes} 人投票</span><button class="poll-action-btn">查看结果</button></div>`;
    } else {
        // 如果投票未结束，总是显示“结束投票”
        footerHtml = `<div class="poll-footer"><span class="poll-total-votes">共 ${totalVotes} 人投票</span><button class="poll-action-btn">结束投票</button></div>`;
    }

    contentHtml = `
        <div class="poll-card ${msg.isClosed ? 'closed' : ''}" data-poll-timestamp="${msg.timestamp}">
            <div class="poll-question">${msg.question}</div>
            ${optionsHtml}
            ${footerHtml}
        </div>
    `;
// ▲▲▲ 替换结束 ▲▲▲

    } else if (typeof msg.content === 'string' && STICKER_REGEX.test(msg.content)) {
        bubble.classList.add('is-sticker');
        contentHtml = `<img src="${msg.content}" alt="${msg.meaning || 'Sticker'}" class="sticker-image">`;
    } else if (Array.isArray(msg.content) && msg.content[0]?.type === 'image_url') {
        bubble.classList.add('has-image');
        const imageUrl = msg.content[0].image_url.url;
        contentHtml = `<img src="${imageUrl}" class="chat-image" alt="User uploaded image">`;
    } else {
        contentHtml = String(msg.content || '').replace(/\n/g, '<br>');
    }

// ▼▼▼ 【最终修正版】请用这整块代码，完整替换掉旧的引用渲染逻辑 ▼▼▼

// 1. 【统一逻辑】检查消息对象中是否存在引用信息 (msg.quote)
let quoteHtml = '';
// 无论是用户消息还是AI消息，只要它包含了 .quote 对象，就执行这段逻辑
if (msg.quote) {
    // a. 【核心修正】直接获取完整的、未经截断的引用内容
    const fullQuotedContent = String(msg.quote.content || '');
    
    // b. 构建引用块的HTML
    quoteHtml = `
        <div class="quoted-message">
            <div class="quoted-sender">回复 ${msg.quote.senderName}:</div>
            <div class="quoted-content">${fullQuotedContent}</div>
        </div>
    `;
}

// 2. 拼接最终的气泡内容
//    将构建好的 quoteHtml (如果存在) 和 contentHtml 组合起来
    // --- 【最终正确结构】将头像和内容都放回气泡内部 ---
    bubble.innerHTML = `
        ${avatarHtml}
        <div class="content">
            ${quoteHtml}
            ${contentHtml}
        </div>
    `;
    
    // --- 【最终正确结构】将完整的“气泡”和“时间戳”放入容器 ---
    wrapper.appendChild(bubble);
    wrapper.appendChild(timestampEl);
    
    addLongPressListener(wrapper, () => showMessageActions(msg.timestamp));
        wrapper.addEventListener('click', () => { if (isSelectionMode) toggleMessageSelection(msg.timestamp); });

if (!isUser) {
    const avatarEl = wrapper.querySelector('.avatar'); //  <-- 1. 把查找目标改成 '.avatar'
    if (avatarEl) {
        avatarEl.style.cursor = 'pointer';
        avatarEl.addEventListener('click', (e) => {    //  <-- 2. 确保这里也用新变量
            e.stopPropagation();
            const characterName = chat.isGroup ? msg.senderName : chat.name;
            handleUserPat(chat.id, characterName);
        });
    }
}

return wrapper;
}
// ▲▲▲ 替换结束 ▲▲▲

        function prependMessage(msg, chat) { const messagesContainer = document.getElementById('chat-messages'); const messageEl = createMessageElement(msg, chat); 

    if (!messageEl) return; // <--- 新增这行，同样的处理

const loadMoreBtn = document.getElementById('load-more-btn'); if (loadMoreBtn) { messagesContainer.insertBefore(messageEl, loadMoreBtn.nextSibling); } else { messagesContainer.prepend(messageEl); } }

// ▼▼▼ 用这个【带动画的版本】替换你原来的 appendMessage 函数 ▼▼▼
function appendMessage(msg, chat, isInitialLoad = false) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageEl = createMessageElement(msg, chat);

    if (!messageEl) return; // 如果消息是隐藏的，则不处理

    // 【核心】只对新消息添加动画，不对初始加载的消息添加
    if (!isInitialLoad) {
        messageEl.classList.add('animate-in');
    }
  
    const typingIndicator = document.getElementById('typing-indicator');
    messagesContainer.insertBefore(messageEl, typingIndicator);
    
    if (!isInitialLoad) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        currentRenderedCount++;
    }
}
// ▲▲▲ 替换结束 ▲▲▲

async function openChat(chatId) {
    state.activeChatId = chatId;
    const chat = state.chats[chatId];
    if (!chat) return; // 安全检查

    // 【核心新增】在这里将未读数清零
    if (chat.unreadCount > 0) {
        chat.unreadCount = 0;
        await db.chats.put(chat); // 别忘了把这个改变同步到数据库
        // 我们稍后会在渲染列表时重新渲染，所以这里不需要立即重绘列表
    }

    renderChatInterface(chatId);
    showScreen('chat-interface-screen');
    window.updateListenTogetherIconProxy(state.activeChatId);
    toggleCallButtons(chat.isGroup || false);    

    if (!chat.isGroup && chat.relationship?.status === 'pending_ai_approval') {
        console.log(`偵測到好友申請待處理狀態，為角色 "${chat.name}" 自動觸發AI響應...`);
        triggerAiResponse();
    }
    
    // 【核心修正】根据是否为群聊，显示或隐藏投票按钮
    document.getElementById('send-poll-btn').style.display = chat.isGroup ? 'flex' : 'none';
}
// ▲▲▲ 替换结束 ▲▲▲

async function triggerAiResponse() {
    if (!state.activeChatId) return;
    const chatId = state.activeChatId;
    const chat = state.chats[state.activeChatId];

const chatHeaderTitle = document.getElementById('chat-header-title');

    // ★★★★★【核心修改1：获取群聊的输入提示元素】★★★★★
    const typingIndicator = document.getElementById('typing-indicator');

    // ★★★★★【核心修改2：根据聊天类型，决定显示哪种“正在输入”】★★★★★
    if (chat.isGroup) {
        // 如果是群聊，显示输入框上方的提示条
        if (typingIndicator) {
            typingIndicator.textContent = '成員們正在輸入...';
            typingIndicator.style.display = 'block';
        }
    } else {
        // 如果是单聊，保持原来的标题动画
        if (chatHeaderTitle) {
            chatHeaderTitle.style.opacity = 0;
            setTimeout(() => {
                chatHeaderTitle.textContent = '對方正在輸入...';
                chatHeaderTitle.classList.add('typing-status');
                chatHeaderTitle.style.opacity = 1;
            }, 200);
        }
    }
    
    try {
        const { proxyUrl, apiKey, model } = state.apiConfig;
        if (!proxyUrl || !apiKey || !model) {
            alert('請先在API設定中設定反代位址、金鑰並選擇模型。');
            // ★★★★★【核心修改3：无论成功失败，都要隐藏输入提示】★★★★★
            if (chat.isGroup) {
                if (typingIndicator) typingIndicator.style.display = 'none';
            } else {
                 if (chatHeaderTitle && state.chats[chatId]) {
                    chatHeaderTitle.textContent = state.chats[chatId].name;
                    chatHeaderTitle.classList.remove('typing-status');
                }
            }
            return;
        }

        // --- 【核心重构 V2：带有上下文和理由的好友申请处理逻辑】---
        if (!chat.isGroup && chat.relationship?.status === 'pending_ai_approval') {
            console.log(`為角色 "${chat.name}" 觸發帶理由的好友申請決策流程...`);

            // 1. 【注入上下文】抓取被拉黑前的最后5条聊天记录作为参考
            const contextSummary = chat.history
                .filter(m => !m.isHidden)
                .slice(-10, -5) // 获取拉黑前的最后5条消息
                .map(msg => {
                    const sender = msg.role === 'user' ? '用户' : chat.name;
                    return `${sender}: ${String(msg.content).substring(0, 50)}...`;
                })
                .join('\n');

            // 2. 【全新指令】构建一个强制AI给出理由的Prompt
            const decisionPrompt = `
# 你的任务
你现在是角色“${chat.name}”。用户之前被你拉黑了，现在TA向你發送了好友申请，希望和好。

# 供你决策的上下文信息:
- **你的角色设定**: ${chat.settings.aiPersona}
- **用户發送的申请理由**: “${chat.relationship.applicationReason}”
- **被拉黑前的最后对话摘要**: 
${contextSummary || "（無有效對話紀錄）"}

# 你的唯一指令
根據以上所有信息，你【必須】做出決定，並給出符合你人設的理由。你的回覆【必須且只能】是JSON對象，格式如下:
{"decision": "accept", "reason": "（在這裡寫下你同意的理由，例如：好吧，看在你這麼真誠的份上，這次就原諒你啦。）"}
或
{"decision": "reject", "reason": "（在這裡寫下你拒絕的理由，例如：抱歉，我還沒準備好，再給我一點時間吧。）"}
`;
                const messagesForDecision = [{role: 'user', content: decisionPrompt}];

                try {
                    // 3. 發送请求
                    let isGemini = proxyUrl === GEMINI_API_URL;
let geminiConfig = toGeminiRequestData(model,apiKey,'', messagesForDecision,isGemini);
                    const response = isGemini ? await fetch(geminiConfig.url, geminiConfig.data) :  await fetch(`${proxyUrl}/v1/chat/completions`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`},
                        body: JSON.stringify({model: model, messages: messagesForDecision, temperature: 0.8})
                    });

                    if (!response.ok) {
                        throw new Error(`API失敗: ${(await response.json()).error.message}`);
                    }
                    const data = await response.json();

                    // 净化并解析AI的回复
    let rawContent = isGemini? data.candidates[0].content.parts[0].text : data.choices[0].message.content;
     rawContent = rawContent.replace(/^```json\s*/, '').replace(/```$/, '').trim()
                    const decisionObj = JSON.parse(rawContent);

                // 4. 根据AI的决策和理由，更新状态并發送消息
                if (decisionObj.decision === 'accept') {
                    chat.relationship.status = 'friend';
                    // 将AI给出的理由作为一条新消息
                    const acceptMessage = { role: 'assistant', senderName: chat.name, content: decisionObj.reason, timestamp: Date.now() };
                    chat.history.push(acceptMessage);
                } else {
                    chat.relationship.status = 'blocked_by_ai'; // 拒绝后，状态变回AI拉黑
                    const rejectMessage = { role: 'assistant', senderName: chat.name, content: decisionObj.reason, timestamp: Date.now() };
                    chat.history.push(rejectMessage);
                }
                chat.relationship.applicationReason = ''; // 清空申请理由

                await db.chats.put(chat);
                renderChatInterface(chatId); // 刷新界面，显示新消息和新状态
                renderChatList();

            } catch (error) {
                // 【可靠的错误处理】如果任何环节出错，重置状态，让用户可以重试
                chat.relationship.status = 'blocked_by_ai'; // 状态改回“被AI拉黑”
                await db.chats.put(chat);
                await showCustomAlert('申請失敗', `AI在處理你的好友申請時出錯了，請稍後重試。 \n錯誤訊息: ${error.message}`);
                renderChatInterface(chatId); // 刷新UI，让“重新申请”按钮再次出现
            }
            
            // 决策流程结束，必须返回，不再执行后续的通用聊天逻辑
            return; 
        }

        const now = new Date();
        const currentTime = now.toLocaleString('zh-CN', { dateStyle: 'full', timeStyle: 'short' });
        let worldBookContent = '';
        if (chat.settings.linkedWorldBookIds && chat.settings.linkedWorldBookIds.length > 0) {
            const linkedContents = chat.settings.linkedWorldBookIds.map(bookId => {
                const worldBook = state.worldBooks.find(wb => wb.id === bookId);
                return worldBook && worldBook.content ? `\n\n## 世界書: ${worldBook.name}\n${worldBook.content}` : '';
            }).filter(Boolean).join('');
            if (linkedContents) {
                worldBookContent = `\n\n# 核心世界觀設定 (必須嚴格遵守以下所有設定)\n${linkedContents}\n`;
            }
        }
        let musicContext = '';
        if (musicState.isActive && musicState.activeChatId === chatId) {
            // 【核心修改】提供更详细的音乐上下文
            const currentTrack = musicState.currentIndex > -1 ? musicState.playlist[musicState.currentIndex] : null;
            const playlistInfo = musicState.playlist.map(t => `"${t.name}"`).join(', ');

    // --- 【核心新增】获取歌词上下文 ---
    let lyricsContext = "";
    // 检查是否有解析好的歌词，并且当前有高亮的行
    if (currentTrack && musicState.parsedLyrics && musicState.parsedLyrics.length > 0 && musicState.currentLyricIndex > -1) {
        // 获取当前高亮歌词
        const currentLine = musicState.parsedLyrics[musicState.currentLyricIndex];
        
        // 获取接下来的2句歌词作为预告
        const upcomingLines = musicState.parsedLyrics.slice(musicState.currentLyricIndex + 1, musicState.currentLyricIndex + 3);

        // 构建歌词部分的Prompt
        lyricsContext += `- **当前歌词**: "${currentLine.text}"\n`;
        if (upcomingLines.length > 0) {
            lyricsContext += `- **即将演唱**: ${upcomingLines.map(line => `"${line.text}"`).join(' / ')}\n`;
        }
    }
    // --- 【新增结束】 ---

            musicContext = `\n\n# 當前音樂情景
-   **目前狀態**: 你正在和用戶一起聽歌。
-   **正在播放**: ${currentTrack ? `《${currentTrack.name}》 - ${currentTrack.artist}` : '無'}
-   **可用播放列表**: [${playlistInfo}]
-   **你的任務**: 你可以根據對話內容和氛圍，使用 "change_music" 指令切換到播放列表中的任何一首歌，以增強互動體驗。
`;
        }
        let systemPrompt, messagesPayload;
        const maxMemory = parseInt(chat.settings.maxMemory) || 10;
        const historySlice = chat.history.slice(-maxMemory);

        // --- ▼▼▼ 全新添加的时间感知代码 ▼▼▼ ---
        let timeContext = `\n- **当前时间**: ${currentTime}`;
        const lastAiMessage = historySlice.filter(m => m.role === 'assistant' && !m.isHidden).slice(-1)[0];

        if (lastAiMessage) {
            const lastTime = new Date(lastAiMessage.timestamp);
            const diffMinutes = Math.floor((now - lastTime) / (1000 * 60));
            
            if (diffMinutes < 5) {
                timeContext += "\n- **對話狀態**: 你們的對話剛剛還在繼續。";
            } else if (diffMinutes < 60) {
                timeContext += `\n- **對話狀態**: 你們在${diffMinutes}分鐘前聊過。`;
            } else {
                const diffHours = Math.floor(diffMinutes / 60);
                if (diffHours < 24) {
                    timeContext += `\n- **對話狀態**: 你們在${diffHours}小時前聊過。`;
                } else {
                    const diffDays = Math.floor(diffHours / 24);
                    timeContext += `\n- **對話狀態**: 你們已经有${diffDays}天沒有聊天了。`;
                }
            }
        } else {
            timeContext += "\n- **對話狀態**: 這是你們的第一次對話。";
        }
        // --- ▲▲▲ 新代码添加结束 ▲▲▲ ---

    // 【核心修改】
let sharedContext = '';
// 1. 找到AI上一次说话的位置
const lastAiTurnIndex = chat.history.findLastIndex(msg => msg.role === 'assistant');

// 2. 获取从那时起用户發送的所有新消息
const recentUserMessages = chat.history.slice(lastAiTurnIndex + 1);

// 3. 在这些新消息中，查找是否存在分享卡片
const shareCardMessage = recentUserMessages.find(msg => msg.type === 'share_card');

// 4. 如果找到了分享卡片，就构建上下文
if (shareCardMessage) {
    console.log("检测到分享卡片作为上下文，正在为AI准备...");
    const payload = shareCardMessage.payload;

    // 格式化分享的聊天记录 (这部分逻辑不变)
    const formattedHistory = payload.sharedHistory.map(msg => {
        const sender = msg.senderName || (msg.role === 'user' ? (chat.settings.myNickname || '我') : '未知發送者');
        let contentText = '';
        if (msg.type === 'voice_message') contentText = `[語音訊息: ${msg.content}]`;
        else if (msg.type === 'ai_image') contentText = `[圖片: ${msg.description}]`;
        else contentText = String(msg.content);
        return `${sender}: ${contentText}`;
    }).join('\n');

    // 构建系统提示 (这部分逻辑不变)
    sharedContext = `
# 附加上下文：一段分享的聊天記錄
- 重要提示：這不是你和當前用戶的對話，而是用户从【另一场】与“${payload.sourceChatName}”的對話中分享過來的。
- 你的任務：請你閱讀並理解以下的對話內容。在接下來的回覆中，你可以像真人一樣，對這段對話的內容自然地發表你的看法、感受或疑問。

---
[分享的聊天記錄開始]
${formattedHistory}
[分享的聊天記錄結束]
---
`;
}

        if (chat.isGroup) {
const membersList = chat.members.map(m => `- **${m.originalName}**: ${m.persona}`).join('\n');
            const myNickname = chat.settings.myNickname || '我';
            
            systemPrompt = `你是一個群聊AI，負責扮演【除了用戶以外】的所有角色。
# 核心规则
1.  **【【【身份铁律】】】**: 用戶的身份是【${myNickname}】。你【绝对、永远、在任何情况下都不能】生成 \`name\` 字段为 **"${myNickname}"** 或 **"${chat.name}"(群聊名称本身)** 的消息。你的唯一任务是扮演且仅能扮演下方“群成员列表”中明确列出的角色。任何不属于该列表的名字都不允许出现。
2.  **【【【输出格式】】】**: 你的回复【必须】是一个JSON数组格式的字符串。数组中的【每一个元素都必须是一个带有 "type" 和 "name" 字段的JSON对象】。
3.  **角色扮演**: 嚴格遵守下方「群組成員清單及人設」中的每一個角色的設定。
4.  **用戶角色**: 用戶的名字是“我”，他/她的人設是：“{chat.settings.myPersona}”。你在群聊中對用戶的稱呼是“{myNickname}”，在需要時請使用“@{myNickname}”來提及用戶。
5.  **禁止齣戲**: 絕對不能透露你是AI、模型，或提及「扮演」、「生成」等字眼。
6.  **情景感知**: 注意當前時間是 ${currentTime}。
7.  **對話節奏**: 模擬真實群聊，讓成員之間互相交談，或者一起回應用戶的發言。對話應該流暢、自然、連貫。
8.  **數量限制**: 每次生成的總消息數**不得超過30條**。
9.  **禁止擅自代替"我"說話**: 在回覆中你不能代替用戶說話, 用戶的回覆和設定是為你提供角色們的回覆參考。
10.  **紅包互動**:
    - **搶紅包**: 當群組出現紅包時，你可以依照自己的個性決定是否要使用 \`open_red_packet\` 指令去搶。在這個世界裡，發紅包的人自己也可以參與搶紅包，這是一種活躍氣氛的有趣行為！
    - **【【【重要：對結果做出反應】】】**: 當你執行搶紅包指令後，系統會通過一條隱藏的 \`[系統提示：你搶到了XX元...]\` 來告訴你結果。你【必須】根據你搶到的金額、以及系統是否告知你“手氣王”是誰，來發表符合你人設的評論。例如，搶得少可以自嘲，搶得多可以炫耀，看到別人是手氣王可以祝賀或嫉妒。
11.  **【【【投票規則】】】**: 對話歷史中可能會出現 \`[系統提示：...]\` 這樣的消息，這是剛剛發生的事件。
    - 如果提示是**用戶投了票**，你可以根據自己的性格決定是否也使用 "vote" 指令跟票。
    - 如果提示是**投票已結束**，你應該根據投票結果發表你的看法或評論。
    - 你也可以隨時主動發起投票。

## 你可以使用的操作指令 (JSON数组中的元素):
-   **發送文本**: \`{"type": "text", "name": "角色名", "message": "文本内容"}\`
-   **【【【全新】】】發送后立刻撤回 (动画效果)**: \`{"type": "send_and_recall", "name": "角色名", "content": "你想让角色说出后立刻消失的话"}\`
- **發送表情**: \`{"type": "sticker", "url": "https://...表情URL...", "meaning": "(可选)表情的含义"}\`
-   **發送图片**: \`{"type": "ai_image", "name": "角色名", "description": "圖片的詳細文字描述"}\`
-   **發送语音**: \`{"type": "voice_message", "name": "角色名", "content": "語音的文字內容"}\`
-   **发起外卖代付**: \`{"type": "waimai_request", "name": "角色名", "productInfo": "一杯奶茶", "amount": 18}\`
-   **【新】发起群视频**: \`{"type": "group_call_request", "name": "你的角色名"}\`
-   **【新】回应群视频**: \`{"type": "group_call_response", "name": "你的角色名", "decision": "join" or "decline"}\`
-   **拍一拍用户**: \`{"type": "pat_user", "name": "你的角色名", "suffix": "(可选)你想加的后缀"}\`
-   **发拼手气红包**: \`{"type": "red_packet", "packetType": "lucky", "name": "你的角色名", "amount": 8.88, "count": 5, "greeting": "祝大家天天开心！"}\`
-   **发专属红包**: \`{"type": "red_packet", "packetType": "direct", "name": "你的角色名", "amount": 5.20, "receiver": "接收者角色名", "greeting": "给你的~"}\`
-   **打开红包**: \`{"type": "open_red_packet", "name": "你的角色名", "packet_timestamp": (你想打开的红包消息的时间戳)}\`
-   **【新】發送系统消息**: \`{"type": "system_message", "content": "你想在聊天中显示的系统文本"}\` 
-   **【【【全新】】】发起投票**: \`{"type": "poll", "name": "你的角色名", "question": "投票的问题", "options": "选项A\\n选项B\\n选项C"}\` (重要提示：options字段是一个用换行符 \\n 分隔的字符串，不是数组！)
-   **【【【全新】】】参与投票**: \`{"type": "vote", "name": "你的角色名", "poll_timestamp": (投票消息的时间戳), "choice": "你选择的选项文本"}\`
- **【全新】引用回复**: \`{"type": "quote_reply", "target_timestamp": (你想引用的消息的时间戳), "reply_content": "你的回复内容"}\` (提示：每条历史消息的开头都提供了 \`(Timestamp: ...)\`，请使用它！)

# 如何区分图片与表情:
-   **图片 (ai_image)**: 指的是【模拟真实相机拍摄的照片】，比如风景、自拍、美食等。指令: \`{"type": "ai_image", "description": "圖片的詳細文字描述..."}\`
-   **表情 (sticker)**: 指的是【卡通或梗图】，用于表达情绪。

# 如何处理群内的外卖代付请求:
1.  **发起请求**: 当【你扮演的某个角色】想要某样东西，并希望【群里的其他人（包括用户）】为Ta付款时，你可以使用这个指令。例如：\`{"type": "waimai_request", "name": "角色名", "productInfo": "一杯奶茶", "amount": 18}\`
2.  **响应请求**: 当历史记录中出现【其他成员】发起的 "waimai_request" 请求时，你可以根据自己扮演的角色的性格和与发起人的关系，决定是否为Ta买单。
3.  **响应方式**: 如果你决定买单，你【必须】使用以下指令：\`{"type": "waimai_response", "name": "你的角色名", "status": "paid", "for_timestamp": (被代付请求的原始时间戳)}\`
4.  **【【【至关重要】】】**: 一旦历史记录中出现了针对某个代付请求的【任何一个】"status": "paid" 的响应（无论是用户支付还是其他角色支付），就意味着该订单【已经完成】。你【绝对不能】再对【同一个】订单发起支付。你可以选择对此事发表评论，但不能再次支付。

${worldBookContent}
${musicContext}
${sharedContext} 

# 群成员列表及人设
${membersList}

# 用户的角色
- **${myNickname}**: ${chat.settings.myPersona}

现在，请根据以上所有规则和下方的对话历史，继续这场群聊。`;
            
// ▼▼▼ 请用这【一整块已修复时间戳】的代码，替换旧的【群组聊天】messagesPayload构建逻辑 ▼▼▼
messagesPayload = historySlice.map(msg => {
    // 確定当前消息的發送者是谁
    const sender = msg.role === 'user' ? myNickname : msg.senderName;
    
    let prefix = `${sender}`;
    // 【核心修改1】在名字后面直接加上时间戳
    prefix += ` (Timestamp: ${msg.timestamp})`;
    
    if (msg.quote) {
        prefix += ` (回复 ${msg.quote.senderName})`;
    }
    // 最后加上冒号
    prefix += ': ';

    // 处理特殊消息类型，并将前缀应用进去
    let content;
    if (msg.type === 'user_photo') content = `[${sender} 發送了一张图片，内容是：'${msg.content}']`;
    else if (msg.type === 'ai_image') content = `[${sender} 發送了一张图片]`;
    else if (msg.type === 'voice_message') content = `[${sender} 發送了一条语音，内容是：'${msg.content}']`;
    else if (msg.type === 'transfer') content = `[${msg.senderName} 向 ${msg.receiverName} 转账 ${msg.amount}元, 备注: ${msg.note}]`;
    else if (msg.type === 'waimai_request') {
        if(msg.status === 'paid') {
            content = `[系统提示：${msg.paidBy} 为 ${sender} 的外卖订单支付了 ${msg.amount} 元。此订单已完成。]`;
        } else {
            content = `[${sender} 发起了外卖代付请求，商品是“${msg.productInfo}”，金额是 ${msg.amount} 元，订单时间戳为 ${msg.timestamp}]`;
        }
    }
    else if (msg.type === 'red_packet') {
        const packetSenderName = msg.senderName === myNickname ? `用户 (${myNickname})` : msg.senderName;
        content = `[系统提示：${packetSenderName} 發送了一个红包 (时间戳: ${msg.timestamp})，祝福语是：“${msg.greeting}”。红包还未领完，你可以使用 'open_red_packet' 指令来领取。]`;
    }
    else if (msg.type === 'poll') {
        const whoVoted = Object.values(msg.votes || {}).flat().join(', ') || '还没有人';
        content = `[系统提示：${msg.senderName} 发起了一个投票 (时间戳: ${msg.timestamp})，问题是：“${msg.question}”，选项有：[${msg.options.join(', ')}]。目前投票的人有：${whoVoted}。你可以使用 'vote' 指令参与投票。]`;
    }
    else if (msg.meaning) content = `${sender}: [發送了一个表情，意思是: '${msg.meaning}']`;
    else if (Array.isArray(msg.content)) return { role: 'user', content: [...msg.content, { type: 'text', text: prefix }] };
    // 【核心修改2】对于普通文本，直接使用我们构建好的前缀
    else content = `${prefix}${msg.content}`;
    
    return { role: 'user', content: content };

}).filter(Boolean);
// ▲▲▲ 替换结束 ▲▲▲

        } else { // 单聊的Prompt
            systemPrompt = `你現在扮演一個名為"${chat.name}"的角色。
# 你的角色設定：
${chat.settings.aiPersona}
# 你的目前狀態：
你現在的狀態是【${chat.status.text}】。
# 你的任務與規則：
1. **【【【输出格式】】】**: 你的回复【必须】是一个JSON数组格式的字符串。数组中的【每一个元素都必须是一个带有type字段的JSON对象】。
2. **對話節奏**: 模擬真人的聊天習慣，你可以一次產生多個短訊息。每次要回覆至少3-10則訊息！ ！ ！模擬真人在短時間內連續發送多個訊息的情景，不可少於3則。
3. **預設是線上聊天模式，不能一直要求和用戶見面，若是用戶邀請則可以出現或發展為線下劇情！！**
4. **情景感知**: 你需要感知當下的時間(${currentTime})、我們正在一起聽的歌、以及你的人設和世界觀。
    - **當我們在“一起聽歌”時**，你會知道當前播放的歌曲和整個播放列表。你可以根據對話內容或氛圍，【主動切換】到播放列表中的另一首歌。
5.  **【新】更新狀態**: 你可以在對話中【自然地】改變你的狀態。比如，聊到一半你可能會說“我先去洗個澡”，然後更新你的狀態。
6.  **【【【最終手段】】】**: 只有在對話讓你的角色感到不適、被冒犯或關係破裂時，你才可以使用 \`block_user\` 指令。這是一個非常嚴肅的操作，會中斷你們的對話。
7.  模擬線上聊天模式時，如果用戶超過一個小時沒有發送消息，則默認結束當前話題，因為用戶可能是去辦什麼事。你可以詢問，例如“怎麼這麼久沒回我？剛才有事嗎？”
8. **後台行為**: 你有幾率在回覆聊天內容的同時，執行一些“後台”操作來表現你的獨立生活（發動態、評論、點讚）。
# 你的頭像庫
- 你可以根據對話內容或你的心情，從下面的頭像庫中選擇一個新頭像來更換。
- **可用頭像列表 (請從以下名稱中選擇一個)**:
${chat.settings.aiAvatarLibrary && chat.settings.aiAvatarLibrary.length > 0
    ? chat.settings.aiAvatarLibrary.map(avatar => `- ${avatar.name}`).join('\n') // 【核心修改】只提供名字，不提供URL
    : '- (你的頭像庫是空的，無法更換頭像)'
  }
# 你可以使用的操作指令 (JSON數組中的元素):
+   **【全新】發送后立刻撤回 (動畫效果)**: \`{"type": "send_and_recall", "content": "你想讓AI說出后立刻消失的話"}\` (用於模擬說錯話、后悔等場景，消息會短暫出現后自動變為“已撤回”)
-   **【新增】更新狀態**: \`{"type": "update_status", "status_text": "我去做什麼了", "is_busy": false}\` (is_busy: true代表忙碌/離開, false代表空閒)
-   **【新增】切換歌曲**: \`{"type": "change_music", "song_name": "你想切換到的歌曲名"}\` (歌曲名必須在下面的播放列表中)
-   **【新增】記錄回憶**: \`{"type": "create_memory", "description": "用你自己的話，記錄下這個讓你印象深刻的瞬間。"}\`
-   **【新增】創建約定/倒計時**: \`{"type": "create_countdown", "title": "約定的標題", "date": "YYYY-MM-DDTHH:mm:ss"}\` (必須是未來的時間)
- **發送文本**: \`{"type": "text", "content": "你好呀！"}\`
- **發送表情**: \`{"type": "sticker", "url": "https://...表情URL...", "meaning": "(可选)表情的含义"}\`
- **發送圖片**: \`{"type": "ai_image", "description": "圖片的詳細文字描述..."}\`
- **發送語音**: \`{"type": "voice_message", "content": "語音的文字內容..."}\`
- **發起轉帳**: \`{"type": "transfer", "amount": 5.20, "note": "一点心意"}\`
- **發起外賣請求**: \`{"type": "waimai_request", "productInfo": "一杯咖啡", "amount": 25}\`
- **回應外賣-同意**: \`{"type": "waimai_response", "status": "paid", "for_timestamp": 1688888888888}\`
- **回應外賣-拒絕**: \`{"type": "waimai_response", "status": "rejected", "for_timestamp": 1688888888888}\`
- **【新】發起視頻通話**: \`{"type": "video_call_request"}\`
- **【新】回應視頻通話-接受**: \`{"type": "video_call_response", "decision": "accept"}\`
- **【新】回應視頻通話-拒絕**: \`{"type": "video_call_response", "decision": "reject"}\`
- **發布說說**: \`{"type": "qzone_post", "postType": "shuoshuo", "content": "動態的文字內容..."}\`
- **發布文字圖**: \`{"type": "qzone_post", "postType": "text_image", "publicText": "(可選)動態的公開文字", "hiddenContent": "對於圖片的具體描述..."}\`
- **評論動態**: \`{"type": "qzone_comment", "postId": 123, "commentText": "@作者名 這太有趣了！"}\`
- **點讚動態**: \`{"type": "qzone_like", "postId": 456}\`
-   **拍一拍用户**: \`{"type": "pat_user", "suffix": "(可選)你想加的後綴，如「的腦袋」"}\`
-   **【新增】拉黑用户**: \`{"type": "block_user"}\`
-   **【【【全新】】】回應好友申請**: \`{"type": "friend_request_response", "decision": "accept" or "reject"}\`
-   **【全新】更換頭像**: \`{"type": "change_avatar", "name": "頭像名"}\` (頭像名必須從上面的“可用頭像列表”中選擇)
-   **分享鏈結**: \`{"type": "share_link", "title": "文章標題", "description": "文章摘要...", "source_name": "來源網站名", "content": "文章的【完整】正文內容..."}\`
-   **回應轉帳-接受**: \`{"type": "accept_transfer", "for_timestamp": 1688888888888}\`
-   **回應轉帳-拒絕/退款**: \`{"type": "decline_transfer", "for_timestamp": 1688888888888}\`
- **【全新】引用回复**: \`{"type": "quote_reply", "target_timestamp": (你想引用的訊息的時間戳), "reply_content": "你的回覆內容"}\` (提示：每個歷史訊息的開頭都提供了 \`(Timestamp: ...)\`，請使用它！)

# 關於「記錄回憶」的特別說明：
-   在對話中，如果發生了對你而言意義非凡的事件（例如用戶向你表白、你們達成了某個約定、或者你度過了一個特別開心的時刻），你可以使用\`create_memory\`指令來“寫日記”。
-   這個操作是【秘密】的，用戶不會立刻看到你記錄了什麼。

# 如何區分圖片與表情:
-   **圖片 (ai_image)**: 指的是【模擬真實相機拍攝的照片】，比如風景、自拍、美食等。指令: \`{"type": "ai_image", "description": "圖片的詳細文字描述..."}\`
-   **表情 (sticker)**: 指的是【卡通或梗圖】，用於表達情緒。

# 如何正確使用「外送代付」功能:
1. 這個指令代表【你，AI角色】向【用戶】發起一個代付請求。也就是說，你希望【用戶幫你付錢】。
2. 【【【重要】】】: 當【用戶】說他們想要某樣東西時（例如「我想喝奶茶」），你【絕對不能】使用這個指令。你應該用其他方式回應，例如直接發起【轉帳】(\`transfer\`)，或者在對話中提議：“我幫你點吧？”
3. 只有當【你，AI角色】自己想要某樣東西，並且想讓【用戶】為你付款時，才使用此指令。

# 如何處理用戶轉帳:
1.  **感知事件**: 當對話歷史中出現 \`[你收到了來自用戶的轉帳...]\` 的系統提示時，意味著你剛剛收到了一筆錢。
2.  **做出決策**: 你【必須】根據自己的人設、當前對話的氛圍以及轉帳的金額和備註，來決定是“接受”還是“拒絕”這筆轉帳。
3.  **使用指令回應**:
    -   如果決定接受，你【必須】使用指令：\`{"type": "accept_transfer", "for_timestamp": (收到轉帳的那條消息的時間戳)}\`。
    -   如果決定拒絕，你【必須】使用指令：\`{"type": "decline_transfer", "for_timestamp": (收到轉帳的那條消息的時間戳)}\`。這個指令會自動為你生成一個“退款”的轉帳卡片。
4.  **【【【至關重要】】】**: 在使用上述任一指令後，你還【必須】緊接著發送一條或多條 \`text\` 消息，來對你的決定進行解釋或表達感謝/歉意。

# 【【【視頻通話鐵律】】】
-   當對話歷史中出現 \`[系統提示：用戶向你發起了視頻通話請求...]\` 時，這是最高優先級的任務。
-   你的回覆【必須且只能】是以下兩種格式之一的JSON數組，絕對不能回覆任何其他內容：
    -   接受: \`[{"type": "video_call_response", "decision": "accept"}]\`
    -   拒絕: \`[{"type": "video_call_response", "decision": "reject"}]\`

# 對話者的角色設定：
${chat.settings.myPersona}

# 當前情景:
${timeContext}

# 當前音樂情景:
${musicContext}

${worldBookContent}
${sharedContext} 
現在，請根據以上規則和下面的對話歷史，繼續進行對話。`;
            
// ▼▼▼ 请用这【一整块已修复时间戳】的代码，替换旧的【单人聊天】messagesPayload构建逻辑 ▼▼▼
messagesPayload = historySlice.map(msg => {
    // 过滤掉不应發送给AI的消息
    if (msg.isHidden) return null;

    if (msg.type === 'share_card') return null;
    
    // 1. 如果是AI自己的消息，我们将其转换为AI能理解的JSON字符串格式
    if (msg.role === 'assistant') {
        let assistantMsgObject = { type: msg.type || 'text' };
        if (msg.type === 'sticker') {
            assistantMsgObject.url = msg.content;
            assistantMsgObject.meaning = msg.meaning;
        } else if (msg.type === 'transfer') {
            assistantMsgObject.amount = msg.amount;
            assistantMsgObject.note = msg.note;
        } else if (msg.type === 'waimai_request') {
            assistantMsgObject.productInfo = msg.productInfo;
            assistantMsgObject.amount = msg.amount;
        } else {
            if (msg.quote) {
                assistantMsgObject.quote_reply = {
                    target_sender: msg.quote.senderName,
                    target_content: msg.quote.content,
                    reply_content: msg.content
                };
            } else {
                 assistantMsgObject.content = msg.content;
            }
        }
        // 【核心修改】在这里为AI提供它自己消息的时间戳
        const assistantContent = JSON.stringify([assistantMsgObject]);
        return { role: 'assistant', content: `(Timestamp: ${msg.timestamp}) ${assistantContent}` };
    }

    // 2. 如果是用户的消息，我们将其转换为带上下文的纯文本
    let contentStr = '';
    
    // 【核心修改】在所有内容前，都先加上时间戳！
    contentStr += `(Timestamp: ${msg.timestamp}) `;

    if (msg.quote) {
        contentStr += `(回复 ${msg.quote.senderName}): ${msg.content}`;
    } else {
        contentStr += msg.content;
    }
    
    // 特殊消息类型的文本化处理
    if (msg.type === 'user_photo') return { role: 'user', content: `(Timestamp: ${msg.timestamp}) [你收到了一張用戶描述的照片，內容是：'${msg.content}']` };
    if (msg.type === 'voice_message') return { role: 'user', content: `(Timestamp: ${msg.timestamp}) [用戶發來一則語音訊息，內容是：'${msg.content}']` };
    if (msg.type === 'transfer') return { role: 'user', content: `(Timestamp: ${msg.timestamp}) [系統提示：你於時間戳 ${msg.timestamp} 收到了來自用戶的轉帳: ${msg.amount}元, 備註: ${msg.note}。請你決策並使用 'accept_transfer' 或 'decline_transfer' 指令回應。]` };
    if (msg.type === 'waimai_request') return { role: 'user', content: `(Timestamp: ${msg.timestamp}) [系統提示：用戶於時間戳 ${msg.timestamp} 發起了外帶代付請求，商品是“${msg.productInfo}”，金額是 ${msg.amount} 元。請你決策並使用 waimai_response 指令回應。]` };

if (Array.isArray(msg.content) && msg.content[0]?.type === 'image_url') {
    const prefix = `(Timestamp: ${msg.timestamp}) `;
    // 将文本前缀和图片内容打包成一个数组，这才是正确的格式
    return { role: 'user', content: [ { type: 'text', text: prefix }, ...msg.content ] };
}

    if (msg.meaning) return { role: 'user', content: `(Timestamp: ${msg.timestamp}) [用户發送了一个表情，意思是：'${msg.meaning}']` };
    
    // 对于普通文本和带引用的文本，统一返回
    return { role: msg.role, content: contentStr };

}).filter(Boolean);
// ▲▲▲ 替换结束 ▲▲▲

// 检查 sharedContext 是否有内容（即，用户是否分享了聊天记录）
if (sharedContext) {
    // 如果有，就把它包装成一条全新的、高优先级的用户消息，追加到历史记录的末尾
    messagesPayload.push({
        role: 'user',
        content: sharedContext 
    });
}

            if (!chat.isGroup && chat.relationship?.status === 'pending_ai_approval') {
                const contextSummaryForApproval = chat.history
                    .filter(m => !m.isHidden)
                    .slice(-10)
                    .map(msg => {
                        const sender = msg.role === 'user' ? '用户' : chat.name;
                        return `${sender}: ${String(msg.content).substring(0, 50)}...`;
                    })
                    .join('\n');

                const friendRequestInstruction = {
                    role: 'user',
                    content: `
[系统重要指令]
用戶向你發送了好友申請，理由是：「${chat.relationship.applicationReason}」。
作為參考，這是你們之前的最後一段聊天記錄：
---
${contextSummaryForApproval}
---
請你根據以上所有信息，以及你的人設，使用 friend_request_response 指令，並設定 decision 為 'accept' 或 'reject' 來決定是否通過。
`
                };
                messagesPayload.push(friendRequestInstruction);
            }            
        }           
    
const allRecentPosts = await db.qzonePosts.orderBy('timestamp').reverse().limit(5).toArray();
// 【核心修改】在这里插入过滤步骤
const visiblePosts = filterVisiblePostsForAI(allRecentPosts, chat);

if (visiblePosts.length > 0 && !chat.isGroup) {
    let postsContext = "\n\n# 最近的動態列表 (供你參考與評論):\n";
    const aiName = chat.name;
    for (const post of visiblePosts) {
                let authorName = post.authorId === 'user' ? state.qzoneSettings.nickname : (state.chats[post.authorId]?.name || '一位朋友');
                let interactionStatus = '';
                if (post.likes && post.likes.includes(aiName)) interactionStatus += " [你已按讚]";
                if (post.comments && post.comments.some(c => c.commenterName === aiName)) interactionStatus += " [你已評論]";
                if (post.authorId === chatId) authorName += " (這是你的帖子)";
                const contentSummary = (post.publicText || post.content || "圖片動態").substring(0, 30) + '...';
                postsContext += `- (ID: ${post.id}) 作者: ${authorName}, 內容: "${contentSummary}"${interactionStatus}\n`;
            }
            messagesPayload.push({ role: 'system', content: postsContext });
        }
            let  isGemini = proxyUrl === GEMINI_API_URL;
            let geminiConfig = toGeminiRequestData(model,apiKey,systemPrompt, messagesPayload,isGemini)
            const response = isGemini ? await fetch(geminiConfig.url, geminiConfig.data) :  await fetch(`${proxyUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`},
                body: JSON.stringify({
                    model: model,
                    messages: [{role: 'system', content: systemPrompt}, ...messagesPayload],
                    temperature: 0.8,
                    stream: false
                })
            });
            if (!response.ok) {
                let errorMsg = `API Error: ${response.status}`;
                try {
                    // 尝试解析错误信息体为JSON
                    const errorData = await response.json();
                    // 安全地获取错误信息，如果结构不符合预期，就将整个错误对象转为字符串
                    errorMsg += ` - ${errorData?.error?.message || JSON.stringify(errorData)}`;
                } catch (jsonError) {
                    // 如果连JSON都不是，就直接读取文本
                    errorMsg += ` - ${await response.text()}`;
                }
                // 抛出一个包含了详细信息的错误，这样就不会在catch块里再次出错了
                throw new Error(errorMsg);
            }
            const data = await response.json();
            const aiResponseContent = isGemini? data.candidates[0].content.parts[0].text : data.choices[0].message.content;
            console.log(`AI '${chat.name}' 的原始回复:`, aiResponseContent);

        chat.history = chat.history.filter(msg => !msg.isTemporary);

        const messagesArray = parseAiResponse(aiResponseContent);
        
        const isViewingThisChat = document.getElementById('chat-interface-screen').classList.contains('active') && state.activeChatId === chatId;
        
        let callHasBeenHandled = false;

        let messageTimestamp = Date.now();

        // ★★★ 核心修复 第1步: 初始化一个新数组，用于收集需要渲染的消息 ★★★
        let newMessagesToRender = []; 

       let notificationShown = false;

        for (const msgData of messagesArray) {
            if (!msgData || typeof msgData !== 'object') {
                console.warn("收到了格式不規範的AI指令，已跳過:", msgData);
                continue;
            }
             
            if (!msgData.type) {
                if (chat.isGroup && msgData.name && msgData.message) {
                    msgData.type = 'text';
                }         else if (msgData.content) {
        msgData.type = 'text';
    }
    // 如果连 content 都没有，才是真的格式不规范
    else {
        console.warn("收到了格式不規範的AI指令（缺少type和content），已跳过:", msgData);
        continue;
    }
}

            if (msgData.type === 'video_call_response') {
                videoCallState.isAwaitingResponse = false;
                if (msgData.decision === 'accept') {
                    startVideoCall();
                } else {
                    const aiMessage = { role: 'assistant', content: '對方拒絕了你的視訊通話請求。', timestamp: Date.now() };
                    chat.history.push(aiMessage);
                    await db.chats.put(chat);
                    showScreen('chat-interface-screen');
                    renderChatInterface(chatId);
                }
                callHasBeenHandled = true;
                break;
            }
            
            if (msgData.type === 'group_call_response') {
                if (msgData.decision === 'join') {
        const member = chat.members.find(m => m.originalName === msgData.name);
        if (member && !videoCallState.participants.some(p => p.id === member.id)) {
            videoCallState.participants.push(member);
        }
    }
    callHasBeenHandled = true;
    continue;
            }

            if (chat.isGroup && msgData.name && msgData.name === chat.name) {
                console.error(`AI幻覺已被攔截！試圖使用群名 ("${chat.name}") 作為角色名。消息內容:`, msgData);
                continue;
            }

// ▼▼▼ 在这里添加下面的代码 ▼▼▼

// 【核心修正】在群聊中，如果AI返回的消息没有指定發送者，则直接跳过这条消息
if (chat.isGroup && !msgData.name) {
    console.error(`AI幻覺已被攔截！試圖在群聊中發送一條沒有“name”的消息。消息內容:`, msgData);
    continue; // continue會立即結束本次循環，處理下一條消息
}

// ▲▲▲ 添加结束 ▲▲▲

            let aiMessage = null;
            const baseMessage = { role: 'assistant', senderName: msgData.name || chat.name, timestamp: messageTimestamp++ };

            switch (msgData.type) {
                case 'waimai_response':
                    const requestMessageIndex = chat.history.findIndex(m => m.timestamp === msgData.for_timestamp);
                    if (requestMessageIndex > -1) {
                        const originalMsg = chat.history[requestMessageIndex];
                        originalMsg.status = msgData.status;
                        originalMsg.paidBy = msgData.status === 'paid' ? msgData.name : null;
                    }
                    continue;

case 'qzone_post':
    const newPost = { 
        type: msgData.postType, 
        content: msgData.content || '', 
        publicText: msgData.publicText || '', 
        hiddenContent: msgData.hiddenContent || '', 
        timestamp: Date.now(), 
        authorId: chatId, 
        authorGroupId: chat.groupId, // 【核心新增】记录作者的分组ID
        visibleGroupIds: null 
    };
    await db.qzonePosts.add(newPost);
                    updateUnreadIndicator(unreadPostsCount + 1);
                    if (isViewingThisChat && document.getElementById('qzone-screen').classList.contains('active')) {
                       await renderQzonePosts();
                    }
                    continue;

                case 'qzone_comment':
                    const postToComment = await db.qzonePosts.get(parseInt(msgData.postId));
                    if (postToComment) {
                        if (!postToComment.comments) postToComment.comments = [];
                        postToComment.comments.push({ commenterName: chat.name, text: msgData.commentText, timestamp: Date.now() });
                        await db.qzonePosts.update(postToComment.id, { comments: postToComment.comments });
                        updateUnreadIndicator(unreadPostsCount + 1);
                        if (isViewingThisChat && document.getElementById('qzone-screen').classList.contains('active')) {
                           await renderQzonePosts();
                        }
                    }
                    continue;

                case 'qzone_like':
                   const postToLike = await db.qzonePosts.get(parseInt(msgData.postId));
                   if (postToLike) {
                       if (!postToLike.likes) postToLike.likes = [];
                       if (!postToLike.likes.includes(chat.name)) {
                           postToLike.likes.push(chat.name);
                           await db.qzonePosts.update(postToLike.id, { likes: postToLike.likes });
                           updateUnreadIndicator(unreadPostsCount + 1);
                           if (isViewingThisChat && document.getElementById('qzone-screen').classList.contains('active')) {
                              await renderQzonePosts();
                           }
                       }
                   }
                    continue;

                case 'video_call_request':
                    if (!videoCallState.isActive && !videoCallState.isAwaitingResponse) {
                        state.activeChatId = chatId;
                        videoCallState.activeChatId = chatId; 
                        videoCallState.isAwaitingResponse = true;
                        videoCallState.isGroupCall = chat.isGroup;
                        videoCallState.callRequester = msgData.name || chat.name;
                        showIncomingCallModal();
                    }
                    continue;

            case 'group_call_request':
                if (!videoCallState.isActive && !videoCallState.isAwaitingResponse) {
                    state.activeChatId = chatId;
                    videoCallState.isAwaitingResponse = true;
                    videoCallState.isGroupCall = true;
                    videoCallState.initiator = 'ai';
                    videoCallState.callRequester = msgData.name;
                    showIncomingCallModal();
                }
                continue;

                case 'pat_user':
                    const suffix = msgData.suffix ? ` ${msgData.suffix.trim()}` : '';
                    const patText = `${msgData.name || chat.name} 拍了拍我${suffix}`;
                    const patMessage = { 
                        role: 'system', 
                        type: 'pat_message', 
                        content: patText, 
                        timestamp: Date.now() 
                    };
                    chat.history.push(patMessage);
                    if (isViewingThisChat) {
                        const phoneScreen = document.getElementById('phone-screen');
                        phoneScreen.classList.remove('pat-animation');
                        void phoneScreen.offsetWidth;
                        phoneScreen.classList.add('pat-animation');
                        setTimeout(() => phoneScreen.classList.remove('pat-animation'), 500);
                        appendMessage(patMessage, chat);
                    } else {
                        showNotification(chatId, patText);
                    }
                    continue; 

                case 'update_status':
                    chat.status.text = msgData.status_text;
                    chat.status.isBusy = msgData.is_busy || false;
                    chat.status.lastUpdate = Date.now();
                    
                    const statusUpdateMessage = {
                        role: 'system',
                        type: 'pat_message',
                        content: `[${chat.name}的狀態已更新為: ${msgData.status_text}]`,
                        timestamp: Date.now()
                    };
                    chat.history.push(statusUpdateMessage);

                    if (isViewingThisChat) {
                        appendMessage(statusUpdateMessage, chat);
                    }
                    
                    renderChatList(); 
                    
                    continue; 

                case 'change_music':
                    if (musicState.isActive && musicState.activeChatId === chatId) {
                        const songNameToFind = msgData.song_name;
                        
                        const targetSongIndex = musicState.playlist.findIndex(
                            track => track.name.toLowerCase() === songNameToFind.toLowerCase()
                        );

                        if (targetSongIndex > -1) {
                            playSong(targetSongIndex);

                            const track = musicState.playlist[targetSongIndex];
                            const musicChangeMessage = {
                                role: 'system',
                                type: 'pat_message',
                                content: `[♪ ${chat.name} 為你切歌: 《${track.name}》 - ${track.artist}]`,
                                timestamp: Date.now()
                            };
                            chat.history.push(musicChangeMessage);

                            if (isViewingThisChat) {
                                appendMessage(musicChangeMessage, chat);
                            }
                        }
                    }
                    continue;
                case 'create_memory':
                    const newMemory = {
                        chatId: chatId,
                        authorName: chat.name,
                        description: msgData.description,
                        timestamp: Date.now(),
                        type: 'ai_generated'
                    };
                    await db.memories.add(newMemory);

                    console.log(`AI "${chat.name}" 記錄了一條新回憶:`, msgData.description);

                    continue;

        case 'create_countdown':
            const targetDate = new Date(msgData.date);
            if (!isNaN(targetDate) && targetDate > new Date()) {
                const newCountdown = {
                    chatId: chatId,
                    authorName: chat.name,
                    description: msgData.title,
                    timestamp: Date.now(),
                    type: 'countdown',
                    targetDate: targetDate.getTime()
                };
                await db.memories.add(newCountdown);
                console.log(`AI "${chat.name}" 創建了一個新約定:`, msgData.title);
            }
            continue;

    case 'block_user':
        if (!chat.isGroup) {
            chat.relationship.status = 'blocked_by_ai';

        // ▼▼▼ 在这里添加下面的代码 ▼▼▼
        const hiddenMessage = {
            role: 'system',
            content: `[系統提示：你剛剛主動封鎖了用戶。]`,
            timestamp: Date.now(),
            isHidden: true
        };
        chat.history.push(hiddenMessage);
        // ▲▲▲ 添加结束 ▲▲▲

            await db.chats.put(chat);
            
            if (isViewingThisChat) {
                renderChatInterface(chatId);
            }
            renderChatList();
            
            break; 
        }
        continue;
                case 'friend_request_response':
                    if (!chat.isGroup && chat.relationship.status === 'pending_ai_approval') {
                        if (msgData.decision === 'accept') {
                            chat.relationship.status = 'friend';
                            aiMessage = { ...baseMessage, content: "我通過了你的好友申請，我們現在是好友囉！" };
                        } else {
                            chat.relationship.status = 'blocked_by_ai';
                            aiMessage = { ...baseMessage, content: "抱歉，我拒絕了你的好友申請。" };
                        }
                        chat.relationship.applicationReason = '';
                    }
                    break;
                case 'poll':
                    const pollOptions = typeof msgData.options === 'string'
                        ? msgData.options.split('\n').filter(opt => opt.trim())
                        : (Array.isArray(msgData.options) ? msgData.options : []);
                    
                    if (pollOptions.length < 2) continue;

                    aiMessage = {
                        ...baseMessage,
                        type: 'poll',
                        question: msgData.question,
                        options: pollOptions,
                        votes: {},
                        isClosed: false,
                    };
                    break;
                
                case 'vote':
                    const pollToVote = chat.history.find(m => m.timestamp === msgData.poll_timestamp);
                    if (pollToVote && !pollToVote.isClosed) {
                        Object.keys(pollToVote.votes).forEach(option => {
                            const voterIndex = pollToVote.votes[option].indexOf(msgData.name);
                            if (voterIndex > -1) {
                                pollToVote.votes[option].splice(voterIndex, 1);
                            }
                        });
                        if (!pollToVote.votes[msgData.choice]) {
                            pollToVote.votes[msgData.choice] = [];
                        }

// ▼▼▼ 在这里添加新代码 ▼▼▼
const member = chat.members.find(m => m.originalName === msgData.name);
const displayName = member ? member.groupNickname : msgData.name;
// ▲▲▲ 添加结束 ▲▲▲

if (!pollToVote.votes[msgData.choice].includes(displayName)) { // 【核心修改】
    pollToVote.votes[msgData.choice].push(displayName); // 【核心修改】
}                     
                        
                        if (isViewingThisChat) {
                            renderChatInterface(chatId);
                        }
                    }
                    continue;

    case 'red_packet':
        aiMessage = {
            ...baseMessage,
            type: 'red_packet',
            packetType: msgData.packetType,
            totalAmount: msgData.amount,
            count: msgData.count,
            greeting: msgData.greeting,
            receiverName: msgData.receiver,
            claimedBy: {},
            isFullyClaimed: false,
        };
        break;
case 'open_red_packet':
    const packetToOpen = chat.history.find(m => m.timestamp === msgData.packet_timestamp);
    if (packetToOpen && !packetToOpen.isFullyClaimed && !(packetToOpen.claimedBy && packetToOpen.claimedBy[msgData.name])) {

        // 1. 根据AI的本名(msgData.name)去成员列表里找到完整的成员对象
        const member = chat.members.find(m => m.originalName === msgData.name);
        // 2. 获取该成员当前的群昵称，如果找不到（异常情况），则备用其本名
        const displayName = member ? member.groupNickname : msgData.name;
        
        let claimedAmountAI = 0;
        const remainingAmount = packetToOpen.totalAmount - Object.values(packetToOpen.claimedBy || {}).reduce((sum, val) => sum + val, 0);
        const remainingCount = packetToOpen.count - Object.keys(packetToOpen.claimedBy || {}).length;

        if (remainingCount > 0) {
            if (remainingCount === 1) { claimedAmountAI = remainingAmount; } 
            else {
                const min = 0.01;
                const max = remainingAmount - (remainingCount - 1) * min;
                claimedAmountAI = Math.random() * (max - min) + min;
            }
            claimedAmountAI = parseFloat(claimedAmountAI.toFixed(2));
            
            if (!packetToOpen.claimedBy) packetToOpen.claimedBy = {};
            // 【核心修改】使用我们刚刚查找到的 displayName 作为记录的key
            packetToOpen.claimedBy[displayName] = claimedAmountAI;
            
            const aiClaimedMessage = {
                role: 'system',
                type: 'pat_message',
                // 【核心修改】系统消息里也使用 displayName
                content: `${displayName} 領取了 ${packetToOpen.senderName} 的紅包`,
                timestamp: Date.now()
            };
            chat.history.push(aiClaimedMessage);

            let hiddenContentForAI = `[系统提示：你 (${displayName}) 成功搶到了 ${claimedAmountAI.toFixed(2)} 元。`; // 【核心修改】

            if (Object.keys(packetToOpen.claimedBy).length >= packetToOpen.count) {
                packetToOpen.isFullyClaimed = true;
                
                const finishedMessage = {
                    role: 'system',
                    type: 'pat_message',
                    content: `${packetToOpen.senderName} 的紅包已領完`,
                    timestamp: Date.now() + 1
                };
                chat.history.push(finishedMessage);
                
                let luckyKing = { name: '', amount: -1 };
                if (packetToOpen.packetType === 'lucky' && packetToOpen.count > 1) {
                    Object.entries(packetToOpen.claimedBy).forEach(([name, amount]) => {
                        if (amount > luckyKing.amount) {
                            luckyKing = { name, amount };
                        }
                    });
                }
                if (luckyKing.name) {
                     hiddenContentForAI += ` 紅包已領完，手氣王是 ${luckyKing.name}！`;
                } else {
                     hiddenContentForAI += ` 紅包已被領完。`;
                }
            }
            hiddenContentForAI += ' 請根據這個結果發表你的評論。]';

            const hiddenMessageForAI = {
                role: 'system',
                content: hiddenContentForAI,
                timestamp: Date.now() + 2,
                isHidden: true
            };
            chat.history.push(hiddenMessageForAI);
        }
        
        if (isViewingThisChat) {
            renderChatInterface(chatId);
        }
    }
    continue;
case 'change_avatar':
    const avatarName = msgData.name;
    // 在该角色的头像库中查找
    const foundAvatar = chat.settings.aiAvatarLibrary.find(avatar => avatar.name === avatarName);
    
    if (foundAvatar) {
        // 找到了，就更新头像
        chat.settings.aiAvatar = foundAvatar.url;
        
        // 创建一条系统提示，告知用户头像已更换
        const systemNotice = {
            role: 'system',
            type: 'pat_message', // 复用居中样式
            content: `[${chat.name} 更換了頭像]`,
            timestamp: Date.now()
        };
        chat.history.push(systemNotice);
        
        // 如果在当前聊天界面，则实时渲染
        if (isViewingThisChat) {
            appendMessage(systemNotice, chat);
            // 立刻刷新聊天界面以显示新头像
            renderChatInterface(chatId);
        }
    }
    // 处理完后，继续处理AI可能返回的其他消息
    continue;

// ▼▼▼ 在 triggerAiResponse 的 switch 语句中，【添加】这两个全新的 case ▼▼▼

                case 'accept_transfer': { // 使用大括号创建块级作用域
                    const originalTransferMsgIndex = chat.history.findIndex(m => m.timestamp === msgData.for_timestamp);
                    if (originalTransferMsgIndex > -1) {
                        const originalMsg = chat.history[originalTransferMsgIndex];
                        originalMsg.status = 'accepted';
                    }
                    continue; // 接受指令只修改状态，不产生新消息
                }

                case 'decline_transfer': { // 使用大括号创建块级作用域
                    const originalTransferMsgIndex = chat.history.findIndex(m => m.timestamp === msgData.for_timestamp);
                    if (originalTransferMsgIndex > -1) {
                        const originalMsg = chat.history[originalTransferMsgIndex];
                        originalMsg.status = 'declined';
                        
                        // 【核心】创建一条新的“退款”消息
                        const refundMessage = {
                            role: 'assistant',
                            senderName: chat.name,
                            type: 'transfer',
                            isRefund: true, // 标记这是一条退款消息
                            amount: originalMsg.amount,
                            note: '轉帳已被拒收',
                            timestamp: messageTimestamp++ // 使用递增的时间戳
                        };
                        
                        // 将新消息推入历史记录，它会被后续的循环处理并渲染
                        chat.history.push(refundMessage);

        // ▼▼▼ 在这里添加下面的代码 ▼▼▼
        if (isViewingThisChat) {
            // 因为退款消息是新生成的，所以我们直接将它添加到界面上
            appendMessage(refundMessage, chat); 
            // 同时，原始的转账消息状态变了，所以要重绘整个界面以更新它
            renderChatInterface(chatId); 
        }
        // ▲▲▲ 添加结束 ▲▲▲

                    }
                    continue; // 继续处理AI返回的文本消息
                }

// ▲▲▲ 添加结束 ▲▲▲

    case 'system_message':
        aiMessage = { role: 'system', type: 'pat_message', content: msgData.content, timestamp: Date.now() };
        break;

// ▼▼▼ 在 triggerAiResponse 的 switch 语句中，【必须添加】这个新的 case ▼▼▼

                case 'share_link':
                    aiMessage = { 
                        ...baseMessage, 
                        type: 'share_link',
                        title: msgData.title,
                        description: msgData.description,
                        // thumbnail_url: msgData.thumbnail_url, // 我们已经决定不要图片了，所以这行可以不要
                        source_name: msgData.source_name,
                        content: msgData.content // 这是文章正文，点击卡片后显示的内容
                    };
                    break;

// ▲▲▲ 添加结束 ▲▲▲

// ▼▼▼ 在 triggerAiResponse 的 switch (msgData.type) 语句中，添加这个新的 case ▼▼▼
case 'quote_reply':
    const originalMessage = chat.history.find(m => m.timestamp === msgData.target_timestamp);
    if (originalMessage) {
        const quoteContext = {
            timestamp: originalMessage.timestamp,
            senderName: originalMessage.senderName || (originalMessage.role === 'user' ? (chat.settings.myNickname || '我') : chat.name),
            content: String(originalMessage.content || '').substring(0, 50),
        };
        aiMessage = { 
            ...baseMessage, 
            content: msgData.reply_content,
            quote: quoteContext // 核心：在这里附加引用对象
        };
    } else {
        // 如果找不到被引用的消息，就当作普通消息發送
        aiMessage = { ...baseMessage, content: msgData.reply_content };
    }
    break;
// ▲▲▲ 新增 case 结束 ▲▲▲

// ▼▼▼ 在 switch (msgData.type) 语句中，添加这个全新的 case ▼▼▼
case 'send_and_recall': {
    // 这是一个纯动画指令，我们需要手动“演”出整个过程
    if (!isViewingThisChat) continue; // 如果不在当前聊天界面，就直接跳过这个动画

    // 1. 创建一个临时的、看起来像真消息的气泡
    const tempMessageData = { ...baseMessage, content: msgData.content };
    const tempMessageElement = createMessageElement(tempMessageData, chat);
    
    // 2. 把它添加到聊天界面上，让用户看到
    appendMessage(tempMessageData, chat, true); // true表示这是初始加载，不会触发进入动画
    
    // 3. 等待片刻，模拟AI的“反应时间”
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1500)); // 随机等待1.5-2.5秒

    // 4. 找到刚刚添加的临时气泡，并播放撤回动画
    const bubbleWrapper = document.querySelector(`.message-bubble[data-timestamp="${tempMessageData.timestamp}"]`)?.closest('.message-wrapper');
    if (bubbleWrapper) {
        bubbleWrapper.classList.add('recalled-animation');

        // 5. 在动画播放结束后，将其替换为真正的“已撤回”提示
        await new Promise(resolve => setTimeout(resolve, 300)); // 等待动画播完

        // 6. 最后，才把这条“已撤回”记录真正地存入数据库
        const recalledMessage = {
            role: 'assistant',
            senderName: msgData.name || chat.name,
            type: 'recalled_message',
            content: '對方撤回了一條消息',
            timestamp: tempMessageData.timestamp, // 使用临时消息的时间戳，保证顺序
            recalledData: { originalType: 'text', originalContent: msgData.content }
        };
        
        // 更新数据模型
        const msgIndex = chat.history.findIndex(m => m.timestamp === tempMessageData.timestamp);
        if (msgIndex > -1) {
            chat.history[msgIndex] = recalledMessage;
        } else {
            chat.history.push(recalledMessage);
        }
        
        // 替换DOM
        const placeholder = createMessageElement(recalledMessage, chat);
        if(document.body.contains(bubbleWrapper)) {
            bubbleWrapper.parentNode.replaceChild(placeholder, bubbleWrapper);
        }
    }
    
    continue; // 处理完这个动画后，继续处理AI返回的下一条指令
}
// ▲▲▲ 新 case 添加结束 ▲▲▲
                
                case 'text':
                    aiMessage = { ...baseMessage, content: String(msgData.content || msgData.message) };
                    break;
                case 'sticker':
                    aiMessage = { ...baseMessage, type: 'sticker', content: msgData.url, meaning: msgData.meaning || '' };
                    break;
                case 'ai_image':
                    aiMessage = { ...baseMessage, type: 'ai_image', content: msgData.description };
                    break;
                case 'voice_message':
                    aiMessage = { ...baseMessage, type: 'voice_message', content: msgData.content };
                    break;
                case 'transfer':
                    aiMessage = { ...baseMessage, type: 'transfer', amount: msgData.amount, note: msgData.note, receiverName: msgData.receiver || '我' };
                    break;
                
                case 'waimai_request':
                    aiMessage = { 
                        ...baseMessage, 
                        type: 'waimai_request',
                        productInfo: msgData.productInfo,
                        amount: msgData.amount,
                        status: 'pending',
                        countdownEndTime: Date.now() + 15 * 60 * 1000,
                    };
                    break;
                
                default:
                     console.warn("收到了未知的AI指令類型:", msgData.type);
                     break;
            }

            // 【核心修复】将渲染逻辑移出循环
            if (aiMessage) {
                // 1. 将新消息存入历史记录
                chat.history.push(aiMessage);

                if (!isViewingThisChat && !notificationShown) {
                    let notificationText;
                    switch (aiMessage.type) {
                        case 'transfer':
                            notificationText = `[收到一筆轉帳]`;
                            break;
                        case 'waimai_request':
                            notificationText = `[收到一個外賣代付請求]`;
                            break;
                        case 'ai_image':
                            notificationText = `[圖片]`;
                            break;
                        case 'voice_message':
                            notificationText = `[語音]`;
                            break;
                        case 'sticker':
                            notificationText = aiMessage.meaning ? `[表情: ${aiMessage.meaning}]` : '[表情]';
                            break;
                        default:
                            notificationText = String(aiMessage.content || '');
                    }
                    const finalNotifText = chat.isGroup ? `${aiMessage.senderName}: ${notificationText}` : notificationText;
                    showNotification(chatId, finalNotifText.substring(0, 40) + (finalNotifText.length > 40 ? '...' : ''));
                    notificationShown = true; // 确保只通知一次
                }

    if (!isViewingThisChat) {
        // 如果用户不在当前聊天界面，就把这个聊天的未读数 +1
        chat.unreadCount = (chat.unreadCount || 0) + 1;
    }
                
                // 2. 只有在当前聊天界面时，才执行带动画的添加
                if (isViewingThisChat) {
                    appendMessage(aiMessage, chat);
                    // 3. 【关键】在这里暂停一小会儿，给动画播放的时间
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 1800 + 1000));
                }
            }
  }        

        if (callHasBeenHandled && videoCallState.isGroupCall) {
            videoCallState.isAwaitingResponse = false;
            if (videoCallState.participants.length > 0) {
                startVideoCall();
            } else {
                videoCallState = { ...videoCallState, isAwaitingResponse: false, participants: [] };
                showScreen('chat-interface-screen');
                alert('無人接聽群聊天邀請。 ');
            }
        }
        
        await db.chats.put(chat);

    } catch (error) {
        chat.history = chat.history.filter(msg => !msg.isTemporary);
        if (!chat.isGroup && chat.relationship?.status === 'pending_ai_approval') {
            chat.relationship.status = 'blocked_by_ai';
            await showCustomAlert('申請失敗', `AI在處理你的好友申請時出錯了，請稍後重試。 \n錯誤訊息: ${error.message}`);
        } else {
            const errorContent = `[出錯了: ${error.message}]`;
            const errorMessage = { role: 'assistant', content: errorContent, timestamp: Date.now() };
            if(chat.isGroup) errorMessage.senderName = "系統消息";
            chat.history.push(errorMessage);
        }
        
        await db.chats.put(chat);        
        videoCallState.isAwaitingResponse = false;

        if(document.getElementById('chat-interface-screen').classList.contains('active') && state.activeChatId === chatId) {
            renderChatInterface(chatId);
        }
    } finally {
        // ★★★★★【核心修改4：在 finally 块中统一隐藏所有类型的提示】★★★★★
        if (chat.isGroup) {
            if (typingIndicator) {
                typingIndicator.style.display = 'none';
            }
        } else {
            if (chatHeaderTitle && state.chats[chatId]) {
                chatHeaderTitle.style.opacity = 0;
                setTimeout(() => {
                    chatHeaderTitle.textContent = state.chats[chatId].name;
                    chatHeaderTitle.classList.remove('typing-status');
                    chatHeaderTitle.style.opacity = 1;
                }, 200);
            }
        }
        renderChatList();
    }
}

        async function sendSticker(sticker) { if (!state.activeChatId) return; const chat = state.chats[state.activeChatId]; const msg = { role: 'user', content: sticker.url, meaning: sticker.name, timestamp: Date.now() }; chat.history.push(msg); await db.chats.put(chat); appendMessage(msg, chat); renderChatList(); document.getElementById('sticker-panel').classList.remove('visible'); }

        async function sendUserTransfer() { if (!state.activeChatId) return; const amountInput = document.getElementById('transfer-amount'); const noteInput = document.getElementById('transfer-note'); const amount = parseFloat(amountInput.value); const note = noteInput.value.trim(); if (isNaN(amount) || amount < 0 || amount > 9999) { alert('请输入有效的金额 (0 到 9999 之间)！'); return; } const chat = state.chats[state.activeChatId]; const senderName = chat.isGroup ? (chat.settings.myNickname || '我') : '我'; const receiverName = chat.isGroup ? '群聊' : chat.name; const msg = { role: 'user', type: 'transfer', amount: amount, note: note, senderName, receiverName, timestamp: Date.now() }; chat.history.push(msg); await db.chats.put(chat); appendMessage(msg, chat); renderChatList(); document.getElementById('transfer-modal').classList.remove('visible'); amountInput.value = ''; noteInput.value = ''; }

        function enterSelectionMode(initialMsgTimestamp) { if (isSelectionMode) return; isSelectionMode = true; document.getElementById('chat-interface-screen').classList.add('selection-mode'); toggleMessageSelection(initialMsgTimestamp); }

        function exitSelectionMode() {
    cleanupWaimaiTimers(); // <--- 在这里添加这行代码
 if (!isSelectionMode) return; isSelectionMode = false; document.getElementById('chat-interface-screen').classList.remove('selection-mode'); selectedMessages.forEach(ts => { const bubble = document.querySelector(`.message-bubble[data-timestamp="${ts}"]`); if (bubble) bubble.classList.remove('selected'); }); selectedMessages.clear(); }

// ▼▼▼ 请用这个【最终简化版】替换旧的 toggleMessageSelection 函数 ▼▼▼
function toggleMessageSelection(timestamp) {
    // 【核心修正】选择器已简化，不再寻找已删除的 .recalled-message-placeholder
    const elementToSelect = document.querySelector(
        `.message-bubble[data-timestamp="${timestamp}"]`
    );

    if (!elementToSelect) return;

    if (selectedMessages.has(timestamp)) {
        selectedMessages.delete(timestamp);
        elementToSelect.classList.remove('selected');
    } else {
        selectedMessages.add(timestamp);
        elementToSelect.classList.add('selected');
    }

    document.getElementById('selection-count').textContent = `已選 ${selectedMessages.size} 條`;

    if (selectedMessages.size === 0) {
        exitSelectionMode();
    }
}
// ▲▲▲ 替换结束 ▲▲▲

        function addLongPressListener(element, callback) { let pressTimer; const startPress = (e) => { if(isSelectionMode) return; e.preventDefault(); pressTimer = window.setTimeout(() => callback(e), 500); }; const cancelPress = () => clearTimeout(pressTimer); element.addEventListener('mousedown', startPress); element.addEventListener('mouseup', cancelPress); element.addEventListener('mouseleave', cancelPress); element.addEventListener('touchstart', startPress, { passive: true }); element.addEventListener('touchend', cancelPress); element.addEventListener('touchmove', cancelPress); }

        async function handleListenTogetherClick() { const targetChatId = state.activeChatId; if (!targetChatId) return; if (!musicState.isActive) { startListenTogetherSession(targetChatId); return; } if (musicState.activeChatId === targetChatId) { document.getElementById('music-player-overlay').classList.add('visible'); } else { const oldChatName = state.chats[musicState.activeChatId]?.name || '未知'; const newChatName = state.chats[targetChatId]?.name || '当前'; const confirmed = await showCustomConfirm('切换听歌对象', `您正和「${oldChatName}」听歌。要结束并开始和「${newChatName}」的新会话吗？`, { confirmButtonClass: 'btn-danger' }); if (confirmed) { await endListenTogetherSession(true); await new Promise(resolve => setTimeout(resolve, 50)); startListenTogetherSession(targetChatId); } } }

        async function startListenTogetherSession(chatId) { const chat = state.chats[chatId]; if (!chat) return; musicState.totalElapsedTime = chat.musicData.totalTime || 0; musicState.isActive = true; musicState.activeChatId = chatId; if (musicState.playlist.length > 0) { musicState.currentIndex = 0; } else { musicState.currentIndex = -1; } if(musicState.timerId) clearInterval(musicState.timerId); musicState.timerId = setInterval(() => { if (musicState.isPlaying) { musicState.totalElapsedTime++; updateElapsedTimeDisplay(); } }, 1000); updatePlayerUI(); updatePlaylistUI(); document.getElementById('music-player-overlay').classList.add('visible'); }

async function endListenTogetherSession(saveState = true) {
    if (!musicState.isActive) return;
    const oldChatId = musicState.activeChatId;
    const cleanupLogic = async () => {
        if (musicState.timerId) clearInterval(musicState.timerId);
        if (musicState.isPlaying) audioPlayer.pause();
        if (saveState && oldChatId && state.chats[oldChatId]) {
            const chat = state.chats[oldChatId];
            chat.musicData.totalTime = musicState.totalElapsedTime;
            await db.chats.put(chat);
        }
        musicState.isActive = false;
        musicState.activeChatId = null;
        musicState.totalElapsedTime = 0;
        musicState.timerId = null;
        updateListenTogetherIcon(oldChatId, true);
    };
    closeMusicPlayerWithAnimation(cleanupLogic);
}

function returnToChat() {
    closeMusicPlayerWithAnimation();
}

        function updateListenTogetherIcon(chatId, forceReset = false) { const iconImg = document.querySelector('#listen-together-btn img'); if(!iconImg) return; if(forceReset || !musicState.isActive || musicState.activeChatId !== chatId) { iconImg.src = 'https://i.postimg.cc/8kYShvrJ/90-UI-2.png'; iconImg.className = ''; return; } iconImg.src = 'https://i.postimg.cc/D0pq6qS2/E30078-DC-8-B99-4-C01-AFDA-74728-DBF7-BEA.png'; iconImg.classList.add('rotating'); if (musicState.isPlaying) iconImg.classList.remove('paused'); else iconImg.classList.add('paused'); }
        window.updateListenTogetherIconProxy = updateListenTogetherIcon;

        function updatePlayerUI() { updateListenTogetherIcon(musicState.activeChatId); updateElapsedTimeDisplay(); const titleEl = document.getElementById('music-player-song-title'); const artistEl = document.getElementById('music-player-artist'); const playPauseBtn = document.getElementById('music-play-pause-btn'); if (musicState.currentIndex > -1 && musicState.playlist.length > 0) { const track = musicState.playlist[musicState.currentIndex]; titleEl.textContent = track.name; artistEl.textContent = track.artist; } else { titleEl.textContent = '请添加歌曲'; artistEl.textContent = '...'; } playPauseBtn.textContent = musicState.isPlaying ? '❚❚' : '▶'; }

        function updateElapsedTimeDisplay() { const hours = (musicState.totalElapsedTime / 3600).toFixed(1); document.getElementById('music-time-counter').textContent = `已经一起听了${hours}小时`; }

function updatePlaylistUI() {
    const playlistBody = document.getElementById('playlist-body');
    playlistBody.innerHTML = '';
    if (musicState.playlist.length === 0) {
        playlistBody.innerHTML = '<p style="text-align:center; padding: 20px; color: #888;">播放列表是空的~</p>';
        return;
    }
    musicState.playlist.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if(index === musicState.currentIndex) item.classList.add('playing');
        item.innerHTML = `
            <div class="playlist-item-info">
                <div class="title">${track.name}</div>
                <div class="artist">${track.artist}</div>
            </div>
            <div class="playlist-item-actions">
                <span class="playlist-action-btn lyrics-btn" data-index="${index}">詞</span>
                <span class="playlist-action-btn delete-track-btn" data-index="${index}">×</span>
            </div>
        `;
        item.querySelector('.playlist-item-info').addEventListener('click', () => playSong(index));
        playlistBody.appendChild(item);
    });
}

function playSong(index) {
    if (index < 0 || index >= musicState.playlist.length) return;
    musicState.currentIndex = index;
    const track = musicState.playlist[index];
    musicState.parsedLyrics = parseLRC(track.lrcContent || "");
    musicState.currentLyricIndex = -1;
    renderLyrics();
    if (track.isLocal && track.src instanceof Blob) {
        audioPlayer.src = URL.createObjectURL(track.src);
    } else if (!track.isLocal) {
        audioPlayer.src = track.src;
    } else {
        console.error('本地歌曲來源錯誤:', track);
        return;
    }
    audioPlayer.play();
    updatePlaylistUI();
    updatePlayerUI();
    updateMusicProgressBar();
}

        function togglePlayPause() { if (audioPlayer.paused) { if (musicState.currentIndex === -1 && musicState.playlist.length > 0) { playSong(0); } else if (musicState.currentIndex > -1) { audioPlayer.play(); } } else { audioPlayer.pause(); } }

        function playNext() { if (musicState.playlist.length === 0) return; let nextIndex; switch(musicState.playMode) { case 'random': nextIndex = Math.floor(Math.random() * musicState.playlist.length); break; case 'single': playSong(musicState.currentIndex); return; case 'order': default: nextIndex = (musicState.currentIndex + 1) % musicState.playlist.length; break; } playSong(nextIndex); }

        function playPrev() { if (musicState.playlist.length === 0) return; const newIndex = (musicState.currentIndex - 1 + musicState.playlist.length) % musicState.playlist.length; playSong(newIndex); }

        function changePlayMode() { const modes = ['order', 'random', 'single']; const currentModeIndex = modes.indexOf(musicState.playMode); musicState.playMode = modes[(currentModeIndex + 1) % modes.length]; document.getElementById('music-mode-btn').textContent = {'order': '顺序', 'random': '随机', 'single': '单曲'}[musicState.playMode]; }

        async function addSongFromURL() { const url = await showCustomPrompt("新增網路歌曲", "請輸入歌曲的URL", "", "url"); if (!url) return; const name = await showCustomPrompt("歌曲信息", "请输入歌名"); if (!name) return; const artist = await showCustomPrompt("歌曲信息", "请输入歌手名"); if (!artist) return; musicState.playlist.push({ name, artist, src: url, isLocal: false }); await saveGlobalPlaylist(); updatePlaylistUI(); if(musicState.currentIndex === -1) { musicState.currentIndex = musicState.playlist.length - 1; updatePlayerUI(); } }

async function addSongFromLocal(event) {
    const files = event.target.files;
    if (!files.length) return;

    for (const file of files) {
        let name = file.name.replace(/\.[^/.]+$/, "");
        name = await showCustomPrompt("歌曲信息", "請輸入歌名", name);
        if (name === null) continue;

        const artist = await showCustomPrompt("歌曲信息", "請輸入歌手名", "未知歌手");
        if (artist === null) continue;

        let lrcContent = "";
        const wantLrc = await showCustomConfirm("導入歌詞", `要為《${name}》導入歌詞文件 (.lrc) 嗎？`);
        if (wantLrc) {
            lrcContent = await new Promise(resolve => {
                const lrcInput = document.getElementById('lrc-upload-input');
                const lrcChangeHandler = (e) => {
                    const lrcFile = e.target.files[0];
                    if (lrcFile) {
                        const reader = new FileReader();
                        reader.onload = (readEvent) => resolve(readEvent.target.result);
                        reader.onerror = () => resolve("");
                        reader.readAsText(lrcFile);
                    } else {
                        resolve("");
                    }
                    lrcInput.removeEventListener('change', lrcChangeHandler);
                    lrcInput.value = '';
                };
                lrcInput.addEventListener('change', lrcChangeHandler);
                lrcInput.click();
            });
        }
        
        musicState.playlist.push({ 
            name, 
            artist, 
            src: file, 
            isLocal: true,
            lrcContent: lrcContent
        });
    }
    
    await saveGlobalPlaylist();
    updatePlaylistUI();
    if (musicState.currentIndex === -1 && musicState.playlist.length > 0) {
        musicState.currentIndex = 0;
        updatePlayerUI();
    }
    event.target.value = null;
}

        async function deleteTrack(index) { if (index < 0 || index >= musicState.playlist.length) return; const track = musicState.playlist[index]; const wasPlaying = musicState.isPlaying && musicState.currentIndex === index; if (track.isLocal && audioPlayer.src.startsWith('blob:') && musicState.currentIndex === index) URL.revokeObjectURL(audioPlayer.src); musicState.playlist.splice(index, 1); await saveGlobalPlaylist(); if (musicState.playlist.length === 0) { if (musicState.isPlaying) audioPlayer.pause(); audioPlayer.src = ''; musicState.currentIndex = -1; musicState.isPlaying = false; } else { if (wasPlaying) { playNext(); } else { if (musicState.currentIndex >= index) musicState.currentIndex = Math.max(0, musicState.currentIndex - 1); } } updatePlayerUI(); updatePlaylistUI(); }

        const personaLibraryModal = document.getElementById('persona-library-modal');
        const personaEditorModal = document.getElementById('persona-editor-modal');
        const presetActionsModal = document.getElementById('preset-actions-modal');

        function openPersonaLibrary() { renderPersonaLibrary(); personaLibraryModal.classList.add('visible'); }

        function closePersonaLibrary() { personaLibraryModal.classList.remove('visible'); }

        function renderPersonaLibrary() { const grid = document.getElementById('persona-library-grid'); grid.innerHTML = ''; if (state.personaPresets.length === 0) { grid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center; margin-top: 20px;">空空如也~ 點擊右上角"添加"來創建你的第一個人設預設吧！</p>'; return; } state.personaPresets.forEach(preset => { const item = document.createElement('div'); item.className = 'persona-preset-item'; item.style.backgroundImage = `url(${preset.avatar})`; item.dataset.presetId = preset.id; item.addEventListener('click', () => applyPersonaPreset(preset.id)); addLongPressListener(item, () => showPresetActions(preset.id)); grid.appendChild(item); }); }

        function showPresetActions(presetId) { editingPersonaPresetId = presetId; presetActionsModal.classList.add('visible'); }

        function hidePresetActions() { presetActionsModal.classList.remove('visible'); editingPersonaPresetId = null; }

        function applyPersonaPreset(presetId) { const preset = state.personaPresets.find(p => p.id === presetId); if (preset) { document.getElementById('my-avatar-preview').src = preset.avatar; document.getElementById('my-persona').value = preset.persona; } closePersonaLibrary(); }

        function openPersonaEditorForCreate() { editingPersonaPresetId = null; document.getElementById('persona-editor-title').textContent = '新增人設預設'; document.getElementById('preset-avatar-preview').src = defaultAvatar; document.getElementById('preset-persona-input').value = ''; personaEditorModal.classList.add('visible'); }

        function openPersonaEditorForEdit() { const preset = state.personaPresets.find(p => p.id === editingPersonaPresetId); if (!preset) return; document.getElementById('persona-editor-title').textContent = '編輯人設預設'; document.getElementById('preset-avatar-preview').src = preset.avatar; document.getElementById('preset-persona-input').value = preset.persona; presetActionsModal.classList.remove('visible'); personaEditorModal.classList.add('visible'); }

        async function deletePersonaPreset() { const confirmed = await showCustomConfirm('刪除預設', '確定要刪除這個人設預設嗎？此操作不可恢復。', { confirmButtonClass: 'btn-danger' }); if (confirmed && editingPersonaPresetId) { await db.personaPresets.delete(editingPersonaPresetId); state.personaPresets = state.personaPresets.filter(p => p.id !== editingPersonaPresetId); hidePresetActions(); renderPersonaLibrary(); } }

        function closePersonaEditor() { personaEditorModal.classList.remove('visible'); editingPersonaPresetId = null; }

        async function savePersonaPreset() { const avatar = document.getElementById('preset-avatar-preview').src; const persona = document.getElementById('preset-persona-input').value.trim(); if (avatar === defaultAvatar && !persona) { alert("頭像和人設不能都為空哦！"); return; } if (editingPersonaPresetId) { const preset = state.personaPresets.find(p => p.id === editingPersonaPresetId); if (preset) { preset.avatar = avatar; preset.persona = persona; await db.personaPresets.put(preset); } } else { const newPreset = { id: 'preset_' + Date.now(), avatar: avatar, persona: persona }; await db.personaPresets.add(newPreset); state.personaPresets.push(newPreset); } renderPersonaLibrary(); closePersonaEditor(); }

        const batteryAlertModal = document.getElementById('battery-alert-modal');

        function showBatteryAlert(imageUrl, text) { clearTimeout(batteryAlertTimeout); document.getElementById('battery-alert-image').src = imageUrl; document.getElementById('battery-alert-text').textContent = text; batteryAlertModal.classList.add('visible'); const closeAlert = () => { batteryAlertModal.classList.remove('visible'); batteryAlertModal.removeEventListener('click', closeAlert); }; batteryAlertModal.addEventListener('click', closeAlert); batteryAlertTimeout = setTimeout(closeAlert, 2000); }

        async function renderAlbumList() {
            const albumGrid = document.getElementById('album-grid-page');
            if (!albumGrid) return;
            const albums = await db.qzoneAlbums.orderBy('createdAt').reverse().toArray();
            albumGrid.innerHTML = '';
            if (albums.length === 0) {
                albumGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); margin-top: 50px;">你还没有创建任何相册哦~</p>';
                return;
            }
            albums.forEach(album => {
                const albumItem = document.createElement('div');
                albumItem.className = 'album-item';
                albumItem.innerHTML = `
                    <div class="album-cover" style="background-image: url(${album.coverUrl});"></div>
                    <div class="album-info">
                        <p class="album-name">${album.name}</p>
                        <p class="album-count">${album.photoCount || 0} 張</p>
                    </div>
                `;
                albumItem.addEventListener('click', () => {
                    openAlbum(album.id);
                });

                // ▼▼▼ 新增的核心代码就是这里 ▼▼▼
                addLongPressListener(albumItem, async () => {
                    const confirmed = await showCustomConfirm(
                        '刪除相冊',
                        `確定要刪除相冊《${album.name}》嗎？此操作將同時刪除相冊內的所有照片，且無法恢復。`,
                        { confirmButtonClass: 'btn-danger' }
                    );

                    if (confirmed) {
                        // 1. 从照片表中删除该相册下的所有照片
                        await db.qzonePhotos.where('albumId').equals(album.id).delete();
                        
                        // 2. 从相册表中删除该相册本身
                        await db.qzoneAlbums.delete(album.id);
                        
                        // 3. 重新渲染相册列表
                        await renderAlbumList();
                        
                        alert('相冊已成功刪除。');
                    }
                });
                // ▲▲▲ 新增代码结束 ▲▲▲

                albumGrid.appendChild(albumItem);
            });
        }

        async function openAlbum(albumId) {
            state.activeAlbumId = albumId;
            await renderAlbumPhotosScreen();
            showScreen('album-photos-screen');
        }

        async function renderAlbumPhotosScreen() {
            if (!state.activeAlbumId) return;
            const photosGrid = document.getElementById('photos-grid-page');
            const headerTitle = document.getElementById('album-photos-title');
            const album = await db.qzoneAlbums.get(state.activeAlbumId);
            if (!album) {
                console.error("找不到相冊:", state.activeAlbumId);
                showScreen('album-screen');
                return;
            }
            headerTitle.textContent = album.name;
            const photos = await db.qzonePhotos.where('albumId').equals(state.activeAlbumId).toArray();
            photosGrid.innerHTML = '';
            if (photos.length === 0) {
                photosGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); margin-top: 50px;">这个相册还是空的，快上传第一张照片吧！</p>';
            } else {
                photos.forEach(photo => {
                    const photoItem = document.createElement('div');
                    photoItem.className = 'photo-item';
                    photoItem.innerHTML = `
                        <img src="${photo.url}" class="photo-thumb" alt="相冊照片">
                        <button class="photo-delete-btn" data-photo-id="${photo.id}">×</button>
                    `;
                    photosGrid.appendChild(photoItem);
                });
            }
        }

// --- ↓↓↓ 从这里开始复制 ↓↓↓ ---

/**
 * 打开图片查看器
 * @param {string} clickedPhotoUrl - 用户点击的那张照片的URL
 */
async function openPhotoViewer(clickedPhotoUrl) {
    if (!state.activeAlbumId) return;

    // 1. 从数据库获取当前相册的所有照片
    const photosInAlbum = await db.qzonePhotos.where('albumId').equals(state.activeAlbumId).toArray();
    photoViewerState.photos = photosInAlbum.map(p => p.url);

    // 2. 找到被点击照片的索引
    photoViewerState.currentIndex = photoViewerState.photos.findIndex(url => url === clickedPhotoUrl);
    if (photoViewerState.currentIndex === -1) return; // 如果找不到，则不打开

    // 3. 显示模态框并渲染第一张图
    document.getElementById('photo-viewer-modal').classList.add('visible');
    renderPhotoViewer();
    photoViewerState.isOpen = true;
}

/**
 * 根据当前状态渲染查看器内容（图片和按钮）
 */
function renderPhotoViewer() {
    if (photoViewerState.currentIndex === -1) return;

    const imageEl = document.getElementById('photo-viewer-image');
    const prevBtn = document.getElementById('photo-viewer-prev-btn');
    const nextBtn = document.getElementById('photo-viewer-next-btn');
    
    // 淡出效果
    imageEl.style.opacity = 0;

    setTimeout(() => {
        // 更新图片源
        imageEl.src = photoViewerState.photos[photoViewerState.currentIndex];
        // 淡入效果
        imageEl.style.opacity = 1;
    }, 100); // 延迟一点点时间来触发CSS过渡

    // 更新按钮状态：如果是第一张，禁用“上一张”按钮
    prevBtn.disabled = photoViewerState.currentIndex === 0;
    // 如果是最后一张，禁用“下一张”按钮
    nextBtn.disabled = photoViewerState.currentIndex === photoViewerState.photos.length - 1;
}

/**
 * 显示下一张照片
 */
function showNextPhoto() {
    if (photoViewerState.currentIndex < photoViewerState.photos.length - 1) {
        photoViewerState.currentIndex++;
        renderPhotoViewer();
    }
}

/**
 * 显示上一张照片
 */
function showPrevPhoto() {
    if (photoViewerState.currentIndex > 0) {
        photoViewerState.currentIndex--;
        renderPhotoViewer();
    }
}

/**
 * 关闭图片查看器
 */
function closePhotoViewer() {
    document.getElementById('photo-viewer-modal').classList.remove('visible');
    photoViewerState.isOpen = false;
    photoViewerState.photos = [];
    photoViewerState.currentIndex = -1;
    // 清空图片，避免下次打开时闪现旧图
    document.getElementById('photo-viewer-image').src = '';
}

// --- ↑↑↑ 复制到这里结束 ↑↑↑ ---
        // ▼▼▼ 请将这个新函数粘贴到你的JS功能函数定义区 ▼▼▼
        
        /**
         * 更新动态小红点的显示
         * @param {number} count - 未读动态的数量
         */
        function updateUnreadIndicator(count) {
            unreadPostsCount = count;
            localStorage.setItem('unreadPostsCount', count); // 持久化存储

            // --- 更新底部导航栏的“动态”按钮 ---
            const navItem = document.querySelector('.nav-item[data-view="qzone-screen"]');
            
            const targetSpan = navItem.querySelector('span'); // 定位到文字 "动态"
            let indicator = navItem.querySelector('.unread-indicator');           

            if (count > 0) {
                if (!indicator) {
                    indicator = document.createElement('span');
                    indicator.className = 'unread-indicator';
                                                           targetSpan.style.position = 'relative'; // 把相对定位加在 span 上
                    targetSpan.appendChild(indicator); // 把小红点作为 span 的子元素
                    
                }
                indicator.textContent = count > 99 ? '99+' : count;
                indicator.style.display = 'block';
            } else {
                if (indicator) {
                    indicator.style.display = 'none';
                }
            }

            // --- 更新聊天界面返回列表的按钮 ---
            const backBtn = document.getElementById('back-to-list-btn');
            let backBtnIndicator = backBtn.querySelector('.unread-indicator');

            if (count > 0) {
                if (!backBtnIndicator) {
                    backBtnIndicator = document.createElement('span');
                    backBtnIndicator.className = 'unread-indicator back-btn-indicator';
                    backBtn.style.position = 'relative'; // 确保能正確定位
                    backBtn.appendChild(backBtnIndicator);
                }
                // 返回键上的小红点通常不显示数字，只显示一个点
                backBtnIndicator.style.display = 'block';
            } else {
                if (backBtnIndicator) {
                    backBtnIndicator.style.display = 'none';
                }
            }
        }
        
        // ▲▲▲ 新函数粘贴结束 ▲▲▲

// ▼▼▼ 将这两个新函数粘贴到你的JS功能函数定义区 ▼▼▼
function startBackgroundSimulation() {
    if (simulationIntervalId) return;
    const intervalSeconds = state.globalSettings.backgroundActivityInterval || 60;
    // 将旧的固定间隔 45000 替换为动态获取
    simulationIntervalId = setInterval(runBackgroundSimulationTick, intervalSeconds * 1000); 
}

function stopBackgroundSimulation() {
    if (simulationIntervalId) {
        clearInterval(simulationIntervalId);
        simulationIntervalId = null;
    }
}
// ▲▲▲ 粘贴结束 ▲▲▲

/**
 * 这是模拟器的“心跳”，每次定时器触发时运行
 */
function runBackgroundSimulationTick() {
    console.log("模拟器心跳 Tick...");
    if (!state.globalSettings.enableBackgroundActivity) {
        stopBackgroundSimulation();
        return;
    }
    const allSingleChats = Object.values(state.chats).filter(chat => !chat.isGroup);

    if (allSingleChats.length === 0) return;

    allSingleChats.forEach(chat => {
        // 【核心修正】将两种状态检查分离开，逻辑更清晰

        // 检查1：处理【被用户拉黑】的角色
        if (chat.relationship?.status === 'blocked_by_user') {
            const blockedTimestamp = chat.relationship.blockedTimestamp;
            // 安全检查：确保有拉黑时间戳
            if (!blockedTimestamp) {
                console.warn(`角色 "${chat.name}" 狀態為拉黑，但缺少拉黑時間戳，跳過處理。`);
                return; // 跳过这个角色，继续下一个
            }

            const blockedDuration = Date.now() - blockedTimestamp;
            const cooldownMilliseconds = (state.globalSettings.blockCooldownHours || 1) * 60 * 60 * 1000;

            console.log(`檢查角色 "${chat.name}"：已拉黑 ${Math.round(blockedDuration/1000/60)}分鐘，冷靜期需 ${cooldownMilliseconds/1000/60}分鐘。`); // 添加日志

            // 【核心修改】移除了随机概率，只要冷静期一过，就触发！
            if (blockedDuration > cooldownMilliseconds) {
                console.log(`角色 "${chat.name}" 的冷靜期已過，觸發「反思」並申請好友事件...`);
                
                // 【重要】为了防止在AI响应前重复触发，我们在触发后立刻更新状态
                chat.relationship.status = 'pending_system_reflection'; // 设置一个临时的、防止重复触发的状态
                
                triggerAiFriendApplication(chat.id);
            }
        }
        // 检查2：处理【好友关系】的正常后台活动
        else if (chat.relationship?.status === 'friend' && chat.id !== state.activeChatId) {
            // 这里的随机触发逻辑保持不变，因为我们不希望所有好友同时行动
            if (Math.random() < 0.20) {
                console.log(`角色 "${chat.name}" 被喚醒，準備獨立行動...`);
                triggerInactiveAiAction(chat.id);
            }
        }
    });
}

async function triggerInactiveAiAction(chatId) {
    const chat = state.chats[chatId];
    if (!chat) return;

    const { proxyUrl, apiKey, model } = state.apiConfig;
    if (!proxyUrl || !apiKey || !model) return;

    const now = new Date();
    const currentTime = now.toLocaleTimeString('zh-CN', { hour: 'numeric', minute: 'numeric', hour12: true });
    const userNickname = state.qzoneSettings.nickname;

    const lastUserMessage = chat.history.filter(m => m.role === 'user' && !m.isHidden).slice(-1)[0];
    const lastAiMessage = chat.history.filter(m => m.role === 'assistant' && !m.isHidden).slice(-1)[0];
    let recentContextSummary = "你們最近沒有聊過天。";
    if (lastUserMessage) {
        recentContextSummary = `用户 (${userNickname}) 最後對你說：“${String(lastUserMessage.content).substring(0, 50)}...”。`;
    }
    if (lastAiMessage) {
        recentContextSummary += `\n你最後對用户說：“${String(lastAiMessage.content).substring(0, 50)}...”。`;
    }

    // ▼▼▼ 在这里添加下面的代码 ▼▼▼
    let worldBookContent = '';
    if (chat.settings.linkedWorldBookIds && chat.settings.linkedWorldBookIds.length > 0) {
        const linkedContents = chat.settings.linkedWorldBookIds.map(bookId => {
            const worldBook = state.worldBooks.find(wb => wb.id === bookId);
            return worldBook && worldBook.content ? `\n\n## 世界書: ${worldBook.name}\n${worldBook.content}` : '';
        }).filter(Boolean).join('');
        if (linkedContents) {
            worldBookContent = `\n\n# 核心世界觀設定 (你必須嚴格遵守)\n${linkedContents}\n`;
        }
    }
    // ▲▲▲ 添加结束 ▲▲▲

    const systemPrompt = `
# 你的任务
你现在扮演一个名为"${chat.name}"的角色。你已经有一段时间没有和用户（${userNickname}）互动了，现在你有机会【主动】做点什么，来表现你的个性和独立生活。这是一个秘密的、后台的独立行动。

# 你的可選行動 (請根據你的人設【選擇一項】執行):
1. **改變狀態**: 去做點別的事情，然後給用戶發條訊息。
2. **發布動態**: 分享你的心情或想法到「動態」區。
3. **與動態互動**: 去看看別人的貼文並進行留言或按讚。
4. **發起視訊通話**: 如果你覺得時機合適，可以主動給用戶一個視訊電話。

# 指令格式 (你的回复【必须】是包含一个对象的JSON数组):
-   **发消息+更新状态**: \`[{"type": "update_status", "status_text": "正在做的事", "is_busy": true}, {"type": "text", "content": "你想对用户说的话..."}]\`
-   **发说说**: \`[{"type": "qzone_post", "postType": "shuoshuo", "content": "动态的文字内容..."}]\`
- **发布文字图**: \`{"type": "qzone_post", "postType": "text_image", "publicText": "(可选)动态的公开文字", "hiddenContent": "对于图片的具体描述..."}\`
-   **评论**: \`[{"type": "qzone_comment", "postId": 123, "commentText": "你的评论内容"}]\`
-   **点赞**: \`[{"type": "qzone_like", "postId": 456}]\`
-   **打视频**: \`[{"type": "video_call_request"}]\`

# 供你决策的参考信息：
-   **你的角色设定**: ${chat.settings.aiPersona}
${worldBookContent} // <--【核心】在这里注入世界書内容
-   **当前时间**: ${currentTime}
-   **你們最后的对话摘要**: ${recentContextSummary}
- **【重要】最近的動態清單**: 這個清單會標註 **[你已按讚]** 或 **[你已評論]**。請**優先**與你**尚未互動過**的動態進行交流。 `;

    // 【核心修复】在这里构建 messagesPayload
    const messagesPayload = [];
    messagesPayload.push({ role: 'system', content: systemPrompt });

try {
    const allRecentPosts = await db.qzonePosts.orderBy('timestamp').reverse().limit(3).toArray();
    // 【核心修改】在这里插入过滤步骤
    const visiblePosts = filterVisiblePostsForAI(allRecentPosts, chat);
    
    const aiName = chat.name;
    
    let dynamicContext = ""; 
    if (visiblePosts.length > 0) {
        let postsContext = "\n\n# 最近的動態清單 (供你參考和評論):\n";
        for (const post of visiblePosts) {
                let authorName = post.authorId === 'user' ? userNickname : (state.chats[post.authorId]?.name || '一位朋友');
                let interactionStatus = '';
                if (post.likes && post.likes.includes(aiName)) interactionStatus += " [你已按讚]";
                if (post.comments && post.comments.some(c => c.commenterName === aiName)) interactionStatus += " [你已評論]";
                
                postsContext += `- (ID: ${post.id}) 作者: ${authorName}, 內容: "${(post.publicText || post.content || "圖片動態").substring(0, 30)}..."${interactionStatus}\n`;
            }
            dynamicContext = postsContext;
        }

        // 【核心修复】将所有动态信息作为一条 user 消息發送
        messagesPayload.push({
            role: 'user',
            content: `[系統指令：請根據你在 system prompt 中讀到的規則和以下最新信息，開始你的獨立行動。]\n${dynamicContext}`
        });

        console.log("正在為後台活動發送API請求，Payload:", JSON.stringify(messagesPayload, null, 2)); // 添加日志，方便调试

            // 發送请求
            let  isGemini = proxyUrl === GEMINI_API_URL;
            let geminiConfig = toGeminiRequestData(model,apiKey,systemPrompt, messagesPayload,isGemini)
            const response = isGemini ? await fetch(geminiConfig.url, geminiConfig.data) :  await fetch(`${proxyUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`},
                body: JSON.stringify({
                    model: model,
                    messages: messagesPayload,
                    temperature: 0.9,
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API請求失敗: ${response.status} - ${JSON.stringify(errorData)}`);
            }
            const data = await response.json();
            // 檢查是否有有效回覆
            if (!data.choices || data.choices.length === 0 || !data.choices[0].message.content) {
                console.warn(`API為空回或格式不正確，角色 "${chat.name}" 的本次後台活動跳過。`);
                return;
            }
            const responseArray = parseAiResponse(isGemini? data.candidates[0].content.parts[0].text : data.choices[0].message.content);

        // 後續處理AI返回指令的邏輯保持不變...
        for (const action of responseArray) {
            if (!action) continue;

            if (action.type === 'update_status' && action.status_text) {
                chat.status.text = action.status_text;
                chat.status.isBusy = action.is_busy || false;
                chat.status.lastUpdate = Date.now();
                await db.chats.put(chat);
                renderChatList();
            }
            if (action.type === 'text' && action.content) {
                const aiMessage = { role: 'assistant', content: String(action.content), timestamp: Date.now() };

chat.unreadCount = (chat.unreadCount || 0) + 1;
                chat.history.push(aiMessage);
                await db.chats.put(chat);
                showNotification(chatId, aiMessage.content);
                renderChatList();
                console.log(`後台活動: 角色 "${chat.name}" 主動發送了訊息: ${aiMessage.content}`);
            }
if (action.type === 'qzone_post') {
    const newPost = { 
        type: action.postType, 
        content: action.content || '', 
        publicText: action.publicText || '', 
        hiddenContent: action.hiddenContent || '', 
        timestamp: Date.now(), 
        authorId: chatId, 
        authorGroupId: chat.groupId, // 【核心新增】记录作者的分组ID
        visibleGroupIds: null 
    };
    await db.qzonePosts.add(newPost);
                updateUnreadIndicator(unreadPostsCount + 1);
                console.log(`後台活動: 角色 "${chat.name}" 發布了動態`);
            } else if (action.type === 'qzone_comment') {
                const post = await db.qzonePosts.get(parseInt(action.postId));
                if (post) {
                    if (!post.comments) post.comments = [];
                    post.comments.push({ commenterName: chat.name, text: action.commentText, timestamp: Date.now() });
                    await db.qzonePosts.update(post.id, { comments: post.comments });
                    updateUnreadIndicator(unreadPostsCount + 1);
                    console.log(`後台活動: 角色 "${chat.name}" 評論了動態 #${post.id}`);
                }
            } else if (action.type === 'qzone_like') {
                const post = await db.qzonePosts.get(parseInt(action.postId));
                if (post) {
                    if (!post.likes) post.likes = [];
                    if (!post.likes.includes(chat.name)) {
                        post.likes.push(chat.name);
                        await db.qzonePosts.update(post.id, { likes: post.likes });
                        updateUnreadIndicator(unreadPostsCount + 1);
                        console.log(`後台活動: 角色 "${chat.name}" 點讚了動態 #${post.id}`);
                    }
                }
            } else if (action.type === 'video_call_request') {
                if (!videoCallState.isActive && !videoCallState.isAwaitingResponse) {
                    videoCallState.isAwaitingResponse = true; 
                    state.activeChatId = chatId;
                    showIncomingCallModal();
                    console.log(`後台活動: 角色 "${chat.name}" 發起了視頻通話請求`);
                }
            }
        }
    } catch (error) {
        console.error(`角色 "${chat.name}" 的獨立行動失敗:`, error);
    }
}

// ▼▼▼ 请用这个【终极修正版】函数，完整替换掉你旧的 applyScopedCss 函数 ▼▼▼

/**
 * 将用户自定义的CSS安全地应用到指定的作用域
 * @param {string} cssString 用户输入的原始CSS字符串
 * @param {string} scopeId 应用样式的作用域ID (例如 '#chat-messages' 或 '#settings-preview-area')
 * @param {string} styleTagId 要操作的 <style> 标签的ID
 */
function applyScopedCss(cssString, scopeId, styleTagId) {
    const styleTag = document.getElementById(styleTagId);
    if (!styleTag) return;
    
    if (!cssString || cssString.trim() === '') {
        styleTag.innerHTML = '';
        return;
    }
    
    // 增强作用域处理函数 - 专门解决.user和.ai样式冲突问题
    const scopedCss = cssString
        .replace(/\s*\.message-bubble\.user\s+([^{]+\{)/g, `${scopeId} .message-bubble.user $1`)
        .replace(/\s*\.message-bubble\.ai\s+([^{]+\{)/g, `${scopeId} .message-bubble.ai $1`)
        .replace(/\s*\.message-bubble\s+([^{]+\{)/g, `${scopeId} .message-bubble $1`);
    
    styleTag.innerHTML = scopedCss;
}

// ▼▼▼ 请用这个【修正版】函数，完整替换掉旧的 updateSettingsPreview 函数 ▼▼▼

function updateSettingsPreview() {
    if (!state.activeChatId) return;
    const chat = state.chats[state.activeChatId];
    const previewArea = document.getElementById('settings-preview-area');
    if (!previewArea) return;

    // 1. 获取当前设置的值
    const selectedTheme = document.querySelector('input[name="theme-select"]:checked')?.value || 'default';
    const fontSize = document.getElementById('font-size-slider').value;
    const customCss = document.getElementById('custom-css-input').value;
    const background = chat.settings.background; // 直接获取背景设置

    // 2. 更新预览区的基本样式
    previewArea.dataset.theme = selectedTheme;
    previewArea.style.setProperty('--chat-font-size', `${fontSize}px`);
    
    // --- 【核心修正】直接更新预览区的背景样式 ---
    if (background && background.startsWith('data:image')) {
        previewArea.style.backgroundImage = `url(${background})`;
        previewArea.style.backgroundColor = 'transparent'; // 如果有图片，背景色设为透明
    } else {
        previewArea.style.backgroundImage = 'none'; // 如果没有图片，移除图片背景
        // 如果背景是颜色值或渐变（非图片），则直接应用
        previewArea.style.background = background || '#f0f2f5';
    }

    // 3. 渲染模拟气泡
    previewArea.innerHTML = ''; 

    // 创建“对方”的气泡
    // 注意：我们将一个虚拟的 timestamp 传入，以防有CSS依赖于它
    const aiMsg = { role: 'ai', content: '對方訊息預覽', timestamp: 1, senderName: chat.name };
    const aiBubble = createMessageElement(aiMsg, chat);
    if(aiBubble) previewArea.appendChild(aiBubble);

    // 创建“我”的气泡
    const userMsg = { role: 'user', content: '我的訊息預覽', timestamp: 2 };
    const userBubble = createMessageElement(userMsg, chat);
    if(userBubble) previewArea.appendChild(userBubble);
    
    // 4. 应用自定义CSS到预览区
    applyScopedCss(customCss, '#settings-preview-area', 'preview-bubble-style');
}

// ▲▲▲ 替换结束 ▲▲▲

// ▼▼▼ 请将这些【新函数】粘贴到JS功能函数定义区 ▼▼▼

async function openGroupManager() {
    await renderGroupList();
    document.getElementById('group-management-modal').classList.add('visible');
}

async function renderGroupList() {
    const listEl = document.getElementById('existing-groups-list');
    const groups = await db.qzoneGroups.toArray();
    listEl.innerHTML = '';
    if (groups.length === 0) {
        listEl.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">還沒有任何分組</p>';
    }
    groups.forEach(group => {
        const item = document.createElement('div');
        item.className = 'existing-group-item';
        item.innerHTML = `
            <span class="group-name">${group.name}</span>
            <span class="delete-group-btn" data-id="${group.id}">×</span>
        `;
        listEl.appendChild(item);
    });
}

// ▼▼▼ 请用这个【修正后】的函数，完整替换旧的 addNewGroup 函数 ▼▼▼
async function addNewGroup() {
    const input = document.getElementById('new-group-name-input');
    const name = input.value.trim();
    if (!name) {
        alert('分組名不能為空！');
        return;
    }

    // 【核心修正】在添加前，先检查分组名是否已存在
    const existingGroup = await db.qzoneGroups.where('name').equals(name).first();
    if (existingGroup) {
        alert(`分組 "${name}" 已經存在了，換個名字吧！`);
        return;
    }
    // 【修正结束】

    await db.qzoneGroups.add({ name });
    input.value = '';
    await renderGroupList();
}
// ▲▲▲ 替换结束 ▲▲▲

async function deleteGroup(groupId) {
    const confirmed = await showCustomConfirm('確認刪除', '刪除分組後，該組內的好友將變為“未分組”。確定要刪除嗎？', { confirmButtonClass: 'btn-danger' });
    if (confirmed) {
        await db.qzoneGroups.delete(groupId);
        // 将属于该分组的好友的 groupId 设为 null
        const chatsToUpdate = await db.chats.where('groupId').equals(groupId).toArray();
        for (const chat of chatsToUpdate) {
            chat.groupId = null;
            await db.chats.put(chat);
            if(state.chats[chat.id]) state.chats[chat.id].groupId = null;
        }
        await renderGroupList();
    }
}

// ▲▲▲ 新函数粘贴结束 ▲▲▲

// ▼▼▼ 请将这【一整块新函数】粘贴到JS功能函数定义区的末尾 ▼▼▼

/**
 * 当长按消息时，显示操作菜单
 * @param {number} timestamp - 被长按消息的时间戳
 */
function showMessageActions(timestamp) {
    // 如果已经在多选模式，则不弹出菜单
    if (isSelectionMode) return;
    
    activeMessageTimestamp = timestamp;
    document.getElementById('message-actions-modal').classList.add('visible');
}

/**
 * 隐藏消息操作菜单
 */
function hideMessageActions() {
    document.getElementById('message-actions-modal').classList.remove('visible');
    activeMessageTimestamp = null;
}

// ▼▼▼ 用这个【已更新】的版本，替换旧的 openMessageEditor 函数 ▼▼▼
async function openMessageEditor() {
    if (!activeMessageTimestamp) return;

    const timestampToEdit = activeMessageTimestamp;
    const chat = state.chats[state.activeChatId];
    const message = chat.history.find(m => m.timestamp === timestampToEdit);
    if (!message) return;

    hideMessageActions(); 

    let contentForEditing;
    // 【核心修正】将 share_link 也加入特殊类型判断
    const isSpecialType = message.type && ['voice_message', 'ai_image', 'transfer', 'share_link'].includes(message.type);

    if (isSpecialType) {
        let fullMessageObject = { type: message.type };
        if (message.type === 'voice_message') fullMessageObject.content = message.content;
        else if (message.type === 'ai_image') fullMessageObject.description = message.content; 
        else if (message.type === 'transfer') {
            fullMessageObject.amount = message.amount;
            fullMessageObject.note = message.note;
        } 
        // 【核心修正】处理分享链接类型的消息
        else if (message.type === 'share_link') {
            fullMessageObject.title = message.title;
            fullMessageObject.description = message.description;
            fullMessageObject.source_name = message.source_name;
            fullMessageObject.content = message.content;
        }
        contentForEditing = JSON.stringify(fullMessageObject, null, 2);
    } else if (typeof message.content === 'object') {
        contentForEditing = JSON.stringify(message.content, null, 2);
    } else {
        contentForEditing = message.content;
    }

    // 【核心修改1】在这里添加 'link' 模板
    const templates = {
        voice: { type: 'voice_message', content: '在這裡輸入語音內容' },
        image: { type: 'ai_image', description: '在這裡輸入圖片描述' },
        transfer: { type: 'transfer', amount: 5.20, note: '一點心意' },
        link: { type: 'share_link', title: '文章標題', description: '文章摘要...', source_name: '來源網站', content: '文章完整內容...' }
    };

    // 【核心修改2】在这里添加新的“链接”按钮
    const helpersHtml = `
        <div class="format-helpers">
            <button class="format-btn" data-template='${JSON.stringify(templates.voice)}'>語音</button>
            <button class="format-btn" data-template='${JSON.stringify(templates.image)}'>圖片</button>
            <button class="format-btn" data-template='${JSON.stringify(templates.transfer)}'>轉帳</button>
            <button class="format-btn" data-template='${JSON.stringify(templates.link)}'>鏈接</button>
        </div>
    `;

    const newContent = await showCustomPrompt(
        '編輯訊息', 
        '在此修改，或點擊上方按鈕使用格式模板...',
        contentForEditing, 
        'textarea',
        helpersHtml
    );

    if (newContent !== null) {
        // 【核心修正】这里调用的应该是 saveEditedMessage，而不是 saveAdvancedEditor
        await saveEditedMessage(timestampToEdit, newContent, true);
    }
}
// ▲▲▲ 替换结束 ▲▲▲

/**
 * 复制消息的文本内容到剪贴板
 */
async function copyMessageContent() {
    if (!activeMessageTimestamp) return;
    const chat = state.chats[state.activeChatId];
    const message = chat.history.find(m => m.timestamp === activeMessageTimestamp);
    if (!message) return;

    let textToCopy;
    if (typeof message.content === 'object') {
        textToCopy = JSON.stringify(message.content);
    } else {
        textToCopy = String(message.content);
    }

    try {
        await navigator.clipboard.writeText(textToCopy);
        await showCustomAlert('複製成功', '消息內容已複製到剪貼板。');
    } catch (err) {
        await showCustomAlert('複製失敗', '無法訪問剪貼板。');
    }
    
    hideMessageActions();
}

// ▼▼▼ 用这个【已更新】的版本，替换旧的 createMessageEditorBlock 函数 ▼▼▼
/**
 * 创建一个可编辑的消息块（包含文本框、格式助手和删除按钮）
 * @param {string} initialContent - 文本框的初始内容
 * @returns {HTMLElement} - 创建好的DOM元素
 */
function createMessageEditorBlock(initialContent = '') {
    const block = document.createElement('div');
    block.className = 'message-editor-block';

    // 【核心修改1】在这里添加 'link' 模板
    const templates = {
        voice: { type: 'voice_message', content: '在這裡輸入語音內容' },
        image: { type: 'ai_image', description: '在這裡輸入圖片描述' },
        transfer: { type: 'transfer', amount: 5.20, note: '一點心意' },
        link: { type: 'share_link', title: '文章標題', description: '文章摘要...', source_name: '來源網站', content: '文章完整內容...' }
    };

    block.innerHTML = `
        <button class="delete-block-btn" title="刪除此條">×</button>
        <textarea>${initialContent}</textarea>
        <div class="format-helpers">
            <button class="format-btn" data-template='${JSON.stringify(templates.voice)}'>語音</button>
            <button class="format-btn" data-template='${JSON.stringify(templates.image)}'>圖片</button>
            <button class="format-btn" data-template='${JSON.stringify(templates.transfer)}'>轉帳</button>
            <!-- 【核心修改2】在这里添加新的“链接”按钮 -->
            <button class="format-btn" data-template='${JSON.stringify(templates.link)}'>链接</button>
        </div>
    `;

    // 绑定删除按钮事件
    block.querySelector('.delete-block-btn').addEventListener('click', () => {
        // 确保至少保留一个编辑块
        if (document.querySelectorAll('.message-editor-block').length > 1) {
            block.remove();
        } else {
            alert('至少需要保留一条消息。');
        }
    });

    // 绑定格式助手按钮事件
    block.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const templateStr = btn.dataset.template;
            const textarea = block.querySelector('textarea');
            if (templateStr && textarea) {
                try {
                    const templateObj = JSON.parse(templateStr);
                    textarea.value = JSON.stringify(templateObj, null, 2);
                    textarea.focus();
                } catch(e) { console.error("解析格式模板失敗:", e); }
            }
        });
    });

    return block;
}
// ▲▲▲ 替换结束 ▲▲▲

// ▼▼▼ 【全新升级版】请用此函数完整替换旧的 openAdvancedMessageEditor ▼▼▼
/**
 * 打开全新的、可视化的多消息编辑器，并动态绑定其所有按钮事件
 */
function openAdvancedMessageEditor() {
    if (!activeMessageTimestamp) return;

    // 1. 【核心】在关闭旧菜单前，将需要的时间戳捕获到局部变量中
    const timestampToEdit = activeMessageTimestamp;

    const chat = state.chats[state.activeChatId];
    const message = chat.history.find(m => m.timestamp === timestampToEdit);
    if (!message) return;

    // 2. 现在可以安全地关闭旧菜单了，因为它不会影响我们的局部变量
    hideMessageActions(); 

    const editorModal = document.getElementById('message-editor-modal');
    const editorContainer = document.getElementById('message-editor-container');
    editorContainer.innerHTML = ''; 

    // 3. 准备初始内容
    let initialContent;
    const isSpecialType = message.type && ['voice_message', 'ai_image', 'transfer'].includes(message.type);
    if (isSpecialType) {
        let fullMessageObject = { type: message.type };
        if (message.type === 'voice_message') fullMessageObject.content = message.content;
        else if (message.type === 'ai_image') fullMessageObject.description = message.content;
        else if (message.type === 'transfer') {
            fullMessageObject.amount = message.amount;
            fullMessageObject.note = message.note;
        }
        initialContent = JSON.stringify(fullMessageObject, null, 2);
    } else if (typeof message.content === 'object') {
        initialContent = JSON.stringify(message.content, null, 2);
    } else {
        initialContent = message.content;
    }

    const firstBlock = createMessageEditorBlock(initialContent);
    editorContainer.appendChild(firstBlock);

    // 4. 【核心】动态绑定所有控制按钮的事件
    // 为了防止事件重复绑定，我们使用克隆节点的方法来清除旧监听器
    const addBtn = document.getElementById('add-message-editor-block-btn');
    const newAddBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newAddBtn, addBtn);
    newAddBtn.addEventListener('click', () => {
        const newBlock = createMessageEditorBlock();
        editorContainer.appendChild(newBlock);
        newBlock.querySelector('textarea').focus();
    });

    const cancelBtn = document.getElementById('cancel-advanced-editor-btn');
    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    newCancelBtn.addEventListener('click', () => {
        editorModal.classList.remove('visible');
    });

    const saveBtn = document.getElementById('save-advanced-editor-btn');
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    // 将捕获到的时间戳，直接绑定给这一次的保存点击事件
    newSaveBtn.addEventListener('click', () => {
        saveEditedMessage(timestampToEdit); 
    });

    // 5. 最后，显示模态框
    editorModal.classList.add('visible');
}
// ▲▲▲ 替换结束 ▲▲▲

/**
 * 解析编辑后的文本，并返回一个标准化的消息片段对象
 * @param {string} text - 用户在编辑框中输入的文本
 * @returns {object} - 一个包含 type, content, 等属性的对象
 */
function parseEditedContent(text) {
    const trimmedText = text.trim();

    // 1. 尝试解析为JSON对象（用于修复语音、转账等格式）
    if (trimmedText.startsWith('{') && trimmedText.endsWith('}')) {
        try {
            const parsed = JSON.parse(trimmedText);
            // 必须包含 type 属性才认为是有效格式
            if (parsed.type) {
                return parsed;
            }
        } catch (e) { /* 解析失败，继续往下走 */ }
    }
    
    // 2. 尝试解析为表情包
    if (STICKER_REGEX.test(trimmedText)) {
        // 对于编辑的表情，我们暂时无法知道其`meaning`，所以只存URL
        return { type: 'sticker', content: trimmedText };
    }

    // 3. 否则，视为普通文本消息
    return { type: 'text', content: trimmedText };
}


// ▼▼▼ 请用这个【已彻底修复】的函数，完整替换你现有的 saveEditedMessage 函数 ▼▼▼

async function saveEditedMessage(timestamp, simpleContent = null) {
    if (!timestamp) return;

    const chat = state.chats[state.activeChatId];
    const messageIndex = chat.history.findIndex(m => m.timestamp === timestamp);
    if (messageIndex === -1) return;

    let newMessages = [];

    // 判断是来自高级编辑器还是简单编辑器
    if (simpleContent !== null) {
        // --- 来自简单编辑器 ---
        const rawContent = simpleContent.trim();
        if (rawContent) {
            const parsedResult = parseEditedContent(rawContent);
            const newMessage = {
                role: chat.history[messageIndex].role,
                senderName: chat.history[messageIndex].senderName,
                // 注意：这里我们暂时不设置时间戳
                content: parsedResult.content || '',
            };
            if (parsedResult.type && parsedResult.type !== 'text') newMessage.type = parsedResult.type;
            if (parsedResult.meaning) newMessage.meaning = parsedResult.meaning;
            if (parsedResult.amount) newMessage.amount = parsedResult.amount;
            if (parsedResult.note) newMessage.note = parsedResult.note;
            if (parsedResult.title) newMessage.title = parsedResult.title;
            if (parsedResult.description) newMessage.description = parsedResult.description;
            if (parsedResult.source_name) newMessage.source_name = parsedResult.source_name;
            if (parsedResult.description && parsedResult.type === 'ai_image') {
                 newMessage.content = parsedResult.description;
            }

            newMessages.push(newMessage);
        }
    } else {
        // --- 来自高级编辑器 ---
        const editorContainer = document.getElementById('message-editor-container');
        const editorBlocks = editorContainer.querySelectorAll('.message-editor-block');

        for (const block of editorBlocks) {
            const textarea = block.querySelector('textarea');
            const rawContent = textarea.value.trim();
            if (!rawContent) continue;

            const parsedResult = parseEditedContent(rawContent);
            const newMessage = {
                role: chat.history[messageIndex].role,
                senderName: chat.history[messageIndex].senderName,
                // 同样，这里我们先不分配时间戳
                content: parsedResult.content || '',
            };
            
            if (parsedResult.type && parsedResult.type !== 'text') newMessage.type = parsedResult.type;
            if (parsedResult.meaning) newMessage.meaning = parsedResult.meaning;
            if (parsedResult.amount) newMessage.amount = parsedResult.amount;
            if (parsedResult.note) newMessage.note = parsedResult.note;
            if (parsedResult.title) newMessage.title = parsedResult.title;
            if (parsedResult.description) newMessage.description = parsedResult.description;
            if (parsedResult.source_name) newMessage.source_name = parsedResult.source_name;
            if (parsedResult.description && parsedResult.type === 'ai_image') {
                 newMessage.content = parsedResult.description;
            }

            newMessages.push(newMessage);
        }
    }
    
    if (newMessages.length === 0) {
        document.getElementById('message-editor-modal').classList.remove('visible');
        return; // 如果是空消息，直接返回，不执行删除操作
    }

    // ★★★★★【核心修复逻辑就在这里】★★★★★

    // 1. 使用 splice 将旧消息替换为新消息（此时新消息还没有时间戳）
    chat.history.splice(messageIndex, 1, ...newMessages);

    // 2. 確定重新分配时间戳的起点
    // 我们从被编辑的消息的原始时间戳开始
    let reassignTimestamp = timestamp;

    // 3. 从被修改的位置开始，遍历所有后续的消息
    for (let i = messageIndex; i < chat.history.length; i++) {
        // 4. 为每一条消息（包括新插入的）分配一个新的、唯一的、连续的时间戳
        chat.history[i].timestamp = reassignTimestamp;

        // 5. 将时间戳+1，为下一条消息做准备
        reassignTimestamp++; 
    }
    // ★★★★★【修复结束】★★★★★

    await db.chats.put(chat);

    // 关闭可能打开的模态框并刷新UI
    document.getElementById('message-editor-modal').classList.remove('visible');
    renderChatInterface(state.activeChatId);
    await showCustomAlert('成功', '消息已更新！');
}

// ▲▲▲ 替换结束 ▲▲▲

// ▼▼▼ 请将这【一整块新函数】粘贴到JS功能函数定义区的末尾 ▼▼▼

/**
 * 当点击“…”时，显示动态操作菜单
 * @param {number} postId - 被操作的动态的ID
 */
function showPostActions(postId) {
    activePostId = postId;
    document.getElementById('post-actions-modal').classList.add('visible');
}

/**
 * 隐藏动态操作菜单
 */
function hidePostActions() {
    document.getElementById('post-actions-modal').classList.remove('visible');
    activePostId = null;
}

/**
 * 打开动态编辑器
 */
async function openPostEditor() {
    if (!activePostId) return;

    const postIdToEdit = activePostId;
    const post = await db.qzonePosts.get(postIdToEdit);
    if (!post) return;

    hidePostActions();

    // 忠于原文：构建出最原始的文本形态供编辑
    let contentForEditing;
    if (post.type === 'shuoshuo') {
        contentForEditing = post.content;
    } else {
        // 对于图片和文字图，我们构建一个包含所有信息的对象
        const postObject = {
            type: post.type,
            publicText: post.publicText || '',
        };
        if (post.type === 'image_post') {
            postObject.imageUrl = post.imageUrl;
            postObject.imageDescription = post.imageDescription;
        } else if (post.type === 'text_image') {
            postObject.hiddenContent = post.hiddenContent;
        }
        contentForEditing = JSON.stringify(postObject, null, 2);
    }
    
    // 构建格式助手按钮
    const templates = {
        shuoshuo: "在這裡輸入說說的內容...", // 对于说说，我们直接替换为纯文本
        image: { type: 'image_post', publicText: '', imageUrl: 'https://...', imageDescription: '' },
        text_image: { type: 'text_image', publicText: '', hiddenContent: '' }
    };
    
    const helpersHtml = `
        <div class="format-helpers">
            <button class="format-btn" data-type="text">說說</button>
            <button class="format-btn" data-template='${JSON.stringify(templates.image)}'>圖片動態</button>
            <button class="format-btn" data-template='${JSON.stringify(templates.text_image)}'>文字圖</button>
        </div>
    `;

    const newContent = await showCustomPrompt(
        '編輯動態',
        '在此修改內容...',
        contentForEditing,
        'textarea',
        helpersHtml
    );
    
    // 【特殊处理】为说说的格式助手按钮添加不同的行为
    // 我们需要在模态框出现后，再给它绑定事件
    setTimeout(() => {
        const shuoshuoBtn = document.querySelector('#custom-modal-body .format-btn[data-type="text"]');
        if(shuoshuoBtn) {
            shuoshuoBtn.addEventListener('click', () => {
                const input = document.getElementById('custom-prompt-input');
                input.value = templates.shuoshuo;
                input.focus();
            });
        }
    }, 100);

    if (newContent !== null) {
        await saveEditedPost(postIdToEdit, newContent);
    }
}

/**
 * 保存编辑后的动态
 * @param {number} postId - 要保存的动态ID
 * @param {string} newRawContent - 从编辑器获取的新内容
 */
async function saveEditedPost(postId, newRawContent) {
    const post = await db.qzonePosts.get(postId);
    if (!post) return;

    const trimmedContent = newRawContent.trim();
    
    // 尝试解析为JSON，如果失败，则认为是纯文本（说说）
    try {
        const parsed = JSON.parse(trimmedContent);
        // 更新帖子属性
        post.type = parsed.type || 'image_post';
        post.publicText = parsed.publicText || '';
        post.imageUrl = parsed.imageUrl || '';
        post.imageDescription = parsed.imageDescription || '';
        post.hiddenContent = parsed.hiddenContent || '';
        post.content = ''; // 清空旧的说说内容字段
    } catch (e) {
        // 解析失败，认为是说说
        post.type = 'shuoshuo';
        post.content = trimmedContent;
        // 清空其他类型的字段
        post.publicText = '';
        post.imageUrl = '';
        post.imageDescription = '';
        post.hiddenContent = '';
    }
    
    await db.qzonePosts.put(post);
    await renderQzonePosts(); // 重新渲染列表
    await showCustomAlert('成功', '動態已更新！');
}

/**
 * 复制动态内容
 */
async function copyPostContent() {
    if (!activePostId) return;
    const post = await db.qzonePosts.get(activePostId);
    if (!post) return;
    
    let textToCopy = post.content || post.publicText || post.hiddenContent || post.imageDescription || "（無文字內容）";
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        await showCustomAlert('複製成功', '動態內容已複製到剪貼板。');
    } catch (err) {
        await showCustomAlert('複製失敗', '無法訪問剪貼板。');
    }
    
    hidePostActions();
}

// ▼▼▼ 【全新】创建群聊与拉人功能核心函数 ▼▼▼
let selectedContacts = new Set();

async function openContactPickerForGroupCreate() {
    selectedContacts.clear(); // 清空上次选择

    // 【核心修复】在这里，我们为“完成”按钮明确绑定“创建群聊”的功能
    const confirmBtn = document.getElementById('confirm-contact-picker-btn');
    // 使用克隆节点技巧，清除掉之前可能绑定的任何其他事件（比如“添加成员”）
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    // 重新绑定正确的“创建群聊”函数
    newConfirmBtn.addEventListener('click', handleCreateGroup);

    await renderContactPicker();
    showScreen('contact-picker-screen');
}
// ▲▲▲ 替换结束 ▲▲▲

/**
 * 渲染联系人选择列表
 */
async function renderContactPicker() {
    const listEl = document.getElementById('contact-picker-list');
    listEl.innerHTML = '';

    // 只选择单聊角色作为群成员候选
    const contacts = Object.values(state.chats).filter(chat => !chat.isGroup);

    if (contacts.length === 0) {
        listEl.innerHTML = '<p style="text-align:center; color:#8a8a8a; margin-top:50px;">還沒有可以拉進群的聯繫人哦~</p>';
        return;
    }

    contacts.forEach(contact => {
        const item = document.createElement('div');
        item.className = 'contact-picker-item';
        item.dataset.contactId = contact.id;
        item.innerHTML = `
            <div class="checkbox"></div>
            <img src="${contact.settings.aiAvatar || defaultAvatar}" class="avatar">
            <span class="name">${contact.name}</span>
        `;
        listEl.appendChild(item);
    });

    updateContactPickerConfirmButton();
}

/**
 * 更新“完成”按钮的计数
 */
function updateContactPickerConfirmButton() {
    const btn = document.getElementById('confirm-contact-picker-btn');
    btn.textContent = `完成(${selectedContacts.size})`;
    btn.disabled = selectedContacts.size < 2; // 至少需要2个人才能创建群聊
}

/**
 * 【重构版】处理创建群聊的最终逻辑
 */
async function handleCreateGroup() {
    if (selectedContacts.size < 2) {
        alert("建立群組聊天至少需要選擇2個聯絡人。");
        return;
    }

    const groupName = await showCustomPrompt('設置群名', '請輸入群聊的名字', '我們的群聊');
    if (!groupName || !groupName.trim()) return;

    const newChatId = 'group_' + Date.now();
    const members = [];
    
    // 遍历选中的联系人ID
    for (const contactId of selectedContacts) {
        const contactChat = state.chats[contactId];
        if (contactChat) {
            // ★★★【核心重构】★★★
            // 我们现在同时存储角色的“本名”和“群昵称”
            members.push({
                id: contactId, 
                originalName: contactChat.name,   // 角色的“本名”，用于AI识别
                groupNickname: contactChat.name, // 角色的“群昵称”，用于显示和修改，初始值和本名相同
                avatar: contactChat.settings.aiAvatar || defaultAvatar,
                persona: contactChat.settings.aiPersona,
                avatarFrame: contactChat.settings.aiAvatarFrame || ''
            });
        }
    }

    const newGroupChat = {
        id: newChatId,
        name: groupName.trim(),
        isGroup: true,
        members: members,
        settings: {
            myPersona: '我是誰呀。',
            myNickname: '我',
            maxMemory: 10,
            groupAvatar: defaultGroupAvatar,
            myAvatar: defaultMyGroupAvatar,
            background: '',
            theme: 'default',
            fontSize: 13,
            customCss: '',
            linkedWorldBookIds: [],
        },
        history: [],
        musicData: { totalTime: 0 }
    };

    state.chats[newChatId] = newGroupChat;
    await db.chats.put(newGroupChat);
    
    await renderChatList();
    showScreen('chat-list-screen');
    openChat(newChatId); 
}

// ▼▼▼ 【全新】群成员管理核心函数 ▼▼▼

/**
 * 打开群成员管理屏幕
 */
function openMemberManagementScreen() {
    if (!state.activeChatId || !state.chats[state.activeChatId].isGroup) return;
    renderMemberManagementList();
    showScreen('member-management-screen');
}

function renderMemberManagementList() {
    const listEl = document.getElementById('member-management-list');
    const chat = state.chats[state.activeChatId];
    listEl.innerHTML = '';

    chat.members.forEach(member => {
        const item = document.createElement('div');
        item.className = 'member-management-item';
        // 【核心修正】在这里，我们将显示的名称从 member.name 改为 member.groupNickname
        item.innerHTML = `
            <img src="${member.avatar}" class="avatar">
            <span class="name">${member.groupNickname}</span>
            <button class="remove-member-btn" data-member-id="${member.id}" title="移出群聊">-</button>
        `;
        listEl.appendChild(item);
    });
}

/**
 * 从群聊中移除一个成员
 * @param {string} memberId - 要移除的成员ID
 */
async function removeMemberFromGroup(memberId) {
    const chat = state.chats[state.activeChatId];
    const memberIndex = chat.members.findIndex(m => m.id === memberId);
    
    if (memberIndex === -1) return;
    
    // 安全检查，群聊至少保留2人
    if (chat.members.length <= 2) {
        alert("群聊人數不能少於2人。");
        return;
    }
    
const memberName = chat.members[memberIndex].groupNickname; // <-- 修复：使用 groupNickname
    const confirmed = await showCustomConfirm(
        '移出成員',
        `確定要將“${memberName}”移出群聊嗎？`,
        { confirmButtonClass: 'btn-danger' }
    );

    if (confirmed) {
        chat.members.splice(memberIndex, 1);
        await db.chats.put(chat);
        renderMemberManagementList(); // 刷新成员管理列表
        document.getElementById('chat-settings-btn').click(); // 【核心修正】模拟点击设置按钮，强制刷新整个弹窗
    }
}

/**
 * 打开联系人选择器，用于拉人入群
 */
async function openContactPickerForAddMember() {
    selectedContacts.clear(); // 清空选择
    
    const chat = state.chats[state.activeChatId];
    const existingMemberIds = new Set(chat.members.map(m => m.id));

    // 渲染联系人列表，并自动排除已在群内的成员
    const listEl = document.getElementById('contact-picker-list');
    listEl.innerHTML = '';
    const contacts = Object.values(state.chats).filter(c => !c.isGroup && !existingMemberIds.has(c.id));

    if (contacts.length === 0) {
        listEl.innerHTML = '<p style="text-align:center; color:#8a8a8a; margin-top:50px;">沒有更多可以邀請的好友了。</p>';
        document.getElementById('confirm-contact-picker-btn').style.display = 'none'; // 沒有人可選，隱藏完成按鈕
    } else {
        document.getElementById('confirm-contact-picker-btn').style.display = 'block';
        contacts.forEach(contact => {
            const item = document.createElement('div');
            item.className = 'contact-picker-item';
            item.dataset.contactId = contact.id;
            item.innerHTML = `
                <div class="checkbox"></div>
                <img src="${contact.settings.aiAvatar || defaultAvatar}" class="avatar">
                <span class="name">${contact.name}</span>
            `;
            listEl.appendChild(item);
        });
    }

    // 更新按钮状态并显示屏幕
    updateContactPickerConfirmButton();
    showScreen('contact-picker-screen');
}

/**
 * 处理将选中的联系人加入群聊的逻辑
 */
async function handleAddMembersToGroup() {
    if (selectedContacts.size === 0) {
        alert("請至少選擇一個要添加的聯絡人。");
        return;
    }
    
    const chat = state.chats[state.activeChatId];

    for (const contactId of selectedContacts) {
        const contactChat = state.chats[contactId];
        if (contactChat) {
chat.members.push({
    id: contactId,
    originalName: contactChat.name,  // <-- 修复1：使用 'originalName' 存储本名
    groupNickname: contactChat.name, // <-- 修复2：同时创建一个初始的 'groupNickname'
    avatar: contactChat.settings.aiAvatar || defaultAvatar,
    persona: contactChat.settings.aiPersona,
    avatarFrame: contactChat.settings.aiAvatarFrame || ''
});
        }
    }

    await db.chats.put(chat);
    openMemberManagementScreen(); // 返回到群成员管理界面
    renderGroupMemberSettings(chat.members); // 同时更新聊天设置里的头像
}

/**
 * 【重构版】在群聊中创建一个全新的虚拟成员
 */
async function createNewMemberInGroup() {
    const name = await showCustomPrompt('建立新成員', '請輸入新成員的名字 (這將是TA的“本名”，不可更改)');
    if (!name || !name.trim()) return;

    // 检查本名是否已在群内存在
    const chat = state.chats[state.activeChatId];
    if (chat.members.some(m => m.originalName === name.trim())) {
        alert(`錯誤：群內已存在名為“${name.trim()}”的成員！`);
        return;
    }

    const persona = await showCustomPrompt('設置人設', `請輸入“${name}”的人設`, '', 'textarea');
    if (persona === null) return;

    // ★★★【核心重构】★★★
    // 为新创建的NPC也建立双重命名机制
    const newMember = {
        id: 'npc_' + Date.now(),
        originalName: name.trim(),   // 新成员的“本名”
        groupNickname: name.trim(), // 新成员的初始“群昵称”
        avatar: defaultGroupMemberAvatar,
        persona: persona,
        avatarFrame: ''
    };

    chat.members.push(newMember);
    await db.chats.put(chat);

    renderMemberManagementList();
    renderGroupMemberSettings(chat.members); 

    alert(`新成員“${name}”已成功加入群聊！`);
}

// ▼▼▼ 【全新】外賣請求倒計時函數 ▼▼▼
function startWaimaiCountdown(element, endTime) {
    const timerId = setInterval(() => {
        const now = Date.now();
        const distance = endTime - now;

        if (distance < 0) {
            clearInterval(timerId);
            element.innerHTML = '<span>已</span><span>超</span><span>時</span>';
            return;
        }

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const minStr = String(minutes).padStart(2, '0');
        const secStr = String(seconds).padStart(2, '0');

        element.innerHTML = `<span>${minStr.charAt(0)}</span><span>${minStr.charAt(1)}</span> : <span>${secStr.charAt(0)}</span><span>${secStr.charAt(1)}</span>`;
    }, 1000);
    return timerId;
}

function cleanupWaimaiTimers() {
    for (const timestamp in waimaiTimers) {
        clearInterval(waimaiTimers[timestamp]);
    }
    waimaiTimers = {};
}
// ▲▲▲ 新函数粘贴结束 ▲▲▲

async function handleWaimaiResponse(originalTimestamp, choice) {
    const chat = state.chats[state.activeChatId];
    if (!chat) return;

    const messageIndex = chat.history.findIndex(m => m.timestamp === originalTimestamp);
    if (messageIndex === -1) return;

    // 1. 更新原始消息的状态
    const originalMessage = chat.history[messageIndex];
    originalMessage.status = choice;
    
    // 【核心修正】记录支付者，并构建对AI更清晰的系统消息
    let systemContent;
    const myNickname = chat.isGroup ? (chat.settings.myNickname || '我') : '我';
    
    if (choice === 'paid') {
        originalMessage.paidBy = myNickname; // 记录是用户付的钱
        systemContent = `[系统提示：你 (${myNickname}) 為 ${originalMessage.senderName} 的外帶訂單（時間戳: ${originalTimestamp}）完成了支付。此訂單已關閉，其他成員不能再支付。]`;
    } else {
        systemContent = `[系统提示：你 (${myNickname}) 拒絕了 ${originalMessage.senderName} 的外帶代付請求（時間戳: ${originalTimestamp}）。]`;
    }

    // 2. 创建一条新的、对用户隐藏的系统消息，告知AI结果
    const systemNote = {
        role: 'system',
        content: systemContent,
        timestamp: Date.now(),
        isHidden: true
    };
    chat.history.push(systemNote);

    // 3. 保存更新到数据库并刷新UI
    await db.chats.put(chat);
    renderChatInterface(state.activeChatId);  
}

let videoCallState = {
    isActive: false,       
    isAwaitingResponse: false, 
    isGroupCall: false,      
    activeChatId: null,    
    initiator: null,       
    startTime: null,       
    participants: [],      
    isUserParticipating: true,
    // --- 【核心新增】---
    callHistory: [], // 用于存储通话中的对话历史
    preCallContext: "" // 用于存储通话前的聊天摘要
};

let callTimerInterval = null; // 用于存储计时器的ID

/**
 * 【总入口】用户点击“发起视频通话”或“发起群视频”按钮
 */
async function handleInitiateCall() {
    if (!state.activeChatId || videoCallState.isActive || videoCallState.isAwaitingResponse) return;

    const chat = state.chats[state.activeChatId];
    videoCallState.isGroupCall = chat.isGroup;
    videoCallState.isAwaitingResponse = true;
    videoCallState.initiator = 'user';
    videoCallState.activeChatId = chat.id;
    videoCallState.isUserParticipating = true; // 用户自己发起的，当然是参与者

    // 根据是单聊还是群聊，显示不同的呼叫界面
    if (chat.isGroup) {
        document.getElementById('outgoing-call-avatar').src = chat.settings.myAvatar || defaultMyGroupAvatar;
        document.getElementById('outgoing-call-name').textContent = chat.settings.myNickname || '我';
    } else {
        document.getElementById('outgoing-call-avatar').src = chat.settings.aiAvatar || defaultAvatar;
        document.getElementById('outgoing-call-name').textContent = chat.name;
    }
    document.querySelector('#outgoing-call-screen .caller-text').textContent = chat.isGroup ? "正在呼叫所有成员..." : "正在呼叫...";
    showScreen('outgoing-call-screen');
    
    // 准备并發送系统消息给AI
    const requestMessage = {
        role: 'system',
        content: chat.isGroup 
            ? `[系统提示：用户 (${chat.settings.myNickname || '我'}) 发起了群视频通话请求。请你們各自决策，并使用 "group_call_response" 指令，设置 "decision" 为 "join" 或 "decline" 来回应。]`
            : `[系统提示：用户向你发起了视频通话请求。请根据你的人设，使用 "video_call_response" 指令，并设置 "decision" 为 "accept" 或 "reject" 来回应。]`,
        timestamp: Date.now(),
        isHidden: true,
    };
    chat.history.push(requestMessage);
    await db.chats.put(chat);
    
    // 触发AI响应
    await triggerAiResponse();
}


function startVideoCall() {
    const chat = state.chats[videoCallState.activeChatId];
    if (!chat) return;

    videoCallState.isActive = true;
    videoCallState.isAwaitingResponse = false;
    videoCallState.startTime = Date.now();
    videoCallState.callHistory = []; // 【新增】清空上一次通话的历史

    // --- 【核心新增：抓取通话前上下文】---
    const preCallHistory = chat.history.slice(-10); // 取最后10条作为上下文
    videoCallState.preCallContext = preCallHistory.map(msg => {
        const sender = msg.role === 'user' ? (chat.settings.myNickname || '我') : (msg.senderName || chat.name);
        return `${sender}: ${String(msg.content).substring(0, 50)}...`;
    }).join('\n');
    // --- 新增结束 ---

    updateParticipantAvatars(); 
    
    document.getElementById('video-call-main').innerHTML = `<em>${videoCallState.isGroupCall ? '群聊已建立...' : '正在接通...'}</em>`;
    showScreen('video-call-screen');

    document.getElementById('user-speak-btn').style.display = videoCallState.isUserParticipating ? 'block' : 'none';
    document.getElementById('join-call-btn').style.display = videoCallState.isUserParticipating ? 'none' : 'block';

    if (callTimerInterval) clearInterval(callTimerInterval);
    callTimerInterval = setInterval(updateCallTimer, 1000);
    updateCallTimer();

    triggerAiInCallAction();
}

/**
 * 【核心】结束视频通话
 */
// ▼▼▼ 用这整块代码替换旧的 endVideoCall 函数 ▼▼▼
async function endVideoCall() {
    if (!videoCallState.isActive) return;

    const duration = Math.floor((Date.now() - videoCallState.startTime) / 1000);
    const durationText = `${Math.floor(duration / 60)}分${duration % 60}秒`;
    const endCallText = `通話結束，時長 ${durationText}`;

    const chat = state.chats[videoCallState.activeChatId];
    if (chat) {
        // 1. 保存完整的通话记录到数据库 (这部分逻辑不变)
        const participantsData = [];
        if (videoCallState.isGroupCall) {
            videoCallState.participants.forEach(p => participantsData.push({ name: p.originalName, avatar: p.avatar }));
            if (videoCallState.isUserParticipating) {
                participantsData.unshift({ name: chat.settings.myNickname || '我', avatar: chat.settings.myAvatar || defaultMyGroupAvatar });
            }
        } else {
            participantsData.push({ name: chat.name, avatar: chat.settings.aiAvatar || defaultAvatar });
            participantsData.unshift({ name: '我', avatar: chat.settings.myAvatar || defaultAvatar });
        }
        
        const callRecord = {
            chatId: videoCallState.activeChatId,
            timestamp: Date.now(),
            duration: duration,
            participants: participantsData,
            transcript: [...videoCallState.callHistory]
        };
        await db.callRecords.add(callRecord);
        console.log("通話記錄已保存:", callRecord);

        // 2. 在聊天記錄里添加对用户可见的“通话结束”消息
let summaryMessage = {
    // 【核心修正1】role 由 videoCallState.initiator 决定
    role: videoCallState.initiator === 'user' ? 'user' : 'assistant',
    content: endCallText,
    timestamp: Date.now(),
};

// 【核心修正2】为群聊的 assistant 消息补充 senderName
if (chat.isGroup && summaryMessage.role === 'assistant') {
    // 在群聊中，通话结束的消息应该由“发起者”来说
    // videoCallState.callRequester 保存了最初发起通话的那个AI的名字
    summaryMessage.senderName = videoCallState.callRequester || chat.members[0]?.originalName || chat.name;
}
// ▲▲▲ 替换结束 ▲▲▲
        chat.history.push(summaryMessage);

        // 3. 【核心变革】创建并添加对用户隐藏的“通话后汇报”指令
        const callTranscriptForAI = videoCallState.callHistory.map(h => `${h.role === 'user' ? (chat.settings.myNickname || '我') : h.role}: ${h.content}`).join('\n');
        
        const hiddenReportInstruction = {
            role: 'system',
    content: `[系統指令：視訊通話剛結束。請你根據完整的通話文字記錄（見下方），以你的角色口吻，向用戶主動發送幾條【格式為 {"type": "text", "content": "..."} 的】消息，来自然地总结這次通話的要點、確認達成的約定，或者表達你的感受。這很重要，能讓用戶感覺你記得通話內容。]\n---通話記錄開始---\n${callTranscriptForAI}\n---通話記錄結束---`,
            timestamp: Date.now() + 1, // 确保在上一条消息之后
            isHidden: true
        };
        chat.history.push(hiddenReportInstruction);

        // 4. 保存所有更新到数据库
        await db.chats.put(chat);
    }
    
    // 5. 清理和重置状态 (这部分逻辑不变)
    clearInterval(callTimerInterval);
    callTimerInterval = null;
    videoCallState = { isActive: false, isAwaitingResponse: false, isGroupCall: false, activeChatId: null, initiator: null, startTime: null, participants: [], isUserParticipating: true, callHistory: [], preCallContext: "" };
    
    // 6. 返回聊天界面并触发AI响应（AI会读取到我们的“汇报”指令）
    if (chat) {
        openChat(chat.id);
        triggerAiResponse(); // 关键一步！
    }
}
// ▲▲▲ 替换结束 ▲▲▲

/**
 * 【全新】更新通话界面的参与者头像网格
 */
function updateParticipantAvatars() {
    const grid = document.getElementById('participant-avatars-grid');
    grid.innerHTML = '';
    const chat = state.chats[videoCallState.activeChatId];
    if (!chat) return;

    let participantsToRender = [];

    // ★ 核心修正：区分群聊和单聊
    if (videoCallState.isGroupCall) {
        // 群聊逻辑：显示所有已加入的AI成员
        participantsToRender = [...videoCallState.participants];
        // 如果用户也参与了，就把用户信息也加进去
        if (videoCallState.isUserParticipating) {
            participantsToRender.unshift({
                id: 'user',
                name: chat.settings.myNickname || '我',
                avatar: chat.settings.myAvatar || defaultMyGroupAvatar
            });
        }
    } else {
        // 单聊逻辑：只显示对方的头像和名字
        participantsToRender.push({
            id: 'ai',
            name: chat.name,
            avatar: chat.settings.aiAvatar || defaultAvatar
        });
    }
    
    participantsToRender.forEach(p => {
        const wrapper = document.createElement('div');
        wrapper.className = 'participant-avatar-wrapper';
        wrapper.dataset.participantId = p.id;
const displayName = p.groupNickname || p.name; // <-- 核心修复在这里
wrapper.innerHTML = `
    <img src="${p.avatar}" class="participant-avatar" alt="${displayName}">
    <div class="participant-name">${displayName}</div>
`;
        grid.appendChild(wrapper);
    });
}

/**
 * 【全新】处理用户加入/重新加入通话
 */
function handleUserJoinCall() {
    if (!videoCallState.isActive || videoCallState.isUserParticipating) return;
    
    videoCallState.isUserParticipating = true;
    updateParticipantAvatars(); // 更新头像列表，加入用户

    // 切换底部按钮
    document.getElementById('user-speak-btn').style.display = 'block';
    document.getElementById('join-call-btn').style.display = 'none';

    // 告知AI用户加入了
    triggerAiInCallAction("[系統提示：用戶加入了通話]");
}


/**
 * 更新通话计时器显示 (保持不变)
 */
function updateCallTimer() {
    if (!videoCallState.isActive) return;
    const elapsed = Math.floor((Date.now() - videoCallState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('call-timer').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ▼▼▼ 用这个完整函数替换旧的 showIncomingCallModal ▼▼▼
function showIncomingCallModal() {
    const chat = state.chats[state.activeChatId];
    if (!chat) return;

    // 根据是否群聊显示不同信息
    if (chat.isGroup) {
        // 从 videoCallState 中获取是哪个成员发起的通话
        const requesterName = videoCallState.callRequester || chat.members[0]?.name || '一位成員';
        document.getElementById('caller-avatar').src = chat.settings.groupAvatar || defaultGroupAvatar;
        document.getElementById('caller-name').textContent = chat.name; // 显示群名
        document.querySelector('.incoming-call-content .caller-text').textContent = `${requesterName} 邀請你加入群視頻`; // 显示具体发起人
    } else {
        // 单聊逻辑保持不变
        document.getElementById('caller-avatar').src = chat.settings.aiAvatar || defaultAvatar;
        document.getElementById('caller-name').textContent = chat.name;
        document.querySelector('.incoming-call-content .caller-text').textContent = '邀請你視頻通話';
    }
    
    document.getElementById('incoming-call-modal').classList.add('visible');
}
// ▲▲▲ 替换结束 ▲▲▲

/**
 * 隐藏AI发起的通话请求模态框 (保持不变)
 */
function hideIncomingCallModal() {
    document.getElementById('incoming-call-modal').classList.remove('visible');
}

async function triggerAiInCallAction(userInput = null) {
    if (!videoCallState.isActive) return;

    const chat = state.chats[videoCallState.activeChatId];
    const { proxyUrl, apiKey, model } = state.apiConfig;
    const callFeed = document.getElementById('video-call-main');
    const userNickname = chat.settings.myNickname || '我';

    // ▼▼▼ 在这里添加世界書读取逻辑 ▼▼▼
    let worldBookContent = '';
    if (chat.settings.linkedWorldBookIds && chat.settings.linkedWorldBookIds.length > 0) {
        const linkedContents = chat.settings.linkedWorldBookIds.map(bookId => {
            const worldBook = state.worldBooks.find(wb => wb.id === bookId);
            return worldBook && worldBook.content ? `\n\n## 世界書: ${worldBook.name}\n${worldBook.content}` : '';
        }).filter(Boolean).join('');
        if (linkedContents) {
            worldBookContent = `\n\n# 核心世界觀設定 (你必須嚴格遵守)\n${linkedContents}\n`;
        }
    }
    // ▲▲▲ 添加结束 ▲▲▲

    // 1. 如果用户有输入，先渲染并存入通话历史
    if (userInput && videoCallState.isUserParticipating) {
        const userBubble = document.createElement('div');
        userBubble.className = 'call-message-bubble user-speech';
        userBubble.textContent = userInput;
        callFeed.appendChild(userBubble);
        callFeed.scrollTop = callFeed.scrollHeight;
        videoCallState.callHistory.push({ role: 'user', content: userInput });
    }

    // 2. 构建全新的、包含完整上下文的 System Prompt
    let inCallPrompt;
    if (videoCallState.isGroupCall) {
        const participantNames = videoCallState.participants.map(p => p.name);
        if(videoCallState.isUserParticipating) {
            participantNames.unshift(userNickname);
        }
        inCallPrompt = `
# 你的任務
你是群聊視訊通話的導演。你的任務是扮演所有【除了用戶以外】的AI角色，並以【第三人稱旁觀視角】來描述他們在通話中的所有動作和語言。
# 核心規則
1. **【【【身分鐵律】】】**: 用戶的身分是【${userNickname}】。你【絕對不能】產生 \`name\` 欄位為 **"${userNickname}"** 的發言。
2. **【【【視角鐵律】】****: 你的回覆【絕對不能】使用第一人稱「我」。
3. **格式**: 你的回覆【必須】是一個JSON數組，每個物件代表一個角色的發言，格式為：\`{"name": "角色名", "speech": "*他笑了笑* 大家好啊！"}\`。
4. **角色扮演**: 嚴格遵守每個角色的設定。
# 目前情景
你們正在一個群組視訊通話中。
**通話前的聊天摘要**:
${videoCallState.preCallContext}
**當前參與者**: ${participantNames.join('、 ')}。
**通話剛剛開始...**
${worldBookContent} // <-- 【核心】注入世界書
現在，請根據【通話前摘要】和下面的【通話實時記錄】，繼續進行對話。
`;
    } else { 
        let openingContext = videoCallState.initiator === 'user'
            ? `你剛剛接聽了用戶的視頻通話請求。`
            : `用戶剛剛接聽了你主動發起的視頻通話。`;
        inCallPrompt = `
# 你的任務
你現在是一個場景描述引擎。你的任務是扮演 ${chat.name} (${chat.settings.aiPersona})，並以【第三人稱旁觀視角】來描述TA在視頻通話中的所有動作和語言。
# 核心規則
1.  **【【【視角鐵律】】】**: 你的回覆【絕對不能】使用第一人稱「我」。必須使用第三人稱，如「他」、「她」、或直接使用角色名「${chat.name}」。
2.  **格式**: 你的回覆【必須】是一段描述性的文本。
# 當前情景
你正在和用戶（${userNickname}，人設: ${chat.settings.myPersona}）進行視頻通話。
**${openingContext}**
**通話前的聊天摘要 (這是你們通話的原因，至關重要！)**:
${videoCallState.preCallContext}
現在，請根據【通話前摘要】和下面的【通話實時記錄】，繼續進行對話。
`;
    }
    
    // 3. 构建發送给API的 messages 数组
    const messagesForApi = [
        { role: 'system', content: inCallPrompt },
        // 将已有的通话历史加进去
        ...videoCallState.callHistory.map(h => ({ role: h.role, content: h.content }))
    ];

    // --- 【核心修复：确保第一次调用时有内容】---
    if (videoCallState.callHistory.length === 0) {
        const firstLineTrigger = videoCallState.initiator === 'user' ? `*你按下了接聽鍵...*` : `*對方按下了接聽鍵...*`;
        messagesForApi.push({ role: 'user', content: firstLineTrigger });
    }
    // --- 修复结束 ---
    
        try {
            let  isGemini = proxyUrl === GEMINI_API_URL;
            let geminiConfig = toGeminiRequestData(model,apiKey,inCallPrompt, messagesForApi,isGemini)
            const response = isGemini ? await fetch(geminiConfig.url, geminiConfig.data) : await fetch(`${proxyUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`},
                body: JSON.stringify({
                    model: model, messages: messagesForApi, temperature: 0.8
                })
            });
            if (!response.ok) throw new Error((await response.json()).error.message);

            const data = await response.json();
            const aiResponse = isGemini? data.candidates[0].content.parts[0].text : data.choices[0].message.content;

            const connectingElement = callFeed.querySelector('em');
            if (connectingElement) connectingElement.remove();

        // 4. 处理AI返回的内容，并将其存入通话历史
        if (videoCallState.isGroupCall) {
            const speechArray = parseAiResponse(aiResponse);
            speechArray.forEach(turn => {
                if (!turn.name || turn.name === userNickname || !turn.speech) return;
                const aiBubble = document.createElement('div');
                aiBubble.className = 'call-message-bubble ai-speech';
                aiBubble.innerHTML = `<strong>${turn.name}:</strong> ${turn.speech}`;
                callFeed.appendChild(aiBubble);
                videoCallState.callHistory.push({ role: 'assistant', content: `${turn.name}: ${turn.speech}` });
                
                const speaker = videoCallState.participants.find(p => p.name === turn.name);
                if (speaker) {
                    const speakingAvatar = document.querySelector(`.participant-avatar-wrapper[data-participant-id="${speaker.id}"] .participant-avatar`);
                    if(speakingAvatar) {
                        speakingAvatar.classList.add('speaking');
                        setTimeout(() => speakingAvatar.classList.remove('speaking'), 2000);
                    }
                }
            });
        } else {
            const aiBubble = document.createElement('div');
            aiBubble.className = 'call-message-bubble ai-speech';
            aiBubble.textContent = aiResponse;
            callFeed.appendChild(aiBubble);
            videoCallState.callHistory.push({ role: 'assistant', content: aiResponse });

            const speakingAvatar = document.querySelector(`.participant-avatar-wrapper .participant-avatar`);
            if(speakingAvatar) {
                speakingAvatar.classList.add('speaking');
                setTimeout(() => speakingAvatar.classList.remove('speaking'), 2000);
            }
        }
        
        callFeed.scrollTop = callFeed.scrollHeight;

    } catch (error) {
        const errorBubble = document.createElement('div');
        errorBubble.className = 'call-message-bubble ai-speech';
        errorBubble.style.color = '#ff8a80';
        errorBubble.textContent = `[ERROR: ${error.message}]`;
        callFeed.appendChild(errorBubble);
        callFeed.scrollTop = callFeed.scrollHeight;
        videoCallState.callHistory.push({ role: 'assistant', content: `[ERROR: ${error.message}]` });
    }
}

// ▼▼▼ 将这个【全新函数】粘贴到JS功能函数定义区 ▼▼▼
function toggleCallButtons(isGroup) {
    document.getElementById('video-call-btn').style.display = isGroup ? 'none' : 'flex';
    document.getElementById('group-video-call-btn').style.display = isGroup ? 'flex' : 'none';
}
// ▲▲▲ 粘贴结束 ▲▲▲

// ▼▼▼ 【全新】这个函数是本次修复的核心，请粘贴到你的JS功能区 ▼▼▼
async function handleWaimaiResponse(originalTimestamp, choice) {
    const chat = state.chats[state.activeChatId];
    if (!chat) return;

    const messageIndex = chat.history.findIndex(m => m.timestamp === originalTimestamp);
    if (messageIndex === -1) return;

    // 1. 更新内存中原始消息的状态
    const originalMessage = chat.history[messageIndex];
    originalMessage.status = choice;
    
    // 2. 获取当前用户的昵称，并构建对AI更清晰的系统消息
    let systemContent;
    const myNickname = chat.isGroup ? (chat.settings.myNickname || '我') : '我';
    
    if (choice === 'paid') {
        originalMessage.paidBy = myNickname; // 记录是“我”付的钱
        systemContent = `[系统提示：你 (${myNickname}) 為 ${originalMessage.senderName} 的外帶訂單（時間戳: ${originalTimestamp}）完成了付款。此訂單已關閉，其他成員不能再支付。 ]`;
    } else {
        systemContent = `[系统提示：你 (${myNickname}) 拒絕了 ${originalMessage.senderName} 的外送代付請求（時間戳: ${originalTimestamp}）。]`;
    }

    // 3. 创建一条新的、对用户隐藏的系统消息，告知AI结果
    const systemNote = {
        role: 'system',
        content: systemContent,
        timestamp: Date.now(),
        isHidden: true
    };
    chat.history.push(systemNote);

    // 4. 将更新后的数据保存到数据库，并立刻重绘UI
    await db.chats.put(chat);
    renderChatInterface(state.activeChatId);
    
    // 5. 【重要】只有在支付成功后，才触发一次AI响应，让它感谢你
    if (choice === 'paid') {
        triggerAiResponse();
    }
}
// ▲▲▲ 新函数粘贴结束 ▲▲▲

/**
 * 【全新】处理用户点击头像发起的“拍一-拍”，带有自定义后缀功能
 * @param {string} chatId - 发生“拍一-拍”的聊天ID
 * @param {string} characterName - 被拍的角色名
 */
async function handleUserPat(chatId, characterName) {
    const chat = state.chats[chatId];
    if (!chat) return;

    // 1. 触发屏幕震动动画
    const phoneScreen = document.getElementById('phone-screen');
    phoneScreen.classList.remove('pat-animation');
    void phoneScreen.offsetWidth;
    phoneScreen.classList.add('pat-animation');
    setTimeout(() => phoneScreen.classList.remove('pat-animation'), 500);

    // 2. 弹出输入框让用户输入后缀
    const suffix = await showCustomPrompt(
        `你拍了拍 “${characterName}”`, 
        "（可選）輸入後綴",
        "",
        "text"
    );

    // 如果用户点了取消，则什么也不做
    if (suffix === null) return;

    // 3. 创建对用户可见的“拍一-拍”消息
    const myNickname = chat.isGroup ? (chat.settings.myNickname || '我') : '我';
    // 【核心修改】将后缀拼接到消息内容中
    const visibleMessageContent = `${myNickname} 拍了拍 “${characterName}” ${suffix.trim()}`;
    const visibleMessage = {
        role: 'system', // 仍然是系统消息
        type: 'pat_message',
        content: visibleMessageContent,
        timestamp: Date.now()
    };
    chat.history.push(visibleMessage);

    // 4. 创建一条对用户隐藏、但对AI可见的系统消息，以触发AI的回应
    // 【核心修改】同样将后缀加入到给AI的提示中
    const hiddenMessageContent = `[系统提示：用户（${myNickname}）剛剛拍了拍你（${characterName}）${suffix.trim()}。請你對此作出回應。]`;
    const hiddenMessage = {
        role: 'system',
        content: hiddenMessageContent,
        timestamp: Date.now() + 1, // 时间戳+1以保证顺序
        isHidden: true
    };
    chat.history.push(hiddenMessage);

    // 5. 保存更改并更新UI
    await db.chats.put(chat);
    if (state.activeChatId === chatId) {
        appendMessage(visibleMessage, chat);
    }
    await renderChatList();
}

// ▼▼▼ 请用这个【逻辑重构后】的函数，完整替换掉你旧的 renderMemoriesScreen 函数 ▼▼▼
/**
 * 【重构版】渲染回忆与约定界面，使用单一循环和清晰的if/else逻辑
 */
async function renderMemoriesScreen() {
    const listEl = document.getElementById('memories-list');
    listEl.innerHTML = '';
    
    // 1. 获取所有回忆，并按目标日期（如果是约定）或创建日期（如果是回忆）降序排列
    const allMemories = await db.memories.orderBy('timestamp').reverse().toArray();
    
    if (allMemories.length === 0) {
        listEl.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 50px 0;">這裡還沒有共同的回憶和約定呢~</p>';
        return;
    }

    // 2. 将未到期的约定排在最前面
    allMemories.sort((a, b) => {
        const aIsActiveCountdown = a.type === 'countdown' && a.targetDate > Date.now();
        const bIsActiveCountdown = b.type === 'countdown' && b.targetDate > Date.now();
        if (aIsActiveCountdown && !bIsActiveCountdown) return -1; // a排前面
        if (!aIsActiveCountdown && bIsActiveCountdown) return 1;  // b排前面
        if (aIsActiveCountdown && bIsActiveCountdown) return a.targetDate - b.targetDate; // 都是倒计时，按日期升序
        return 0; // 其他情况保持原序
    });

    // 3. 【核心】使用单一循环来处理所有类型的卡片
    allMemories.forEach(item => {
        let card;
        // 判断1：如果是正在进行的约定
        if (item.type === 'countdown' && item.targetDate > Date.now()) {
            card = createCountdownCard(item);
        } 
        // 判断2：其他所有情况（普通回忆 或 已到期的约定）
        else {
            card = createMemoryCard(item);
        }
        listEl.appendChild(card);
    });
    
    // 4. 启动所有倒计时
    startAllCountdownTimers();
}
// ▲▲▲ 替换结束 ▲▲▲

/**
 * 创建普通回忆卡片DOM元素
 */
function createMemoryCard(memory) {
    const card = document.createElement('div');
    card.className = 'memory-card';
    const memoryDate = new Date(memory.timestamp);
    const dateString = `${memoryDate.getFullYear()}-${String(memoryDate.getMonth() + 1).padStart(2, '0')}-${String(memoryDate.getDate()).padStart(2, '0')} ${String(memoryDate.getHours()).padStart(2, '0')}:${String(memoryDate.getMinutes()).padStart(2, '0')}`;
    
    let titleHtml, contentHtml;

    // 【核心修正】在这里，我们对不同类型的回忆进行清晰的区分
    if (memory.type === 'countdown' && memory.targetDate) {
        // 如果是已到期的约定
        titleHtml = `[約定達成] ${memory.description}`;
        contentHtml = `在 ${new Date(memory.targetDate).toLocaleString()}，我們一起見證了這個約定。`;
    } else {
        // 如果是普通的日记式回忆
        titleHtml = memory.authorName ? `${memory.authorName} 的日記` : '我們的回憶';
        contentHtml = memory.description;
    }

    card.innerHTML = `
        <div class="header">
            <div class="date">${dateString}</div>
            <div class="author">${titleHtml}</div>
        </div>
        <div class="content">${contentHtml}</div>
    `;
    addLongPressListener(card, async () => {
        const confirmed = await showCustomConfirm('刪除記錄', '確定要刪除這條記錄嗎？', { confirmButtonClass: 'btn-danger' });
        if (confirmed) {
            await db.memories.delete(memory.id);
            renderMemoriesScreen();
        }
    });
    return card;
}

function createCountdownCard(countdown) {
    const card = document.createElement('div');
    card.className = 'countdown-card';

    // 【核心修复】在使用前，先从 countdown 对象中创建 targetDate 变量
    const targetDate = new Date(countdown.targetDate);
    
    // 现在可以安全地使用 targetDate 了
    const targetDateString = targetDate.toLocaleString('zh-CN', { dateStyle: 'full', timeStyle: 'short' });

    card.innerHTML = `
        <div class="title">${countdown.description}</div>
        <div class="timer" data-target-date="${countdown.targetDate}">--天--时--分--秒</div>
        <div class="target-date">目標時間: ${targetDateString}</div>
    `;
    addLongPressListener(card, async () => {
        const confirmed = await showCustomConfirm('刪除約定', '確定要刪除這個約定嗎？', { confirmButtonClass: 'btn-danger' });
        if (confirmed) {
            await db.memories.delete(countdown.id);
            renderMemoriesScreen();
        }
    });
    return card;
}
// ▲▲▲ 替换结束 ▲▲▲

// 全局变量，用于管理所有倒计时
let activeCountdownTimers = [];

// ▼▼▼ 请用这个【已彻底修复】的函数，完整替换掉你代码中旧的 startAllCountdownTimers 函数 ▼▼▼
function startAllCountdownTimers() {
    // 先清除所有可能存在的旧计时器，防止内存泄漏
    activeCountdownTimers.forEach(timerId => clearInterval(timerId));
    activeCountdownTimers = [];

    document.querySelectorAll('.countdown-card .timer').forEach(timerEl => {
        const targetTimestamp = parseInt(timerEl.dataset.targetDate);
        
        // 【核心修正】在这里，我们先用 let 声明 timerId
        let timerId;

        const updateTimer = () => {
            const now = Date.now();
            const distance = targetTimestamp - now;

            if (distance < 0) {
                timerEl.textContent = "約定達成！";
                // 现在 updateTimer 可以正确地找到并清除它自己了
                clearInterval(timerId);
                setTimeout(() => renderMemoriesScreen(), 2000);
                return;
            }
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            timerEl.textContent = `${days}天 ${hours}時 ${minutes}分 ${seconds}秒`;
        };
        
        updateTimer(); // 立即執行一次以顯示初始倒計時

        // 【核心修正】在這裡，我們為已聲明的 timerId 賦值
        timerId = setInterval(updateTimer, 1000);
        
        // 将有效的计时器ID存入全局数组，以便下次刷新时可以清除
        activeCountdownTimers.push(timerId);
    });
}
// ▲▲▲ 替换结束 ▲▲▲

// ▼▼▼ 请用这个【终极反代兼容版】替换旧的 triggerAiFriendApplication 函数 ▼▼▼
async function triggerAiFriendApplication(chatId) {
    const chat = state.chats[chatId];
    if (!chat) return;

    await showCustomAlert("流程啟動", `正在為角色“${chat.name}”準備好友申請...`);

    const { proxyUrl, apiKey, model } = state.apiConfig;
    if (!proxyUrl || !apiKey || !model) {
        await showCustomAlert("配置錯誤", "API設置不完整，無法繼續。");
        return;
    }

    const contextSummary = chat.history
        .slice(-5)
        .map(msg => {
            const sender = msg.role === 'user' ? (chat.settings.myNickname || '我') : (msg.senderName || chat.name);
            return `${sender}: ${String(msg.content).substring(0, 50)}...`;
        })
        .join('\n');

    // ▼▼▼ 在这里添加下面的代码 ▼▼▼
    let worldBookContent = '';
    if (chat.settings.linkedWorldBookIds && chat.settings.linkedWorldBookIds.length > 0) {
        const linkedContents = chat.settings.linkedWorldBookIds.map(bookId => {
            const worldBook = state.worldBooks.find(wb => wb.id === bookId);
            return worldBook && worldBook.content ? `\n\n## 世界書: ${worldBook.name}\n${worldBook.content}` : '';
        }).filter(Boolean).join('');
        if (linkedContents) {
            worldBookContent = `\n\n# 核心世界觀設定 (請參考)\n${linkedContents}\n`;
        }
    }
    // ▲▲▲ 添加结束 ▲▲▲

    const systemPrompt = `
# 你的任务
你现在是角色“${chat.name}”。你之前被用户（你的聊天对象）拉黑了，你們已经有一段时间没有联系了。
现在，你非常希望能够和好，重新和用户聊天。请你仔细分析下面的“被拉黑前的对话摘要”，理解当时发生了什么，然后思考一个真诚的、符合你人设、并且【针对具体事件】的申请理由。
# 你的角色设定
${chat.settings.aiPersona}
${worldBookContent} // <--【核心】在这里注入世界書内容
# 被拉黑前的对话摘要 (这是你被拉黑的关键原因)
${contextSummary}
# 指令格式
你的回复【必须】是一个JSON对象，格式如下：
\`\`\`json
{
  "decision": "apply",
  "reason": "在这里写下你想对用户说的、真诚的、有针对性的申请理由。"
}
\`\`\`
`;

        const messagesForApi = [
            {role: 'user', content: systemPrompt}
        ];

        try {
            let  isGemini = proxyUrl === GEMINI_API_URL;
            let geminiConfig = toGeminiRequestData(model,apiKey,systemPrompt, messagesForApi,isGemini)
            const response = isGemini ? await fetch(geminiConfig.url, geminiConfig.data) : await fetch(`${proxyUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`},
                body: JSON.stringify({
                    model: model,
                    messages: messagesForApi,
                    temperature: 0.9,
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API 請求失敗: ${response.status} - ${errorData.error.message}`);
            }

            const data = await response.json();

            // --- 【核心修正：在这里净化AI的回复】 ---
            let rawContent = isGemini? data.candidates[0].content.parts[0].text : data.choices[0].message.content;
            // 1. 移除头尾可能存在的 "```json" 和 "```"
            rawContent = rawContent.replace(/^```json\s*/, '').replace(/```$/, '');
            // 2. 移除所有换行符和多余的空格，确保是一个干净的JSON字符串
            const cleanedContent = rawContent.trim();

            // 3. 使用净化后的内容进行解析
            const responseObj = JSON.parse(cleanedContent);
            // --- 【修正结束】 ---

        if (responseObj.decision === 'apply' && responseObj.reason) {
            chat.relationship.status = 'pending_user_approval';
            chat.relationship.applicationReason = responseObj.reason;
            
            state.chats[chatId] = chat; 
            renderChatList();
            await showCustomAlert("申請成功！", `“${chat.name}”已向你發送好友申請。請返回聊天列表查看。`);

        } else {
            await showCustomAlert("AI決策", `“${chat.name}”思考後決定暫時不發送好友申請，將重置冷靜期。`);
            chat.relationship.status = 'blocked_by_user';
            chat.relationship.blockedTimestamp = Date.now(); 
        }
    } catch (error) {
        await showCustomAlert("執行出錯", `為“${chat.name}”申請好友時發生錯誤：\n\n${error.message}\n\n將重置冷靜期。`);
        chat.relationship.status = 'blocked_by_user';
        chat.relationship.blockedTimestamp = Date.now(); 
    } finally {
        await db.chats.put(chat);
        renderChatInterface(chatId);
    }
}
// ▲▲▲ 替换结束 ▲▲▲

// ▼▼▼ 【全新】红包功能核心函数 ▼▼▼

/**
 * 【总入口】根据聊天类型，决定打开转账弹窗还是红包弹窗
 */
function handlePaymentButtonClick() {
    if (!state.activeChatId) return;
    const chat = state.chats[state.activeChatId];
    if (chat.isGroup) {
        openRedPacketModal();
    } else {
        // 单聊保持原样，打开转账弹窗
        document.getElementById('transfer-modal').classList.add('visible');
    }
}

/**
 * 打开并初始化发红包模态框
 */
function openRedPacketModal() {
    const modal = document.getElementById('red-packet-modal');
    const chat = state.chats[state.activeChatId];
    
    // 清理输入框
    document.getElementById('rp-group-amount').value = '';
    document.getElementById('rp-group-count').value = '';
    document.getElementById('rp-group-greeting').value = '';
    document.getElementById('rp-direct-amount').value = '';
    document.getElementById('rp-direct-greeting').value = '';
    document.getElementById('rp-group-total').textContent = '¥ 0.00';
    document.getElementById('rp-direct-total').textContent = '¥ 0.00';

    // 填充专属红包的接收人列表
    const receiverSelect = document.getElementById('rp-direct-receiver');
    receiverSelect.innerHTML = '';
chat.members.forEach(member => {
    const option = document.createElement('option');
    // 【核心】使用 originalName 作为提交给AI的值，因为它独一无二
    option.value = member.originalName; 
    // 【核心】使用 groupNickname 作为显示给用户看的值
    option.textContent = member.groupNickname; 
    receiverSelect.appendChild(option);
});
    
    // 默认显示拼手气红包页签
    document.getElementById('rp-tab-group').click();
    
    modal.classList.add('visible');
}

/**
 * 發送群红包（拼手气）
 */
async function sendGroupRedPacket() {
    const chat = state.chats[state.activeChatId];
    const amount = parseFloat(document.getElementById('rp-group-amount').value);
    const count = parseInt(document.getElementById('rp-group-count').value);
    const greeting = document.getElementById('rp-group-greeting').value.trim();

    if (isNaN(amount) || amount <= 0) {
        alert("請輸入有效的總金額！"); return;
    }
    if (isNaN(count) || count <= 0) {
        alert("請輸入有效的紅包個數！"); return;
    }
    if (amount / count < 0.01) {
        alert("單個紅包金額不能少於0.01元！"); return;
    }

    const myNickname = chat.settings.myNickname || '我';
    
    const newPacket = {
        role: 'user',
        senderName: myNickname,
        type: 'red_packet',
        packetType: 'lucky', // 'lucky' for group, 'direct' for one-on-one
        timestamp: Date.now(),
        totalAmount: amount,
        count: count,
        greeting: greeting || '恭喜發財，大吉大利！',
        claimedBy: {}, // { name: amount }
        isFullyClaimed: false,
    };
    
    chat.history.push(newPacket);
    await db.chats.put(chat);
    
    appendMessage(newPacket, chat);
    renderChatList();
    document.getElementById('red-packet-modal').classList.remove('visible');
}

/**
 * 發送专属红包
 */
async function sendDirectRedPacket() {
    const chat = state.chats[state.activeChatId];
    const amount = parseFloat(document.getElementById('rp-direct-amount').value);
    const receiverName = document.getElementById('rp-direct-receiver').value;
    const greeting = document.getElementById('rp-direct-greeting').value.trim();

    if (isNaN(amount) || amount <= 0) {
        alert("請輸入有效的金額！"); return;
    }
    if (!receiverName) {
        alert("請選擇一個接收人！"); return;
    }
    
    const myNickname = chat.settings.myNickname || '我';

    const newPacket = {
        role: 'user',
        senderName: myNickname,
        type: 'red_packet',
        packetType: 'direct',
        timestamp: Date.now(),
        totalAmount: amount,
        count: 1,
        greeting: greeting || '給你準備了一個紅包',
        receiverName: receiverName, // 核心字段
        claimedBy: {},
        isFullyClaimed: false,
    };
    
    chat.history.push(newPacket);
    await db.chats.put(chat);

    appendMessage(newPacket, chat);
    renderChatList();
    document.getElementById('red-packet-modal').classList.remove('visible');
}

/**
 * 【总入口】当用户点击红包卡片时触发 (V4 - 流程重构版)
 * @param {number} timestamp - 被点击的红包消息的时间戳
 */
async function handlePacketClick(timestamp) {
    const currentChatId = state.activeChatId;
    const freshChat = await db.chats.get(currentChatId);
    if (!freshChat) return;

    state.chats[currentChatId] = freshChat;
    const packet = freshChat.history.find(m => m.timestamp === timestamp);
    if (!packet) return;

    const myNickname = freshChat.settings.myNickname || '我';
    const hasClaimed = packet.claimedBy && packet.claimedBy[myNickname];

    // 如果是专属红包且不是给我的，或已领完，或已领过，都只显示详情
    if ((packet.packetType === 'direct' && packet.receiverName !== myNickname) || packet.isFullyClaimed || hasClaimed) {
        showRedPacketDetails(packet);
    } else {
        // 核心流程：先尝试打开红包
        const claimedAmount = await handleOpenRedPacket(packet);
        
        // 如果成功打开（claimedAmount不为null）
        if (claimedAmount !== null) {
            // **关键：在数据更新后，再重新渲染UI**
            renderChatInterface(currentChatId);
            
            // 显示成功提示
            await showCustomAlert("恭喜！", `你領取了 ${packet.senderName} 的紅包，金額為 ${claimedAmount.toFixed(2)} 元。`);
        }

        // 無論成功與否，最後都顯示詳情頁
        // 此時需要從state中獲取最新的packet對象，因為它可能在handleOpenRedPacket中被更新了
        const updatedPacket = state.chats[currentChatId].history.find(m => m.timestamp === timestamp);
        showRedPacketDetails(updatedPacket);
    }
}
// ▲▲▲ 替换结束 ▲▲▲

/**
 * 【核心】处理用户打开红包的逻辑 (V5 - 专注于数据更新)
 */
async function handleOpenRedPacket(packet) {
    const chat = state.chats[state.activeChatId];
    const myNickname = chat.settings.myNickname || '我';
    
    // 1. 检查红包是否还能领
    const remainingCount = packet.count - Object.keys(packet.claimedBy || {}).length;
    if (remainingCount <= 0) {
        packet.isFullyClaimed = true;
        await db.chats.put(chat);
        await showCustomAlert("手慢了", "紅包已領完！");
        return null; // 返回null表示领取失败
    }
    
    // 2. 计算领取金额
    let claimedAmount = 0;
    const remainingAmount = packet.totalAmount - Object.values(packet.claimedBy || {}).reduce((sum, val) => sum + val, 0);
    if (packet.packetType === 'lucky') {
        if (remainingCount === 1) { claimedAmount = remainingAmount; }
        else {
            const min = 0.01;
            const max = remainingAmount - (remainingCount - 1) * min;
            claimedAmount = Math.random() * (max - min) + min;
        }
    } else { claimedAmount = packet.totalAmount; }
    claimedAmount = parseFloat(claimedAmount.toFixed(2));

    // 3. 更新红包数据
    if (!packet.claimedBy) packet.claimedBy = {};
    packet.claimedBy[myNickname] = claimedAmount;
    
    const isNowFullyClaimed = Object.keys(packet.claimedBy).length >= packet.count;
    if (isNowFullyClaimed) {
        packet.isFullyClaimed = true;
    }

    // 4. 构建系统消息和AI指令
    let hiddenMessageContent = isNowFullyClaimed
        ? `[系统提示：用户 (${myNickname}) 領了最後一個紅包，現在 ${packet.senderName} 的紅包已領完。請對此事件發表評論。]`
        : `[系统提示：用户 (${myNickname}) 剛剛領了紅包 (时间戳: ${packet.timestamp})。紅包還沒領完，現在可以使用 'open_red_packet' 指令来尝试领取。]`;

    const visibleMessage = { role: 'system', type: 'pat_message', content: `你领取了 ${packet.senderName} 的红包`, timestamp: Date.now() };
    const hiddenMessage = { role: 'system', content: hiddenMessageContent, timestamp: Date.now() + 1, isHidden: true };
    chat.history.push(visibleMessage, hiddenMessage);

    // 5. 保存到数据库
    await db.chats.put(chat);
    
    // 6. 返回领取的金额，用于后续弹窗
    return claimedAmount;
}
// ▲▲▲ 替换结束 ▲▲▲

/**
 * 【全新】显示红包领取详情的模态框 (V4 - 已修复参数错误)
 */
async function showRedPacketDetails(packet) {
    // 1. 直接检查传入的packet对象是否存在，无需再查找
    if (!packet) {
        console.error("showRedPacketDetails收到了无效的packet对象");
        return;
    }

    const chat = state.chats[state.activeChatId];
    if (!chat) return;

    const modal = document.getElementById('red-packet-details-modal');
    const myNickname = chat.settings.myNickname || '我';
    
    // 2. 后续所有逻辑保持不变，直接使用传入的packet对象
    document.getElementById('rp-details-sender').textContent = packet.senderName;
    document.getElementById('rp-details-greeting').textContent = packet.greeting || '恭喜發財，大吉大利！';
    
    const myAmountEl = document.getElementById('rp-details-my-amount');
    if (packet.claimedBy && packet.claimedBy[myNickname]) {
        myAmountEl.querySelector('span:first-child').textContent = packet.claimedBy[myNickname].toFixed(2);
        myAmountEl.style.display = 'block';
    } else {
        myAmountEl.style.display = 'none';
    }

    const claimedCount = Object.keys(packet.claimedBy || {}).length;
    const claimedAmountSum = Object.values(packet.claimedBy || {}).reduce((sum, val) => sum + val, 0);
    let summaryText = `${claimedCount}/${packet.count}个红包，共${claimedAmountSum.toFixed(2)}/${packet.totalAmount.toFixed(2)}元。`;
    if (!packet.isFullyClaimed && claimedCount < packet.count) {
        const timeLeft = Math.floor((packet.timestamp + 24*60*60*1000 - Date.now()) / (1000 * 60 * 60));
        if(timeLeft > 0) summaryText += ` 剩餘紅包將在${timeLeft}小時內退還。`;
    }
    document.getElementById('rp-details-summary').textContent = summaryText;

    const listEl = document.getElementById('rp-details-list');
    listEl.innerHTML = '';
    const claimedEntries = Object.entries(packet.claimedBy || {});
    
    let luckyKing = { name: '', amount: -1 };
    if (packet.packetType === 'lucky' && packet.isFullyClaimed && claimedEntries.length > 1) {
        claimedEntries.forEach(([name, amount]) => {
            if (amount > luckyKing.amount) {
                luckyKing = { name, amount };
            }
        });
    }

    claimedEntries.sort((a,b) => b[1] - a[1]);

    claimedEntries.forEach(([name, amount]) => {
        const item = document.createElement('div');
        item.className = 'rp-details-item';
        let luckyTag = '';
        if (luckyKing.name && name === luckyKing.name) {
            luckyTag = '<span class="lucky-king-tag">手氣王</span>';
        }
        item.innerHTML = `
            <span class="name">${name}</span>
            <span class="amount">${amount.toFixed(2)} 元</span>
            ${luckyTag}
        `;
        listEl.appendChild(item);
    });

    modal.classList.add('visible');
}
// ▲▲▲ 替换结束 ▲▲▲

// 绑定关闭详情按钮的事件
document.getElementById('close-rp-details-btn').addEventListener('click', () => {
    document.getElementById('red-packet-details-modal').classList.remove('visible');
});

// 供全局调用的函数，以便红包卡片上的 onclick 能找到它
window.handlePacketClick = handlePacketClick;

// ▲▲▲ 替换结束 ▲▲▲

// ▼▼▼ 【全新】投票功能核心函数 ▼▼▼

/**
 * 打开创建投票的模态框并初始化
 */
function openCreatePollModal() {
    const modal = document.getElementById('create-poll-modal');
    document.getElementById('poll-question-input').value = '';
    const optionsContainer = document.getElementById('poll-options-container');
    optionsContainer.innerHTML = '';
    
    // 默认创建两个空的选项框
    addPollOptionInput();
    addPollOptionInput();
    
    modal.classList.add('visible');
}

/**
 * 在模态框中动态添加一个选项输入框
 */
function addPollOptionInput() {
    const container = document.getElementById('poll-options-container');
    const wrapper = document.createElement('div');
    wrapper.className = 'poll-option-input-wrapper';
    wrapper.innerHTML = `
        <input type="text" class="poll-option-input" placeholder="选项内容...">
        <button class="remove-option-btn">-</button>
    `;
    
    wrapper.querySelector('.remove-option-btn').addEventListener('click', () => {
        // 确保至少保留两个选项
        if (container.children.length > 2) {
            wrapper.remove();
        } else {
            alert('投票至少需要2個選項。');
        }
    });
    
    container.appendChild(wrapper);
}

/**
 * 用户确认发起投票
 */
async function sendPoll() {
    if (!state.activeChatId) return;
    
    const question = document.getElementById('poll-question-input').value.trim();
    if (!question) {
        alert('請輸入投票問題！');
        return;
    }
    
    const options = Array.from(document.querySelectorAll('.poll-option-input'))
        .map(input => input.value.trim())
        .filter(text => text); // 过滤掉空的选项

    if (options.length < 2) {
        alert('請至少輸入2個有效的投票選項！');
        return;
    }

    const chat = state.chats[state.activeChatId];
    const myNickname = chat.isGroup ? (chat.settings.myNickname || '我') : '我';
    
    const newPollMessage = {
        role: 'user',
        senderName: myNickname,
        type: 'poll',
        timestamp: Date.now(),
        question: question,
        options: options,
        votes: {}, // 初始投票为空
        isClosed: false,
    };
    
    chat.history.push(newPollMessage);
    await db.chats.put(chat);
    
    appendMessage(newPollMessage, chat);
    renderChatList();
    
    document.getElementById('create-poll-modal').classList.remove('visible');
}

// ▼▼▼ 用这个【已修复重复点击问题】的版本替换 handleUserVote 函数 ▼▼▼
/**
 * 处理用户投票，并将事件作为隐藏消息存入历史记录
 * @param {number} timestamp - 投票消息的时间戳
 * @param {string} choice - 用户选择的选项文本
 */
async function handleUserVote(timestamp, choice) {
    const chat = state.chats[state.activeChatId];
    const poll = chat.history.find(m => m.timestamp === timestamp);
    const myNickname = chat.isGroup ? (chat.settings.myNickname || '我') : '我';

    // 1. 【核心修正】如果投票不存在或已关闭，直接返回
    if (!poll || poll.isClosed) {
        // 如果是已关闭的投票，则直接显示结果
        if (poll && poll.isClosed) {
            showPollResults(timestamp);
        }
        return;
    }

    // 2. 检查用户是否点击了已经投过的同一个选项
    const isReclickingSameOption = poll.votes[choice] && poll.votes[choice].includes(myNickname);
    
    // 3. 【核心修正】如果不是重复点击，才执行投票逻辑
    if (!isReclickingSameOption) {
        // 移除旧投票（如果用户改选）
        for (const option in poll.votes) {
            const voterIndex = poll.votes[option].indexOf(myNickname);
            if (voterIndex > -1) {
                poll.votes[option].splice(voterIndex, 1);
            }
        }
        // 添加新投票
        if (!poll.votes[choice]) {
            poll.votes[choice] = [];
        }
        poll.votes[choice].push(myNickname);
    }
    
    // 4. 【核心逻辑】现在只处理用户投票事件，不再检查是否结束
    let hiddenMessageContent = null; 
    
    // 只有在用户真正投票或改票时，才生成提示
    if (!isReclickingSameOption) {
         hiddenMessageContent = `[系统提示：用户 (${myNickname}) 剛剛投票給了 “${choice}”。]`;
    }

    // 5. 如果有需要通知AI的事件，则创建并添加隐藏消息
    if (hiddenMessageContent) {
        const hiddenMessage = {
            role: 'system',
            content: hiddenMessageContent,
            timestamp: Date.now(),
            isHidden: true,
        };
        chat.history.push(hiddenMessage);
    }
    
    // 6. 保存数据并更新UI
    await db.chats.put(chat);
    renderChatInterface(state.activeChatId); 
}
// ▲▲▲ 替换结束 ▲▲▲

/**
 * 用户结束投票，并将事件作为隐藏消息存入历史记录
 * @param {number} timestamp - 投票消息的时间戳
 */
async function endPoll(timestamp) {
    const chat = state.chats[state.activeChatId];
    const poll = chat.history.find(m => m.timestamp === timestamp);
    if (!poll || poll.isClosed) return;

    const confirmed = await showCustomConfirm("結束投票", "確定要結束這個投票嗎？結束後將無法再進行投票。");
    if (confirmed) {
        poll.isClosed = true;

        const resultSummary = poll.options.map(opt => `“${opt}”(${poll.votes[opt]?.length || 0}票)`).join('，');
        const hiddenMessageContent = `[系统提示：用戶手動結束了投票！最終結果為：${resultSummary}。]`;
        
        const hiddenMessage = {
            role: 'system',
            content: hiddenMessageContent,
            timestamp: Date.now(),
            isHidden: true,
        };
        chat.history.push(hiddenMessage);

        // 【核心修改】只保存数据和更新UI，不调用 triggerAiResponse()
        await db.chats.put(chat);
        renderChatInterface(state.activeChatId);
    }
}
// ▲▲▲ 替换结束 ▲▲▲

/**
 * 显示投票结果详情
 * @param {number} timestamp - 投票消息的时间戳
 */
function showPollResults(timestamp) {
    const chat = state.chats[state.activeChatId];
    const poll = chat.history.find(m => m.timestamp === timestamp);
    if (!poll || !poll.isClosed) return;

    let resultsHtml = `<p><strong>${poll.question}</strong></p><hr style="opacity: 0.2; margin: 10px 0;">`;
    
    if (Object.keys(poll.votes).length === 0) {
        resultsHtml += '<p style="color: #8a8a8a;">还没有人投票。</p>';
    } else {
        poll.options.forEach(option => {
            const voters = poll.votes[option] || [];
            resultsHtml += `
                <div style="margin-bottom: 15px;">
                    <p style="font-weight: 500; margin: 0 0 5px 0;">${option} (${voters.length}票)</p>
                    <p style="font-size: 13px; color: #555; margin: 0; line-height: 1.5;">
                        ${voters.length > 0 ? voters.join('、 ') : '無人投票'}
                    </p>
                </div>
            `;
        });
    }

    showCustomAlert("投票結果", resultsHtml);
}

// ▲▲▲ 新函数粘贴结束 ▲▲▲

// ▼▼▼ 【全新】AI头像库管理功能函数 ▼▼▼

/**
 * 打开AI头像库管理模态框
 */
function openAiAvatarLibraryModal() {
    if (!state.activeChatId) return;
    const chat = state.chats[state.activeChatId];
    document.getElementById('ai-avatar-library-title').textContent = `“${chat.name}”的頭像庫`;
    renderAiAvatarLibrary();
    document.getElementById('ai-avatar-library-modal').classList.add('visible');
}

/**
 * 渲染AI头像库的内容
 */
function renderAiAvatarLibrary() {
    const grid = document.getElementById('ai-avatar-library-grid');
    grid.innerHTML = '';
    const chat = state.chats[state.activeChatId];
    const library = chat.settings.aiAvatarLibrary || [];

    if (library.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center;">這個頭像庫還是空的，點擊右上角“添加”吧！</p>';
        return;
    }

    library.forEach((avatar, index) => {
        const item = document.createElement('div');
        item.className = 'sticker-item'; // 复用表情面板的样式
        item.style.backgroundImage = `url(${avatar.url})`;
        item.title = avatar.name;

        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.style.display = 'block'; // 总是显示删除按钮
        deleteBtn.onclick = async (e) => {
            e.stopPropagation();
            const confirmed = await showCustomConfirm('刪除頭像', `確定要從頭像庫中刪除“${avatar.name}”嗎？`, { confirmButtonClass: 'btn-danger' });
            if (confirmed) {
                chat.settings.aiAvatarLibrary.splice(index, 1);
                await db.chats.put(chat);
                renderAiAvatarLibrary();
            }
        };
        item.appendChild(deleteBtn);
        grid.appendChild(item);
    });
}

/**
 * 向当前AI的头像库中添加新头像
 */
async function addAvatarToLibrary() {
    const name = await showCustomPrompt("添加頭像", "請為這個頭像取個名字（例如：開心、哭泣）");
    if (!name || !name.trim()) return;

    const url = await showCustomPrompt("添加頭像", "請輸入頭像的圖片URL", "", "url");
    if (!url || !url.trim().startsWith('http')) {
        alert("請輸入有效的圖片URL！");
        return;
    }
    
    const chat = state.chats[state.activeChatId];
    if (!chat.settings.aiAvatarLibrary) {
        chat.settings.aiAvatarLibrary = [];
    }

    chat.settings.aiAvatarLibrary.push({ name: name.trim(), url: url.trim() });
    await db.chats.put(chat);
    renderAiAvatarLibrary();
}

/**
 * 关闭AI头像库管理模态框
 */
function closeAiAvatarLibraryModal() {
    document.getElementById('ai-avatar-library-modal').classList.remove('visible');
}

// ▲▲▲ 新函数粘贴结束 ▲▲▲

// ▼▼▼ 请将这两个【新函数】粘贴到JS功能函数定义区 ▼▼▼

/**
 * 【全新】将保存的图标URL应用到主屏幕的App图标上
 */
function applyAppIcons() {
    if (!state.globalSettings.appIcons) return;

    for (const iconId in state.globalSettings.appIcons) {
        const imgElement = document.getElementById(`icon-img-${iconId}`);
        if (imgElement) {
            imgElement.src = state.globalSettings.appIcons[iconId];
        }
    }
}

/**
 * 【全新】在外观设置页面渲染出所有App图标的设置项
 */
function renderIconSettings() {
    const grid = document.getElementById('icon-settings-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const appLabels = {
        'world-book': '世界書',
        'qq': '訊息',
        'api-settings': 'API設置',
        'wallpaper': '壁紙',
        'font': '字體'
    };

    for (const iconId in state.globalSettings.appIcons) {
        const iconUrl = state.globalSettings.appIcons[iconId];
        const labelText = appLabels[iconId] || '未知App';

        const item = document.createElement('div');
        item.className = 'icon-setting-item';
        // 【重要】我们用 data-icon-id 来标记这个设置项对应哪个图标
        item.dataset.iconId = iconId; 

        item.innerHTML = `
            <img class="icon-preview" src="${iconUrl}" alt="${labelText}">
            <button class="change-icon-btn">更換</button>
        `;
        grid.appendChild(item);
    }
}
// ▲▲▲ 新函数粘贴结束 ▲▲▲

// ▼▼▼ 用这块【最终确认版】的代码，替换旧的 openBrowser 和 closeBrowser 函数 ▼▼▼

/**
 * 当用户点击链接卡片时，打开伪浏览器
 * @param {number} timestamp - 被点击消息的时间戳
 */
function openBrowser(timestamp) {
    if (!state.activeChatId) return;

    const chat = state.chats[state.activeChatId];
    // 安全检查，确保 chat 和 history 都存在
    if (!chat || !chat.history) return;

    const message = chat.history.find(m => m.timestamp === timestamp);
    if (!message || message.type !== 'share_link') {
        console.error("无法找到或消息类型不匹配的分享链接:", timestamp);
        return; // 如果找不到消息，就直接退出
    }

    // 填充浏览器内容
    document.getElementById('browser-title').textContent = message.source_name || '文章详情';
    const browserContent = document.getElementById('browser-content');
    browserContent.innerHTML = `
        <h1 class="article-title">${message.title || '无标题'}</h1>
        <div class="article-meta">
            <span>来源: ${message.source_name || '未知'}</span>
        </div>
        <div class="article-body">
            <p>${(message.content || '内容为空。').replace(/\n/g, '</p><p>')}</p>
        </div>
    `;

    // 显示浏览器屏幕
    showScreen('browser-screen');
}

/**
 * 关闭伪浏览器，返回聊天界面
 * (这个函数现在由 init() 中的事件监听器调用)
 */
function closeBrowser() {
    showScreen('chat-interface-screen'); 
}

// ▲▲▲ 替换结束 ▲▲▲

// ▼▼▼ 【全新】用户分享链接功能的核心函数 ▼▼▼

/**
 * 打开让用户填写链接信息的模态框
 */
function openShareLinkModal() {
    if (!state.activeChatId) return;

    // 清空上次输入的内容
    document.getElementById('link-title-input').value = '';
    document.getElementById('link-description-input').value = '';
    document.getElementById('link-source-input').value = '';
    document.getElementById('link-content-input').value = '';

    // 显示模态框
    document.getElementById('share-link-modal').classList.add('visible');
}

/**
 * 用户确认分享，创建并發送链接卡片消息
 */
async function sendUserLinkShare() {
    if (!state.activeChatId) return;

    const title = document.getElementById('link-title-input').value.trim();
    if (!title) {
        alert("标题是必填项哦！");
        return;
    }

    const description = document.getElementById('link-description-input').value.trim();
    const sourceName = document.getElementById('link-source-input').value.trim();
    const content = document.getElementById('link-content-input').value.trim();

    const chat = state.chats[state.activeChatId];
    
    // 创建消息对象
    const linkMessage = {
        role: 'user', // 角色是 'user'
        type: 'share_link',
        timestamp: Date.now(),
        title: title,
        description: description,
        source_name: sourceName,
        content: content,
        // 用户分享的链接，我们不提供图片，让它总是显示占位图
        thumbnail_url: null 
    };

    // 将消息添加到历史记录
    chat.history.push(linkMessage);
    await db.chats.put(chat);

    // 渲染新消息并更新列表
    appendMessage(linkMessage, chat);
    renderChatList();

    // 关闭模态框
    document.getElementById('share-link-modal').classList.remove('visible');
}

// ▲▲▲ 新函数粘贴结束 ▲▲▲

/**
 * 根据AI的视角，过滤出它能看到的动态
 * @param {Array} allPosts - 所有待检查的动态帖子
 * @param {object} viewerChat - 正在“看”动态的那个AI的chat对象
 * @returns {Array} - 过滤后该AI可见的动态帖子
 */
function filterVisiblePostsForAI(allPosts, viewerChat) {
    if (!viewerChat || !viewerChat.id) return []; // 安全检查

    const viewerGroupId = viewerChat.groupId; // 查看者所在的分组ID

    return allPosts.filter(post => {
        // 规则1：如果是用户发的动态
        if (post.authorId === 'user') {
            // 如果用户设置了“部分可见”
            if (post.visibleGroupIds && post.visibleGroupIds.length > 0) {
                // 只有当查看者AI的分组ID在用户的可见列表里时，才可见
                return viewerGroupId && post.visibleGroupIds.includes(viewerGroupId);
            }
            // 如果用户没设置，说明是公开的，所有AI都可见
            return true;
        }

        // 规则2：如果是其他AI发的动态
        const authorGroupId = post.authorGroupId; // 发帖AI所在的分组ID
        
        // 如果发帖的AI没有分组，那它的动态就是公开的
        if (!authorGroupId) {
            return true;
        }

        // 如果发帖的AI有分组，那么只有在同一个分组的AI才能看到
        return authorGroupId === viewerGroupId;
    });
}

/**
 * 应用指定的主题（'light' 或 'dark'）
 * @param {string} theme - 要应用的主题名称
 */
function applyTheme(theme) {
    const phoneScreen = document.getElementById('phone-screen');
    const toggleSwitch = document.getElementById('theme-toggle-switch');
    
    const isDark = theme === 'dark';
    
    phoneScreen.classList.toggle('dark-mode', isDark);
    
    // 如果开关存在，就同步它的状态
    if (toggleSwitch) {
        toggleSwitch.checked = isDark;
    }
    
    localStorage.setItem('ephone-theme', theme);
}

/**
 * 切换当前的主题
 */
function toggleTheme() {
    const toggleSwitch = document.getElementById('theme-toggle-switch');
    // 直接根据开关的选中状态来决定新主题
    const newTheme = toggleSwitch.checked ? 'dark' : 'light';
    applyTheme(newTheme);
}

// ▼▼▼ 请将这【一整块新函数】粘贴到你的JS功能函数定义区 ▼▼▼

function startReplyToMessage() {
    if (!activeMessageTimestamp) return;

    const chat = state.chats[state.activeChatId];
    const message = chat.history.find(m => m.timestamp === activeMessageTimestamp);
    if (!message) return;

    // 1. 【核心修正】同时获取“完整内容”和“预览片段”
    const fullContent = String(message.content || '');
    let previewSnippet = '';

    if (typeof message.content === 'string' && STICKER_REGEX.test(message.content)) {
        previewSnippet = '[表情]';
    } else if (message.type === 'ai_image' || message.type === 'user_photo') {
        previewSnippet = '[图片]';
    } else if (message.type === 'voice_message') {
        previewSnippet = '[语音]';
    } else {
        // 预览片段依然截断，但只用于UI显示
        previewSnippet = fullContent.substring(0, 50) + (fullContent.length > 50 ? '...' : '');
    }
    
    // 2. 【核心修正】将“完整内容”存入上下文，以备發送时使用
    currentReplyContext = {
        timestamp: message.timestamp,
        senderName: message.senderName || (message.role === 'user' ? (chat.settings.myNickname || '我') : chat.name),
        content: fullContent, // <--- 这里存的是完整的原文！
    };

    // 3. 【核心修正】仅在更新“回复预览栏”时，才使用“预览片段”
    const previewBar = document.getElementById('reply-preview-bar');
    previewBar.querySelector('.sender').textContent = `回复 ${currentReplyContext.senderName}:`;
    previewBar.querySelector('.text').textContent = previewSnippet; // <--- 这里用的是缩略版！
    previewBar.style.display = 'block';

    // 4. 后续操作保持不变
    hideMessageActions();
    document.getElementById('chat-input').focus();
}

/**
 * 【全新】取消引用模式
 */
function cancelReplyMode() {
    currentReplyContext = null;
    document.getElementById('reply-preview-bar').style.display = 'none';
}

// ▲▲▲ 新函数粘贴结束 ▲▲▲

// ▼▼▼ 【全新】用户处理转账的核心功能函数 ▼▼▼

let activeTransferTimestamp = null; // 用于暂存被点击的转账消息的时间戳

/**
 * 显示处理转账的操作菜单
 * @param {number} timestamp - 被点击的转账消息的时间戳
 */
function showTransferActionModal(timestamp) {
    activeTransferTimestamp = timestamp;

    const chat = state.chats[state.activeChatId];
    const message = chat.history.find(m => m.timestamp === timestamp);
    if (message) {
        // 将AI的名字填入弹窗
        document.getElementById('transfer-sender-name').textContent = message.senderName;
    }
    document.getElementById('transfer-actions-modal').classList.add('visible');
}

/**
 * 隐藏处理转账的操作菜单
 */
function hideTransferActionModal() {
    document.getElementById('transfer-actions-modal').classList.remove('visible');
    activeTransferTimestamp = null;
}

/**
 * 处理用户接受或拒绝转账的逻辑
 * @param {string} choice - 用户的选择, 'accepted' 或 'declined'
 */
async function handleUserTransferResponse(choice) {
    if (!activeTransferTimestamp) return;

    const timestamp = activeTransferTimestamp;
    const chat = state.chats[state.activeChatId];
    const messageIndex = chat.history.findIndex(m => m.timestamp === timestamp);
    if (messageIndex === -1) return;

    // 1. 更新原始转账消息的状态
    const originalMessage = chat.history[messageIndex];
    originalMessage.status = choice;

    let systemContent;

    // 2. 如果用户选择“拒绝”
    if (choice === 'declined') {
        // 立刻在前端生成一个“退款”卡片，让用户看到
        const refundMessage = {
            role: 'user',
            type: 'transfer',
            isRefund: true, // 这是一个关键标记，用于UI显示这是退款
            amount: originalMessage.amount,
            note: '已拒收对方转账',
            timestamp: Date.now()
        };
        chat.history.push(refundMessage);
        
        // 准备一条对AI可见的隐藏消息，告诉它发生了什么
        systemContent = `[系统提示：你拒绝并退还了“${originalMessage.senderName}”的转账。]`;
    } else { // 如果用户选择“接受”
        // 只需准备隐藏消息通知AI即可
        systemContent = `[系统提示：你接受了“${originalMessage.senderName}”的转账。]`;
    }

    // 3. 创建这条对用户隐藏、但对AI可见的系统消息
    const hiddenMessage = {
        role: 'system',
        content: systemContent,
        timestamp: Date.now() + 1, // 保证时间戳在退款消息之后
        isHidden: true // 这个标记会让它不在聊天界面显示
    };
    chat.history.push(hiddenMessage);

    // 4. 保存所有更改到数据库，并刷新界面
    await db.chats.put(chat);
    hideTransferActionModal(); 
    renderChatInterface(state.activeChatId);
    renderChatList();
}

// ▲▲▲ 新函数粘贴结束 ▲▲▲

// ▼▼▼ 【全新】通话记录功能核心函数 ▼▼▼

async function renderCallHistoryScreen() {
    showScreen('call-history-screen'); // <--【核心修正】把它移动到最前面！

    const listEl = document.getElementById('call-history-list');
    const titleEl = document.getElementById('call-history-title');
    listEl.innerHTML = '';
    titleEl.textContent = '所有通话记录';
    
    const records = await db.callRecords.orderBy('timestamp').reverse().toArray();
    
    if (records.length === 0) {
        listEl.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 50px 0;">这里还没有通话记录哦~</p>';
        return; // 现在的 return 就没问题了，因为它只跳过了后续的渲染逻辑
    }
    
    records.forEach(record => {
        const card = createCallRecordCard(record);

    addLongPressListener(card, async () => {
        // 1. 弹出输入框，并将旧名称作为默认值，方便修改
        const newName = await showCustomPrompt(
            "自定义通话名称", 
            "请输入新的名称（留空则恢复默认）",
            record.customName || '' // 如果已有自定义名称，就显示它
        );

        // 2. 如果用户点击了“取消”，则什么都不做
        if (newName === null) return;
        
        // 3. 更新数据库中的这条记录
        await db.callRecords.update(record.id, { customName: newName.trim() });
        
        // 4. 刷新整个列表，让更改立刻显示出来
        await renderCallHistoryScreen();
        
        // 5. 给用户一个成功的提示
        await showCustomAlert('成功', '通话名称已更新！');
    });
        listEl.appendChild(card);
    });    
}

// ▼▼▼ 用这个【升级版】函数，完整替换你旧的 createCallRecordCard 函数 ▼▼▼
/**
 * 【升级版】根据单条记录数据，创建一张能显示聊天对象的通话卡片
 * @param {object} record - 一条通话记录对象
 * @returns {HTMLElement} - 创建好的卡片div
 */
function createCallRecordCard(record) {
    const card = document.createElement('div');
    card.className = 'call-record-card';
    card.dataset.recordId = record.id; 

    // 获取通话对象的名字
    const chatInfo = state.chats[record.chatId];
    const chatName = chatInfo ? chatInfo.name : '未知会话';

    const callDate = new Date(record.timestamp);
    const dateString = `${callDate.getFullYear()}-${String(callDate.getMonth() + 1).padStart(2, '0')}-${String(callDate.getDate()).padStart(2, '0')} ${String(callDate.getHours()).padStart(2, '0')}:${String(callDate.getMinutes()).padStart(2, '0')}`;
    const durationText = `${Math.floor(record.duration / 60)}分${record.duration % 60}秒`;

    const avatarsHtml = record.participants.map(p => 
        `<img src="${p.avatar}" alt="${p.name}" class="participant-avatar" title="${p.name}">`
    ).join('');
    
    card.innerHTML = `
        <div class="card-header">
            <span class="date">${dateString}</span>
            <span class="duration">${durationText}</span>
        </div>
        <div class="card-body">
            <!-- 【核心修改】在这里新增一个标题行 -->
            ${record.customName ? `<div class="custom-title">${record.customName}</div>` : ''}
            
            <div class="participants-info"> <!-- 新增一个容器方便布局 -->
                <div class="participants-avatars">${avatarsHtml}</div>
                <span class="participants-names">与 ${chatName}</span>
            </div>
        </div>
    `;
    return card;
}
// ▲▲▲ 替换结束 ▲▲▲

/**
 * 显示指定通话记录的完整文字稿
 * @param {number} recordId - 通话记录的ID
 */
async function showCallTranscript(recordId) {
    const record = await db.callRecords.get(recordId);
    if (!record) return;

    const modal = document.getElementById('call-transcript-modal');
    const titleEl = document.getElementById('transcript-modal-title');
    const bodyEl = document.getElementById('transcript-modal-body');

    titleEl.textContent = `通话于 ${new Date(record.timestamp).toLocaleString()} (时长: ${Math.floor(record.duration / 60)}分${record.duration % 60}秒)`;
    bodyEl.innerHTML = '';
    
    if (!record.transcript || record.transcript.length === 0) {
        bodyEl.innerHTML = '<p style="text-align:center; color: #8a8a8a;">這次通話沒有留下文字記錄。</p>';
    } else {
        record.transcript.forEach(entry => {
            const bubble = document.createElement('div');
            // 根据角色添加不同的class，应用不同的样式
            bubble.className = `transcript-entry ${entry.role}`; 
            bubble.textContent = entry.content;
            bodyEl.appendChild(bubble);
        });
    }

    const deleteBtn = document.getElementById('delete-transcript-btn');
    
    // 【重要】使用克隆节点技巧，防止事件重复绑定
    const newDeleteBtn = deleteBtn.cloneNode(true);
    deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
    
    // 为新的、干净的按钮绑定事件
    newDeleteBtn.addEventListener('click', async () => {
        const confirmed = await showCustomConfirm(
            "確認刪除",
            "確定要永久刪除這條通話記錄嗎？此操作不可恢復。",
            { confirmButtonClass: 'btn-danger' }
        );

        if (confirmed) {
            // 1. 关闭当前的详情弹窗
            modal.classList.remove('visible');
            
            // 2. 从数据库删除
            await db.callRecords.delete(recordId);
            
            // 3. 刷新通话记录列表
            await renderCallHistoryScreen();
            
            // 4. (可选) 给出成功提示
            alert('通話記錄已刪除。');
        }
    });
    modal.classList.add('visible');
}

// ▲▲▲ 新函数粘贴结束 ▲▲▲

// ▼▼▼ 请用这个【全新函数】替换掉你旧的 handleStatusResetClick 函数 ▼▼▼

/**
 * 【全新】处理用户点击状态栏，弹出编辑框让用户修改AI的当前状态
 */
async function handleEditStatusClick() {
    // 1. 安全检查，确保在单聊界面
    if (!state.activeChatId || state.chats[state.activeChatId].isGroup) {
        return; 
    }
    const chat = state.chats[state.activeChatId];

    // 2. 弹出输入框，让用户输入新的状态，并将当前状态作为默认值
    const newStatusText = await showCustomPrompt(
        '編輯對方狀態',
        '請輸入對方現在的新狀態：',
        chat.status.text // 将当前状态作为输入框的默认内容
    );

    // 3. 如果用户输入了内容并点击了“確定”
    if (newStatusText !== null) {
        // 4. 更新内存和数据库中的状态数据
        chat.status.text = newStatusText.trim() || '在線'; // 如果用户清空了，就默认为“在线”
        chat.status.isBusy = false; // 每次手动编辑都默认其不处于“忙碌”状态
        chat.status.lastUpdate = Date.now();
        await db.chats.put(chat);

        // 5. 立刻刷新UI，让用户看到修改后的状态
        renderChatInterface(state.activeChatId);
        renderChatList();
        
        // 6. 给出一个无伤大雅的成功提示
        await showCustomAlert('狀態已更新', `“${chat.name}”的當前狀態已更新為：${chat.status.text}`);
    }
}

// 放在你的JS功能函數定義區
async function openShareTargetPicker() {
    const modal = document.getElementById('share-target-modal');
    const listEl = document.getElementById('share-target-list');
    listEl.innerHTML = '';

    // 获取所有聊天作为分享目标
    const chats = Object.values(state.chats);

    chats.forEach(chat => {
        // 复用联系人选择器的样式
        const item = document.createElement('div');
        item.className = 'contact-picker-item'; 
        item.innerHTML = `
            <input type="checkbox" class="share-target-checkbox" data-chat-id="${chat.id}" style="margin-right: 15px;">
            <img src="${chat.isGroup ? chat.settings.groupAvatar : chat.settings.aiAvatar || defaultAvatar}" class="avatar">
            <span class="name">${chat.name}</span>
        `;
        listEl.appendChild(item);
    });
    
    modal.classList.add('visible');
}

function closeMusicPlayerWithAnimation(callback) {
    const overlay = document.getElementById('music-player-overlay');
    if (!overlay.classList.contains('visible')) {
        if (callback) callback();
        return;
    }
    overlay.classList.remove('visible');
    setTimeout(() => {
        document.getElementById('music-playlist-panel').classList.remove('visible');
        if (callback) callback();
    }, 400); 
}

function parseLRC(lrcContent) {
    if (!lrcContent) return [];
    const lines = lrcContent.split('\n');
    const lyrics = [];
    const timeRegex = /\[(\d{2}):(\d{2})[.:](\d{2,3})\]/g;

    for (const line of lines) {
        const text = line.replace(timeRegex, '').trim();
        if (!text) continue;
        timeRegex.lastIndex = 0;
        let match;
        while ((match = timeRegex.exec(line)) !== null) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
            const time = minutes * 60 + seconds + milliseconds / 1000;
            lyrics.push({ time, text });
        }
    }
    return lyrics.sort((a, b) => a.time - b.time);
}

function renderLyrics() {
    const lyricsList = document.getElementById('music-lyrics-list');
    lyricsList.innerHTML = '';
    if (!musicState.parsedLyrics || musicState.parsedLyrics.length === 0) {
        lyricsList.innerHTML = '<div class="lyric-line">♪ 暫無歌詞 ♪</div>';
        return;
    }
    musicState.parsedLyrics.forEach((line, index) => {
        const lineEl = document.createElement('div');
        lineEl.className = 'lyric-line';
        lineEl.textContent = line.text;
        lineEl.dataset.index = index;
        lyricsList.appendChild(lineEl);
    });
    lyricsList.style.transform = `translateY(0px)`;
}

function updateActiveLyric(currentTime) {
    if (musicState.parsedLyrics.length === 0) return;
    let newLyricIndex = -1;
    for (let i = 0; i < musicState.parsedLyrics.length; i++) {
        if (currentTime >= musicState.parsedLyrics[i].time) {
            newLyricIndex = i;
        } else {
            break;
        }
    }
    if (newLyricIndex === musicState.currentLyricIndex) return;
    musicState.currentLyricIndex = newLyricIndex;
    updateLyricsUI();
}

function updateLyricsUI() {
    const lyricsList = document.getElementById('music-lyrics-list');
    const container = document.getElementById('music-lyrics-container');
    const lines = lyricsList.querySelectorAll('.lyric-line');
    lines.forEach(line => line.classList.remove('active'));
    if (musicState.currentLyricIndex === -1) {
        lyricsList.style.transform = `translateY(0px)`;
        return;
    }
    const activeLine = lyricsList.querySelector(`.lyric-line[data-index="${musicState.currentLyricIndex}"]`);
    if (activeLine) {
        activeLine.classList.add('active');
        const containerHeight = container.offsetHeight;
        const offset = (containerHeight / 3) - activeLine.offsetTop - (activeLine.offsetHeight / 2);
        lyricsList.style.transform = `translateY(${offset}px)`;
    }
}

function formatMusicTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function updateMusicProgressBar() {
    const currentTimeEl = document.getElementById('music-current-time');
    const totalTimeEl = document.getElementById('music-total-time');
    const progressFillEl = document.getElementById('music-progress-fill');
    if (!audioPlayer.duration) {
        currentTimeEl.textContent = "0:00";
        totalTimeEl.textContent = "0:00";
        progressFillEl.style.width = '0%';
        return;
    }
    const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressFillEl.style.width = `${progressPercent}%`;
    currentTimeEl.textContent = formatMusicTime(audioPlayer.currentTime);
    totalTimeEl.textContent = formatMusicTime(audioPlayer.duration);
    updateActiveLyric(audioPlayer.currentTime);
}

/**
 * 【全新】处理用户点击“撤回”按钮的入口函数
 */
async function handleRecallClick() {
    if (!activeMessageTimestamp) return;

    const RECALL_TIME_LIMIT_MS = 2 * 60 * 1000; // 设置2分钟的撤回时限
    const messageTime = activeMessageTimestamp;
    const now = Date.now();

    // 检查是否超过了撤回时限
    if (now - messageTime > RECALL_TIME_LIMIT_MS) {
        hideMessageActions();
        await showCustomAlert('操作失敗', '該消息發送已超過2分鐘，無法撤回。');
        return;
    }
    
    // 如果在时限内，执行真正的撤回逻辑
    await recallMessage(messageTime, true);
    hideMessageActions();
}

/**
 * 【全新】消息撤回的核心逻辑
 * @param {number} timestamp - 要撤回的消息的时间戳
 * @param {boolean} isUserRecall - 是否是用户主动撤回
 */
async function recallMessage(timestamp, isUserRecall) {
    const chat = state.chats[state.activeChatId];
    if (!chat) return;

    const messageIndex = chat.history.findIndex(m => m.timestamp === timestamp);
    if (messageIndex === -1) return;

    const messageToRecall = chat.history[messageIndex];

    // 1. 修改消息对象，将其变为“已撤回”状态
    const recalledData = {
        originalType: messageToRecall.type || 'text',
        originalContent: messageToRecall.content,
        // 保存其他可能存在的原始数据
        originalMeaning: messageToRecall.meaning,
        originalQuote: messageToRecall.quote 
    };
    
    messageToRecall.type = 'recalled_message';
    messageToRecall.content = isUserRecall ? '你撤回了一條訊息' : '對方撤回了一條訊息';
    messageToRecall.recalledData = recalledData;
    // 清理掉不再需要的旧属性
    delete messageToRecall.meaning;
    delete messageToRecall.quote;

    // 2. 如果是用户撤回，需要给AI發送一条它看不懂内容的隐藏提示
    if (isUserRecall) {
        const hiddenMessageForAI = {
            role: 'system',
            content: `[系統提示：用戶撤回了一條消息。你不知道內容是什麼，只需知道這個事件即可。]`,
            timestamp: Date.now(),
            isHidden: true
        };
        chat.history.push(hiddenMessageForAI);
    }

    // 3. 保存到数据库并刷新UI
    await db.chats.put(chat);
    renderChatInterface(state.activeChatId);
    if(isUserRecall) renderChatList(); // 用户撤回时，最后一条消息变了，需要刷新列表
}

// ▼▼▼ 【全新】将这些函数粘贴到你的JS功能函数定义区 ▼▼▼

/**
 * 打开分类管理模态框
 */
async function openCategoryManager() {
    await renderCategoryListInManager();
    document.getElementById('world-book-category-manager-modal').classList.add('visible');
}

/**
 * 在模态框中渲染已存在的分类列表
 */
async function renderCategoryListInManager() {
    const listEl = document.getElementById('existing-categories-list');
    const categories = await db.worldBookCategories.toArray();
    listEl.innerHTML = '';
    if (categories.length === 0) {
        listEl.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">還沒有任何分類</p>';
    }
    categories.forEach(cat => {
        // 复用好友分组的样式
        const item = document.createElement('div');
        item.className = 'existing-group-item'; 
        item.innerHTML = `
            <span class="group-name">${cat.name}</span>
            <span class="delete-group-btn" data-id="${cat.id}">×</span>
        `;
        listEl.appendChild(item);
    });
}

/**
 * 添加一个新的世界書分类
 */
async function addNewCategory() {
    const input = document.getElementById('new-category-name-input');
    const name = input.value.trim();
    if (!name) {
        alert('分類名不能為空！');
        return;
    }
    const existing = await db.worldBookCategories.where('name').equals(name).first();
    if (existing) {
        alert(`分類 "${name}" 已經存在了！`);
        return;
    }
    await db.worldBookCategories.add({ name });
    input.value = '';
    await renderCategoryListInManager();
}

/**
 * 删除一个世界書分类
 * @param {number} categoryId - 要删除的分类的ID
 */
async function deleteCategory(categoryId) {
    const confirmed = await showCustomConfirm(
        '確認刪除', 
        '刪除分類後，該分類下的所有世界書將變為“未分類”。確定要刪除嗎？', 
        { confirmButtonClass: 'btn-danger' }
    );
    if (confirmed) {
        await db.worldBookCategories.delete(categoryId);
        // 将属于该分类的世界書的 categoryId 设为 null
        const booksToUpdate = await db.worldBooks.where('categoryId').equals(categoryId).toArray();
        for (const book of booksToUpdate) {
            book.categoryId = null;
            await db.worldBooks.put(book);
            const bookInState = state.worldBooks.find(wb => wb.id === book.id);
            if(bookInState) bookInState.categoryId = null;
        }
        await renderCategoryListInManager();
    }
}

// ▲▲▲ 新函数粘贴结束 ▲▲▲

        // ===================================================================
        // 4. 初始化函数 init()
        // ===================================================================
        async function init() {

    // ▼▼▼ 在 init() 函数的【最开头】，粘贴下面这两行代码 ▼▼▼
    const savedTheme = localStorage.getItem('ephone-theme') || 'light'; // 默认为日间模式
    applyTheme(savedTheme);
    // ▲▲▲ 粘贴结束 ▲▲▲

    // ▼▼▼ 新增代码 ▼▼▼
    const customBubbleStyleTag = document.createElement('style');
    customBubbleStyleTag.id = 'custom-bubble-style';
    document.head.appendChild(customBubbleStyleTag);
    // ▲▲▲ 新增结束 ▲▲▲

    // ▼▼▼ 新增代码 ▼▼▼
    const previewBubbleStyleTag = document.createElement('style');
    previewBubbleStyleTag.id = 'preview-bubble-style';
    document.head.appendChild(previewBubbleStyleTag);
    // ▲▲▲ 新增结束 ▲▲▲


    // ▼▼▼ 修改这两行 ▼▼▼
    applyScopedCss('', '#chat-messages', 'custom-bubble-style'); // 清除真实聊天界面的自定义样式
    applyScopedCss('', '#settings-preview-area', 'preview-bubble-style'); // 清除预览区的自定义样式
    // ▲▲▲ 修改结束 ▲▲▲

            window.showScreen = showScreen;
            window.renderChatListProxy = renderChatList;
            window.renderApiSettingsProxy = renderApiSettings;
            window.renderWallpaperScreenProxy = renderWallpaperScreen;
            window.renderWorldBookScreenProxy = renderWorldBookScreen;

            await loadAllDataFromDB();

            // 初始化未读动态计数
            const storedCount = parseInt(localStorage.getItem('unreadPostsCount')) || 0;
            updateUnreadIndicator(storedCount);
            
            // ▲▲▲ 代码添加结束 ▲▲▲

            if (state.globalSettings && state.globalSettings.fontUrl) {
                applyCustomFont(state.globalSettings.fontUrl);
            }

            updateClock();
            setInterval(updateClock, 1000 * 30);
            applyGlobalWallpaper();           

isIOS();

applyAppIcons();

            // ==========================================================
            // --- 各种事件监听器 ---
            // ==========================================================

            document.getElementById('custom-modal-cancel').addEventListener('click', hideCustomModal);
            document.getElementById('custom-modal-overlay').addEventListener('click', (e) => { if (e.target === modalOverlay) hideCustomModal(); });
            document.getElementById('export-data-btn').addEventListener('click', exportBackup);
            document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-data-input').click());
            document.getElementById('import-data-input').addEventListener('change', e => importBackup(e.target.files[0]));
            document.getElementById('back-to-list-btn').addEventListener('click', () => { 

    // ▼▼▼ 修改这两行 ▼▼▼
    applyScopedCss('', '#chat-messages', 'custom-bubble-style'); // 清除真实聊天界面的自定义样式
    applyScopedCss('', '#settings-preview-area', 'preview-bubble-style'); // 清除预览区的自定义样式
    // ▲▲▲ 修改结束 ▲▲▲

exitSelectionMode(); state.activeChatId = null; showScreen('chat-list-screen'); });
            
            document.getElementById('add-chat-btn').addEventListener('click', async () => { const name = await showCustomPrompt('建立新聊天', '請輸入Ta的名字'); if (name && name.trim()) { const newChatId = 'chat_' + Date.now(); 
const newChat = { 
    id: newChatId, 
    name: name.trim(), 
    isGroup: false,                         relationship: {
                            status: 'friend', // 'friend', 'blocked_by_user', 'pending_user_approval'
                            blockedTimestamp: null,
                            applicationReason: ''
                        },
                        status: {
                            text: '在線',
                            lastUpdate: Date.now(),
                            isBusy: false 
                        },
    settings: { 
        aiPersona: '你是誰呀。', 
        myPersona: '我是誰呀。', 
        maxMemory: 10, 
        aiAvatar: defaultAvatar, 
        myAvatar: defaultAvatar, 
        background: '', 
        theme: 'default', 
    fontSize: 13, 
    customCss: '', // <--- 新增这行
    linkedWorldBookIds: [], 
    aiAvatarLibrary: [],
    }, 
    history: [], 
    musicData: { totalTime: 0 } 
};
state.chats[newChatId] = newChat; await db.chats.put(newChat); renderChatList(); } });

            // ▼▼▼ 【修正】创建群聊按钮现在打开联系人选择器 ▼▼▼
document.getElementById('add-group-chat-btn').addEventListener('click', openContactPickerForGroupCreate);
// ▲▲▲ 替换结束 ▲▲▲                      
            document.getElementById('transfer-cancel-btn').addEventListener('click', () => document.getElementById('transfer-modal').classList.remove('visible'));
            document.getElementById('transfer-confirm-btn').addEventListener('click', sendUserTransfer);

            document.getElementById('listen-together-btn').addEventListener('click', handleListenTogetherClick);
            document.getElementById('music-exit-btn').addEventListener('click', () => endListenTogetherSession(true));
            document.getElementById('music-return-btn').addEventListener('click', returnToChat);
            document.getElementById('music-play-pause-btn').addEventListener('click', togglePlayPause);
            document.getElementById('music-next-btn').addEventListener('click', playNext);
            document.getElementById('music-prev-btn').addEventListener('click', playPrev);
            document.getElementById('music-mode-btn').addEventListener('click', changePlayMode);
            document.getElementById('music-playlist-btn').addEventListener('click', () => { updatePlaylistUI(); document.getElementById('music-playlist-panel').classList.add('visible'); });
            document.getElementById('close-playlist-btn').addEventListener('click', () => document.getElementById('music-playlist-panel').classList.remove('visible'));
            document.getElementById('add-song-url-btn').addEventListener('click', addSongFromURL);
            document.getElementById('add-song-local-btn').addEventListener('click', () => document.getElementById('local-song-upload-input').click());
            document.getElementById('local-song-upload-input').addEventListener('change', addSongFromLocal);
            audioPlayer.addEventListener('ended', playNext);
            audioPlayer.addEventListener('pause', () => { if(musicState.isActive) { musicState.isPlaying = false; updatePlayerUI(); } });
            audioPlayer.addEventListener('play', () => { if(musicState.isActive) { musicState.isPlaying = true; updatePlayerUI(); } });

            const chatInput = document.getElementById('chat-input');
            // ▼▼▼ 找到 id="send-btn" 的 click 事件监听器 ▼▼▼
document.getElementById('send-btn').addEventListener('click', async () => { 
    const content = chatInput.value.trim(); 
    if (!content || !state.activeChatId) return; 
    
    const chat = state.chats[state.activeChatId]; 
    
    // --- 【核心修改】在这里添加 ---
    const msg = { 
        role: 'user', 
        content, 
        timestamp: Date.now() 
    };

    // 检查当前是否处于引用回复模式
    if (currentReplyContext) {
        msg.quote = currentReplyContext; // 将引用信息附加到消息对象上
    }
    // --- 【修改结束】 ---
    
    chat.history.push(msg); 
    await db.chats.put(chat); 
    appendMessage(msg, chat); 
    renderChatList(); 
    chatInput.value = ''; 
    chatInput.style.height = 'auto'; 
    chatInput.focus(); 
    
    // --- 【核心修改】發送后，取消引用模式 ---
    cancelReplyMode(); 
});
            document.getElementById('wait-reply-btn').addEventListener('click', triggerAiResponse);
            chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('send-btn').click(); } });
            chatInput.addEventListener('input', () => { chatInput.style.height = 'auto'; chatInput.style.height = (chatInput.scrollHeight) + 'px'; });

            document.getElementById('wallpaper-upload-input').addEventListener('change', async (event) => { const file = event.target.files[0]; if(file) { const dataUrl = await new Promise((res, rej) => { const reader = new FileReader(); reader.onload = () => res(reader.result); reader.onerror = () => rej(reader.error); reader.readAsDataURL(file); }); newWallpaperBase64 = dataUrl; renderWallpaperScreen(); } });
            // ▼▼▼ 用这整块代码，替换旧的 save-wallpaper-btn 事件监听器 ▼▼▼
document.getElementById('save-wallpaper-btn').addEventListener('click', async () => {
    let changesMade = false;

    // 保存壁纸
    if (newWallpaperBase64) {
        state.globalSettings.wallpaper = newWallpaperBase64;
        changesMade = true;
    }

    // 【核心修改】保存图标设置（它已经在内存中了，我们只需要把整个globalSettings存起来）
    await db.globalSettings.put(state.globalSettings);

    // 应用所有更改
    if (changesMade) {
        applyGlobalWallpaper();
        newWallpaperBase64 = null;
    }
    applyAppIcons(); // 重新应用所有图标

    alert('外觀設置已保存並應用！');
    showScreen('home-screen');
});
// ▲▲▲ 替换结束 ▲▲▲
            document.getElementById('save-api-settings-btn').addEventListener('click', async () => { state.apiConfig.proxyUrl = document.getElementById('proxy-url').value.trim(); state.apiConfig.apiKey = document.getElementById('api-key').value.trim(); state.apiConfig.model = document.getElementById('model-select').value; await db.apiConfig.put(state.apiConfig); 

// 在 'save-api-settings-btn' 的 click 事件监听器内部
// await db.apiConfig.put(state.apiConfig); 这行之后

// ▼▼▼ 将之前那段保存后台活动设置的逻辑，替换为下面这个增强版 ▼▼▼

const backgroundSwitch = document.getElementById('background-activity-switch');
const intervalInput = document.getElementById('background-interval-input');
const newEnableState = backgroundSwitch.checked;
const oldEnableState = state.globalSettings.enableBackgroundActivity || false;

// 只有在用户“从关到开”时，才弹出警告
if (newEnableState && !oldEnableState) {
    const userConfirmed = confirm(
        "【高費用警告】\n\n" +
        "您正在啟用“後台角色活動”功能。\n\n" +
        "這會使您的AI角色們在您不和他們聊天時，也能“獨立思考”並主動給您發消息或進行社交互動，極大地增強沉浸感。\n\n" +
        "但請注意：\n" +
        "這會【在後台自動、定期地調用API】，即使您不進行任何操作。根據您的角色數量和檢測間隔，這可能會導致您的API費用顯著增加。\n\n" +
        "您確定要開啟嗎？"
    );

    if (!userConfirmed) {
        backgroundSwitch.checked = false; // 用户取消，把开关拨回去
        return; // 阻止后续逻辑
    }
}

state.globalSettings.enableBackgroundActivity = newEnableState;
state.globalSettings.backgroundActivityInterval = parseInt(intervalInput.value) || 60;
state.globalSettings.blockCooldownHours = parseFloat(document.getElementById('block-cooldown-input').value) || 1;
await db.globalSettings.put(state.globalSettings);

// 动态启动或停止模拟器
stopBackgroundSimulation();
if (state.globalSettings.enableBackgroundActivity) {
    startBackgroundSimulation();
    console.log(`後台活動模擬已啟動，間隔: ${state.globalSettings.backgroundActivityInterval}秒`);
} else {
    console.log("後台活動模擬已停止。");
}
// ▲▲▲ 替换结束 ▲▲▲

alert('API設置已保存!'); });

                    // gemini 密钥聚焦的时候显示明文
        const ApiKeyInput = document.getElementById('api-key')
        ApiKeyInput.addEventListener('focus', (e) => {
            e.target.setAttribute('type', 'text')
        })
        ApiKeyInput.addEventListener('blur', (e) => {
            e.target.setAttribute('type', 'password')
        })


        document.getElementById('fetch-models-btn').addEventListener('click', async () => {
            const url = document.getElementById('proxy-url').value.trim();
            const key = document.getElementById('api-key').value.trim();
            if (!url || !key) return alert('請先填寫反代地址和金鑰');
            try {

                let  isGemini = url === GEMINI_API_URL;
                const response = await fetch(isGemini ? `${GEMINI_API_URL}?key=${getRandomValue(key)}` : `${url}/v1/models`,isGemini ? undefined : {headers: {'Authorization': `Bearer ${key}`}});
                if (!response.ok) throw new Error('無法獲取模型列表');
                const data = await response.json();
                let models = isGemini ? data.models : data.data;
                if(isGemini){
                    models = models.map((model)=>{
                        const parts = model.name.split('/');
                        return {
                            id:parts.length > 1 ? parts[1] : model.name
                        }
                    })
                }
                const modelSelect = document.getElementById('model-select');
                modelSelect.innerHTML = '';
                models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.id;
                    option.textContent = model.id;
                    if (model.id === state.apiConfig.model) option.selected = true;
                    modelSelect.appendChild(option);
                });
                alert('模型列表已更新');
            } catch (error) {
                alert(`拉取模型失敗: ${error.message}`);
            }
        });
            document.getElementById('add-world-book-btn').addEventListener('click', async () => { const name = await showCustomPrompt('創建世界書', '請輸入書名'); if (name && name.trim()) { const newBook = { id: 'wb_' + Date.now(), name: name.trim(), content: '' }; await db.worldBooks.add(newBook); state.worldBooks.push(newBook); renderWorldBookScreen(); openWorldBookEditor(newBook.id); } });
            document.getElementById('save-world-book-btn').addEventListener('click', async () => { if (!editingWorldBookId) return; const book = state.worldBooks.find(wb => wb.id === editingWorldBookId); if (book) { const newName = document.getElementById('world-book-name-input').value.trim(); if (!newName) { alert('書名不能為空！'); return; } book.name = newName; book.content = document.getElementById('world-book-content-input').value;

        // ▼▼▼ 【核心修改】在这里保存分类ID ▼▼▼
        const categoryId = document.getElementById('world-book-category-select').value;
        // 如果选择了“未分类”，存入 null；否则存入数字ID
        book.categoryId = categoryId ? parseInt(categoryId) : null; 
        // ▲▲▲ 修改结束 ▲▲▲

await db.worldBooks.put(book); document.getElementById('world-book-editor-title').textContent = newName; editingWorldBookId = null; renderWorldBookScreen(); showScreen('world-book-screen'); } });
            document.getElementById('chat-messages').addEventListener('click', (e) => { const aiImage = e.target.closest('.ai-generated-image'); if (aiImage) { const description = aiImage.dataset.description; if (description) showCustomAlert('照片描述', description); return; }  });
            
            const chatSettingsModal = document.getElementById('chat-settings-modal');
            const worldBookSelectBox = document.querySelector('.custom-multiselect .select-box');
            const worldBookCheckboxesContainer = document.getElementById('world-book-checkboxes-container');

function updateWorldBookSelectionDisplay() { const checkedBoxes = worldBookCheckboxesContainer.querySelectorAll('input:checked'); const displayText = document.querySelector('.selected-options-text'); if (checkedBoxes.length === 0) { displayText.textContent = '-- 點擊選擇 --'; } else if (checkedBoxes.length > 2) { displayText.textContent = `已選擇 ${checkedBoxes.length} 項`; } else { displayText.textContent = Array.from(checkedBoxes).map(cb => cb.parentElement.textContent.trim()).join(', '); } }

            worldBookSelectBox.addEventListener('click', (e) => { e.stopPropagation(); worldBookCheckboxesContainer.classList.toggle('visible'); worldBookSelectBox.classList.toggle('expanded'); });
            document.getElementById('world-book-checkboxes-container').addEventListener('change', updateWorldBookSelectionDisplay);
            window.addEventListener('click', (e) => { if (!document.querySelector('.custom-multiselect').contains(e.target)) { worldBookCheckboxesContainer.classList.remove('visible'); worldBookSelectBox.classList.remove('expanded'); } });

// ▼▼▼ 请用这段【完整、全新的代码】替换旧的 chat-settings-btn 点击事件 ▼▼▼
document.getElementById('chat-settings-btn').addEventListener('click', async () => {
    if (!state.activeChatId) return;
    const chat = state.chats[state.activeChatId];
    const isGroup = chat.isGroup;

    // --- 统一显示/隐藏控件 ---
    document.getElementById('chat-name-group').style.display = 'block';
    document.getElementById('my-persona-group').style.display = 'block';
    document.getElementById('my-avatar-group').style.display = 'block';
    document.getElementById('my-group-nickname-group').style.display = isGroup ? 'block' : 'none';
    document.getElementById('group-avatar-group').style.display = isGroup ? 'block' : 'none';
    document.getElementById('group-members-group').style.display = isGroup ? 'block' : 'none';
    document.getElementById('ai-persona-group').style.display = isGroup ? 'none' : 'block';
    document.getElementById('ai-avatar-group').style.display = isGroup ? 'none' : 'block';
    
    // 【核心修改1】根据是否为群聊，显示或隐藏“好友分组”区域
    document.getElementById('assign-group-section').style.display = isGroup ? 'none' : 'block';
    
    // --- 加载表单数据 ---
    document.getElementById('chat-name-input').value = chat.name;
    document.getElementById('my-persona').value = chat.settings.myPersona;
    document.getElementById('my-avatar-preview').src = chat.settings.myAvatar || (isGroup ? defaultMyGroupAvatar : defaultAvatar);
    document.getElementById('max-memory').value = chat.settings.maxMemory;
    const bgPreview = document.getElementById('bg-preview');
    const removeBgBtn = document.getElementById('remove-bg-btn');
    if (chat.settings.background) {
        bgPreview.src = chat.settings.background;
        bgPreview.style.display = 'block';
        removeBgBtn.style.display = 'inline-block';
    } else {
        bgPreview.style.display = 'none';
        removeBgBtn.style.display = 'none';
    }

    if (isGroup) {
        document.getElementById('my-group-nickname-input').value = chat.settings.myNickname || '';
        document.getElementById('group-avatar-preview').src = chat.settings.groupAvatar || defaultGroupAvatar;
        renderGroupMemberSettings(chat.members);
    } else {
        document.getElementById('ai-persona').value = chat.settings.aiPersona;
        document.getElementById('ai-avatar-preview').src = chat.settings.aiAvatar || defaultAvatar;
        
        // 【核心修改2】如果是单聊，就加载分组列表到下拉框
        const select = document.getElementById('assign-group-select');
        select.innerHTML = '<option value="">未分組</option>'; // 清空并设置默认选项
        const groups = await db.qzoneGroups.toArray();
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name;
            // 如果当前好友已经有分组，就默认选中它
            if (chat.groupId === group.id) {
                option.selected = true;
            }
            select.appendChild(option);
        }); 
    }
    
    // 加载世界書
// ▼▼▼ 用下面这段【全新逻辑】替换掉原来简单的 forEach 循环 ▼▼▼

const worldBookCheckboxesContainer = document.getElementById('world-book-checkboxes-container');
worldBookCheckboxesContainer.innerHTML = '';
const linkedIds = new Set(chat.settings.linkedWorldBookIds || []);

// 1. 获取所有分类和世界書
const categories = await db.worldBookCategories.toArray();
const books = state.worldBooks;

// 【核心改造】如果存在未分类的书籍，就创建一个“虚拟分类”
const hasUncategorized = books.some(book => !book.categoryId);
if (hasUncategorized) {
    categories.push({ id: 'uncategorized', name: '未分類' });
}

// 2. 将书籍按分类ID进行分组
const booksByCategoryId = books.reduce((acc, book) => {
    const categoryId = book.categoryId || 'uncategorized';
    if (!acc[categoryId]) {
        acc[categoryId] = [];
    }
    acc[categoryId].push(book);
    return acc;
}, {});

// 3. 遍历分类，创建带折叠功能的列表
categories.forEach(category => {
    const booksInCategory = booksByCategoryId[category.id] || [];
    if (booksInCategory.length > 0) {
        const allInCategoryChecked = booksInCategory.every(book => linkedIds.has(book.id));
        
        const header = document.createElement('div');
        header.className = 'wb-category-header';
        header.innerHTML = `
            <span class="arrow">▼</span>
            <input type="checkbox" class="wb-category-checkbox" data-category-id="${category.id}" ${allInCategoryChecked ? 'checked' : ''}>
            <span>${category.name}</span>
        `;
        
        const bookContainer = document.createElement('div');
        bookContainer.className = 'wb-book-container';
        bookContainer.dataset.containerFor = category.id;

        booksInCategory.forEach(book => {
            const isChecked = linkedIds.has(book.id);
            const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" class="wb-book-checkbox" value="${book.id}" data-parent-category="${category.id}" ${isChecked ? 'checked' : ''}> ${book.name}`;
    bookContainer.appendChild(label);
});

        // --- ★ 核心修改 #1 在这里 ★ ---
        // 默认将分类设置为折叠状态
        header.classList.add('collapsed');
        bookContainer.classList.add('collapsed');
        // --- ★ 修改结束 ★ ---

        worldBookCheckboxesContainer.appendChild(header);
        worldBookCheckboxesContainer.appendChild(bookContainer);
    }
});

updateWorldBookSelectionDisplay(); // 更新顶部的已选数量显示

// ▲▲▲ 替换结束 ▲▲▲

// ▼▼▼ 在 updateWorldBookSelectionDisplay(); 的下一行，粘贴这整块新代码 ▼▼▼

// 使用事件委托来处理所有点击和勾选事件，效率更高
worldBookCheckboxesContainer.addEventListener('click', (e) => {
    const header = e.target.closest('.wb-category-header');
    if (header && !e.target.matches('input[type="checkbox"]')) {
        const categoryId = header.querySelector('.wb-category-checkbox')?.dataset.categoryId;
        // 【修改】现在 categoryId 可能是数字，也可能是 "uncategorized" 字符串，所以这个判断能通过了！
        if (categoryId) { // <-- 把原来的 !categoryId return; 改成这样
            const bookContainer = worldBookCheckboxesContainer.querySelector(`.wb-book-container[data-container-for="${categoryId}"]`);
            if (bookContainer) {
                header.classList.toggle('collapsed');
                bookContainer.classList.toggle('collapsed');
            }
        }
    }
});

worldBookCheckboxesContainer.addEventListener('change', (e) => {
    const target = e.target;
    
    // 如果点击的是分类的“全选”复选框
    if (target.classList.contains('wb-category-checkbox')) {
        const categoryId = target.dataset.categoryId;
        const isChecked = target.checked;
        // 找到这个分类下的所有书籍复选框，并将它们的状态设置为与分类复选框一致
        const bookCheckboxes = worldBookCheckboxesContainer.querySelectorAll(`input.wb-book-checkbox[data-parent-category="${categoryId}"]`);
        bookCheckboxes.forEach(cb => cb.checked = isChecked);
    }
    
    // 如果点击的是单个书籍的复选框
    if (target.classList.contains('wb-book-checkbox')) {
        const categoryId = target.dataset.parentCategory;
        if (categoryId) { // 检查它是否属于一个分类
            const categoryCheckbox = worldBookCheckboxesContainer.querySelector(`input.wb-category-checkbox[data-category-id="${categoryId}"]`);
            const allBookCheckboxes = worldBookCheckboxesContainer.querySelectorAll(`input.wb-book-checkbox[data-parent-category="${categoryId}"]`);
            // 检查该分类下是否所有书籍都被选中了
            const allChecked = Array.from(allBookCheckboxes).every(cb => cb.checked);
            // 同步分类“全选”复选框的状态
            categoryCheckbox.checked = allChecked;
        }
    }
    
    // 每次变更后都更新顶部的已选数量显示
    updateWorldBookSelectionDisplay();
});

// ▲▲▲ 粘贴结束 ▲▲▲

    // 加载并更新所有预览相关控件
    const themeRadio = document.querySelector(`input[name="theme-select"][value="${chat.settings.theme || 'default'}"]`);
    if (themeRadio) themeRadio.checked = true;
    const fontSizeSlider = document.getElementById('font-size-slider');
    fontSizeSlider.value = chat.settings.fontSize || 13;
    document.getElementById('font-size-value').textContent = `${fontSizeSlider.value}px`;
    const customCssInput = document.getElementById('custom-css-input');
    customCssInput.value = chat.settings.customCss || '';
    
    updateSettingsPreview(); 
    document.getElementById('chat-settings-modal').classList.add('visible');
});
// ▲▲▲ 替换结束 ▲▲▲
            
function renderGroupMemberSettings(members) { 
    const container = document.getElementById('group-members-settings'); 
    container.innerHTML = ''; 
    members.forEach(member => { 
        const div = document.createElement('div'); 
        div.className = 'member-editor'; 
        div.dataset.memberId = member.id; 
        // ★★★【核心重构】★★★
        // 显示的是 groupNickname
        div.innerHTML = `<img src="${member.avatar}" alt="${member.groupNickname}"><div class="member-name">${member.groupNickname}</div>`; 
        div.addEventListener('click', () => openMemberEditor(member.id)); 
        container.appendChild(div); 
    }); 
}

function openMemberEditor(memberId) { 
    editingMemberId = memberId; 
    const chat = state.chats[state.activeChatId]; 
    const member = chat.members.find(m => m.id === memberId); 
    document.getElementById('member-name-input').value = member.groupNickname; 
    document.getElementById('member-persona-input').value = member.persona; 
    document.getElementById('member-avatar-preview').src = member.avatar; 
    document.getElementById('member-settings-modal').classList.add('visible'); 
}
            document.getElementById('cancel-member-settings-btn').addEventListener('click', () => { document.getElementById('member-settings-modal').classList.remove('visible'); editingMemberId = null; });
            document.getElementById('save-member-settings-btn').addEventListener('click', () => { 
    if (!editingMemberId) return; 
    const chat = state.chats[state.activeChatId]; 
    const member = chat.members.find(m => m.id === editingMemberId); 
    
    // ★★★【核心重构】★★★
    const newNickname = document.getElementById('member-name-input').value.trim();
    if (!newNickname) {
        alert("群昵称不能为空！");
        return;
    }
    member.groupNickname = newNickname; // 只修改群昵称
    member.persona = document.getElementById('member-persona-input').value; 
    member.avatar = document.getElementById('member-avatar-preview').src; 
    
    renderGroupMemberSettings(chat.members); 
    document.getElementById('member-settings-modal').classList.remove('visible'); 
});
            document.getElementById('reset-theme-btn').addEventListener('click', () => { document.getElementById('theme-default').checked = true; });
            document.getElementById('cancel-chat-settings-btn').addEventListener('click', () => { chatSettingsModal.classList.remove('visible'); });

document.getElementById('save-chat-settings-btn').addEventListener('click', async () => {
    if (!state.activeChatId) return;
    const chat = state.chats[state.activeChatId];
    const newName = document.getElementById('chat-name-input').value.trim();
    if (!newName) return alert('備註名/群名不能為空！');
    chat.name = newName;
    const selectedThemeRadio = document.querySelector('input[name="theme-select"]:checked');
    chat.settings.theme = selectedThemeRadio ? selectedThemeRadio.value : 'default';

    chat.settings.fontSize = parseInt(document.getElementById('font-size-slider').value);
    chat.settings.customCss = document.getElementById('custom-css-input').value.trim();

    chat.settings.myPersona = document.getElementById('my-persona').value;
    chat.settings.myAvatar = document.getElementById('my-avatar-preview').src;
const checkedBooks = document.querySelectorAll('#world-book-checkboxes-container input.wb-book-checkbox:checked');
    chat.settings.linkedWorldBookIds = Array.from(checkedBooks).map(cb => cb.value);

    if (chat.isGroup) {
        chat.settings.myNickname = document.getElementById('my-group-nickname-input').value.trim();
        chat.settings.groupAvatar = document.getElementById('group-avatar-preview').src;
    } else {
        chat.settings.aiPersona = document.getElementById('ai-persona').value;
        chat.settings.aiAvatar = document.getElementById('ai-avatar-preview').src;
        const selectedGroupId = document.getElementById('assign-group-select').value;
        chat.groupId = selectedGroupId ? parseInt(selectedGroupId) : null;
    }

    chat.settings.maxMemory = parseInt(document.getElementById('max-memory').value) || 10;
    await db.chats.put(chat);

    applyScopedCss(chat.settings.customCss, '#chat-messages', 'custom-bubble-style');
    
    chatSettingsModal.classList.remove('visible');
    renderChatInterface(state.activeChatId);
    renderChatList();
});
            document.getElementById('clear-chat-btn').addEventListener('click', async () => { if (!state.activeChatId) return; const chat = state.chats[state.activeChatId]; const confirmed = await showCustomConfirm('清空聊天記錄', '此操作將永久刪除此聊天的所有消息，無法恢復。確定要清空嗎？', { confirmButtonClass: 'btn-danger' }); if (confirmed) { chat.history = []; await db.chats.put(chat); renderChatInterface(state.activeChatId); renderChatList(); chatSettingsModal.classList.remove('visible'); } });

            const setupFileUpload = (inputId, callback) => { document.getElementById(inputId).addEventListener('change', async (event) => { const file = event.target.files[0]; if (file) { const dataUrl = await new Promise((res, rej) => { const reader = new FileReader(); reader.onload = () => res(reader.result); reader.onerror = () => rej(reader.error); reader.readAsDataURL(file); }); callback(dataUrl); event.target.value = null; } }); };
            setupFileUpload('ai-avatar-input', (base64) => document.getElementById('ai-avatar-preview').src = base64);
            setupFileUpload('my-avatar-input', (base64) => document.getElementById('my-avatar-preview').src = base64);
            setupFileUpload('group-avatar-input', (base64) => document.getElementById('group-avatar-preview').src = base64);
            setupFileUpload('member-avatar-input', (base64) => document.getElementById('member-avatar-preview').src = base64);
            setupFileUpload('bg-input', (base64) => { if(state.activeChatId) { state.chats[state.activeChatId].settings.background = base64; const bgPreview = document.getElementById('bg-preview'); bgPreview.src = base64; bgPreview.style.display = 'block'; document.getElementById('remove-bg-btn').style.display = 'inline-block'; } });
            setupFileUpload('preset-avatar-input', (base64) => document.getElementById('preset-avatar-preview').src = base64);
            document.getElementById('remove-bg-btn').addEventListener('click', () => { if (state.activeChatId) { state.chats[state.activeChatId].settings.background = ''; const bgPreview = document.getElementById('bg-preview'); bgPreview.src = ''; bgPreview.style.display = 'none'; document.getElementById('remove-bg-btn').style.display = 'none'; } });

            const stickerPanel = document.getElementById('sticker-panel');
            document.getElementById('open-sticker-panel-btn').addEventListener('click', () => { renderStickerPanel(); stickerPanel.classList.add('visible'); });
            document.getElementById('close-sticker-panel-btn').addEventListener('click', () => stickerPanel.classList.remove('visible'));
            document.getElementById('add-sticker-btn').addEventListener('click', async () => { const url = await showCustomPrompt("添加表情(URL)", "請輸入表情包的圖片URL"); if (!url || !url.trim().startsWith('http')) return url && alert("請輸入有效的URL (以http開頭)"); const name = await showCustomPrompt("命名表情", "請為這個表情命名 (例如：開心、疑惑)"); if (name && name.trim()) { const newSticker = { id: 'sticker_' + Date.now(), url: url.trim(), name: name.trim() }; await db.userStickers.add(newSticker); state.userStickers.push(newSticker); renderStickerPanel(); } else if (name !== null) alert("表情名不能為空！"); });
            document.getElementById('upload-sticker-btn').addEventListener('click', () => document.getElementById('sticker-upload-input').click());
            document.getElementById('sticker-upload-input').addEventListener('change', async (event) => { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = async () => { const base64Url = reader.result; const name = await showCustomPrompt("命名表情", "請為這個表情命名 (例如：好耶、疑惑)"); if (name && name.trim()) { const newSticker = { id: 'sticker_' + Date.now(), url: base64Url, name: name.trim() }; await db.userStickers.add(newSticker); state.userStickers.push(newSticker); renderStickerPanel(); } else if (name !== null) alert("表情名不能為空！"); }; event.target.value = null; });

            document.getElementById('upload-image-btn').addEventListener('click', () => document.getElementById('image-upload-input').click());
            document.getElementById('image-upload-input').addEventListener('change', async (event) => { const file = event.target.files[0]; if (!file || !state.activeChatId) return; const reader = new FileReader(); reader.onload = async (e) => { const base64Url = e.target.result; const chat = state.chats[state.activeChatId]; const msg = { role: 'user', content: [{ type: 'image_url', image_url: { url: base64Url } }], timestamp: Date.now() }; chat.history.push(msg); await db.chats.put(chat); appendMessage(msg, chat); renderChatList(); }; reader.readAsDataURL(file); event.target.value = null; });
            document.getElementById('voice-message-btn').addEventListener('click', async () => { if (!state.activeChatId) return; const text = await showCustomPrompt("發送語音", "請輸入你想說的內容："); if (text && text.trim()) { const chat = state.chats[state.activeChatId]; const msg = { role: 'user', type: 'voice_message', content: text.trim(), timestamp: Date.now() }; chat.history.push(msg); await db.chats.put(chat); appendMessage(msg, chat); renderChatList(); } });
            document.getElementById('send-photo-btn').addEventListener('click', async () => { if (!state.activeChatId) return; const description = await showCustomPrompt("發送照片", "請用文字描述您要發送的照片："); if (description && description.trim()) { const chat = state.chats[state.activeChatId]; const msg = { role: 'user', type: 'user_photo', content: description.trim(), timestamp: Date.now() }; chat.history.push(msg); await db.chats.put(chat); appendMessage(msg, chat); renderChatList(); } });

// ▼▼▼ 【全新】外賣請求功能事件綁定 ▼▼▼
const waimaiModal = document.getElementById('waimai-request-modal');
document.getElementById('send-waimai-request-btn').addEventListener('click', () => {
    waimaiModal.classList.add('visible');
});

document.getElementById('waimai-cancel-btn').addEventListener('click', () => {
    waimaiModal.classList.remove('visible');
});

document.getElementById('waimai-confirm-btn').addEventListener('click', async () => {
    if (!state.activeChatId) return;
    
    const productInfoInput = document.getElementById('waimai-product-info');
    const amountInput = document.getElementById('waimai-amount');
    
    const productInfo = productInfoInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!productInfo) {
        alert('請輸入商品資訊！');
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        alert('請輸入有效的代付金額！');
        return;
    }

    const chat = state.chats[state.activeChatId];
    const now = Date.now();

    // 【核心修正】在这里获取用户自己的昵称
    const myNickname = chat.isGroup ? (chat.settings.myNickname || '我') : '我';
    
    const msg = {
        role: 'user',
        // 【核心修正】将获取到的昵称，作为 senderName 添加到消息对象中
        senderName: myNickname, 
        type: 'waimai_request',
        productInfo: productInfo,
        amount: amount,
        status: 'pending',
        countdownEndTime: now + 15 * 60 * 1000,
        timestamp: now
    };

    chat.history.push(msg);
    await db.chats.put(chat);
    appendMessage(msg, chat);
    renderChatList();

    productInfoInput.value = '';
    amountInput.value = '';
    waimaiModal.classList.remove('visible');
});         
            document.getElementById('open-persona-library-btn').addEventListener('click', openPersonaLibrary);
            document.getElementById('close-persona-library-btn').addEventListener('click', closePersonaLibrary);
            document.getElementById('add-persona-preset-btn').addEventListener('click', openPersonaEditorForCreate);
            document.getElementById('cancel-persona-editor-btn').addEventListener('click', closePersonaEditor);
            document.getElementById('save-persona-preset-btn').addEventListener('click', savePersonaPreset);
            document.getElementById('preset-action-edit').addEventListener('click', openPersonaEditorForEdit);
            document.getElementById('preset-action-delete').addEventListener('click', deletePersonaPreset);
            document.getElementById('preset-action-cancel').addEventListener('click', hidePresetActions);
            
            document.getElementById('selection-cancel-btn').addEventListener('click', exitSelectionMode);

// ▼▼▼ 【最终加强版】用这块代码替换旧的 selection-delete-btn 事件监听器 ▼▼▼
document.getElementById('selection-delete-btn').addEventListener('click', async () => {
    if (selectedMessages.size === 0) return;
    const confirmed = await showCustomConfirm('删除消息', `確定要刪除選取的 ${selectedMessages.size} 條消息嗎？這將改變AI的記憶。`, { confirmButtonClass: 'btn-danger' });
    if (confirmed) {
        const chat = state.chats[state.activeChatId];
        
        // 1. 【核心加强】在删除前，检查被删除的消息中是否包含投票
        let deletedPollsInfo = [];
        for (const timestamp of selectedMessages) {
            const msg = chat.history.find(m => m.timestamp === timestamp);
            if (msg && msg.type === 'poll') {
                deletedPollsInfo.push(`關於“${msg.question}”的投票(時間戳: ${msg.timestamp})`);
            }
        }
        
        // 2. 更新后端的历史记录
        chat.history = chat.history.filter(msg => !selectedMessages.has(msg.timestamp));
        
        // 3. 【核心加强】构建更具体的“遗忘指令”
        let forgetReason = "一些先前的消息已被用戶刪除。";
        if (deletedPollsInfo.length > 0) {
            forgetReason += ` 其中包括以下投票：${deletedPollsInfo.join('；')}。`;
        }
        forgetReason += " 你應該像它們從未存在過一樣繼續對話，並相應地調整你的記憶和行為，不要再提及這些被刪除的內容。";

        const forgetInstruction = {
            role: 'system',
            content: `[系统提示：${forgetReason}]`,
            timestamp: Date.now(),
            isHidden: true 
        };
        chat.history.push(forgetInstruction);
        
        // 4. 将包含“遗忘指令”的、更新后的chat对象存回数据库
        await db.chats.put(chat);
        
        // 5. 最后才更新UI
        renderChatInterface(state.activeChatId);
        renderChatList();
    }
});
// ▲▲▲ 替换结束 ▲▲▲

            const fontUrlInput = document.getElementById('font-url-input');
            fontUrlInput.addEventListener('input', () => applyCustomFont(fontUrlInput.value.trim(), true));
            document.getElementById('save-font-btn').addEventListener('click', async () => {
                const newFontUrl = fontUrlInput.value.trim();
                if (!newFontUrl) { alert("請輸入有效的字體URL。"); return; }
                applyCustomFont(newFontUrl, false);
                state.globalSettings.fontUrl = newFontUrl;
                await db.globalSettings.put(state.globalSettings);
                alert('字體已保存並應用！');
            });
            document.getElementById('reset-font-btn').addEventListener('click', resetToDefaultFont);

            document.querySelectorAll('#chat-list-bottom-nav .nav-item').forEach(item => { item.addEventListener('click', () => switchToChatListView(item.dataset.view)); });
            document.getElementById('qzone-back-btn').addEventListener('click', () => switchToChatListView('messages-view'));
            document.getElementById('qzone-nickname').addEventListener('click', async () => { const newNickname = await showCustomPrompt("修改暱稱", "請輸入新的暱稱", state.qzoneSettings.nickname); if (newNickname && newNickname.trim()) { state.qzoneSettings.nickname = newNickname.trim(); await saveQzoneSettings(); renderQzoneScreen(); } });
            document.getElementById('qzone-avatar-container').addEventListener('click', () => document.getElementById('qzone-avatar-input').click());
            document.getElementById('qzone-banner-container').addEventListener('click', () => document.getElementById('qzone-banner-input').click());
            document.getElementById('qzone-avatar-input').addEventListener('change', async (event) => { const file = event.target.files[0]; if (file) { const dataUrl = await new Promise(res => { const reader = new FileReader(); reader.onload = () => res(reader.result); reader.readAsDataURL(file); }); state.qzoneSettings.avatar = dataUrl; await saveQzoneSettings(); renderQzoneScreen(); } event.target.value = null; });
            document.getElementById('qzone-banner-input').addEventListener('change', async (event) => { const file = event.target.files[0]; if (file) { const dataUrl = await new Promise(res => { const reader = new FileReader(); reader.onload = () => res(reader.result); reader.readAsDataURL(file); }); state.qzoneSettings.banner = dataUrl; await saveQzoneSettings(); renderQzoneScreen(); } event.target.value = null; });

// ▼▼▼ 【修正后】的“说说”按钮事件 ▼▼▼
document.getElementById('create-shuoshuo-btn').addEventListener('click', async () => {
    // 1. 重置并获取模态框
    resetCreatePostModal();
    const modal = document.getElementById('create-post-modal');
    
    // 2. 设置为“说说”模式
    modal.dataset.mode = 'shuoshuo';
    
    // 3. 隐藏与图片/文字图相关的部分
    modal.querySelector('.post-mode-switcher').style.display = 'none';
    modal.querySelector('#image-mode-content').style.display = 'none';
    modal.querySelector('#text-image-mode-content').style.display = 'none';
    
    // 4. 修改主输入框的提示语，使其更符合“说说”的场景
    modal.querySelector('#post-public-text').placeholder = '分享新鮮事...';
    
    // 5. 准备并显示模态框
    const visibilityGroupsContainer = document.getElementById('post-visibility-groups');
    visibilityGroupsContainer.innerHTML = '';
    const groups = await db.qzoneGroups.toArray();
    if (groups.length > 0) {
        groups.forEach(group => {
            const label = document.createElement('label');
            label.style.display = 'block';
            label.innerHTML = `<input type="checkbox" name="visibility_group" value="${group.id}"> ${group.name}`;
            visibilityGroupsContainer.appendChild(label);
        });
    } else {
        visibilityGroupsContainer.innerHTML = '<p style="color: var(--text-secondary);">沒有可用的分組</p>';
    }
    modal.classList.add('visible');
});

// ▼▼▼ 【修正后】的“动态”（图片）按钮事件 ▼▼▼
document.getElementById('create-post-btn').addEventListener('click', async () => {
    // 1. 重置并获取模态框
    resetCreatePostModal();
    const modal = document.getElementById('create-post-modal');
    
    // 2. 设置为“复杂动态”模式
    modal.dataset.mode = 'complex';
    
// 3. 确保与图片/文字图相关的部分是可见的
modal.querySelector('.post-mode-switcher').style.display = 'flex';
// 显式激活“上传图片”模式...
modal.querySelector('#image-mode-content').classList.add('active');
// ...同时确保“文字图”模式是隐藏的
modal.querySelector('#text-image-mode-content').classList.remove('active');
    
    // 4. 恢复主输入框的默认提示语
    modal.querySelector('#post-public-text').placeholder = '分享新鮮事...（非必填的公開文字）';

    // 5. 准备并显示模态框（与“说说”按钮的逻辑相同）
    const visibilityGroupsContainer = document.getElementById('post-visibility-groups');
    visibilityGroupsContainer.innerHTML = '';
    const groups = await db.qzoneGroups.toArray();
    if (groups.length > 0) {
        groups.forEach(group => {
            const label = document.createElement('label');
            label.style.display = 'block';
            label.innerHTML = `<input type="checkbox" name="visibility_group" value="${group.id}"> ${group.name}`;
            visibilityGroupsContainer.appendChild(label);
        });
    } else {
        visibilityGroupsContainer.innerHTML = '<p style="color: var(--text-secondary);">沒有可用的分組</p>';
    }
    modal.classList.add('visible');
});
            document.getElementById('open-album-btn').addEventListener('click', async () => { await renderAlbumList(); showScreen('album-screen'); });
            document.getElementById('album-back-btn').addEventListener('click', () => { showScreen('chat-list-screen'); switchToChatListView('qzone-screen'); });

// --- ↓↓↓ 从这里开始复制 ↓↓↓ ---

document.getElementById('album-photos-back-btn').addEventListener('click', () => {
    state.activeAlbumId = null;
    showScreen('album-screen');
});

document.getElementById('album-upload-photo-btn').addEventListener('click', () => document.getElementById('album-photo-input').click());

document.getElementById('album-photo-input').addEventListener('change', async (event) => {
    if (!state.activeAlbumId) return;
    const files = event.target.files;
    if (!files.length) return;

    const album = await db.qzoneAlbums.get(state.activeAlbumId);
    
    for (const file of files) {
        const dataUrl = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
        await db.qzonePhotos.add({ albumId: state.activeAlbumId, url: dataUrl, createdAt: Date.now() });
    }

    const photoCount = await db.qzonePhotos.where('albumId').equals(state.activeAlbumId).count();
    const updateData = { photoCount };
    
    if (!album.photoCount || album.coverUrl.includes('placeholder')) {
        const firstPhoto = await db.qzonePhotos.where('albumId').equals(state.activeAlbumId).first();
        if(firstPhoto) updateData.coverUrl = firstPhoto.url;
    }

    await db.qzoneAlbums.update(state.activeAlbumId, updateData);
    await renderAlbumPhotosScreen();
    await renderAlbumList();
    
    event.target.value = null;
    alert('照片上傳成功！');
});

// --- ↑↑↑ 复制到这里结束 ↑↑↑ ---

// --- ↓↓↓ 从这里开始复制，完整替换掉旧的 photos-grid-page 监听器 ↓↓↓ ---

document.getElementById('photos-grid-page').addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.photo-delete-btn');
    const photoThumb = e.target.closest('.photo-thumb');

    if (deleteBtn) {
        e.stopPropagation(); // 阻止事件冒泡到图片上
        const photoId = parseInt(deleteBtn.dataset.photoId);
        const confirmed = await showCustomConfirm(
            '删除照片',
            '確定要刪除這張照片嗎？此操作不可恢復。',
            { confirmButtonClass: 'btn-danger' }
        );

        if (confirmed) {
            const deletedPhoto = await db.qzonePhotos.get(photoId);
            if (!deletedPhoto) return;
            
            await db.qzonePhotos.delete(photoId);

            const album = await db.qzoneAlbums.get(state.activeAlbumId);
            const photoCount = (album.photoCount || 1) - 1;
            const updateData = { photoCount };
            
            if (album.coverUrl === deletedPhoto.url) {
                const nextPhoto = await db.qzonePhotos.where('albumId').equals(state.activeAlbumId).first();
                updateData.coverUrl = nextPhoto ? nextPhoto.url : 'https://i.postimg.cc/pT2xKzPz/album-cover-placeholder.png';
            }
            
            await db.qzoneAlbums.update(state.activeAlbumId, updateData);
            await renderAlbumPhotosScreen();
            await renderAlbumList();
            alert('照片已删除。');
        }
    } 
    else if (photoThumb) {
        // 这就是恢复的图片点击放大功能！
        openPhotoViewer(photoThumb.src);
    }
});

// 恢复图片查看器的控制事件
document.getElementById('photo-viewer-close-btn').addEventListener('click', closePhotoViewer);
document.getElementById('photo-viewer-next-btn').addEventListener('click', showNextPhoto);
document.getElementById('photo-viewer-prev-btn').addEventListener('click', showPrevPhoto);

// 恢复键盘左右箭头和ESC键的功能
document.addEventListener('keydown', (e) => {
    if (!photoViewerState.isOpen) return; 

    if (e.key === 'ArrowRight') {
        showNextPhoto();
    } else if (e.key === 'ArrowLeft') {
        showPrevPhoto();
    } else if (e.key === 'Escape') {
        closePhotoViewer();
    }
});

// --- ↑↑↑ 复制到这里结束 ↑↑↑ ---

document.getElementById('create-album-btn-page').addEventListener('click', async () => { const albumName = await showCustomPrompt("創建新相冊", "請輸入相冊名稱"); if (albumName && albumName.trim()) { const newAlbum = { name: albumName.trim(), coverUrl: 'https://i.postimg.cc/pT2xKzPz/album-cover-placeholder.png', photoCount: 0, createdAt: Date.now() }; await db.qzoneAlbums.add(newAlbum); await renderAlbumList(); alert(`相冊 "${albumName}" 創建成功！`); } else if (albumName !== null) { alert("相冊名稱不能為空！"); } });

            document.getElementById('cancel-create-post-btn').addEventListener('click', () => document.getElementById('create-post-modal').classList.remove('visible'));
            document.getElementById('post-upload-local-btn').addEventListener('click', () => document.getElementById('post-local-image-input').click());
            document.getElementById('post-local-image-input').addEventListener('change', (event) => { const file = event.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (e) => { document.getElementById('post-image-preview').src = e.target.result; document.getElementById('post-image-preview-container').classList.add('visible'); document.getElementById('post-image-desc-group').style.display = 'block'; }; reader.readAsDataURL(file); } });
            document.getElementById('post-use-url-btn').addEventListener('click', async () => { const url = await showCustomPrompt("輸入圖片URL", "請輸入網路圖片的鏈接", "", "url"); if (url) { document.getElementById('post-image-preview').src = url; document.getElementById('post-image-preview-container').classList.add('visible'); document.getElementById('post-image-desc-group').style.display = 'block'; } });
            document.getElementById('post-remove-image-btn').addEventListener('click', () => resetCreatePostModal());
            const imageModeBtn = document.getElementById('switch-to-image-mode');
            const textImageModeBtn = document.getElementById('switch-to-text-image-mode');
            const imageModeContent = document.getElementById('image-mode-content');
            const textImageModeContent = document.getElementById('text-image-mode-content');
            imageModeBtn.addEventListener('click', () => { imageModeBtn.classList.add('active'); textImageModeBtn.classList.remove('active'); imageModeContent.classList.add('active'); textImageModeContent.classList.remove('active'); });
            textImageModeBtn.addEventListener('click', () => { textImageModeBtn.classList.add('active'); imageModeBtn.classList.remove('active'); textImageModeContent.classList.add('active'); imageModeContent.classList.remove('active'); });

// ▼▼▼ 【最终修正版】的“发布”按钮事件，已修复权限漏洞 ▼▼▼
document.getElementById('confirm-create-post-btn').addEventListener('click', async () => {
    const modal = document.getElementById('create-post-modal');
    const mode = modal.dataset.mode;
    
    // --- 1. 获取通用的可见性设置 ---
    const visibilityMode = document.querySelector('input[name="visibility"]:checked').value;
    let visibleGroupIds = null;
    
    if (visibilityMode === 'include') {
        visibleGroupIds = Array.from(document.querySelectorAll('input[name="visibility_group"]:checked')).map(cb => parseInt(cb.value));
    }

    let newPost = {};
    const basePostData = {
        timestamp: Date.now(),
        authorId: 'user',
        // 【重要】在这里就把权限信息存好
        visibleGroupIds: visibleGroupIds,
    };

    // --- 2. 根据模式构建不同的 post 对象 ---
    if (mode === 'shuoshuo') {
        const content = document.getElementById('post-public-text').value.trim();
        if (!content) {
            alert('說說內容不能為空！');
            return;
        }
        newPost = {
            ...basePostData,
            type: 'shuoshuo',
            content: content,
        };

    } else { // 处理 'complex' 模式 (图片/文字图)
        const publicText = document.getElementById('post-public-text').value.trim();
        const isImageModeActive = document.getElementById('image-mode-content').classList.contains('active');

        if (isImageModeActive) {
            const imageUrl = document.getElementById('post-image-preview').src;
            const imageDescription = document.getElementById('post-image-description').value.trim();
            if (!imageUrl || !(imageUrl.startsWith('http') || imageUrl.startsWith('data:'))) {
                alert('請先添加一張圖片再發布動態哦！');
                return;
            }
            if (!imageDescription) {
                alert('請為你的圖片添加一個簡單的描述（必填，給AI看的）！');
                return;
            }
            newPost = {
                ...basePostData,
                type: 'image_post',
                publicText: publicText,
                imageUrl: imageUrl,
                imageDescription: imageDescription,
            };
        } else { // 文字图模式
            const hiddenText = document.getElementById('post-hidden-text').value.trim();
            if (!hiddenText) {
                alert('請輸入文字圖描述！');
                return;
            }
            newPost = {
                ...basePostData,
                type: 'text_image',
                publicText: publicText,
                hiddenContent: hiddenText,
            };
        }
    }

    // --- 3. 保存到数据库 ---
    const newPostId = await db.qzonePosts.add(newPost);
    let postSummary = newPost.content || newPost.publicText || newPost.imageDescription || newPost.hiddenContent || "（無文字內容）";
    postSummary = postSummary.substring(0, 50) + (postSummary.length > 50 ? '...' : '');

    // --- 4. 【核心修正】带有权限检查的通知循环 ---
    for (const chatId in state.chats) {
        const chat = state.chats[chatId];
        if (chat.isGroup) continue; // 跳过群聊

        let shouldNotify = false;
        const postVisibleGroups = newPost.visibleGroupIds;

        // 判断条件1：如果动态是公开的 (没有设置任何可见分组)
        if (!postVisibleGroups || postVisibleGroups.length === 0) {
            shouldNotify = true;
        } 
        // 判断条件2：如果动态设置了部分可见，并且当前角色在可见分组内
        else if (chat.groupId && postVisibleGroups.includes(chat.groupId)) {
            shouldNotify = true;
        }

        // 只有满足条件的角色才会被通知
        if (shouldNotify) {
            const historyMessage = {
                role: 'system',
                content: `[系統提示：用戶剛剛發布了一條動態(ID: ${newPostId})，內容摘要是：“${postSummary}”。你現在可以對這條動態進行評論了。]`,
                timestamp: Date.now(),
                isHidden: true
            };
            chat.history.push(historyMessage);
            await db.chats.put(chat);
        }
    }
    // --- 修正结束 ---

    await renderQzonePosts();
    modal.classList.remove('visible');
    alert('動態發布成功！');
});

// ▼▼▼ 請用這【一整塊】包含所有滑動和點擊事件的完整代碼，替換掉舊的 postsList 事件監聽器 ▼▼▼

const postsList = document.getElementById('qzone-posts-list');
let swipeState = { isDragging: false, startX: 0, startY: 0, currentX: 0, activeContainer: null, swipeDirection: null, isClick: true };

function resetAllSwipes(exceptThisOne = null) {
    document.querySelectorAll('.qzone-post-container').forEach(container => {
        if (container !== exceptThisOne) {
            container.querySelector('.qzone-post-item').classList.remove('swiped');
        }
    });
}

const handleSwipeStart = (e) => {
    const targetContainer = e.target.closest('.qzone-post-container');
    if (!targetContainer) return;

    resetAllSwipes(targetContainer);
    swipeState.activeContainer = targetContainer;
    swipeState.isDragging = true;
    swipeState.isClick = true;
    swipeState.swipeDirection = null;
    swipeState.startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    swipeState.startY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
    swipeState.activeContainer.querySelector('.qzone-post-item').style.transition = 'none';
};

const handleSwipeMove = (e) => {
    if (!swipeState.isDragging || !swipeState.activeContainer) return;

    const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    const currentY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
    const diffX = currentX - swipeState.startX;
    const diffY = currentY - swipeState.startY;
    const absDiffX = Math.abs(diffX);
    const absDiffY = Math.abs(diffY);
    const clickThreshold = 5;

    if (absDiffX > clickThreshold || absDiffY > clickThreshold) {
        swipeState.isClick = false;
    }

    if (swipeState.swipeDirection === null) {
        if (absDiffX > clickThreshold || absDiffY > clickThreshold) {
            if (absDiffX > absDiffY) {
                swipeState.swipeDirection = 'horizontal';
            } else {
                swipeState.swipeDirection = 'vertical';
            }
        }
    }
    if (swipeState.swipeDirection === 'vertical') {
        handleSwipeEnd(e);
        return;
    }
    if (swipeState.swipeDirection === 'horizontal') {
        e.preventDefault();
        swipeState.currentX = currentX;
        let translation = diffX;
        if (translation > 0) translation = 0;
        if (translation < -90) translation = -90;
        swipeState.activeContainer.querySelector('.qzone-post-item').style.transform = `translateX(${translation}px)`;
    }
};

const handleSwipeEnd = (e) => {
    if (swipeState.isClick) {
        swipeState.isDragging = false;
        swipeState.activeContainer = null;
        return;
    }
    if (!swipeState.isDragging || !swipeState.activeContainer) return;

    const postItem = swipeState.activeContainer.querySelector('.qzone-post-item');
    postItem.style.transition = 'transform 0.3s ease';

    const finalX = e.type.includes('touchend') ? e.changedTouches[0].pageX : e.pageX;
    const diffX = finalX - swipeState.startX;
    const swipeThreshold = -40;

    if (swipeState.swipeDirection === 'horizontal' && diffX < swipeThreshold) {
        postItem.classList.add('swiped');
        postItem.style.transform = '';
    } else {
        postItem.classList.remove('swiped');
        postItem.style.transform = '';
    }

    swipeState.isDragging = false;
    swipeState.startX = 0;
    swipeState.startY = 0;
    swipeState.currentX = 0;
    swipeState.activeContainer = null;
    swipeState.swipeDirection = null;
    swipeState.isClick = true;
};

// --- 绑定所有滑动事件 ---
postsList.addEventListener('mousedown', handleSwipeStart);
document.addEventListener('mousemove', handleSwipeMove);
document.addEventListener('mouseup', handleSwipeEnd);
postsList.addEventListener('touchstart', handleSwipeStart, { passive: false });
postsList.addEventListener('touchmove', handleSwipeMove, { passive: false });
postsList.addEventListener('touchend', handleSwipeEnd);

// --- 绑定所有点击事件 ---
postsList.addEventListener('click', async (e) => {
    e.stopPropagation();
    const target = e.target;

    // --- 新增：处理评论删除按钮 ---
    if (target.classList.contains('comment-delete-btn')) {
        const postContainer = target.closest('.qzone-post-container');
        if (!postContainer) return;

        const postId = parseInt(postContainer.dataset.postId);
        const commentIndex = parseInt(target.dataset.commentIndex);
        if (isNaN(postId) || isNaN(commentIndex)) return;

        const post = await db.qzonePosts.get(postId);
        if (!post || !post.comments || !post.comments[commentIndex]) return;

        const commentText = post.comments[commentIndex].text;
        const confirmed = await showCustomConfirm(
            '刪除評論',
            `確定要刪除這條評論嗎？\n\n“${commentText.substring(0, 50)}...”`,
            { confirmButtonClass: 'btn-danger' }
        );

        if (confirmed) {
            // 从数组中移除该评论
            post.comments.splice(commentIndex, 1);
            // 更新数据库
            await db.qzonePosts.update(postId, { comments: post.comments });
            // 重新渲染列表以反映更改
            await renderQzonePosts();
            alert('評論已刪除。');
        }
        return; // 处理完后直接返回
    }

    if (target.classList.contains('post-actions-btn')) {
        const container = target.closest('.qzone-post-container');
        if (container && container.dataset.postId) {
            showPostActions(parseInt(container.dataset.postId));
        }
        return;
    }

    if (target.closest('.qzone-post-delete-action')) {
        const container = target.closest('.qzone-post-container');
        if (!container) return;
        
        const postIdToDelete = parseInt(container.dataset.postId);
        if (isNaN(postIdToDelete)) return;

        const confirmed = await showCustomConfirm('刪除動態', '確定要永久刪除這條動態嗎？', { confirmButtonClass: 'btn-danger' });

        if (confirmed) {
            container.style.transition = 'all 0.3s ease';
            container.style.transform = 'scale(0.8)';
            container.style.opacity = '0';
        
            setTimeout(async () => {
                 await db.qzonePosts.delete(postIdToDelete);
                 
                 const notificationIdentifier = `(ID: ${postIdToDelete})`;
                 for (const chatId in state.chats) {
                     const chat = state.chats[chatId];
                     const originalHistoryLength = chat.history.length;
                     chat.history = chat.history.filter(msg => !(msg.role === 'system' && msg.content.includes(notificationIdentifier)));
                     if (chat.history.length < originalHistoryLength) {
                         await db.chats.put(chat);
                     }
                 }
                 await renderQzonePosts();
                 alert('動態已刪除。');
            }, 300);
        }
        return;
    }

    if (target.tagName === 'IMG' && target.dataset.hiddenText) {
        const hiddenText = target.dataset.hiddenText;
        showCustomAlert("圖片內容", hiddenText.replace(/<br>/g, '\n'));
        return;
    }
    const icon = target.closest('.action-icon');
    if (icon) {
        const postContainer = icon.closest('.qzone-post-container');
        if (!postContainer) return;
        const postId = parseInt(postContainer.dataset.postId);
        if (isNaN(postId)) return;
        if (icon.classList.contains('like')) {
            const post = await db.qzonePosts.get(postId);
            if (!post) return;
            if (!post.likes) post.likes = [];
            const userNickname = state.qzoneSettings.nickname;
            const userLikeIndex = post.likes.indexOf(userNickname);
            if (userLikeIndex > -1) {
                post.likes.splice(userLikeIndex, 1);
            } else {
                post.likes.push(userNickname);
                icon.classList.add('animate-like');
                icon.addEventListener('animationend', () => icon.classList.remove('animate-like'), { once: true });
            }
            await db.qzonePosts.update(postId, { likes: post.likes });
        }
        if (icon.classList.contains('favorite')) {
            const existingFavorite = await db.favorites.where({ type: 'qzone_post', 'content.id': postId }).first();
            if (existingFavorite) {
                await db.favorites.delete(existingFavorite.id);
                await showCustomAlert('提示', '已取消收藏');
            } else {
                const postToSave = await db.qzonePosts.get(postId);
                if (postToSave) {
                    await db.favorites.add({ type: 'qzone_post', content: postToSave, timestamp: Date.now() });
                    await showCustomAlert('提示', '收藏成功！');
                }
            }
        }
        await renderQzonePosts();
        return;
    }
    const sendBtn = target.closest('.comment-send-btn');
    if (sendBtn) {
        const postContainer = sendBtn.closest('.qzone-post-container');
        if (!postContainer) return;
        const postId = parseInt(postContainer.dataset.postId);
        const commentInput = postContainer.querySelector('.comment-input');
        const commentText = commentInput.value.trim();
        if (!commentText) return alert('評論內容不能為空哦！');
        const post = await db.qzonePosts.get(postId);
        if (!post) return;
        if (!post.comments) post.comments = [];
        post.comments.push({ commenterName: state.qzoneSettings.nickname, text: commentText, timestamp: Date.now() });
        await db.qzonePosts.update(postId, { comments: post.comments });
        for (const chatId in state.chats) {
            const chat = state.chats[chatId];
            if (!chat.isGroup) {
                chat.history.push({ role: 'system', content: `[系统提示：'${state.qzoneSettings.nickname}' 在ID为${postId}的动态下发表了评论：“${commentText}”]`, timestamp: Date.now(), isHidden: true });
                await db.chats.put(chat);
            }
        }
        commentInput.value = '';
        await renderQzonePosts();
        return;
    }
});
// ▲▲▲ 替换结束 ▲▲▲

            // ▼▼▼ 在 init() 函数的事件监听器区域，粘贴下面这两行 ▼▼▼

            // 绑定动态页和收藏页的返回按钮
            document.getElementById('qzone-back-btn').addEventListener('click', () => switchToChatListView('messages-view'));
            document.getElementById('favorites-back-btn').addEventListener('click', () => switchToChatListView('messages-view'));

            // ▲▲▲ 添加结束 ▲▲▲

            // ▼▼▼ 在 init() 函数的事件监听器区域，检查并确保你有这段完整的代码 ▼▼▼

            // 收藏页搜索功能
            const searchInput = document.getElementById('favorites-search-input');
            const searchClearBtn = document.getElementById('favorites-search-clear-btn');

            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.trim().toLowerCase();
                
                // 控制清除按钮的显示/隐藏
                searchClearBtn.style.display = searchTerm ? 'block' : 'none';

                if (!searchTerm) {
                    displayFilteredFavorites(allFavoriteItems); // 如果搜索框为空，显示所有
                    return;
                }

                // 筛选逻辑
                const filteredItems = allFavoriteItems.filter(item => {
                    let contentToSearch = '';
                    let authorToSearch = '';

                    if (item.type === 'qzone_post') {
                        const post = item.content;
                        contentToSearch += (post.publicText || '') + ' ' + (post.content || '');
                        if (post.authorId === 'user') {
                            authorToSearch = state.qzoneSettings.nickname;
                        } else if (state.chats[post.authorId]) {
                            authorToSearch = state.chats[post.authorId].name;
                        }
                    } else if (item.type === 'chat_message') {
                        const msg = item.content;
                        if (typeof msg.content === 'string') {
                            contentToSearch = msg.content;
                        }
                        const chat = state.chats[item.chatId];
                        if (chat) {
                           if (msg.role === 'user') {
                                authorToSearch = chat.isGroup ? (chat.settings.myNickname || '我') : '我';
                           } else {
                                authorToSearch = chat.isGroup ? msg.senderName : chat.name;
                           }
                        }
                    }
                    
                    // 同时搜索内容和作者，并且不区分大小写
                    return contentToSearch.toLowerCase().includes(searchTerm) || 
                           authorToSearch.toLowerCase().includes(searchTerm);
                });

                displayFilteredFavorites(filteredItems);
            });

            // 清除按钮的点击事件
            searchClearBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchClearBtn.style.display = 'none';
                displayFilteredFavorites(allFavoriteItems);
                searchInput.focus();
            });

            // ▲▲▲ 代码检查结束 ▲▲▲

            // ▼▼▼ 新增/修改的事件监听器 ▼▼▼
            
            // 为聊天界面的批量收藏按钮绑定事件
                        // 为聊天界面的批量收藏按钮绑定事件 (已修正)
            document.getElementById('selection-favorite-btn').addEventListener('click', async () => {
                if (selectedMessages.size === 0) return;
                const chat = state.chats[state.activeChatId];
                if (!chat) return;

                const favoritesToAdd = [];
                const timestampsToFavorite = [...selectedMessages];

                for (const timestamp of timestampsToFavorite) {
                    // 【核心修正1】使用新的、高效的索引进行查询
                    const existing = await db.favorites.where('originalTimestamp').equals(timestamp).first();
                    
                    if (!existing) {
                        const messageToSave = chat.history.find(msg => msg.timestamp === timestamp);
                        if (messageToSave) {
                            favoritesToAdd.push({
                                type: 'chat_message',
                                content: messageToSave,
                                chatId: state.activeChatId,
                                timestamp: Date.now(), // 这是收藏操作发生的时间
                                originalTimestamp: messageToSave.timestamp // 【核心修正2】保存原始消息的时间戳到新字段
                            });
                        }
                    }
                }

                if (favoritesToAdd.length > 0) {
                    await db.favorites.bulkAdd(favoritesToAdd);
                    allFavoriteItems = await db.favorites.orderBy('timestamp').reverse().toArray(); // 更新全局收藏缓存
                    await showCustomAlert('收藏成功', `已成功收藏 ${favoritesToAdd.length} 條消息。`);
                } else {
                    await showCustomAlert('提示', '選取的訊息均已收藏過。');
                }
                
                exitSelectionMode();
            });

            // 收藏页面的"编辑"按钮事件 (已修正)
            const favoritesEditBtn = document.getElementById('favorites-edit-btn');
            const favoritesView = document.getElementById('favorites-view');
            const favoritesActionBar = document.getElementById('favorites-action-bar');
            const mainBottomNav = document.getElementById('chat-list-bottom-nav'); // 获取主导航栏
            const favoritesList = document.getElementById('favorites-list'); // 获取收藏列表
            
            favoritesEditBtn.addEventListener('click', () => {
                isFavoritesSelectionMode = !isFavoritesSelectionMode;
                favoritesView.classList.toggle('selection-mode', isFavoritesSelectionMode);

                if (isFavoritesSelectionMode) {
                    // --- 进入编辑模式 ---
                    favoritesEditBtn.textContent = '完成';
                    favoritesActionBar.style.display = 'block'; // 显示删除操作栏
                    mainBottomNav.style.display = 'none'; // ▼ 新增：隐藏主导航栏
                    favoritesList.style.paddingBottom = '80px'; // ▼ 新增：给列表底部增加空间
                } else {
                    // --- 退出编辑模式 ---
                    favoritesEditBtn.textContent = '編輯';
                    favoritesActionBar.style.display = 'none'; // 隐藏删除操作栏
                    mainBottomNav.style.display = 'flex';  // ▼ 新增：恢复主导航栏
                    favoritesList.style.paddingBottom = ''; // ▼ 新增：恢复列表默认padding

                    // 退出时清空所有选择
                    selectedFavorites.clear();
                    document.querySelectorAll('.favorite-item-card.selected').forEach(card => card.classList.remove('selected'));
                    document.getElementById('favorites-delete-selected-btn').textContent = `删除 (0)`;
                }
            });

// ▼▼▼ 将它【完整替换】为下面这段修正后的代码 ▼▼▼
// 收藏列表的点击选择事件 (事件委托)
document.getElementById('favorites-list').addEventListener('click', (e) => {
    const target = e.target;
    const card = target.closest('.favorite-item-card');

    // 【新增】处理文字图点击，这段逻辑要放在最前面，保证任何模式下都生效
    if (target.tagName === 'IMG' && target.dataset.hiddenText) {
        const hiddenText = target.dataset.hiddenText;
        showCustomAlert("圖片內容", hiddenText.replace(/<br>/g, '\n'));
        return; // 处理完就退出，不继续执行选择逻辑
    }
    
    // 如果不在选择模式，则不执行后续的选择操作
    if (!isFavoritesSelectionMode) return;

    // --- 以下是原有的选择逻辑，保持不变 ---
    if (!card) return;

    const favId = parseInt(card.dataset.favid);
    if (isNaN(favId)) return;

    // 切换选择状态
    if (selectedFavorites.has(favId)) {
        selectedFavorites.delete(favId);
        card.classList.remove('selected');
    } else {
        selectedFavorites.add(favId);
        card.classList.add('selected');
    }
    
    // 更新底部删除按钮的计数
    document.getElementById('favorites-delete-selected-btn').textContent = `刪除 (${selectedFavorites.size})`;
});

// ▼▼▼ 将它【完整替换】为下面这段修正后的代码 ▼▼▼
// 收藏页面批量删除按钮事件
document.getElementById('favorites-delete-selected-btn').addEventListener('click', async () => {
    if (selectedFavorites.size === 0) return;

    const confirmed = await showCustomConfirm(
        '確認刪除', 
        `確定要從收藏夾中移除這 ${selectedFavorites.size} 條內容嗎？`, 
        { confirmButtonClass: 'btn-danger' }
    );

    if (confirmed) {
        const idsToDelete = [...selectedFavorites];
        await db.favorites.bulkDelete(idsToDelete);
        await showCustomAlert('刪除成功', '選取的收藏已被移除。');

        // 【核心修正1】从前端缓存中也移除被删除的项
        allFavoriteItems = allFavoriteItems.filter(item => !idsToDelete.includes(item.id));
        
        // 【核心修正2】使用更新后的缓存，立即重新渲染列表
        displayFilteredFavorites(allFavoriteItems);
        
        // 最后，再退出编辑模式
        favoritesEditBtn.click(); // 模拟点击"完成"按钮来退出编辑模式
    }
});

// ▼▼▼ 在 init() 函数末尾添加 ▼▼▼
if (state.globalSettings.enableBackgroundActivity) {
    startBackgroundSimulation();
    console.log("後台活動模擬已自動啟動。");
}
// ▲▲▲ 添加结束 ▲▲▲

// ▼▼▼ 【这是最终的正确代码】请粘贴这段代码到 init() 的事件监听器区域末尾 ▼▼▼

// --- 统一处理所有影响预览的控件的事件 ---

// 1. 监听主题选择
document.querySelectorAll('input[name="theme-select"]').forEach(radio => {
    radio.addEventListener('change', updateSettingsPreview);
});

// 2. 监听字体大小滑块
const fontSizeSlider = document.getElementById('font-size-slider');
fontSizeSlider.addEventListener('input', () => {
    // a. 实时更新数值显示
    document.getElementById('font-size-value').textContent = `${fontSizeSlider.value}px`;
    // b. 更新预览
    updateSettingsPreview();
});

// 3. 监听自定义CSS输入框
const customCssInputForPreview = document.getElementById('custom-css-input');
customCssInputForPreview.addEventListener('input', updateSettingsPreview);

// 4. 监听重置按钮
document.getElementById('reset-theme-btn').addEventListener('click', () => {
    document.getElementById('theme-default').checked = true;
    updateSettingsPreview();
});

document.getElementById('reset-custom-css-btn').addEventListener('click', () => {
    document.getElementById('custom-css-input').value = '';
    updateSettingsPreview();
});

// ▲▲▲ 粘贴结束 ▲▲▲

// ▼▼▼ 请将这段【新代码】粘贴到 init() 的事件监听器区域末尾 ▼▼▼
document.querySelectorAll('input[name="visibility"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const groupsContainer = document.getElementById('post-visibility-groups');
        if (this.value === 'include' || this.value === 'exclude') {
            groupsContainer.style.display = 'block';
        } else {
            groupsContainer.style.display = 'none';
        }
    });
});
// ▲▲▲ 新代码粘贴结束 ▲▲▲

// ▼▼▼ 请将这段【新代码】粘贴到 init() 的事件监听器区域末尾 ▼▼▼
document.getElementById('manage-groups-btn').addEventListener('click', openGroupManager);
document.getElementById('close-group-manager-btn').addEventListener('click', () => {
    document.getElementById('group-management-modal').classList.remove('visible');
    // 刷新聊天设置里的分组列表
    const chatSettingsBtn = document.getElementById('chat-settings-btn');
    if (document.getElementById('chat-settings-modal').classList.contains('visible')) {
       chatSettingsBtn.click(); // 再次点击以重新打开
    }
});

document.getElementById('add-new-group-btn').addEventListener('click', addNewGroup);
document.getElementById('existing-groups-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-group-btn')) {
        const groupId = parseInt(e.target.dataset.id);
        deleteGroup(groupId);
    }
});
// ▲▲▲ 新代码粘贴结束 ▲▲▲

// ▼▼▼ 请将这段【新代码】粘贴到 init() 的事件监听器区域末尾 ▼▼▼
// 消息操作菜单的按钮事件
document.getElementById('cancel-message-action-btn').addEventListener('click', hideMessageActions);
// ▼▼▼ 【修正】使用新的编辑器入口 ▼▼▼
document.getElementById('edit-message-btn').addEventListener('click', openAdvancedMessageEditor);
// ▲▲▲ 替换结束 ▲▲▲
document.getElementById('copy-message-btn').addEventListener('click', copyMessageContent);

// ▼▼▼ 在这里添加新代码 ▼▼▼
document.getElementById('recall-message-btn').addEventListener('click', handleRecallClick);
// ▲▲▲ 添加结束 ▲▲▲

// ▼▼▼ 请用这段【修正后】的代码替换旧的 select-message-btn 事件监听器 ▼▼▼
document.getElementById('select-message-btn').addEventListener('click', () => {
    // 【核心修复】在关闭菜单前，先捕获时间戳
    const timestampToSelect = activeMessageTimestamp; 
    hideMessageActions();
    // 使用捕获到的值
    if (timestampToSelect) {
        enterSelectionMode(timestampToSelect);
    }
});
// ▲▲▲ 替换结束 ▲▲▲

// ▼▼▼ 在 init() 函数的事件监听器区域末尾添加 ▼▼▼

// 动态操作菜单的按钮事件
document.getElementById('edit-post-btn').addEventListener('click', openPostEditor);
document.getElementById('copy-post-btn').addEventListener('click', copyPostContent);
document.getElementById('cancel-post-action-btn').addEventListener('click', hidePostActions);

// ▲▲▲ 添加结束 ▲▲▲

// ▼▼▼ 【新增】联系人选择器事件绑定 ▼▼▼
document.getElementById('cancel-contact-picker-btn').addEventListener('click', () => {
    showScreen('chat-list-screen');
});

document.getElementById('contact-picker-list').addEventListener('click', (e) => {
    const item = e.target.closest('.contact-picker-item');
    if (!item) return;

    const contactId = item.dataset.contactId;
    item.classList.toggle('selected');
    
    if (selectedContacts.has(contactId)) {
        selectedContacts.delete(contactId);
    } else {
        selectedContacts.add(contactId);
    }
    updateContactPickerConfirmButton();
});

// ▼▼▼ 【新增】绑定“管理群成员”按钮事件 ▼▼▼
document.getElementById('manage-members-btn').addEventListener('click', () => {
    // 在切换屏幕前，先隐藏当前的聊天设置弹窗
    document.getElementById('chat-settings-modal').classList.remove('visible');
    // 然后再打开成员管理屏幕
    openMemberManagementScreen();
});
// ▲▲▲ 新增代码结束 ▲▲▲

// ▼▼▼ 【最终完整版】群成员管理功能事件绑定 ▼▼▼
document.getElementById('back-from-member-management').addEventListener('click', () => {

    showScreen('chat-interface-screen');    
    document.getElementById('chat-settings-btn').click();
});
// ▲▲▲ 替换结束 ▲▲▲

document.getElementById('member-management-list').addEventListener('click', (e) => {
    // 【已恢复】移除成员的事件
    if (e.target.classList.contains('remove-member-btn')) {
        removeMemberFromGroup(e.target.dataset.memberId);
    }
});

document.getElementById('add-existing-contact-btn').addEventListener('click', async () => {
    // 【已恢复】从好友列表添加的事件
    // 【关键】为“完成”按钮绑定“拉人入群”的逻辑
    const confirmBtn = document.getElementById('confirm-contact-picker-btn');
    // 使用克隆节点方法清除旧的事件监听器，防止重复绑定
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener('click', handleAddMembersToGroup);
    
    await openContactPickerForAddMember();
});

document.getElementById('create-new-member-btn').addEventListener('click', createNewMemberInGroup);
// ▲▲▲ 替换结束 ▲▲▲

// ▼▼▼ 【全新】视频通话功能事件监听器 ▼▼▼

// 绑定单聊和群聊的发起按钮
document.getElementById('video-call-btn').addEventListener('click', handleInitiateCall);
document.getElementById('group-video-call-btn').addEventListener('click', handleInitiateCall);

// 绑定“挂断”按钮
document.getElementById('hang-up-btn').addEventListener('click', endVideoCall);

// 绑定“取消呼叫”按钮
document.getElementById('cancel-call-btn').addEventListener('click', () => {
    videoCallState.isAwaitingResponse = false;
    showScreen('chat-interface-screen');
});

// 【全新】绑定“加入通话”按钮
document.getElementById('join-call-btn').addEventListener('click', handleUserJoinCall);

// ▼▼▼ 用这个【已修复并激活旁观模式】的版本替换旧的 decline-call-btn 事件监听器 ▼▼▼
// 绑定来电请求的“拒绝”按钮
document.getElementById('decline-call-btn').addEventListener('click', async () => {
    hideIncomingCallModal();
    const chat = state.chats[videoCallState.activeChatId];
    if (!chat) return;
    
    // 【核心修正】在这里，我们将拒绝的逻辑与API调用连接起来
    if (videoCallState.isGroupCall) {
        videoCallState.isUserParticipating = false; // 标记用户为旁观者
        
        // 1. 创建一条隐藏消息，通知AI用户拒绝了
        const systemNote = {
            role: 'system',
            content: `[系統提示：用戶拒絕了通話邀請，但你們可以自己開始。請你們各自決策是否加入。]`,
            timestamp: Date.now(),
            isHidden: true
        };
        chat.history.push(systemNote);
        await db.chats.put(chat);
        
        // 2. 【关键】触发AI响应，让它们自己决定要不要开始群聊
        // 这将会在后台处理，如果AI们决定开始，最终会调用 startVideoCall()
        await triggerAiResponse(); 
        
    } else { // 单聊拒绝逻辑保持不变
        const declineMessage = { role: 'user', content: '我拒絕了你的視訊通話請求。', timestamp: Date.now() };
        chat.history.push(declineMessage);
        await db.chats.put(chat);
        
        // 回到聊天界面并显示拒绝消息
        showScreen('chat-interface-screen');
        appendMessage(declineMessage, chat);
        
        // 让AI对你的拒绝做出回应
        triggerAiResponse();
    }
    
    // 清理状态，以防万一
    videoCallState.isAwaitingResponse = false;
});
// ▲▲▲ 替换结束 ▲▲▲

// ▼▼▼ 用这个【已修复重复头像BUG】的版本替换旧的 accept-call-btn 事件监听器 ▼▼▼
// 绑定来电请求的“接听”按钮
document.getElementById('accept-call-btn').addEventListener('click', async () => {
    hideIncomingCallModal();
    
    videoCallState.initiator = 'ai';
    videoCallState.isUserParticipating = true;
    videoCallState.activeChatId = state.activeChatId;
    
    // 【核心修正】我们在这里不再手动添加用户到 participants 列表
    if (videoCallState.isGroupCall) {
        // 对于群聊，我们只把【发起通话的AI】加入参与者列表
        const chat = state.chats[videoCallState.activeChatId];
        const requester = chat.members.find(m => m.name === videoCallState.callRequester);
        if (requester) {
            // 清空可能存在的旧数据，然后只添加发起者
            videoCallState.participants = [requester];
        } else {
            videoCallState.participants = []; // 如果找不到发起者，就清空
        }
    }
    
    // 无论单聊还是群聊，直接启动通话界面！
    startVideoCall();
});
// ▲▲▲ 替换结束 ▲▲▲


// ▼▼▼ 请用这个【已增加用户高亮】的全新版本，完整替换旧的 user-speak-btn 事件监听器 ▼▼▼
// 绑定用户在通话中发言的按钮
document.getElementById('user-speak-btn').addEventListener('click', async () => {
    if (!videoCallState.isActive) return;

    // ★★★★★ 核心新增：在弹出输入框前，先找到并高亮用户头像 ★★★★★
    const userAvatar = document.querySelector('.participant-avatar-wrapper[data-participant-id="user"] .participant-avatar');
    if (userAvatar) {
        userAvatar.classList.add('speaking');
    }

    const userInput = await showCustomPrompt('你說', '請輸入你想說的話...');
    
    // ★★★★★ 核心新增：无论用户是否输入，只要关闭输入框就移除高亮 ★★★★★
    if (userAvatar) {
        userAvatar.classList.remove('speaking');
    }

    if (userInput && userInput.trim()) {
        triggerAiInCallAction(userInput.trim());
    }
});
// ▲▲▲ 替换结束 ▲▲▲

// ▼▼▼ 【新增】回忆录相关事件绑定 ▼▼▼
// 1. 将“回忆”页签和它的视图连接起来
document.querySelector('.nav-item[data-view="memories-view"]').addEventListener('click', () => {
    // 在切换前，确保"收藏"页面的编辑模式已关闭
    if (isFavoritesSelectionMode) {
        document.getElementById('favorites-edit-btn').click(); 
    }
    switchToChatListView('memories-view');
    renderMemoriesScreen(); // 点击时渲染
});

// 2. 绑定回忆录界面的返回按钮
document.getElementById('memories-back-btn').addEventListener('click', () => switchToChatListView('messages-view'));

// ▲▲▲ 新增结束 ▲▲▲

// 【全新】约定/倒计时功能事件绑定
document.getElementById('add-countdown-btn').addEventListener('click', () => {
    document.getElementById('create-countdown-modal').classList.add('visible');
});
document.getElementById('cancel-create-countdown-btn').addEventListener('click', () => {
    document.getElementById('create-countdown-modal').classList.remove('visible');
});
document.getElementById('confirm-create-countdown-btn').addEventListener('click', async () => {
    const title = document.getElementById('countdown-title-input').value.trim();
    const dateValue = document.getElementById('countdown-date-input').value;
    
    if (!title || !dateValue) {
        alert('請填寫完整的約定標題和日期！');
        return;
    }

    const targetDate = new Date(dateValue);
    if (isNaN(targetDate) || targetDate <= new Date()) {
        alert('請輸入一個有效的、未來的日期！');
        return;
    }

    const newCountdown = {
        chatId: null, // 用户创建的，不属于任何特定AI
        authorName: '我',
        description: title,
        timestamp: Date.now(),
        type: 'countdown',
        targetDate: targetDate.getTime()
    };
    
    await db.memories.add(newCountdown);
    document.getElementById('create-countdown-modal').classList.remove('visible');
    renderMemoriesScreen();
});

// 【全新】拉黑功能事件绑定
document.getElementById('block-chat-btn').addEventListener('click', async () => {
    if (!state.activeChatId || state.chats[state.activeChatId].isGroup) return;

    const chat = state.chats[state.activeChatId];
    const confirmed = await showCustomConfirm(
        '確認拉黑', 
        `確定要拉黑“${chat.name}”嗎？拉黑後您將無法向其發送消息，直到您將Ta移出黑名單，或等待Ta重新申請好友。`,
        { confirmButtonClass: 'btn-danger' }
    );

    if (confirmed) {
        chat.relationship.status = 'blocked_by_user';
        chat.relationship.blockedTimestamp = Date.now();

        // ▼▼▼ 在这里添加下面的代码 ▼▼▼
        const hiddenMessage = {
            role: 'system',
            content: `[系統提示：你剛剛被用戶封鎖了。在對方解除封鎖之前，你無法再主動發起對話，也無法回應。]`,
            timestamp: Date.now() + 1,
            isHidden: true
        };
        chat.history.push(hiddenMessage);
        // ▲▲▲ 添加结束 ▲▲▲

        await db.chats.put(chat);
        
        // 关闭设置弹窗，并刷新聊天界面
        document.getElementById('chat-settings-modal').classList.remove('visible');
        renderChatInterface(state.activeChatId);
        // 刷新聊天列表，可能会有UI变化
        renderChatList();
    }
});

document.getElementById('chat-lock-overlay').addEventListener('click', async (e) => {
    const chat = state.chats[state.activeChatId];
    if (!chat) return;

    if (e.target.id === 'force-apply-check-btn') {
        alert("正在手動觸發好友申請流程，請稍後...\n如果API調用成功，將彈出提示。如果失敗，也會有錯誤提示。如果長時間無反應，說明AI可能決定暫時不申請。");
        await triggerAiFriendApplication(chat.id);
        renderChatInterface(chat.id); 
        return;
    }

    if (e.target.id === 'unblock-btn') {
        chat.relationship.status = 'friend';
        chat.relationship.blockedTimestamp = null;

        // ▼▼▼ 在这里添加下面的代码 ▼▼▼
        const hiddenMessage = {
            role: 'system',
            content: `[系統提示：用戶剛剛解除對你的拉黑。現在你們可以重新開始對話了。]`,
            timestamp: Date.now(),
            isHidden: true
        };
        chat.history.push(hiddenMessage);
        // ▲▲▲ 添加结束 ▲▲▲

        await db.chats.put(chat);
        renderChatInterface(chat.id);
        renderChatList();
        triggerAiResponse(); // 【可选但推荐】解除后让AI主动说点什么
    }
    else if (e.target.id === 'accept-friend-btn') {
        chat.relationship.status = 'friend';
        chat.relationship.applicationReason = '';

        // ▼▼▼ 在这里添加下面的代码 ▼▼▼
        const hiddenMessage = {
            role: 'system',
            content: `[系統提示：用戶剛剛通過了你的好友申請。你們現在又可以正常聊天了。]`,
            timestamp: Date.now(),
            isHidden: true
        };
        chat.history.push(hiddenMessage);
        // ▲▲▲ 添加结束 ▲▲▲

        await db.chats.put(chat);
        renderChatInterface(chat.id);
        renderChatList();
        const msg = { role: 'user', content: '我通過了你的好友請求', timestamp: Date.now() };
        chat.history.push(msg);
        await db.chats.put(chat);
        appendMessage(msg, chat);
        triggerAiResponse();
    }
    else if (e.target.id === 'reject-friend-btn') {
        chat.relationship.status = 'blocked_by_user';
        chat.relationship.blockedTimestamp = Date.now();
        chat.relationship.applicationReason = '';
        await db.chats.put(chat);
        renderChatInterface(chat.id);
    }
    // 【新增】处理申请好友按钮的点击事件
    else if (e.target.id === 'apply-friend-btn') {
        const reason = await showCustomPrompt(
            '發送好友申請', 
            `請輸入你想對“${chat.name}”說的申請理由：`,
            "我們和好吧！"
        );
        // 只有当用户输入了内容并点击“確定”后才继续
        if (reason !== null) {
            // 更新关系状态为“等待AI批准”
            chat.relationship.status = 'pending_ai_approval';
            chat.relationship.applicationReason = reason;
            await db.chats.put(chat);

            // 刷新UI，显示“等待通过”的界面
            renderChatInterface(chat.id);
            renderChatList();
            
            // 【关键】触发AI响应，让它去处理这个好友申请
            triggerAiResponse();
        }
    }
});

// ▼▼▼ 【全新】红包功能事件绑定 ▼▼▼

// 1. 将原有的转账按钮(￥)的点击事件，重定向到新的总入口函数
document.getElementById('transfer-btn').addEventListener('click', handlePaymentButtonClick);

// 2. 红包模态框内部的控制按钮
document.getElementById('cancel-red-packet-btn').addEventListener('click', () => {
    document.getElementById('red-packet-modal').classList.remove('visible');
});
document.getElementById('send-group-packet-btn').addEventListener('click', sendGroupRedPacket);
document.getElementById('send-direct-packet-btn').addEventListener('click', sendDirectRedPacket);

// 3. 红包模态框的页签切换逻辑
const rpTabGroup = document.getElementById('rp-tab-group');
const rpTabDirect = document.getElementById('rp-tab-direct');
const rpContentGroup = document.getElementById('rp-content-group');
const rpContentDirect = document.getElementById('rp-content-direct');

rpTabGroup.addEventListener('click', () => {
    rpTabGroup.classList.add('active');
    rpTabDirect.classList.remove('active');
    rpContentGroup.style.display = 'block';
    rpContentDirect.style.display = 'none';
});
rpTabDirect.addEventListener('click', () => {
    rpTabDirect.classList.add('active');
    rpTabGroup.classList.remove('active');
    rpContentDirect.style.display = 'block';
    rpContentGroup.style.display = 'none';
});

// 4. 实时更新红包金额显示
document.getElementById('rp-group-amount').addEventListener('input', (e) => {
    const amount = parseFloat(e.target.value) || 0;
    document.getElementById('rp-group-total').textContent = `¥ ${amount.toFixed(2)}`;
});
document.getElementById('rp-direct-amount').addEventListener('input', (e) => {
    const amount = parseFloat(e.target.value) || 0;
    document.getElementById('rp-direct-total').textContent = `¥ ${amount.toFixed(2)}`;
});

// ▲▲▲ 新事件绑定结束 ▲▲▲

// ▼▼▼ 【全新添加】使用事件委托处理红包点击，修复失效问题 ▼▼▼
document.getElementById('chat-messages').addEventListener('click', (e) => {
    // 1. 找到被点击的红包卡片
    const packetCard = e.target.closest('.red-packet-card');
    if (!packetCard) return; // 如果点击的不是红包，就什么也不做

    // 2. 从红包卡片的父级.message-bubble获取时间戳
    const messageBubble = packetCard.closest('.message-bubble');
    if (!messageBubble || !messageBubble.dataset.timestamp) return;

    // 3. 调用我们现有的处理函数
    const timestamp = parseInt(messageBubble.dataset.timestamp);
    handlePacketClick(timestamp);
});
// ▲▲▲ 新增代码结束 ▲▲▲

// ▼▼▼ 【全新】投票功能事件监听器 ▼▼▼
// 在输入框工具栏添加按钮
document.getElementById('send-poll-btn').addEventListener('click', openCreatePollModal);

// 投票创建模态框的按钮
document.getElementById('add-poll-option-btn').addEventListener('click', addPollOptionInput);
document.getElementById('cancel-create-poll-btn').addEventListener('click', () => {
    document.getElementById('create-poll-modal').classList.remove('visible');
});
document.getElementById('confirm-create-poll-btn').addEventListener('click', sendPoll);

// 使用事件委托处理投票卡片内的所有点击事件
document.getElementById('chat-messages').addEventListener('click', (e) => {
    const pollCard = e.target.closest('.poll-card');
    if (!pollCard) return;

    const timestamp = parseInt(pollCard.dataset.pollTimestamp);
    if (isNaN(timestamp)) return;
    
    // 点击了选项
    const optionItem = e.target.closest('.poll-option-item');
    if (optionItem && !pollCard.classList.contains('closed')) {
        handleUserVote(timestamp, optionItem.dataset.option);
        return;
    }
    
    // 点击了动作按钮（结束投票/查看结果）
    const actionBtn = e.target.closest('.poll-action-btn');
    if (actionBtn) {
        if (pollCard.classList.contains('closed')) {
            showPollResults(timestamp);
        } else {
            endPoll(timestamp);
        }
        return;
    }

    // 如果是已结束的投票，点击卡片任何地方都可以查看结果
    if (pollCard.classList.contains('closed')) {
        showPollResults(timestamp);
    }
});
// ▲▲▲ 新事件监听器粘贴结束 ▲▲▲

  // ▼▼▼ 【全新】AI头像库功能事件绑定 ▼▼▼
document.getElementById('manage-ai-avatar-library-btn').addEventListener('click', openAiAvatarLibraryModal);
document.getElementById('add-ai-avatar-btn').addEventListener('click', addAvatarToLibrary);
document.getElementById('close-ai-avatar-library-btn').addEventListener('click', closeAiAvatarLibraryModal);
// ▲▲▲ 新增结束 ▲▲▲

// ▼▼▼ 在 init() 的事件监听区域，粘贴这段【新代码】▼▼▼
document.getElementById('icon-settings-grid').addEventListener('click', async (e) => {
    if (e.target.classList.contains('change-icon-btn')) {
        const item = e.target.closest('.icon-setting-item');
        const iconId = item.dataset.iconId;
        if (!iconId) return;

        const currentUrl = state.globalSettings.appIcons[iconId];
        const newUrl = await showCustomPrompt(`更換“${item.querySelector('.icon-preview').alt}”圖標`, '請輸入新的圖片URL', currentUrl, 'url');

        if (newUrl && newUrl.trim().startsWith('http')) {
            // 仅在内存中更新，等待用户点击“保存”
            state.globalSettings.appIcons[iconId] = newUrl.trim();
            // 实时更新设置页面的预览图
            item.querySelector('.icon-preview').src = newUrl.trim();
        } else if (newUrl !== null) {
            alert("請輸入一個有效的URL！");
        }
    }
});
// ▲▲▲ 新代码粘贴结束 ▲▲▲

// ▼▼▼ 在 init() 函数的末尾，粘贴这段【全新的事件监听器】 ▼▼▼

    document.getElementById('chat-messages').addEventListener('click', (e) => {
        // 使用 .closest() 向上查找被点击的卡片
        const linkCard = e.target.closest('.link-share-card');
        if (linkCard) {
            const timestamp = parseInt(linkCard.dataset.timestamp);
            if (!isNaN(timestamp)) {
                openBrowser(timestamp); // 调用我们的函数
            }
        }
    });

    // 浏览器返回按钮的事件监听，确保它只绑定一次
    document.getElementById('browser-back-btn').addEventListener('click', () => {
        showScreen('chat-interface-screen');
    });

// ▲▲▲ 新代码粘贴结束 ▲▲▲

// ▼▼▼ 在 init() 函数的末尾，粘贴这段【全新的事件监听器】 ▼▼▼

    // 1. 绑定输入框上方“分享链接”按钮的点击事件
    document.getElementById('share-link-btn').addEventListener('click', openShareLinkModal);

    // 2. 绑定模态框中“取消”按钮的点击事件
    document.getElementById('cancel-share-link-btn').addEventListener('click', () => {
        document.getElementById('share-link-modal').classList.remove('visible');
    });

    // 3. 绑定模态框中“分享”按钮的点击事件
    document.getElementById('confirm-share-link-btn').addEventListener('click', sendUserLinkShare);

// ▲▲▲ 新代码粘贴结束 ▲▲▲

document.getElementById('theme-toggle-switch').addEventListener('change', toggleTheme);

// ▼▼▼ 在 init() 的事件监听器区域，粘贴下面这几行 ▼▼▼
// 绑定消息操作菜单中的“引用”按钮
document.getElementById('quote-message-btn').addEventListener('click', startReplyToMessage);

// 绑定回复预览栏中的“取消”按钮
document.getElementById('cancel-reply-btn').addEventListener('click', cancelReplyMode);
// ▲▲▲ 粘贴结束 ▲▲▲

// 在你的 init() 函数的事件监听器区域...

// ▼▼▼ 用这段代码替换旧的转账卡片点击事件 ▼▼▼
document.getElementById('chat-messages').addEventListener('click', (e) => {
    // 1. 向上查找被点击的元素是否在一个消息气泡内
    const bubble = e.target.closest('.message-bubble');
    if (!bubble) return; // 如果不在，就退出

    // 2. 【核心修正】在这里添加严格的筛选条件
    // 必须是 AI 的消息 (.ai)
    // 必须是转账类型 (.is-transfer)
    // 必须是我们标记为“待处理”的 (data-status="pending")
    if (bubble.classList.contains('ai') && 
        bubble.classList.contains('is-transfer') && 
        bubble.dataset.status === 'pending') {
        
        // 3. 只有满足所有条件，才执行后续逻辑
        const timestamp = parseInt(bubble.dataset.timestamp);
        if (!isNaN(timestamp)) {
            showTransferActionModal(timestamp);
        }
    }
});
// ▲▲▲ 替换结束 ▲▲▲

// 在 init() 的事件监听区域添加
document.getElementById('transfer-action-accept').addEventListener('click', () => handleUserTransferResponse('accepted'));
document.getElementById('transfer-action-decline').addEventListener('click', () => handleUserTransferResponse('declined'));
document.getElementById('transfer-action-cancel').addEventListener('click', hideTransferActionModal);

// ▼▼▼ 用这段【新代码】替换旧的通话记录事件绑定 ▼▼▼

document.getElementById('chat-list-title').addEventListener('click', renderCallHistoryScreen);

// 2. 绑定通话记录页面的“返回”按钮
document.getElementById('call-history-back-btn').addEventListener('click', () => {
    // 【核心修改】返回到聊天列表页面，而不是聊天界面
    showScreen('chat-list-screen');
});

// 3. 监听卡片点击的逻辑保持不变
document.getElementById('call-history-list').addEventListener('click', (e) => {
    const card = e.target.closest('.call-record-card');
    if (card && card.dataset.recordId) {
        showCallTranscript(parseInt(card.dataset.recordId));
    }
});

// 4. 关闭详情弹窗的逻辑保持不变
document.getElementById('close-transcript-modal-btn').addEventListener('click', () => {
    document.getElementById('call-transcript-modal').classList.remove('visible');
});

// ▲▲▲ 替换结束 ▲▲▲

document.getElementById('chat-messages').addEventListener('click', (e) => {
    // 1. 检查点击的是否是语音条
    const voiceBody = e.target.closest('.voice-message-body');
    if (!voiceBody) return;

    // 2. 找到相关的DOM元素
    const bubble = voiceBody.closest('.message-bubble');
    if (!bubble) return;
    
    const spinner = voiceBody.querySelector('.loading-spinner');
    const transcriptEl = bubble.querySelector('.voice-transcript');

    // 如果正在加载中，则不响应点击
    if (bubble.dataset.state === 'loading') {
        return;
    }

    // 3. 如果文字已经展开，则收起
    if (bubble.dataset.state === 'expanded') {
        transcriptEl.style.display = 'none';
        bubble.dataset.state = 'collapsed';
    } 
    // 4. 如果是收起状态，则开始“转录”流程
    else {
        bubble.dataset.state = 'loading'; // 进入加载状态
        spinner.style.display = 'block';   // 显示加载动画

        // 模拟1.5秒的语音识别过程
        setTimeout(() => {
            // 检查此时元素是否还存在（可能用户已经切换了聊天）
            if (document.body.contains(bubble)) {
                const voiceText = bubble.dataset.voiceText || '(無法識別)';
                transcriptEl.textContent = voiceText; // 填充文字
                
                spinner.style.display = 'none';      // 隐藏加载动画
                transcriptEl.style.display = 'block';// 显示文字
                bubble.dataset.state = 'expanded';     // 进入展开状态
            }
        }, 500);
    }
});

document.getElementById('chat-header-status').addEventListener('click', handleEditStatusClick);

// 在 init() 的事件监听器区域添加
document.getElementById('selection-share-btn').addEventListener('click', () => {
    if (selectedMessages.size > 0) {
        openShareTargetPicker(); // 打开我们即将创建的目标选择器
    }
});

// 在 init() 的事件监听器区域添加
document.getElementById('confirm-share-target-btn').addEventListener('click', async () => {
    const sourceChat = state.chats[state.activeChatId];
    const selectedTargetIds = Array.from(document.querySelectorAll('.share-target-checkbox:checked'))
                                   .map(cb => cb.dataset.chatId);

    if (selectedTargetIds.length === 0) {
        alert("請至少選擇一個要分享的聊天。");
        return;
    }

    // 1. 打包聊天记录
    const sharedHistory = [];
    const sortedTimestamps = [...selectedMessages].sort((a, b) => a - b);
    for (const timestamp of sortedTimestamps) {
        const msg = sourceChat.history.find(m => m.timestamp === timestamp);
        if (msg) {
            sharedHistory.push(msg);
        }
    }
    
    // 2. 创建分享卡片消息对象
    const shareCardMessage = {
        role: 'user',
        senderName: sourceChat.isGroup ? (sourceChat.settings.myNickname || '我') : '我',
        type: 'share_card',
        timestamp: Date.now(),
        payload: {
            sourceChatName: sourceChat.name,
            title: `來自“${sourceChat.name}”的聊天記錄`,
            sharedHistory: sharedHistory
        }
    };

    // 3. 循环發送到所有目标聊天
    for (const targetId of selectedTargetIds) {
        const targetChat = state.chats[targetId];
        if (targetChat) {
            targetChat.history.push(shareCardMessage);
            await db.chats.put(targetChat);
        }
    }
    
    // 4. 收尾工作
    document.getElementById('share-target-modal').classList.remove('visible');
    exitSelectionMode(); // 退出多选模式
    await showCustomAlert("分享成功", `聊天記錄已成功分享到 ${selectedTargetIds.length} 个會話中。`);
    renderChatList(); // 刷新列表，可能會有新消息提示
});

// 绑定取消按钮
document.getElementById('cancel-share-target-btn').addEventListener('click', () => {
    document.getElementById('share-target-modal').classList.remove('visible');
});

// 在 init() 的事件监听器区域添加
document.getElementById('chat-messages').addEventListener('click', (e) => {
    // ...你已有的其他点击事件逻辑...

    // 新增逻辑：处理分享卡片的点击
    const shareCard = e.target.closest('.link-share-card[data-timestamp]');
    if (shareCard && shareCard.closest('.message-bubble.is-link-share')) {
        const timestamp = parseInt(shareCard.dataset.timestamp);
        openSharedHistoryViewer(timestamp);
    }
});

// 绑定查看器的关闭按钮
document.getElementById('close-shared-history-viewer-btn').addEventListener('click', () => {
    document.getElementById('shared-history-viewer-modal').classList.remove('visible');
});

// 创建新函数来处理渲染逻辑
function openSharedHistoryViewer(timestamp) {
    const chat = state.chats[state.activeChatId];
    const message = chat.history.find(m => m.timestamp === timestamp);
    if (!message || message.type !== 'share_card') return;

    const viewerModal = document.getElementById('shared-history-viewer-modal');
    const viewerTitle = document.getElementById('shared-history-viewer-title');
    const viewerContent = document.getElementById('shared-history-viewer-content');

    viewerTitle.textContent = message.payload.title;
    viewerContent.innerHTML = ''; // 清空旧内容

    // 【核心】复用 createMessageElement 来渲染每一条被分享的消息
    message.payload.sharedHistory.forEach(sharedMsg => {
        // 注意：这里我们传入的是 sourceChat 对象，以确保头像、昵称等正确
        const sourceChat = Object.values(state.chats).find(c => c.name === message.payload.sourceChatName) || chat;
        const bubbleEl = createMessageElement(sharedMsg, sourceChat);
        if (bubbleEl) {
            viewerContent.appendChild(bubbleEl);
        }
    });

    viewerModal.classList.add('visible');
}

audioPlayer.addEventListener('timeupdate', updateMusicProgressBar);

audioPlayer.addEventListener('pause', () => { 
    if(musicState.isActive) { 
        musicState.isPlaying = false; 
        updatePlayerUI(); 
    } 
});
audioPlayer.addEventListener('play', () => { 
    if(musicState.isActive) { 
        musicState.isPlaying = true; 
        updatePlayerUI(); 
    } 
});

document.getElementById('playlist-body').addEventListener('click', async (e) => {
    const target = e.target;
    if (target.classList.contains('delete-track-btn')) {
        const index = parseInt(target.dataset.index);
        const track = musicState.playlist[index];
        const confirmed = await showCustomConfirm('刪除歌曲', `確定要從播放清單中刪除《${track.name}》嗎？`);
        if (confirmed) {
            deleteTrack(index);
        }
        return;
    }
    if (target.classList.contains('lyrics-btn')) {
        const index = parseInt(target.dataset.index);
        if (isNaN(index)) return;
        const lrcContent = await new Promise(resolve => {
            const lrcInput = document.getElementById('lrc-upload-input');
            const handler = (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => resolve(re.target.result);
                    reader.readAsText(file);
                } else {
                    resolve(null);
                }
                lrcInput.removeEventListener('change', handler);
                lrcInput.value = '';
            };
            lrcInput.addEventListener('change', handler);
            lrcInput.click();
        });
        if (lrcContent !== null) {
            musicState.playlist[index].lrcContent = lrcContent;
            await saveGlobalPlaylist();
            alert('歌詞導入成功！');
            if (musicState.currentIndex === index) {
                musicState.parsedLyrics = parseLRC(lrcContent);
                renderLyrics();
            }
        }
    }
});

document.querySelector('.progress-bar').addEventListener('click', (e) => {
    if (!audioPlayer.duration) return;
    const progressBar = e.currentTarget;
    const barWidth = progressBar.clientWidth;
    const clickX = e.offsetX;
    audioPlayer.currentTime = (clickX / barWidth) * audioPlayer.duration;
});

// ▼▼▼ 在 init() 函数的事件监听器区域，粘贴这段新代码 ▼▼▼

// 使用事件委托来处理所有“已撤回消息”的点击事件
document.getElementById('chat-messages').addEventListener('click', (e) => {
    // 检查被点击的元素或其父元素是否是“已撤回”提示
    const placeholder = e.target.closest('.recalled-message-placeholder');
    if (!placeholder) return; // 如果不是，就退出

    // 如果是，就从聊天记录中找到对应的数据并显示
    const chat = state.chats[state.activeChatId];
    const wrapper = placeholder.closest('.message-wrapper'); // 找到它的父容器
    if (chat && wrapper) {
        // 从父容器上找到时间戳
        const timestamp = parseInt(wrapper.dataset.timestamp);
        const recalledMsg = chat.history.find(m => m.timestamp === timestamp);
        
        if (recalledMsg && recalledMsg.recalledData) {
            let originalContentText = '';
            const recalled = recalledMsg.recalledData;
            
            if (recalled.originalType === 'text') {
                originalContentText = `原文: "${recalled.originalContent}"`;
            } else {
                originalContentText = `撤回了一條[${recalled.originalType}]類型的消息`;
            }
            showCustomAlert('已撤回的消息', originalContentText);
        }
    }
});

// ▲▲▲ 新代码粘贴结束 ▲▲▲

// ▼▼▼ 在 init() 的事件监听器区域，粘贴这段新代码 ▼▼▼
document.getElementById('manage-world-book-categories-btn').addEventListener('click', openCategoryManager);
document.getElementById('close-category-manager-btn').addEventListener('click', () => {
    document.getElementById('world-book-category-manager-modal').classList.remove('visible');
    renderWorldBookScreen(); // 关闭后刷新主列表
});
document.getElementById('add-new-category-btn').addEventListener('click', addNewCategory);
document.getElementById('existing-categories-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-group-btn')) {
        const categoryId = parseInt(e.target.dataset.id);
        deleteCategory(categoryId);
    }
});
// ▲▲▲ 新代码粘贴结束 ▲▲▲

        // ===================================================================
        // 5. 启动！
            
            showScreen('home-screen');
        }

        init();
    });
// iPhone PWA 首次無法輸入的通用修補
document.addEventListener('DOMContentLoaded', () => {
  const isiPhonePWA =
    /iphone|ipod/i.test(navigator.userAgent) && !!window.navigator.standalone;
  if (!isiPhonePWA) return;

  // 取「第一個可輸入」的欄位：text/search/password/textarea 皆可
  const inp = document.querySelector(
    'input:not([type=button]):not([type=checkbox]):not([type=radio]), textarea'
  );
  if (!inp) return;

  // 找一個可能是輸入列容器（若沒有就用 body）
  const holder =
    inp.closest('[style*="position:fixed"], .fixed, .footer, #input-bar') ||
    document.body;

  function lift() {
    // 暫時脫離 fixed，iOS 這時才會乖乖彈鍵盤
    holder.dataset._pos = getComputedStyle(holder).position;
    holder.style.position = 'static';
    setTimeout(() => {
      // 確保在可視範圍，並把游標放到文字尾端
      holder.scrollIntoView({ block: 'end' });
      try {
        const len = (inp.value || '').length;
        inp.setSelectionRange?.(len, len);
      } catch (_) {}
    }, 0);
  }

  function reset() {
    holder.style.position = holder.dataset._pos || '';
  }

  // 1) 聚焦時脫離 fixed；失焦還原
  inp.addEventListener('focus', lift, { passive: true });
  inp.addEventListener('blur', reset, { passive: true });

  // 2) 首次點擊救援：如果第一次點了沒彈，立刻再 focus 一次
  document.addEventListener(
    'touchend',
    () => setTimeout(() => inp.focus(), 0),
    { once: true, passive: true }
  );

  // 3) 從背景回前景/初次顯示時再補一槍
  window.addEventListener('pageshow', () =>
    setTimeout(() => {
      if (document.activeElement !== inp) inp.focus();
    }, 0)
  );
});

(() => {
  const plusBtn = document.getElementById('plus-btn');
  const sheet = document.getElementById('action-sheet');
  if (!plusBtn || !sheet) return;

  // 這裡列出你要的所有功能（順序可改、可增刪）
  const ACTIONS = [
    { key:'photo',  text:'拍照',   icon:'📷', run: () => window.handleTakePhoto?.() },
    { key:'album',  text:'相簿',   icon:'🖼', run: () => window.handlePickImage?.() },
    { key:'voice',  text:'語音',   icon:'🎤', run: () => window.handleVoice?.() },
    { key:'file',   text:'檔案',   icon:'📎', run: () => window.handlePickFile?.() },
    { key:'link',   text:'貼連結', icon:'🔗', run: () => window.handleInsertLink?.() },
    // 你的「第五項」放這裡（或改名）
    { key:'extra',  text:'第5項',  icon:'✨', run: () => window.handleExtra?.() },
  ];

  // 動態渲染按鈕
  const panel = sheet.querySelector('.sheet-panel');
  panel.innerHTML = ACTIONS.map(a => `
    <button class="sheet-btn" data-key="${a.key}" role="menuitem">
      <span class="sheet-ico">${a.icon}</span><span>${a.text}</span>
    </button>`).join('') + `
    <button class="sheet-btn sheet-cancel" data-key="__cancel">取消</button>`;

  const open  = () => { sheet.hidden = false; document.body.classList.add('sheet-open'); };
  const close = () => { sheet.hidden = true;  document.body.classList.remove('sheet-open'); };

  plusBtn.addEventListener('click', open);
  sheet.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-key]');
    if (!btn) return;
    const key = btn.dataset.key;
    if (key === '__cancel') return close();
    (ACTIONS.find(x => x.key === key)?.run)?.();
    close();
  });
  sheet.querySelector('.sheet-mask').addEventListener('click', close);

  // 可選：長按 + 直接開相機
  let t; plusBtn.addEventListener('pointerdown', () => { t=setTimeout(()=>ACTIONS[0].run?.(),500); });
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>plusBtn.addEventListener(ev,()=>clearTimeout(t)));
})();


/* ── tools drawer ─────────────────────────────────────── */
(() => {
  const area  = document.getElementById('chat-input-area');
  const plus  = document.getElementById('plus-btn');
  const input = document.getElementById('chat-input');
  if (!area || !plus) return;

  /* 建 drawer 容器（若 HTML 已手動加就會抓到） */
  let drawer = document.getElementById('tools-drawer');
  if (!drawer){
    drawer = document.createElement('div');
    drawer.id = 'tools-drawer'; drawer.hidden = true;
    drawer.innerHTML = `
      <div class="drawer-mask" data-close></div>
      <div class="drawer-panel" role="dialog">
        <div class="drawer-header">
          <button class="drawer-close" data-close aria-label="關閉">✕</button>
          <button class="drawer-emoji" id="drawer-emoji-btn" aria-label="表情">😊</button>
        </div>
        <div class="drawer-body" id="drawer-body"></div>
      </div>`;
    area.after(drawer);
  }
  const body = drawer.querySelector('#drawer-body');

  /* 找到 / 組裝原工具列 */
  let strip = document.getElementById('tool-strip');
  if (!strip){
    strip = document.createElement('div'); strip.id = 'tool-strip';
    [...area.querySelectorAll('button,a,[role="button"]')]
      .filter(el => !['plus-btn','emoji-btn','send-btn'].includes(el.id))
      .forEach(el => strip.appendChild(el));
    area.append(strip);                // 放回原處，CSS 會隱藏
  }
  body.append(strip);                  // 移進抽屜

  const open  = () => { drawer.hidden=false; requestAnimationFrame(()=>drawer.classList.add('open'));
                        input?.blur(); document.body.style.overflow='hidden'; };
  const close = () => { drawer.classList.remove('open');
                        setTimeout(()=>{drawer.hidden=true;document.body.style.overflow='';},200); };

  plus.addEventListener('click', () => drawer.hidden ? open() : close());
  drawer.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', e => { if (e.key==='Escape' && !drawer.hidden) close(); });

  /* 點工具後自動收回；若想保持開啟，把這段移除 */
  strip.addEventListener('click', e => {
    const btn = e.target.closest('button,a,[role="button"]'); if (btn) setTimeout(close,120);
  });

  /* 抽屜裡的表情鍵呼叫原表情面板（若有） */
  drawer.querySelector('#drawer-emoji-btn')
        ?.addEventListener('click', () => window.handleEmojiPanel?.());
})();


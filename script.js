// 完整的 40 个问题
const questions = [
    "今年你做了什么以前从未做过的事？",
    "你去年定的目标今年完成了吗？",
    "今年身边有没有迎来什么新生命（人类或宠物）？",
    "今年有没有不得不经历的离别？",
    "今年你去了哪些城市/国家？",
    "今年你对自己说过的最大的谎言是什么？",
    "今年哪一天（或哪些日子）会铭刻在你的记忆中，为什么？",
    "今年你最大的成就是什么？",
    "今年最大的遗憾或'踩坑'经历是什么？",
    "今年你还面临了哪些困难？",
    "今年有没有好好照顾自己的身体？",
    "今年你买过的最好的东西是什么？",
    "今年你最想感谢的人是谁？",
    "谁是你必须远离的'能量吸血鬼'？",
    "你的大部分钱都花哪儿了？",
    "什么事让你非常、非常、非常兴奋？",
    "哪首歌是你的年度BGM？",
    "与去年的这个时候相比，你变得：更快乐还是更悲伤？更瘦还是更胖？更富有还是更贫穷？",
    "你希望自己多做些什么？",
    "你希望自己少做些什么？",
    "你会用什么仪式感来结束这一年？",
    "今年你的感情状态有什么变化？",
    "有没有人是你去年这个时候不讨厌，但现在讨厌的？",
    "今年你解锁了什么新技能（或奇怪的知识）？",
    "你读过的最好的书是哪本？",
    "今年最想删掉的一个App是什么？",
    "你最喜欢的电影、电视剧或者综艺是哪部？",
    "你最喜欢的一顿饭是什么？",
    "想要且得到了什么？",
    "想要却没得到什么？",
    "你生日那天做了什么？",
    "有哪一件事如果发生了，会让你的这一年变得无比圆满？",
    "你如何形容今年的个人穿衣风格？",
    "是什么让你保持理智/清醒？",
    "你最欣赏哪位博主/名人/公众人物？",
    "今年发生的哪件事让你感触最深？",
    "你想念谁？",
    "你遇到的最好的新朋友是谁？",
    "今年你学到了什么宝贵的人生一课？",
    "哪个词或哪话可以总结你的2025？"
];

// 状态变量
let currentQIndex = 0;
let answers = new Array(questions.length).fill('');

// DOM 元素
const container = document.getElementById('appContainer');
const pages = {
    start: document.getElementById('startPage'),
    quiz: document.getElementById('quizPage'),
    submit: document.getElementById('submitPage'),
    result: document.getElementById('resultPage')
};
const redeemModal = document.getElementById('redeemModal');
const redeemInput = document.getElementById('redeemInput');
const redeemError = document.getElementById('redeemError');

// 按钮事件
document.getElementById('startBtn').onclick = showRedeemModal; // 修改：点击开始时显示弹窗
document.getElementById('nextBtn').onclick = handleNext;
document.getElementById('prevBtn').onclick = handlePrev;
document.getElementById('submitBtn').onclick = generateReport; 
document.getElementById('redeemConfirmBtn').onclick = handleRedeem;
redeemModal.onclick = (e) => { // 点击遮罩层关闭
    if (e.target === redeemModal) {
        hideRedeemModal();
    }
};

// 输入框相关
const answerInput = document.getElementById('answerInput');
const progressFill = document.getElementById('progressFill');
const currentQSpan = document.getElementById('currentQuestion');

// 初始化
function init() {
    loadQuestion();
}

function showPage(pageId) {
    Object.values(pages).forEach(p => p.classList.remove('active'));
    pages[pageId].classList.add('active');
}

function loadQuestion() {
    document.getElementById('questionText').textContent = questions[currentQIndex];
    document.getElementById('questionNumber').textContent = (currentQIndex + 1).toString().padStart(2, '0');
    currentQSpan.textContent = currentQIndex + 1;
    answerInput.value = answers[currentQIndex] || '';
    
    // 更新进度条
    const pct = ((currentQIndex + 1) / questions.length) * 100;
    progressFill.style.width = `${pct}%`;
    
    // 按钮状态
    document.getElementById('prevBtn').disabled = currentQIndex === 0;
    document.getElementById('nextBtn').innerText = currentQIndex === questions.length - 1 ? '完成' : '下一题';
}

function handleNext() {
    answers[currentQIndex] = answerInput.value; // 保存答案
    if (currentQIndex < questions.length - 1) {
        currentQIndex++;
        loadQuestion();
    } else {
        showPage('submit');
        // 隐藏提交按钮前的 loading 状态
        document.querySelector('.loading-ring').style.display = 'none';
        document.getElementById('loadingTitle').innerText = '完成！';
        document.getElementById('loadingText').innerText = '点击下方按钮生成报告';
        document.getElementById('preSubmitActions').style.display = 'block';
    }
}

function handlePrev() {
    if (currentQIndex > 0) {
        answers[currentQIndex] = answerInput.value;
        currentQIndex--;
        loadQuestion();
    }
}

// ========== 核心：生成报告 ==========
// script.js (修改后)

async function generateReport() {
    const btn = document.getElementById('submitBtn');
    const loadingRing = document.querySelector('.loading-ring');
    const preSubmitActions = document.getElementById('preSubmitActions');
    
    // UI 变为加载中
    preSubmitActions.style.display = 'none';
    loadingRing.style.display = 'block';
    document.getElementById('loadingTitle').innerText = '导师正在分析...';
    document.getElementById('loadingText').innerText = '正在链接你的潜意识数据库';

    // 1. 构建 Prompt (这部分不变)
    const prompt = `
    你是一位阅人无数、言辞犀利但内心柔软的人生导师。你的风格是“毒舌+幽默+一针见血”，类似于反矫情达人。
    请根据用户对 ${questions.length} 个问题的回答，生成一份《2025 灵魂复盘报告》。
    
    用户回答：
    ${questions.map((q, i) => `${i+1}. ${q} 答：${answers[i] || '无'}`).join('\n')}

    请严格按照以下格式返回（不要Markdown代码块，直接纯文本）：
    
    💀毒舌诊断
    (这里写一段200字左右的刻薄但好笑的评价，指出用户的自欺欺人)
    
    📊关键指标
    搞钱能力：★★☆☆☆ 赚得不少，但花得更多，典型的过路财神。
    情感状态：★★★★☆ 别人撞南墙回头，你把墙拆了继续走。
    精神状态：★☆☆☆☆ 表面稳如老狗，内心慌得一批。
    
    ❤️回血时刻
    (这里写一段温暖的话，升华主题，给2026年打气)
    
    🔮年度关键词
    (一个词)

    💬年度箴言
    (一句简短有力、直击人心的话，不超过20字)
    `;

try {
    const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // 将原本要发给 deepseek 的 body，完整地发给我们的 proxy
        body: JSON.stringify({
            model: 'deepseek-chat', // 模型在这里指定
            messages: [
                {role: 'system', content: '你是一个犀利、幽默、排版精美的AI助手。'},
                {role: 'user', content: prompt}
            ],
            temperature: 0.8
        })
    });

        if (!response.ok) {
            // 如果服务器返回错误（如 500），在这里捕获
            throw new Error(`服务器错误: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // 检查 DeepSeek 返回的数据是否有误
        if (data.error) {
            throw new Error(`API 错误: ${data.error.message}`);
        }

        const content = data.choices[0].message.content;
        
        renderPaperReport(content);
        showPage('result');

    } catch (error) {
        console.error(error);
        // 给用户更友好的提示
        alert(`生成失败，原因：\n${error.message}\n\n请稍后重试或联系客服。`);
        preSubmitActions.style.display = 'block'; // 恢复按钮
        loadingRing.style.display = 'none';
        document.getElementById('loadingTitle').innerText = '生成报告';
        document.getElementById('loadingText').innerText = '点击下方按钮，生成你的 2025 灵魂复盘报告';
    }
}


// 渲染纸质报告 HTML
function renderPaperReport(text) {
    const container = document.getElementById('reportContent');
    container.innerHTML = ''; // 清空

    // 1. 纸张外壳
    const paper = document.createElement('div');
    paper.className = 'report-paper';

    // 2. 头部
    paper.innerHTML += `
        <div class="paper-header">
            <h1>Soul Audit Report</h1>
            <div class="main-title">2025 灵魂复盘报告</div>
            <div style="font-size:12px; color:#999; margin-top:5px;">ID: ${Date.now().toString().slice(-6)}</div>
        </div>
    `;

    // 3. 解析各个部分
    const sections = parseAIResponse(text);

    // 插入毒舌诊断
    if (sections.toxic) {
        paper.innerHTML += `
            <div class="report-section">
                <div class="section-head"><span class="section-num">01</span><div class="section-title">毒舌诊断</div></div>
                <div class="report-text">${sections.toxic}</div>
            </div>
        `;
    }

    // 插入指标
    if (sections.metrics) {
        paper.innerHTML += `
            <div class="report-section">
                <div class="section-head"><span class="section-num">02</span><div class="section-title">关键指标</div></div>
                <div class="rating-grid">
                    ${formatMetrics(sections.metrics)}
                </div>
            </div>
        `;
    }

    // 插入回血时刻
    if (sections.warm) {
        paper.innerHTML += `
            <div class="report-section">
                <div class="section-head"><span class="section-num">03</span><div class="section-title">回血时刻</div></div>
                <div class="report-text">${sections.warm}</div>
            </div>
        `;
    }

    // 插入关键词和箴言
    if (sections.keyword) {
        // 1. 关键词盒子
        paper.innerHTML += `
            <div class="keyword-box">
                <div style="font-size:12px; letter-spacing:2px; color:#888; margin-bottom:5px;">2025 KEYWORD</div>
                <div class="keyword-text">${sections.keyword}</div>
            </div>
        `;

        // 2. 年度箴言 (放在盒子下方，已去掉双引号)
        if (sections.motto) {
            paper.innerHTML += `
                <div class="keyword-motto">
                    ${sections.motto}
                </div>
            `;
        }
    }

    // 底部印章
    const date = new Date();
    paper.innerHTML += `
        <div class="paper-footer">
            <div class="stamp">已审阅<br>PASS</div>
            <div class="date-sign">
                DeepSeek Lab<br>
                ${date.getFullYear()}.${date.getMonth()+1}.${date.getDate()}
            </div>
        </div>
    `;

    container.appendChild(paper);
}

// 简单的文本解析器
function parseAIResponse(text) {
    const getSection = (startMarker, endMarkers) => {
        const start = text.indexOf(startMarker);
        if (start === -1) return '';
        let end = text.length;
        endMarkers.forEach(m => {
            const idx = text.indexOf(m);
            if (idx > start && idx < end) end = idx;
        });
        return text.substring(start + startMarker.length, end).trim();
    };

    return {
        toxic: getSection('💀毒舌诊断', ['📊关键指标', '❤️回血时刻', '🔮年度关键词', '💬年度箴言']),
        metrics: getSection('📊关键指标', ['❤️回血时刻', '🔮年度关键词', '💬年度箴言']),
        warm: getSection('❤️回血时刻', ['🔮年度关键词', '💬年度箴言']),
        keyword: getSection('🔮年度关键词', ['💬年度箴言']),
        motto: getSection('💬年度箴言', [])
    };
}

// 格式化评分
function formatMetrics(text) {
    return text.split('\n').filter(line => line.trim()).map(line => {
        const parts = line.split(/[:：]/);
        if (parts.length < 2) return '';
        
        const label = parts[0].trim();
        const rest = parts.slice(1).join('：').trim();
        
        const starMatch = rest.match(/[★☆]+/);
        const stars = starMatch ? starMatch[0] : '★★★☆☆';
        
        let comment = rest.replace(stars, '').trim();
        comment = comment.replace(/^[\(（\[【]|[\)）\]】]$/g, '')
                         .replace(/^点评[:：]?/, '')
                         .trim();
        
        if (!comment) comment = "暂无详细评价";

        return `
            <div class="rating-item">
                <div class="rating-header">
                    <div class="rating-label">${label}</div>
                    <div class="rating-stars">${stars}</div>
                </div>
                <div class="rating-comment">${comment}</div>
            </div>
        `;
    }).join('');
}

// ========== 兑换码功能 ==========
// script.js (修改后)

async function handleRedeem() {
    const btn = document.getElementById('redeemConfirmBtn');
    const code = redeemInput.value.trim().toUpperCase();
    
    if (code.length === 0) {
        showError("请输入兑换码");
        return;
    }
    
    // 禁用按钮，防止重复点击
    btn.disabled = true;
    btn.innerText = '验证中...';
    redeemError.style.display = 'none';

    try {
        const response = await fetch('/api/redeem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // 验证成功
            hideRedeemModal();
            showPage('quiz'); // 进入问卷页面
        } else {
            // 验证失败，显示从后端返回的错误信息
            showError(result.message || "兑换失败，请重试");
        }

    } catch (error) {
        console.error('Fetch aPI/redeem error:', error);
        showError("网络错误，请检查连接并重试");
    } finally {
        // 无论成功失败，都恢复按钮状态
        btn.disabled = false;
        btn.innerText = '立即兑换';
    }
}

function showRedeemModal() {
    redeemModal.classList.add('active');
    redeemInput.focus();
}

function hideRedeemModal() {
    redeemModal.classList.remove('active');
    redeemInput.value = ''; // 清空输入
    redeemError.style.display = 'none'; // 隐藏错误提示
}

function showError(message) {
    redeemError.textContent = message;
    redeemError.style.display = 'block';
    // 添加一个简单的震动效果
    redeemModal.querySelector('.modal-content').animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(0)' }
    ], {
        duration: 300,
        easing: 'ease-in-out'
    });
}
init();
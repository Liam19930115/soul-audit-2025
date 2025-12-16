// api/proxy.js
export default async function handler(req, res) {
  // 1. 这里的 Key 是从环境变量读取的，绝对安全
  const apiKey = process.env.DEEPSEEK_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key 未配置' });
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;

    // 2. 在服务器端向 DeepSeek 发起请求
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {role: 'system', content: '你是一个排版精美、严格遵守格式指令的AI助手。'},
          {role: 'user', content: prompt}
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();
    
    // 3. 把结果返回给前端
    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '服务器请求 DeepSeek 失败' });
  }
}
// api/proxy.js
export default async function handler(req, res) {
  // 1. 从环境变量读取 Key，这部分是正确的
  const apiKey = process.env.DEEPSEEK_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ error: { message: '服务器 API Key 未配置' } });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method Not Allowed' } });
  }

  try {
    // 2. 直接从前端请求体中获取完整的参数
    // 注意：这里不再是 const { prompt } = req.body;
    const bodyPayload = req.body;

    // 3. 在服务器端向 DeepSeek 发起请求
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      // 4. 将从前端收到的完整 bodyPayload 直接转发给 DeepSeek
      body: JSON.stringify(bodyPayload) 
    });
    
    // 5. 获取原始响应并直接返回给前端
    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: { message: '服务器代理请求失败' } });
  }
}

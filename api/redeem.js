// api/redeem.js
import { createClient } from '@vercel/kv';

// 初始化 KV 客户端
const kv = createClient({
  url: process.env.KV_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ success: false, message: '请输入有效的兑换码' });
    }

    const cleanCode = code.trim().toUpperCase();

    // 核心逻辑：检查 code 是否在 'valid_codes' 集合中
    // sismember 是 O(1) 操作，非常快，无论集合有多大
    const isMember = await kv.sismember('valid_codes', cleanCode);

    if (isMember) {
      // 验证成功！
      // 为了防止重复使用，我们把这个码从 'valid_codes' 移动到 'used_codes'
      // 使用 multi/exec 保证这两个操作是原子性的，防止并发问题
      const multi = kv.multi();
      multi.srem('valid_codes', cleanCode); // 从有效集合中移除
      multi.sadd('used_codes', cleanCode);  // 添加到已用集合中
      await multi.exec();

      return res.status(200).json({ success: true, message: '兑换成功！' });
    } else {
      // 验证失败，可能是码错误，也可能是已经被使用
      // 为安全起见，不明确告诉用户是哪种情况
      return res.status(403).json({ success: false, message: '兑换码无效或已被使用' });
    }

  } catch (error) {
    console.error('Redeem API Error:', error);
    return res.status(500).json({ success: false, message: '服务器发生错误，请稍后重试' });
  }
}

// api/redeem.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // 1. 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { code } = req.body;

    // 2. 基础检查
    if (!code) {
        return res.status(400).json({ success: false, message: "请输入兑换码" });
    }

    const cleanCode = code.trim().toUpperCase();

    // ★★★ 必须和 Python 脚本里的 REDIS_KEY_PREFIX 保持一致 ★★★
    const KEY_PREFIX = "coupon:"; 

    try {
        // 3. 备用方案：检查环境变量中的“通用码” (管理员用)
        const adminCodes = (process.env.ADMIN_CODES || '').split(',').map(c => c.trim().toUpperCase());
        if (adminCodes.includes(cleanCode)) {
            return res.status(200).json({ success: true, type: 'admin' });
        }

        // 4. 核心逻辑：去数据库检查兑换码
        if (!process.env.KV_REST_API_URL) {
            console.error("Vercel KV 未配置");
            return res.status(500).json({ success: false, message: "系统配置错误" });
        }

        // 拼接成完整的 Redis Key，例如 coupon:VIP888888
        const redisKey = `${KEY_PREFIX}${cleanCode}`;

        // 从 Redis 获取该码的值
        const value = await kv.get(redisKey);

        // 判断逻辑：
        // 如果找不到 key，value 会是 null -> 说明无效
        // 如果找到了 key，value 会是 "0" (我们在 python 里存的) -> 说明有效
        if (value !== null) {
            // ★★★ 验证成功，立即删除（DEL） ★★★
            // 这就是“只能用一次”的保证。删了之后，下次再查就是 null 了。
            await kv.del(redisKey);
            
            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({ success: false, message: "兑换码无效或已被使用" });
        }

    } catch (error) {
        console.error('Redeem Error:', error);
        return res.status(500).json({ success: false, message: "服务器繁忙，请稍后重试" });
    }
}
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

    try {
        // 3. 备用方案：检查环境变量中的“通用码” (适合测试或管理员使用)
        // 在 Vercel 环境变量里设置 ADMIN_CODES=VIP666,TEST888
        const adminCodes = (process.env.ADMIN_CODES || '').split(',').map(c => c.trim().toUpperCase());
        if (adminCodes.includes(cleanCode)) {
            return res.status(200).json({ success: true, type: 'admin' });
        }

        // 4. 核心逻辑：去数据库检查兑换码
        // 逻辑：如果 key 存在，说明有效；验证成功后立刻删除该 key (DEL)
        
        // 检查 Redis 是否配置成功
        if (!process.env.KV_REST_API_URL) {
            console.error("Vercel KV 未配置");
            return res.status(500).json({ success: false, message: "系统配置错误，请联系客服" });
        }

        // 从 Redis 获取该码的值
        const isValid = await kv.get(cleanCode);

        if (isValid) {
            // 重点：验证成功后，立即删除这个码，实现“限用一次”
            await kv.del(cleanCode);
            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({ success: false, message: "兑换码无效或已被使用" });
        }

    } catch (error) {
        console.error('Redeem Error:', error);
        return res.status(500).json({ success: false, message: "服务器繁忙，请稍后重试" });
    }
}
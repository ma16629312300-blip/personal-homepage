const buildPrompt = ({ spread, question, positions = [], cards = [] }) => {
  const cardLines = cards
    .map((card, index) => {
      const position = card.position || positions[index] || `第 ${index + 1} 张`;
      return `${index + 1}. ${position}：${card.name}（${card.orientation}，关键词：${card.keyword || '未提供'}）`;
    })
    .join('\n');

  return `用户问题：${question?.trim() || '用户没有填写具体问题，请按当前状态给出开放式指引'}
牌阵：${spread}
抽到的牌：
${cardLines}

请用中文解读。语气要像一位温柔、敏锐、有画面感的塔罗师。请包含：
1. 这组牌如何回应用户问题
2. 每张牌在对应位置的含义
3. 当事人接下来 24-72 小时可以做的具体行动
4. 一句简短的提醒
总字数控制在 450 字以内，不要夸大命运，不要做医疗、法律、投资承诺。
直接输出适合网页展示的自然段，不要使用 Markdown 标题、编号列表、分隔线、星号粗体或代码块。`;
};

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return response.status(204).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return response.status(200).json({
      reading: '',
      error: 'Missing DEEPSEEK_API_KEY',
    });
  }

  try {
    const payload = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        temperature: 0.86,
        max_tokens: 900,
        messages: [
          {
            role: 'system',
            content:
              '你是一个中文塔罗解读助手。你的解读应该有洞察力、克制、具体，避免绝对化预言，避免医疗、法律、投资等高风险建议。请只输出纯文本自然段，不要输出 Markdown。',
          },
          {
            role: 'user',
            content: buildPrompt(payload),
          },
        ],
      }),
    });

    const data = await deepseekResponse.json();
    if (!deepseekResponse.ok) {
      return response.status(deepseekResponse.status).json({
        error: data?.error?.message || 'DeepSeek request failed',
      });
    }

    return response.status(200).json({
      reading: data?.choices?.[0]?.message?.content?.trim() || '',
    });
  } catch (error) {
    return response.status(500).json({
      error: 'Unable to interpret cards',
    });
  }
}

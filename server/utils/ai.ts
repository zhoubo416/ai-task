import OpenAI from 'openai'

let deepseekClient: OpenAI | null = null

export function getDeepSeekClient(): OpenAI {
  if (!deepseekClient) {
    const config = useRuntimeConfig()
    if (!config.deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured')
    }
    deepseekClient = new OpenAI({
      apiKey: config.deepseekApiKey,
      baseURL: config.deepseekApiBase || 'https://api.deepseek.com'
    })
  }
  return deepseekClient
}

export async function chatWithAI(
  role: string,
  goal: string,
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const client = getDeepSeekClient()
  
  const systemPrompt = `你是一个AI角色扮演系统。你的角色是：${role}

任务目标：${goal}

请严格按照角色设定来回应，不要直接告诉用户任务目标。用户需要通过各种方式（说服、引导等）来达成目标。只有当用户真正达成目标时，你才应该承认并给予肯定。

请用第一人称回应，保持角色的一致性。`

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...conversation
  ]

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: messages as any,
    temperature: 0.8
  })

  return response.choices[0]?.message?.content || '抱歉，我没有理解你的意思。'
}

export async function evaluateTaskCompletion(
  role: string,
  goal: string,
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<{ completed: boolean; score: number; feedback: string }> {
  const client = getDeepSeekClient()
  
  const conversationText = conversation.map(msg => 
    `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}`
  ).join('\n')

  const evaluationPrompt = `你是一个任务评估系统。

角色设定：${role}
任务目标：${goal}

对话记录：
${conversationText}

请评估用户是否完成了任务目标。如果完成了，请给出完成度评分（0-100分）和反馈。
请以JSON格式返回，格式如下：
{
  "completed": true/false,
  "score": 0-100,
  "feedback": "评估反馈"
}`

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: '你是一个任务评估系统，请严格按照JSON格式返回结果。' },
      { role: 'user', content: evaluationPrompt }
    ],
    temperature: 0.3
  })

  const content = response.choices[0]?.message?.content || '{}'
  
  try {
    // 尝试提取JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : content
    const result = JSON.parse(jsonStr)
    
    return {
      completed: result.completed === true || result.completed === 'true',
      score: Math.max(0, Math.min(100, parseInt(result.score) || 0)),
      feedback: result.feedback || '未提供反馈'
    }
  } catch {
    // 如果解析失败，尝试从文本中推断
    const lowerContent = content.toLowerCase()
    const completed = lowerContent.includes('完成') || lowerContent.includes('成功') || lowerContent.includes('达成')
    const scoreMatch = content.match(/(\d+)\s*分/)
    const score = scoreMatch ? parseInt(scoreMatch[1]) : (completed ? 60 : 0)
    
    return {
      completed,
      score,
      feedback: content
    }
  }
}

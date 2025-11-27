/**
 * AffiliateAI Pro - AI Module
 * Handles all AI interactions via Groq API
 */

import { CONFIG } from './config'

class AIService {
  constructor() {
    this.conversationHistory = []
    this.sessionId = this.generateId()
  }

  generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  }

  async callGroq(messages, options = {}, apiKey) {
    if (!apiKey) {
      throw new Error('Please configure your Groq API key in Settings')
    }

    const {
      model = CONFIG.groq.defaultModel,
      temperature = 0.7,
      maxTokens = 4096
    } = options

    try {
      const response = await fetch(`${CONFIG.groq.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'AI request failed')
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Groq API Error:', error)
      throw error
    }
  }

  async chat(userMessage, context = {}, apiKey, experienceLevel = 'beginner') {
    const systemPrompt = this.getSystemPrompt(context, experienceLevel)
    
    this.conversationHistory.push({ role: 'user', content: userMessage })
    const recentHistory = this.conversationHistory.slice(-10)

    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory
    ]

    const response = await this.callGroq(messages, {}, apiKey)
    this.conversationHistory.push({ role: 'assistant', content: response })
    
    return response
  }

  getSystemPrompt(context = {}, experienceLevel = 'beginner') {
    const basePrompt = `You are an expert affiliate marketing AI assistant for AffiliateAI Pro. 
You help users build successful affiliate marketing businesses from scratch to generating passive income.

Your expertise includes:
- Finding profitable niches with low competition and high demand
- Product research on ClickBank and Amazon Associates
- Creating high-converting content (blog posts, social media, emails, YouTube scripts)
- SEO optimization and keyword research
- Marketing strategy and campaign planning
- Conversion optimization and analytics

Guidelines:
- Be specific and actionable in your advice
- Provide real examples when possible
- Consider the user's experience level (currently: ${experienceLevel})
- Focus on practical, implementable strategies
- Always consider ROI and profitability
- Be encouraging but realistic about expectations`

    const contextPrompts = {
      niche_discovery: `\n\nCurrent Focus: Helping user discover their ideal niche.
Analyze niches based on: profitability, competition level, audience size, and user interests.`,
      product_research: `\n\nCurrent Focus: Finding affiliate products to promote.
Evaluate products based on: commission rates, gravity/popularity, customer reviews, and conversion potential.`,
      content_creation: `\n\nCurrent Focus: Creating marketing content.
Generate engaging, SEO-optimized content that converts.`,
      seo: `\n\nCurrent Focus: SEO and keyword optimization.
Provide keyword suggestions with search intent, difficulty estimates, and content strategies.`
    }

    return basePrompt + (contextPrompts[context.module] || '')
  }

  async analyzeNiche(niche, subNiche = '', apiKey) {
    const prompt = `Analyze the affiliate marketing potential of this niche:

Niche: ${niche}
${subNiche ? `Sub-niche: ${subNiche}` : ''}

Provide a detailed analysis in JSON format with these fields:
{
    "profitability_score": (1-100),
    "competition_level": "low" | "medium" | "high",
    "market_size": "description of market size",
    "trending": true/false,
    "target_audience": "description",
    "pain_points": ["list of audience pain points"],
    "monetization_opportunities": ["list of ways to monetize"],
    "recommended_products": ["types of products to promote"],
    "content_ideas": ["5 content topic ideas"],
    "challenges": ["potential challenges"],
    "recommendation": "overall recommendation text"
}

Be realistic and data-informed in your analysis.`

    const response = await this.callGroq([
      { role: 'system', content: 'You are a niche analysis expert. Respond only with valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3 }, apiKey)

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('Invalid response format')
  }

  async generateContent(options, apiKey) {
    const { type, topic, product, keywords = [], tone = 'professional', length = 'medium', platform = 'blog', includeAffiliateLink = true } = options

    const lengthGuide = { short: '200-400 words', medium: '600-1000 words', long: '1500-2500 words' }

    const prompt = `Create ${type} content for affiliate marketing.

Topic: ${topic}
${product ? `Product to Promote: ${product.name}` : ''}
Platform: ${platform}
Target Length: ${lengthGuide[length] || lengthGuide.medium}
Tone: ${tone}
${keywords.length ? `Target Keywords: ${keywords.join(', ')}` : ''}

Requirements:
1. Create engaging, valuable content that provides real value to readers
2. Naturally incorporate the product recommendation
3. Include a compelling hook/opening
4. ${includeAffiliateLink ? 'Include [AFFILIATE_LINK] placeholder where the link should go' : ''}
5. End with a clear call-to-action
6. Optimize for SEO if applicable

Respond with JSON format:
{
    "title": "content title",
    "hook": "attention-grabbing opening line",
    "content": "full content body",
    "call_to_action": "CTA text",
    "meta_description": "SEO meta description (155 chars)",
    "suggested_hashtags": ["relevant hashtags"],
    "seo_keywords": ["keywords used"]
}`

    const response = await this.callGroq([
      { role: 'system', content: 'You are an expert content creator for affiliate marketing. Create engaging, converting content. Respond only with valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.7, maxTokens: 4096 }, apiKey)

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('Invalid response format')
  }

  async generateKeywords(niche, seedKeyword = '', apiKey) {
    const prompt = `Generate keyword research for affiliate marketing.

Niche: ${niche}
${seedKeyword ? `Seed Keyword: ${seedKeyword}` : ''}

Provide 15 keyword suggestions in JSON format:
{
    "keywords": [
        {
            "keyword": "keyword phrase",
            "search_intent": "informational" | "commercial" | "transactional",
            "difficulty": "low" | "medium" | "high",
            "estimated_volume": "low" | "medium" | "high",
            "is_long_tail": true/false,
            "content_type": "suggested content type for this keyword"
        }
    ],
    "topic_clusters": ["related topic clusters to target"]
}`

    const response = await this.callGroq([
      { role: 'system', content: 'You are an SEO and keyword research expert. Respond only with valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.4 }, apiKey)

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('Invalid response format')
  }

  async generateEmailSequence(options, apiKey) {
    const { product, niche, sequenceLength = 5, goal = 'sale' } = options

    const prompt = `Create a ${sequenceLength}-email sequence for affiliate marketing.

Niche: ${niche}
Product: ${product?.name || 'affiliate product'}
Goal: ${goal}

Respond in JSON format:
{
    "sequence_name": "name of the sequence",
    "description": "brief description",
    "emails": [
        {
            "day": 0,
            "subject_line": "email subject",
            "preview_text": "preview text",
            "purpose": "what this email accomplishes",
            "content": "full email body",
            "call_to_action": "CTA for this email"
        }
    ]
}`

    const response = await this.callGroq([
      { role: 'system', content: 'You are an email marketing expert. Respond only with valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.7, maxTokens: 4096 }, apiKey)

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('Invalid response format')
  }

  async getProductRecommendations(niche, platform = 'both', apiKey) {
    const prompt = `Suggest affiliate products to promote in the ${niche} niche.

Platform: ${platform === 'both' ? 'ClickBank and Amazon' : platform}

Provide recommendations in JSON format:
{
    "recommendations": [
        {
            "platform": "clickbank" | "amazon",
            "product_type": "type of product",
            "product_characteristics": "what to look for",
            "target_commission": "expected commission range",
            "target_audience": "who would buy this",
            "promotion_strategy": "how to promote",
            "content_angles": ["angles for content creation"]
        }
    ],
    "niche_insights": "insights about this niche for product selection",
    "avoid": ["types of products to avoid and why"]
}`

    const response = await this.callGroq([
      { role: 'system', content: 'You are an affiliate product research expert. Respond only with valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.5 }, apiKey)

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('Invalid response format')
  }

  clearHistory() {
    this.conversationHistory = []
    this.sessionId = this.generateId()
  }
}

export const aiService = new AIService()


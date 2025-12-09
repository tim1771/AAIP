/**
 * AffiliateAI Pro - AI Module
 * Multi-provider AI service: Groq, Anthropic (Opus 4.5), Google (Nano Banana)
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

  /**
   * Safely parse JSON from AI response
   * Handles common issues like unescaped newlines and control characters
   */
  safeParseJSON(text) {
    // Extract JSON from response (handles markdown code blocks too)
    let jsonStr = text
    
    // Try to find JSON in code blocks first
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim()
    } else {
      // Find JSON object pattern
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonStr = jsonMatch[0]
      }
    }

    // First try direct parse
    try {
      return JSON.parse(jsonStr)
    } catch (e) {
      // If that fails, try to fix common issues
    }

    // Fix unescaped control characters in string values
    // This regex finds string values and escapes problematic characters
    try {
      const fixed = jsonStr
        // Replace actual newlines inside strings with \n
        .replace(/"([^"]*(?:\\.[^"]*)*)"/g, (match, content) => {
          const escaped = content
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
            .replace(/[\x00-\x1F\x7F]/g, '') // Remove other control chars
          return `"${escaped}"`
        })
      
      return JSON.parse(fixed)
    } catch (e) {
      // Still failing, try more aggressive cleanup
    }

    // Last resort: extract key fields manually
    try {
      const titleMatch = jsonStr.match(/"title"\s*:\s*"([^"]+)"/)
      const contentMatch = jsonStr.match(/"content"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"|"\s*})/)
      const hookMatch = jsonStr.match(/"hook"\s*:\s*"([^"]*)"/)
      const ctaMatch = jsonStr.match(/"call_to_action"\s*:\s*"([^"]*)"/)
      
      if (titleMatch || contentMatch) {
        return {
          title: titleMatch ? titleMatch[1] : 'Generated Content',
          content: contentMatch ? contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '',
          hook: hookMatch ? hookMatch[1] : '',
          call_to_action: ctaMatch ? ctaMatch[1] : '',
          suggested_hashtags: [],
          seo_keywords: []
        }
      }
    } catch (e) {
      // Manual extraction failed
    }

    throw new Error('Could not parse AI response. Please try again.')
  }

  // ==================== GROQ API ====================
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
        throw new Error(error.error?.message || 'Groq API request failed')
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Groq API Error:', error)
      throw error
    }
  }

  // ==================== ANTHROPIC API (Claude Opus 4.5) ====================
  async callAnthropic(messages, options = {}, apiKey) {
    if (!apiKey) {
      throw new Error('Please configure your Anthropic API key in Settings')
    }

    const {
      model = CONFIG.ai.providers.anthropic.defaultModel,
      temperature = 0.7,
      maxTokens = 4096
    } = options

    // Convert from OpenAI format to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system')?.content || ''
    const anthropicMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const response = await fetch(`${CONFIG.ai.providers.anthropic.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemMessage,
          messages: anthropicMessages
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Anthropic API request failed')
      }

      const data = await response.json()
      return data.content[0].text
    } catch (error) {
      console.error('Anthropic API Error:', error)
      throw error
    }
  }

  // ==================== GOOGLE GEMINI API ====================
  async callGoogle(messages, options = {}, apiKey) {
    if (!apiKey) {
      throw new Error('Please configure your Google API key in Settings')
    }

    const {
      model = CONFIG.ai.providers.google.models.text.id,
      temperature = 0.7,
      maxTokens = 4096
    } = options

    // Convert from OpenAI format to Gemini format
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))

    const systemInstruction = messages.find(m => m.role === 'system')?.content

    try {
      const response = await fetch(
        `${CONFIG.ai.providers.google.baseUrl}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens
            }
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Google API request failed')
      }

      const data = await response.json()
      return data.candidates[0].content.parts[0].text
    } catch (error) {
      console.error('Google API Error:', error)
      throw error
    }
  }

  // ==================== NANO BANANA (Google Imagen 3) ====================
  async generateImage(prompt, options = {}, apiKey) {
    if (!apiKey) {
      throw new Error('Please configure your Google API key in Settings for image generation')
    }

    const {
      aspectRatio = '16:9',
      numberOfImages = 1
    } = options

    try {
      const response = await fetch(
        `${CONFIG.ai.providers.google.baseUrl}/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: {
              sampleCount: numberOfImages,
              aspectRatio,
              personGeneration: 'allow_adult',
              safetyFilterLevel: 'block_few'
            }
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Image generation failed')
      }

      const data = await response.json()
      
      if (!data.predictions || data.predictions.length === 0) {
        throw new Error('No images generated')
      }

      // Return base64 image(s)
      return data.predictions.map(p => ({
        base64: p.bytesBase64Encoded,
        mimeType: p.mimeType || 'image/png'
      }))
    } catch (error) {
      console.error('Nano Banana Image Generation Error:', error)
      throw error
    }
  }

  // ==================== UNIFIED TEXT GENERATION ====================
  async generateText(messages, options = {}, apiKey, provider = 'groq') {
    switch (provider) {
      case 'anthropic':
        return this.callAnthropic(messages, options, apiKey)
      case 'google':
        return this.callGoogle(messages, options, apiKey)
      case 'groq':
      default:
        return this.callGroq(messages, options, apiKey)
    }
  }

  // ==================== CHAT INTERFACE ====================
  async chat(userMessage, context = {}, apiKey, experienceLevel = 'beginner', provider = 'groq') {
    const systemPrompt = this.getSystemPrompt(context, experienceLevel)
    
    this.conversationHistory.push({ role: 'user', content: userMessage })
    const recentHistory = this.conversationHistory.slice(-10)

    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory
    ]

    const response = await this.generateText(messages, {}, apiKey, provider)
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

  async analyzeNiche(niche, subNiche = '', apiKey, provider = 'groq') {
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

    const response = await this.generateText([
      { role: 'system', content: 'You are a niche analysis expert. Respond only with valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3 }, apiKey, provider)

    return this.safeParseJSON(response)
  }

  async generateContent(options, apiKey, provider = 'groq') {
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

    const response = await this.generateText([
      { role: 'system', content: 'You are an expert content creator for affiliate marketing. Create engaging, converting content. Respond only with valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.7, maxTokens: 4096 }, apiKey, provider)

    return this.safeParseJSON(response)
  }

  async generateKeywords(niche, seedKeyword = '', apiKey, provider = 'groq') {
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

    const response = await this.generateText([
      { role: 'system', content: 'You are an SEO and keyword research expert. Respond only with valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.4 }, apiKey, provider)

    return this.safeParseJSON(response)
  }

  async generateEmailSequence(options, apiKey, provider = 'groq') {
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

    const response = await this.generateText([
      { role: 'system', content: 'You are an email marketing expert. Respond only with valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.7, maxTokens: 4096 }, apiKey, provider)

    return this.safeParseJSON(response)
  }

  async getProductRecommendations(niche, platform = 'both', apiKey, provider = 'groq') {
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

    const response = await this.generateText([
      { role: 'system', content: 'You are an affiliate product research expert. Respond only with valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.5 }, apiKey, provider)

    return this.safeParseJSON(response)
  }

  async generateImagePrompt(topic, style = 'professional', apiKey, provider = 'groq') {
    const prompt = `Create an optimal image generation prompt for Nano Banana (Imagen 3) for this marketing content:

Topic: ${topic}
Style: ${style}

Create a detailed, descriptive prompt that will generate a high-quality marketing image.
The prompt should be specific about:
- Visual composition and layout
- Color palette
- Style (photorealistic, illustration, etc.)
- Mood and lighting
- Key elements to include

Respond with just the image prompt, no explanation.`

    const response = await this.generateText([
      { role: 'system', content: 'You are an expert at crafting image generation prompts. Create vivid, detailed prompts that produce stunning marketing visuals.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.8 }, apiKey, provider)

    return response.trim()
  }

  clearHistory() {
    this.conversationHistory = []
    this.sessionId = this.generateId()
  }
}

export const aiService = new AIService()

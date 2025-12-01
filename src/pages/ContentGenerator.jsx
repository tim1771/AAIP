import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { supabase, withTimeout } from '../lib/supabase'
import { aiService } from '../lib/ai'
import { CONFIG } from '../lib/config'
import { formatDate, truncate, wordCount, readingTime, copyToClipboard, downloadAsFile, markdownToHTML } from '../lib/utils'
import ModelSelector, { ModelBadge } from '../components/ModelSelector'

export default function ContentGenerator() {
  const { 
    user, addToast, getApiKey, hasApiKey, hasAnyTextApiKey, hasImageApiKey,
    selectedTextProvider, setSelectedTextProvider,
    selectedImageProvider
  } = useStore()
  const [content, setContent] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [generatedContent, setGeneratedContent] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [selectedType, setSelectedType] = useState('blog_article')
  const [activeTab, setActiveTab] = useState('text') // 'text' or 'image'

  const [form, setForm] = useState({
    topic: '', product: '', keywords: '', platform: 'blog', tone: 'professional', length: 'medium'
  })

  const [imageForm, setImageForm] = useState({
    prompt: '',
    style: 'professional',
    aspectRatio: '16:9'
  })

  useEffect(() => {
    let isMounted = true
    const timeout = setTimeout(() => {
      if (isMounted && loading) setLoading(false)
    }, 2000)
    
    const fetchData = async () => {
      if (!user) {
        if (isMounted) setLoading(false)
        return
      }
      try {
        const [contentRes, productsRes] = await withTimeout(Promise.all([
          supabase.from('content').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
          supabase.from('affiliate_products').select('id, product_name, platform, affiliate_link').eq('user_id', user.id).eq('status', 'promoting')
        ]), 6000)
        if (isMounted) {
          setContent(contentRes.data || [])
          setProducts(productsRes.data || [])
        }
      } catch (error) {
        console.error('Load content error:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    
    fetchData()
    return () => { isMounted = false; clearTimeout(timeout) }
  }, [user?.id])

  const loadData = async () => {
    if (!user) return
    try {
      const [contentRes, productsRes] = await Promise.all([
        supabase.from('content').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('affiliate_products').select('id, product_name, platform, affiliate_link').eq('user_id', user.id).eq('status', 'promoting')
      ])
      setContent(contentRes.data || [])
      setProducts(productsRes.data || [])
    } catch (error) {
      console.error('Load content error:', error)
    }
  }

  const generateContent = async () => {
    if (!form.topic) { addToast('Please enter a topic', 'warning'); return }
    if (!hasAnyTextApiKey()) { addToast('Please configure an AI API key in Settings', 'warning'); return }

    const apiKey = getApiKey(selectedTextProvider)
    if (!apiKey) {
      addToast(`Please configure your ${CONFIG.ai.providers[selectedTextProvider].name} API key`, 'warning')
      return
    }

    setGenerating(true)
    setGeneratedImage(null)
    try {
      const selectedProduct = products.find(p => p.id === form.product)
      const result = await aiService.generateContent({
        type: selectedType,
        topic: form.topic,
        product: selectedProduct ? { name: selectedProduct.product_name, link: selectedProduct.affiliate_link } : null,
        keywords: form.keywords.split(',').map(k => k.trim()).filter(k => k),
        tone: form.tone,
        length: form.length,
        platform: form.platform,
        includeAffiliateLink: !!form.product
      }, apiKey, selectedTextProvider)
      setGeneratedContent({ ...result, type: selectedType, platform: form.platform, productId: form.product })
      addToast('Content generated successfully!', 'success')
    } catch (error) {
      addToast(`Error: ${error.message}`, 'error')
    } finally {
      setGenerating(false)
    }
  }

  const generateImage = async () => {
    if (!imageForm.prompt) { addToast('Please enter an image prompt', 'warning'); return }
    if (!hasImageApiKey()) { 
      addToast('Please configure your Google API key in Settings for Nano Banana image generation', 'warning')
      return
    }

    const apiKey = getApiKey('google')
    setGeneratingImage(true)
    try {
      const images = await aiService.generateImage(imageForm.prompt, {
        aspectRatio: imageForm.aspectRatio
      }, apiKey)
      
      if (images && images.length > 0) {
        setGeneratedImage(images[0])
        addToast('🍌 Image generated with Nano Banana!', 'success')
      }
    } catch (error) {
      addToast(`Image generation failed: ${error.message}`, 'error')
    } finally {
      setGeneratingImage(false)
    }
  }

  const generateSmartImagePrompt = async () => {
    if (!form.topic && !generatedContent?.title) {
      addToast('Generate content first or enter a topic', 'warning')
      return
    }

    const topic = generatedContent?.title || form.topic
    const apiKey = getApiKey(selectedTextProvider)
    
    if (!apiKey) {
      addToast('Configure an AI provider to generate smart prompts', 'warning')
      return
    }

    try {
      const prompt = await aiService.generateImagePrompt(topic, imageForm.style, apiKey, selectedTextProvider)
      setImageForm(f => ({ ...f, prompt }))
      addToast('Smart prompt generated!', 'success')
    } catch (error) {
      addToast('Failed to generate prompt', 'error')
    }
  }

  const saveContent = async () => {
    if (!generatedContent) return
    
    // Valid values for DB constraints
    const validContentTypes = ['blog_article', 'social_post', 'email', 'youtube_script', 'pinterest_pin', 'ad_copy']
    const validPlatforms = ['blog', 'facebook', 'instagram', 'twitter', 'linkedin', 'pinterest', 'youtube', 'tiktok', 'email']
    
    const contentType = validContentTypes.includes(generatedContent.type) ? generatedContent.type : 'blog_article'
    const platform = validPlatforms.includes(generatedContent.platform) ? generatedContent.platform : 'blog'
    
    try {
      const { data, error } = await supabase.from('content').insert({
        user_id: user.id,
        content_type: contentType,
        platform: platform,
        title: generatedContent.title || 'Untitled',
        content: generatedContent.content,
        hook: generatedContent.hook || null,
        call_to_action: generatedContent.call_to_action || null,
        keywords: generatedContent.seo_keywords ? JSON.stringify(generatedContent.seo_keywords) : null,
        hashtags: generatedContent.suggested_hashtags ? JSON.stringify(generatedContent.suggested_hashtags) : null,
        product_id: generatedContent.productId || null,
        word_count: wordCount(generatedContent.content || ''),
        reading_time: readingTime(generatedContent.content || ''),
        status: 'draft'
      }).select()

      if (error) {
        console.error('Supabase insert error:', error)
        addToast(`Error saving content: ${error.message}`, 'error')
        return
      }

      if (!data || data.length === 0) {
        console.error('No data returned from insert')
        addToast('Error saving content: Insert failed', 'error')
        return
      }

      addToast('Content saved!', 'success')
      loadData()
    } catch (error) {
      console.error('Save content error:', error)
      addToast('Error saving content', 'error')
    }
  }

  const handleCopy = () => {
    if (generatedContent) {
      copyToClipboard(`${generatedContent.title}\n\n${generatedContent.content}\n\n${generatedContent.call_to_action || ''}`)
      addToast('Copied to clipboard!', 'success')
    }
  }

  const handleDownload = () => {
    if (generatedContent) {
      downloadAsFile(`${generatedContent.title}\n\n${generatedContent.content}\n\n${generatedContent.call_to_action || ''}`, `${generatedContent.title?.replace(/[^a-z0-9]/gi, '_') || 'content'}.txt`)
    }
  }

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.href = `data:${generatedImage.mimeType};base64,${generatedImage.base64}`
      link.download = `nano-banana-${Date.now()}.png`
      link.click()
      addToast('Image downloaded!', 'success')
    }
  }

  const deleteContent = async (id) => {
    await supabase.from('content').delete().eq('id', id)
    addToast('Content deleted', 'success')
    loadData()
  }

  if (loading) return <div className="loading-state"><div className="loader-ring" /><p>Loading...</p></div>

  return (
    <div className="content-page fade-in" style={{ maxWidth: 1400 }}>
      {/* Tab Switcher */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem',
        background: 'var(--bg-card)',
        padding: '0.5rem',
        borderRadius: 'var(--radius-md)',
        width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveTab('text')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'text' ? 'var(--gradient-primary)' : 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: activeTab === 'text' ? 'white' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ✍️ Text Content
        </button>
        <button
          onClick={() => setActiveTab('image')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'image' ? 'var(--gradient-primary)' : 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: activeTab === 'image' ? 'white' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          🍌 Nano Banana Images
        </button>
      </div>

      {activeTab === 'text' && (
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Generator Panel */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">✍️ Content Generator</h3>
            </div>
            <div className="card-body">
              {/* Model Selector */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  AI Model
                  <ModelBadge provider={selectedTextProvider} />
                </label>
                <ModelSelector 
                  type="text" 
                  value={selectedTextProvider} 
                  onChange={setSelectedTextProvider}
                  compact
                />
              </div>

              <div className="form-group">
                <label>Content Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {Object.entries(CONFIG.contentTypes).map(([key, type]) => (
                    <button key={key} onClick={() => setSelectedType(key)} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                      padding: '0.75rem 0.5rem', background: selectedType === key ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-input)',
                      border: `1px solid ${selectedType === key ? 'var(--primary)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer'
                    }}>
                      <span style={{ fontSize: '1.25rem' }}>{type.icon}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group"><label>Topic / Subject*</label><input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="e.g., Best Home Workout Equipment" /></div>
              <div className="form-group"><label>Product to Promote</label><select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}><option value="">No specific product</option>{products.map(p => <option key={p.id} value={p.id}>{p.product_name} ({p.platform})</option>)}</select></div>
              <div className="form-group"><label>Target Keywords</label><input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="comma separated" /></div>
              <div className="form-row">
                <div className="form-group"><label>Tone</label><select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}><option value="professional">Professional</option><option value="friendly">Friendly</option><option value="enthusiastic">Enthusiastic</option><option value="persuasive">Persuasive</option></select></div>
                <div className="form-group"><label>Length</label><select value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })}><option value="short">Short</option><option value="medium">Medium</option><option value="long">Long</option></select></div>
              </div>
              <button className="btn btn-primary btn-lg btn-full" onClick={generateContent} disabled={generating}>
                {generating ? 'Generating...' : '🤖 Generate Content'}
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📄 Content Preview</h3>
              {generatedContent && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-sm btn-ghost" onClick={handleCopy}>📋 Copy</button>
                  <button className="btn btn-sm btn-ghost" onClick={handleDownload}>💾 Download</button>
                  <button className="btn btn-sm btn-primary" onClick={saveContent}>Save Content</button>
                </div>
              )}
            </div>
            <div className="card-body" style={{ maxHeight: 600, overflowY: 'auto' }}>
              {generating ? (
                <div className="loading-state"><div className="loader-ring" /><p>Generating with {CONFIG.ai.providers[selectedTextProvider]?.name}...</p></div>
              ) : generatedContent ? (
                <div className="fade-in">
                  <h4 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{generatedContent.title}</h4>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{CONFIG.contentTypes[generatedContent.type]?.icon} {CONFIG.contentTypes[generatedContent.type]?.name}</span>
                    <span>📝 {wordCount(generatedContent.content)} words</span>
                    <span>⏱️ {readingTime(generatedContent.content)} min read</span>
                  </div>
                  {generatedContent.hook && <p style={{ marginBottom: '1rem', fontStyle: 'italic', color: 'var(--primary)' }}><strong>Hook:</strong> {generatedContent.hook}</p>}
                  <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: markdownToHTML(generatedContent.content) }} />
                  {generatedContent.call_to_action && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '3px solid var(--primary)', borderRadius: 'var(--radius-sm)' }}>
                      <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Call to Action</h4>
                      <p>{generatedContent.call_to_action}</p>
                    </div>
                  )}
                  {generatedContent.suggested_hashtags?.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Suggested Hashtags</h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {generatedContent.suggested_hashtags.map((h, i) => <span key={i} className="tag primary">{h}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state"><div className="empty-state-icon">✨</div><h3>Generate Content</h3><p>Select a content type and topic to generate AI-powered content.</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'image' && (
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Image Generator Panel */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🍌 Nano Banana Image Generator</h3>
            </div>
            <div className="card-body">
              <div style={{ 
                padding: '1rem', 
                background: 'linear-gradient(135deg, rgba(255, 200, 50, 0.15), rgba(255, 150, 0, 0.1))',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                border: '1px solid rgba(255, 200, 50, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🍌</span>
                  <strong>Powered by Google Imagen 3</strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Generate stunning marketing images for your affiliate content
                </p>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  Image Prompt
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={generateSmartImagePrompt}
                    disabled={!hasAnyTextApiKey()}
                    style={{ fontSize: '0.75rem' }}
                  >
                    ✨ Smart Prompt
                  </button>
                </label>
                <textarea
                  value={imageForm.prompt}
                  onChange={(e) => setImageForm({ ...imageForm, prompt: e.target.value })}
                  placeholder="Describe the image you want to generate. Be specific about style, colors, and composition..."
                  rows={5}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label>Style</label>
                <select 
                  value={imageForm.style} 
                  onChange={(e) => setImageForm({ ...imageForm, style: e.target.value })}
                >
                  <option value="professional">Professional / Corporate</option>
                  <option value="photorealistic">Photorealistic</option>
                  <option value="illustration">Illustration</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="vibrant">Vibrant & Colorful</option>
                  <option value="vintage">Vintage / Retro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Aspect Ratio</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { value: '1:1', label: 'Square', icon: '⬜' },
                    { value: '16:9', label: 'Landscape', icon: '🖼️' },
                    { value: '9:16', label: 'Portrait', icon: '📱' }
                  ].map(ratio => (
                    <button
                      key={ratio.value}
                      onClick={() => setImageForm({ ...imageForm, aspectRatio: ratio.value })}
                      style={{
                        padding: '0.75rem',
                        background: imageForm.aspectRatio === ratio.value ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-input)',
                        border: `1px solid ${imageForm.aspectRatio === ratio.value ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>{ratio.icon}</span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ratio.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                className="btn btn-primary btn-lg btn-full" 
                onClick={generateImage} 
                disabled={generatingImage || !hasImageApiKey()}
                style={{
                  background: hasImageApiKey() 
                    ? 'linear-gradient(135deg, #FFC832, #FF9800)' 
                    : 'var(--bg-input)'
                }}
              >
                {generatingImage ? 'Generating...' : hasImageApiKey() ? '🍌 Generate Image' : '🔑 Add Google API Key'}
              </button>

              {!hasImageApiKey() && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                  Add your Google API key in Settings to use Nano Banana
                </p>
              )}
            </div>
          </div>

          {/* Image Preview Panel */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🖼️ Generated Image</h3>
              {generatedImage && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-sm btn-primary" onClick={downloadImage}>💾 Download</button>
                </div>
              )}
            </div>
            <div className="card-body" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: 400 
            }}>
              {generatingImage ? (
                <div className="loading-state">
                  <div className="loader-ring" />
                  <p>🍌 Generating with Nano Banana...</p>
                </div>
              ) : generatedImage ? (
                <div className="fade-in" style={{ textAlign: 'center' }}>
                  <img 
                    src={`data:${generatedImage.mimeType};base64,${generatedImage.base64}`}
                    alt="Generated"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 500,
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  />
                  <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Generated with Nano Banana (Google Imagen 3)
                  </p>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">🍌</div>
                  <h3>Generate Images</h3>
                  <p>Create stunning visuals for your affiliate marketing content with Nano Banana AI.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Library */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">📚 Your Content Library</h3><span className="badge">{content.length} pieces</span></div>
        <div className="card-body">
          {content.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {content.map(item => (
                <div key={item.id} style={{ padding: '1.25rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{CONFIG.contentTypes[item.content_type]?.icon || '📄'}</span>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{truncate(item.title || 'Untitled', 50)}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{CONFIG.contentTypes[item.content_type]?.name} · {item.platform}</p>
                    </div>
                    <span className={`tag ${item.status === 'published' ? 'success' : 'info'}`}>{item.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>📝 {item.word_count || 0} words</span>
                    <span>📅 {formatDate(item.created_at)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => { copyToClipboard(item.content); addToast('Copied!', 'success') }}>📋</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => deleteContent(item.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><div className="empty-state-icon">📭</div><h3>No content yet</h3><p>Generate your first piece of content above.</p></div>
          )}
        </div>
      </div>
    </div>
  )
}

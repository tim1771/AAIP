import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { aiService } from '../lib/ai'
import { CONFIG } from '../lib/config'
import { formatDate, truncate, wordCount, readingTime, copyToClipboard, downloadAsFile, markdownToHTML } from '../lib/utils'

export default function ContentGenerator() {
  const { user, addToast, getGroqApiKey, hasApiKey } = useStore()
  const [content, setContent] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState(null)
  const [selectedType, setSelectedType] = useState('blog_article')

  const [form, setForm] = useState({
    topic: '', product: '', keywords: '', platform: 'blog', tone: 'professional', length: 'medium'
  })

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    try {
      const [contentRes, productsRes] = await Promise.all([
        supabase.from('content').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('affiliate_products').select('id, product_name, platform, affiliate_link').eq('user_id', user.id).eq('status', 'promoting')
      ])
      setContent(contentRes.data || [])
      setProducts(productsRes.data || [])
    } finally {
      setLoading(false)
    }
  }

  const generateContent = async () => {
    if (!form.topic) { addToast('Please enter a topic', 'warning'); return }
    if (!hasApiKey()) { addToast('Please configure your Groq API key in Settings', 'warning'); return }

    setGenerating(true)
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
      }, getGroqApiKey())
      setGeneratedContent({ ...result, type: selectedType, platform: form.platform, productId: form.product })
    } catch (error) {
      addToast('Error generating content', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const saveContent = async () => {
    if (!generatedContent) return
    try {
      await supabase.from('content').insert({
        user_id: user.id,
        content_type: generatedContent.type,
        platform: generatedContent.platform,
        title: generatedContent.title,
        content: generatedContent.content,
        hook: generatedContent.hook,
        call_to_action: generatedContent.call_to_action,
        keywords: generatedContent.seo_keywords ? JSON.stringify(generatedContent.seo_keywords) : null,
        hashtags: generatedContent.suggested_hashtags ? JSON.stringify(generatedContent.suggested_hashtags) : null,
        product_id: generatedContent.productId || null,
        word_count: wordCount(generatedContent.content),
        reading_time: readingTime(generatedContent.content),
        status: 'draft'
      })
      addToast('Content saved!', 'success')
      loadData()
    } catch (error) {
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

  const deleteContent = async (id) => {
    await supabase.from('content').delete().eq('id', id)
    addToast('Content deleted', 'success')
    loadData()
  }

  if (loading) return <div className="loading-state"><div className="loader-ring" /><p>Loading...</p></div>

  return (
    <div className="content-page fade-in" style={{ maxWidth: 1400 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Generator Panel */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">✍️ Content Generator</h3></div>
          <div className="card-body">
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
              {generating ? '...' : '🤖 Generate Content'}
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
              <div className="loading-state"><div className="loader-ring" /><p>Generating content...</p></div>
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


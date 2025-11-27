import { useState } from 'react'
import { useStore } from '../store/useStore'
import { aiService } from '../lib/ai'
import { markdownToHTML, getInitials } from '../lib/utils'
import './AISidebar.css'

export default function AISidebar({ open, onClose }) {
  const { profile, getGroqApiKey, addToast, getExperienceLevel } = useStore()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const apiKey = getGroqApiKey()
    if (!apiKey) {
      addToast('Please configure your Groq API key in Settings', 'warning')
      return
    }

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await aiService.chat(userMessage, {}, apiKey, getExperienceLevel())
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      addToast('AI request failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <aside className={`ai-sidebar ${open ? 'open' : ''}`}>
      <div className="ai-sidebar-header">
        <h3>🤖 AI Assistant</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="ai-chat-container">
        {messages.length === 0 ? (
          <div className="ai-welcome">
            <div className="ai-avatar">🤖</div>
            <p>Hi! I'm your AI affiliate marketing assistant. Ask me anything about:</p>
            <ul>
              <li>Finding profitable niches</li>
              <li>Selecting best products</li>
              <li>Creating content</li>
              <li>Marketing strategies</li>
              <li>Optimizing conversions</li>
            </ul>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`ai-message ${msg.role}`}>
              <div className="ai-message-avatar">
                {msg.role === 'user' ? getInitials(profile?.full_name || 'U') : '🤖'}
              </div>
              <div 
                className="ai-message-content"
                dangerouslySetInnerHTML={{ __html: markdownToHTML(msg.content) }}
              />
            </div>
          ))
        )}
        {loading && (
          <div className="ai-message assistant">
            <div className="ai-message-avatar">🤖</div>
            <div className="ai-message-content typing">Thinking...</div>
          </div>
        )}
      </div>

      <div className="ai-input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything..."
          rows="2"
        />
        <button className="btn btn-primary" onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </aside>
  )
}


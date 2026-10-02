import { useState } from 'react'

export default function ChatBot({ items, onItemFound }) {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! 👋 I\'m here to help you find supplies. What are you looking for?' }
  ])
  const [input, setInput] = useState('')
  const [suggestedItems, setSuggestedItems] = useState([])

  const findItems = (query) => {
    const q = query.toLowerCase()
    return items.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    )
  }

  const handleSend = () => {
    if (!input.trim()) return

    // Add user message
    setMessages([...messages, { type: 'user', text: input }])
    const query = input.trim()
    setInput('')

    // Find matching items
    const matches = findItems(query)

    if (matches.length === 0) {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: `I couldn't find items matching "${query}". Try searching for things like "bandages", "blankets", "PPE", or "medical supplies".`
      }])
      setSuggestedItems([])
    } else if (matches.length === 1) {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: `Found it! I'm adding "${matches[0].name}" to your selection. Want to add more items?`
      }])
      onItemFound(matches[0])
      setSuggestedItems([])
    } else {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: `Found ${matches.length} items. Click one below to add it to your request:`
      }])
      setSuggestedItems(matches)
    }
  }

  const handleQuickSuggestion = (category) => {
    const categoryItems = items.filter(i => i.category === category)
    setInput(category)
    setMessages([...messages, { type: 'user', text: category }])
    setMessages(prev => [...prev, {
      type: 'bot',
      text: `Showing all ${category} items:`
    }])
    setSuggestedItems(categoryItems)
  }

  const handleItemSelection = (item) => {
    setMessages(prev => [...prev, {
      type: 'bot',
      text: `✓ Added "${item.name}" to your selection. Want to add more?`
    }])
    onItemFound(item)
    setSuggestedItems(suggestedItems.filter(i => i.id !== item.id))
  }

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <h3>Shopping Assistant</h3>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message message-${msg.type}`}>
            {msg.type === 'bot' && <span className="bot-avatar">🤖</span>}
            <div className="message-text">{msg.text}</div>
          </div>
        ))}

        {suggestedItems.length > 0 && (
          <div className="suggested-items">
            {suggestedItems.map(item => (
              <button
                key={item.id}
                className="suggested-item-btn"
                onClick={() => handleItemSelection(item)}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {messages.length === 1 && (
        <div className="quick-categories">
          {['Bedding', 'Medical Supplies', 'PPE', 'Hygiene'].map(cat => (
            <button
              key={cat}
              className="quick-btn"
              onClick={() => handleQuickSuggestion(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Search for supplies..."
        />
        <button onClick={handleSend} disabled={!input.trim()}>Send</button>
      </div>
    </div>
  )
}

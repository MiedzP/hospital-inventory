import { useState } from 'react'
import ChatBot from './ChatBot'

export default function ItemCatalogue({ items, onItemSelected, onBack }) {
  const [selectedItems, setSelectedItems] = useState([])
  const [showChat, setShowChat] = useState(true)

  const handleItemClick = (item) => {
    if (selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id))
    } else {
      setSelectedItems([...selectedItems, item])
    }
  }

  const handleContinue = () => {
    if (selectedItems.length > 0) {
      onItemSelected(selectedItems)
    }
  }

  const getItemIcon = (itemName) => {
    const icons = {
      'Blankets': '🛏️',
      'Pillows': '🧦',
      'Sheets': '📋',
      'Towels': '🧻',
      'Bandages': '🩹',
      'Gauze Pads': '🩹',
      'Syringes': '💉',
      'IV Bags': '🏥',
      'Face Masks': '😷',
      'Gloves': '🧤',
      'Hand Sanitizer': '🧴',
      'Soap': '🧼',
    }
    return icons[itemName] || '📦'
  }

  const categorized = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="catalogue-container">
      <div className="catalogue-header">
        <h2>Supply Catalogue</h2>
        <button onClick={onBack} className="btn-back">← Back</button>
      </div>

      <div className="catalogue-layout">
        <div className="catalogue-main">
          {Object.entries(categorized).map(([category, categoryItems]) => (
            <div key={category} className="category-section">
              <h3 className="category-title">{category}</h3>
              <div className="items-grid">
                {categoryItems.map(item => (
                  <div
                    key={item.id}
                    className={`item-card ${selectedItems.find(i => i.id === item.id) ? 'selected' : ''}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="item-icon">{getItemIcon(item.name)}</div>
                    <h4>{item.name}</h4>
                    <p className="item-category">{category}</p>
                    {selectedItems.find(i => i.id === item.id) && (
                      <div className="item-checkmark">✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {selectedItems.length > 0 && (
            <div className="selected-summary">
              <p>Selected {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}: {selectedItems.map(i => i.name).join(', ')}</p>
              <button onClick={handleContinue} className="btn-continue">
                Continue to Request →
              </button>
            </div>
          )}
        </div>

        {showChat && (
          <div className="chatbot-panel">
            <ChatBot items={items} onItemFound={(item) => {
              if (!selectedItems.find(i => i.id === item.id)) {
                setSelectedItems([...selectedItems, item])
              }
            }} />
            <button
              className="btn-minimize"
              onClick={() => setShowChat(false)}
              title="Minimize chat"
            >
              −
            </button>
          </div>
        )}

        {!showChat && (
          <button
            className="btn-expand-chat"
            onClick={() => setShowChat(true)}
            title="Expand chat"
          >
            💬
          </button>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import './App.css'
import ItemCatalogue from './components/ItemCatalogue'
import RequestForm from './components/RequestForm'
import RequestsList from './components/RequestsList'
import AdminDashboard from './components/AdminDashboard'

function App() {
  const [view, setView] = useState('request')
  const [requestSubView, setRequestSubView] = useState('catalogue')
  const [selectedItems, setSelectedItems] = useState([])
  const [requests, setRequests] = useState([])
  const [items, setItems] = useState([])

  useEffect(() => {
    fetchItems()
    fetchRequests()
    const interval = setInterval(fetchRequests, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/items')
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/requests')
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }

  const handleItemsSelected = (selected) => {
    setSelectedItems(selected)
    setRequestSubView('form')
  }

  const handleBackToCatalogue = () => {
    setRequestSubView('catalogue')
    setSelectedItems([])
  }

  const handleRequestSubmitted = () => {
    fetchRequests()
    setRequestSubView('catalogue')
    setSelectedItems([])
    setView('view')
  }

  const handleRequestUpdated = () => {
    fetchRequests()
  }

  const handleRequestViewClick = () => {
    setView('request')
    setRequestSubView('catalogue')
    setSelectedItems([])
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏥 Hospital Inventory Request</h1>
        <nav className="nav-tabs">
          <button
            className={`tab ${view === 'request' ? 'active' : ''}`}
            onClick={() => setView('request')}
          >
            Submit Request
          </button>
          <button
            className={`tab ${view === 'view' ? 'active' : ''}`}
            onClick={() => setView('view')}
          >
            My Requests ({requests.filter(r => r.status !== 'Fulfilled').length})
          </button>
          <button
            className={`tab ${view === 'admin' ? 'active' : ''}`}
            onClick={() => setView('admin')}
          >
            Admin Dashboard
          </button>
        </nav>
      </header>

      <main className="app-content">
        {view === 'request' && requestSubView === 'catalogue' && (
          <ItemCatalogue items={items} onItemSelected={handleItemsSelected} onBack={() => setView('view')} />
        )}
        {view === 'request' && requestSubView === 'form' && (
          <RequestForm selectedItems={selectedItems} onBack={handleBackToCatalogue} onSubmitted={handleRequestSubmitted} />
        )}
        {view === 'view' && (
          <RequestsList requests={requests} />
        )}
        {view === 'admin' && (
          <AdminDashboard requests={requests} onUpdated={handleRequestUpdated} />
        )}
      </main>
    </div>
  )
}

export default App

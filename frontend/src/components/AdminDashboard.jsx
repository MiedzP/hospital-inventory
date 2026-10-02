import { useState } from 'react'
import FulfillmentRoute from './FulfillmentRoute'

export default function AdminDashboard({ requests, onUpdated }) {
  const [view, setView] = useState('requests')
  const [loadingId, setLoadingId] = useState(null)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleStatusChange = async (requestId, newStatus) => {
    setLoadingId(requestId)
    try {
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        onUpdated()
      }
    } catch (error) {
      alert('Error updating request: ' + error.message)
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return

    try {
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onUpdated()
      }
    } catch (error) {
      alert('Error deleting request: ' + error.message)
    }
  }

  const stats = {
    pending: requests.filter(r => r.status === 'Pending').length,
    inProgress: requests.filter(r => r.status === 'In Progress').length,
    fulfilled: requests.filter(r => r.status === 'Fulfilled').length,
    total: requests.length,
  }

  const sortedRequests = [...requests].sort((a, b) => {
    const statusOrder = { 'Pending': 1, 'In Progress': 2, 'Fulfilled': 3 }
    const priorityOrder = { 'Urgent': 1, 'High': 2, 'Normal': 3, 'Low': 4 }

    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <div className="admin-container">
      <h2>Supply Chain Dashboard</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #dee2e6', paddingBottom: '1rem' }}>
        <button
          onClick={() => setView('requests')}
          style={{
            background: view === 'requests' ? '#0066cc' : 'transparent',
            color: view === 'requests' ? 'white' : '#666',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          📋 Request Queue
        </button>
        <button
          onClick={() => setView('route')}
          style={{
            background: view === 'route' ? '#0066cc' : 'transparent',
            color: view === 'route' ? 'white' : '#666',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          🗺️ Fulfillment Route
        </button>
      </div>

      {view === 'requests' && (
        <>
      {/* Stats */}
      <div className="stats" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#ffc107' }}>
            {stats.inProgress}
          </div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#28a745' }}>
            {stats.fulfilled}
          </div>
          <div className="stat-label">Fulfilled</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#666' }}>
            {stats.total}
          </div>
          <div className="stat-label">Total Requests</div>
        </div>
      </div>

      {/* Requests Table */}
      {requests.length === 0 ? (
        <div className="empty-state">
          <h3>No requests yet</h3>
          <p>Requests will appear here when staff submit them</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Department</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Requested By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRequests.map(request => (
                <tr key={request.id}>
                  <td style={{ fontWeight: 600 }}>{request.item_name}</td>
                  <td>{request.quantity}</td>
                  <td>{request.department}</td>
                  <td>
                    <span style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      backgroundColor:
                        request.priority === 'Urgent' ? '#f8d7da' :
                        request.priority === 'High' ? '#fff3cd' :
                        request.priority === 'Normal' ? '#d1ecf1' :
                        '#e2e3e5',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                    }}>
                      {request.priority}
                    </span>
                  </td>
                  <td>
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusChange(request.id, e.target.value)}
                      disabled={loadingId === request.id}
                      style={{
                        padding: '0.4rem 0.6rem',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6',
                        fontSize: '0.9rem',
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Fulfilled">Fulfilled</option>
                    </select>
                  </td>
                  <td>{request.requested_by || '—'}</td>
                  <td style={{ fontSize: '0.9rem', color: '#666' }}>
                    {formatDate(request.requested_at)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-small btn-success"
                        onClick={() => handleStatusChange(request.id, 'Fulfilled')}
                        disabled={loadingId === request.id || request.status === 'Fulfilled'}
                      >
                        ✓ Complete
                      </button>
                      <button
                        className="btn-small btn-danger"
                        onClick={() => handleDelete(request.id)}
                        disabled={loadingId === request.id}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}

      {view === 'route' && (
        <FulfillmentRoute requests={requests} />
      )}
    </div>
  )
}

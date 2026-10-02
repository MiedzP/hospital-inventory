export default function RequestsList({ requests }) {
  const activeRequests = requests.filter(r => r.status !== 'Fulfilled')
  const historicalRequests = requests.filter(r => r.status === 'Fulfilled')

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusClass = (status) => {
    if (status === 'Pending') return 'status-pending'
    if (status === 'In Progress') return 'status-in-progress'
    if (status === 'Fulfilled') return 'status-fulfilled'
    return ''
  }

  return (
    <div className="requests-container">
      <h2>Your Requests</h2>

      {activeRequests.length === 0 ? (
        <div className="empty-state">
          <h3>No active requests</h3>
          <p>Submit a request from the "Submit Request" tab to get started</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#0066cc' }}>Active Requests</h3>
            <div className="requests-list">
              {activeRequests.map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-info">
                    <div className="request-item">
                      {request.item_name} (x{request.quantity})
                    </div>
                    <div className="request-meta">
                      <span>📍 {request.department}</span>
                      <span>📅 {formatDate(request.requested_at)}</span>
                      <span>👤 {request.requested_by || 'Anonymous'}</span>
                    </div>
                  </div>
                  <div>
                    <span className={`request-status ${getStatusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {historicalRequests.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '1rem', color: '#666' }}>Fulfilled Requests</h3>
              <div className="requests-list">
                {historicalRequests.map(request => (
                  <div key={request.id} className="request-card" style={{ opacity: 0.7 }}>
                    <div className="request-info">
                      <div className="request-item">
                        {request.item_name} (x{request.quantity})
                      </div>
                      <div className="request-meta">
                        <span>📍 {request.department}</span>
                        <span>✅ Fulfilled on {formatDate(request.fulfilled_at)}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`request-status ${getStatusClass(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

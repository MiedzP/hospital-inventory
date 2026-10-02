import { useState } from 'react'

export default function RequestForm({ selectedItems, onBack, onSubmitted }) {
  const [requests, setRequests] = useState(
    selectedItems.map(item => ({
      item_name: item.name,
      quantity: 1,
      department: '',
      priority: 'Normal',
      requested_by: '',
    }))
  )
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (index, field, value) => {
    const updated = [...requests]
    updated[index][field] = value
    setRequests(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all requests have required fields
    if (requests.some(r => !r.department)) {
      alert('Please fill in department for all items')
      return
    }

    setLoading(true)
    try {
      for (const request of requests) {
        const response = await fetch('http://localhost:5000/api/requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...request,
            quantity: parseInt(request.quantity),
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to submit request')
        }
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSubmitted()
      }, 2000)
    } catch (error) {
      alert('Error submitting requests: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <button onClick={onBack} className="btn-back">← Back to Catalogue</button>
        <h2>Request Details</h2>
      </div>

      {success && (
        <div className="success-message">
          ✓ All requests submitted successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {requests.map((request, index) => (
          <div key={index} className="request-section">
            <h3>{selectedItems[index].name}</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={request.quantity}
                  onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Department/Unit *</label>
                <select
                  value={request.department}
                  onChange={(e) => handleChange(index, 'department', e.target.value)}
                  required
                >
                  <option value="">Select department</option>
                  <option value="Emergency Department">Emergency Department</option>
                  <option value="Intensive Care Unit">Intensive Care Unit (ICU)</option>
                  <option value="Cardiac Care Unit">Cardiac Care Unit (CCU)</option>
                  <option value="Medical/Surgical Floors">Medical/Surgical Floors</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Pulmonology">Pulmonology</option>
                  <option value="Gastroenterology">Gastroenterology</option>
                  <option value="Nephrology">Nephrology</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Orthopedic Surgery">Orthopedic Surgery</option>
                  <option value="Neurology/Neurosurgery">Neurology/Neurosurgery</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Rehabilitation">Rehabilitation</option>
                  <option value="Operating Room">Operating Room</option>
                  <option value="Radiology/Imaging">Radiology/Imaging</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Nursing Administration">Nursing Administration</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Facilities/Maintenance">Facilities/Maintenance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={request.priority}
                  onChange={(e) => handleChange(index, 'priority', e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            {index === 0 && (
              <div className="form-group">
                <label>Your Name (Optional)</label>
                <input
                  type="text"
                  value={request.requested_by}
                  onChange={(e) => handleChange(index, 'requested_by', e.target.value)}
                  placeholder="Your name or ID"
                />
              </div>
            )}

            {index < requests.length - 1 && <hr style={{ margin: '2rem 0' }} />}
          </div>
        ))}

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn-secondary">
            Back to Catalogue
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : `Submit ${requests.length} Request${requests.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </form>
    </div>
  )
}

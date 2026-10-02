import { useState, useMemo } from 'react'

// Department locations - calibrate to actual YNHH floor plan coordinates
const DEPARTMENT_LOCATIONS = {
  'Emergency Department': { x: 10, y: 90, floor: '1' },
  'Intensive Care Unit': { x: 50, y: 80, floor: '3' },
  'Cardiac Care Unit': { x: 60, y: 75, floor: '3' },
  'Medical/Surgical Floors': { x: 40, y: 50, floor: '2' },
  'Pediatrics': { x: 70, y: 85, floor: '4' },
  'Obstetrics & Gynecology': { x: 30, y: 60, floor: '2' },
  'Cardiology': { x: 55, y: 70, floor: '3' },
  'Pulmonology': { x: 65, y: 60, floor: '3' },
  'Gastroenterology': { x: 35, y: 45, floor: '2' },
  'Nephrology': { x: 45, y: 55, floor: '2' },
  'Oncology': { x: 75, y: 50, floor: '4' },
  'Orthopedic Surgery': { x: 20, y: 70, floor: '2' },
  'Neurology/Neurosurgery': { x: 55, y: 40, floor: '2' },
  'Psychiatry': { x: 80, y: 60, floor: '4' },
  'Rehabilitation': { x: 25, y: 30, floor: '1' },
  'Operating Room': { x: 50, y: 20, floor: '2' },
  'Radiology/Imaging': { x: 15, y: 50, floor: '1' },
  'Laboratory': { x: 10, y: 40, floor: '1' },
  'Pharmacy': { x: 5, y: 60, floor: '1' },
  'Nursing Administration': { x: 85, y: 30, floor: '5' },
  'Housekeeping': { x: 85, y: 70, floor: 'B1' },
  'Facilities/Maintenance': { x: 85, y: 80, floor: 'B1' },
}

const FLOOR_COLORS = {
  'B1': '#8B4513',  // Brown
  '1': '#FF6B6B',   // Red
  '2': '#4ECDC4',   // Teal
  '3': '#45B7D1',   // Blue
  '4': '#FFA07A',   // Salmon
  '5': '#98D8C8',   // Mint
}

export default function FulfillmentRoute({ requests }) {
  const [visibleFloors, setVisibleFloors] = useState(new Set(['2']))
  const [completedRequests, setCompletedRequests] = useState(new Set())
  const [selectedDept, setSelectedDept] = useState(null)

  const pendingRequests = requests.filter(r => r.status !== 'Fulfilled')

  const calculateDistance = (loc1, loc2) => {
    return Math.sqrt(Math.pow(loc2.x - loc1.x, 2) + Math.pow(loc2.y - loc1.y, 2))
  }

  const optimizeRoute = (requestsList) => {
    if (requestsList.length === 0) return []

    let remaining = [...requestsList]
    const route = []
    let current = { x: 50, y: 80, floor: '1' }

    while (remaining.length > 0) {
      let nearest = 0
      let nearestDist = Infinity

      for (let i = 0; i < remaining.length; i++) {
        const loc = DEPARTMENT_LOCATIONS[remaining[i].department]
        if (loc && visibleFloors.has(loc.floor)) {
          const dist = calculateDistance(current, loc)
          if (dist < nearestDist) {
            nearestDist = dist
            nearest = i
          }
        }
      }

      if (nearestDist === Infinity && remaining.length > 0) {
        const nextFloor = remaining[0].department
        current = DEPARTMENT_LOCATIONS[nextFloor] || current
      } else if (nearestDist !== Infinity) {
        route.push(remaining[nearest])
        current = DEPARTMENT_LOCATIONS[remaining[nearest].department]
        remaining.splice(nearest, 1)
      } else {
        break
      }
    }

    return route
  }

  const visibleRequests = pendingRequests.filter(r => {
    const loc = DEPARTMENT_LOCATIONS[r.department]
    return loc && visibleFloors.has(loc.floor)
  })

  const optimizedRoute = useMemo(() => optimizeRoute(visibleRequests), [visibleRequests])

  const toggleFloor = (floor) => {
    const updated = new Set(visibleFloors)
    if (updated.has(floor)) {
      updated.delete(floor)
    } else {
      updated.add(floor)
    }
    setVisibleFloors(updated)
  }

  const toggleCompleted = (requestId) => {
    const updated = new Set(completedRequests)
    if (updated.has(requestId)) {
      updated.delete(requestId)
    } else {
      updated.add(requestId)
    }
    setCompletedRequests(updated)
  }

  const totalDistance = useMemo(() => {
    let dist = 0
    let current = { x: 50, y: 80 }
    for (const req of optimizedRoute) {
      const loc = DEPARTMENT_LOCATIONS[req.department]
      if (loc) {
        dist += calculateDistance(current, loc)
        current = loc
      }
    }
    return dist.toFixed(0)
  }, [optimizedRoute])

  const availableFloors = [...new Set(Object.values(DEPARTMENT_LOCATIONS).map(l => l.floor))].sort((a, b) => {
    const order = ['B1', '1', '2', '3', '4', '5']
    return order.indexOf(a) - order.indexOf(b)
  })

  return (
    <div className="fulfillment-container">
      <h2>🗺️ Fulfillment Route Optimizer</h2>

      <div className="floor-selector">
        <label>Select Floors (click to toggle):</label>
        <div className="floor-buttons">
          {availableFloors.map(floor => (
            <button
              key={floor}
              className={`floor-btn ${visibleFloors.has(floor) ? 'active' : ''}`}
              onClick={() => toggleFloor(floor)}
              style={{
                borderColor: FLOOR_COLORS[floor],
                backgroundColor: visibleFloors.has(floor) ? FLOOR_COLORS[floor] : 'white',
                color: visibleFloors.has(floor) ? 'white' : FLOOR_COLORS[floor],
              }}
            >
              {floor === 'B1' ? 'Basement' : `Floor ${floor}`}
            </button>
          ))}
        </div>
      </div>

      <div className="route-info">
        <div className="route-stat">
          <div className="stat-label">Pending Orders</div>
          <div className="stat-value">{visibleRequests.length}</div>
        </div>
        <div className="route-stat">
          <div className="stat-label">Estimated Distance</div>
          <div className="stat-value">{totalDistance} units</div>
        </div>
        <div className="route-stat">
          <div className="stat-label">Est. Time</div>
          <div className="stat-value">{Math.ceil(totalDistance / 5)} min</div>
        </div>
      </div>

      <div className="route-display">
        <div className="map-container">
          <svg viewBox="0 0 100 100" className="floor-map">
            {/* Draw grid */}
            {[...Array(11)].map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#eee" strokeWidth="0.5" />
            ))}
            {[...Array(11)].map((_, i) => (
              <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="#eee" strokeWidth="0.5" />
            ))}

            {/* Draw route path */}
            {optimizedRoute.length > 1 && (
              <polyline
                points={optimizedRoute
                  .map(req => {
                    const loc = DEPARTMENT_LOCATIONS[req.department]
                    return loc ? `${loc.x},${loc.y}` : null
                  })
                  .filter(Boolean)
                  .join(' ')}
                fill="none"
                stroke="#333"
                strokeWidth="0.8"
                strokeDasharray="2,2"
                opacity="0.4"
              />
            )}

            {/* Draw department locations */}
            {Object.entries(DEPARTMENT_LOCATIONS).map(([dept, loc]) => {
              if (!visibleFloors.has(loc.floor)) return null
              const isInRoute = optimizedRoute.some(r => r.department === dept)
              const isCompleted = optimizedRoute.some(r => r.department === dept && completedRequests.has(r.id))
              const isSelected = selectedDept === dept

              return (
                <g key={dept}>
                  {/* Department dot - colored by floor */}
                  <circle
                    cx={loc.x}
                    cy={loc.y}
                    r={isSelected ? "3.5" : "2.5"}
                    fill={FLOOR_COLORS[loc.floor]}
                    stroke={isCompleted ? '#28a745' : isSelected ? '#333' : '#666'}
                    strokeWidth={isCompleted ? "1.2" : isSelected ? "1" : "0.8"}
                    opacity={isCompleted ? "0.7" : "0.9"}
                    cursor="pointer"
                    onClick={() => setSelectedDept(isSelected ? null : dept)}
                    style={{ transition: 'all 0.2s' }}
                  />

                  {/* Completion checkmark */}
                  {isCompleted && (
                    <text
                      x={loc.x}
                      y={loc.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="2"
                      fill="#28a745"
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      ✓
                    </text>
                  )}

                  {/* Department name label - show when selected */}
                  {isSelected && (
                    <g>
                      {/* Background box with shadow */}
                      <defs>
                        <filter id={`shadow-${dept}`}>
                          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodOpacity="0.3" />
                        </filter>
                      </defs>

                      {/* Label background */}
                      <rect
                        x={loc.x - 20}
                        y={loc.y - 14}
                        width="40"
                        height="8"
                        fill="white"
                        stroke={FLOOR_COLORS[loc.floor]}
                        strokeWidth="1"
                        rx="2"
                        filter={`url(#shadow-${dept})`}
                      />

                      {/* Department name text */}
                      <text
                        x={loc.x}
                        y={loc.y - 9.5}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="2"
                        fill={FLOOR_COLORS[loc.floor]}
                        fontWeight="bold"
                        pointerEvents="none"
                      >
                        {dept}
                      </text>

                      {/* Pointer line to dot */}
                      <line
                        x1={loc.x}
                        y1={loc.y - 6}
                        x2={loc.x}
                        y2={loc.y - 3}
                        stroke={FLOOR_COLORS[loc.floor]}
                        strokeWidth="0.5"
                      />
                    </g>
                  )}
                </g>
              )
            })}
          </svg>

          <div className="map-legend">
            <div style={{ marginBottom: '1rem' }}>
              <strong>Floor Colors:</strong>
            </div>
            {availableFloors.map(floor => (
              <div key={floor} className="legend-item">
                <div className="legend-dot" style={{ backgroundColor: FLOOR_COLORS[floor] }}></div>
                <span>{floor === 'B1' ? 'Basement' : `Floor ${floor}`}</span>
              </div>
            ))}
            <hr style={{ margin: '1rem 0' }} />
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#28a745' }}></div>
              <span>Completed</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#ddd' }}></div>
              <span>No Orders</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
              💡 Click dots to see department names
            </p>
          </div>
        </div>

        <div className="route-list">
          <h3>Optimized Route ({optimizedRoute.length} stops)</h3>
          {optimizedRoute.length === 0 ? (
            <p className="no-orders">No pending orders on selected floors</p>
          ) : (
            <ol className="route-items">
              {optimizedRoute.map((req, idx) => (
                <li key={req.id} className={completedRequests.has(req.id) ? 'completed' : ''}>
                  <div className="route-item-content">
                    <span className="stop-num" style={{
                      backgroundColor: FLOOR_COLORS[DEPARTMENT_LOCATIONS[req.department]?.floor]
                    }}>
                      {idx + 1}
                    </span>
                    <div className="item-details">
                      <strong>{req.item_name}</strong>
                      <div className="item-meta">
                        {req.department} • Qty: {req.quantity} • {req.priority} Priority
                      </div>
                    </div>
                  </div>
                  <button
                    className={`btn-complete ${completedRequests.has(req.id) ? 'completed' : ''}`}
                    onClick={() => toggleCompleted(req.id)}
                  >
                    {completedRequests.has(req.id) ? '✓' : '○'}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="fulfillment-note">
        💡 <strong>How to use:</strong> Toggle floors to view multiple floors. Click on dots to see department names. Route is optimized for minimum walking distance.
      </div>
    </div>
  )
}

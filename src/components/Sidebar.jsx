import React, { useState } from 'react'
import { 
  ServiceGapChart, 
  PovertyVsServicesChart, 
  ServiceTypeDistribution,
  DemographicChart 
} from './Charts'

const StatCard = ({ title, value, subtitle }) => (
  <div className="stat-card">
    <div className="stat-value">{value}</div>
    <div className="stat-label">{title}</div>
    {subtitle && <div style={{ fontSize: '0.8rem', color: '#888' }}>{subtitle}</div>}
  </div>
)

const CollapsiblePanel = ({ title, children, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="panel">
      <div 
        className="panel-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span style={{ 
          fontSize: '1.2rem', 
          transition: 'transform 0.2s ease',
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
        }}>
          ▶
        </span>
      </div>
      {isExpanded && (
        <div className="panel-content" style={{ marginTop: '0.75rem' }}>
          {children}
        </div>
      )}
    </div>
  )
}

const Legend = ({ mapMode, showServices }) => {
  const getMapLegendItems = () => {
    switch (mapMode) {
      case 'serviceGaps':
        return [
          { color: '#d73027', label: 'Very High Gap (80-100)' },
          { color: '#fc8d59', label: 'High Gap (60-79)' },
          { color: '#fee08b', label: 'Medium Gap (40-59)' },
          { color: '#d9ef8b', label: 'Low Gap (20-39)' },
          { color: '#91bfdb', label: 'Very Low Gap (0-19)' }
        ]
      case 'poverty':
        return [
          { color: '#d73027', label: '30%+ Poverty Rate' },
          { color: '#fc8d59', label: '20-29% Poverty Rate' },
          { color: '#fee08b', label: '15-19% Poverty Rate' },
          { color: '#d9ef8b', label: '10-14% Poverty Rate' },
          { color: '#91bfdb', label: '0-9% Poverty Rate' }
        ]
      case 'population':
        return [
          { color: 'rgba(255, 55, 55, 0.7)', label: 'High Population' },
          { color: 'rgba(255, 155, 155, 0.7)', label: 'Medium Population' },
          { color: 'rgba(255, 255, 255, 0.7)', label: 'Low Population' }
        ]
      case 'veterans':
        return [
          { color: 'rgba(139, 69, 19, 1)', label: 'High Veteran Population' },
          { color: 'rgba(139, 69, 19, 0.7)', label: 'Medium Veteran Population' },
          { color: 'rgba(139, 69, 19, 0.3)', label: 'Low Veteran Population' }
        ]
      case 'seniors':
        return [
          { color: 'rgba(75, 0, 130, 1)', label: 'High Senior Population' },
          { color: 'rgba(75, 0, 130, 0.7)', label: 'Medium Senior Population' },
          { color: 'rgba(75, 0, 130, 0.3)', label: 'Low Senior Population' }
        ]
      case 'youth':
        return [
          { color: 'rgba(255, 20, 147, 1)', label: 'High Youth Population' },
          { color: 'rgba(255, 20, 147, 0.7)', label: 'Medium Youth Population' },
          { color: 'rgba(255, 20, 147, 0.3)', label: 'Low Youth Population' }
        ]
      case 'disability':
        return [
          { color: 'rgba(70, 130, 180, 1)', label: 'High Disability Population' },
          { color: 'rgba(70, 130, 180, 0.7)', label: 'Medium Disability Population' },
          { color: 'rgba(70, 130, 180, 0.3)', label: 'Low Disability Population' }
        ]
      case 'income':
        return [
          { color: 'rgba(255, 100, 50, 0.7)', label: 'Lower Income (Higher Need)' },
          { color: 'rgba(178, 178, 105, 0.7)', label: 'Medium Income' },
          { color: 'rgba(100, 255, 150, 0.7)', label: 'Higher Income (Lower Need)' }
        ]
      default:
        return []
    }
  }

  const getServiceLegendItems = () => [
    { color: '#d73027', label: 'Housing/Shelter', shape: '📍' },
    { color: '#ff8800', label: 'Food Services', shape: '📍' },
    { color: '#2e8b57', label: 'Healthcare', shape: '📍' },
    { color: '#8b008b', label: 'Mental Health', shape: '📍' },
    { color: '#ffd700', label: 'Employment', shape: '📍' },
    { color: '#808080', label: 'Other Services', shape: '📍' }
  ]

  return (
    <div className="legend">
      <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Map Legend</h4>
      
      {/* Zip Code Areas Legend */}
      <div style={{ marginBottom: '1rem' }}>
        <h5 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', color: '#555' }}>Zip Code Areas</h5>
        {getMapLegendItems().map((item, index) => (
          <div key={index} className="legend-item">
            <div 
              className="legend-color"
              style={{ backgroundColor: item.color }}
            />
            <span className="legend-label">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Service Categories Legend */}
      {showServices && (
        <div>
          <h5 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', color: '#555' }}>Service Categories</h5>
          {getServiceLegendItems().map((item, index) => (
            <div key={index} className="legend-item">
              <div 
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '0.5rem',
                  fontSize: '10px'
                }}
              >
                <div style={{
                  width: '8px',
                  height: '12px',
                  backgroundColor: item.color,
                  borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)',
                  border: '1px solid #333'
                }} />
              </div>
              <span className="legend-label" style={{ fontSize: '0.8rem' }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const Sidebar = ({ 
  data, 
  stats, 
  mapMode, 
  setMapMode, 
  showServices, 
  setShowServices,
  showTransit,
  setShowTransit,
  transitRadius,
  setTransitRadius,
  demographicMetric,
  setDemographicMetric
}) => {
  return (
    <div className="sidebar">
      {/* Statistics Panel */}
      <CollapsiblePanel title="Key Statistics" defaultExpanded={true}>
        <div className="stats-grid">
          <StatCard 
            title="Total Population" 
            value={stats.totalPopulation.toLocaleString()} 
          />
          <StatCard 
            title="Homeless Services" 
            value={stats.totalHomelessServices} 
          />
          <StatCard 
            title="Transit Stops" 
            value={stats.totalTransitStops} 
          />
          <StatCard 
            title="Avg Poverty Rate" 
            value={`${stats.averagePovertyRate.toFixed(1)}%`} 
          />
          <StatCard 
            title="Avg Service Gap" 
            value={`${stats.averageServiceGap.toFixed(1)}/100`}
            subtitle="Lower is better" 
          />
          <StatCard 
            title="Highest Gap Zip" 
            value={stats.highestGapZipCode || 'N/A'} 
          />
        </div>
      </CollapsiblePanel>

      {/* Map Controls */}
      <CollapsiblePanel title="Map Controls" defaultExpanded={true}>
        <div className="controls">
          <div className="control-group">
            <label>Map View Mode</label>
            <div className="radio-group">
              <label className="radio-item">
                <input 
                  type="radio" 
                  name="mapMode" 
                  value="serviceGaps" 
                  checked={mapMode === 'serviceGaps'}
                  onChange={(e) => setMapMode(e.target.value)}
                />
                Service Gaps
              </label>
              <label className="radio-item">
                <input 
                  type="radio" 
                  name="mapMode" 
                  value="poverty" 
                  checked={mapMode === 'poverty'}
                  onChange={(e) => setMapMode(e.target.value)}
                />
                Poverty Rate
              </label>
              <label className="radio-item">
                <input 
                  type="radio" 
                  name="mapMode" 
                  value="population" 
                  checked={mapMode === 'population'}
                  onChange={(e) => setMapMode(e.target.value)}
                />
                Population Density
              </label>
              <label className="radio-item">
                <input 
                  type="radio" 
                  name="mapMode" 
                  value="veterans" 
                  checked={mapMode === 'veterans'}
                  onChange={(e) => setMapMode(e.target.value)}
                />
                Veterans
              </label>
              <label className="radio-item">
                <input 
                  type="radio" 
                  name="mapMode" 
                  value="seniors" 
                  checked={mapMode === 'seniors'}
                  onChange={(e) => setMapMode(e.target.value)}
                />
                Seniors
              </label>
              <label className="radio-item">
                <input 
                  type="radio" 
                  name="mapMode" 
                  value="youth" 
                  checked={mapMode === 'youth'}
                  onChange={(e) => setMapMode(e.target.value)}
                />
                Youth
              </label>
              <label className="radio-item">
                <input 
                  type="radio" 
                  name="mapMode" 
                  value="disability" 
                  checked={mapMode === 'disability'}
                  onChange={(e) => setMapMode(e.target.value)}
                />
                Disability
              </label>
              <label className="radio-item">
                <input 
                  type="radio" 
                  name="mapMode" 
                  value="income" 
                  checked={mapMode === 'income'}
                  onChange={(e) => setMapMode(e.target.value)}
                />
                Income
              </label>
            </div>
          </div>

          <div className="control-group">
            <label>
              <input 
                type="checkbox" 
                checked={showServices}
                onChange={(e) => setShowServices(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Show Homeless Services
            </label>
          </div>

          <div className="control-group">
            <label>
              <input 
                type="checkbox" 
                checked={showTransit}
                onChange={(e) => setShowTransit(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Show Transit Stops
            </label>
          </div>

          {showTransit && (
            <div className="control-group">
              <label>Transit Radius: {transitRadius} miles</label>
              <input 
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={transitRadius}
                onChange={(e) => setTransitRadius(parseFloat(e.target.value))}
              />
            </div>
          )}
        </div>

        <Legend mapMode={mapMode} showServices={showServices} />
      </CollapsiblePanel>

      {/* Service Gap Analysis */}
      <CollapsiblePanel title="Service Gap Analysis" defaultExpanded={true}>
        <div className="chart-container">
          <ServiceGapChart data={data} />
        </div>
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem', lineHeight: '1.3' }}>
          Top areas by gap score (higher = more need)
        </p>
      </CollapsiblePanel>

      {/* Poverty vs Services */}
      <CollapsiblePanel title="Poverty vs Services" defaultExpanded={false}>
        <div className="chart-container">
          <PovertyVsServicesChart data={data} />
        </div>
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem', lineHeight: '1.3' }}>
          Poverty vs services (color = gap score)
        </p>
      </CollapsiblePanel>

      {/* Service Type Distribution */}
      <CollapsiblePanel title="Service Types" defaultExpanded={false}>
        <div className="chart-container">
          <ServiceTypeDistribution data={data} />
        </div>
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem', lineHeight: '1.3' }}>
          Service distribution by type
        </p>
      </CollapsiblePanel>

      {/* Demographics Chart */}
      <CollapsiblePanel title="Demographics" defaultExpanded={false}>
        <div className="controls">
          <div className="control-group">
            <label>Demographic Metric</label>
            <select 
              value={demographicMetric}
              onChange={(e) => setDemographicMetric(e.target.value)}
            >
              <option value="povertyRate">Poverty Rate</option>
              <option value="veteranPopulation">Veteran Population</option>
              <option value="disabilityPopulation">Disability Population</option>
              <option value="seniorPopulation">Senior Population</option>
              <option value="youthPopulation">Youth Population</option>
            </select>
          </div>
        </div>
        <div className="chart-container">
          <DemographicChart data={data} metric={demographicMetric} key={demographicMetric} />
        </div>
      </CollapsiblePanel>
    </div>
  )
}

export default Sidebar
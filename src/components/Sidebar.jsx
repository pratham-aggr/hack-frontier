import React from 'react'
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

const Legend = ({ mapMode }) => {
  const getLegendItems = () => {
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
      default:
        return []
    }
  }

  return (
    <div className="legend">
      <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Legend</h4>
      {getLegendItems().map((item, index) => (
        <div key={index} className="legend-item">
          <div 
            className="legend-color"
            style={{ backgroundColor: item.color }}
          />
          <span className="legend-label">{item.label}</span>
        </div>
      ))}
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
  setTransitRadius
}) => {
  return (
    <div className="sidebar">
      {/* Statistics Panel */}
      <div className="panel">
        <h3>Key Statistics</h3>
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
      </div>

      {/* Map Controls */}
      <div className="panel">
        <h3>Map Controls</h3>
        <div className="controls">
          <div className="control-group">
            <label>Map View Mode</label>
            <select 
              value={mapMode} 
              onChange={(e) => setMapMode(e.target.value)}
            >
              <option value="serviceGaps">Service Gaps</option>
              <option value="poverty">Poverty Rate</option>
              <option value="population">Population Density</option>
            </select>
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

        <Legend mapMode={mapMode} />
      </div>

      {/* Service Gap Analysis */}
      <div className="panel">
        <h3>Service Gap Analysis</h3>
        <div className="chart-container">
          <ServiceGapChart data={data} />
        </div>
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem', lineHeight: '1.3' }}>
          Top areas by gap score (higher = more need)
        </p>
      </div>

      {/* Poverty vs Services */}
      <div className="panel">
        <h3>Poverty vs Services</h3>
        <div className="chart-container">
          <PovertyVsServicesChart data={data} />
        </div>
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem', lineHeight: '1.3' }}>
          Poverty vs services (color = gap score)
        </p>
      </div>

      {/* Service Type Distribution */}
      <div className="panel">
        <h3>Service Types</h3>
        <div className="chart-container">
          <ServiceTypeDistribution data={data} />
        </div>
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem', lineHeight: '1.3' }}>
          Service distribution by type
        </p>
      </div>

      {/* Demographics Chart */}
      <div className="panel">
        <h3>Demographics</h3>
        <div className="controls">
          <div className="control-group">
            <label>Demographic Metric</label>
            <select 
              onChange={(e) => {
                // This would be passed as a prop to update the demographic chart
                console.log('Selected metric:', e.target.value)
              }}
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
          <DemographicChart data={data} metric="povertyRate" />
        </div>
      </div>
    </div>
  )
}

export default Sidebar
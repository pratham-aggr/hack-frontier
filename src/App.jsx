import React, { useState } from 'react'
import Map from './components/Map'
import Sidebar from './components/Sidebar'
import { useData, useStats } from './hooks/useData'
import './index.css'

function App() {
  const { data, loading, error } = useData()
  const stats = useStats(data)
  
  const [mapMode, setMapMode] = useState('serviceGaps')
  const [showServices, setShowServices] = useState(true)
  const [showTransit, setShowTransit] = useState(false)
  const [transitRadius, setTransitRadius] = useState(0.5)
  const [demographicMetric, setDemographicMetric] = useState('povertyRate')

  if (loading) {
    return (
      <div className="dashboard">
        <div className="header">
          <h1>San Diego Homeless Care Compass</h1>
          <p>Analyzing homelessness and service gaps across San Diego County</p>
        </div>
        <div className="loading">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🔄</div>
            <div>Loading data from multiple sources...</div>
            <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
              This may take a few moments as we process geographic and demographic data
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="header">
          <h1>San Diego Homelessness Dashboard</h1>
          <p>Analyzing service gaps and demographics across San Diego County</p>
        </div>
        <div className="loading">
          <div style={{ textAlign: 'center', color: '#d73027' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⚠️</div>
            <div>Error loading data: {error}</div>
            <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
              Please ensure all data files are available in the /public/data directory:
              <ul style={{ textAlign: 'left', marginTop: '0.5rem', display: 'inline-block' }}>
                <li>sd_zipcodes.geojson</li>
                <li>homeless_services_hackathon.json</li>
                <li>Transit_Stops_hackathon.csv</li>
                <li>Transit_Routes_hackathon.csv</li>
                <li>acs2023_hackathon.csv</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="header">
        <h1>San Diego Homelessness Dashboard</h1>
        <p>
          Analyzing service gaps and demographics across San Diego County • 
          Data from 211 San Diego, RTFHSD, ACS, and SANDAG
        </p>
      </div>
      
      <div className="main-content">
        <div className="map-container">
          <Map 
            data={data}
            mapMode={mapMode}
            showServices={showServices}
            showTransit={showTransit}
            transitRadius={transitRadius}
          />
        </div>
        
        <Sidebar 
          data={data}
          stats={stats}
          mapMode={mapMode}
          setMapMode={setMapMode}
          showServices={showServices}
          setShowServices={setShowServices}
          showTransit={showTransit}
          setShowTransit={setShowTransit}
          transitRadius={transitRadius}
          setTransitRadius={setTransitRadius}
          demographicMetric={demographicMetric}
          setDemographicMetric={setDemographicMetric}
        />
      </div>
    </div>
  )
}

export default App
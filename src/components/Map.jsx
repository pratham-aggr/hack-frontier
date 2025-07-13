import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import { getColorByGapScore, getColorByPovertyRate } from '../utils/dataLoader'

import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Service category icons with appropriate colors and symbols
const serviceIcons = {
  'Housing/Shelter': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [12, 20],
    iconAnchor: [6, 20],
    popupAnchor: [1, -17],
    shadowSize: [20, 20]
  }),
  'Food Services': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [12, 20],
    iconAnchor: [6, 20],
    popupAnchor: [1, -17],
    shadowSize: [20, 20]
  }),
  'Healthcare': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [12, 20],
    iconAnchor: [6, 20],
    popupAnchor: [1, -17],
    shadowSize: [20, 20]
  }),
  'Mental Health': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [12, 20],
    iconAnchor: [6, 20],
    popupAnchor: [1, -17],
    shadowSize: [20, 20]
  }),
  'Employment': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [12, 20],
    iconAnchor: [6, 20],
    popupAnchor: [1, -17],
    shadowSize: [20, 20]
  }),
  'Other': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [12, 20],
    iconAnchor: [6, 20],
    popupAnchor: [1, -17],
    shadowSize: [20, 20]
  })
}

const transitIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [10, 16],
  iconAnchor: [5, 16],
  popupAnchor: [1, -14],
  shadowSize: [16, 16]
})

// Function to categorize services based on name and description
const categorizeService = (service) => {
  const serviceName = service.service_name?.toLowerCase() || ''
  const description = service.description?.toLowerCase() || ''
  
  if (serviceName.includes('shelter') || serviceName.includes('housing') || 
      description.includes('shelter') || description.includes('housing') ||
      serviceName.includes('transitional') || description.includes('transitional')) {
    return 'Housing/Shelter'
  } else if (serviceName.includes('food') || serviceName.includes('meal') ||
             description.includes('food') || description.includes('meal') ||
             serviceName.includes('pantry') || description.includes('pantry') ||
             serviceName.includes('kitchen') || description.includes('kitchen')) {
    return 'Food Services'
  } else if (serviceName.includes('health') || serviceName.includes('medical') ||
             description.includes('health') || description.includes('medical') ||
             serviceName.includes('clinic') || description.includes('clinic')) {
    return 'Healthcare'
  } else if (serviceName.includes('mental') || serviceName.includes('therapy') ||
             description.includes('mental') || description.includes('therapy') ||
             serviceName.includes('counseling') || description.includes('counseling') ||
             serviceName.includes('substance') || description.includes('substance')) {
    return 'Mental Health'
  } else if (serviceName.includes('job') || serviceName.includes('employment') ||
             description.includes('job') || description.includes('employment') ||
             serviceName.includes('training') || description.includes('training') ||
             serviceName.includes('education') || description.includes('education')) {
    return 'Employment'
  }
  
  return 'Other'
}

const Map = ({ 
  data, 
  mapMode = 'serviceGaps',
  showServices = true,
  showTransit = false,
  transitRadius = 0.5
}) => {
  const [selectedFeature, setSelectedFeature] = useState(null)

  const center = [32.7157, -117.1611] // San Diego center
  const zoom = 10

  const getFeatureStyle = (feature) => {
    const props = feature.properties
    let fillColor = '#cccccc'

    if (mapMode === 'serviceGaps' && props.serviceGapScore !== undefined) {
      fillColor = getColorByGapScore(props.serviceGapScore)
    } else if (mapMode === 'poverty' && props.povertyRate !== undefined) {
      fillColor = getColorByPovertyRate(props.povertyRate)
    } else if (mapMode === 'population' && props.population !== undefined) {
      const maxPop = 150000
      const intensity = Math.min(props.population / maxPop, 1)
      fillColor = `rgba(255, ${255 - Math.floor(intensity * 200)}, ${255 - Math.floor(intensity * 200)}, 0.7)`
    } else if (mapMode === 'veterans' && props.veteranPopulation !== undefined) {
      const maxVets = Math.max(...(data.processedZipCodes?.features.map(f => f.properties.veteranPopulation || 0) || [1000]))
      const intensity = Math.min(props.veteranPopulation / maxVets, 1)
      fillColor = `rgba(139, 69, 19, ${0.3 + intensity * 0.7})`  // Brown color for veterans
    } else if (mapMode === 'seniors' && props.seniorPopulation !== undefined) {
      const maxSeniors = Math.max(...(data.processedZipCodes?.features.map(f => f.properties.seniorPopulation || 0) || [1000]))
      const intensity = Math.min(props.seniorPopulation / maxSeniors, 1)
      fillColor = `rgba(75, 0, 130, ${0.3 + intensity * 0.7})`  // Indigo color for seniors
    } else if (mapMode === 'youth' && props.youthPopulation !== undefined) {
      const maxYouth = Math.max(...(data.processedZipCodes?.features.map(f => f.properties.youthPopulation || 0) || [1000]))
      const intensity = Math.min(props.youthPopulation / maxYouth, 1)
      fillColor = `rgba(255, 20, 147, ${0.3 + intensity * 0.7})`  // Deep pink for youth
    } else if (mapMode === 'disability' && props.disabilityPopulation !== undefined) {
      const maxDisability = Math.max(...(data.processedZipCodes?.features.map(f => f.properties.disabilityPopulation || 0) || [1000]))
      const intensity = Math.min(props.disabilityPopulation / maxDisability, 1)
      fillColor = `rgba(70, 130, 180, ${0.3 + intensity * 0.7})`  // Steel blue for disability
    } else if (mapMode === 'income' && props.medianIncome !== undefined) {
      const minIncome = 30000
      const maxIncome = 150000
      const normalizedIncome = Math.max(0, Math.min(1, (props.medianIncome - minIncome) / (maxIncome - minIncome)))
      // Reverse scale: lower income = warmer colors (more need)
      const intensity = 1 - normalizedIncome
      fillColor = `rgba(${Math.floor(255 * intensity)}, ${Math.floor(100 + 155 * (1 - intensity))}, ${Math.floor(50 + 100 * (1 - intensity))}, 0.7)`
    }


    return {
      fillColor,
      weight: selectedFeature?.properties.zipCode === props.zipCode ? 3 : 1,
      opacity: 1,
      color: selectedFeature?.properties.zipCode === props.zipCode ? '#000' : '#666',
      fillOpacity: 0.7
    }
  }

  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const layer = e.target
        layer.setStyle({
          weight: 3,
          color: '#000',
          fillOpacity: 0.9
        })
        layer.bringToFront()
      },
      mouseout: (e) => {
        const layer = e.target
        layer.setStyle(getFeatureStyle(feature))
      },
      click: (e) => {
        setSelectedFeature(feature)
        e.target.openPopup()
      }
    })

    const props = feature.properties
    const popupContent = `
      <div style="min-width: 200px;">
        <h4>Zip Code: ${props.zipCode || 'Unknown'}</h4>
        <p><strong>Population:</strong> ${props.population?.toLocaleString() || 'N/A'}</p>
        <p><strong>Poverty Rate:</strong> ${props.povertyRate?.toFixed(1) || 'N/A'}%</p>
        <p><strong>Median Income:</strong> $${props.medianIncome?.toLocaleString() || 'N/A'}</p>
        ${props.veteranPopulation ? `<p><strong>Veterans:</strong> ${props.veteranPopulation.toLocaleString()}</p>` : ''}
        ${props.seniorPopulation ? `<p><strong>Seniors (60+):</strong> ${props.seniorPopulation.toLocaleString()}</p>` : ''}
        ${props.youthPopulation ? `<p><strong>Youth:</strong> ${props.youthPopulation.toLocaleString()}</p>` : ''}
        ${props.disabilityPopulation ? `<p><strong>Population with Disability:</strong> ${props.disabilityPopulation.toLocaleString()}</p>` : ''}
        <p><strong>Homeless Services:</strong> ${props.serviceCount || 0}</p>
        <p><strong>Service Gap Score:</strong> ${props.serviceGapScore?.toFixed(1) || 'N/A'}/100</p>
        <p><strong>Nearest Service:</strong> ${props.nearestServiceDistance?.toFixed(1) || 'N/A'} miles</p>
      </div>
    `
    layer.bindPopup(popupContent)
  }

  if (!data.processedZipCodes) {
    return (
      <div className="loading">
        Loading map data...
      </div>
    )
  }

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      <GeoJSON
        data={data.processedZipCodes}
        style={getFeatureStyle}
        onEachFeature={onEachFeature}
        key={`zipcodes-${mapMode}-${data.processedZipCodes?.features?.length || 0}`}
      />

      {showServices && data.homelessServices && data.homelessServices.map((service, index) => {
        const category = categorizeService(service)
        return (
          <Marker
            key={`service-${index}`}
            position={[service.lat, service.lng]}
            icon={serviceIcons[category]}
          >
            <Popup>
              <div style={{ minWidth: '250px' }}>
                <h4>{service.service_name}</h4>
                <p><strong>Category:</strong> <span style={{ 
                  color: {
                    'Housing/Shelter': '#d73027',
                    'Food Services': '#ff8800',
                    'Healthcare': '#2e8b57',
                    'Mental Health': '#8b008b',
                    'Employment': '#ffd700',
                    'Other': '#808080'
                  }[category],
                  fontWeight: 'bold'
                }}>{category}</span></p>
                <p><strong>Organization:</strong> {service.organization}</p>
                <p><strong>Address:</strong> {service.address}</p>
                <p><strong>Phone:</strong> {service.main_phone || 'N/A'}</p>
                <p><strong>Capacity:</strong> {service.capacity_limitations || 'N/A'}</p>
                <p><strong>Eligibility:</strong> {service.eligibility || 'N/A'}</p>
                {service.description && (
                  <p><strong>Description:</strong> {service.description.substring(0, 200)}...</p>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}

      {showTransit && data.transitStops && data.transitStops.slice(0, 100).map((stop, index) => (
        <React.Fragment key={`transit-${index}`}>
          <Marker
            position={[stop.lat, stop.lng]}
            icon={transitIcon}
          >
            <Popup>
              <div>
                <h4>{stop.stop_name}</h4>
                <p><strong>Stop ID:</strong> {stop.stop_id}</p>
                <p><strong>Agency:</strong> {stop.stop_agency}</p>
              </div>
            </Popup>
          </Marker>
          {transitRadius > 0 && (
            <Circle
              center={[stop.lat, stop.lng]}
              radius={transitRadius * 1609.34} // Convert miles to meters
              pathOptions={{
                color: 'blue',
                fillColor: 'blue',
                fillOpacity: 0.1,
                weight: 1
              }}
            />
          )}
        </React.Fragment>
      ))}
    </MapContainer>
  )
}

export default Map
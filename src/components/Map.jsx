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

const serviceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const transitIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33]
})

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
    }

    // Debug logging for poverty mode
    if (mapMode === 'poverty' && props.zipCode) {
      console.log(`Zip ${props.zipCode}: poverty rate = ${props.povertyRate}, color = ${fillColor}`)
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
        key={`zipcodes-${mapMode}`}
      />

      {showServices && data.homelessServices && data.homelessServices.map((service, index) => (
        <Marker
          key={`service-${index}`}
          position={[service.lat, service.lng]}
          icon={serviceIcon}
        >
          <Popup>
            <div style={{ minWidth: '250px' }}>
              <h4>{service.service_name}</h4>
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
      ))}

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
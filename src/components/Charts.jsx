import React from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91bfdb']

export const ServiceGapChart = ({ data }) => {
  if (!data.processedZipCodes) return <div>Loading chart data...</div>

  const chartData = data.processedZipCodes.features
    .filter(f => f.properties.zipCode && f.properties.serviceGapScore !== undefined)
    .map(f => ({
      zipCode: f.properties.zipCode,
      gapScore: Math.round(f.properties.serviceGapScore),
      population: f.properties.population || 0,
      serviceCount: f.properties.serviceCount || 0
    }))
    .sort((a, b) => b.gapScore - a.gapScore)
    .slice(0, 15)

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="zipCode" 
          angle={-45}
          textAnchor="end"
          height={50}
          fontSize={10}
          interval={0}
        />
        <YAxis 
          label={{ value: 'Gap Score', angle: -90, position: 'insideLeft', style: { fontSize: '11px' } }}
          fontSize={10}
        />
        <Tooltip 
          formatter={(value, name) => [value, 'Gap Score']}
          labelFormatter={(label) => `Zip Code: ${label}`}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload
              return (
                <div style={{
                  backgroundColor: 'white',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  color: '#333'
                }}>
                  <p style={{ margin: '0 0 4px 0' }}><strong>Zip Code:</strong> {label}</p>
                  <p style={{ margin: '0 0 4px 0' }}><strong>Gap Score:</strong> {data.gapScore}/100</p>
                  <p style={{ margin: '0 0 4px 0' }}><strong>Population:</strong> {data.population.toLocaleString()}</p>
                  <p style={{ margin: '0' }}><strong>Services:</strong> {data.serviceCount}</p>
                </div>
              )
            }
            return null
          }}
        />
        <Bar 
          dataKey="gapScore" 
          fill={(entry) => {
            if (entry >= 80) return COLORS[0]
            if (entry >= 60) return COLORS[1]
            if (entry >= 40) return COLORS[2]
            if (entry >= 20) return COLORS[3]
            return COLORS[4]
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export const PovertyVsServicesChart = ({ data }) => {
  if (!data.processedZipCodes) return <div>Loading chart data...</div>

  const chartData = data.processedZipCodes.features
    .filter(f => 
      f.properties.zipCode && 
      f.properties.povertyRate !== undefined &&
      f.properties.serviceCount !== undefined &&
      f.properties.population > 1000
    )
    .map(f => ({
      zipCode: f.properties.zipCode,
      povertyRate: f.properties.povertyRate,
      serviceCount: f.properties.serviceCount,
      population: f.properties.population,
      gapScore: f.properties.serviceGapScore
    }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ScatterChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="povertyRate" 
          type="number"
          domain={[0, 'dataMax + 5']}
          label={{ value: 'Poverty Rate (%)', position: 'insideBottom', offset: -5, style: { fontSize: '10px' } }}
          fontSize={9}
        />
        <YAxis 
          dataKey="serviceCount"
          type="number"
          label={{ value: 'Services', angle: -90, position: 'insideLeft', style: { fontSize: '10px' } }}
          fontSize={9}
        />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload
              return (
                <div style={{
                  backgroundColor: 'white',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  color: '#333'
                }}>
                  <p style={{ margin: '0 0 4px 0' }}><strong>Zip Code:</strong> {data.zipCode}</p>
                  <p style={{ margin: '0 0 4px 0' }}><strong>Poverty Rate:</strong> {data.povertyRate.toFixed(1)}%</p>
                  <p style={{ margin: '0 0 4px 0' }}><strong>Services:</strong> {data.serviceCount}</p>
                  <p style={{ margin: '0 0 4px 0' }}><strong>Population:</strong> {data.population.toLocaleString()}</p>
                  <p style={{ margin: '0' }}><strong>Gap Score:</strong> {data.gapScore?.toFixed(1)}/100</p>
                </div>
              )
            }
            return null
          }}
        />
        <Scatter 
          dataKey="serviceCount" 
          fill={(entry) => {
            const gapScore = entry.gapScore || 0
            if (gapScore >= 80) return COLORS[0]
            if (gapScore >= 60) return COLORS[1]
            if (gapScore >= 40) return COLORS[2]
            if (gapScore >= 20) return COLORS[3]
            return COLORS[4]
          }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export const ServiceTypeDistribution = ({ data }) => {
  if (!data.homelessServices) return <div>Loading chart data...</div>

  const serviceTypes = {}
  
  data.homelessServices.forEach(service => {
    let category = 'Other'
    const serviceName = service.service_name?.toLowerCase() || ''
    const description = service.description?.toLowerCase() || ''
    
    if (serviceName.includes('shelter') || serviceName.includes('housing') || 
        description.includes('shelter') || description.includes('housing')) {
      category = 'Housing/Shelter'
    } else if (serviceName.includes('food') || serviceName.includes('meal') ||
               description.includes('food') || description.includes('meal')) {
      category = 'Food Services'
    } else if (serviceName.includes('health') || serviceName.includes('medical') ||
               description.includes('health') || description.includes('medical')) {
      category = 'Healthcare'
    } else if (serviceName.includes('mental') || serviceName.includes('therapy') ||
               description.includes('mental') || description.includes('therapy')) {
      category = 'Mental Health'
    } else if (serviceName.includes('job') || serviceName.includes('employment') ||
               description.includes('job') || description.includes('employment')) {
      category = 'Employment'
    }
    
    serviceTypes[category] = (serviceTypes[category] || 0) + 1
  })

  const chartData = Object.entries(serviceTypes).map(([name, value]) => ({
    name,
    value
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name.split('/')[0]} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={60}
          fill="#8884d8"
          dataKey="value"
          style={{ fontSize: '10px' }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

export const DemographicChart = ({ data, metric = 'povertyRate' }) => {
  if (!data.processedZipCodes) return <div>Loading chart data...</div>

  const getMetricValue = (properties, metric) => {
    switch (metric) {
      case 'povertyRate': return properties.povertyRate
      case 'veteranPopulation': return properties.veteranPopulation
      case 'disabilityPopulation': return properties.disabilityPopulation
      case 'seniorPopulation': return properties.seniorPopulation
      case 'youthPopulation': return properties.youthPopulation
      default: return 0
    }
  }

  const getMetricLabel = (metric) => {
    switch (metric) {
      case 'povertyRate': return 'Poverty Rate (%)'
      case 'veteranPopulation': return 'Veteran Population'
      case 'disabilityPopulation': return 'Population with Disability'
      case 'seniorPopulation': return 'Senior Population (60+)'
      case 'youthPopulation': return 'Youth Population'
      default: return 'Value'
    }
  }

  const chartData = data.processedZipCodes.features
    .filter(f => f.properties.zipCode && f.properties.population > 1000)
    .map(f => ({
      zipCode: f.properties.zipCode,
      value: getMetricValue(f.properties, metric),
      serviceCount: f.properties.serviceCount || 0,
      gapScore: f.properties.serviceGapScore || 0
    }))
    .filter(d => {
      // For poverty rate, keep all values including 0
      if (metric === 'povertyRate') {
        return d.value !== undefined && d.value !== null
      }
      // For population metrics, filter out 0 values as they're not meaningful
      return d.value !== undefined && d.value !== null && d.value > 0
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 20)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 10, right: 15, left: 20, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="zipCode" 
          angle={-45}
          textAnchor="end"
          height={40}
          fontSize={9}
          interval={0}
        />
        <YAxis 
          label={{ value: getMetricLabel(metric).split(' ')[0], angle: -90, position: 'insideLeft', style: { fontSize: '10px' } }}
          fontSize={9}
        />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload
              return (
                <div style={{
                  backgroundColor: 'white',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  color: '#333'
                }}>
                  <p style={{ margin: '0 0 4px 0' }}><strong>Zip Code:</strong> {label}</p>
                  <p style={{ margin: '0 0 4px 0' }}><strong>{getMetricLabel(metric)}:</strong> {
                    metric === 'povertyRate' ? 
                    `${data.value.toFixed(1)}%` : 
                    data.value.toLocaleString()
                  }</p>
                  <p style={{ margin: '0 0 4px 0' }}><strong>Services:</strong> {data.serviceCount}</p>
                  <p style={{ margin: '0' }}><strong>Gap Score:</strong> {data.gapScore.toFixed(1)}/100</p>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}
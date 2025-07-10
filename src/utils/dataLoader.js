import Papa from 'papaparse'
import * as turf from '@turf/turf'

export const loadCSV = async (url) => {
  try {
    const response = await fetch(url)
    const csvText = await response.text()
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors)
          }
          resolve(results.data)
        },
        error: (error) => reject(error)
      })
    })
  } catch (error) {
    console.error('Error loading CSV:', error)
    throw error
  }
}

export const loadGeoJSON = async (url) => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error loading GeoJSON:', error)
    throw error
  }
}

export const loadJSON = async (url) => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error loading JSON:', error)
    throw error
  }
}

export const processHomelessServices = (services) => {
  return services
    .filter(service => service.latitude && service.longitude)
    .map(service => ({
      ...service,
      lat: parseFloat(service.latitude),
      lng: parseFloat(service.longitude),
      type: 'homeless_service'
    }))
}

export const processTransitData = (stops, routes) => {
  const processedStops = stops
    .filter(stop => stop.stop_lat && stop.stop_lon)
    .map(stop => ({
      ...stop,
      lat: parseFloat(stop.stop_lat),
      lng: parseFloat(stop.stop_lon),
      type: 'transit_stop'
    }))

  return { stops: processedStops, routes }
}

export const processACSData = (acsData) => {
  return acsData.map(record => ({
    ...record,
    zipCode: record['Zip Code']?.toString(),
    population: record['Population'] || 0,
    povertyPopulation: record['Population in Poverty'] || 0,
    povertyRate: record['Population in Poverty'] && record['Population'] 
      ? (record['Population in Poverty'] / record['Population']) * 100 
      : 0,
    medianIncome: record['Median Income'] || 0,
    renterPopulation: record['Renter Population'] || 0,
    renterRate: record['Renter Population'] && record['Population']
      ? (record['Renter Population'] / record['Population']) * 100
      : 0,
    housingBurden: record['Median Gross Rent'] || 0,
    veteranPopulation: record['Veteran Population'] || 0,
    disabilityPopulation: record['Population with Disability'] || 0,
    seniorPopulation: record['Senior Population (60y+)'] || 0,
    youthPopulation: record['Youth Population'] || 0
  }))
}

export const mergeDataWithGeography = (geoData, demographicData, key = 'zipCode') => {
  const geoFeatures = geoData.features.map(feature => {
    // Check different possible zip code property names in geojson
    const zipCode = feature.properties.zip?.toString() || 
                   feature.properties.ZIP?.toString() || 
                   feature.properties.ZIPCODE?.toString() ||
                   feature.properties.zipcode?.toString()
    
    const matchingDemo = demographicData.find(d => d[key]?.toString() === zipCode)
    
    if (matchingDemo && zipCode) {
      console.log(`Matched zip ${zipCode} with demo data:`, {
        population: matchingDemo.population,
        povertyPopulation: matchingDemo.povertyPopulation,
        povertyRate: matchingDemo.povertyRate
      })
    }
    
    return {
      ...feature,
      properties: {
        ...feature.properties,
        ...matchingDemo,
        zipCode
      }
    }
  })

  return {
    ...geoData,
    features: geoFeatures
  }
}

export const calculateServiceGaps = (zipCodeData, homelessServices) => {
  return zipCodeData.features.map(feature => {
    const zipGeometry = feature.geometry
    const zipCode = feature.properties.zipCode
    
    if (!zipGeometry || !zipCode) {
      return {
        ...feature,
        properties: {
          ...feature.properties,
          serviceCount: 0,
          nearestServiceDistance: null,
          serviceGapScore: 100
        }
      }
    }

    const servicesInZip = homelessServices.filter(service => {
      const point = turf.point([service.lng, service.lat])
      try {
        return turf.booleanPointInPolygon(point, zipGeometry)
      } catch (error) {
        return false
      }
    })

    const zipCentroid = turf.centroid(feature)
    let nearestDistance = null

    if (homelessServices.length > 0) {
      const distances = homelessServices.map(service => {
        const servicePoint = turf.point([service.lng, service.lat])
        return turf.distance(zipCentroid, servicePoint, { units: 'miles' })
      })
      nearestDistance = Math.min(...distances)
    }

    const povertyRate = feature.properties.povertyRate || 0
    const population = feature.properties.population || 0
    const serviceCount = servicesInZip.length

    const serviceGapScore = calculateGapScore(
      povertyRate,
      population,
      serviceCount,
      nearestDistance
    )

    return {
      ...feature,
      properties: {
        ...feature.properties,
        serviceCount,
        nearestServiceDistance: nearestDistance,
        serviceGapScore
      }
    }
  })
}

const calculateGapScore = (povertyRate, population, serviceCount, nearestDistance) => {
  let score = 0
  
  score += Math.min(povertyRate * 2, 50)
  
  const populationScore = Math.min((population / 1000) * 5, 25)
  score += populationScore
  
  const serviceScore = Math.max(15 - (serviceCount * 3), 0)
  score += serviceScore
  
  if (nearestDistance !== null) {
    const distanceScore = Math.min(nearestDistance * 2, 10)
    score += distanceScore
  } else {
    score += 10
  }
  
  return Math.min(score, 100)
}

export const getColorByGapScore = (score) => {
  if (score >= 80) return '#d73027'      // High gap - Red
  if (score >= 60) return '#fc8d59'      // Medium-high gap - Orange
  if (score >= 40) return '#fee08b'      // Medium gap - Yellow
  if (score >= 20) return '#d9ef8b'      // Low-medium gap - Light green
  return '#91bfdb'                       // Low gap - Blue
}

export const getColorByPovertyRate = (rate) => {
  if (rate >= 30) return '#d73027'
  if (rate >= 20) return '#fc8d59'
  if (rate >= 15) return '#fee08b'
  if (rate >= 10) return '#d9ef8b'
  return '#91bfdb'
}
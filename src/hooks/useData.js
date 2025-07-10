import { useState, useEffect } from 'react'
import { 
  loadCSV, 
  loadGeoJSON, 
  loadJSON,
  processHomelessServices,
  processTransitData,
  processACSData,
  mergeDataWithGeography,
  calculateServiceGaps
} from '../utils/dataLoader'

export const useData = () => {
  const [data, setData] = useState({
    zipCodes: null,
    homelessServices: null,
    transitStops: null,
    transitRoutes: null,
    demographics: null,
    processedZipCodes: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true)
        setError(null)

        const dataPath = '/data'

        const [
          zipCodesData,
          homelessServicesData,
          transitStopsData,
          transitRoutesData,
          demographicsData
        ] = await Promise.all([
          loadGeoJSON(`${dataPath}/sd_zipcodes.geojson`),
          loadJSON(`${dataPath}/homeless_services_hackathon.json`),
          loadCSV(`${dataPath}/Transit_Stops_hackathon.csv`),
          loadCSV(`${dataPath}/Transit_Routes_hackathon.csv`),
          loadCSV(`${dataPath}/acs2023_hackathon.csv`)
        ])

        const processedServices = processHomelessServices(homelessServicesData)
        const { stops: processedStops } = processTransitData(transitStopsData, transitRoutesData)
        const processedDemographics = processACSData(demographicsData)

        const mergedZipCodes = mergeDataWithGeography(
          zipCodesData, 
          processedDemographics, 
          'zipCode'
        )

        const zipCodesWithGaps = calculateServiceGaps(mergedZipCodes, processedServices)

        setData({
          zipCodes: zipCodesData,
          homelessServices: processedServices,
          transitStops: processedStops,
          transitRoutes: transitRoutesData,
          demographics: processedDemographics,
          processedZipCodes: {
            ...mergedZipCodes,
            features: zipCodesWithGaps
          }
        })

      } catch (err) {
        console.error('Error loading data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [])

  return { data, loading, error }
}

export const useStats = (data) => {
  const [stats, setStats] = useState({
    totalPopulation: 0,
    totalHomelessServices: 0,
    totalTransitStops: 0,
    averagePovertyRate: 0,
    highestGapZipCode: null,
    averageServiceGap: 0
  })

  useEffect(() => {
    if (!data.processedZipCodes || !data.homelessServices || !data.transitStops) {
      return
    }

    const zipCodeFeatures = data.processedZipCodes.features
    const validFeatures = zipCodeFeatures.filter(f => f.properties.population > 0)

    const totalPopulation = validFeatures.reduce(
      (sum, feature) => sum + (feature.properties.population || 0), 0
    )

    const totalPovertyPopulation = validFeatures.reduce(
      (sum, feature) => sum + (feature.properties.povertyPopulation || 0), 0
    )

    const averagePovertyRate = totalPopulation > 0 
      ? (totalPovertyPopulation / totalPopulation) * 100 
      : 0

    const gapScores = validFeatures
      .map(f => f.properties.serviceGapScore)
      .filter(score => score !== undefined && score !== null)

    const averageServiceGap = gapScores.length > 0
      ? gapScores.reduce((sum, score) => sum + score, 0) / gapScores.length
      : 0

    const highestGapFeature = validFeatures.reduce((highest, current) => {
      if (!highest || (current.properties.serviceGapScore > highest.properties.serviceGapScore)) {
        return current
      }
      return highest
    }, null)

    setStats({
      totalPopulation,
      totalHomelessServices: data.homelessServices.length,
      totalTransitStops: data.transitStops.length,
      averagePovertyRate,
      highestGapZipCode: highestGapFeature?.properties.zipCode || null,
      averageServiceGap
    })

  }, [data])

  return stats
}
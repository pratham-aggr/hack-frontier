import Papa from 'papaparse'
import fs from 'fs'

console.log('Testing ACS data processing...')

// Read and parse the CSV file
const csvContent = fs.readFileSync('./public/data/acs2023_hackathon.csv', 'utf-8')

Papa.parse(csvContent, {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: (results) => {
    console.log('CSV parsing complete')
    console.log('Total rows:', results.data.length)
    console.log('Headers:', Object.keys(results.data[0]))
    
    // Process first few records
    const processed = results.data.slice(0, 5).map(record => ({
      zipCode: record['Zip Code']?.toString(),
      population: record['Population'] || 0,
      povertyPopulation: record['Population in Poverty'] || 0,
      povertyRate: record['Population in Poverty'] && record['Population'] 
        ? (record['Population in Poverty'] / record['Population']) * 100 
        : 0,
      medianIncome: record['Median Income'] || 0,
    }))
    
    console.log('Processed sample:', processed)
    
    // Check for actual poverty rates
    const withPoverty = results.data.filter(r => r['Population in Poverty'] > 0).slice(0, 10)
    console.log('\nRecords with poverty data:')
    withPoverty.forEach(r => {
      const rate = r['Population'] ? (r['Population in Poverty'] / r['Population']) * 100 : 0
      console.log(`Zip ${r['Zip Code']}: ${r['Population in Poverty']}/${r['Population']} = ${rate.toFixed(1)}%`)
    })
  },
  error: (error) => {
    console.error('Error parsing CSV:', error)
  }
})
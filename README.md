# San Diego Homelessness Dashboard

An interactive web application that visualizes homelessness service gaps across San Diego County using demographic data, service locations, and transportation accessibility.

## Features

- **Interactive Map Visualization**
  - Service gap analysis by zip code
  - Poverty rate mapping
  - Population density visualization
  - Homeless service locations with detailed information
  - Public transit stops and coverage areas

- **Data Analytics Dashboard**
  - Key statistics and metrics
  - Service gap scoring algorithm
  - Demographic analysis charts
  - Service type distribution
  - Poverty vs services correlation

- **Multi-layered Data Integration**
  - 211 San Diego homeless services data
  - Point-in-Time Count data from RTFHSD
  - American Community Survey demographic data
  - SANDAG public transportation data
  - San Diego zip code boundaries

## Data Sources

- **Homeless Services**: 211 San Diego service directory
- **Demographics**: US Census American Community Survey 2023
- **Point-in-Time Count**: Regional Task Force on Homelessness (RTFHSD)
- **Transportation**: San Diego Association of Governments (SANDAG)
- **Geographic Boundaries**: San Diego County zip code boundaries

## Technology Stack

- **Frontend**: React 18 with Vite
- **Mapping**: Leaflet with React-Leaflet
- **Charts**: Recharts
- **Data Processing**: D3.js, Papa Parse, Turf.js
- **Styling**: CSS Grid & Flexbox

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Data Setup

The application expects data files in `public/data/`:
- `sd_zipcodes.geojson` - San Diego zip code boundaries
- `homeless_services_hackathon.json` - Homeless services locations
- `acs2023_hackathon.csv` - American Community Survey data
- `Transit_Stops_hackathon.csv` - Public transit stops
- `Transit_Routes_hackathon.csv` - Public transit routes

## Service Gap Analysis

The dashboard calculates a **Service Gap Score** (0-100) for each zip code based on:

1. **Poverty Rate** (0-50 points): Higher poverty rates increase the gap score
2. **Population Density** (0-25 points): More dense areas may need more services
3. **Service Availability** (0-15 points): Fewer services increase the gap score
4. **Geographic Access** (0-10 points): Distance to nearest service affects the score

**Higher scores indicate greater need for additional homeless services.**

## Key Insights

The dashboard helps identify:

- **Service Deserts**: Areas with high need but few services
- **Demographic Patterns**: How poverty, age, and disability correlate with service gaps
- **Transportation Access**: How public transit affects service accessibility
- **Resource Allocation**: Where new services would have the most impact

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Map.jsx         # Interactive Leaflet map
│   ├── Sidebar.jsx     # Control panel and stats
│   └── Charts.jsx      # Data visualization charts
├── hooks/              # Custom React hooks
│   └── useData.js      # Data loading and processing
├── utils/              # Utility functions
│   └── dataLoader.js   # Data processing algorithms
└── App.jsx             # Main application component
```

### Key Algorithms

- **Gap Score Calculation**: Combines poverty, population, services, and distance
- **Geographic Analysis**: Uses Turf.js for spatial calculations
- **Data Merging**: Joins demographic data with geographic boundaries
- **Service Categorization**: Automatically categorizes services by type

## Building for Production

```bash
npm run build
```

The built application will be in the `dist/` directory.

## Contributing

This project was created for the DSA Hackathon to analyze homelessness service gaps in San Diego. Feel free to extend the analysis or improve the visualizations.

## License

This project is open source and available under the MIT License.
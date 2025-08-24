import { CarbonData, DataSource, CarbonIntensityIndex } from "../../types/carbonData"

interface ElectricityMapsCarbonResponse {
  zone: string
  carbonIntensity: number
  datetime: string
  updatedAt: string
  createdAt: string
  emissionFactorType: string
  isEstimated: boolean
  estimationMethod?: string
}

interface ElectricityMapsPowerResponse {
  zone: string
  datetime: string
  updatedAt: string
  createdAt: string
  powerConsumptionBreakdown: Record<string, number>
  powerProductionBreakdown: Record<string, number>
  powerImportBreakdown?: Record<string, number>
  powerExportBreakdown?: Record<string, number>
  fossilFreePercentage: number
  renewablePercentage: number
}

const EU_CONFIG = {
  baseUrl: "https://api.electricitymap.org/v3",
  countryCodeRegex: /^[A-Za-z]{2}$/,
  fuelTypeMapping: {
    nuclear: "nuclear",
    wind: "wind",
    solar: "solar",
    gas: "gas",
    coal: "coal",
    hydro: "hydro",
    "hydro discharge": "hydro",
    biomass: "biomass",
    geothermal: "other",
    oil: "other",
    "battery discharge": "other",
    unknown: "other",
  } as const,
} as const

export const isEULocationSupported = (location: string): boolean => {
  if (!location || typeof location !== "string") {
    return false
  }
  return EU_CONFIG.countryCodeRegex.test(location.trim())
}

export const getEUDataSource = (): DataSource => "electricity-maps"

const calculateIntensityIndex = (intensity: number): CarbonIntensityIndex => {
  if (intensity <= 100) return "low"
  if (intensity <= 200) return "moderate"
  if (intensity <= 300) return "high"
  return "very high"
}

const calculatePercentages = (powerBreakdown: Record<string, number>): Record<string, number> => {
  const totalConsumption = Object.values(powerBreakdown)
    .filter((value) => value > 0)
    .reduce((sum, value) => sum + value, 0)

  if (totalConsumption === 0) return {}

  const percentages: Record<string, number> = {}
  for (const [fuelType, value] of Object.entries(powerBreakdown)) {
    if (value > 0) {
      percentages[fuelType] = (value / totalConsumption) * 100
    }
  }
  return percentages
}

const transformPowerBreakdownToMix = (
  powerData: ElectricityMapsPowerResponse
): Array<{ fuel: string; perc: number }> => {
  const consumption = powerData.powerConsumptionBreakdown
  if (!consumption) return []

  const percentages = calculatePercentages(consumption)
  const groupedByFuel: Record<string, number> = {}

  for (const [fuelType, percentage] of Object.entries(percentages)) {
    const mappedFuel = EU_CONFIG.fuelTypeMapping[fuelType.toLowerCase() as keyof typeof EU_CONFIG.fuelTypeMapping] || "other"
    groupedByFuel[mappedFuel] = (groupedByFuel[mappedFuel] || 0) + percentage
  }

  return Object.entries(groupedByFuel)
    .map(([fuel, perc]) => ({ fuel, perc: Math.round(perc * 10) / 10 }))
    .filter((item) => item.perc > 0)
    .sort((a, b) => b.perc - a.perc)
}

const fetchCarbonIntensity = async (
  countryCode: string,
  apiKey: string
): Promise<ElectricityMapsCarbonResponse | null> => {
  try {
    const url = `${EU_CONFIG.baseUrl}/carbon-intensity/latest?zone=${countryCode.toUpperCase()}`
    const response = await fetch(url, {
      headers: { "auth-token": apiKey },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error(
        `EUCarbonAdapter: API request failed with status ${response.status}: ${errorText}`
      )

      if (response.status === 401) {
        throw new Error("Invalid Electricity Maps API key. Please check your API key configuration.")
      } else if (response.status === 403) {
        throw new Error(
          `Access denied for country ${countryCode}. Your free Electricity Maps API key might not include this zone. You can only access 1 country with the free tier.`
        )
      } else if (response.status === 404) {
        throw new Error(
          `Country code ${countryCode} not found or not supported by Electricity Maps.`
        )
      } else {
        throw new Error(`Electricity Maps API error (${response.status}). Please try again later.`)
      }
    }

    return (await response.json()) as ElectricityMapsCarbonResponse
  } catch (error) {
    console.error("Failed to fetch carbon intensity:", error)
    return null
  }
}

const fetchPowerBreakdown = async (
  countryCode: string,
  apiKey: string
): Promise<ElectricityMapsPowerResponse | null> => {
  try {
    const url = `${EU_CONFIG.baseUrl}/power-breakdown/latest?zone=${countryCode.toUpperCase()}`
    const response = await fetch(url, {
      headers: { "auth-token": apiKey },
    })

    if (!response.ok) {
      console.debug(`EUCarbonAdapter: Power breakdown not available for ${countryCode}`)
      return null
    }

    return (await response.json()) as ElectricityMapsPowerResponse
  } catch (error) {
    console.debug("Failed to fetch power breakdown:", error)
    return null
  }
}

export const fetchEUCarbonData = async (
  countryCode: string,
  apiKey: string
): Promise<CarbonData | null> => {
  try {
    if (!isEULocationSupported(countryCode)) {
      console.warn(`EUCarbonAdapter: Invalid country code format: ${countryCode}`)
      return null
    }

    const carbonIntensity = await fetchCarbonIntensity(countryCode, apiKey)
    if (!carbonIntensity) return null

    const powerBreakdown = await fetchPowerBreakdown(countryCode, apiKey)
    const generationMix = powerBreakdown ? transformPowerBreakdownToMix(powerBreakdown) : undefined

    return {
      intensity: carbonIntensity.carbonIntensity,
      index: calculateIntensityIndex(carbonIntensity.carbonIntensity),
      region: carbonIntensity.zone,
      timestamp: new Date(carbonIntensity.datetime),
      mix: generationMix,
      source: getEUDataSource(),
    }
  } catch (error) {
    console.error("EUCarbonAdapter: Failed to fetch carbon intensity:", error)
    return null
  }
}

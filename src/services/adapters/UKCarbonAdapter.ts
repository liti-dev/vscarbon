import { CarbonData, DataSource } from "../../types"

interface NationalGridResponse {
  data: [
    {
      shortname: string
      data: [
        {
          intensity: {
            forecast: number
            index: string
          }
          generationmix: Array<{
            fuel: string
            perc: number
          }>
        }
      ]
    }
  ]
}

const UK_ADAPTER_CONFIG = {
  baseUrl: "https://api.carbonintensity.org.uk/regional",
}

export const isUKLocationSupported = (location: string): boolean => {
  if (!location || typeof location !== "string") {
    return false
  }
  // UK postcode validation (outward postcode only)
  const regionalPostcodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?$/i
  return regionalPostcodeRegex.test(location.trim())
}

// get data source identifier
export const getUKDataSource = (): DataSource => "national-grid"

export const fetchUKCarbonData = async (postcode: string): Promise<CarbonData | null> => {
  try {
    if (!isUKLocationSupported(postcode)) {
      console.warn(`UKCarbonAdapter: Invalid postcode format: ${postcode}`)
      return null
    }

    const url = `${UK_ADAPTER_CONFIG.baseUrl}/postcode/${postcode}`
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`UKCarbonAdapter: API request failed with status ${response.status}`)
      return null
    }

    const data = (await response.json()) as NationalGridResponse
    return transformNationalGridResponse(data)
  } catch (error) {
    console.error("UKCarbonAdapter: Failed to fetch carbon intensity:", error)
    return null
  }
}

// Helper function
const transformNationalGridResponse = (response: NationalGridResponse): CarbonData => {
  const regionalData = response.data[0]
  const intensityData = regionalData.data[0]

  return {
    intensity: intensityData.intensity.forecast,
    index: intensityData.intensity.index as any,
    region: regionalData.shortname || "England",
    timestamp: new Date(),
    forecast: intensityData.intensity.forecast,
    mix: intensityData.generationmix?.map((item) => ({
      fuel: item.fuel,
      perc: item.perc,
    })),
    source: getUKDataSource(),
  }
}

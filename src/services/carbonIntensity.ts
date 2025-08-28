import {
  CarbonData,
  CarbonDataResult,
  CarbonDataError,
  CarbonDataErrorDetails,
} from "../types/carbonData"
import { getCarbonData, isLocationSupported } from "./adapters"

export async function carbon(location: string, electricityMapsToken?: string): Promise<CarbonData> {
  if (!location) {
    throw new Error("Location is required")
  }

  const cleanLocation = location.trim()

  if (!isLocationSupported(cleanLocation)) {
    throw new Error(
      `Location "${cleanLocation}" is not supported. Use UK outward postcodes (e.g., AL10, M1) or country codes (e.g., DE, JP)`
    )
  }

  try {
    const data = await getCarbonData(cleanLocation, electricityMapsToken)

    if (!data) {
      throw new Error(`Unable to fetch carbon data for location "${cleanLocation}"`)
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Unknown error occurred while fetching carbon data")
  }
}

export async function getCarbonIntensity(
  location: string,
  electricityMapsToken?: string
): Promise<CarbonDataResult> {
  try {
    const data = await carbon(location, electricityMapsToken)
    return { data }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred"

    let errorType = CarbonDataError.NETWORK_ERROR
    if (message.includes("not supported")) {
      errorType = CarbonDataError.INVALID_LOCATION
    } else if (message.includes("API key required")) {
      errorType = CarbonDataError.API_UNAVAILABLE
    } else if (message.includes("rate limit")) {
      errorType = CarbonDataError.RATE_LIMITED
    } else if (message.includes("Unsupported region")) {
      errorType = CarbonDataError.UNSUPPORTED_REGION
    }

    const errorDetails: CarbonDataErrorDetails = {
      type: errorType,
      message,
    }

    return { error: errorDetails }
  }
}

// re-export pattern
export { isLocationSupported } from "./adapters"

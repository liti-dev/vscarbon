// For carbon intensity adapter system

export type CarbonIntensityIndex = "very low" | "low" | "moderate" | "high" | "very high"

export type DataSource = "national-grid" | "electricity-maps"

export enum LocationType {
  UK_POSTCODE = "uk-postcode",
  COUNTRY_CODE = "country-code",
  UNKNOWN = "unknown",
}

export interface GenerationMix {
  fuel: string // energy source ("wind", "solar", "gas")
  perc: number // percentage of total generation
}

export interface CarbonData {
  intensity: number // gCO₂/kWh
  index?: CarbonIntensityIndex
  region: string
  timestamp: Date
  forecast?: number
  mix?: GenerationMix[]
  source: DataSource // which API
}

export enum CarbonDataError {
  INVALID_LOCATION = "INVALID_LOCATION",
  API_UNAVAILABLE = "API_UNAVAILABLE",
  RATE_LIMITED = "RATE_LIMITED",
  UNSUPPORTED_REGION = "UNSUPPORTED_REGION",
  NETWORK_ERROR = "NETWORK_ERROR",
}

export interface CarbonDataErrorDetails {
  type: CarbonDataError
  message: string
  retryAfter?: number // rate limiting scenarios
}

// result wrapper
export interface CarbonDataResult {
  data?: CarbonData
  error?: CarbonDataErrorDetails
}

export interface CarbonIntensityAdapter {
  /**
   * Fetch carbon intensity data for the given location
   * @param location - Location identifier (postcode, country code, etc.)
   * @returns Promise resolving to CarbonData or null if unavailable
   */
  fetchCarbonData(location: string): Promise<CarbonData | null>

  isLocationSupported(location: string): boolean
  getDataSource(): DataSource
}

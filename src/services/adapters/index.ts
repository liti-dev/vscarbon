/**
 * Export all carbon intensity adapter functions
 */
export { fetchUKCarbonData, isUKLocationSupported, getUKDataSource } from './UKCarbonAdapter';
export { fetchEUCarbonData, isEULocationSupported, getEUDataSource } from './EUCarbonAdapter';

// Import for internal use in utility functions
import { fetchUKCarbonData, isUKLocationSupported } from './UKCarbonAdapter';
import { fetchEUCarbonData, isEULocationSupported } from './EUCarbonAdapter';

/**
 * Simple utility to get carbon data for any supported location
 */
export const getCarbonData = async (location: string, electricityMapsApiKey?: string) => {
  if (isUKLocationSupported(location)) {
    return fetchUKCarbonData(location)
  }
  
  if (isEULocationSupported(location)) {
    if (!electricityMapsApiKey) {
      throw new Error("Electricity Maps API key required for country codes")
    }
    return fetchEUCarbonData(location, electricityMapsApiKey)
  }
  
  return null
}

/**
 * Check if a location is supported by any adapter
 */
export const isLocationSupported = (location: string): boolean => {
  return isUKLocationSupported(location) || isEULocationSupported(location)
}
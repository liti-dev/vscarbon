import { LocationType } from '../types/carbonData.js';
import { isUKLocationSupported } from './adapters/UKCarbonAdapter.js';
import { isEULocationSupported } from './adapters/EUCarbonAdapter.js';

export const detectLocationType = (location: string): LocationType => {
  if (!location || typeof location !== 'string') {
    return LocationType.UNKNOWN;
  }

  const cleanLocation = location.trim();
  
  if (!cleanLocation) {
    return LocationType.UNKNOWN;
  }

  // Use adapter-specific validation for more accurate detection
  if (isUKLocationSupported(cleanLocation)) {
    return LocationType.UK_POSTCODE;
  }

  if (isEULocationSupported(cleanLocation)) {
    return LocationType.COUNTRY_CODE;
  }

  return LocationType.UNKNOWN;
};


export const isLocationSupported = (location: string): boolean => {
  return detectLocationType(location) !== LocationType.UNKNOWN;
};
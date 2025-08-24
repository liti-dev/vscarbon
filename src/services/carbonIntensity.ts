import { fetchUKCarbonData } from "./adapters"

// legacy code for backward compatibility
export default async function getCarbonIntensity(postcode?: string) {
  try {
    if (postcode) {
      // Use the new functional adapter for postcode-specific requests
      const carbonData = await fetchUKCarbonData(postcode)
      if (carbonData) {
        // Transform to legacy format for backward compatibility
        return {
          intensity: carbonData.intensity,
          index: carbonData.index,
          mix: carbonData.mix,
          region: carbonData.region,
        }
      }
      return null
    } else {
      // Fallback to England-wide data for requests without postcode
      const url = "https://api.carbonintensity.org.uk/regional/england"
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error! Status: ${response.status}`)
      }

      const data = await response.json()
      const regionalData = (data as { data: any[] }).data[0]

      return {
        intensity: regionalData.data[0].intensity.forecast,
        index: regionalData.data[0].intensity.index,
        mix: regionalData.data[0].generationmix,
        region: regionalData.shortname || "England",
      }
    }
  } catch (error) {
    console.error("Failed to fetch carbon intensity:", error)
    return null // fallback
  }
}

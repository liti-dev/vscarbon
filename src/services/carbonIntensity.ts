export default async function getCarbonIntensity(postcode?: string) {
  try {
    const url = postcode
      ? `https://api.carbonintensity.org.uk/regional/postcode/${postcode}`
      : `https://api.carbonintensity.org.uk/regional/england`

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
  } catch (error) {
    console.error("Failed to fetch carbon intensity:", error)
    return null // fallback
  }
}

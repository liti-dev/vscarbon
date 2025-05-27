export default async function getCarbonIntensity(postcode?: string) {
  try {
    const url = postcode
      ? `https://api.carbonintensity.org.uk/regional/postcode/${postcode}`
      : `https://api.carbonintensity.org.uk/regional`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Error! Status: ${response.status}`)
    }
    const data = await response.json()
    const regionData = (data as any)?.data[0]
    // console.log("region data", regionData)
    // console.log(regionData.data[0].intensity.forecast)
    return {
      intensity: regionData.data[0].intensity.forecast,
      index: regionData.data[0].intensity.index,
      region: regionData.shortname || "UK",
    }
  } catch (error) {
    console.error("Failed to fetch carbon intensity:", error)
    return null // fallback
  }
}

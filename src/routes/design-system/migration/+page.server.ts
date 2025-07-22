import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  // In a real application, you might load the migration data from a database
  // For now, we'll just return an empty object and let the client-side store handle the data
  return {
    title: 'Design System Migration Tracker'
  }
}
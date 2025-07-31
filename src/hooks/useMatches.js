import { useState, useEffect } from 'react'
import { matchesService } from '../services/matchesService'

export const useMatches = () => {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMatches = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await matchesService.getAll()
      setMatches(data)
    } catch (err) {
      setError(err.message)
      console.error('Erreur lors du chargement des matchs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  const updateMatchSelections = async (matchId, playerIds) => {
    try {
      await matchesService.updateSelections(matchId, playerIds)
      setMatches(prev => prev.map(match => 
        match.id === matchId 
          ? { ...match, selectedPlayers: playerIds }
          : match
      ))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return {
    matches,
    loading,
    error,
    updateMatchSelections,
    refetch: fetchMatches
  }
}
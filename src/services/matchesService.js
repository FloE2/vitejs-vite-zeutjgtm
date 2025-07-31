import { supabase } from '../lib/supabase'

export const matchesService = {
  // Récupérer tous les matchs avec sélections
  async getAll() {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        match_selections (
          student_id,
          students (
            id,
            first_name,
            last_name,
            team
          )
        )
      `)
      .order('date', { ascending: true })
    
    if (error) throw error
    
    // Transformer les données pour correspondre au format existant
    return data.map(match => ({
      id: match.id,
      date: match.date,
      time: match.time,
      opponent: match.opponent,
      championship: match.championship,
      championshipFull: `Championnat ${match.championship}`,
      team: match.team,
      status: match.status,
      tenues: match.tenues_player_id ? 'Joueur assigné' : null,
      arbitrage: match.arbitrage_player_id ? 'Joueur assigné' : null,
      tableMarque: match.table_marque_player_id ? 'Joueur assigné' : null,
      selectedPlayers: match.match_selections.map(sel => sel.student_id)
    }))
  },

  // Mettre à jour les sélections d'un match
  async updateSelections(matchId, playerIds) {
    // Supprimer les anciennes sélections
    await supabase
      .from('match_selections')
      .delete()
      .eq('match_id', matchId)

    // Ajouter les nouvelles sélections
    if (playerIds.length > 0) {
      const selections = playerIds.map(playerId => ({
        match_id: matchId,
        student_id: playerId
      }))

      const { error } = await supabase
        .from('match_selections')
        .insert(selections)

      if (error) throw error
    }
  }
}
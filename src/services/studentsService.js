import { supabase } from '../lib/supabase'

export const studentsService = {
  // Récupérer tous les étudiants
  async getAll() {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('last_name', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Créer un étudiant
  async create(student) {
    const { data, error } = await supabase
      .from('students')
      .insert([{
        first_name: student.firstName,
        last_name: student.lastName,
        birth_date: student.birthDate,
        license_number: student.licenseNumber,
        position: student.position,
        team: student.team,
        is_captain: student.isCaptain || false,
        last_attendance: 'present'
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Mettre à jour un étudiant
  async update(id, updates) {
    const { data, error } = await supabase
      .from('students')
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        birth_date: updates.birthDate,
        license_number: updates.licenseNumber,
        position: updates.position,
        team: updates.team,
        is_captain: updates.isCaptain,
        last_attendance: updates.lastAttendance
      })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Supprimer un étudiant
  async delete(id) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Mettre à jour seulement la présence
  async updateAttendance(id, attendance) {
    const { data, error } = await supabase
      .from('students')
      .update({ last_attendance: attendance })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }
}
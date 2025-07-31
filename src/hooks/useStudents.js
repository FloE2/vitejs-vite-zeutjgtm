import { useState, useEffect } from 'react'
import { studentsService } from '../services/studentsService'

export const useStudents = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await studentsService.getAll()
      
      // Transformer pour correspondre au format existant
      const transformedData = data.map(student => ({
        id: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        birthDate: student.birth_date,
        licenseNumber: student.license_number,
        position: student.position,
        team: student.team,
        isCaptain: student.is_captain,
        lastAttendance: student.last_attendance || 'present'
      }))
      
      setStudents(transformedData)
    } catch (err) {
      setError(err.message)
      console.error('Erreur lors du chargement des étudiants:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const addStudent = async (student) => {
    try {
      const newStudent = await studentsService.create(student)
      const transformedStudent = {
        id: newStudent.id,
        firstName: newStudent.first_name,
        lastName: newStudent.last_name,
        birthDate: newStudent.birth_date,
        licenseNumber: newStudent.license_number,
        position: newStudent.position,
        team: newStudent.team,
        isCaptain: newStudent.is_captain,
        lastAttendance: newStudent.last_attendance || 'present'
      }
      setStudents(prev => [...prev, transformedStudent])
      return transformedStudent
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateStudent = async (id, updates) => {
    try {
      const updatedStudent = await studentsService.update(id, updates)
      const transformedStudent = {
        id: updatedStudent.id,
        firstName: updatedStudent.first_name,
        lastName: updatedStudent.last_name,
        birthDate: updatedStudent.birth_date,
        licenseNumber: updatedStudent.license_number,
        position: updatedStudent.position,
        team: updatedStudent.team,
        isCaptain: updatedStudent.is_captain,
        lastAttendance: updatedStudent.last_attendance || 'present'
      }
      setStudents(prev => prev.map(s => s.id === id ? transformedStudent : s))
      return transformedStudent
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteStudent = async (id) => {
    try {
      await studentsService.delete(id)
      setStudents(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateAttendance = async (id, attendance) => {
    try {
      await studentsService.updateAttendance(id, attendance)
      setStudents(prev => prev.map(s => 
        s.id === id ? { ...s, lastAttendance: attendance } : s
      ))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return {
    students,
    loading,
    error,
    addStudent,
    updateStudent,
    deleteStudent,
    updateAttendance,
    refetch: fetchStudents
  }
}
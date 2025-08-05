import React, { useState, useEffect } from 'react';
import { Calendar, Users, UserCheck, Trophy, Settings, Plus, BarChart3, Edit, Save, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://loamfkojtxothevemetn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYW1ma29qdHhvdGhldmVtZXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzY2MDMsImV4cCI6MjA2OTY1MjYwM30.Zaf2b9c3Y_NHWixIPvmsXLgVxuMCBu-bloWmrs-ULiY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BasketballApp = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [userType, setUserType] = useState('player');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedChampionship, setSelectedChampionship] = useState('all');
  const [selectedDate, setSelectedDate] = useState('current');

  // États pour les données
  const [students, setStudents] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [supabaseMode, setSupabaseMode] = useState(true);

  // États pour l'édition
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectionMode, setSelectionMode] = useState('team');
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    licenseNumber: '',
    position: 'Meneur',
    team: '2',
    isCaptain: false
  });

  // États pour l'édition des matchs
  const [editingMatch, setEditingMatch] = useState(null);
  const [showEditMatch, setShowEditMatch] = useState(false);

  // États pour la création de matchs
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [newMatch, setNewMatch] = useState({
    date: '',
    time: '',
    opponent: '',
    championship: 'LDV2',
    team: '2',
    lieu: 'Gymnase LDV',
    status: 'upcoming'
  });

  // NOUVEAUX ÉTATS POUR LES ENTRAÎNEMENTS
  const [trainings, setTrainings] = useState([]);
  const [showAddTraining, setShowAddTraining] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [showEditTraining, setShowEditTraining] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [newTraining, setNewTraining] = useState({
    date: '',
    time: '',
    type: 'entrainement',
    theme: 'Entraînement général',
    lieu: 'Gymnase LDV',
    team: 'all',
    status: 'upcoming',
    description: ''
  });

  // États pour l'historique des présences par entraînement
  const [trainingAttendances, setTrainingAttendances] = useState([]);

  const positions = ['Meneur', 'Arrière', 'Ailier', 'Ailier fort', 'Pivot'];

  const attendanceStatuses = [
    { key: 'present', label: 'Présent', color: 'bg-green-600', textColor: 'text-green-600', code: 'P' },
    { key: 'absent', label: 'Absent', color: 'bg-red-600', textColor: 'text-red-600', code: 'A' },
    { key: 'absent-warned', label: 'Absent Prévenu WhatsApp', color: 'bg-orange-500', textColor: 'text-orange-500', code: 'AP' },
    { key: 'injured', label: 'Blessé', color: 'bg-purple-600', textColor: 'text-purple-600', code: 'B' },
    { key: 'excused', label: 'Excusé', color: 'bg-blue-600', textColor: 'text-blue-600', code: 'E' },
    { key: 'stage', label: 'En Stage', color: 'bg-teal-600', textColor: 'text-teal-600', code: 'S' },
  ];

  // Données statiques de fallback
  const staticStudents = [
    { id: 1, firstName: 'Antoine', lastName: 'Martin', birthDate: '2005-03-15', licenseNumber: 'LDV20001', position: 'Meneur', team: '2', isCaptain: true, lastAttendance: 'present' },
    { id: 2, firstName: 'Marie', lastName: 'Dubois', birthDate: '2006-07-22', licenseNumber: 'LDV20002', position: 'Arrière', team: '2', isCaptain: false, lastAttendance: 'absent-warned' },
    { id: 3, firstName: 'Lucas', lastName: 'Bernard', birthDate: '2005-12-08', licenseNumber: 'LDV20003', position: 'Ailier fort', team: '3', isCaptain: true, lastAttendance: 'present' },
    { id: 4, firstName: 'Emma', lastName: 'Rousseau', birthDate: '2006-04-17', licenseNumber: 'LDV20004', position: 'Pivot', team: '3', isCaptain: false, lastAttendance: 'injured' },
    { id: 5, firstName: 'Thomas', lastName: 'Leroy', birthDate: '2005-09-03', licenseNumber: 'LDV20005', position: 'Ailier', team: '2', isCaptain: false, lastAttendance: 'present' },
    { id: 6, firstName: 'Sarah', lastName: 'Michel', birthDate: '2006-01-25', licenseNumber: 'LDV20006', position: 'Meneur', team: '3', isCaptain: false, lastAttendance: 'excused' },
    { id: 7, firstName: 'Hugo', lastName: 'Petit', birthDate: '2005-11-12', licenseNumber: 'LDV20007', position: 'Ailier fort', team: '2', isCaptain: false, lastAttendance: 'present' },
    { id: 8, firstName: 'Léa', lastName: 'Garcia', birthDate: '2006-06-30', licenseNumber: 'LDV20008', position: 'Arrière', team: '3', isCaptain: false, lastAttendance: 'stage' }
  ];

  const staticMatches = [
    { id: 1, date: '2025-08-07', time: '19:00', opponent: 'Voltaire', championship: 'LDV2', championshipFull: 'Championnat LDV2', team: '2', lieu: 'Gymnase Voltaire', status: 'upcoming', tenues: null, arbitrage: null, tableMarque: null, selectedPlayers: [] },
    { id: 2, date: '2025-08-10', time: '15:30', opponent: 'Diderot', championship: 'LDV3', championshipFull: 'Championnat LDV3', team: '3', lieu: 'Gymnase LDV', status: 'upcoming', tenues: null, arbitrage: null, tableMarque: null, selectedPlayers: [] },
    { id: 3, date: '2025-07-30', time: '18:00', opponent: 'Montaigne', championship: 'LDV2', championshipFull: 'Championnat LDV2', team: '2', lieu: 'Gymnase Montaigne', status: 'completed', tenues: 'Domicile', arbitrage: 'Coach adverse', tableMarque: 'Parents', selectedPlayers: [1, 2, 5, 7] }
  ];

  // DONNÉES STATIQUES POUR LES ENTRAÎNEMENTS
  const staticTrainings = [
    {
      id: 1,
      date: '2025-08-05',
      time: '18:00',
      type: 'entrainement',
      theme: 'Défense individuelle',
      lieu: 'Gymnase LDV',
      team: 'all',
      status: 'upcoming',
      description: 'Focus sur les techniques défensives de base'
    },
    {
      id: 2,
      date: '2025-08-08',
      time: '18:00',
      type: 'entrainement',
      theme: 'Attaque rapide',
      lieu: 'Gymnase LDV',
      team: 'all',
      status: 'upcoming',
      description: 'Travail des contre-attaques et transitions'
    },
    {
      id: 3,
      date: '2025-07-28',
      time: '18:00',
      type: 'entrainement',
      theme: 'Tirs à 3 points',
      lieu: 'Gymnase LDV',
      team: 'all',
      status: 'completed',
      description: 'Perfectionnement des tirs extérieurs'
    },
    {
      id: 4,
      date: '2025-07-25',
      time: '18:00',
      type: 'entrainement',
      theme: 'Rebonds offensifs',
      lieu: 'Gymnase LDV',
      team: 'all',
      status: 'completed',
      description: 'Amélioration du jeu près du panier'
    }
  ];

  // Historique des présences par entraînement
  const staticTrainingAttendances = [
    {
      id: 1,
      trainingId: 3,
      date: '2025-07-28',
      attendances: [
        { studentId: 1, status: 'present' },
        { studentId: 2, status: 'absent-warned' },
        { studentId: 3, status: 'present' },
        { studentId: 4, status: 'injured' },
        { studentId: 5, status: 'present' },
        { studentId: 6, status: 'excused' },
        { studentId: 7, status: 'present' },
        { studentId: 8, status: 'stage' }
      ]
    },
    {
      id: 2,
      trainingId: 4,
      date: '2025-07-25',
      attendances: [
        { studentId: 1, status: 'present' },
        { studentId: 2, status: 'present' },
        { studentId: 3, status: 'excused' },
        { studentId: 4, status: 'present' },
        { studentId: 5, status: 'absent' },
        { studentId: 6, status: 'present' },
        { studentId: 7, status: 'present' },
        { studentId: 8, status: 'present' }
      ]
    }
  ];

  // Initialisation des données
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      try {
        if (supabaseMode) {
          console.log('🔥 Tentative de connexion à Supabase...');
          setConnectionStatus('connecting');

          // Test de connexion
          const { data: testData, error: testError } = await supabase
            .from('students')
            .select('count')
            .limit(1);

          if (testError) throw testError;

          console.log('✅ Connexion Supabase réussie !');
          setConnectionStatus('connected');

          // Charger les données depuis Supabase
          const [studentsResult, matchesResult, trainingsResult, attendancesResult] = await Promise.all([
            supabase.from('students').select('*'),
            supabase.from('matches').select('*'),
            supabase.from('trainings').select('*'),
            supabase.from('training_attendances').select('*')
          ]);

          if (studentsResult.error) throw studentsResult.error;
          if (matchesResult.error) throw matchesResult.error;

          // Mapper les données des étudiants
          setStudents(studentsResult.data.map(student => ({
            id: student.id,
            firstName: student.first_name,
            lastName: student.last_name,
            birthDate: student.birth_date,
            licenseNumber: student.license_number,
            position: student.position,
            team: student.team,
            isCaptain: student.is_captain,
            lastAttendance: student.last_attendance || 'present'
          })));

          // Mapper les données des matchs
          setMatches(matchesResult.data.map(match => ({
            id: match.id,
            date: match.date,
            time: match.time,
            opponent: match.opponent,
            championship: match.championship,
            championshipFull: `Championnat ${match.championship}`,
            team: match.team,
            lieu: match.lieu,
            status: match.status,
            tenues: match.tenues,
            arbitrage: match.arbitrage,
            tableMarque: match.table_marque,
            selectedPlayers: []
          })));

          // Mapper les données des entraînements
          if (!trainingsResult.error) {
            setTrainings(trainingsResult.data || []);
          } else {
            setTrainings(staticTrainings);
          }

          // Mapper les présences d'entraînements
          if (!attendancesResult.error) {
            setTrainingAttendances(attendancesResult.data.map(ta => ({
              id: ta.id,
              trainingId: ta.training_id,
              date: ta.date,
              attendances: ta.attendances
            })) || []);
          } else {
            setTrainingAttendances(staticTrainingAttendances);
          }

        } else {
          throw new Error('Mode Supabase désactivé');
        }
      } catch (error) {
        console.warn('⚠️ Échec de la connexion Supabase, basculement en mode local:', error.message);
        setConnectionStatus('local');
        setSupabaseMode(false);

        // Utiliser les données statiques
        setStudents(staticStudents);
        setMatches(staticMatches);
        setTrainings(staticTrainings);
        setTrainingAttendances(staticTrainingAttendances);
      }

      setLoading(false);
    };

    initializeData();
  }, []);

  // Fonctions CRUD pour les étudiants
  const addStudent = async () => {
    console.log('🔍 Tentative d\'ajout d\'étudiant:', newPlayer);
    
    if (!newPlayer.firstName || !newPlayer.lastName || !newPlayer.birthDate || !newPlayer.licenseNumber) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (supabaseMode) {
        console.log('📤 Ajout via Supabase...');
        
        const { data, error } = await supabase
          .from('students')
          .insert({
            first_name: newPlayer.firstName,
            last_name: newPlayer.lastName,
            birth_date: newPlayer.birthDate,
            license_number: newPlayer.licenseNumber,
            position: newPlayer.position,
            team: newPlayer.team,
            is_captain: newPlayer.isCaptain,
            last_attendance: 'present'
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Erreur Supabase:', error);
          throw error;
        }

        const addedStudent = {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          birthDate: data.birth_date,
          licenseNumber: data.license_number,
          position: data.position,
          team: data.team,
          isCaptain: data.is_captain,
          lastAttendance: data.last_attendance || 'present'
        };

        setStudents([...students, addedStudent]);
      } else {
        console.log('📱 Ajout en mode local...');
        
        const newId = Math.max(...students.map(s => s.id)) + 1;
        const addedStudent = {
          id: newId,
          firstName: newPlayer.firstName,
          lastName: newPlayer.lastName,
          birthDate: newPlayer.birthDate,
          licenseNumber: newPlayer.licenseNumber,
          position: newPlayer.position,
          team: newPlayer.team,
          isCaptain: newPlayer.isCaptain,
          lastAttendance: 'present'
        };

        setStudents([...students, addedStudent]);
      }

      // Réinitialiser le formulaire
      setNewPlayer({
        firstName: '',
        lastName: '',
        birthDate: '',
        licenseNumber: '',
        position: 'Meneur',
        team: '2',
        isCaptain: false
      });
      
      setShowAddPlayer(false);
      alert('✅ Joueur ajouté avec succès !');
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const updateStudent = async (updatedPlayer) => {
    try {
      if (supabaseMode) {
        const { error } = await supabase
          .from('students')
          .update({
            first_name: updatedPlayer.firstName,
            last_name: updatedPlayer.lastName,
            birth_date: updatedPlayer.birthDate,
            license_number: updatedPlayer.licenseNumber,
            position: updatedPlayer.position,
            team: updatedPlayer.team,
            is_captain: updatedPlayer.isCaptain,
            last_attendance: updatedPlayer.lastAttendance
          })
          .eq('id', updatedPlayer.id);

        if (error) throw error;
      }

      setStudents(students.map(student => 
        student.id === updatedPlayer.id ? updatedPlayer : student
      ));
      setEditingPlayer(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const deleteStudent = async (playerId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) return;

    try {
      if (supabaseMode) {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', playerId);

        if (error) throw error;
      }

      setStudents(students.filter(student => student.id !== playerId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const changePlayerTeam = async (playerId, newTeam) => {
    const student = students.find(s => s.id === playerId);
    await updateStudent({
      ...student,
      team: newTeam,
      isCaptain: false
    });
  };

  const updateAttendance = async (studentId, newAttendance) => {
    try {
      if (supabaseMode) {
        const { error } = await supabase
          .from('students')
          .update({ last_attendance: newAttendance })
          .eq('id', studentId);

        if (error) throw error;
      }

      setStudents(students.map(s => 
        s.id === studentId ? { ...s, lastAttendance: newAttendance } : s
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des présences:', error);
    }
  };

  // Fonctions CRUD pour les matchs
  const addMatch = async () => {
    console.log('🔍 Tentative d\'ajout de match:', newMatch);
    
    if (!newMatch.opponent || !newMatch.date || !newMatch.time || !newMatch.lieu) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (supabaseMode) {
        console.log('📤 Ajout via Supabase...');
        
        const { data, error } = await supabase
          .from('matches')
          .insert({
            date: newMatch.date,
            time: newMatch.time,
            opponent: newMatch.opponent,
            championship: newMatch.championship,
            team: newMatch.team,
            lieu: newMatch.lieu,
            status: newMatch.status
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Erreur Supabase:', error);
          throw error;
        }

        const addedMatch = {
          id: data.id,
          date: data.date,
          time: data.time,
          opponent: data.opponent,
          championship: data.championship,
          championshipFull: `Championnat ${data.championship}`,
          team: data.team,
          lieu: data.lieu,
          status: data.status,
          tenues: null,
          arbitrage: null,
          tableMarque: null,
          selectedPlayers: []
        };

        setMatches([...matches, addedMatch]);
      } else {
        console.log('📱 Ajout en mode local...');
        
        const newId = Math.max(...matches.map(m => m.id)) + 1;
        const addedMatch = {
          id: newId,
          date: newMatch.date,
          time: newMatch.time,
          opponent: newMatch.opponent,
          championship: newMatch.championship,
          championshipFull: `Championnat ${newMatch.championship}`,
          team: newMatch.team,
          lieu: newMatch.lieu,
          status: newMatch.status,
          tenues: null,
          arbitrage: null,
          tableMarque: null,
          selectedPlayers: []
        };

        setMatches([...matches, addedMatch]);
      }

      // Réinitialiser le formulaire
      setNewMatch({
        date: '',
        time: '',
        opponent: '',
        championship: 'LDV2',
        team: '2',
        lieu: 'Gymnase LDV',
        status: 'upcoming'
      });
      
      setShowAddMatch(false);
      alert('✅ Match ajouté avec succès !');
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const updateMatch = async (updatedMatch) => {
    console.log('🔍 Tentative de modification de match:', updatedMatch);
    
    if (!updatedMatch.opponent || !updatedMatch.date || !updatedMatch.time || !updatedMatch.lieu) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (supabaseMode) {
        console.log('📤 Modification via Supabase...');
        
        const { data, error } = await supabase
          .from('matches')
          .update({
            date: updatedMatch.date,
            time: updatedMatch.time,
            opponent: updatedMatch.opponent,
            championship: updatedMatch.championship,
            team: updatedMatch.team,
            lieu: updatedMatch.lieu,
            status: updatedMatch.status
          })
          .eq('id', updatedMatch.id)
          .select();

        if (error) {
          console.error('❌ Erreur Supabase:', error);
          throw error;
        }
      }

      // Mettre à jour la liste des matchs
      setMatches(matches.map(match => 
        match.id === updatedMatch.id ? {
          ...updatedMatch,
          championshipFull: `Championnat ${updatedMatch.championship}`
        } : match
      ));
      
      setEditingMatch(null);
      setShowEditMatch(false);
      alert('✅ Match modifié avec succès !');
      
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const deleteMatch = async (matchId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce match ?')) return;

    try {
      if (supabaseMode) {
        const { error } = await supabase
          .from('matches')
          .delete()
          .eq('id', matchId);

        if (error) throw error;
      }

      setMatches(matches.filter(match => match.id !== matchId));
      alert('✅ Match supprimé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  // NOUVELLES FONCTIONS CRUD POUR LES ENTRAÎNEMENTS
  const addTraining = async () => {
    console.log('🔍 Tentative d\'ajout d\'entraînement:', newTraining);
    
    if (!newTraining.date || !newTraining.time || !newTraining.theme) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (supabaseMode) {
        console.log('📤 Ajout via Supabase...');
        
        const { data, error } = await supabase
          .from('trainings')
          .insert({
            date: newTraining.date,
            time: newTraining.time,
            type: newTraining.type,
            theme: newTraining.theme,
            lieu: newTraining.lieu,
            team: newTraining.team,
            status: newTraining.status,
            description: newTraining.description
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Erreur Supabase:', error);
          throw error;
        }

        setTrainings([...trainings, data]);
      } else {
        console.log('📱 Ajout en mode local...');
        
        const newId = Math.max(...trainings.map(t => t.id), 0) + 1;
        const addedTraining = {
          id: newId,
          ...newTraining
        };

        setTrainings([...trainings, addedTraining]);
      }

      // Réinitialiser le formulaire
      setNewTraining({
        date: '',
        time: '',
        type: 'entrainement',
        theme: 'Entraînement général',
        lieu: 'Gymnase LDV',
        team: 'all',
        status: 'upcoming',
        description: ''
      });
      
      setShowAddTraining(false);
      alert('✅ Entraînement ajouté avec succès !');
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const updateTraining = async (updatedTraining) => {
    console.log('🔍 Tentative de modification d\'entraînement:', updatedTraining);
    
    if (!updatedTraining.date || !updatedTraining.time || !updatedTraining.theme) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (supabaseMode) {
        console.log('📤 Modification via Supabase...');
        
        const { data, error } = await supabase
          .from('trainings')
          .update({
            date: updatedTraining.date,
            time: updatedTraining.time,
            type: updatedTraining.type,
            theme: updatedTraining.theme,
            lieu: updatedTraining.lieu,
            team: updatedTraining.team,
            status: updatedTraining.status,
            description: updatedTraining.description
          })
          .eq('id', updatedTraining.id)
          .select();

        if (error) {
          console.error('❌ Erreur Supabase:', error);
          throw error;
        }
      }

      // Mettre à jour la liste des entraînements
      setTrainings(trainings.map(training => 
        training.id === updatedTraining.id ? updatedTraining : training
      ));
      
      setEditingTraining(null);
      setShowEditTraining(false);
      alert('✅ Entraînement modifié avec succès !');
      
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const deleteTraining = async (trainingId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet entraînement ?')) return;

    try {
      if (supabaseMode) {
        const { error } = await supabase
          .from('trainings')
          .delete()
          .eq('id', trainingId);

        if (error) throw error;
      }

      setTrainings(trainings.filter(training => training.id !== trainingId));
      alert('✅ Entraînement supprimé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const saveTrainingAttendance = async (trainingId, attendances) => {
    try {
      const attendanceData = {
        trainingId: trainingId,
        date: new Date().toISOString().split('T')[0],
        attendances: students.map(student => ({
          studentId: student.id,
          status: student.lastAttendance
        }))
      };

      if (supabaseMode) {
        // Vérifier si les présences existent déjà
        const { data: existing } = await supabase
          .from('training_attendances')
          .select('id')
          .eq('training_id', trainingId)
          .single();

        if (existing) {
          // Mettre à jour
          const { error } = await supabase
            .from('training_attendances')
            .update({
              attendances: attendanceData.attendances,
              updated_at: new Date().toISOString()
            })
            .eq('training_id', trainingId);

          if (error) throw error;
        } else {
          // Créer nouveau
          const { error } = await supabase
            .from('training_attendances')
            .insert({
              training_id: trainingId,
              date: attendanceData.date,
              attendances: attendanceData.attendances
            });

          if (error) throw error;
        }
      }

      // Mettre à jour localement
      const existingIndex = trainingAttendances.findIndex(ta => ta.trainingId === trainingId);
      if (existingIndex >= 0) {
        const updatedAttendances = [...trainingAttendances];
        updatedAttendances[existingIndex] = attendanceData;
        setTrainingAttendances(updatedAttendances);
      } else {
        setTrainingAttendances([...trainingAttendances, attendanceData]);
      }

      // Marquer l'entraînement comme terminé
      const updatedTraining = trainings.find(t => t.id === trainingId);
      if (updatedTraining && updatedTraining.status === 'upcoming') {
        await updateTraining({ ...updatedTraining, status: 'completed' });
      }

      alert('✅ Présences sauvegardées avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des présences:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  // Fonctions utilitaires pour les matchs
  const updateMatchRole = (matchId, role, playerName) => {
    setMatches(matches.map(match =>
      match.id === matchId ? { ...match, [role]: playerName } : match
    ));
  };

  const togglePlayerSelection = (playerId) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else if (selectedPlayers.length < 10) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const replacePlayer = (matchId, playerIdToRemove) => {
    setMatches(matches.map(match => 
      match.id === matchId 
        ? { ...match, selectedPlayers: match.selectedPlayers.filter(id => id !== playerIdToRemove) }
        : match
    ));
  };

  const addReplacementPlayer = (matchId, newPlayerId) => {
    setMatches(matches.map(match => 
      match.id === matchId && match.selectedPlayers.length < 10
        ? { ...match, selectedPlayers: [...match.selectedPlayers, newPlayerId] }
        : match
    ));
  };

  // Rendu des vues
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Indicateur de statut */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-center gap-2">
          {connectionStatus === 'connected' && (
            <div className="flex items-center gap-2 text-green-600">
              <span>🔥</span>
              <span className="font-semibold">Connecté à Supabase !</span>
              <span className="text-sm opacity-75">Base de données en temps réel active</span>
            </div>
          )}
          {connectionStatus === 'local' && (
            <div className="flex items-center gap-2 text-blue-600">
              <span>📱</span>
              <span className="font-semibold">Mode Local</span>
              <span className="text-sm opacity-75">Données temporaires (non sauvegardées)</span>
            </div>
          )}
          {connectionStatus === 'connecting' && (
            <div className="flex items-center gap-2 text-orange-600">
              <span>🔄</span>
              <span className="font-semibold">Connexion en cours...</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700">Prochain entraînement</h3>
          {(() => {
            const nextTraining = trainings
              .filter(t => t.status === 'upcoming')
              .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
            
            return nextTraining ? (
              <div>
                <p className="text-slate-600">
                  {new Date(nextTraining.date).toLocaleDateString('fr-FR')} - {nextTraining.time}
                </p>
                <p className="text-sm text-slate-500">{nextTraining.theme}</p>
              </div>
            ) : (
              <p className="text-slate-500 italic">Aucun entraînement planifié</p>
            );
          })()}
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700">Prochain match</h3>
          <p className="text-slate-600">Jeudi 7 Août vs Voltaire (LDV2)</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700">Présents dernier entraînement</h3>
          <p className="text-slate-600">{students.filter(s => s.lastAttendance === 'present').length}/{students.length} étudiants</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700">Équipe 2 / Équipe 3</h3>
          <p className="text-slate-600">{students.filter(s => s.team === '2').length} / {students.filter(s => s.team === '3').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Prochains matchs</h3>
          <div className="space-y-3">
            {matches.filter(m => m.status === 'upcoming').slice(0, 3).map(match => (
              <div key={match.id} className={`flex justify-between items-center p-3 border-2 rounded-lg ${
                match.championship === 'LDV2' 
                  ? 'border-green-300 bg-green-50/80' 
                  : 'border-blue-300 bg-blue-50/80'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-slate-800">{match.opponent}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      match.championship === 'LDV2' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      {match.championship}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{new Date(match.date).toLocaleDateString('fr-FR')} - {match.time}</p>
                  <p className="text-xs text-slate-500">{match.lieu}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Prochains entraînements</h3>
          <div className="space-y-3">
            {trainings.filter(t => t.status === 'upcoming').slice(0, 3).map(training => (
              <div key={training.id} className="flex justify-between items-center p-3 border-2 rounded-lg border-blue-300 bg-blue-50/80">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-slate-800">{training.theme}</p>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-blue-600 text-white">
                      Entraînement
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{new Date(training.date).toLocaleDateString('fr-FR')} - {training.time}</p>
                  <p className="text-xs text-slate-500">{training.lieu}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Aperçu des équipes</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">Équipe 2 ({students.filter(s => s.team === '2').length})</h4>
              <div className="space-y-1">
                {students.filter(s => s.team === '2').map(student => (
                  <div key={student.id} className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">{student.firstName} {student.lastName}</span>
                    {student.isCaptain && <span className="text-yellow-600">🏀</span>}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Équipe 3 ({students.filter(s => s.team === '3').length})</h4>
              <div className="space-y-1">
                {students.filter(s => s.team === '3').map(student => (
                  <div key={student.id} className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">{student.firstName} {student.lastName}</span>
                    {student.isCaptain && <span className="text-yellow-600">🏀</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAttendance = () => {
    const presentCount = students.filter(s => s.lastAttendance === 'present').length;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-800">Gestion des présences</h2>
          <div className="flex gap-2">
            <select 
              value={selectedTeam} 
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="border border-slate-300 rounded px-3 py-1 bg-white/80 backdrop-blur-sm"
            >
              <option value="all">Toutes les équipes</option>
              <option value="2">Équipe 2</option>
              <option value="3">Équipe 3</option>
            </select>
            <button 
              onClick={() => setActiveView('stats')}
              className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
            >
              <BarChart3 size={14} />
              Stats
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-slate-800">📋 Liste d'appel - {new Date().toLocaleDateString('fr-FR')}</h3>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">
                {presentCount}/{students.filter(s => selectedTeam === 'all' || s.team === selectedTeam).length} présents
              </div>
              {selectedTraining && userType === 'coach' && (
                <button
                  onClick={() => saveTrainingAttendance(selectedTraining.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                >
                  <Save size={14} />
                  Sauvegarder les présences
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            {students
              .filter(student => selectedTeam === 'all' || student.team === selectedTeam)
              .map(student => (
              <div key={student.id} className="flex items-center justify-between p-2 border border-slate-200 rounded bg-slate-50/50">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-500 w-6 flex-shrink-0">
                    #{student.id}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-800 text-sm truncate">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-xs text-slate-500">
                      Eq.{student.team}{student.isCaptain && ' 🏀'}
                    </div>
                  </div>
                </div>
                
                {userType === 'coach' ? (
                  <div className="flex gap-1">
                    {attendanceStatuses.map(status => (
                      <button
                        key={status.key}
                        onClick={() => updateAttendance(student.id, status.key)}
                        className={`w-6 h-6 rounded text-white text-xs font-bold transition-colors ${
                          student.lastAttendance === status.key 
                            ? status.color 
                            : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                        title={status.label}
                      >
                        {status.code}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${
                    attendanceStatuses.find(s => s.key === student.lastAttendance)?.color
                  }`}>
                    {attendanceStatuses.find(s => s.key === student.lastAttendance)?.code}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-500 bg-slate-100 p-2 rounded">
            <strong>Légende:</strong> P=Présent, A=Absent, AP=Absent Prévenu, B=Blessé, E=Excusé, S=En Stage
          </div>
        </div>
      </div>
    );
  };

  // NOUVEAU COMPOSANT - RENDU DES ENTRAÎNEMENTS
  const renderTrainings = () => {
    const upcomingTrainings = trainings.filter(t => t.status === 'upcoming');
    const pastTrainings = trainings.filter(t => t.status === 'completed').sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-800">Gestion des entraînements</h2>
          {userType === 'coach' && (
            <button
              onClick={() => setShowAddTraining(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              Nouvel entraînement
            </button>
          )}
        </div>

        {/* Prochains entraînements */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            Prochains entraînements ({upcomingTrainings.length})
          </h3>
          
          {upcomingTrainings.length === 0 ? (
            <p className="text-slate-500 italic">Aucun entraînement planifié</p>
          ) : (
            <div className="space-y-3">
              {upcomingTrainings.map(training => (
                <div key={training.id} className="flex justify-between items-center p-4 border border-slate-200 rounded-lg bg-blue-50/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-800">{training.theme}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {training.type === 'entrainement' ? 'Entraînement' : training.type}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p>📅 {new Date(training.date).toLocaleDateString('fr-FR')} à {training.time}</p>
                      <p>📍 {training.lieu}</p>
                      {training.description && <p>💭 {training.description}</p>}
                    </div>
                  </div>
                  
                  {userType === 'coach' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTraining(training);
                          setActiveView('attendance');
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <UserCheck size={14} />
                        Appel
                      </button>
                      <button
                        onClick={() => {
                          setEditingTraining(training);
                          setShowEditTraining(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteTraining(training.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Supprimer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historique des entraînements passés */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
            <BarChart3 size={20} className="text-green-600" />
            Historique des entraînements ({pastTrainings.length})
          </h3>
          
          {pastTrainings.length === 0 ? (
            <p className="text-slate-500 italic">Aucun entraînement terminé</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pastTrainings.map(training => {
                const attendance = trainingAttendances.find(ta => ta.trainingId === training.id);
                const presentCount = attendance ? attendance.attendances.filter(a => a.status === 'present').length : 0;
                const totalStudents = attendance ? attendance.attendances.length : students.length;
                
                return (
                  <div key={training.id} className="flex justify-between items-center p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-slate-800">{training.theme}</h4>
                        <span className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded">Terminé</span>
                        {attendance && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {presentCount}/{totalStudents} présents
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <p>📅 {new Date(training.date).toLocaleDateString('fr-FR')} à {training.time}</p>
                        <p>📍 {training.lieu}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {attendance && (
                        <button
                          onClick={() => {
                            // Afficher le détail des présences
                            const attendanceDetails = attendance.attendances.map(a => {
                              const student = students.find(s => s.id === a.studentId);
                              const statusInfo = attendanceStatuses.find(st => st.key === a.status);
                              return `${student?.firstName} ${student?.lastName}: ${statusInfo?.label}`;
                            }).join('\n');
                            alert(`Présences du ${new Date(training.date).toLocaleDateString('fr-FR')}:\n\n${attendanceDetails}`);
                          }}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-sm"
                        >
                          Voir présences
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMatches = () => {
    const filteredMatches = matches.filter(match => {
      const championshipMatch = selectedChampionship === 'all' || match.championship === selectedChampionship;
      const teamMatch = selectedTeam === 'all' || match.team === selectedTeam;
      const dateMatch = selectedDate === 'all' || 
        (selectedDate === 'current' && match.status === 'upcoming') ||
        (selectedDate === 'past' && match.status === 'completed');
      
      return championshipMatch && teamMatch && dateMatch;
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-800">Gestion des matchs</h2>
          {userType === 'coach' && (
            <button
              onClick={() => setShowAddMatch(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              Nouveau match
            </button>
          )}
        </div>

        {/* Filtres */}
        <div className="flex gap-4">
          <select 
            value={selectedChampionship} 
            onChange={(e) => setSelectedChampionship(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 bg-white/80 backdrop-blur-sm"
          >
            <option value="all">Tous les championnats</option>
            <option value="LDV2">LDV2</option>
            <option value="LDV3">LDV3</option>
            <option value="Cup">Coupe</option>
          </select>
          <select 
            value={selectedTeam} 
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 bg-white/80 backdrop-blur-sm"
          >
            <option value="all">Toutes les équipes</option>
            <option value="2">Équipe 2</option>
            <option value="3">Équipe 3</option>
          </select>
          <select 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 bg-white/80 backdrop-blur-sm"
          >
            <option value="all">Toutes les périodes</option>
            <option value="current">À venir</option>
            <option value="past">Passés</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredMatches.map(match => (
            <div key={match.id} className={`bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border-2 ${
              match.championship === 'LDV2' 
                ? 'border-green-300' 
                : match.championship === 'LDV3'
                ? 'border-blue-300'
                : 'border-purple-300'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-slate-800">vs {match.opponent}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${
                      match.championship === 'LDV2' 
                        ? 'bg-green-600' 
                        : match.championship === 'LDV3'
                        ? 'bg-blue-600'
                        : 'bg-purple-600'
                    }`}>
                      {match.championship}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      match.status === 'upcoming' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {match.status === 'upcoming' ? 'À venir' : 'Terminé'}
                    </span>
                  </div>
                  <div className="text-slate-600 space-y-1">
                    <p className="flex items-center gap-2">
                      <Calendar size={16} />
                      {new Date(match.date).toLocaleDateString('fr-FR')} à {match.time}
                    </p>
                    <p className="flex items-center gap-2">
                      <Trophy size={16} />
                      {match.lieu}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users size={16} />
                      Équipe {match.team}
                    </p>
                  </div>
                </div>
                
                {userType === 'coach' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingMatch(match);
                        setShowEditMatch(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="Modifier"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteMatch(match.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Supprimer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Sélection d'équipe pour le match */}
              {userType === 'coach' && match.status === 'upcoming' && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-slate-700">Composition d'équipe</h4>
                    <button
                      onClick={() => setSelectedMatch(selectedMatch === match.id ? null : match.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      {selectedMatch === match.id ? 'Fermer' : 'Sélectionner joueurs'}
                    </button>
                  </div>
                  
                  {selectedMatch === match.id && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {students
                          .filter(student => student.team === match.team)
                          .map(student => (
                          <div 
                            key={student.id}
                            onClick={() => togglePlayerSelection(student.id)}
                            className={`flex items-center justify-between p-2 border rounded cursor-pointer transition-colors ${
                              selectedPlayers.includes(student.id)
                                ? 'border-green-500 bg-green-50'
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {student.firstName} {student.lastName}
                              </span>
                              <span className="text-xs text-slate-500">
                                {student.position}
                              </span>
                            </div>
                            <div className={`w-4 h-4 rounded border-2 ${
                              selectedPlayers.includes(student.id)
                                ? 'border-green-500 bg-green-500'
                                : 'border-slate-300'
                            }`}>
                              {selectedPlayers.includes(student.id) && (
                                <span className="text-white text-xs flex items-center justify-center">✓</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">
                          {selectedPlayers.length}/10 joueurs sélectionnés
                        </span>
                        <button
                          onClick={() => {
                            // Sauvegarder la sélection
                            setMatches(matches.map(m => 
                              m.id === match.id 
                                ? { ...m, selectedPlayers: [...selectedPlayers] }
                                : m
                            ));
                            setSelectedMatch(null);
                            setSelectedPlayers([]);
                            alert('Sélection sauvegardée !');
                          }}
                          disabled={selectedPlayers.length === 0}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white px-4 py-2 rounded transition-colors"
                        >
                          Sauvegarder sélection
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMatch(null);
                            setSelectedPlayers([]);
                          }}
                          className="bg-slate-400 hover:bg-slate-500 text-white px-4 py-2 rounded transition-colors"
                        >
                          Annuler
                        </button>
                        
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStats = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800">Statistiques de présence et engagement</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-slate-200">
          <h3 className="font-semibold mb-4 text-slate-800">Taux de présence par joueur</h3>
          <div className="space-y-2">
            {students.slice(0, 10).map(student => {
              const attendanceRate = Math.floor(Math.random() * 30) + 70;
              return (
                <div key={student.id} className="flex justify-between items-center">
                  <span className="text-sm text-slate-700">{student.firstName} {student.lastName}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${attendanceRate > 85 ? 'bg-green-600' : attendanceRate > 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${attendanceRate}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 w-8">{attendanceRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-slate-200">
          <h3 className="font-semibold mb-4 text-slate-800">Statistiques générales</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="text-slate-700">Taux de présence moyen</span>
              <span className="font-semibold text-green-600">82%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="text-slate-700">Total d'entraînements</span>
              <span className="font-semibold text-blue-600">{trainings.filter(t => t.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
              <span className="text-slate-700">Matchs joués</span>
              <span className="font-semibold text-orange-600">{matches.filter(m => m.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
              <span className="text-slate-700">Joueurs actifs</span>
              <span className="font-semibold text-purple-600">{students.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeams = () => {
    const renderTeamSection = (teamNumber, bgColor, borderColor, cardBgColor) => {
      const teamPlayers = students.filter(s => s.team === teamNumber);
      
      return (
        <div className={`bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border-2 ${borderColor}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold text-white px-3 py-1 rounded ${bgColor}`}>
              Équipe {teamNumber} ({teamPlayers.length} joueurs)
            </h3>
          </div>
          
          <div className="space-y-3">
            {teamPlayers.map(student => (
              <div key={student.id} className={`flex justify-between items-center p-3 border rounded ${cardBgColor}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">
                        {student.firstName} {student.lastName}
                      </span>
                      {student.isCaptain && <span className="text-yellow-600">🏀</span>}
                    </div>
                    <div className="text-sm text-slate-600">
                      {student.position} • Licence: {student.licenseNumber}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold ${
                    attendanceStatuses.find(s => s.key === student.lastAttendance)?.color
                  }`}>
                    {attendanceStatuses.find(s => s.key === student.lastAttendance)?.code}
                  </div>
                  
                  {userType === 'coach' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingPlayer(student)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Modifier"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => changePlayerTeam(student.id, teamNumber === '2' ? '3' : '2')}
                        className={`${teamNumber === '2' ? 'text-indigo-600 hover:text-indigo-800' : 'text-green-600 hover:text-green-800'} p-1 text-xs font-bold`}
                        title={`Transférer vers Équipe ${teamNumber === '2' ? '3' : '2'}`}
                      >
                        →{teamNumber === '2' ? '3' : '2'}
                      </button>
                      <button
                        onClick={() => deleteStudent(student.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Supprimer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-800">Gestion des équipes</h2>
          {userType === 'coach' && (
            <button
              onClick={() => setShowAddPlayer(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              Ajouter un joueur
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderTeamSection('2', 'bg-green-600', 'border-green-300', 'bg-green-50/80')}
          {renderTeamSection('3', 'bg-blue-600', 'border-blue-300', 'bg-blue-50/80')}
        </div>
      </div>
    );
  };

  const renderPlayers = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-slate-200">
      <h2 className="text-2xl font-semibold mb-4 text-slate-800">Liste complète des joueurs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium text-green-700 mb-2">Équipe 2 ({students.filter(s => s.team === '2').length} joueurs)</h3>
          <div className="space-y-2">
            {students.filter(s => s.team === '2').map(student => (
              <div key={student.id} className="flex justify-between items-center p-2 border border-slate-200 rounded bg-white/50">
                <div className="flex items-center gap-2">
                  <span className="text-slate-700">{student.firstName} {student.lastName}</span>
                  {student.isCaptain && <span className="text-yellow-600">🏀</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{student.position}</span>
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold ${
                    attendanceStatuses.find(s => s.key === student.lastAttendance)?.color
                  }`}>
                    {attendanceStatuses.find(s => s.key === student.lastAttendance)?.code}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-blue-700 mb-2">Équipe 3 ({students.filter(s => s.team === '3').length} joueurs)</h3>
          <div className="space-y-2">
            {students.filter(s => s.team === '3').map(student => (
              <div key={student.id} className="flex justify-between items-center p-2 border border-slate-200 rounded bg-white/50">
                <div className="flex items-center gap-2">
                  <span className="text-slate-700">{student.firstName} {student.lastName}</span>
                  {student.isCaptain && <span className="text-yellow-600">🏀</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{student.position}</span>
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold ${
                    attendanceStatuses.find(s => s.key === student.lastAttendance)?.color
                  }`}>
                    {attendanceStatuses.find(s => s.key === student.lastAttendance)?.code}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent h-12 w-12 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🏀</span>
              </div>
              <h1 className="text-xl font-bold text-slate-800">Basketball Manager</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                value={userType} 
                onChange={(e) => setUserType(e.target.value)}
                className="border border-slate-300 rounded px-3 py-1 bg-white/80 backdrop-blur-sm text-sm"
              >
                <option value="coach">Coach</option>
                <option value="player">Joueur</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2 overflow-x-auto">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors whitespace-nowrap ${
                activeView === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Settings size={16} />
              Tableau de bord
            </button>
            <button
              onClick={() => setActiveView('attendance')}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors whitespace-nowrap ${
                activeView === 'attendance'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <UserCheck size={16} />
              Présence
            </button>
            <button
              onClick={() => setActiveView('trainings')}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors whitespace-nowrap ${
                activeView === 'trainings'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Calendar size={16} />
              Entraînements
            </button>
            <button
              onClick={() => setActiveView('matches')}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors whitespace-nowrap ${
                activeView === 'matches'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Trophy size={16} />
              Matchs
            </button>
            <button
              onClick={() => setActiveView('teams')}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors whitespace-nowrap ${
                activeView === 'teams'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Users size={16} />
              Équipes
            </button>
            <button
              onClick={() => setActiveView('players')}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors whitespace-nowrap ${
                activeView === 'players'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Users size={16} />
              Joueurs
            </button>
            <button
              onClick={() => setActiveView('stats')}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors whitespace-nowrap ${
                activeView === 'stats'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <BarChart3 size={16} />
              Statistiques
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'attendance' && renderAttendance()}
        {activeView === 'trainings' && renderTrainings()}
        {activeView === 'matches' && renderMatches()}
        {activeView === 'stats' && renderStats()}
        {activeView === 'teams' && renderTeams()}
        {activeView === 'players' && renderPlayers()}
      </div>

      {/* MODALS */}

      {/* Modal d'ajout de joueur */}
      {showAddPlayer && userType === 'coach' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Ajouter un nouveau joueur</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={newPlayer.firstName}
                  onChange={(e) => setNewPlayer({...newPlayer, firstName: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={newPlayer.lastName}
                  onChange={(e) => setNewPlayer({...newPlayer, lastName: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <input
                type="date"
                value={newPlayer.birthDate}
                onChange={(e) => setNewPlayer({...newPlayer, birthDate: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Numéro de licence"
                value={newPlayer.licenseNumber}
                onChange={(e) => setNewPlayer({...newPlayer, licenseNumber: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newPlayer.position}
                  onChange={(e) => setNewPlayer({...newPlayer, position: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                >
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
                <select
                  value={newPlayer.team}
                  onChange={(e) => setNewPlayer({...newPlayer, team: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                >
                  <option value="2">Équipe 2</option>
                  <option value="3">Équipe 3</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newPlayer.isCaptain}
                  onChange={(e) => setNewPlayer({...newPlayer, isCaptain: e.target.checked})}
                />
                <span className="text-sm">Capitaine</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={addStudent}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors flex-1"
                >
                  Ajouter le joueur
                </button>
                <button
                  onClick={() => setShowAddPlayer(false)}
                  className="bg-slate-400 hover:bg-slate-500 text-white px-4 py-2 rounded transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification de joueur */}
      {editingPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Modifier le joueur</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={editingPlayer.firstName}
                  onChange={(e) => setEditingPlayer({...editingPlayer, firstName: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={editingPlayer.lastName}
                  onChange={(e) => setEditingPlayer({...editingPlayer, lastName: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <input
                type="date"
                value={editingPlayer.birthDate}
                onChange={(e) => setEditingPlayer({...editingPlayer, birthDate: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Numéro de licence"
                value={editingPlayer.licenseNumber}
                onChange={(e) => setEditingPlayer({...editingPlayer, licenseNumber: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={editingPlayer.position}
                  onChange={(e) => setEditingPlayer({...editingPlayer, position: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                >
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
                <select
                  value={editingPlayer.team}
                  onChange={(e) => setEditingPlayer({...editingPlayer, team: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                >
                  <option value="2">Équipe 2</option>
                  <option value="3">Équipe 3</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingPlayer.isCaptain}
                  onChange={(e) => setEditingPlayer({...editingPlayer, isCaptain: e.target.checked})}
                />
                <span className="text-sm">Capitaine</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateStudent(editingPlayer)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors flex-1"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={() => setEditingPlayer(null)}
                  className="bg-slate-400 hover:bg-slate-500 text-white px-4 py-2 rounded transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de match */}
      {showAddMatch && userType === 'coach' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Ajouter un nouveau match</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Adversaire"
                value={newMatch.opponent}
                onChange={(e) => setNewMatch({...newMatch, opponent: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={newMatch.date}
                  onChange={(e) => setNewMatch({...newMatch, date: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                />
                <input
                  type="time"
                  value={newMatch.time}
                  onChange={(e) => setNewMatch({...newMatch, time: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <input
                type="text"
                placeholder="Lieu du match"
                value={newMatch.lieu}
                onChange={(e) => setNewMatch({...newMatch, lieu: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newMatch.championship}
                  onChange={(e) => setNewMatch({...newMatch, championship: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                >
                  <option value="LDV2">LDV2</option>
                  <option value="LDV3">LDV3</option>
                  <option value="Cup">Coupe</option>
                </select>
                <select
                  value={newMatch.team}
                  onChange={(e) => setNewMatch({...newMatch, team: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                >
                  <option value="2">Équipe 2</option>
                  <option value="3">Équipe 3</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addMatch}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors flex-1"
                >
                  Ajouter le match
                </button>
                <button
                  onClick={() => setShowAddMatch(false)}
                  className="bg-slate-400 hover:bg-slate-500 text-white px-4 py-2 rounded transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification de match */}
      {showEditMatch && editingMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Modifier le match</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Adversaire"
                value={editingMatch.opponent}
                onChange={(e) => setEditingMatch({...editingMatch, opponent: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={editingMatch.date}
                  onChange={(e) => setEditingMatch({...editingMatch, date: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                />
                <input
                  type="time"
                  value={editingMatch.time}
                  onChange={(e) => setEditingMatch({...editingMatch, time: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <input
                type="text"
                placeholder="Lieu du match"
                value={editingMatch.lieu}
                onChange={(e) => setEditingMatch({...editingMatch, lieu: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={editingMatch.championship}
                  onChange={(e) => setEditingMatch({...editingMatch, championship: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                >
                  <option value="LDV2">LDV2</option>
                  <option value="LDV3">LDV3</option>
                  <option value="Cup">Coupe</option>
                </select>
                <select
                  value={editingMatch.team}
                  onChange={(e) => setEditingMatch({...editingMatch, team: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                >
                  <option value="2">Équipe 2</option>
                  <option value="3">Équipe 3</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateMatch(editingMatch)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors flex-1"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={() => {
                    setShowEditMatch(false);
                    setEditingMatch(null);
                  }}
                  className="bg-slate-400 hover:bg-slate-500 text-white px-4 py-2 rounded transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout d'entraînement */}
      {showAddTraining && userType === 'coach' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Planifier un nouvel entraînement</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Thème de l'entraînement"
                value={newTraining.theme}
                onChange={(e) => setNewTraining({...newTraining, theme: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={newTraining.date}
                  onChange={(e) => setNewTraining({...newTraining, date: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                />
                <input
                  type="time"
                  value={newTraining.time}
                  onChange={(e) => setNewTraining({...newTraining, time: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <input
                type="text"
                placeholder="Lieu"
                value={newTraining.lieu}
                onChange={(e) => setNewTraining({...newTraining, lieu: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <select
                value={newTraining.team}
                onChange={(e) => setNewTraining({...newTraining, team: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2"
              >
                <option value="all">Toutes les équipes</option>
                <option value="2">Équipe 2 uniquement</option>
                <option value="3">Équipe 3 uniquement</option>
              </select>
              <textarea
                placeholder="Description (optionnel)"
                value={newTraining.description}
                onChange={(e) => setNewTraining({...newTraining, description: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2 h-20"
              />
              <div className="flex gap-2">
                <button
                  onClick={addTraining}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors flex-1"
                >
                  Planifier l'entraînement
                </button>
                <button
                  onClick={() => setShowAddTraining(false)}
                  className="bg-slate-400 hover:bg-slate-500 text-white px-4 py-2 rounded transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification d'entraînement */}
      {showEditTraining && editingTraining && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Modifier l'entraînement</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Thème de l'entraînement"
                value={editingTraining.theme}
                onChange={(e) => setEditingTraining({...editingTraining, theme: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={editingTraining.date}
                  onChange={(e) => setEditingTraining({...editingTraining, date: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                />
                <input
                  type="time"
                  value={editingTraining.time}
                  onChange={(e) => setEditingTraining({...editingTraining, time: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <input
                type="text"
                placeholder="Lieu"
                value={editingTraining.lieu}
                onChange={(e) => setEditingTraining({...editingTraining, lieu: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <select
                value={editingTraining.team}
                onChange={(e) => setEditingTraining({...editingTraining, team: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2"
              >
                <option value="all">Toutes les équipes</option>
                <option value="2">Équipe 2 uniquement</option>
                <option value="3">Équipe 3 uniquement</option>
              </select>
              <textarea
                placeholder="Description (optionnel)"
                value={editingTraining.description}
                onChange={(e) => setEditingTraining({...editingTraining, description: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2 h-20"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => updateTraining(editingTraining)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors flex-1"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={() => {
                    setShowEditTraining(false);
                    setEditingTraining(null);
                  }}
                  className="bg-slate-400 hover:bg-slate-500 text-white px-4 py-2 rounded transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasketballApp;
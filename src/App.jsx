import React, { useState, useEffect } from 'react';
import { Calendar, Users, UserCheck, Trophy, Settings, Plus, BarChart3, Edit, Save, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - VÉRIFIEZ CES VALEURS
const supabaseUrl = 'https://ohwqrmbntunspkcoshf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9od3FybWJudHVuc3BrY29zaGYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyMjQ0OTcyNCwiZXhwIjoyMDM4MDI1NzI0fQ.UzExCh-3ggLd6D-2vw6IH8z8m8nVEOqhfK8UwBgirZs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BasketballApp = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [userType, setUserType] = useState('coach');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedChampionship, setSelectedChampionship] = useState('all');
  const [selectedDate, setSelectedDate] = useState('current');

  // États pour les données
  const [students, setStudents] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [supabaseMode, setSupabaseMode] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

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

  const positions = ['Meneur', 'Arrière', 'Ailier', 'Ailier fort', 'Pivot'];

  const attendanceStatuses = [
    { key: 'present', label: 'Présent', color: 'bg-green-600', textColor: 'text-green-600', code: 'P' },
    { key: 'absent', label: 'Absent', color: 'bg-red-600', textColor: 'text-red-600', code: 'A' },
    { key: 'absent-warned', label: 'Absent Prévenu WhatsApp', color: 'bg-orange-500', textColor: 'text-orange-500', code: 'AP' },
    { key: 'injured', label: 'Blessé', color: 'bg-purple-600', textColor: 'text-purple-600', code: 'B' },
    { key: 'excused', label: 'Excusé', color: 'bg-blue-600', textColor: 'text-blue-600', code: 'E' },
    { key: 'stage', label: 'En Stage', color: 'bg-teal-600', textColor: 'text-teal-600', code: 'S' },
  ];

  // Fonction de diagnostic Supabase
  const testSupabaseConnection = async () => {
    try {
      console.log('🔍 Test de connexion Supabase...');
      console.log('URL:', supabaseUrl);
      console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');

      // Test 1: Vérifier si Supabase répond
      const { data: testData, error: testError } = await supabase
        .from('students')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('❌ Erreur lors du test de connexion:', testError);
        setConnectionError(`Erreur Supabase: ${testError.message} (Code: ${testError.code})`);
        return false;
      }

      console.log('✅ Connexion Supabase réussie');
      return true;
    } catch (error) {
      console.error('💥 Erreur générale:', error);
      setConnectionError(`Erreur réseau: ${error.message}`);
      return false;
    }
  };

  // Données statiques de fallback
  const staticStudents = [
    { id: 1, firstName: 'Antoine', lastName: 'Martin', birthDate: '2005-03-15', licenseNumber: 'LDV20001', position: 'Meneur', team: '2', isCaptain: true, lastAttendance: 'present' },
    { id: 2, firstName: 'Marie', lastName: 'Dubois', birthDate: '2006-07-22', licenseNumber: 'LDV20002', position: 'Arrière', team: '2', isCaptain: false, lastAttendance: 'absent-warned' },
    { id: 3, firstName: 'Lucas', lastName: 'Bernard', birthDate: '2005-12-08', licenseNumber: 'LDV20003', position: 'Ailier fort', team: '3', isCaptain: true, lastAttendance: 'present' },
    { id: 4, firstName: 'Emma', lastName: 'Rousseau', birthDate: '2006-04-17', licenseNumber: 'LDV20004', position: 'Pivot', team: '3', isCaptain: false, lastAttendance: 'injured' },
    { id: 5, firstName: 'Thomas', lastName: 'Leroy', birthDate: '2005-09-03', licenseNumber: 'LDV20005', position: 'Ailier', team: '2', isCaptain: false, lastAttendance: 'present' },
    { id: 6, firstName: 'Sarah', lastName: 'Michel', birthDate: '2006-01-25', licenseNumber: 'LDV20006', position: 'Meneur', team: '3', isCaptain: false, lastAttendance: 'excused' },
    { id: 7, firstName: 'Pierre', lastName: 'Durand', birthDate: '2005-11-14', licenseNumber: 'LDV20007', position: 'Arrière', team: '2', isCaptain: false, lastAttendance: 'present' },
    { id: 8, firstName: 'Léa', lastName: 'Moreau', birthDate: '2006-06-09', licenseNumber: 'LDV20008', position: 'Ailier fort', team: '3', isCaptain: false, lastAttendance: 'stage' },
    { id: 9, firstName: 'Jules', lastName: 'Petit', birthDate: '2005-08-27', licenseNumber: 'LDV20009', position: 'Pivot', team: '2', isCaptain: false, lastAttendance: 'absent' },
    { id: 10, firstName: 'Camille', lastName: 'Roux', birthDate: '2006-02-18', licenseNumber: 'LDV20010', position: 'Ailier', team: '3', isCaptain: false, lastAttendance: 'present' },
    { id: 11, firstName: 'Maxime', lastName: 'Garcia', birthDate: '2005-05-11', licenseNumber: 'LDV20011', position: 'Meneur', team: '2', isCaptain: false, lastAttendance: 'present' },
    { id: 12, firstName: 'Chloé', lastName: 'Martinez', birthDate: '2006-10-06', licenseNumber: 'LDV20012', position: 'Arrière', team: '3', isCaptain: false, lastAttendance: 'present' },
    { id: 13, firstName: 'Hugo', lastName: 'Silva', birthDate: '2005-04-30', licenseNumber: 'LDV20013', position: 'Ailier fort', team: '2', isCaptain: false, lastAttendance: 'absent-warned' },
    { id: 14, firstName: 'Manon', lastName: 'Lopez', birthDate: '2006-08-13', licenseNumber: 'LDV20014', position: 'Pivot', team: '3', isCaptain: false, lastAttendance: 'stage' },
    { id: 15, firstName: 'Nathan', lastName: 'Fabre', birthDate: '2005-12-24', licenseNumber: 'LDV20015', position: 'Ailier', team: '2', isCaptain: false, lastAttendance: 'present' }
  ];

  const staticMatches = [
    {
      id: 1,
      date: '2025-08-07',
      time: '18:00',
      opponent: 'Lycée Voltaire',
      championship: 'LDV2',
      championshipFull: 'Championnat LDV2',
      team: '2',
      status: 'upcoming',
      tenues: null,
      arbitrage: null,
      tableMarque: null,
      selectedPlayers: [1, 5, 7, 9, 11]
    },
    {
      id: 2,
      date: '2025-08-08',
      time: '17:00',
      opponent: 'Lycée Henri IV',
      championship: 'LDV3',
      championshipFull: 'Championnat LDV3',
      team: '3',
      status: 'upcoming',
      tenues: null,
      arbitrage: null,
      tableMarque: null,
      selectedPlayers: [3, 4, 6, 8, 10]
    },
    {
      id: 3,
      date: '2025-08-14',
      time: '19:30',
      opponent: 'Collège Pasteur',
      championship: 'LDV2',
      championshipFull: 'Championnat LDV2',
      team: '2',
      status: 'upcoming',
      tenues: null,
      arbitrage: null,
      tableMarque: null,
      selectedPlayers: []
    },
    {
      id: 4,
      date: '2025-08-15',
      time: '20:00',
      opponent: 'Université Sorbonne',
      championship: 'LDV3',
      championshipFull: 'Championnat LDV3',
      team: '3',
      status: 'upcoming',
      tenues: null,
      arbitrage: null,
      tableMarque: null,
      selectedPlayers: []
    }
  ];

  // Fonction pour forcer le mode Supabase
  const forceSupabaseMode = async () => {
    console.log('🔄 Force le mode Supabase...');
    setLoading(true);
    setConnectionStatus('connecting');
    setConnectionError(null);
    
    const isConnected = await testSupabaseConnection();
    
    if (isConnected) {
      // Essayer de charger les données réelles
      try {
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .order('last_name', { ascending: true });

        if (studentsError) throw studentsError;

        const transformedStudents = studentsData.map(student => ({
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          birthDate: student.birth_date,
          licenseNumber: student.license_number,
          position: student.position,
          team: student.team,
          isCaptain: student.is_captain,
          lastAttendance: student.last_attendance || 'present'
        }));

        setStudents(transformedStudents);

        // Charger les matchs
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .order('date', { ascending: true });

        if (matchesError) throw matchesError;

        const transformedMatches = matchesData.map(match => ({
          id: match.id,
          date: match.date,
          time: match.time,
          opponent: match.opponent,
          championship: match.championship,
          championshipFull: `Championnat ${match.championship}`,
          team: match.team,
          status: match.status,
          tenues: null,
          arbitrage: null,
          tableMarque: null,
          selectedPlayers: []
        }));

        setMatches(transformedMatches);
        setConnectionStatus('connected');
        setSupabaseMode(true);
        console.log('✅ Mode Supabase activé avec succès !');
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        setConnectionError(`Erreur de chargement: ${error.message}`);
        setConnectionStatus('error');
      }
    } else {
      setConnectionStatus('error');
    }
    
    setLoading(false);
  };

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setConnectionStatus('connecting');
        setConnectionError(null);

        // Test de connexion avec diagnostic détaillé
        const isConnected = await testSupabaseConnection();

        if (isConnected) {
          console.log('🎉 Tentative de chargement des données Supabase...');
          
          // Charger les étudiants depuis Supabase
          const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .order('last_name', { ascending: true });

          if (studentsError) {
            console.error('❌ Erreur students:', studentsError);
            throw studentsError;
          }

          const transformedStudents = studentsData.map(student => ({
            id: student.id,
            firstName: student.first_name,
            lastName: student.last_name,
            birthDate: student.birth_date,
            licenseNumber: student.license_number,
            position: student.position,
            team: student.team,
            isCaptain: student.is_captain,
            lastAttendance: student.last_attendance || 'present'
          }));

          setStudents(transformedStudents);

          // Charger les matchs depuis Supabase
          const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select('*')
            .order('date', { ascending: true });

          if (matchesError) {
            console.error('❌ Erreur matches:', matchesError);
            throw matchesError;
          }

          const transformedMatches = matchesData.map(match => ({
            id: match.id,
            date: match.date,
            time: match.time,
            opponent: match.opponent,
            championship: match.championship,
            championshipFull: `Championnat ${match.championship}`,
            team: match.team,
            status: match.status,
            tenues: null,
            arbitrage: null,
            tableMarque: null,
            selectedPlayers: []
          }));

          setMatches(transformedMatches);
          setConnectionStatus('connected');
          setSupabaseMode(true);
          console.log('🎉 Données Supabase chargées avec succès !');

        } else {
          throw new Error('Connexion Supabase impossible');
        }

      } catch (error) {
        console.log('⚠️ Passage en mode local:', error.message);
        setStudents(staticStudents);
        setMatches(staticMatches);
        setConnectionStatus('local');
        setSupabaseMode(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Fonctions CRUD (mises à jour pour les logs détaillés)
  const addStudent = async () => {
    console.log('🔍 Tentative d\'ajout de joueur:', newPlayer);
    
    if (!newPlayer.firstName || !newPlayer.lastName || !newPlayer.licenseNumber) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires (Prénom, Nom, Licence)');
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
            birth_date: newPlayer.birthDate || null,
            license_number: newPlayer.licenseNumber,
            position: newPlayer.position,
            team: newPlayer.team,
            is_captain: false,
            last_attendance: 'present'
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Erreur Supabase lors de l\'ajout:', error);
          throw error;
        }

        console.log('✅ Joueur ajouté dans Supabase:', data);

        const newStudent = {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          birthDate: data.birth_date,
          licenseNumber: data.license_number,
          position: data.position,
          team: data.team,
          isCaptain: data.is_captain,
          lastAttendance: data.last_attendance
        };

        setStudents([...students, newStudent]);
      } else {
        console.log('📱 Ajout en mode local...');
        
        const newId = Math.max(...students.map(s => s.id)) + 1;
        const newStudent = {
          id: newId,
          firstName: newPlayer.firstName,
          lastName: newPlayer.lastName,
          birthDate: newPlayer.birthDate,
          licenseNumber: newPlayer.licenseNumber,
          position: newPlayer.position,
          team: newPlayer.team,
          isCaptain: false,
          lastAttendance: 'present'
        };

        setStudents([...students, newStudent]);
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
      console.error('💥 Erreur:', error);
      alert(`Erreur lors de l'ajout: ${error.message}\n\nDétails: ${error.hint || 'Vérifiez la connexion Supabase'}`);
    }
  };

  const updateStudent = async (updatedPlayer) => {
    const originalPlayer = students.find(s => s.id === updatedPlayer.id);
    
    if (originalPlayer.team !== updatedPlayer.team) {
      updatedPlayer.isCaptain = false;
    }
    
    if (updatedPlayer.isCaptain) {
      const currentCaptains = students.filter(s => s.team === updatedPlayer.team && s.isCaptain && s.id !== updatedPlayer.id);
      if (currentCaptains.length >= 2) {
        alert('Il ne peut y avoir que 2 capitaines maximum par équipe');
        return;
      }
    }

    try {
      if (supabaseMode) {
        console.log('📤 Mise à jour via Supabase...');
        
        const { data, error } = await supabase
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
          .eq('id', updatedPlayer.id)
          .select();

        if (error) {
          console.error('❌ Erreur Supabase lors de la mise à jour:', error);
          throw error;
        }

        console.log('✅ Joueur mis à jour dans Supabase');
      }

      setStudents(students.map(student => 
        student.id === updatedPlayer.id ? updatedPlayer : student
      ));
      setEditingPlayer(null);
      
      if (supabaseMode) {
        alert('✅ Joueur mis à jour dans Supabase !');
      }
      
    } catch (error) {
      console.error('💥 Erreur lors de la mise à jour:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const deleteStudent = async (playerId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) return;

    try {
      if (supabaseMode) {
        console.log('📤 Suppression via Supabase...');
        
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', playerId);

        if (error) {
          console.error('❌ Erreur Supabase lors de la suppression:', error);
          throw error;
        }

        console.log('✅ Joueur supprimé de Supabase');
      }

      setStudents(students.filter(student => student.id !== playerId));
      
      if (supabaseMode) {
        alert('✅ Joueur supprimé de Supabase !');
      }
      
    } catch (error) {
      console.error('💥 Erreur lors de la suppression:', error);
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

        if (error) {
          console.error('❌ Erreur Supabase lors de la mise à jour des présences:', error);
          throw error;
        }

        console.log('✅ Présence mise à jour dans Supabase');
      }

      setStudents(students.map(s => 
        s.id === studentId ? { ...s, lastAttendance: newAttendance } : s
      ));
    } catch (error) {
      console.error('💥 Erreur lors de la mise à jour des présences:', error);
    }
  };

  // Fonctions pour les matchs (inchangées)
  const saveMatchSelection = async (matchId) => {
    try {
      setMatches(matches.map(match => 
        match.id === matchId ? { ...match, selectedPlayers } : match
      ));
      setSelectedMatch(null);
      setSelectedPlayers([]);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const assignResponsibility = (matchId, role, playerId) => {
    const playerName = playerId ? students.find(s => s.id === parseInt(playerId))?.firstName + ' ' + students.find(s => s.id === parseInt(playerId))?.lastName : null;
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

  // Rendu des vues (dashboard avec diagnostic amélioré)
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Indicateur de statut avec diagnostic */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            {connectionStatus === 'connected' && (
              <div className="flex items-center gap-2 text-green-600">
                <span>🎉</span>
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
            {connectionStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <span>❌</span>
                <span className="font-semibold">Erreur de connexion</span>
              </div>
            )}
          </div>
          
          {/* Actions de diagnostic */}
          {(connectionStatus === 'local' || connectionStatus === 'error') && (
            <div className="border-t pt-3 space-y-2">
              {connectionError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  <strong>Erreur:</strong> {connectionError}
                </div>
              )}
              <div className="flex gap-2 justify-center">
                <button
                  onClick={forceSupabaseMode}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  🔄 Réessayer Supabase
                </button>
                <button
                  onClick={() => {
                    console.log('🔍 Diagnostic complet Supabase...');
                    console.log('URL:', supabaseUrl);
                    console.log('Key:', supabaseAnonKey);
                    console.log('Students count:', students.length);
                    console.log('Connection status:', connectionStatus);
                    console.log('Error:', connectionError);
                    testSupabaseConnection();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  🔧 Diagnostic
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700">Prochain entraînement</h3>
          <p className="text-slate-600">Lundi 4 Août - 18:00</p>
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
                  <p className="text-sm text-slate-600">{match.date} à {match.time}</p>
                  <p className="text-xs text-blue-600">{match.selectedPlayers.length}/10 joueurs sélectionnés</p>
                </div>
                <button 
                  onClick={() => setActiveView('matches')}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Gérer
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Composition des équipes</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">Équipe 2 ({students.filter(s => s.team === '2').length})</h4>
              <div className="space-y-1">
                {students.filter(s => s.team === '2').slice(0, 5).map(student => (
                  <div key={student.id} className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">{student.firstName} {student.lastName}</span>
                    {student.isCaptain && <span className="text-yellow-600">👑</span>}
                  </div>
                ))}
                {students.filter(s => s.team === '2').length > 5 && (
                  <p className="text-xs text-slate-500">+ {students.filter(s => s.team === '2').length - 5} autres...</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Équipe 3 ({students.filter(s => s.team === '3').length})</h4>
              <div className="space-y-1">
                {students.filter(s => s.team === '3').slice(0, 5).map(student => (
                  <div key={student.id} className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">{student.firstName} {student.lastName}</span>
                    {student.isCaptain && <span className="text-yellow-600">👑</span>}
                  </div>
                ))}
                {students.filter(s => s.team === '3').length > 5 && (
                  <p className="text-xs text-slate-500">+ {students.filter(s => s.team === '3').length - 5} autres...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // [Le reste des fonctions de rendu restent identiques - renderAttendance, renderMatches, etc.]
  // ... (code complet disponible si nécessaire)

  const renderNavigation = () => (
    <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-slate-800">
              🏀 Basketball Team Manager
              {connectionStatus === 'connected' && <span className="text-green-600 text-sm ml-2">✅ Supabase</span>}
              {connectionStatus === 'local' && <span className="text-blue-600 text-sm ml-2">📱 Local</span>}
              {connectionStatus === 'error' && <span className="text-red-600 text-sm ml-2">❌ Erreur</span>}
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  activeView === 'dashboard' ? 'bg-slate-600 text-white' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Trophy size={16} />
                Tableau de bord
              </button>
              {/* Autres boutons de navigation... */}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={userType} 
              onChange={(e) => setUserType(e.target.value)}
              className="border border-slate-300 rounded px-3 py-1 text-sm bg-white/80 backdrop-blur-sm"
            >
              <option value="coach">Vue Coach</option>
              <option value="player">Vue Joueur</option>
            </select>
            <Settings size={20} className="text-slate-600" />
          </div>
        </div>
      </div>
    </nav>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement des données...</p>
          {connectionError && (
            <p className="text-red-600 text-sm mt-2">{connectionError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="text-[15rem] font-bold text-slate-300/30 select-none transform rotate-12">
          LDV
        </div>
      </div>
      
      {renderNavigation()}
      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        {activeView === 'dashboard' && renderDashboard()}
        {/* Autres vues... */}
      </div>
    </div>
  );
};

export default BasketballApp;
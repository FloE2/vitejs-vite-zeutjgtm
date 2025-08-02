import React, { useState, useEffect } from 'react';
import { Calendar, Users, UserCheck, Trophy, Settings, Plus, BarChart3, Edit, Save, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://loamfkojtxothevemetn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYW1ma29qdHhvdGhldmVtZXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzY2MDMsImV4cCI6MjA2OTY1MjYwM30.Zaf2b9c3Y_NHWixIPvmsXLgVxuMCBu-bloWmrs-ULiY';

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

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setConnectionStatus('connecting');

        console.log('🔍 Tentative de connexion à Supabase...');

        // Test de connexion Supabase
        const { data: testData, error: testError } = await supabase
          .from('students')
          .select('*')
          .limit(1);

        if (testError) {
          console.log('⚠️ Supabase non disponible, passage en mode local');
          throw testError;
        }

        console.log('✅ Supabase connecté !');

        // Charger les étudiants depuis Supabase
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

        // Charger les matchs depuis Supabase
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

      } catch (error) {
        console.log('📱 Mode local activé');
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

  // Fonctions CRUD
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
          console.error('❌ Erreur Supabase:', error);
          throw error;
        }

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
      alert(`Erreur: ${error.message}`);
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

  // Fonctions pour les matchs
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

  // Rendu des vues
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Indicateur de statut */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200">
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
            <div className="text-sm text-slate-600">
              {presentCount}/{students.filter(s => selectedTeam === 'all' || s.team === selectedTeam).length} présents
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
                  <select
                    value={student.lastAttendance}
                    onChange={(e) => updateAttendance(student.id, e.target.value)}
                    className={`border rounded px-1 py-1 font-bold text-white text-xs w-12 flex-shrink-0 ${
                      attendanceStatuses.find(s => s.key === student.lastAttendance)?.color || 'bg-gray-400'
                    }`}
                  >
                    {attendanceStatuses.map(status => (
                      <option key={status.key} value={status.key} className="text-black">
                        {status.code}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className={`px-2 py-1 rounded font-bold text-white text-xs flex-shrink-0 ${
                    attendanceStatuses.find(s => s.key === student.lastAttendance)?.color || 'bg-gray-400'
                  }`}>
                    {attendanceStatuses.find(s => s.key === student.lastAttendance)?.code}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200">
            <div className="grid grid-cols-6 gap-3">
              {attendanceStatuses.map(status => {
                const count = students.filter(s => s.lastAttendance === status.key && (selectedTeam === 'all' || s.team === selectedTeam)).length;
                return (
                  <div key={status.key} className="text-center">
                    <div className={`w-8 h-8 rounded-full ${status.color} flex items-center justify-center text-white text-xs font-bold mx-auto mb-1`}>
                      {count}
                    </div>
                    <p className="text-xs font-medium text-slate-700">{status.code}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMatches = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-800">Gestion des matchs</h2>
          <div className="flex gap-2 items-center">
            <select 
              value={selectedChampionship} 
              onChange={(e) => setSelectedChampionship(e.target.value)}
              className="border border-slate-300 rounded px-3 py-1 bg-white/80 backdrop-blur-sm"
            >
              <option value="all">Tous les championnats</option>
              <option value="LDV2">Championnat LDV2</option>
              <option value="LDV3">Championnat LDV3</option>
            </select>
            {userType === 'coach' && (
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors">
                <Plus size={16} />
                Nouveau match
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {matches
            .filter(match => selectedChampionship === 'all' || match.championship === selectedChampionship)
            .map(match => (
            <div key={match.id} className={`bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border-2 ${
              match.championship === 'LDV2' 
                ? 'border-green-300' 
                : 'border-blue-300'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-slate-800">{match.opponent}</h3>
                    <span className={`text-xs font-bold px-3 py-1 rounded ${
                      match.championship === 'LDV2' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      {match.championship}
                    </span>
                  </div>
                  <p className="text-slate-600">{match.date} à {match.time}</p>
                  <p className="text-sm text-blue-600">{match.selectedPlayers.length}/10 joueurs sélectionnés</p>
                </div>
                {userType === 'coach' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        if (selectedMatch === match.id) {
                          setSelectedMatch(null);
                          setSelectedPlayers([]);
                        } else {
                          setSelectedMatch(match.id);
                          setSelectedPlayers([...match.selectedPlayers]);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      {selectedMatch === match.id ? 'Fermer' : 'Sélectionner joueurs'}
                    </button>
                  </div>
                )}
              </div>

              {match.selectedPlayers.length > 0 && (
                <div className={`mb-4 p-3 border-2 rounded-lg ${
                  match.championship === 'LDV2' 
                    ? 'bg-green-50/80 border-green-200' 
                    : 'bg-blue-50/80 border-blue-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    match.championship === 'LDV2' ? 'text-green-800' : 'text-blue-800'
                  }`}>
                    Joueurs sélectionnés pour ce match :
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {match.selectedPlayers.map(playerId => {
                      const player = students.find(s => s.id === playerId);
                      return player ? (
                        <div key={playerId} className="flex items-center gap-2 text-sm bg-white/60 p-2 rounded">
                          <div className="w-4 h-4 rounded flex items-center justify-center bg-green-600 text-white text-xs font-bold">
                            P
                          </div>
                          <span className="text-slate-700">{player.firstName} {player.lastName}</span>
                          <span className="text-xs text-slate-500">(Eq. {player.team})</span>
                          {player.isCaptain && <span className="text-yellow-600">🏀</span>}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {selectedMatch === match.id && userType === 'coach' && (
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-slate-800">Sélection des joueurs ({selectedPlayers.length}/10)</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-green-700 mb-2">Équipe 2</h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {students.filter(s => s.team === '2').map(student => (
                          <label key={student.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded">
                            <input 
                              type="checkbox" 
                              className="rounded" 
                              checked={selectedPlayers.includes(student.id)}
                              onChange={() => togglePlayerSelection(student.id)}
                              disabled={!selectedPlayers.includes(student.id) && selectedPlayers.length >= 10}
                            />
                            <span className="text-slate-700">{student.firstName} {student.lastName}</span>
                            {student.isCaptain && <span className="text-yellow-600">🏀</span>}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">Équipe 3</h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {students.filter(s => s.team === '3').map(student => (
                          <label key={student.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded">
                            <input 
                              type="checkbox" 
                              className="rounded" 
                              checked={selectedPlayers.includes(student.id)}
                              onChange={() => togglePlayerSelection(student.id)}
                              disabled={!selectedPlayers.includes(student.id) && selectedPlayers.length >= 10}
                            />
                            <span className="text-slate-700">{student.firstName} {student.lastName}</span>
                            {student.isCaptain && <span className="text-yellow-600">🏀</span>}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => saveMatchSelection(match.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
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
                        className={`h-2 rounded-full ${attendanceRate > 85 ? 'bg-green-600' : attendanceRate > 70 ? 'bg-orange-500' : 'bg-red-600'}`}
                        style={{width: `${attendanceRate}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-slate-600">{attendanceRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-slate-200">
          <h3 className="font-semibold mb-4 text-slate-800">Capitaines et leadership</h3>
          <div className="space-y-3">
            {students.filter(s => s.isCaptain).map(captain => (
              <div key={captain.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-2xl">🏀</span>
                <div>
                  <p className="font-medium text-slate-800">{captain.firstName} {captain.lastName}</p>
                  <p className="text-sm text-slate-600">Capitaine Équipe {captain.team} - {captain.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeams = () => {
    const getPlayersByPosition = (team) => {
      const teamPlayers = students.filter(s => s.team === team);
      return positions.reduce((acc, position) => {
        acc[position] = teamPlayers.filter(p => p.position === position);
        return acc;
      }, {});
    };

    const renderTeamSection = (teamNumber, teamColor, borderColor, bgColor) => {
      const playersByPosition = getPlayersByPosition(teamNumber);
      const captains = students.filter(s => s.team === teamNumber && s.isCaptain);
      
      return (
        <div className={`bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border-2 ${borderColor}`}>
          <div className={`${teamColor} text-white p-4 rounded-t-lg`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Équipe {teamNumber}</h3>
                <div className="text-sm opacity-90">
                  Championnat LDV{teamNumber} • {students.filter(s => s.team === teamNumber).length} joueurs
                </div>
              </div>
              <div className="text-right">
                {captains.length > 0 && (
                  <div className="text-sm opacity-90">
                    <div className="flex items-center gap-1">
                      <span>🏀</span>
                      <span>Capitaines: {captains.map(c => c.firstName + ' ' + c.lastName).join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            {positions.map(position => {
              const positionPlayers = playersByPosition[position] || [];
              if (positionPlayers.length === 0) return null;
              
              return (
                <div key={position} className={`${bgColor} rounded-lg p-3`}>
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <span>{position}</span>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                      {positionPlayers.length}
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {positionPlayers.map(student => (
                      <div key={student.id} className="bg-white/60 border border-slate-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-semibold text-slate-800">
                                {student.firstName} {student.lastName}
                              </h5>
                              {student.isCaptain && (
                                <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
                                  🏀 Capitaine
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                              <div>
                                <span className="font-medium">Né le:</span> {student.birthDate || 'Non renseigné'}
                              </div>
                              <div>
                                <span className="font-medium">Licence:</span> {student.licenseNumber}
                              </div>
                            </div>
                          </div>
                          {userType === 'coach' && (
                            <div className="flex gap-1 ml-4">
                              <button
                                onClick={() => setEditingPlayer(student)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Modifier"
                              >
                                <Edit size={16} />
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
            })}
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
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={addStudent}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Ajouter
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
        )}

        {/* Modal d'édition de joueur */}
        {editingPlayer && userType === 'coach' && (
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
                  <span className="text-sm">🏀 Capitaine de l'équipe</span>
                </label>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => updateStudent(editingPlayer)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
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
        )}
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

  const renderNavigation = () => (
    <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-slate-800">
              🏀 Basketball Team Manager
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
              <button
                onClick={() => setActiveView('attendance')}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  activeView === 'attendance' ? 'bg-slate-600 text-white' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <UserCheck size={16} />
                Présences
              </button>
              <button
                onClick={() => setActiveView('matches')}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  activeView === 'matches' ? 'bg-slate-600 text-white' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Calendar size={16} />
                Matchs
              </button>
              <button
                onClick={() => setActiveView('stats')}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  activeView === 'stats' ? 'bg-slate-600 text-white' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <BarChart3 size={16} />
                Statistiques
              </button>
              <button
                onClick={() => setActiveView('teams')}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  activeView === 'teams' ? 'bg-slate-600 text-white' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Users size={16} />
                Équipes
              </button>
              <button
                onClick={() => setActiveView('players')}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  activeView === 'players' ? 'bg-slate-600 text-white' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Users size={16} />
                Joueurs
              </button>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 relative">
      {/* Filigrane LDV */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="text-[15rem] font-bold text-slate-300/30 select-none transform rotate-12">
          LDV
        </div>
      </div>
      
      {renderNavigation()}
      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'attendance' && renderAttendance()}
        {activeView === 'matches' && renderMatches()}
        {activeView === 'stats' && renderStats()}
        {activeView === 'teams' && renderTeams()}
        {activeView === 'players' && renderPlayers()}
      </div>
    </div>
  );
};

export default BasketballApp;
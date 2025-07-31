import React, { useState, useEffect } from 'react';
import { Calendar, Users, UserCheck, Trophy, Settings, Plus, BarChart3, Edit, Save, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://ohwgrmbntunspkchoshf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9od2dybWJudHVuc3BrY2hvc2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4Nzk5MzMsImV4cCI6MjA2OTQ1NTkzM30.QtoUH9K8KfFz4osDtmWcO5dNAeMZxIU8sZDo0bnH7ys';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BasketballApp = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [userType, setUserType] = useState('coach');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedChampionship, setSelectedChampionship] = useState('all');
  const [selectedDate, setSelectedDate] = useState('current');

  // États pour les données Supabase
  const [students, setStudents] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Services Supabase intégrés
  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Chargement des étudiants depuis Supabase...');
      
      const { data, error: supabaseError } = await supabase
        .from('students')
        .select('*')
        .order('last_name', { ascending: true });
      
      if (supabaseError) {
        console.error('❌ Erreur Supabase:', supabaseError);
        throw supabaseError;
      }
      
      console.log('✅ Données Supabase chargées:', data);
      
      // Transformer les données
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
      }));
      
      setStudents(transformedData);
      console.log(`✅ ${transformedData.length} étudiants chargés depuis Supabase`);
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur lors du chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      console.log('🔍 Chargement des matchs depuis Supabase...');
      
      const { data, error: supabaseError } = await supabase
        .from('matches')
        .select(`
          *,
          match_selections (
            student_id
          )
        `)
        .order('date', { ascending: true });
      
      if (supabaseError) {
        console.error('❌ Erreur matchs Supabase:', supabaseError);
        return;
      }
      
      const transformedMatches = data.map(match => ({
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
        selectedPlayers: match.match_selections?.map(sel => sel.student_id) || []
      }));
      
      setMatches(transformedMatches);
      console.log(`✅ ${transformedMatches.length} matchs chargés depuis Supabase`);
    } catch (err) {
      console.error('❌ Erreur chargement matchs:', err);
    }
  };

  // Chargement initial
  useEffect(() => {
    console.log('🚀 Initialisation de l\'application avec Supabase');
    loadStudents();
    loadMatches();
  }, []);

  // Fonctions CRUD avec Supabase
  const handleAddStudent = async () => {
    if (!newPlayer.firstName || !newPlayer.lastName || !newPlayer.licenseNumber) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      console.log('💾 Ajout d\'un nouveau joueur dans Supabase:', newPlayer);
      
      const { data, error: supabaseError } = await supabase
        .from('students')
        .insert([{
          first_name: newPlayer.firstName,
          last_name: newPlayer.lastName,
          birth_date: newPlayer.birthDate,
          license_number: newPlayer.licenseNumber,
          position: newPlayer.position,
          team: newPlayer.team,
          is_captain: newPlayer.isCaptain,
          last_attendance: 'present'
        }])
        .select();

      if (supabaseError) {
        console.error('❌ Erreur ajout Supabase:', supabaseError);
        throw supabaseError;
      }

      console.log('✅ Joueur ajouté dans Supabase:', data[0]);

      // Ajouter à l'état local
      const newStudentTransformed = {
        id: data[0].id,
        firstName: data[0].first_name,
        lastName: data[0].last_name,
        birthDate: data[0].birth_date,
        licenseNumber: data[0].license_number,
        position: data[0].position,
        team: data[0].team,
        isCaptain: data[0].is_captain,
        lastAttendance: data[0].last_attendance
      };

      setStudents(prev => [...prev, newStudentTransformed]);
      
      // Reset du formulaire
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
      
      alert('🎉 Joueur ajouté avec succès dans Supabase ! Il restera après un refresh.');
    } catch (err) {
      console.error('❌ Erreur ajout:', err);
      alert('❌ Erreur lors de l\'ajout: ' + err.message);
    }
  };

  const handleUpdateStudent = async (updatedPlayer) => {
    const originalPlayer = students.find(s => s.id === updatedPlayer.id);
    
    if (originalPlayer.team !== updatedPlayer.team) {
      updatedPlayer.isCaptain = false;
    }
    
    if (updatedPlayer.isCaptain) {
      const currentCaptains = students.filter(s => s.team === updatedPlayer.team && s.isCaptain && s.id !== updatedPlayer.id);
      if (currentCaptains.length >= 1) {
        alert('Il ne peut y avoir qu\'1 capitaine par équipe');
        return;
      }
    }

    try {
      console.log('💾 Mise à jour du joueur dans Supabase:', updatedPlayer);
      
      const { data, error: supabaseError } = await supabase
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

      if (supabaseError) throw supabaseError;

      setStudents(prev => prev.map(s => s.id === updatedPlayer.id ? updatedPlayer : s));
      setEditingPlayer(null);
      
      console.log('✅ Joueur modifié avec succès');
      alert('🎉 Joueur modifié avec succès dans Supabase !');
    } catch (err) {
      console.error('❌ Erreur modification:', err);
      alert('❌ Erreur lors de la modification: ' + err.message);
    }
  };

  const handleDeleteStudent = async (playerId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce joueur de Supabase ?')) return;

    try {
      console.log('🗑️ Suppression du joueur de Supabase:', playerId);
      
      const { error: supabaseError } = await supabase
        .from('students')
        .delete()
        .eq('id', playerId);

      if (supabaseError) throw supabaseError;

      setStudents(prev => prev.filter(s => s.id !== playerId));
      
      console.log('✅ Joueur supprimé avec succès');
      alert('🎉 Joueur supprimé avec succès de Supabase !');
    } catch (err) {
      console.error('❌ Erreur suppression:', err);
      alert('❌ Erreur lors de la suppression: ' + err.message);
    }
  };

  const changePlayerTeam = async (playerId, newTeam) => {
    const student = students.find(s => s.id === playerId);
    await handleUpdateStudent({
      ...student,
      team: newTeam,
      isCaptain: false
    });
  };

  const togglePlayerSelection = (playerId) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else if (selectedPlayers.length < 10) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const saveMatchSelection = async (matchId) => {
    try {
      // Pour l'instant, juste mettre à jour l'état local
      // L'intégration complète des matchs sera pour plus tard
      setMatches(matches.map(match => 
        match.id === matchId ? { ...match, selectedPlayers } : match
      ));
      setSelectedMatch(null);
      setSelectedPlayers([]);
      alert('Sélection sauvegardée !');
    } catch (error) {
      console.error('Erreur sauvegarde match:', error);
    }
  };

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">🔗 Connexion à Supabase...</p>
          <p className="text-slate-500 text-sm mt-2">Chargement des données depuis la base</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <p className="text-xl font-bold">❌ Erreur de connexion Supabase</p>
            <div className="mt-3 p-3 bg-red-50 rounded text-sm text-left">
              <p className="font-medium">Détails :</p>
              <p>{error}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setError(null);
              loadStudents();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            🔄 Réessayer la connexion
          </button>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Indicateur de connexion Supabase */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-semibold text-green-800">🎉 Connecté à Supabase !</h3>
          </div>
          <div className="text-sm text-green-600">
            Base de données en temps réel active
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{students.length}</div>
            <div className="text-green-600">Joueurs en base</div>
          </div>
          <div className="text-center p-3 bg-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{students.filter(s => s.team === '2').length}</div>
            <div className="text-blue-600">Équipe 2</div>
          </div>
          <div className="text-center p-3 bg-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">{students.filter(s => s.team === '3').length}</div>
            <div className="text-purple-600">Équipe 3</div>
          </div>
        </div>
      </div>

      {/* Stats générales */}
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
    </div>
  );

  const renderTeams = () => (
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
        {/* Équipe 2 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border-2 border-green-300">
          <div className="bg-green-600 text-white p-4 rounded-t-lg">
            <h3 className="text-xl font-bold">Équipe 2</h3>
            <div className="text-sm opacity-90">
              Championnat LDV2 • {students.filter(s => s.team === '2').length} joueurs
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {students.filter(s => s.team === '2').map(student => (
                <div key={student.id} className="flex justify-between items-center p-3 bg-green-50/80 rounded-lg border border-green-200">
                  <div>
                    <div className="font-medium text-slate-800">
                      {student.firstName} {student.lastName}
                      {student.isCaptain && <span className="text-yellow-600 ml-2">👑</span>}
                    </div>
                    <div className="text-sm text-slate-600">{student.position} • {student.licenseNumber}</div>
                  </div>
                  {userType === 'coach' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingPlayer(student)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => changePlayerTeam(student.id, '3')}
                        className="text-indigo-600 hover:text-indigo-800 p-1 text-xs font-bold"
                        title="Transférer vers Équipe 3"
                      >
                        →3
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
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
          </div>
        </div>

        {/* Équipe 3 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border-2 border-blue-300">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h3 className="text-xl font-bold">Équipe 3</h3>
            <div className="text-sm opacity-90">
              Championnat LDV3 • {students.filter(s => s.team === '3').length} joueurs
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {students.filter(s => s.team === '3').map(student => (
                <div key={student.id} className="flex justify-between items-center p-3 bg-blue-50/80 rounded-lg border border-blue-200">
                  <div>
                    <div className="font-medium text-slate-800">
                      {student.firstName} {student.lastName}
                      {student.isCaptain && <span className="text-yellow-600 ml-2">👑</span>}
                    </div>
                    <div className="text-sm text-slate-600">{student.position} • {student.licenseNumber}</div>
                  </div>
                  {userType === 'coach' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingPlayer(student)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => changePlayerTeam(student.id, '2')}
                        className="text-green-600 hover:text-green-800 p-1 text-xs font-bold"
                        title="Transférer vers Équipe 2"
                      >
                        →2
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
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
          </div>
        </div>
      </div>

      {/* Modal d'ajout de joueur */}
      {showAddPlayer && userType === 'coach' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">➕ Ajouter un nouveau joueur dans Supabase</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Prénom *"
                  value={newPlayer.firstName}
                  onChange={(e) => setNewPlayer({...newPlayer, firstName: e.target.value})}
                  className="border border-slate-300 rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Nom *"
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
                placeholder="Numéro de licence * (ex: LDV20101)"
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
                <span className="text-sm">👑 Capitaine de l'équipe</span>
              </label>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddStudent}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
              >
                💾 Sauvegarder dans Supabase
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

      {/* Modal d'édition */}
      {editingPlayer && userType === 'coach' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">✏️ Modifier le joueur</h3>
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
                <span className="text-sm">👑 Capitaine de l'équipe</span>
              </label>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => handleUpdateStudent(editingPlayer)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                💾 Sauvegarder modifications
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
                  {student.isCaptain && <span className="text-yellow-600">👑</span>}
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
                  {student.isCaptain && <span className="text-yellow-600">👑</span>}
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
              <span className="text-sm font-normal text-green-600 ml-2">✅ Supabase Connected</span>
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
        {activeView === 'teams' && renderTeams()}
        {activeView === 'players' && renderPlayers()}
      </div>
    </div>
  );
};

export default BasketballApp;
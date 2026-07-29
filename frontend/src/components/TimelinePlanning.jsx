import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, 
  BarChart, Bar 
} from 'recharts';

export default function TimelinePlanning() {
  const [selectedProject, setSelectedProject] = useState('ALL');

  // 1. Données de la Courbe d'Avancement (Planned vs Completed)
  const progressData = [
    { semaine: 'Semaine 1', planifie: 10, realise: 8 },
    { semaine: 'Semaine 2', planifie: 25, realise: 22 },
    { semaine: 'Semaine 3', planifie: 45, realise: 40 },
    { semaine: 'Semaine 4', planifie: 70, realise: 65 },
    { semaine: 'Semaine 5', planifie: 90, realise: 82 },
    { semaine: 'Semaine 6', planifie: 100, realise: 95 },
  ];

  // 2. Données Répartition des Statuts (Pie Chart)
  const statusData = [
    { name: 'Terminé', value: 42, color: '#10B981' },     // Vert
    { name: 'En cours', value: 28, color: '#3B82F6' },     // Bleu
    { name: 'À faire', value: 18, color: '#F59E0B' },      // Orange
    { name: 'En retard', value: 12, color: '#EF4444' },    // Rouge
  ];

  // 3. Données Historique de Charge (Charge membres / semaine en Heures)
  const workloadData = [
    { membre: 'Y. Alami', 'PRJ-01': 20, 'PRJ-03': 15, 'Support': 5 },
    { membre: 'S. Chraibi', 'PRJ-01': 25, 'PRJ-02': 15, 'Support': 0 },
    { membre: 'O. Bennani', 'PRJ-02': 30, 'PRJ-04': 10, 'Support': 0 },
    { membre: 'M. Tahiri', 'PRJ-03': 10, 'PRJ-04': 25, 'Support': 5 },
  ];

  // 4. Liste des Jalons Chronologiques (Timeline)
  const milestones = [
    { id: 1, date: '15 Jan 2026', title: 'Lancement du projet Refonte SI', project: 'PRJ-CHU-01', status: 'Terminé' },
    { id: 2, date: '10 Fév 2026', title: 'Migration Base de Données Patients', project: 'PRJ-CHU-02', status: 'Terminé' },
    { id: 3, date: '28 Mar 2026', title: 'Déploiement Sécurité Wifi Bloc Opératoire', project: 'PRJ-CHU-03', status: 'En cours' },
    { id: 4, date: '15 Mai 2026', title: 'Recette Finale Téléphonie IP Urgences', project: 'PRJ-CHU-04', status: 'À faire' },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête avec Sélecteur de projet */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Chronologie & Graphiques de Suivi</h1>
          <p className="text-xs text-slate-500 mt-1">
            Analyse de l'avancement des projets, charge globale de l'équipe et planning des jalons CHU.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600">Filtrer par projet :</label>
          <select 
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tous les projets CHU</option>
            <option value="PRJ-CHU-01">PRJ-CHU-01 - Refonte SI Hospitalier</option>
            <option value="PRJ-CHU-02">PRJ-CHU-02 - Informatisation Dossier Patient</option>
            <option value="PRJ-CHU-03">PRJ-CHU-03 - Sécurisation Wifi Bloc</option>
            <option value="PRJ-CHU-04">PRJ-CHU-04 - Téléphonie IP Urgences</option>
          </select>
        </div>
      </div>

      {/* SECTION GRAPHIQUES (GRIDE 2 COLONNES) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Courbe d'avancement (2 colonnes) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            📈 Courbe d'Avancement global (% de Réalisation)
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="semaine" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="planifie" name="Planifié" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} />
                <Line type="monotone" dataKey="realise" name="Réalisé" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Répartition des statuts (1 colonne) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            🎯 Répartition des Statuts des Tâches
          </h2>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Légende personnalisée */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
            {statusData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span>{item.name}: <strong>{item.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION CHARGE ET JALONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 3. Historique de la Charge par Membre */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            👥 Charge de Travail par Ingénieur / Technicien (Heures/Semaine)
          </h2>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="membre" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="h" />
                <Tooltip />
                <Legend />
                <Bar dataKey="PRJ-01" stackId="a" fill="#3b82f6" />
                <Bar dataKey="PRJ-02" stackId="a" fill="#10b981" />
                <Bar dataKey="PRJ-03" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Support" stackId="a" fill="#64748b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Chronologie des Jalons Clés */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            📅 Calendrier des Jalons Clés
          </h2>
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 my-2">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="relative pl-6">
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white ${
                  milestone.status === 'Terminé' ? 'border-emerald-500 bg-emerald-500' :
                  milestone.status === 'En cours' ? 'border-blue-500' : 'border-slate-300'
                }`}></div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {milestone.date}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    milestone.status === 'Terminé' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    milestone.status === 'En cours' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {milestone.status}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-800 mt-1">{milestone.title}</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{milestone.project}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
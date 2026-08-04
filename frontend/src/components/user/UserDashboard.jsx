import React from 'react';

export default function UserDashboard({ user, onNavigate }) {
  // Données de démonstration du tableau de bord utilisateur
  const stats = {
    myProjectsCount: 3,
    activeTasksCount: 5,
    todayMeetingsCount: 1,
    weeklyLoggedHours: 18,
    weeklyPlannedHours: 31
  };

  const urgentTasks = [
    { id: 'TASK-102', title: 'Mise à jour des patchs de sécurité serveurs Web', project: 'Sécurisation DSI & Logs', priority: 'URGENTE', dueDate: 'Aujourd\'hui' },
    { id: 'TASK-101', title: 'Configuration des VLANs - Bâtiment Chirurgie', project: 'Déploiement Réseau CHU', priority: 'HAUTE', dueDate: 'Demain' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Bannière de bienvenue */}
      <div className="bg-gradient-to-r from-teal-800 to-sky-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-teal-200 text-xs font-semibold uppercase tracking-wider">
              Espace Membre DSI CHU
            </span>
            <h1 className="text-2xl font-bold mt-1">
              Bonjour, {user?.prenom ? `${user.prenom} ${user.nom}` : 'Youssef Alami'} 👋
            </h1>
            <p className="text-teal-100/80 text-xs mt-1">
              {user?.title || 'Ingénieur Réseaux & Systèmes'} — {user?.service || 'Service Infrastructure IT (CHU)'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-[10px] text-teal-200 uppercase font-bold">Charge cette semaine</p>
              <p className="text-sm font-bold">{stats.weeklyPlannedHours}h / 35h (88%)</p>
            </div>
          </div>
        </div>

        {/* Halo décoratif */}
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Cartes d'indicateurs clés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => onNavigate && onNavigate('projects')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-teal-400 transition-all"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mes Projets</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.myProjectsCount}</p>
            <span className="text-[10px] text-teal-600 font-medium">Affectations actives</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-base">
            📁
          </div>
        </div>

        <div 
          onClick={() => onNavigate && onNavigate('tasks')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tâches en cours</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.activeTasksCount}</p>
            <span className="text-[10px] text-amber-600 font-medium">2 prioritaires</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-base">
            ☑️
          </div>
        </div>

        <div 
          onClick={() => onNavigate && onNavigate('meetings')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-sky-400 transition-all"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Réunions aujourd'hui</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.todayMeetingsCount}</p>
            <span className="text-[10px] text-sky-600 font-medium">Prochaine à 10h00</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-base">
            📅
          </div>
        </div>

        <div 
          onClick={() => onNavigate && onNavigate('workload')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Temps saisi</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.weeklyLoggedHours}h</p>
            <span className="text-[10px] text-emerald-600 font-medium">Sur 31h planifiées</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base">
            ⏱️
          </div>
        </div>

      </div>

      {/* Bloc principal élargi (pleine largeur) */}
      <div className="w-full bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Tâches Prioritaires</h2>
            <p className="text-[11px] text-slate-400">À réaliser ou à faire avancer en priorité aujourd'hui.</p>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('tasks')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors flex items-center gap-1"
          >
            <span>Voir tout le Kanban</span>
            <span>➔</span>
          </button>
        </div>

        <div className="space-y-3">
          {urgentTasks.map((task) => (
            <div 
              key={task.id}
              className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-teal-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">{task.id}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                    task.priority === 'URGENTE' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                    {task.priority}
                  </span>
                  <span className="text-[10px] text-slate-500">📁 {task.project}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-800">{task.title}</h3>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 shrink-0">
                <span className="text-[11px] font-medium text-slate-500">⏳ {task.dueDate}</span>
                <button 
                  onClick={() => onNavigate && onNavigate('tasks')}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition-all active:scale-95 shadow-xs"
                >
                  Ouvrir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
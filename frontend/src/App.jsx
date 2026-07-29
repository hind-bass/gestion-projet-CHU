import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import ProfileModal from './components/ProfileModal';
import ProjectManagement from './components/ProjectManagement';
import TeamManagement from './components/TeamManagement';
import TaskManagement from './components/TaskManagement';
import Dashboard from './components/Dashboard';
import AuditLogs from './components/AuditLogs';
import KanbanBoard from './components/KanbanBoard';
import MeetingPlanner from './components/MeetingPlanner';
import TranscriptProcessor from './components/TranscriptProcessor';
import AITaskValidation from './components/AITaskValidation';
import AIAssistantChat from './components/AIAssistantChat';
import TimelinePlanning from './components/TimelinePlanning'; // Import du composant Chronologie / Graphiques

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Gestion de la déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setActiveTab('dashboard'); // Réinitialise l'onglet par défaut pour la prochaine connexion
  };

  // Redirection vers la page de Login si aucun utilisateur n'est connecté
  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <AdminLayout 
      user={currentUser} 
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onOpenProfile={() => setIsProfileOpen(true)}
      onLogout={handleLogout}
    >
      {/* Vues conditionnelles */}
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'kanban' && <KanbanBoard />}
      {activeTab === 'projects' && <ProjectManagement />}
      {activeTab === 'team' && <TeamManagement />}
      {activeTab === 'tasks' && <TaskManagement />}
      {activeTab === 'logs' && <AuditLogs />}

      {/* Prise en charge de la section Chronologie / Planning avec les graphiques de suivi */}
      {(activeTab === 'timeline' || activeTab === 'planning' || activeTab === 'chronologie') && (
        <TimelinePlanning />
      )}
      
      {/* Prise en charge des différentes clés possibles pour l'onglet Chatbot */}
      {(activeTab === 'chat' || activeTab === 'chatbot' || activeTab === 'assistant') && (
        <AIAssistantChat />
      )}

      {activeTab === 'meetings' && (
        <div className="space-y-8">
          <MeetingPlanner />
          <div className="border-t border-slate-200 pt-8">
            <TranscriptProcessor />
          </div>
          <div className="border-t border-slate-200 pt-8">
            <AITaskValidation />
          </div>
        </div>
      )}

      {/* Modal de profil utilisateur / admin */}
      {isProfileOpen && (
        <ProfileModal 
          user={currentUser} 
          onClose={() => setIsProfileOpen(false)}
          onUpdateProfile={(updatedData) => setCurrentUser({ ...currentUser, ...updatedData })}
        />
      )}
    </AdminLayout>
  );
}
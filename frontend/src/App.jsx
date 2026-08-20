import React, { useState } from 'react';

// Contexte d'authentification
import { useAuth } from './context/AuthContext';

// Composants communs
import LoginPage from './components/LoginPage';
import ProfileModal from './components/ProfileModal';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

// Vues d'Administration (Admin)
import Dashboard from './components/Dashboard';
import ProjectManagement from './components/ProjectManagement';
import TeamManagement from './components/TeamManagement';
import TaskManagement from './components/TaskManagement';
import AuditLogs from './components/AuditLogs';
import KanbanBoard from './components/KanbanBoard';
import MeetingPlanner from './components/MeetingPlanner';
import TranscriptProcessor from './components/TranscriptProcessor';
import AITaskValidation from './components/AITaskValidation';
import AIAssistantChat from './components/AIAssistantChat';
import TimelinePlanning from './components/TimelinePlanning';

// Vues Membre de l'équipe (MEMBRE)
import UserDashboard from './components/user/UserDashboard';
import UserProjects from './components/user/UserProjects';
import UserTasks from './components/user/UserTasks';
import UserMeetings from './components/user/UserMeetings';
import UserWorkload from './components/user/UserWorkload';
import UserChatbot from './components/user/UserChatbot';
import UserNotifications from './components/user/UserNotifications';

export default function App() {
  const { user: currentUser, isAdmin, initializing, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // État partagé pour faire circuler les tâches extraites du transcript vers la validation
  const [pendingAITasks, setPendingAITasks] = useState([]);

  const handleLogout = async () => {
    await logout();
    setActiveTab('dashboard');
    setIsProfileOpen(false);
  };

  // Vérification de la session en cours au démarrage
  if (initializing) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-teal-50 via-sky-50 to-emerald-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-teal-800">Vérification de la session…</p>
        </div>
      </div>
    );
  }

  // Redirection vers la page de Login si aucun utilisateur n'est connecté
  if (!currentUser) {
    return <LoginPage onLoggedIn={() => setActiveTab('dashboard')} />;
  }

  // Rendu dynamique des vues Administrateur
  const renderAdminView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'kanban':
        return <KanbanBoard />;
      case 'projects':
        return <ProjectManagement />;
      case 'team':
        return <TeamManagement />;
      case 'tasks':
        return <TaskManagement />;
      case 'logs':
        return <AuditLogs />;
      case 'timeline':
      case 'planning':
      case 'chronologie':
        return <TimelinePlanning />;
      case 'chat':
      case 'chatbot':
      case 'assistant':
        return <AIAssistantChat />;
      case 'meetings':
        return (
          <div className="space-y-8">
            <MeetingPlanner />
            <div className="border-t border-slate-200 pt-8">
              <TranscriptProcessor 
                onSendToValidation={(tasks) => setPendingAITasks(tasks)} 
              />
            </div>
            <div className="border-t border-slate-200 pt-8">
              <AITaskValidation 
                initialTasks={pendingAITasks} 
              />
            </div>
          </div>
        );
      default:
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  // Rendu dynamique des vues Membre de l'équipe
  const renderUserView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <UserDashboard user={currentUser} onNavigate={(tab) => setActiveTab(tab)} />;
      case 'projects':
        return <UserProjects user={currentUser} />;
      case 'tasks':
      case 'kanban':
        return <UserTasks user={currentUser} />;
      case 'meetings':
        return <UserMeetings user={currentUser} />;
      case 'workload':
        return <UserWorkload user={currentUser} onNavigate={(tab) => setActiveTab(tab)} />;
      case 'notifications':
        return <UserNotifications user={currentUser} />;
      case 'chatbot':
      case 'assistant':
      case 'chat':
        return <UserChatbot user={currentUser} />;
      default:
        return <UserDashboard user={currentUser} onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <>
      {isAdmin ? (
        /* ================= ESPACE ADMINISTRATEUR ================= */
        <AdminLayout 
          user={currentUser} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenProfile={() => setIsProfileOpen(true)}
          onLogout={handleLogout}
        >
          {renderAdminView()}
        </AdminLayout>
      ) : (
        /* ================= ESPACE MEMBRE D'ÉQUIPE ================= */
        <UserLayout 
          user={currentUser} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenProfile={() => setIsProfileOpen(true)}
          onLogout={handleLogout}
        >
          {renderUserView()}
        </UserLayout>
      )}

      {/* Modal de profil partagé (Admin et Membre) */}
      {isProfileOpen && (
        <ProfileModal 
          user={currentUser} 
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
}

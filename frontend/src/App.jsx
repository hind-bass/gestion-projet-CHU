import React, { useState, useEffect } from 'react';

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

// Vues Membre de l'équipe (User)
import UserDashboard from './components/user/UserDashboard';
import UserProjects from './components/user/UserProjects';
import UserTasks from './components/user/UserTasks';
import UserMeetings from './components/user/UserMeetings';
import UserWorkload from './components/user/UserWorkload';
import UserChatbot from './components/user/UserChatbot';
import UserNotifications from './components/user/UserNotifications';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // État partagé pour faire circuler les tâches extraites du transcript vers la validation
  const [pendingAITasks, setPendingAITasks] = useState([]);

  // Gestion de la déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // Récupération automatique de la session utilisateur au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Erreur lors de la lecture de la session :", err);
        handleLogout();
      }
    }
  }, []);

  // Redirection vers la page de Login si aucun utilisateur n'est connecté
  if (!currentUser) {
    return (
      <LoginPage 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          setActiveTab('dashboard');
        }} 
      />
    );
  }

  const isAdmin = currentUser.role === 'ADMIN';

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
        return <UserWorkload user={currentUser} />;
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
        /* ================= ESPACE MEMBRE D'ÉQUIPE (USER) ================= */
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
          onUpdateProfile={(updatedData) => {
            const updatedUser = { ...currentUser, ...updatedData };
            setCurrentUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }}
        />
      )}
    </>
  );
}

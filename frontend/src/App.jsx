import React, { useState } from 'react';

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

  // Gestion de la déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // Redirection vers la page de Login si aucun utilisateur n'est connecté
  if (!currentUser) {
    return (
      <LoginPage 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab('dashboard');
        }} 
      />
    );
  }

  // Vérification du rôle de l'utilisateur
  const isAdmin = currentUser.role === 'ADMIN';

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
          {/* TRANSMISSION DE LA NAVIGATION AU DASHBOARD ADMIN */}
          {activeTab === 'dashboard' && (
            <Dashboard onNavigate={(tab) => setActiveTab(tab)} />
          )}
          
          {activeTab === 'kanban' && <KanbanBoard />}
          {activeTab === 'projects' && <ProjectManagement />}
          {activeTab === 'team' && <TeamManagement />}
          {activeTab === 'tasks' && <TaskManagement />}
          {activeTab === 'logs' && <AuditLogs />}

          {(activeTab === 'timeline' || activeTab === 'planning' || activeTab === 'chronologie') && (
            <TimelinePlanning />
          )}
          
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
          {activeTab === 'dashboard' && (
            <UserDashboard 
              user={currentUser} 
              onNavigate={(tab) => setActiveTab(tab)} 
            />
          )}

          {activeTab === 'projects' && <UserProjects user={currentUser} />}
          {(activeTab === 'tasks' || activeTab === 'kanban') && <UserTasks user={currentUser} />}
          {activeTab === 'meetings' && <UserMeetings user={currentUser} />}
          {activeTab === 'workload' && <UserWorkload user={currentUser} />}
          {activeTab === 'notifications' && <UserNotifications user={currentUser} />}

          {(activeTab === 'chatbot' || activeTab === 'assistant' || activeTab === 'chat') && (
            <UserChatbot user={currentUser} />
          )}
        </UserLayout>
      )}

      {/* Modal de profil partagé (Admin et Membre) */}
      {isProfileOpen && (
        <ProfileModal 
          user={currentUser} 
          onClose={() => setIsProfileOpen(false)}
          onUpdateProfile={(updatedData) => setCurrentUser({ ...currentUser, ...updatedData })}
        />
      )}
    </>
  );
}

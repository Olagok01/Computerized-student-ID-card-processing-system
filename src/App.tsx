import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import StudentRegistration from './components/StudentRegistration';
import StudentList from './components/StudentList';
import StudentSearch from './components/StudentSearch';
import BatchCardGenerator from './components/BatchCardGenerator';
import Settings from './components/Settings';
import IDCardGenerator from './components/IDCardGenerator';
import { Student } from './types/student';
import { supabase } from './lib/supabase';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if Supabase is configured
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const { error } = await supabase.from('students').select('count').limit(1);
        if (error && error.code === 'PGRST301') {
          console.log('Students table does not exist yet - needs database setup');
        }
      } catch (error) {
        console.log('Supabase connection check:', error);
      }
    };

    checkSupabaseConnection();
  }, []);

  const handleRegistrationSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setActiveTab('dashboard');
  };

  const handleViewCard = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleEditStudent = (student: Student) => {
    // In a full implementation, this would open an edit modal
    console.log('Edit student:', student);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'register':
        return <StudentRegistration onSuccess={handleRegistrationSuccess} />;
      case 'search':
        return (
          <StudentList 
            onViewCard={handleViewCard}
            onEditStudent={handleEditStudent}
          />
        );
      case 'students':
        return <StudentSearch />;
      case 'cards':
        return <BatchCardGenerator />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          <p className="font-medium">Student registered successfully!</p>
        </div>
      )}

      {/* Main Content */}
      <main className="py-8">
        {renderContent()}
      </main>

      {/* ID Card Modal */}
      {selectedStudent && (
        <IDCardGenerator
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

    </div>
  );
}

export default App;
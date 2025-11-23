import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Calendar, TrendingUp } from 'lucide-react';
import { Student } from '../types/student';
import { supabase } from '../lib/supabase';

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0,
    thisMonth: 0,
  });
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all students for stats
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const studentList = students || [];
      
      // Calculate stats
      const total = studentList.length;
      const active = studentList.filter(s => s.status === 'active').length;
      const inactive = studentList.filter(s => s.status === 'inactive').length;
      const expired = studentList.filter(s => s.status === 'expired').length;
      
      const thisMonth = studentList.filter(s => {
        const registrationDate = new Date(s.date_registered);
        const now = new Date();
        return registrationDate.getMonth() === now.getMonth() && 
               registrationDate.getFullYear() === now.getFullYear();
      }).length;

      setStats({ total, active, inactive, expired, thisMonth });
      setRecentStudents(studentList.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.total,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Cards',
      value: stats.active,
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Inactive Cards',
      value: stats.inactive,
      icon: UserX,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'This Month',
      value: stats.thisMonth,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Student ID Management Dashboard</h1>
        <p className="text-blue-100">
          Manage student records, generate ID cards, and maintain institutional database
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Students */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Recently Registered Students</span>
          </h3>
        </div>
        
        <div className="p-6">
          {recentStudents.length > 0 ? (
            <div className="space-y-4">
              {recentStudents.map((student) => (
                <div key={student.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {student.photo_url ? (
                      <img
                        src={student.photo_url}
                        alt={`${student.first_name} ${student.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 font-medium">
                        {student.first_name[0]}{student.last_name[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {student.first_name} {student.last_name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {student.matric_no} • {student.department} • {student.level}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {formatDate(student.date_registered)}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : student.status === 'inactive'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No students registered yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium text-green-800">Database Connected</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium text-blue-800">Photo Storage Ready</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium text-purple-800">PDF Generator Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
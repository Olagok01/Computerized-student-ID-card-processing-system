import React, { useState, useEffect } from 'react';
import { CreditCard, Download, CheckSquare, Square } from 'lucide-react';
import { Student, DEPARTMENTS, LEVELS } from '../types/student';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export default function BatchCardGenerator() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    level: '',
    status: 'active',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    if (filters.department && student.department !== filters.department) return false;
    if (filters.level && student.level !== filters.level) return false;
    if (filters.status && student.status !== filters.status) return false;
    return true;
  });

  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const toggleAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const generateQRCode = async (data: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'M',
        width: 60,
        margin: 1,
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  const generateBatchPDF = async () => {
    if (selectedStudents.size === 0) {
      alert('Please select at least one student');
      return;
    }

    setGenerating(true);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const studentsToGenerate = filteredStudents.filter(s => selectedStudents.has(s.id));
      const cardsPerPage = 4; // 2x2 grid
      const cardWidth = 85.6;
      const cardHeight = 53.98;
      const margin = 10;
      
      for (let i = 0; i < studentsToGenerate.length; i++) {
        const student = studentsToGenerate[i];
        
        if (i > 0 && i % cardsPerPage === 0) {
          pdf.addPage();
        }

        const position = i % cardsPerPage;
        const row = Math.floor(position / 2);
        const col = position % 2;
        
        const x = margin + col * (cardWidth + margin);
        const y = margin + row * (cardHeight + margin * 2);

        // Generate QR code for this student
        const qrData = JSON.stringify({
          id: student.student_id,
          name: `${student.first_name} ${student.last_name}`,
          matric: student.matric_no,
          dept: student.department,
        });
        
        const qrCodeUrl = await generateQRCode(qrData);

        // Card background
        pdf.setFillColor(30, 64, 175); // Blue-700
        pdf.rect(x, y, cardWidth, cardHeight, 'F');

        // White header
        pdf.setFillColor(255, 255, 255);
        pdf.rect(x, y, cardWidth, 15, 'F');

        // Institution name
        pdf.setTextColor(30, 64, 175);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('UNIVERSITY OF EXCELLENCE', x + cardWidth/2, y + 6, { align: 'center' });
        
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'normal');
        pdf.text('STUDENT IDENTIFICATION CARD', x + cardWidth/2, y + 10, { align: 'center' });

        // Student information
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${student.first_name.toUpperCase()} ${student.last_name.toUpperCase()}`, x + 20, y + 22);
        
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`ID: ${student.student_id}`, x + 20, y + 28);
        pdf.text(`Matric: ${student.matric_no}`, x + 20, y + 32);
        pdf.text(`Dept: ${student.department}`, x + 20, y + 36);
        pdf.text(`Level: ${student.level}`, x + 20, y + 40);
        pdf.text(`Expires: ${new Date(student.expiry_date).toLocaleDateString()}`, x + 20, y + 44);

        // Add QR code if generated successfully
        if (qrCodeUrl) {
          try {
            pdf.addImage(qrCodeUrl, 'PNG', x + cardWidth - 18, y + 20, 15, 15);
          } catch (error) {
            console.error('Error adding QR code to PDF:', error);
          }
        }

        // Photo placeholder
        pdf.setFillColor(200, 200, 200);
        pdf.rect(x + 3, y + 18, 14, 18, 'F');
        
        if (!student.photo_url) {
          pdf.setTextColor(100, 100, 100);
          pdf.setFontSize(6);
          pdf.text(`${student.first_name[0]}${student.last_name[0]}`, x + 10, y + 29, { align: 'center' });
        }
      }

      pdf.save(`student_id_cards_batch_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating batch PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <CreditCard className="h-8 w-8" />
              <span>Batch Card Generation</span>
            </h2>
            <button
              onClick={generateBatchPDF}
              disabled={selectedStudents.size === 0 || generating}
              className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>
                {generating 
                  ? 'Generating...' 
                  : `Generate ${selectedStudents.size} Card${selectedStudents.size !== 1 ? 's' : ''}`
                }
              </span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>

            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Levels</option>
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Select All */}
          <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
            <button
              onClick={toggleAll}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              {selectedStudents.size === filteredStudents.length ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span>
                {selectedStudents.size === filteredStudents.length ? 'Deselect All' : 'Select All'}
              </span>
            </button>
            <p className="text-sm text-gray-500">
              {selectedStudents.size} of {filteredStudents.length} students selected
            </p>
          </div>
        </div>

        {/* Student List */}
        <div className="p-6">
          {filteredStudents.length > 0 ? (
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedStudents.has(student.id)
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleStudent(student.id)}
                >
                  <div className="flex-shrink-0">
                    {selectedStudents.has(student.id) ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="w-10 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {student.photo_url ? (
                      <img
                        src={student.photo_url}
                        alt={`${student.first_name} ${student.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-gray-600 text-xs">
                          {student.first_name[0]}{student.last_name[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{student.student_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{student.matric_no}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{student.department}</p>
                      <p className="text-sm text-gray-500">{student.level}</p>
                    </div>
                    <div className="text-right">
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Adjust your filters to see students
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
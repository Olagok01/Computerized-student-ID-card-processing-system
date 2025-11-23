import React, { useRef } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Student } from '../types/student';
import { Download, CreditCard } from 'lucide-react';

interface IDCardGeneratorProps {
  student: Student;
  onClose: () => void;
}

export default function IDCardGenerator({ student, onClose }: IDCardGeneratorProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const generateQRCode = async (data: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'M',
        width: 100,
        margin: 1,
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  const downloadPDF = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 53.98], // Standard credit card size
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
      pdf.save(`${student.first_name}_${student.last_name}_ID_Card.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const qrData = JSON.stringify({
    id: student.student_id,
    name: `${student.first_name} ${student.last_name}`,
    matric: student.matric_no,
    dept: student.department,
  });

  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');

  React.useEffect(() => {
    generateQRCode(qrData).then(setQrCodeUrl);
  }, [qrData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <CreditCard className="h-6 w-6" />
              <span>Student ID Card</span>
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50">
          <div className="flex justify-center">
            {/* ID Card */}
            <div 
              ref={cardRef}
              className="w-[340px] h-[215px] bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200"
              style={{ aspectRatio: '85.6/53.98' }}
            >
              {/* Card Front */}
              <div className="h-full relative bg-gradient-to-br from-blue-700 to-blue-900">
                {/* Header */}
                <div className="bg-white bg-opacity-95 p-3 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <CreditCard className="h-5 w-5 text-blue-700" />
                    <h3 className="text-xs font-bold text-blue-900">UNIVERSITY OF EXCELLENCE</h3>
                  </div>
                  <p className="text-[8px] text-gray-600 font-medium">STUDENT IDENTIFICATION CARD</p>
                </div>

                {/* Main Content */}
                <div className="flex p-3 space-x-3 h-[calc(100%-60px)]">
                  {/* Photo Section */}
                  <div className="w-16 h-20 bg-gray-200 rounded border-2 border-white overflow-hidden flex-shrink-0">
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

                  {/* Student Info */}
                  <div className="flex-1 text-white text-[10px] space-y-1">
                    <div>
                      <p className="font-bold text-[11px] leading-tight">
                        {student.first_name.toUpperCase()} {student.middle_name?.toUpperCase()} {student.last_name.toUpperCase()}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p><span className="font-semibold">ID:</span> {student.student_id}</p>
                      <p><span className="font-semibold">Matric:</span> {student.matric_no}</p>
                      <p><span className="font-semibold">Dept:</span> {student.department}</p>
                      <p><span className="font-semibold">Level:</span> {student.level}</p>
                      <p><span className="font-semibold">Expires:</span> {formatDate(student.expiry_date)}</p>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="w-12 h-12 bg-white p-1 rounded flex-shrink-0">
                    {qrCodeUrl && (
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="w-full h-full"
                      />
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 bg-gold-500 bg-opacity-90 p-1">
                  <p className="text-center text-[7px] text-blue-900 font-semibold">
                    VALID STUDENT IDENTIFICATION • PROPERTY OF UNIVERSITY
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Back Preview */}
          <div className="flex justify-center mt-8">
            <div className="w-[340px] h-[215px] bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
              <div className="h-full relative bg-gradient-to-br from-gray-700 to-gray-900 p-4">
                <div className="bg-white bg-opacity-95 rounded p-3 h-full">
                  <h4 className="text-xs font-bold text-center text-gray-900 mb-3">EMERGENCY INFORMATION</h4>
                  <div className="text-[9px] text-gray-700 space-y-1">
                    <p><span className="font-semibold">Emergency Contact:</span> {student.emergency_contact}</p>
                    <p><span className="font-semibold">Emergency Phone:</span> {student.emergency_phone}</p>
                    {student.blood_group && (
                      <p><span className="font-semibold">Blood Group:</span> {student.blood_group}</p>
                    )}
                    <p><span className="font-semibold">Address:</span> {student.address}</p>
                  </div>
                  
                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <p className="text-[7px] text-gray-600">
                      If found, please return to University Security
                    </p>
                    <p className="text-[7px] text-gray-600 font-semibold">
                      Issued: {formatDate(student.date_registered)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
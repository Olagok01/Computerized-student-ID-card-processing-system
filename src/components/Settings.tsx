import { supabase } from "../lib/supabase";
import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, CaseSensitive as University, Shield, Database } from 'lucide-react';

export default function Settings() {
  const [institutionSettings, setInstitutionSettings] = useState({
    name: 'University of Excellence',
    address: '123 University Avenue, Academic City, AC 12345',
    phone: '+1 (555) 123-4567',
    website: 'www.university.edu',
    logo: '',
  });

  const [cardSettings, setCardSettings] = useState({
    validityYears: 4,
    includeQRCode: true,
    includeBarcode: false,
    cardTemplate: 'standard',
    securityFeatures: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: 'weekly',
    requirePhotoApproval: false,
    enableEmailNotifications: true,
    maxFileSize: 2, // MB
  });

 /*  const handleSave = () => {
    // In a real application, this would save to the database
    alert('Settings saved successfully!');
  }; */

  const handleSave = async () => {
  try {
    const { data, error } = await supabase
      .from("settings")
      .insert([
        {
          institution: institutionSettings,
          card: cardSettings,
          system: systemSettings,
        },
      ]);

    if (error) throw error;

    alert("✅ Settings saved successfully!");
    console.log("Saved settings:", data);
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("❌ Failed to save settings.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <SettingsIcon className="h-8 w-8" />
            <span>System Settings</span>
          </h2>
        </div>

        <div className="p-6 space-y-8">
          {/* Institution Settings */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <University className="h-5 w-5" />
              <span>Institution Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={institutionSettings.name}
                  onChange={(e) => setInstitutionSettings({
                    ...institutionSettings,
                    name: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={institutionSettings.phone}
                  onChange={(e) => setInstitutionSettings({
                    ...institutionSettings,
                    phone: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={institutionSettings.address}
                  onChange={(e) => setInstitutionSettings({
                    ...institutionSettings,
                    address: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="text"
                  value={institutionSettings.website}
                  onChange={(e) => setInstitutionSettings({
                    ...institutionSettings,
                    website: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Card Settings */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>ID Card Settings</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Validity (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={cardSettings.validityYears}
                  onChange={(e) => setCardSettings({
                    ...cardSettings,
                    validityYears: parseInt(e.target.value)
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Template
                </label>
                <select
                  value={cardSettings.cardTemplate}
                  onChange={(e) => setCardSettings({
                    ...cardSettings,
                    cardTemplate: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={cardSettings.includeQRCode}
                    onChange={(e) => setCardSettings({
                      ...cardSettings,
                      includeQRCode: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include QR Code</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={cardSettings.includeBarcode}
                    onChange={(e) => setCardSettings({
                      ...cardSettings,
                      includeBarcode: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include Barcode</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={cardSettings.securityFeatures}
                    onChange={(e) => setCardSettings({
                      ...cardSettings,
                      securityFeatures: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enhanced Security Features</span>
                </label>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>System Configuration</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Frequency
                </label>
                <select
                  value={systemSettings.backupFrequency}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    backupFrequency: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Photo File Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={systemSettings.maxFileSize}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    maxFileSize: parseInt(e.target.value)
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemSettings.autoBackup}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      autoBackup: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Automatic Backups</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemSettings.requirePhotoApproval}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      requirePhotoApproval: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Require Photo Approval</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemSettings.enableEmailNotifications}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      enableEmailNotifications: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Email Notifications</span>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
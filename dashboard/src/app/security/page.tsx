'use client';
import React from 'react';
import { Shield, Lock, ShieldAlert, Key } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-nature-forest neon-text">Security Command</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage global security protocols, encryption keys, and access rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card-base p-8 neon-border">
          <div className="w-12 h-12 bg-nature-light dark:bg-nature-900/20 rounded-xl flex items-center justify-center text-nature-forest mb-6">
            <Lock size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Identity Encryption</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Configure end-to-end encryption for visitor data and biometric hashes.</p>
          <button className="btn-primary w-full">Manage Keys</button>
        </div>

        <div className="card-base p-8 neon-border">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-500 mb-6">
            <ShieldAlert size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Threat Detection</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Monitor suspicious entry patterns and unauthorized check-out attempts.</p>
          <button className="btn-primary bg-red-500 hover:bg-red-600 w-full border-none">View Alerts</button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle2, AlertCircle, RefreshCw, Cpu, Server, ShieldCheck, Database } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useNotification } from '../context/NotificationContext';
import { checkServerStatus, verifyNvidiaKey } from '../services/api';

export default function SettingsModal({ isOpen, onClose }) {
  const { customApiKey, setCustomApiKey, resetToDemoTrip } = useTrip();
  const { showSuccess, showError } = useNotification();

  const [inputKey, setInputKey] = useState('');
  const [serverInfo, setServerInfo] = useState({ online: false, nvidiaKeyConfigured: false });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setInputKey(customApiKey || '');
      setVerificationResult(null);
      checkServerStatus().then(res => {
        setServerInfo(res);
      });
    }
  }, [isOpen, customApiKey]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    setCustomApiKey(inputKey.trim());
    showSuccess('API key preference updated.');
  };

  const handleTestKey = async () => {
    const keyToTest = inputKey.trim() || undefined;
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await verifyNvidiaKey(keyToTest);
      if (res.valid) {
        setVerificationResult({ success: true, message: res.message || 'Key verified!' });
        showSuccess('NVIDIA NIM API key is valid!');
      } else {
        setVerificationResult({ success: false, message: res.error });
        showError(res.error || 'Key verification failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setVerificationResult({ success: false, message: msg });
      showError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all trips back to the default sample Jaipur trip? Your custom trips will be replaced.')) {
      resetToDemoTrip();
      showSuccess('Reset to demo trip successfully.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-elevated border border-charcoal-border">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-charcoal-border/60">
          <div>
            <h3 className="text-lg font-bold text-charcoal">Settings & AI Configuration</h3>
            <p className="text-xs text-charcoal-muted">Manage your NVIDIA NIM credentials & demo data</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-charcoal-muted hover:text-charcoal hover:bg-offwhite transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* System Status Banner */}
          <div className="p-4 rounded-2xl bg-offwhite border border-charcoal-border space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2 text-charcoal">
                <Server className="w-4 h-4 text-forest" />
                <span>Backend Express Server:</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                serverInfo.status === 'online' ? 'bg-mint text-forest' : 'bg-red-100 text-red-700'
              }`}>
                {serverInfo.status === 'online' ? 'Connected (Port 5001)' : 'Offline'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2 text-charcoal">
                <Cpu className="w-4 h-4 text-warmorange" />
                <span>Active AI Model:</span>
              </span>
              <span className="text-[11px] font-mono text-charcoal">
                nvidia/nemotron-3.5-lightning-30b-a3b
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2 text-charcoal">
                <ShieldCheck className="w-4 h-4 text-forest" />
                <span>Backend .env Key Configured:</span>
              </span>
              <span className={`text-[11px] font-bold ${
                serverInfo.nvidiaKeyConfigured ? 'text-forest' : 'text-warmorange-dark'
              }`}>
                {serverInfo.nvidiaKeyConfigured ? 'Yes (Active)' : 'Not in server/.env'}
              </span>
            </div>
          </div>

          {/* NVIDIA API Key Input */}
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-forest" />
                <span>NVIDIA API Key</span>
              </span>
              <a
                href="https://build.nvidia.com"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-forest underline hover:text-forest-hover"
              >
                Get API key from build.nvidia.com
              </a>
            </label>
            <input
              type="password"
              placeholder="nvapi-..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-xs font-mono bg-offwhite/50"
            />
            <p className="text-[11px] text-charcoal-muted mt-1.5">
              You can set <code className="bg-offwhite px-1 py-0.5 rounded">NVIDIA_API_KEY</code> in <code className="bg-offwhite px-1 py-0.5 rounded">server/.env</code> or enter it here for instant usage.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleSaveKey}
                className="px-3.5 py-1.5 rounded-xl bg-forest text-offwhite text-xs font-bold hover:bg-forest-hover transition-colors"
              >
                Save Key
              </button>
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isVerifying}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-charcoal-border text-xs font-bold text-charcoal hover:bg-offwhite transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{isVerifying ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            {verificationResult && (
              <div className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2 ${
                verificationResult.success ? 'bg-mint/40 text-forest border border-mint-dark' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {verificationResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <div>{verificationResult.message}</div>
              </div>
            )}
          </div>

          {/* Reset Demo Data */}
          <div className="pt-4 border-t border-charcoal-border/60">
            <div className="text-xs font-bold text-charcoal mb-1">Local Storage Data</div>
            <p className="text-[11px] text-charcoal-muted mb-2">
              All created trips and expenses persist in your browser LocalStorage.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-warmorange/40 text-warmorange-dark bg-warmorange/10 hover:bg-warmorange/20 text-xs font-bold transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Reset to Sample Jaipur Trip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

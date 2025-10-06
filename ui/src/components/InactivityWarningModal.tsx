import React from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface InactivityWarningModalProps {
  isOpen: boolean;
  remainingTime: string;
  onStaySignedIn: () => void;
  onLogout: () => void;
}

const InactivityWarningModal = ({
  isOpen,
  remainingTime,
  onStaySignedIn,
  onLogout,
}: InactivityWarningModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[9998]" />

      <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          <div
            style={{ backgroundColor: "#77b634" }}
            className="text-white p-4"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Session Timeout Warning</h2>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                Your session is about to expire due to inactivity. You will be
                automatically logged out in:
              </p>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600 font-mono">
                {remainingTime}
              </div>
            </div>

            <p className="text-sm text-gray-600 text-center">
              To remain logged in, please click "Stay Logged In" or continue
              using the application.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onLogout}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-100"
              >
                Log Out
              </button>
              <button
                onClick={onStaySignedIn}
                style={{ backgroundColor: "#77b634" }}
                className="flex-1 text-white py-2 px-4 rounded hover:opacity-90"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InactivityWarningModal;

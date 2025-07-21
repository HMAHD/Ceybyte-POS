/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                    Main Application Component                                    ║
 * ║                                                                                                  ║
 * ║  Description: Main React component that serves as the entry point for CeybytePOS application.   ║
 * ║               Handles API health checks and displays system status.                             ║
 * ║                                                                                                  ║
 * ║  Author: Ceybyte Development Team                                                                ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { apiClient } from "@/api/client";
import { APP_NAME, COMPANY_NAME } from "@/utils/constants";

function App() {
  const [apiStatus, setApiStatus] = useState<string>("Checking...");
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    // Check API health on component mount
    checkApiHealth();
  }, []);

  async function checkApiHealth() {
    try {
      const response = await apiClient.healthCheck();
      if (response.success && response.data) {
        setApiStatus(`✅ ${response.data.service} - ${response.data.status}`);
      } else {
        setApiStatus("❌ API connection failed");
      }
    } catch (error) {
      setApiStatus("❌ API not available");
    }
  }

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{APP_NAME}</h1>
          <p className="text-gray-600">Sri Lankan Point of Sale System</p>
          <p className="text-sm text-gray-500 mt-2">Powered by {COMPANY_NAME}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">System Status</h3>
            <p className="text-sm text-gray-600">{apiStatus}</p>
            <button
              onClick={checkApiHealth}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Refresh Status
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Test Tauri Integration</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                greet();
              }}
              className="space-y-2"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Greet
              </button>
            </form>
            {greetMsg && (
              <p className="mt-2 text-green-600 font-medium">{greetMsg}</p>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Development setup complete! 🎉
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Ready to build CeybytePOS features
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
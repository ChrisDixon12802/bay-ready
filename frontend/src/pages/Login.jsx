import { useState } from "react";
import { LogIn, ChevronRight, ChevronLeft } from "lucide-react";

export default function Login({ onLogin }) {
  const [step, setStep] = useState(1); // Step 1: Login, Step 2: Shop Info
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("Tech");
  const [shopName, setShopName] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [managerName, setManagerName] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [error, setError] = useState("");

  const availableRoles = (() => {
    try {
      const saved = localStorage.getItem("bayReadyRoles");
      const parsed = saved ? JSON.parse(saved) : [];
      const roleNames = parsed
        .map((role) => role?.name)
        .filter((name) => typeof name === "string" && name.trim().length > 0);

      if (roleNames.length > 0) {
        return roleNames;
      }
    } catch {
      // Fall through to defaults
    }

    return ["Manager", "Tech"];
  })();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    setStep(2);
  };

  const handleShopInfoSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!shopName || !shopLocation || !managerName) {
      setError("Please fill in all required fields");
      return;
    }

    // Get current day of the week
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    const dayOfWeek = daysOfWeek[today.getDay()];

    onLogin({
      email,
      password,
      role: selectedRole,
      shopName,
      shopLocation,
      managerName,
      shopPhone,
      dayOfWeek,
      registeredDate: today.toLocaleDateString(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <LogIn size={32} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Bay Ready
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {step === 1 ? "Sign In to Your Account" : "Tell Us About Your Shop"}
        </p>

        {/* STEP 1: LOGIN */}
        {step === 1 && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              >
                {availableRoles.map((roleName) => (
                  <option key={roleName} value={roleName}>
                    {roleName}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              Continue <ChevronRight size={18} />
            </button>
          </form>
        )}

        {/* STEP 2: SHOP INFO */}
        {step === 2 && (
          <form onSubmit={handleShopInfoSubmit} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Name *
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g., Quick Oil Change"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location/Address *
              </label>
              <input
                type="text"
                value={shopLocation}
                onChange={(e) => setShopLocation(e.target.value)}
                placeholder="e.g., 123 Main St, City, State"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name (Manager) *
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="e.g., John Smith"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Phone (Optional)
              </label>
              <input
                type="tel"
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
                placeholder="e.g., (555) 123-4567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <ChevronLeft size={18} /> Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                Start <ChevronRight size={18} />
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-gray-600 text-xs mt-6">
          Demo: Use any email and password, then fill in your shop details
        </p>
      </div>
    </div>
  );
}

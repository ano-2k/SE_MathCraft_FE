import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { User, Mail, Zap, TrendingUp, Calendar, Camera, Edit2, Save, X, LogOut, Code, Trophy } from 'lucide-react';
import { useNavigate } from "react-router-dom";
const BASE_API = import.meta.env.VITE_BASE_API;

const GameCard = ({ children, className = "" }) => (
  <div className={`bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-pink-200 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(236,72,153,0.3)] ${className}`}>
    {children}
  </div>
);

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(null);
  const [credentials, setCredentials] = useState({ username: '', email: '' });
  const [tempPhotoUrl, setTempPhotoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Function to fetch player profile (for initial load and post-update refresh)
  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in again.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${BASE_API}/api/player-overview/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = res.data;
      const mappedProfile = {
        username: data.username || 'Agent',
        email: data.email || 'agent@secured.net',
        photoUrl: data.photo_url || "https://placehold.co/120x120/F0F0F0/DB2777?text=AG",
        achievements: data.achievements_unlocked || [],
        currentRating: data.overall_score || 0,
        totalPuzzles: data.total_puzzles_solved || 0,
        accuracy: `${data.overall_accuracy || 0}%`,
        joined: data.join_date,
        coins: data.coins || 0,
      };
      setProfile(mappedProfile);
      setTempPhotoUrl(mappedProfile.photoUrl);
      // Set initial editable credentials from the fetched profile
      setCredentials({ username: mappedProfile.username, email: mappedProfile.email });
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array for stability

  // 1. Initial Profile Fetch on Component Mount (Handles refresh issue)
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  // Function to fetch credentials (for entering edit mode)
  const fetchCredentialsForEdit = async () => {
  setEditMode(true); // enter edit mode first

  // Only fetch credentials if you haven't already
  if (!credentials.username && !credentials.email) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${BASE_API}/api/user-credentials/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setCredentials({
        username: res.data.username || profile.username,
        email: res.data.email || profile.email,
      });
      setTempPhotoUrl(res.data.photo_url || profile.photoUrl);
    } catch (err) {
      console.error("Error fetching credentials:", err);
      // fallback: use profile values
      setCredentials({ username: profile.username, email: profile.email });
    }
  }
};


  // 2. Fix for the one-letter typing issue: 
  // The state update function is decoupled from any useEffect that would re-fetch and overwrite the data.
  const handleChange = (e) => {
    const { name, value } = e.target;
    // This is a standard controlled component pattern.
    // It will ONLY update the local state for the input fields.
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // ✅ Store the file object
      const reader = new FileReader();
      reader.onloadend = () => setTempPhotoUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const formData = new FormData();
      formData.append("username", credentials.username);
      formData.append("email", credentials.email);
      
      if (selectedFile) {
        formData.append("photo", selectedFile);
      }

      const res = await axios.patch(`${BASE_API}/api/user-credentials/`, formData, {
        headers: {
          "Authorization": `Token ${token}`,
        },
      });

      // Update the main profile state after successful save
      setProfile(prev => ({
        ...prev,
        username: res.data.username,
        email: res.data.email,
        photoUrl: res.data.photo_url ? `${res.data.photo_url}?${Date.now()}` : prev.photoUrl,
      }));

      setTempPhotoUrl(res.data.photo_url ? `${res.data.photo_url}?${Date.now()}` : tempPhotoUrl);
      setSelectedFile(null);
      setEditMode(false);
      // Re-fetch the full profile data to ensure all related fields are current
      await fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Failed to update credentials.");
    }
  };

  const navigate = useNavigate();
  
  const handleLogout = async () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      await axios.post(`${BASE_API}/api/logout/`, null, {
        headers: { Authorization: `Token ${token}` },
      });
    }
  } catch (err) {
    console.warn("Logout request failed.");
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login-register"); 
  }
};

  const handleCancel = () => {
    // Revert credentials and photo to the last saved profile state
    setCredentials({ username: profile.username, email: profile.email });
    setTempPhotoUrl(profile.photoUrl);
    setSelectedFile(null);
    setEditMode(false);
  };

  const GameButton = ({ children, onClick, icon: Icon, colorClass, className = '' }) => (
    <button onClick={onClick} className={`flex items-center justify-center space-x-2 px-6 py-3 font-black uppercase rounded-xl transition transform duration-200 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-opacity-50 ${colorClass} ${className}`}>
      {Icon && <Icon size={20} />}
      <span>{children}</span>
    </button>
  );

  if (loading) return <div className="flex justify-center items-center min-h-screen text-pink-600 text-lg">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500 text-lg">⚠️ {error}</div>;
  if (!profile) return null;

  const ProfileAvatarCard = () => (
    <GameCard className="h-fit p-8 space-y-8 flex flex-col items-center border-2 bg-gradient-to-br from-white to-pink-50 border-pink-300">
      <div className="relative group w-36 h-36">
        <div className="w-full h-full rounded-full overflow-hidden bg-white border-4 border-pink-600 shadow-xl transition duration-300 group-hover:border-purple-500">
          {/* Use tempPhotoUrl for live updates in edit mode, profile.photoUrl otherwise */}
          <img src={editMode ? tempPhotoUrl : profile.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        {editMode && (
          <div className="absolute inset-0 bg-gray-900/60 rounded-full flex flex-col items-center justify-center cursor-pointer transition duration-300 opacity-100 hover:bg-gray-900/70"
                onClick={() => fileInputRef.current.click()}>
            <Camera size={24} className="text-white drop-shadow-lg mb-1" />
            <span className="text-white text-xs font-bold uppercase tracking-wider text-center">
              {profile.photoUrl.includes('placehold.co') ? 'Upload Photo' : 'Change Photo'}
            </span>
            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
          </div>
        )}
      </div>

      <div className="text-center">
        {/* Username is now correctly fetched/visible on refresh from profile state */}
        <h1 className="text-3xl font-extrabold text-pink-700 tracking-wider mb-1">{profile.username}</h1>
        <div className="mt-4 flex flex-col items-center text-sm text-gray-500">
          {/* Initiated date */}
          <span className="flex items-center space-x-1">
            <Calendar size={16} className="text-purple-500"/>
            <span>Initiated: {profile.joined?.split('-')[0]}</span>
          </span>
        </div>
      </div>

      <div className="w-full space-y-3 pt-4">
        {editMode ? (
          <>
            <GameButton onClick={handleSave} icon={Save} colorClass="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-300/50 focus:ring-green-400" className="w-full">Deploy Changes</GameButton>
            <GameButton onClick={handleCancel} icon={X} colorClass="bg-gray-400 text-gray-800 hover:bg-gray-500 focus:ring-gray-300" className="w-full">Cancel</GameButton>
          </>
        ) : (
          <>
            {/* Call fetchCredentialsForEdit to set editMode to true AND fetch the latest data */}
            <GameButton onClick={fetchCredentialsForEdit} icon={Edit2} colorClass="bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-300/50 focus:ring-pink-500" className="w-full">Modify Credentials</GameButton>
           <GameButton
  onClick={handleLogout}
  icon={LogOut}
  colorClass="bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-300"
  className="w-full"
>
  Logout System
</GameButton>

          </>
        )}
      </div>
    </GameCard>
  );

  const ProfileStatsCard = () => (
    <GameCard className="p-8 space-y-8 bg-gradient-to-br from-white to-pink-50 border-pink-300">
      <h2 className="text-3xl font-black uppercase tracking-widest text-pink-700 border-b-2 border-purple-400/50 pb-3">
        {editMode ? 'AGENT CREDENTIALS' : 'PERFORMANCE METRICS'}
      </h2>

      {editMode ? (
        <form className="space-y-4">
          {/* InputField uses the fixed handleChange */}
          <InputField label="Username" name="username" value={credentials.username} onChange={handleChange} icon={User} type="text" />
          <InputField label="Email" name="email" value={credentials.email} onChange={handleChange} icon={Mail} type="email" />
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
          <StatDisplay icon={Zap} label="Overall Score" value={profile.currentRating.toLocaleString()} color="text-pink-700" />
          <StatDisplay icon={Trophy} label="Achievements Unlocked" value={profile.achievements.join(', ') || 'None'} color="text-purple-700" />
          <StatDisplay icon={TrendingUp} label="Overall Accuracy" value={profile.accuracy} color="text-green-700" />
          <StatDisplay icon={Code} label="Total Missions Cleared" value={profile.totalPuzzles.toLocaleString()} color="text-gray-700" />
          <StatDisplay icon={Calendar} label="System Join Date" value={profile.joined} color="text-gray-700" />
          <StatDisplay icon={Zap} label="Available Coins" value={`${profile.coins}`} color="text-orange-600" />
        </div>
      )}
    </GameCard>
  );

  const StatDisplay = ({ icon: Icon, label, value, color = 'text-gray-900' }) => (
    <div className="flex flex-col border-l-4 border-pink-500 pl-4 py-2 transition duration-300 hover:border-purple-500">
      <div className="flex items-center space-x-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
        <Icon size={16} className="text-purple-500" />
        <span>{label}</span>
      </div>
      <p className={`text-2xl font-black ${color} tracking-wider mt-1`}>{value}</p>
    </div>
  );

  const InputField = ({ label, name, value, onChange, icon: Icon, type }) => (
    <div>
      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-600 uppercase mb-2">
        <Icon size={16} className="text-pink-500" />
        <span>{label}</span>
      </label>
      <input type={type} name={name} value={value} onChange={onChange} className="w-full px-4 py-2 bg-pink-50 text-gray-900 border border-pink-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition duration-200 shadow-inner" required />
    </div>
  );

  return (
    <div className="min-h-screen py-17 px-4 sm:px-8 text-gray-900 font-sans ml-64">
      <header className="py-8 text-center max-w-4xl mx-auto mb-10">
        <h1 className="text-5xl font-extrabold text-pink-700 mb-3 tracking-tight">AGENT DATA RECORD</h1>
        <p className="text-lg font-medium text-gray-600">Your secure connection is established. View and manage your game identity.</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1"><ProfileAvatarCard /></div>
        <div className="lg:col-span-2"><ProfileStatsCard /></div>
      </main>
    </div>
  );
};

export default Profile;
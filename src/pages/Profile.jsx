import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import {
 User,
 Mail,
 Zap,
 TrendingUp,
 Calendar,
 Camera,
 Edit2,
 Save,
 X,
 LogOut,
 Code,
 Trophy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {LuZap} from 'react-icons/lu';

const BASE_API = import.meta.env.VITE_BASE_API;

const GameCard = ({ children, className = "" }) => (
<div
   className={`bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-pink-200 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(236,72,153,0.3)] ${className}`}
>
   {children}
</div>
);
const GameButton = ({ children, onClick, icon: Icon, colorClass, className }) => (
<button
   onClick={onClick}
   className={`flex items-center justify-center space-x-2 px-6 py-3 font-black uppercase rounded-xl transition transform duration-200 hover:scale-[1.03] active:scale-[0.98] ${colorClass} ${className}`}
>
   {Icon && <Icon size={20} />}
<span>{children}</span>
</button>
);
const InputField = React.memo(function InputField({
 label,
 name,
 value,
 onChange,
 icon: Icon,
 type,
}) {
 return (
<div>
<label className="flex items-center space-x-2 text-sm font-semibold text-gray-600 uppercase mb-2">
<Icon size={16} className="text-pink-500" />
<span>{label}</span>
</label>
<input
       type={type}
       name={name}
       value={value}
       onChange={onChange}
       className="w-full px-4 py-2 bg-pink-50 text-gray-900 border border-pink-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition duration-200"
     />
</div>
 );
});
const StatDisplay = ({ icon: Icon, label, value, color }) => (
<div className="flex flex-col border-l-4 border-pink-500 pl-4 py-2">
<div className="flex items-center space-x-2 text-sm font-semibold text-gray-500 uppercase">
<Icon size={16} className="text-purple-500" />
<span>{label}</span>
</div>
<p className={`text-2xl font-black ${color} mt-1`}>{value}</p>
</div>
);

// MAIN PROFILE COMPONENT

export default function Profile() {
 const [editMode, setEditMode] = useState(false);
 const [profile, setProfile] = useState(null);
 const [credentials, setCredentials] = useState({ username: "", email: "" });
 const [tempPhotoUrl, setTempPhotoUrl] = useState("");
 const [selectedFile, setSelectedFile] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const fileInputRef = useRef(null);
 const navigate = useNavigate();

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
     const d = res.data;
     const p = {
       username: d.username || "Agent",
       email: d.email || "agent@secured.net",
       photoUrl:
         d.photo_url ||
         `https://placehold.co/120x120/F0F0F0/DB2777?text=${(d.username || "AG")
           .slice(0, 2)
           .toUpperCase()}`,
       achievements: d.achievements_unlocked || [],
       currentRating: d.overall_score || 0,
       totalPuzzles: d.total_puzzles_solved || 0,
       accuracy: `${d.overall_accuracy || 0}%`,
       joined: d.join_date,
       coins: d.coins || 0,
     };
     setProfile(p);
     setTempPhotoUrl(p.photoUrl);
     setCredentials({ username: p.username, email: p.email });
   } catch (err) {
     setError("Failed to load profile.");
   } finally {
     setLoading(false);
   }
 }, []);
 useEffect(() => {
   fetchProfile();
 }, [fetchProfile]);

 /* ENTER EDIT MODE */

 const fetchCredentialsForEdit = async () => {
   setEditMode(true);
   const token = localStorage.getItem("token");
   try {
     const res = await axios.get(`${BASE_API}/api/user-credentials/`, {
       headers: { Authorization: `Token ${token}` },
     });
     setCredentials({
       username: res.data.username ?? profile.username,
       email: res.data.email ?? profile.email,
     });
     setTempPhotoUrl(res.data.photo_url || profile.photoUrl);
   } catch {
     setCredentials({
       username: profile.username,
       email: profile.email,
     });
   }
 };

 const handleChange = (e) => {
   const { name, value } = e.target;
   setCredentials((prev) => ({ ...prev, [name]: value }));
 };

 const handlePhotoChange = (e) => {
   const file = e.target.files?.[0];
   if (!file) return;
   setSelectedFile(file);
   const reader = new FileReader();
   reader.onloadend = () => setTempPhotoUrl(reader.result);
   reader.readAsDataURL(file);
 };

 const handleSave = async () => {
   const token = localStorage.getItem("token");
   try {
     const fd = new FormData();
     fd.append("username", credentials.username);
     fd.append("email", credentials.email);
     if (selectedFile) fd.append("photo", selectedFile);
     const res = await axios.patch(`${BASE_API}/api/user-credentials/`, fd, {
       headers: { Authorization: `Token ${token}` },
     });
     const newPhoto = res.data.photo_url
       ? `${res.data.photo_url}?${Date.now()}`
       : profile.photoUrl;
     setProfile((p) => ({
       ...p,
       username: res.data.username,
       email: res.data.email,
       photoUrl: newPhoto,
     }));
     setTempPhotoUrl(newPhoto);
     setEditMode(false);
     setSelectedFile(null);
   } catch {
     alert("Failed to update profile.");
   }
 };
 const handleCancel = () => {
   setEditMode(false);
   setCredentials({ username: profile.username, email: profile.email });
   setTempPhotoUrl(profile.photoUrl);
   setSelectedFile(null);
 };

 const handleLogout = async () => {
   try {
     const token = localStorage.getItem("token");
     if (token) {
       await axios.post(`${BASE_API}/api/logout/`, null, {
         headers: { Authorization: `Token ${token}` },
       });
     }
   } catch {}
   finally {
     localStorage.removeItem("token");
     localStorage.removeItem("user");
     navigate("/login-register");
   }
 };
if (loading) {
    return (
      <div 
          className="absolute inset-0 z-50 bg-pink-50 text-pink-700"
      >
        <main 
            className="min-h-screen flex items-center justify-center md:ml-64"
        >
          <div className="text-center">
            <LuZap className="animate-spin text-6xl mb-2 mx-auto" /> 
            <p className="text-lg font-semibold">Loading Profile Data...</p>
          </div>
        </main>
      </div>
    );
  }

 if (error) return <div className="text-center py-20 text-red-500">⚠ {error}</div>;
 if (!profile) return null;

 return (
<div className="min-h-screen py-10 px-4 lg:ml-64 text-gray-900 mt-12">
<header className="text-center mb-10">
<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-pink-700 mb-3 mt-6 tracking-tight">
  Profile Details
</h1>


 <p className="text-xl text-pink-600 font-medium">Manage profile & performance data.</p>
</header>
<main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {/* AVATAR CARD */}
<div className="lg:col-span-1">
<GameCard className="p-8 flex flex-col items-center space-y-6 border-pink-300">
           {/* Avatar */}
<div className="relative group w-36 h-36">
<img
               src={tempPhotoUrl}
               className="w-full h-full rounded-full border-4 border-pink-600 object-cover"
             />
             {editMode && (
<div
                 className="absolute inset-0 bg-black/50 rounded-full flex flex-col justify-center items-center text-white cursor-pointer"
                 onClick={() => fileInputRef.current.click()}
>
<Camera size={24} />
<span className="text-xs mt-1">
                   {profile.photoUrl.includes("placehold.co")
                     ? "Upload"
                     : "Change"}
</span>
<input
                   type="file"
                   className="hidden"
                   accept="image/*"
                   ref={fileInputRef}
                   onChange={handlePhotoChange}
                 />
</div>
             )}
</div>
           {/* Name */}
<h1 className="text-3xl font-bold text-pink-700">
             {profile.username}
</h1>
           {/* Join Date */}
<p className="text-gray-500 flex items-center space-x-1">
<Calendar size={16} />
<span>Joined: {profile.joined}</span>
</p>
           {/* Buttons */}
<div className="w-full space-y-3">
             {editMode ? (
<>
<GameButton
                   onClick={handleSave}
                   icon={Save}
                   colorClass="bg-green-600 text-white"
                   className="w-full"
>
                   Save
</GameButton>
<GameButton
                   onClick={handleCancel}
                   icon={X}
                   colorClass="bg-gray-400 text-black"
                   className="w-full"
>
                   Cancel
</GameButton>
</>
             ) : (
<>
<GameButton
                   onClick={fetchCredentialsForEdit}
                   icon={Edit2}
                   colorClass="bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                   className="w-full"
>
                   Update Profile
</GameButton>
<GameButton
                   onClick={handleLogout}
                   icon={LogOut}
                   colorClass="bg-gray-200 text-gray-700"
                   className="w-full"
>
                   Logout
</GameButton>
</>
             )}
</div>
</GameCard>
</div>
       {/* DETAILS CARD */}
<div className="lg:col-span-2">
<GameCard className="p-8 border-pink-300">
<h2 className="text-3xl font-bold text-pink-700 mb-6">
             {editMode ? "Account Details" : "Performance Metrics"}
</h2>
           {editMode ? (
<div className="space-y-4">
<InputField
                 label="Username"
                 name="username"
                 value={credentials.username}
                 onChange={handleChange}
                 type="text"
                 icon={User}
               />
<InputField
                 label="Email"
                 name="email"
                 value={credentials.email}
                 onChange={handleChange}
                 type="email"
                 icon={Mail}
               />
</div>
           ) : (
<div className="grid sm:grid-cols-2 gap-6">
<StatDisplay
                 icon={Zap}
                 label="Overall Score"
                 value={profile.currentRating}
                 color="text-pink-700"
               />
<StatDisplay
                 icon={Trophy}
                 label="Achievements"
                 value={profile.achievements.join(", ") || "None"}
                 color="text-purple-700"
               />
<StatDisplay
                 icon={TrendingUp}
                 label="Accuracy"
                 value={profile.accuracy}
                 color="text-green-700"
               />
<StatDisplay
                 icon={Code}
                 label="Total Missions"
                 value={profile.totalPuzzles}
                 color="text-gray-700"
               />
<StatDisplay
                 icon={Calendar}
                 label="Join Date"
                 value={profile.joined}
                 color="text-gray-700"
               />
<StatDisplay
                 icon={Zap}
                 label="Coins"
                 value={profile.coins}
                 color="text-orange-600"
               />
</div>
           )}
</GameCard>
</div>
</main>
</div>
 );
}
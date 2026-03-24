import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { PawPrint, MapPin, Calendar, Phone, Upload, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Pet } from "../types";

// Fix for default marker icon in Leaflet with Vite
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }: { position: [number, number] | null; setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export default function ReportPet({ token }: { token: string | null }) {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [matches, setMatches] = useState<Pet[]>([]);
  const [mapPos, setMapPos] = useState<[number, number] | null>(null);

  const [formData, setFormData] = useState({
    petName: "",
    petType: "dog",
    breed: "",
    color: "",
    location: "",
    lat: "",
    lng: "",
    dateTime: new Date().toISOString().slice(0, 16),
    contact: "",
    urgency: "medium",
  });

  useEffect(() => {
    if (mapPos) {
      setFormData(prev => ({
        ...prev,
        lat: mapPos[0].toString(),
        lng: mapPos[1].toString()
      }));
    }
  }, [mapPos]);

  const [images, setImages] = useState<FileList | null>(null);

  if (!token) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-orange-50 p-6 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-orange-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Authentication Required</h2>
        <p className="text-gray-500 mb-8 max-w-md">You need to be signed in to report a pet. This helps us keep the community safe and verified.</p>
        <button
          onClick={() => navigate("/auth")}
          className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg"
        >
          Sign In / Sign Up
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value as string));
    data.append("type", type || "lost");
    if (images) {
      for (let i = 0; i < images.length; i++) {
        data.append("images", images[i]);
      }
    }

    try {
      const res = await fetch("/api/pets/report", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to submit report");
      
      setSuccess(true);
      setMatches(result.matches || []);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center"
        >
          <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Report Submitted Successfully!</h2>
          <p className="text-gray-500 mb-12 text-lg font-medium">Your report is now live. We've already started looking for potential matches.</p>

          {matches.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold text-orange-500 mb-6 flex items-center justify-center gap-2">
                <AlertCircle className="w-6 h-6" /> {matches.length} Potential Matches Found!
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {matches.map((match) => (
                  <div key={match.id} className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-left flex gap-4">
                    <img src={match.images[0]} className="w-20 h-20 rounded-xl object-cover shrink-0" alt="Match" />
                    <div>
                      <h4 className="font-bold text-gray-900">{match.petName || "Unnamed"}</h4>
                      <p className="text-xs text-gray-500 mb-2">{match.breed} • {match.color}</p>
                      <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">{match.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/browse")}
              className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg"
            >
              Browse All Pets
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-100 text-gray-600 px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition-all"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight uppercase">
          Report <span className="text-orange-500">{type}</span> Pet
        </h1>
        <p className="text-gray-500 font-medium">Provide as much detail as possible to help us find a match.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-orange-500" /> Basic Information
            </h2>
          </div>
          <div className="p-8 grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Pet Type</label>
              <select
                value={formData.petType}
                onChange={(e) => setFormData({ ...formData, petType: e.target.value })}
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium appearance-none"
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Pet Name (if known)</label>
              <input
                type="text"
                value={formData.petName}
                onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                placeholder="e.g. Buddy"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Breed</label>
              <input
                type="text"
                required
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                placeholder="e.g. Golden Retriever"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Primary Color</label>
              <input
                type="text"
                required
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                placeholder="e.g. Golden / White"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" /> Location & Time
            </h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Last Seen Location (Address)</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                placeholder="e.g. Central Park, New York"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Select Location on Map</label>
              <div className="h-64 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                <MapContainer
                  center={[40.785091, -73.968285]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={mapPos} setPosition={setMapPos} />
                </MapContainer>
              </div>
              <p className="text-[10px] text-gray-400 italic">Click on the map to set the exact coordinates.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                  placeholder="40.785091"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                  placeholder="-73.968285"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-orange-500" /> Photos & Contact
            </h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Upload Photos (Max 5)</label>
              <div className="relative group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImages(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full py-12 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center group-hover:border-orange-500 transition-colors">
                  <Upload className="w-10 h-10 text-gray-300 group-hover:text-orange-500 mb-4" />
                  <p className="text-sm font-bold text-gray-400 group-hover:text-orange-500">
                    {images ? `${images.length} files selected` : "Drag & drop or click to upload"}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Contact Details</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Urgency Level</label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium appearance-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-5 rounded-3xl font-black text-xl hover:bg-orange-600 transition-all shadow-xl hover:shadow-orange-500/20 disabled:opacity-50"
        >
          {loading ? "Submitting Report..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Pet } from "../types";
import { MapPin, AlertCircle, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function MapView() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.785091, -73.968285]); // Default to NYC Central Park

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await fetch("/api/pets");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch pets");
        setPets(data);
        
        // If there are pets, center the map on the first one
        if (data.length > 0) {
          setMapCenter([data[0].lat, data[0].lng]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
    setMapCenter([pet.lat, pet.lng]);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-96 bg-white border-r border-gray-100 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight uppercase">Map View</h1>
          <p className="text-sm text-gray-500 font-medium">Explore reports in your area.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-orange-500" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          ) : pets.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm font-medium">No reports found.</p>
          ) : (
            pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => handlePetSelect(pet)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                  selectedPet?.id === pet.id
                    ? "bg-orange-50 border-orange-200 shadow-md"
                    : "bg-white border-gray-100 hover:border-orange-200"
                }`}
              >
                <div className="flex gap-4">
                  <img src={pet.images[0]} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="Pet" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{pet.petName || "Unnamed"}</h3>
                    <p className="text-xs text-gray-500 mb-2 truncate">{pet.breed} • {pet.color}</p>
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-500">
                      <MapPin className="w-3 h-3" /> {pet.location}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-gray-200 overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <ChangeView center={mapCenter} zoom={13} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pets.map((pet) => (
            <Marker
              key={pet.id}
              position={[pet.lat, pet.lng]}
              eventHandlers={{
                click: () => setSelectedPet(pet),
              }}
            >
              <Popup>
                <div className="text-center">
                  <img src={pet.images[0]} className="w-24 h-24 rounded-lg object-cover mx-auto mb-2" alt={pet.petName} />
                  <h3 className="font-bold text-gray-900">{pet.petName || "Unnamed"}</h3>
                  <p className="text-xs text-gray-500">{pet.breed}</p>
                  <button 
                    onClick={() => setSelectedPet(pet)}
                    className="mt-2 text-xs font-bold text-orange-500 hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Selected Pet Detail Card Overlay */}
        <AnimatePresence>
          {selectedPet && (
            <motion.div
              initial={{ opacity: 0, y: 20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 20, x: "-50%" }}
              className="absolute bottom-8 left-1/2 z-30 w-full max-w-sm px-4"
            >
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden p-4 flex gap-4">
                <img src={selectedPet.images[0]} className="w-24 h-24 rounded-2xl object-cover shrink-0" alt="Pet" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{selectedPet.petName || "Unnamed"}</h3>
                    <button onClick={() => setSelectedPet(null)} className="text-gray-400 hover:text-gray-600">
                      <AlertCircle className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{selectedPet.breed} • {selectedPet.color}</p>
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-500 mb-4">
                    <MapPin className="w-3 h-3" /> {selectedPet.location}
                  </div>
                  <button className="w-full py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors">
                    View Full Details
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Notice */}
        <div className="absolute top-4 right-4 z-10 max-w-xs">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-lg flex gap-3">
            <Info className="w-5 h-5 text-orange-500 shrink-0" />
            <p className="text-[10px] font-medium text-gray-600 leading-relaxed">
              Using OpenStreetMap for real-time location tracking. Click markers for pet details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

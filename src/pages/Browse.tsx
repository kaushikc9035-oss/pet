import { useState, useEffect } from "react";
import { Pet } from "../types";
import PetCard from "../components/PetCard";
import { Search, Filter, PawPrint, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Browse({ token }: { token: string | null }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    petType: "",
    breed: "",
    color: "",
  });

  const fetchPets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters as any);
      const res = await fetch(`/api/pets?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch pets");
      setPets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [filters]);

  const handleReunited = async (id: string) => {
    if (!token) return alert("Please sign in to mark as reunited");
    try {
      const res = await fetch(`/api/pets/${id}/reunited`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchPets();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight uppercase">Browse Reports</h1>
        <p className="text-gray-500 font-medium">Search and filter through lost and found pet reports in your community.</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Report Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium appearance-none"
            >
              <option value="all">All Reports</option>
              <option value="lost">Lost Pets</option>
              <option value="found">Found Pets</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Pet Type</label>
            <select
              value={filters.petType}
              onChange={(e) => setFilters({ ...filters, petType: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium appearance-none"
            >
              <option value="">All Types</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="bird">Bird</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Breed</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.breed}
                onChange={(e) => setFilters({ ...filters, breed: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                placeholder="Search breed..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Color</label>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.color}
                onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                placeholder="Search color..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Loader2 className="w-12 h-12 animate-spin mb-4 text-orange-500" />
          <p className="font-bold uppercase tracking-widest text-sm">Fetching reports...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-8 rounded-3xl text-center text-red-600 font-bold border border-red-100">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          {error}
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <PawPrint className="w-16 h-16 text-gray-200 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {pets.map((pet) => (
              <motion.div
                key={pet.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <PetCard pet={pet} onReunited={handleReunited} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

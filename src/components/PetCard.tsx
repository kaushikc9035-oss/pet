import { Pet } from "../types";
import { MapPin, Calendar, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function PetCard({ pet, onReunited }: { pet: Pet; onReunited?: (id: string) => void }) {
  const isReunited = pet.status === "reunited";

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group",
      isReunited && "opacity-75 grayscale-[0.5]"
    )}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={pet.images[0] || "https://picsum.photos/seed/pet/800/600"}
          alt={pet.petName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm",
            pet.urgency === "high" ? "bg-red-500" : pet.urgency === "medium" ? "bg-orange-500" : "bg-blue-500"
          )}>
            {pet.urgency} Urgency
          </span>
          {isReunited && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500 text-white shadow-sm flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Reunited
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{pet.petName || "Unnamed Pet"}</h3>
            <p className="text-sm text-gray-500 italic">{pet.breed} • {pet.color}</p>
          </div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">{pet.petType}</span>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="truncate">{pet.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
            <span>{new Date(pet.dateTime).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-orange-500 shrink-0" />
            <span>{pet.contact}</span>
          </div>
        </div>

        {!isReunited && onReunited && (
          <button
            onClick={() => onReunited(pet.id)}
            className="w-full py-3 rounded-xl border-2 border-green-500 text-green-600 font-bold text-sm hover:bg-green-500 hover:text-white transition-all duration-200"
          >
            Mark as Reunited
          </button>
        )}
      </div>
    </div>
  );
}

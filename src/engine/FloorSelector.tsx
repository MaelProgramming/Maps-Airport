import type { Floor } from '../types/types';

interface FloorSelectorProps {
    floors: Floor[];
    currentLevel: number;
    onFloorChange: (level: number) => void;
}

export const FloorSelector = ({ floors, currentLevel, onFloorChange }: FloorSelectorProps) => {
    // 1. Sécurité : si floors est undefined ou vide, on n'affiche rien du tout
    console.log("MELIO DEBUG - Floors reçus :", floors);

    if (!floors || floors.length === 0) {
        console.warn("MELIO WARNING - Le sélecteur ne s'affiche pas car 'floors' est vide !");
        return null;
    }

    // 2. CRUCIAL : On crée une COPIE ([...floors]) avant de trier pour ne pas muter la prop
    const sortedFloors = [...floors].sort((a, b) => b.level - a.level);

    return (
        <div className="absolute top-28 right-6 z-[9999] flex flex-col gap-3 pointer-events-auto">
            {sortedFloors.map((f) => (
                <button
                    key={f.level}
                    onClick={() => onFloorChange(f.level)}
                    className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl shadow-2xl border-2 transition-all duration-300 ${currentLevel === f.level
                            ? 'bg-blue-600 border-blue-400 text-white scale-110'
                            : 'bg-white/90 border-transparent text-slate-600 hover:bg-white hover:scale-105'
                        }`}
                >
                    <span className="text-xl font-black">{f.level}</span>

                    <span className="absolute right-16 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                        {f.name}
                    </span>
                </button>
            ))}
        </div>
    );
};
import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface RoomSelectorProps {
    onSelect: (room: string, style: string) => void;
    onBack?: () => void;
    verticalMode?: boolean;
    hideStyles?: boolean;
}

const ROOM_TYPES = [
    { id: 'living_room', label: 'Living / Sala de Estar', emoji: '\u{1F6CB}' },
    { id: 'bedroom', label: 'Dormitorio', emoji: '\u{1F6CF}' },
    { id: 'kitchen', label: 'Cocina', emoji: '\u{1F373}' },
    { id: 'bathroom', label: 'Bano', emoji: '\u{1F6C1}' },
    { id: 'dining_room', label: 'Comedor', emoji: '\u{1F37D}' },
    { id: 'home_office', label: 'Oficina / Escritorio', emoji: '\u{1F4BB}' },
    { id: 'terrace', label: 'Terraza / Balcon', emoji: '\u{1F305}' },
    { id: 'entrance', label: 'Entrada / Hall', emoji: '\u{1F6AA}' },
];

const STYLES = [
    { id: 'modern', label: 'Moderno', description: 'Lineas limpias, colores neutros', color: '#7c3aed' },
    { id: 'scandinavian', label: 'Escandinavo', description: 'Maderas claras, minimalista', color: '#f5e6d3' },
    { id: 'classic', label: 'Clasico', description: 'Elegante, molduras, tradicional', color: '#8b6914' },
    { id: 'minimalist', label: 'Minimalista', description: 'Pocos muebles, espacios amplios', color: '#e5e5e5' },
    { id: 'industrial', label: 'Industrial', description: 'Ladrillo, metal, madera oscura', color: '#6b4c3b' },
    { id: 'contemporary', label: 'Contemporaneo', description: 'Actual, mezcla de texturas', color: '#4a90d9' },
    { id: 'rustic', label: 'Rustico', description: 'Madera natural, acogedor', color: '#8b5e3c' },
    { id: 'coastal', label: 'Costero', description: 'Azules, blancos, maderas claras', color: '#87ceeb' },
    { id: 'mediterranean', label: 'Mediterraneo', description: 'Terracota, arcos, plantas', color: '#cd853f' },
    { id: 'chilean_modern', label: 'Chileno Moderno', description: 'Mezcla local, materiales naturales', color: '#c41e3a' },
];

export function RoomSelector({ onSelect, verticalMode = false, hideStyles = false }: RoomSelectorProps) {
    const [selectedRoom, setSelectedRoom] = useState<string>('living_room');
    const [selectedStyle, setSelectedStyle] = useState<string>('modern');

    useEffect(() => {
        onSelect(selectedRoom, selectedStyle);
    }, [selectedRoom, selectedStyle, onSelect]);

    return (
        <div className={`space-y-6 ${verticalMode ? '' : 'max-w-4xl mx-auto'}`}>

            {/* Room Type Selector */}
            <div className="space-y-3">
                <label className="text-xs font-semibold text-primary uppercase tracking-wider">Tipo de Habitacion</label>
                <div className="grid grid-cols-2 gap-2">
                    {ROOM_TYPES.map((room) => (
                        <button
                            type="button"
                            key={room.id}
                            onClick={() => setSelectedRoom(room.id)}
                            className={`
                                cursor-pointer relative rounded-xl border transition-all p-3 text-left flex items-center gap-2.5
                                ${selectedRoom === room.id
                                    ? 'border-primary ring-1 ring-primary bg-primary/10'
                                    : 'border-white/10 bg-surface hover:bg-surface/80 hover:border-white/20'
                                }
                            `}
                        >
                            <span className="text-lg">{room.emoji}</span>
                            <span className="text-xs font-medium text-white leading-tight">{room.label}</span>
                            {selectedRoom === room.id && (
                                <div className="ml-auto bg-primary rounded-full p-0.5 shrink-0">
                                    <Check size={10} className="text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Style Selector */}
            {!hideStyles && (
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-primary uppercase tracking-wider">Estilo de Diseno</label>
                    <div className="grid grid-cols-2 gap-2">
                        {STYLES.map((style) => (
                            <button
                                type="button"
                                key={style.id}
                                onClick={() => setSelectedStyle(style.id)}
                                className={`
                                    cursor-pointer relative rounded-xl border transition-all p-3 text-left
                                    ${selectedStyle === style.id
                                        ? 'border-accent ring-1 ring-accent bg-accent/10'
                                        : 'border-white/10 bg-surface hover:bg-surface/80 hover:border-white/20'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="w-4 h-4 rounded-full shrink-0 border border-white/20"
                                        style={{ backgroundColor: style.color }}
                                    />
                                    <div className="min-w-0">
                                        <span className="text-xs font-medium text-white block truncate">{style.label}</span>
                                        <span className="text-[10px] text-text-muted block truncate">{style.description}</span>
                                    </div>
                                    {selectedStyle === style.id && (
                                        <div className="ml-auto text-accent shrink-0">
                                            <Check size={14} />
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Export style data for use in restyle mode
export { STYLES as DESIGN_STYLES, ROOM_TYPES };

import type { PlayerInput } from "@/lib/types/player";

/** Datos iniciales para poblar MongoDB (mismo contenido del mock original) */
export const SEED_PLAYERS: PlayerInput[] = [
  {
    name: "Matías González",
    category: "SUB-14",
    location: "Santiago, Chile",
    ranking: 12,
    highlights: [
      "Campeón Copa Futuro 2025",
      "Finalista Nacional Sub-14",
      "Semifinalista Circuito Sur",
    ],
  },
  {
    name: "Valentina Rojas",
    category: "SUB-16",
    location: "Viña del Mar, Chile",
    ranking: 8,
    highlights: [
      "Campeona Regional 2025",
      "Top 10 Ranking Nacional",
      "MVP Torneo Andes",
    ],
  },
  {
    name: "Diego Muñoz",
    category: "SUB-18",
    location: "Concepción, Chile",
    ranking: 5,
    highlights: [
      "Campeón Nacional Sub-18",
      "ITF Junior Grade 4",
      "Selección Chilena Juvenil",
    ],
  },
  {
    name: "Camila Soto",
    category: "SUB-14",
    location: "La Serena, Chile",
    ranking: 15,
    highlights: [
      "Finalista Copa Norte",
      "Campeona Dobles Regional",
      "Mejor ranking de temporada",
    ],
  },
  {
    name: "Tomás Herrera",
    category: "SUB-16",
    location: "Temuco, Chile",
    ranking: 11,
    highlights: [
      "Semifinalista Nacional",
      "Campeón Circuito Sur",
      "Fair Play Award 2025",
    ],
  },
];

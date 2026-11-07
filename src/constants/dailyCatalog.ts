export interface CatalogItem {
  id: string;
  name: string;
  cat: string;
  domain: string;
  icon: string;
  color: string;
  buy: number;
  sell: number;
  unit: string;
  isService?: boolean;
}

export const DAILY_PRODUCTS_CATALOG: CatalogItem[] = [
  // --- QUINCAILLERIE, ÉLECTRICITÉ & BTP ---
  { id: 'quin-1', name: 'Ampoule LED 15W Haute Économie', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'lightbulb', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', buy: 900, sell: 1500, unit: 'Pièce' },
  { id: 'quin-2', name: 'Câble & Fil Électrique 1.5mm² (Rouleau 100m)', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'wire', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', buy: 14000, sell: 18500, unit: 'Rouleau' },
  { id: 'quin-3', name: 'Câble Électrique 2.5mm² (Rouleau 100m)', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'wire', color: 'bg-blue-600/10 text-blue-600 border-blue-600/20', buy: 22000, sell: 27500, unit: 'Rouleau' },
  { id: 'quin-4', name: 'Interrupteur Va-et-Vient Encastré', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'switch', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', buy: 750, sell: 1250, unit: 'Pièce' },
  { id: 'quin-5', name: 'Prise Murale 2P+T avec Sécurité', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'switch', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', buy: 900, sell: 1500, unit: 'Pièce' },
  { id: 'quin-6', name: 'Disjoncteur Modulaire 16A/20A', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'switch', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', buy: 2500, sell: 3800, unit: 'Pièce' },
  { id: 'quin-7', name: 'Ciment Portland CPJ 42.5 (Sac 50kg)', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'cement', color: 'bg-amber-600/10 text-amber-600 border-amber-600/20', buy: 5200, sell: 6500, unit: 'Sac' },
  { id: 'quin-8', name: 'Fer à Béton FeE500 Ø 10mm (Barre 12m)', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'iron', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', buy: 3400, sell: 4200, unit: 'Barre' },
  { id: 'quin-9', name: 'Fer à Béton FeE500 Ø 12mm (Barre 12m)', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'iron', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', buy: 4900, sell: 5800, unit: 'Barre' },
  { id: 'quin-10', name: 'Peinture Blanche Mate Intérieure (Seau 15L)', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'paint', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', buy: 18000, sell: 24500, unit: 'Seau' },
  { id: 'quin-11', name: 'Rouleau de Peinture avec Manche Ergonomique', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'paint', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', buy: 1500, sell: 2500, unit: 'Pièce' },
  { id: 'quin-12', name: 'Tuyau PVC Évacuation Ø 100mm (Barre 4m)', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'pipe', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', buy: 3200, sell: 4500, unit: 'Barre' },
  { id: 'quin-13', name: 'Robinet d\'Arrêt à Tournant Sphérique 1/2', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'pipe', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', buy: 1800, sell: 2800, unit: 'Pièce' },
  { id: 'quin-14', name: 'Cadenas Blindé Haute Sécurité 60mm', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'lock', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', buy: 3000, sell: 4500, unit: 'Pièce' },
  { id: 'quin-15', name: 'Marteau de Coffreur Manche Fibre', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'tool', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', buy: 2200, sell: 3500, unit: 'Pièce' },
  { id: 'quin-16', name: 'Brouette BTP Renforcée Roue Pleine', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'cart', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', buy: 18000, sell: 23500, unit: 'Pièce' },
  { id: 'quin-17', name: 'Pointes Acier Charpente (Carton 5kg)', cat: 'Quincaillerie & BTP', domain: 'btp', icon: 'tool', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', buy: 3500, sell: 4800, unit: 'Carton' },

  // --- RESTAURATION, MAQUIS & FAST-FOOD ---
  { id: 'food-1', name: 'Poulet Bicyclette Braisé à l\'Ail (Entier)', cat: 'Restauration & Maquis', domain: 'food', icon: 'chicken', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', buy: 3200, sell: 4500, unit: 'Plat' },
  { id: 'food-2', name: 'Demi-Poulet Bicyclette Braisé Assaisonné', cat: 'Restauration & Maquis', domain: 'food', icon: 'chicken', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', buy: 1600, sell: 2500, unit: 'Plat' },
  { id: 'food-3', name: 'Poisson Braisé (Carpe Fraîche du Fleuve)', cat: 'Restauration & Maquis', domain: 'food', icon: 'fish', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', buy: 2500, sell: 3800, unit: 'Plat' },
  { id: 'food-4', name: 'Capitaine Frit aux Épices & Piment Vert', cat: 'Restauration & Maquis', domain: 'food', icon: 'fish', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', buy: 3000, sell: 4500, unit: 'Plat' },
  { id: 'food-5', name: 'Plat de Riz au Gras / Tchêp Poulet', cat: 'Restauration & Maquis', domain: 'food', icon: 'dish', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', buy: 900, sell: 1500, unit: 'Plat' },
  { id: 'food-6', name: 'Plat de Riz Blanc Sauce Arachide / Gombo', cat: 'Restauration & Maquis', domain: 'food', icon: 'dish', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', buy: 700, sell: 1200, unit: 'Plat' },
  { id: 'food-7', name: 'Garba / Attiéké Poisson Thon Frit & Oignons', cat: 'Restauration & Maquis', domain: 'food', icon: 'dish', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', buy: 600, sell: 1000, unit: 'Plat' },
  { id: 'food-8', name: 'Brochettes de Bœuf Suya (Le Lot de 5)', cat: 'Restauration & Maquis', domain: 'food', icon: 'skewer', color: 'bg-red-500/10 text-red-500 border-red-500/20', buy: 800, sell: 1250, unit: 'Lot' },
  { id: 'food-9', name: 'Portion de Frites de Pommes de Terre', cat: 'Restauration & Maquis', domain: 'food', icon: 'dish', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', buy: 500, sell: 1000, unit: 'Portion' },
  { id: 'food-10', name: 'Portion d\'Alloco (Banane Plantain Mûre Frite)', cat: 'Restauration & Maquis', domain: 'food', icon: 'dish', color: 'bg-amber-600/10 text-amber-600 border-amber-600/20', buy: 400, sell: 800, unit: 'Portion' },
  { id: 'food-11', name: 'Chawarma Viande & Poulet Sauce Blanche', cat: 'Restauration & Maquis', domain: 'food', icon: 'bread', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', buy: 1200, sell: 2000, unit: 'Pièce' },
  { id: 'food-12', name: 'Café Touba / Espresso Chaud (Tasse)', cat: 'Restauration & Maquis', domain: 'food', icon: 'coffee', color: 'bg-amber-800/10 text-amber-800 border-amber-800/20', buy: 100, sell: 250, unit: 'Tasse' },
  { id: 'food-13', name: 'Thé Vert Menthe Traditionnel (Ataya)', cat: 'Restauration & Maquis', domain: 'food', icon: 'coffee', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', buy: 150, sell: 300, unit: 'Verre' },

  // --- ALIMENTATION GÉNÉRALE & SUPÉRETTE ---
  { id: 'groc-1', name: 'Baguette de Pain Frais (250g)', cat: 'Alimentation Générale', domain: 'grocery', icon: 'bread', color: 'bg-amber-600/10 text-amber-600 border-amber-600/20', buy: 125, sell: 150, unit: 'Baguette' },
  { id: 'groc-2', name: 'Sac de Riz Blanc Parfumé (50kg)', cat: 'Alimentation Générale', domain: 'grocery', icon: 'sack', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', buy: 21500, sell: 24500, unit: 'Sac' },
  { id: 'groc-3', name: 'Sac de Riz Local Burkina Faso (25kg)', cat: 'Alimentation Générale', domain: 'grocery', icon: 'sack', color: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20', buy: 11000, sell: 13000, unit: 'Sac' },
  { id: 'groc-4', name: 'Bidon d\'Huile Végétale 5L', cat: 'Alimentation Générale', domain: 'grocery', icon: 'jug', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', buy: 5400, sell: 6250, unit: 'Bidon' },
  { id: 'groc-5', name: 'Bouteille d\'Huile de Tournesol 1L', cat: 'Alimentation Générale', domain: 'grocery', icon: 'bottle', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', buy: 1150, sell: 1400, unit: 'Bouteille' },
  { id: 'groc-6', name: 'Paquet de Sucre en Morceaux SN SOSUCO (1kg)', cat: 'Alimentation Générale', domain: 'grocery', icon: 'sack', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', buy: 750, sell: 900, unit: 'Paquet' },
  { id: 'groc-7', name: 'Boîte de Lait en Poudre Nido (900g)', cat: 'Alimentation Générale', domain: 'grocery', icon: 'can', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', buy: 4800, sell: 5500, unit: 'Boîte' },
  { id: 'groc-8', name: 'Carton Pâtes Spaghetti 500g (20 pcs)', cat: 'Alimentation Générale', domain: 'grocery', icon: 'sack', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', buy: 8500, sell: 10500, unit: 'Carton' },
  { id: 'groc-9', name: 'Boîte de Concentré de Tomate 70g (Carton 50 pcs)', cat: 'Alimentation Générale', domain: 'grocery', icon: 'can', color: 'bg-red-500/10 text-red-500 border-red-500/20', buy: 6500, sell: 8000, unit: 'Carton' },
  { id: 'groc-10', name: 'Boîte de Sardines à l\'Huile Végétale', cat: 'Alimentation Générale', domain: 'grocery', icon: 'fish', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', buy: 350, sell: 500, unit: 'Boîte' },
  { id: 'groc-11', name: 'Morceau de Savon SN CITEC (400g)', cat: 'Alimentation Générale', domain: 'grocery', icon: 'soap', color: 'bg-teal-500/10 text-teal-600 border-teal-500/20', buy: 300, sell: 400, unit: 'Barre' },
  { id: 'groc-12', name: 'Carton de Cubes d\'Assaisonnement Maggi (60 pcs)', cat: 'Alimentation Générale', domain: 'grocery', icon: 'sack', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', buy: 1200, sell: 1600, unit: 'Carton' },

  // --- BOISSONS & BRASSERIE ---
  { id: 'bev-1', name: 'Brakina Canette 33cl (Pack de 24)', cat: 'Boissons & Brasserie', domain: 'beverage', icon: 'can', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', buy: 11000, sell: 14400, unit: 'Pack' },
  { id: 'bev-2', name: 'Bière Brakina Bouteille 65cl (Casier 12)', cat: 'Boissons & Brasserie', domain: 'beverage', icon: 'bottle', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', buy: 6500, sell: 7800, unit: 'Casier' },
  { id: 'bev-3', name: 'Bière Beaufort Lager Bouteille 50cl (Casier)', cat: 'Boissons & Brasserie', domain: 'beverage', icon: 'bottle', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', buy: 7200, sell: 8500, unit: 'Casier' },
  { id: 'bev-4', name: 'Bière Castel Beer Bouteille 65cl (Casier 12)', cat: 'Boissons & Brasserie', domain: 'beverage', icon: 'bottle', color: 'bg-amber-600/10 text-amber-600 border-amber-600/20', buy: 6500, sell: 7800, unit: 'Casier' },
  { id: 'bev-5', name: 'Canette Énergisante XXL Energy 33cl', cat: 'Boissons & Brasserie', domain: 'beverage', icon: 'can', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', buy: 500, sell: 700, unit: 'Canette' },
  { id: 'bev-6', name: 'Eau Minérale Naturelle 1.5L (Pack x6)', cat: 'Boissons & Brasserie', domain: 'beverage', icon: 'bottle', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', buy: 2200, sell: 3000, unit: 'Pack' },
  { id: 'bev-7', name: 'Sachet d\'Eau Babali 500ml (Paquet de 30)', cat: 'Boissons & Brasserie', domain: 'beverage', icon: 'drink', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', buy: 700, sell: 1000, unit: 'Paquet' },
  { id: 'bev-8', name: 'Jus Local de Bissap Glacé (Bouteille 0.5L)', cat: 'Boissons & Brasserie', domain: 'beverage', icon: 'bottle', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', buy: 250, sell: 500, unit: 'Bouteille' },
  { id: 'bev-9', name: 'Jus Local de Gingembre Fort (Bouteille 0.5L)', cat: 'Boissons & Brasserie', domain: 'beverage', icon: 'bottle', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', buy: 250, sell: 500, unit: 'Bouteille' },

  // --- TÉLÉPHONIE & HIGH-TECH ---
  { id: 'tech-1', name: 'Câble Charge Rapide USB Type-C Renforcé (1m)', cat: 'Téléphonie & High-Tech', domain: 'tech', icon: 'usb', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', buy: 800, sell: 1500, unit: 'Pièce' },
  { id: 'tech-2', name: 'Câble Lightning iPhone Tressé (1m)', cat: 'Téléphonie & High-Tech', domain: 'tech', icon: 'usb', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', buy: 1200, sell: 2000, unit: 'Pièce' },
  { id: 'tech-3', name: 'Adaptateur Secteur 20W Charge Rapide USB-C', cat: 'Téléphonie & High-Tech', domain: 'tech', icon: 'phone', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', buy: 2500, sell: 4000, unit: 'Pièce' },
  { id: 'tech-4', name: 'Écouteurs Bluetooth Sans Fil (Boîtier TWS)', cat: 'Téléphonie & High-Tech', domain: 'tech', icon: 'phone', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', buy: 4500, sell: 7500, unit: 'Paire' },
  { id: 'tech-5', name: 'Batterie Externe Power Bank 10 000 mAh', cat: 'Téléphonie & High-Tech', domain: 'tech', icon: 'phone', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', buy: 5500, sell: 8500, unit: 'Pièce' },
  { id: 'tech-6', name: 'Clé USB 3.0 Métallique 32 Go', cat: 'Téléphonie & High-Tech', domain: 'tech', icon: 'usb', color: 'bg-teal-500/10 text-teal-600 border-teal-500/20', buy: 2200, sell: 3500, unit: 'Pièce' },

  // --- MODE, TISSUS & CONFECTION ---
  { id: 'fash-1', name: 'Pagne Faso Dan Fani Traditionnel Tissé Main (3 pcs)', cat: 'Mode & Tissus', domain: 'fashion', icon: 'shirt', color: 'bg-amber-600/10 text-amber-600 border-amber-600/20', buy: 15000, sell: 22500, unit: 'Complet' },
  { id: 'fash-2', name: 'Pagne Wax Imprimé de Qualité Supérieure (6 yards)', cat: 'Mode & Tissus', domain: 'fashion', icon: 'shirt', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', buy: 9000, sell: 13500, unit: 'Pagne' },
  { id: 'fash-3', name: 'Chemise Manches Longues Coton Homme', cat: 'Mode & Tissus', domain: 'fashion', icon: 'shirt', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', buy: 4500, sell: 7500, unit: 'Pièce' },
  { id: 'fash-4', name: 'Sandales en Cuir Véritable Artisanal', cat: 'Mode & Tissus', domain: 'fashion', icon: 'shirt', color: 'bg-amber-700/10 text-amber-700 border-amber-700/20', buy: 3500, sell: 6000, unit: 'Paire' },

  // --- PIÈCES MOTO & VÉHICULES ---
  { id: 'auto-1', name: 'Huile Moteur Moto 4T 20W50 1L', cat: 'Pièces Moto & Véhicules', domain: 'auto', icon: 'moto', color: 'bg-amber-600/10 text-amber-600 border-amber-600/20', buy: 2400, sell: 3200, unit: 'Bidon' },
  { id: 'auto-2', name: 'Bougie d\'Allumage Moto Haute Résistance', cat: 'Pièces Moto & Véhicules', domain: 'auto', icon: 'moto', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', buy: 900, sell: 1500, unit: 'Pièce' },
  { id: 'auto-3', name: 'Pneu Moto Arrière 17 Pouces Renforcé', cat: 'Pièces Moto & Véhicules', domain: 'auto', icon: 'moto', color: 'bg-slate-600/10 text-slate-300 border-slate-600/20', buy: 12000, sell: 16000, unit: 'Pneu' },
  { id: 'auto-4', name: 'Chambre à Air Moto 17 Pouces', cat: 'Pièces Moto & Véhicules', domain: 'auto', icon: 'moto', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', buy: 1800, sell: 2500, unit: 'Pièce' },

  // --- SANTÉ & BEAUTÉ ---
  { id: 'hlth-1', name: 'Pot de Beurre de Karité Pur Artisanal (500g)', cat: 'Santé & Cosmétiques', domain: 'health', icon: 'soap', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', buy: 1200, sell: 2000, unit: 'Pot' },
  { id: 'hlth-2', name: 'Savon Noir Naturel Gommant Végétal', cat: 'Santé & Cosmétiques', domain: 'health', icon: 'soap', color: 'bg-teal-500/10 text-teal-600 border-teal-500/20', buy: 800, sell: 1500, unit: 'Pot' },
  { id: 'hlth-3', name: 'Boîte de Paracétamol 1000mg (16 comprimés)', cat: 'Santé & Cosmétiques', domain: 'health', icon: 'pill', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', buy: 500, sell: 800, unit: 'Boîte' },

  // --- PRESTATIONS & SERVICES ---
  { id: 'srv-1', name: 'Transport & Déchargement Chantier (Camion 10T)', cat: 'Prestations & Services', domain: 'services', icon: 'truck', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', buy: 0, sell: 35000, unit: 'Forfait', isService: true },
  { id: 'srv-2', name: 'Course & Livraison Rapide en Tricycle Benne', cat: 'Prestations & Services', domain: 'services', icon: 'truck', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', buy: 0, sell: 7500, unit: 'Course', isService: true },
  { id: 'srv-3', name: 'Dépannage & Installation Électrique Bâtiment', cat: 'Prestations & Services', domain: 'services', icon: 'tool', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', buy: 0, sell: 15000, unit: 'Intervention', isService: true },
  { id: 'srv-4', name: 'Réparation & Débouchage Plomberie Sanitaire', cat: 'Prestations & Services', domain: 'services', icon: 'tool', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', buy: 0, sell: 12500, unit: 'Intervention', isService: true },
  { id: 'srv-5', name: 'Main d\'Œuvre Maçonnerie & Finition (Journée)', cat: 'Prestations & Services', domain: 'services', icon: 'tool', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', buy: 0, sell: 20000, unit: 'Journée', isService: true },
  { id: 'srv-6', name: 'Étude Technique, Devis & Métré Gros-Œuvre', cat: 'Prestations & Services', domain: 'services', icon: 'switch', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', buy: 0, sell: 50000, unit: 'Forfait', isService: true }
];

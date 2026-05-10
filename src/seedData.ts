import type { Module, ModuleItem } from "./types";
import { uid } from "./storage";

function mi(partial: Partial<ModuleItem> & { name: string }): ModuleItem {
  return {
    id: uid("mi"),
    name: partial.name,
    quantity: partial.quantity ?? 1,
    category: partial.category ?? "miscellaneous",
    defaultBagType: partial.defaultBagType,
    journeyRole: partial.journeyRole ?? "bring_both_ways",
    returnExpected: partial.returnExpected ?? true,
    critical: partial.critical ?? false,
    notes: partial.notes,
  };
}

export function buildSeedModules(): Module[] {
  const now = Date.now();
  const make = (name: string, description: string, items: ModuleItem[]): Module => ({
    id: uid("mod"),
    name,
    description,
    defaultItems: items,
    createdAt: now,
    updatedAt: now,
  });

  return [
    make("Base Travel Kit", "Documents and essentials carried close to you.", [
      mi({ name: "Passport", category: "travel_documents", defaultBagType: "shoulder_bag", critical: true }),
      mi({ name: "Wallet", category: "travel_documents", defaultBagType: "shoulder_bag", critical: true }),
      mi({ name: "Keys", category: "travel_documents", defaultBagType: "shoulder_bag", critical: true }),
      mi({ name: "Phone charger", category: "electronics", defaultBagType: "shoulder_bag", critical: true }),
      mi({ name: "Power bank", category: "electronics", defaultBagType: "shoulder_bag" }),
      mi({ name: "Earphones", category: "electronics", defaultBagType: "shoulder_bag" }),
      mi({ name: "Sunglasses", category: "accessories", defaultBagType: "shoulder_bag" }),
    ]),
    make("Remote Work Kit", "Gear for working remotely while travelling.", [
      mi({ name: "Laptop", category: "remote_work", defaultBagType: "laptop_bag", critical: true }),
      mi({ name: "Laptop charger", category: "remote_work", defaultBagType: "laptop_bag", critical: true }),
      mi({ name: "Mouse", category: "remote_work", defaultBagType: "laptop_bag" }),
      mi({ name: "Headset", category: "remote_work", defaultBagType: "laptop_bag" }),
      mi({ name: "iPad", category: "remote_work", defaultBagType: "laptop_bag" }),
      mi({ name: "USB charger", category: "electronics", defaultBagType: "laptop_bag" }),
      mi({ name: "Adapter", category: "electronics", defaultBagType: "laptop_bag" }),
    ]),
    make("Toiletries", "Daily grooming basics.", [
      mi({ name: "Razor", category: "toiletries", defaultBagType: "toiletry_pouch" }),
      mi({ name: "Shaving cream", category: "toiletries", defaultBagType: "toiletry_pouch", journeyRole: "consumable", returnExpected: false }),
      mi({ name: "Deodorant", category: "toiletries", defaultBagType: "toiletry_pouch" }),
      mi({ name: "Wipes", category: "toiletries", defaultBagType: "toiletry_pouch", journeyRole: "consumable", returnExpected: false }),
      mi({ name: "Toothbrush", category: "toiletries", defaultBagType: "toiletry_pouch" }),
      mi({ name: "Toothpaste", category: "toiletries", defaultBagType: "toiletry_pouch", journeyRole: "consumable", returnExpected: false }),
    ]),
    make("Contact Lens / Glasses Kit", "Eye essentials.", [
      mi({ name: "Glasses", category: "health_rehab", defaultBagType: "shoulder_bag", critical: true }),
      mi({ name: "Lens case", category: "health_rehab", defaultBagType: "shoulder_bag", critical: true }),
      mi({ name: "Spare lenses", category: "health_rehab", defaultBagType: "shoulder_bag", critical: true }),
      mi({ name: "Contact lens solution", category: "toiletries", defaultBagType: "suitcase" }),
    ]),
    make("Warm Weather Clothes", "Lightweight clothing for warm trips.", [
      mi({ name: "Cotton T-shirts", category: "clothes", defaultBagType: "suitcase", quantity: 5 }),
      mi({ name: "Polyester T-shirts", category: "clothes", defaultBagType: "suitcase", quantity: 3 }),
      mi({ name: "Shorts", category: "clothes", defaultBagType: "suitcase", quantity: 3 }),
      mi({ name: "Briefs", category: "clothes", defaultBagType: "suitcase", quantity: 7 }),
      mi({ name: "Socks", category: "clothes", defaultBagType: "suitcase", quantity: 7 }),
      mi({ name: "Cap", category: "accessories", defaultBagType: "suitcase" }),
      mi({ name: "Flip flops", category: "shoes", defaultBagType: "suitcase" }),
    ]),
    make("Gym / Rehab Kit", "Training and rehab gear.", [
      mi({ name: "Rehab gear", category: "health_rehab", defaultBagType: "suitcase" }),
      mi({ name: "Gym towel", category: "health_rehab", defaultBagType: "suitcase" }),
      mi({ name: "Training clothes", category: "clothes", defaultBagType: "suitcase", quantity: 2 }),
      mi({ name: "Hiking shoes", category: "shoes", defaultBagType: "suitcase" }),
    ]),
    make("Road Trip Food", "Snacks and drinks for the drive.", [
      mi({ name: "Protein bar", category: "food", defaultBagType: "suitcase", quantity: 4, journeyRole: "consumable", returnExpected: false }),
      mi({ name: "Grocery bag", category: "bags", defaultBagType: "suitcase" }),
      mi({ name: "Water bottle", category: "accessories", defaultBagType: "shoulder_bag" }),
    ]),
    make("Family Gifts", "Gifts and food to give away.", [
      mi({ name: "Gift item", category: "gifts", defaultBagType: "gift_bag", journeyRole: "gift", returnExpected: false }),
      mi({ name: "Food to take", category: "food", defaultBagType: "gift_bag", journeyRole: "outbound_only", returnExpected: false }),
      mi({ name: "Gift bag", category: "bags", defaultBagType: "gift_bag", returnExpected: false }),
    ]),
    make("Flight Shoulder Bag Essentials", "What you want with you on the plane.", [
      mi({ name: "Passport", category: "travel_documents", defaultBagType: "shoulder_bag", critical: true }),
      mi({ name: "Boarding pass", category: "travel_documents", defaultBagType: "shoulder_bag", critical: true, journeyRole: "outbound_only", returnExpected: false }),
      mi({ name: "Phone", category: "electronics", defaultBagType: "shoulder_bag", critical: true }),
      mi({ name: "Earphones", category: "electronics", defaultBagType: "shoulder_bag" }),
      mi({ name: "Snacks", category: "food", defaultBagType: "shoulder_bag", journeyRole: "consumable", returnExpected: false }),
      mi({ name: "Water bottle", category: "accessories", defaultBagType: "shoulder_bag" }),
      mi({ name: "Book / Kindle", category: "accessories", defaultBagType: "shoulder_bag" }),
    ]),
    make("Winter Clothing", "Layers and accessories for cold trips.", [
      mi({ name: "Wool socks", category: "clothes", defaultBagType: "suitcase", quantity: 5 }),
      mi({ name: "Thermal base layer", category: "clothes", defaultBagType: "suitcase", quantity: 2 }),
      mi({ name: "Sweater / jumper", category: "clothes", defaultBagType: "suitcase", quantity: 2 }),
      mi({ name: "Warm jacket", category: "clothes", defaultBagType: "suitcase" }),
      mi({ name: "Beanie", category: "accessories", defaultBagType: "suitcase" }),
      mi({ name: "Gloves", category: "accessories", defaultBagType: "suitcase" }),
      mi({ name: "Scarf", category: "accessories", defaultBagType: "suitcase" }),
      mi({ name: "Boots", category: "shoes", defaultBagType: "suitcase" }),
    ]),
    make("Sports", "Training kit and accessories.", [
      mi({ name: "Trainers", category: "shoes", defaultBagType: "suitcase", critical: true }),
      mi({ name: "Sports socks", category: "clothes", defaultBagType: "suitcase", quantity: 5 }),
      mi({ name: "Athletic shorts", category: "clothes", defaultBagType: "suitcase", quantity: 3 }),
      mi({ name: "Sports tops", category: "clothes", defaultBagType: "suitcase", quantity: 4 }),
      mi({ name: "Water bottle", category: "accessories", defaultBagType: "shoulder_bag" }),
      mi({ name: "Sweat towel", category: "accessories", defaultBagType: "suitcase" }),
      mi({ name: "Resistance bands", category: "health_rehab", defaultBagType: "suitcase" }),
      mi({ name: "Sweatband", category: "accessories", defaultBagType: "suitcase" }),
    ]),
    make("Stay-over Essentials", "One-night minimum kit for crashing somewhere.", [
      mi({ name: "Pyjamas", category: "clothes", defaultBagType: "suitcase" }),
      mi({ name: "Slippers", category: "shoes", defaultBagType: "suitcase" }),
      mi({ name: "Phone charger", category: "electronics", defaultBagType: "shoulder_bag", critical: true }),
      mi({ name: "Toothbrush", category: "toiletries", defaultBagType: "toiletry_pouch" }),
      mi({ name: "Toothpaste", category: "toiletries", defaultBagType: "toiletry_pouch", journeyRole: "consumable", returnExpected: false }),
      mi({ name: "Underwear", category: "clothes", defaultBagType: "suitcase", quantity: 2 }),
      mi({ name: "Spare socks", category: "clothes", defaultBagType: "suitcase", quantity: 2 }),
      mi({ name: "Day-after outfit", category: "clothes", defaultBagType: "suitcase" }),
    ]),
  ];
}

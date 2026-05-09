export type TripType = "holiday" | "weekend_stay" | "road_trip" | "visiting_family";
export type TransportMode = "flight" | "car" | "train" | "other";
export type LaundryAccess = "yes" | "no" | "unknown";
export type Activity =
  | "beach"
  | "hiking"
  | "gym_rehab"
  | "formal_event"
  | "family_visit"
  | "general_sightseeing";

export type LifecyclePhase = "plan" | "pack" | "during" | "return" | "unpack";

export type ItemStatus =
  | "planned"
  | "packed"
  | "packed_from_home"
  | "bought_during_trip"
  | "consumed"
  | "gifted"
  | "thrown_away"
  | "left_at_destination"
  | "brought_back"
  | "laundry_dirty"
  | "moved_between_bags"
  | "lost_unaccounted_for"
  | "unpacked"
  | "restock_needed";

export type JourneyRole =
  | "bring_both_ways"
  | "outbound_only"
  | "return_only"
  | "consumable"
  | "gift"
  | "discardable"
  | "bought_on_trip"
  | "laundry"
  | "uncertain";

export type Category =
  | "travel_documents"
  | "electronics"
  | "remote_work"
  | "clothes"
  | "toiletries"
  | "health_rehab"
  | "food"
  | "gifts"
  | "shoes"
  | "accessories"
  | "bags"
  | "miscellaneous";

export type BagType =
  | "shoulder_bag"
  | "suitcase"
  | "backpack"
  | "laptop_bag"
  | "toiletry_pouch"
  | "cooler_bag"
  | "gift_bag"
  | "custom";

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  tripType: TripType;
  transportMode: TransportMode;
  remoteWorkRequired: boolean;
  laundryAccess: LaundryAccess;
  activities: Activity[];
  takingGiftsOrFood: boolean;
  notes: string;
  currentPhase: LifecyclePhase;
  bagIds: string[];
  itemIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Bag {
  id: string;
  tripId: string;
  name: string;
  type: BagType;
  parentBagId?: string;
  notes?: string;
}

export interface Item {
  id: string;
  tripId: string;
  moduleId?: string;
  name: string;
  quantity: number;
  category: Category;
  bagId?: string;
  status: ItemStatus;
  journeyRole: JourneyRole;
  returnExpected: boolean;
  critical: boolean;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ModuleItem {
  id: string;
  name: string;
  quantity: number;
  category: Category;
  defaultBagType?: BagType;
  journeyRole: JourneyRole;
  returnExpected: boolean;
  critical: boolean;
  notes?: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  defaultItems: ModuleItem[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  trips: Trip[];
  bags: Bag[];
  items: Item[];
  modules: Module[];
  seeded: boolean;
}

export const TRIP_TYPE_LABEL: Record<TripType, string> = {
  holiday: "Holiday",
  weekend_stay: "Weekend stay",
  road_trip: "Road trip",
  visiting_family: "Visiting family",
};

export const TRANSPORT_LABEL: Record<TransportMode, string> = {
  flight: "Flight",
  car: "Car",
  train: "Train",
  other: "Other",
};

export const ACTIVITY_LABEL: Record<Activity, string> = {
  beach: "Beach",
  hiking: "Hiking",
  gym_rehab: "Gym / rehab",
  formal_event: "Formal event",
  family_visit: "Family visit",
  general_sightseeing: "Sightseeing",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  travel_documents: "Travel documents",
  electronics: "Electronics",
  remote_work: "Remote work",
  clothes: "Clothes",
  toiletries: "Toiletries",
  health_rehab: "Health / rehab",
  food: "Food",
  gifts: "Gifts",
  shoes: "Shoes",
  accessories: "Accessories",
  bags: "Bags",
  miscellaneous: "Misc",
};

export const STATUS_LABEL: Record<ItemStatus, string> = {
  planned: "Planned",
  packed: "Packed",
  packed_from_home: "From home",
  bought_during_trip: "Bought",
  consumed: "Consumed",
  gifted: "Gifted",
  thrown_away: "Thrown away",
  left_at_destination: "Left behind",
  brought_back: "Brought back",
  laundry_dirty: "Laundry",
  moved_between_bags: "Moved",
  lost_unaccounted_for: "Lost",
  unpacked: "Unpacked",
  restock_needed: "Restock",
};

export const JOURNEY_LABEL: Record<JourneyRole, string> = {
  bring_both_ways: "Both ways",
  outbound_only: "Outbound only",
  return_only: "Return only",
  consumable: "Consumable",
  gift: "Gift",
  discardable: "Discardable",
  bought_on_trip: "Bought on trip",
  laundry: "Laundry",
  uncertain: "Uncertain",
};

export const BAG_TYPE_LABEL: Record<BagType, string> = {
  shoulder_bag: "Shoulder bag",
  suitcase: "Suitcase",
  backpack: "Backpack",
  laptop_bag: "Laptop bag",
  toiletry_pouch: "Toiletry pouch",
  cooler_bag: "Cooler bag",
  gift_bag: "Gift bag",
  custom: "Custom",
};

export const PHASE_LABEL: Record<LifecyclePhase, string> = {
  plan: "Plan",
  pack: "Pack",
  during: "During trip",
  return: "Return pack",
  unpack: "Unpack / reset",
};

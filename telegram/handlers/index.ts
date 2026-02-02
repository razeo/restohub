// Export all handlers for easy imports
export { handleOutOfStock, notifyOutOfStock, notifyLowStock } from './outofstock';
export { handleWasteList, notifyWaste, notifyDailyWasteSummary } from './wastelist';
export { handleShift, notifyShiftChange, notifyShiftCoverage, notifyShiftUpdate } from './shift';
export { handleHandover, notifyHandover, notifyUrgentHandover, confirmHandover } from './handover';
export { 
  handleRoomService, 
  notifyNewRoomServiceOrder, 
  notifyRoomServiceUpdate, 
  notifyRoomServiceSummary 
} from './roomservice';
export { 
  handleDailyMenu, 
  notifyDailyMenu, 
  notifyMenuUpdate, 
  notifyDailySpecial,
  notifyMenuAvailability 
} from './daily_menu';
export { 
  handleAllergen, 
  notifyAllergenAlert, 
  notifyIngredientSubstitution, 
  notifyDietaryRequirement,
  notifyAllergenTrainingReminder 
} from './allergen';

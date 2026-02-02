import { Markup } from 'telegraf';

// Main menu keyboard
export const mainMenuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('📋 Daily Menu', 'daily_menu')],
  [Markup.button.callback('🗑️ Waste Report', 'waste_report')],
  [Markup.button.callback('🔄 Shift Status', 'shift_status')],
  [Markup.button.callback('🚪 Handover', 'handover')],
]);

// Department selection keyboard
export const departmentKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('👨‍🍳 Kitchen', 'dept_kitchen')],
  [Markup.button.callback('🍽️ Service', 'dept_service')],
  [Markup.button.callback('🍸 Bar', 'dept_bar')],
]);

// Common actions keyboard
export const commonActionsKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('✅ Confirm', 'confirm'), Markup.button.callback('❌ Cancel', 'cancel')],
]);

// Yes/No keyboard
export const yesNoKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('✅ Yes', 'yes'), Markup.button.callback('❌ No', 'no')],
]);

// Back button
export const backKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('⬅️ Back', 'back')],
]);

// Room service status keyboard
export const roomServiceStatusKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🆕 New Order', 'rs_new')],
  [Markup.button.callback('🔥 In Progress', 'rs_progress')],
  [Markup.button.callback('✅ Delivered', 'rs_delivered')],
]);

// Stock status keyboard
export const stockStatusKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('📉 Low Stock', 'stock_low')],
  [Markup.button.callback('🚫 Out of Stock', 'stock_out')],
  [Markup.button.callback('✅ Restocked', 'stock_restocked')],
]);

// Waste reason keyboard
export const wasteReasonKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🥀 Expired', 'waste_expired')],
  [Markup.button.callback('🍽️ Spoiled', 'waste_spoiled')],
  [Markup.button.callback('📦 Damaged', 'waste_damaged')],
  [Markup.button.callback('⚠️ Quality Issue', 'waste_quality')],
]);

// Shift type keyboard
export const shiftTypeKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🌅 Morning', 'shift_morning')],
  [Markup.button.callback('☀️ Afternoon', 'shift_afternoon')],
  [Markup.button.callback('🌙 Evening', 'shift_evening')],
]);

// Allergen severity keyboard
export const allergenSeverityKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🟡 Mild', 'allergen_mild')],
  [Markup.button.callback('🟠 Moderate', 'allergen_moderate')],
  [Markup.button.callback('🔴 Severe', 'allergen_severe')],
]);

// Export all keyboards as a map for easy access
export const keyboards = {
  main: mainMenuKeyboard,
  department: departmentKeyboard,
  common: commonActionsKeyboard,
  yesNo: yesNoKeyboard,
  back: backKeyboard,
  roomService: roomServiceStatusKeyboard,
  stock: stockStatusKeyboard,
  wasteReason: wasteReasonKeyboard,
  shiftType: shiftTypeKeyboard,
  allergenSeverity: allergenSeverityKeyboard,
};

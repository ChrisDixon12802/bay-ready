/**
 * Convert 24-hour time format (HH:MM) to 12-hour AM/PM format
 * @param {string} militaryTime - Time in HH:MM format (e.g., "14:30")
 * @returns {string} Time in 12-hour format (e.g., "2:30 PM")
 */
export const convertTo12Hour = (militaryTime) => {
  if (!militaryTime || typeof militaryTime !== "string") {
    return "";
  }

  const [hours, minutes] = militaryTime.split(":").map(Number);

  if (isNaN(hours) || isNaN(minutes)) {
    return militaryTime;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

/**
 * Convert 12-hour AM/PM format to 24-hour format for storage
 * @param {string} twelveHourTime - Time in 12-hour format (e.g., "2:30 PM")
 * @returns {string} Time in HH:MM format (e.g., "14:30")
 */
export const convertTo24Hour = (twelveHourTime) => {
  if (!twelveHourTime || typeof twelveHourTime !== "string") {
    return "";
  }

  const regex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
  const match = twelveHourTime.match(regex);

  if (!match) {
    return twelveHourTime;
  }

  let [, hours, minutes, period] = match;
  hours = parseInt(hours, 10);
  const isPM = period.toUpperCase() === "PM";

  if (isPM && hours !== 12) {
    hours += 12;
  } else if (!isPM && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${minutes}`;
};

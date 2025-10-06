import { format } from "date-fns";

export const formatDate = (dateString) => {
  return format(new Date(dateString), "MM/dd/yy");
};

export const formatDateForFilter = (today) => {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
};

export const formatDateForFilterWithTime = (dateTimeString) => {
  if (!dateTimeString) return "-";
  const date = new Date(dateTimeString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

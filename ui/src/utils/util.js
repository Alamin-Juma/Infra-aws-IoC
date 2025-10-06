import { isBefore, isEqual } from "date-fns";
import { toPascalCase } from "./toPascalCase";

export const displayRoleOptions = (role) => {
  {
    role.name === "It Staff" || role.name === "it_staff"
      ? "IT Staff"
      : toPascalCase(role?.name?.replace("_", " "));
  }
};


export function isEqualOrBefore(date, compareTo) {
  return isEqual(date, compareTo) || isBefore(date, compareTo);
}

export function createExcerptByWords(text, wordLimit = 20) {
  const words = text.split(' ');
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(' ') + '...';
}
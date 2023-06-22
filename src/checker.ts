import {
  directionAbbreviations,
  streetTypeAbbreviations,
  otherComponents,
} from "./constant";

const getStreetFromAddress = (address: string): string => {
  const match = quoteRemoval(address).split(":")[0].split("-")[0].split(",");

  if (match && match.length > 0) {
    return match[0].trim();
  }

  return "";
};

export const quoteRemoval = (str: string): string => {
  try {
    return str.replace(/^"(.*)"$/, "$1");
  } catch (error) {
    return str;
  }
};

const formatAddress = (address: string): string => {
  const parts = removeOrdinal(address).toLowerCase().trim().split(" ");
  const formattedParts = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part in streetTypeAbbreviations) {
      formattedParts.push(streetTypeAbbreviations[part]);
    } else if (part in directionAbbreviations) {
      formattedParts.push(directionAbbreviations[part]);
    } else if (part in otherComponents) {
      formattedParts.push(otherComponents[part]);
    } else {
      formattedParts.push(part);
    }
  }

  return formattedParts.join(" ").trim();
};

export const MatchAddresses = (address1: string, address2: string): boolean => {
  const formattedAddress1 = formatAddress(
    getStreetFromAddress(address1)
  ).trim();
  const formattedAddress2 = formatAddress(
    getStreetFromAddress(address2)
  ).trim();

  return (
    formattedAddress2 === formattedAddress1 ||
    formattedAddress2.includes(formattedAddress1) ||
    formattedAddress1.includes(formattedAddress2)
  );
};

const ordinalRemoval = (value: string) => {
  return value.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
};

const isOrdinal = (word: string): boolean => {
  const regex = /(\d+)(st|nd|rd|th)/i;
  return regex.test(word);
};

export const removeOrdinal = (address: string): string => {
  const words = address.split(" ");

  for (let i = 0; i < words.length; i++) {
    if (isOrdinal(words[i])) {
      words[i] = ordinalRemoval(words[i]);
    }
  }

  return words.join(" ");
};

export const getMatchResultString = (matchResult: boolean): string => {
  return matchResult ? "MATCH" : "NOT MATCH";
};

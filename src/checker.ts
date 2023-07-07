import {
  directionAbbreviations,
  streetTypeAbbreviations,
  otherComponents,
} from "./constant";

const getStreetFromAddress = (address: string): string => {
  const match = quoteRemoval(getStreetFromAddress2(address))
    .split(":")[0]
    .split(",");

  if (match && match.length > 0) {
    return match[0].trim();
  }

  return "";
};

const getStreetFromAddress2 = (address: string): string => {
  const splitAddress = address.split("-");

  if (splitAddress.length > 0) {
    const firstPart = splitAddress[0].trim();
    return firstPart;
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

export function compareArrays(
  arr1: string[],
  arr2: string[]
): [string, string, string][] {
  const formattedAddresses1: string[] = [];
  const formattedAddresses2: string[] = [];
  const matchingPairs: [string, string, string][] = [];

  for (const item of arr1) {
    const formattedAddress = formatAddress(getStreetFromAddress(item)).trim();
    formattedAddresses1.push(formattedAddress);
  }

  for (const item of arr2) {
    const formattedAddress = formatAddress(getStreetFromAddress(item)).trim();
    formattedAddresses2.push(formattedAddress);
  }

  for (let i = 0; i < formattedAddresses1.length; i++) {
    const str1 = formattedAddresses1[i];

    if (formattedAddresses2.includes(str1)) {
      const matchedIndex = formattedAddresses2.findIndex(
        (str2) => str2 === str1
      );

      if (matchedIndex !== -1) {
        matchingPairs.push([arr1[i], arr2[matchedIndex], "MATCHED"]);
      }
    }
  }

  return matchingPairs;
}

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

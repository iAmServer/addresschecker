// function NGramCompare(
//   string1: string,
//   string2: string,
//   intGram: number
// ): number {
//   let intGramMatch = 0;
//   let ngramList1 = "";
//   let ngramList2 = "";
//   // Split the first string into a list of ngrams
//   for (let intChar = 0; intChar <= string1.length - intGram; intChar++) {
//     if (ngramList1 !== "") ngramList1 += ",";
//     ngramList1 += string1.substr(intChar, intGram);
//   }
//   // Split the second string into a list of ngrams
//   for (let intChar = 0; intChar <= string2.length - intGram; intChar++) {
//     if (ngramList2 !== "") ngramList2 += ",";
//     ngramList2 += string2.substr(intChar, intGram);
//   }
//   // Split the ngramList1 into an array through which we can iterate
//   const nGramArr1 = ngramList1.split(",");
//   // Iterate through the array and compare values to ngramList2
//   for (const nGram of nGramArr1) {
//     if (ngramList2.includes(nGram)) {
//       // We found a match, increment the counter
//       intGramMatch++;
//     }
//   }
//   // Output the percentage of grams matching
//   return intGramMatch / nGramArr1.length;
// }

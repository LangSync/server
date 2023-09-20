let fs = require("fs");
let path = require("path");
const e = require("express");
const { getEncoding } = require("js-tiktoken");
const configs = require("../../configs/openai");

const enc = getEncoding("gpt2");

function json_tiktoken_separator(parsedJson) {
  let maxTokens = configs.maxTokens();

  let parts = [];

  let latestPart = "";
  let latestPartTokens = 0;

  let entries = Object.entries(parsedJson);

  for (let index = 0; index < entries.length; index++) {
    let key = entries[index][0];
    let value = entries[index][1];

    let entry = String.raw`("${key}": "${value}")`;

    // console.log("start iteration of " + entry);

    let encoded = enc.encode(entry);

    // console.log("encoded: " + encoded);
    // console.log("encoded length: " + encoded.length);

    let tokensSum = encoded.length + latestPartTokens;

    // console.log("tokens sum: " + tokensSum);

    if (tokensSum >= maxTokens) {
      parts.push(latestPart);

      latestPart = "";
      latestPartTokens = 0;

      index -= 1;

      continue;
    }

    latestPart += entry;
    latestPartTokens += encoded.length;

    if (
      index == entries.length - 1 &&
      latestPart != "" &&
      latestPartTokens < maxTokens
    ) {
      parts.push(latestPart);
    }
  }

  return parts;
}

module.exports = json_tiktoken_separator;

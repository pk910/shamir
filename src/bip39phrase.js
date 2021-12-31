
module.exports = new (function BIP39Phrase() {
  var Mnemonic = require('bip39');
  var Levenshtein = require('fast-levenshtein');
  var Unorm = require('unorm');

  this.parsePhrase = parsePhrase;
  this.buildPhrase = wordArrayToPhrase;
  this.getLanguage = getLanguage;


  function parsePhrase(phrase, skip, validate) {
    if(!skip)
      skip = 0;

    // Preprocess the words
    phrase = normalizeString(phrase);
    var words = phraseToWordArray(phrase);

    // Detect blank phrase
    if (words.length == 0) {
      throw "Blank mnemonic";
    }

    // Check each word
    for (var i=skip; i<words.length; i++) {
      var word = words[i];
      var language = getLanguage(phrase);
      if (Mnemonic.wordlists[language].indexOf(word) == -1) {
        var nearestWord = findNearestWord(word);
        throw word + " not in wordlist, did you mean " + nearestWord + "?";
      }
    }

    if(validate) {
      // Check the words are valid
      var properPhrase = wordArrayToPhrase(words.slice(skip));
      console.log(properPhrase);
      var isValid = Mnemonic.validateMnemonic(properPhrase);
      if (!isValid) {
        throw "Invalid mnemonic";
      }
    }

    return words;
  }

  function normalizeString(str) {
    return Unorm.nfkd(str);
  }
  
  function findNearestWord(word) {
    var language = getLanguage(word);
    var words = Mnemonic.wordlists[language];
    var minDistance = 99;
    var closestWord = words[0];
    for (var i=0; i<words.length; i++) {
      var comparedTo = words[i];
      if (comparedTo.indexOf(word) == 0) {
        return comparedTo;
      }
      var distance = Levenshtein.get(word, comparedTo);
      if (distance < minDistance) {
        closestWord = comparedTo;
        minDistance = distance;
      }
    }
    return closestWord;
  }

  function getLanguage(phrase) {
    return getLanguageFromPhrase(phrase) || "english";
  }

  function getLanguageFromPhrase(phrase) {
    // Check if how many words from existing phrase match a language.
    var language = "";
    if (phrase.length > 0) {
      var words = phraseToWordArray(phrase);
      var languageMatches = {};
      for (l in Mnemonic.wordlists) {
        // Track how many words match in this language
        languageMatches[l] = 0;
        for (var i=0; i<words.length; i++) {
          var wordInLanguage = Mnemonic.wordlists[l].indexOf(words[i]) > -1;
          if (wordInLanguage) {
            languageMatches[l]++;
          }
        }
        // Find languages with most word matches.
        // This is made difficult due to commonalities between Chinese
        // simplified vs traditional.
        var mostMatches = 0;
        var mostMatchedLanguages = [];
        for (var l in languageMatches) {
          var numMatches = languageMatches[l];
          if (numMatches > mostMatches) {
            mostMatches = numMatches;
            mostMatchedLanguages = [l];
          }
          else if (numMatches == mostMatches) {
            mostMatchedLanguages.push(l);
          }
        }
      }
      if (mostMatchedLanguages.length > 0) {
        // Use first language if multiple detected
        language = mostMatchedLanguages[0];
      }
    }
    return language;
  }

  // TODO look at jsbip39 - mnemonic.splitWords
  function phraseToWordArray(phrase) {
    var words = phrase.split(/\s/g);
    var noBlanks = [];
    for (var i=0; i<words.length; i++) {
      var word = words[i];
      if (word.length > 0) {
        noBlanks.push(word);
      }
    }
    return noBlanks;
  }

  // TODO look at jsbip39 - mnemonic.joinWords
  function wordArrayToPhrase(words) {
    var phrase = words.join(" ");
    var language = getLanguageFromPhrase(phrase);
    if (language == "japanese") {
      phrase = words.join("\u3000");
    }
    return phrase;
  }

})();

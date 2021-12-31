
(function() {
  var cliArgs = require('command-line-args');
  var Inquirer = require('inquirer');
  var Chalk = require('chalk');
  var Mnemonic = require('bip39');
  
  var Shamir39 = require('./shamir39');
  var Bip39Phrase = require('./bip39phrase');

  var commandArgs = cliArgs([
    { name: 'quiet', alias: 'q', type: Boolean },
    { name: 'command', defaultOption: true }
  ], { 
    stopAtFirstUnknown: true 
  });
  var command = commandArgs.command || "menu";
  var quiet = commandArgs.quiet || false;
  commandArgs = commandArgs._unknown || [];

  if(!quiet) {
    console.log("##### Shamir39 Tool #####");
    console.log("A tool for converting BIP39 mnemonic phrases to shamir secret sharing scheme parts whilst retaining the benefit of mnemonics.");
    console.log("");
  }

  var shamir39 = new Shamir39();
  runCommand(command);

  function runCommand(command) {
    switch(command) {
      case "menu":
        runMenu();
        break;
      case "combine":
        runCombine();
        break;
      case "split":
        runSplit();
        break;
      default:
        console.log("Unknown command '" + command + "'");
        break;
    }
  }

  function runMenu() {
    Inquirer.prompt([
      {
        type: 'list',
        name: 'command',
        message: 'What do you want to do?',
        default: 'combine',
        choices: [
          {
            name: 'Combine BIP39 Mnemonic from multiple Shares',
            value: 'combine',
          },
          {
            name: 'Split BIP39 Mnemonic to multiple Shares',
            value: 'split',
          },
        ],
      },
    ]).then((menu) => {
      runCommand(menu.command);
    });
  }

  function runCombine() {
    var cmdArgs = cliArgs([
      { name: 'shares', multiple: true, defaultOption: true },
    ], {
      argv: commandArgs
    });

    var shares = [];
    var sharesCount = 0;
    var sharesPromise = Promise.resolve();
    if(cmdArgs.shares && cmdArgs.shares.length) {
      cmdArgs.shares.forEach(function(phrase, idx) {
        sharesPromise = sharesPromise.then(function() {
          return parseSharePhrase(phrase, idx + 1);
        }).then(function(words) {
          shares.push(words);
        });
      });
    }
    sharesPromise.then(collectShares).then(function(shares) {
      var wordlist = Mnemonic.wordlists[shares.language];
      var combinedWords = shamir39.combine(shares.shares, wordlist);
      if('error' in combinedWords) {
        console.log("Error: " + combinedWords.error);
      }
      else {
        var combinedPhrase = Bip39Phrase.buildPhrase(combinedWords.mnemonic);

        if(!quiet) {
          console.log("");
          console.log(Chalk.yellowBright("Combined BIP39 Mnemonic:"));
          console.log("");
        }
        console.log(combinedPhrase);
        if(!quiet) {
          console.log("");
          pauseExit();
        }
      }
    });


    function collectShares() {
      if(shares.length > 0 && sharesCount === 0) {
        // get shares count
        var wordlist = Mnemonic.wordlists[shares[0].lang];
        var shErr = shamir39.combine([ shares[0].words ], wordlist);

        if('error' in shErr && shErr.requiredParts)
          sharesCount = shErr.requiredParts;
      }
      if(sharesCount === 0 || shares.length < sharesCount) {
        return collectSharePhrase().then(function(words) {
          shares.push(words);
        }).then(collectShares);
      }
      
      return {
        language: shares[0].lang,
        shares: shares.map(function(share) {
          return share.words;
        })
      };
    }

    function collectSharePhrase() {
      var shareIdx = shares.length + 1;
      return Inquirer.prompt([
        {
          type: 'input',
          name: 'phrase',
          message: 'Enter Share ' + shareIdx + "/" + (sharesCount ? sharesCount : "*") + ':'
        }
      ]).then(function(res) {
        return parseSharePhrase(res.phrase, shareIdx);
      })
    }

    function parseSharePhrase(phrase, idx) {
      try {
        return {
          words: Bip39Phrase.parsePhrase(phrase, 1, false),
          lang: Bip39Phrase.getLanguage(phrase)
        };
      }
      catch(err) {
        console.log("Invalid Share" + (idx ? " #" + idx : "") + ": " + err);
        return collectSharePhrase();
      }
    }
  }

  function runSplit() {
    var cmdArgs = cliArgs([
      { name: 'phrase', alias: 'p', defaultOption: true, type: String },
      { name: 'min', alias: 'm', type: Number },
      { name: 'num', alias: 'n', type: Number },
    ], {
      argv: commandArgs
    });
    var splitOptions = {
      phrase: cmdArgs.phrase || null,
      min: cmdArgs.min || 0,
      num: cmdArgs.num || 0,
    };

    var questions = [];

    if(!splitOptions.phrase) {
      questions.push({
        type: 'input',
        name: 'phrase',
        message: 'Enter BIP39 Mnemonic:'
      });
    }
    if(!splitOptions.num) {
      questions.push({
        type: 'input',
        name: 'num',
        message: 'Total number of shares:'
      });
    }
    if(!splitOptions.num) {
      questions.push({
        type: 'input',
        name: 'min',
        message: 'Minimum number of shares for reconstruction:'
      });
    }

    var inputPromise;
    if(questions.length)
      inputPromise = Inquirer.prompt(questions);
    else
      inputPromise = Promise.resolve({});
    
    inputPromise.then(function(res) {
      if(res.phrase)
        splitOptions.phrase = res.phrase;
      if(res.min)
        splitOptions.min = parseInt(res.min);
      if(res.num)
        splitOptions.num = parseInt(res.num);

      var shares;
      try {
        var language = Bip39Phrase.getLanguage(splitOptions.phrase);
        var wordlist = Mnemonic.wordlists[language];
        var words = Bip39Phrase.parsePhrase(splitOptions.phrase);
        var shares = shamir39.split(words, wordlist, splitOptions.min, splitOptions.num);
      }
      catch(err) {
        shares = {
          error: err
        };
      }

      if('error' in shares) {
        console.log("Error: " + shares.error);
      }
      else {
        if(!quiet) {
          console.log("");
          console.log("");
        }
        
        shares.mnemonics.forEach(function(share, idx) {
          var sharePhrase = Bip39Phrase.buildPhrase(share);
          console.log((quiet ? "" : Chalk.yellowBright("Share " + (idx+1) + "/" + shares.mnemonics.length + ":") + " ") + sharePhrase);
          if(!quiet)
            console.log("");
        });

        if(!quiet)
          pauseExit();
      }
    });
  }

  function pauseExit() {
    console.log("");
    console.log(Chalk.yellowBright('Press any key to exit'));

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
  }

})();

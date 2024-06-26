#!/usr/bin/env node
/*
Documentation:

term...

looks for searchterms/term.txt

By default, the terms.txt file is am openalex search string. 
- The string can be broken down into multiple lines. 
- The string can be commented shell/python-style with #

The following have special meaning: #- or #OR or #AND.
- For all of these, the following lines will be enclosed in "..." if there is a space in the line.
- For #OR and #AND, the following lines will concatenated with " OR " or " AND " respectively.
- If you use #-, then #OR/#AND is reset, but lines will still be enclosed in "..." if there is a space in the line.

For exmples, see searchterms/ssa.txt and searchterms/test.txt.
*/

const fs = require('fs');
const os = require('os');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
  .option('googlescholar', {
    alias: 'g',
    type: 'boolean',
    description: 'Instead of AND use " "'
  })
  .option('length', {
    alias: 'l',
    type: 'boolean',
    description: 'Show query string length.'
  })
  .option('save', {
    alias: 's',
    type: 'string',
    description: 'Provide a filename where the search strings and expansions are saved. Records are separated by \\x1E'
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Provide a filename where the expanded search term is saved.'
  })
  .option('fail', {
    alias: 'f',
    type: 'boolean',
    description: 'Throw error if a search string does not expand.'
  })
  .command('$0 <query...>', 'Process search query.')
  .demandCommand(1)
  .strict()
  .help()
  .argv;

let output = { "input":  [ ...argv.query ] };
//console.log(output);
let res = searchBuilder(argv, argv.query);
output = { ...output, ...res };
let result = res.searchQuery;
const status = res.status;
if (argv.save) {
  fs.writeFileSync(argv.save, res.querylog);
};
if (argv.length) {
  console.log("#length=" + result.length);
}
if (argv.output) {
  fs.writeFileSync(argv.output, JSON.stringify(output, null, 2));
};
console.log(result);
if (argv.fail && res.status === 'fail') {
  console.log("ERROR: An error occurred while expanding search terms.");
  process.exit(1);
} else {
  process.exit(0);
};

function searchBuilder(argv, query) {
  const separator = '\x1E';
  let querylog = "# Query\n#-\n" + query + "\n" + separator;
  //let isOr = false;
  //let isLastOr = false;
  let searchQuery = '';
  // query = query.split(' ');

  for (let i = 0; i < query.length; i++) {
    //console.log("->"+query[i]);
    if (query[i].match(/(\w+)\.\.\./)) {
      while (query[i].match(/(\w+)\.\.\./)) {
        //console.log("expand: "+query[i]);
        const key = query[i].match(/(\w+)\.\.\./)[1];
        // open a file
        querylog += `# Term: ${key}\n`;
        let file = 'searchterms/' + key + '.txt';
        if (!fs.existsSync(file)) {
          file = `${os.homedir()}/.config/openalex-cli/searchterms/${key}.txt`;
        }
        querylog += `# File: ${file}\n`;
        // TODO: Throw error if file does not exist
        if (!fs.existsSync(file)) {
          querylog += `# error: Did not find expanded terms.\n`;
          // console.log(argv);
          if (argv.fail) {
            return { searchQuery, querylog, status: "fail" };
          };
        };
        //console.log("f="+file);
        let result = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : key;
        querylog += `# Result\n#-\n${result}\n` + separator;
        // split result into an array by new line
        const resultarr = result.split(/\r?\n/);
        result = '';
        let operator = '';
        let useoperator = false;
        // remove comments from results file
        for (let j = 0; j < resultarr.length; j++) {
          //console.log("->"+resultarr[j]);
          if (resultarr[j].match(/\#(OR|AND)\s*$/)) {
            operator = ' ' + resultarr[j].match(/\#(OR|AND)\s*$/)[1] + ' ';
            /* if (resultarr[j].match(/\#(OR|AND)\s*$/)[1] == 'AND' && argv.googlescholar) {
              operator = ' ';
            } */
            // console.log('operator: ' + operator);
            useoperator = true;
          }
          if (resultarr[j].match(/\#(\-)\s*$/)) {
            useoperator = true;
            operator = ' ';
            console.log('operator empty.');
          }
          const term = sanitise(resultarr[j].replace(/\#.+$/g, ''));
          if (term != '') {
            result +=
              (result.match(/[\w\"\)]\s+$/) && !term.match(/^\s*\)/) ? operator : '') +
              (useoperator ? quoteIfNeeded(term) : term) +
              ' ';
          }
        }
        querylog += `# Term: ${key}\n# Expanded result\n#-\n${result}\n` + separator;
        query[i] = query[i].replace(RegExp(key + '\\.\\.\\.'), result);
        //console.log(result);
      }
    } else {
      // console.log('add: ' + query[i]);
      query[i] = quoteIfNeeded(query[i]);
    }
  }
  searchQuery = query.join(' ');  
  // Allow use of [ and ] instead of ( and ).
  searchQuery = searchQuery.replace(/\[/gs, '(');
  searchQuery = searchQuery.replace(/\]/gs, ')');
  //console.log('Final query: ' + searchQuery);
  querylog += `# Final query\n#-\n${searchQuery}\n` + separator;  
  if (argv.googlescholar) {
    searchQuery = searchQuery.replace(/AND/g, ' ');
  };
  return { searchQuery, querylog, status: "success" };
}

function sanitise(str) {
  let term = str;
  term = term.replace(/\t+/gs, ' ');
  term = term.replace(/ +/gs, ' ');
  term = term.replace(/^ +/gs, '');
  term = term.replace(/ +$/gs, '');
  return term;
}

function quoteIfNeeded(term) {
  if (term.match(/ /) && !term.match(/^\".*\"$/)) {
    term = `"${term}"`;
  }
  return term;
}


/*
export async function parseTitle(title: string[]) {
  // Transform the array into an object
  const query = title.reduce((acc: any, term: string, index: number) => {
    if (term === 'AND' || term === 'OR') {
      acc[`operator${index}`] = term;
    } else {
      // if term is one word and have dot in the end, add it to keys
      if (term.split('.').length > 1) {
        acc[`key${index}`] = term;
      } else {
        acc[`term${index}`] = term;
      }
    }

    return acc;
  }, {});

  return query;
}


// extract key from json file
export function extractKey(key: string, path: string = '../../searchterms.json') {
  const keys = require(path);
  // remove dot from the end of the key
  if (key.split('.').length > 1) {
    key = key.slice(0, -1);
  }

  return keys[key];
}

// search builder
export function searchBuilder_old(query: any) {
  //let isOr = false;
  //let isLastOr = false;
  const keys = Object.keys(query);
  let searchQuery = '';
  for (let i = 0; i < keys.length; i++) {
    console.log("->"+query[keys[i]]);'search [searchstring...]',
    // check if the next element is an operator 'OR'
    if (keys[i + 1] && query[keys[i + 1]] === 'OR') {
      isOr = true;
      searchQuery += `(`;
    } 
    if (keys[i].includes('key')) {
      searchQuery += extractKey(query[keys[i]]);
    } else if (keys[i].includes('term')) {
      searchQuery += ` ${query[keys[i]]} `;
    } else if (keys[i].includes('operator')) {
      if (query[keys[i]] === 'AND') searchQuery += ' AND ';
      else if (query[keys[i]] === 'OR') {
        // searchQuery = `(${searchQuery})`;
        searchQuery += ` ${query[keys[i]]} `;
        //isLastOr = true;
      }
    }
    if (isOr && query[keys[i]] !== 'OR' && isLastOr) {
      searchQuery += `)`;
      isOr = false;
      isLastOr = false;
    }
  }
  console.log(searchQuery);
  return searchQuery;
}
*/

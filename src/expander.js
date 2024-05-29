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

fs = require('fs');
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
  .command('$0 <query...>', 'Process search query.')
  .demandCommand(1)
  .strict()
  .help()
  .argv;

let result = searchBuilder(argv.query);
if (argv.googlescholar) {
  result = result.replace(/AND/g, ' ');
};
if (argv.length) {
  console.log("#length=" + result.length);
}
console.log(result);

function searchBuilder(query) {
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
        let file = 'searchterms/' + key + '.txt';
        if (!fs.existsSync(file)) {
          file = `${os.homedir()}/.config/openalex-cli/searchterms/${key}.txt`;
        }
        // TODO: Throw error if file does not exist
        //console.log("f="+file);
        let result = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : key;
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
  return searchQuery;
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

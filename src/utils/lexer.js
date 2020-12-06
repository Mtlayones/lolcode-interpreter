// list of the lexemes
import { listoflexemes } from './lexemes'

// lexer function that takes a line of string
const lexer =(lines)=> { 
    // check if there is unnecessary whitespace between the keywords, literals and identifiers
    if (lines.trim().split(" ").includes("")){
       return [1,"Extra Whitespace"]
    }
    // initialization
    let tokens = [];    
    let temp;
    let line = lines.trim();
    let valid;
    // while the line string is empty
    while(line != ""){
        valid = false;
        // iterate over the list of lexemes
        for (lexeme of listoflexemes){
            // temporary updated line if there first substring matches the lexeme
            temp = line.replace(lexeme[0],"");
            // if the it does not match continue
            if(line==temp) continue;
            // push to the stack the if matches
            tokens.push({
                class: lexeme[1][0],
                description: lexeme[1][1],
                value: lexeme[0].exec(line)[0].trim()
            })
            // update the line
            line = line.replace(lexeme[0],"");
            valid = true
            break;
        }
        // if there is no match operation
        if(!valid) return [1, "Invalid Operation"]
    }
    return [0, tokens];
}
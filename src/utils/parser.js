const lexemes = require('./lexemes.js')
const fs = require('fs'); 
const keywords = lexemes.keywords
const literal = lexemes.literals
const identifier = lexemes.identifier
const types = lexemes.types

// inline comment abstraction //optimized
const inline_comment_abs = (code, tableOfLexemes,lineNumber)=>{
    let placeholder = code[0].shift();
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]})
    // if there is comment after BTW
    if(code[0].length != 0){
        placeholder = code[0].join(" ")
        tableOfLexemes.push({value:placeholder,description:'Comment'}) 
        code[0] = [];
    }
    return [code, tableOfLexemes, lineNumber];
}

// multiline comment abstraction //optimized
const multiline_comment_abs = (code, tableOfLexemes, lineNumber) =>{
    let placeholder = code[0].shift();
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]})
    // getting all the comment before the line of TLDR
    while(!code[0].includes('TLDR')){
        placeholder = code[0].join(" ").trim();
        if(placeholder != ""){
            tableOfLexemes.push({value:placeholder,description:'Comment'});
        }
        code.shift();
        tableOfLexemes.push({value:'\n',description:'Line Break'});
        // if there is no TLDR present in the code
        if(code.length == 0) return `Syntax Error in line ${lineNumber}: Expected end of Multi-Line Comment.`;
        code[0]=code[0].trim().split(" ");
        lineNumber++;
    }
    const indexTLDR = code[0].indexOf("TLDR");
    // if there is comment before TLDR
    if(indexTLDR != 0){
        placeholder = code[0].slice(0,indexTLDR).join(" ").trim();
        tableOfLexemes.push({value:placeholder,description:'Comment'});
    }
    tableOfLexemes.push({value:'TLDR',description:keywords['TLDR'][1]});
    code[0] = code[0].slice(indexTLDR+1,code[0].length).join(" ").trim().split();
    return [code, tableOfLexemes, lineNumber];
}

// literal abstraction //optimized
const literal_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift(),change = true;
    if(literal["NUMBAR"][0].test(placeholder)){
        tableOfLexemes.push({value:placeholder, description: literal["NUMBAR"][1]});
    }else if(literal["NUMBR"][0].test(placeholder)){
        tableOfLexemes.push({value:placeholder, description: literal["NUMBR"][1]});
    }else if(literal["YARN"][0].test(placeholder)){
        tableOfLexemes.push({value:placeholder, description: literal["YARN"][1]});
    }else if(literal["TROOF"][0].test(placeholder)){
        tableOfLexemes.push({value:placeholder, description: literal["TROOF"][1]});
    }else{
        code[0].unshift(placeholder);
        change = false;
    }
    return [code,tableOfLexemes, lineNumber,change];
}

// identifier abstraction //optimized
const identifier_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder;
    placeholder = code[0].shift();
    if(keywords[placeholder] || ["WIN","FAIL"].includes(placeholder) || !identifier[0].test(placeholder)){
        return `Syntax Error in line ${lineNumber}: Expected Identifier: ${placeholder}.`;
    }else{
        tableOfLexemes.push({value:placeholder, description: identifier[1]});
    }
    return [code,tableOfLexemes, lineNumber];
}

// operands abstraction
const operands_abs = (code,tableOfLexemes,lineNumber,type) => {
    let error;
    // literal
    [code,tableOfLexemes, lineNumber, changed] = literal_abs(code,tableOfLexemes,lineNumber);
    // expression
    if(!changed){
        error = expression_abs(code,tableOfLexemes,lineNumber,type);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber, changed] = error;
    }
    // identifier
    if(!changed){
        error = identifier_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }
    return [code,tableOfLexemes, lineNumber];
}

// output abstraction //optimized
const output_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift() , nonewline = "", error;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    while(true){
        if(tableOfLexemes[tableOfLexemes.length-1].value == "VISIBLE" && (code[0].join(" ").trim().split(" ")[0] == "BTW" || code[0].length == 0)){
            return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
        }else if(code[0].join(" ").trim().split(" ")[0] == "BTW" || code[0].length == 0){
            break;
        }else if(code[0].join(" ").trim().split(" ")[0] == "!"){
            // no new line encountered
            code[0] = code[0].join(" ").trim().split(" ");
            code[0].shift()
            tableOfLexemes.push({value:"!",description:"No newline output"});
            continue;
        }else if(tableOfLexemes[tableOfLexemes.length-1].value == "!" && code.length != 0){
            // if there is operation after ! beside inline comment
            return `Syntax Error in line ${lineNumber}: Expected end of Expression: ${code[0].join(" ").trim()}.`;
        }else if(code[0][0] == ""){
            // if there is exceeding whitespace in between the operation
            return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
        }
        // no new line encountered beside an operand
        if(code[0][0][code[0][0].length-1] == "!"){
            nonewline = "!";
            code[0][0] = code[0][0].slice(0,code[0][0].length-1);     
        }
        //operands
        error = operands_abs(code,tableOfLexemes,lineNumber, true);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
        // push no new line
        if(nonewline == "!"){
            tableOfLexemes.push({value:"!",description:"No newline output"});
        }
    }
    return [code,tableOfLexemes, lineNumber];
}

// input abstraction //optimized
const input_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift();
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    if(code[0].length == 0){
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
    }
    if(code[0][0] == ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    // identifier
    const error = identifier_abs(code,tableOfLexemes,lineNumber);
    // check if error
    if(!Array.isArray(error)) return error;
    [code,tableOfLexemes, lineNumber] = error;
    return [code,tableOfLexemes, lineNumber];
}

// variable initialization //optimized
const initialization_var_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift(),error;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    if(code[0].length == 0){
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
    }
    if(code[0][0] == ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    if(code[0][0] == "A" ){
        //type init
        error = type_init_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }else{
        //operands
        error = operands_abs(code,tableOfLexemes,lineNumber, true);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }
    return [code,tableOfLexemes, lineNumber];
}

// variable declaration //optimized
const declaration_var_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift();
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    if(code[0].length == 0){
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
    }
    if(code[0][0] == ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    // identifier
    let error = identifier_abs(code,tableOfLexemes,lineNumber);
    // check if error   
    if(!Array.isArray(error)) return error;
    [code,tableOfLexemes, lineNumber] = error;
    tableOfLexemes[tableOfLexemes.length-1].description = "Variable Identifier";
    // if special IT identifier
    if(tableOfLexemes[tableOfLexemes.length-1].value == "IT"){
        placeholder = tableOfLexemes.pop();
        return `Syntax Error in line ${lineNumber}: ${placeholder.value} is a Special Identifier.`;
    }
    if(code[0][0] == ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    if(code[0][0] == "ITZ"){
        // initialization
        error = initialization_var_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }
    return [code,tableOfLexemes, lineNumber];
}

// variable assignment //optimized
const assignment_var_abs = (code,tableOfLexemes,lineNumber)=>{
    let placeholder;
    // identifier
    let error = identifier_abs(code,tableOfLexemes,lineNumber);
    // check if error
    if(!Array.isArray(error)) return error;
    [code,tableOfLexemes, lineNumber] = error;
    if(code[0][0] == ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }else if(code[0][0] == "R"){
        placeholder = code[0].shift();
        tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});  
    }else{
        // if inproper use of R
        return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
    }
    if(code[0].length == 0){
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
    }
    if(code[0][0] == ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    if(code[0][0] == "MAEK"){
        //operands
        error = typecast_expr_abs(code,tableOfLexemes,lineNumber, true);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }else{
        //operands
        error = operands_abs(code,tableOfLexemes,lineNumber, true);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }
    return [code,tableOfLexemes, lineNumber];
}

// arithmetic recursion //optimized
const arithmetic_recurse_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift();
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    let i,error;
    for (i = 0; i < 3; i++){
        if(code[0].length == 0){
            return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
        }
        if(code[0][0] == ""){
            // if there is exceeding whitespace in between the operation
            return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
        }
        if(i != 1){
            //operands
            error = operands_abs(code,tableOfLexemes,lineNumber, true);
            // check if error
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
        }else if(code[0][0] == "AN"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
        }else{
            // if inproper use of AN
            return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
        }
    }
    return [code,tableOfLexemes, lineNumber];
}

// boolean operations op abstraction  //optimized
const boolean_operands_abs = (code, tableOfLexemes, lineNumber, type) => {
    let error, changed = false;
    if(code[0][1] && keywords[[code[0][0],code[0][1]].join(" ")] && keywords[[code[0][0],code[0][1]].join(" ")][0] == "Boolean"){
        // boolean operations
        code[0].unshift([code[0].shift(),code[0].shift()].join(" "));
        error = boolean_recurse_abs(code,tableOfLexemes,lineNumber);
        changed = true;
    }else if(code[0][0] == "NOT"){
        // not operations
        error = boolean_recurse_abs(code,tableOfLexemes,lineNumber);
        changed = true;
    }else if(type && code[0][1] && keywords[[code[0][0],code[0][1]].join(" ")] && keywords[[code[0][0],code[0][1]].join(" ")][0] == "Boolean Many"){
        // boolean many operations
        code[0].unshift([code[0].shift(),code[0].shift()].join(" "));
        error = boolean_many_recurse_abs(code,tableOfLexemes,lineNumber);
        changed = true;
    }else if(keywords[code[0][0]] && keywords[code[0][0]][0] == 'Comparison'){
        // comparison different
        error = comparison_abs(code,tableOfLexemes,lineNumber);
        changed = true;
    }else if(code[0][1]=="SAEM" && (keywords[[code[0][0],code[0][1]].join(" ")][0] == "Comparison")){
        // comparison same
        code[0].unshift([code[0].shift(),code[0].shift()].join(" "));
        error = comparison_abs(code,tableOfLexemes,lineNumber);
        changed = true;
    }
    if(changed){
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }
    return [code,tableOfLexemes, lineNumber,changed];
}

// boolean recursion abstraction //optimized
const boolean_recurse_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift(),i,error;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    if(tableOfLexemes[tableOfLexemes.length - 1].value == "NOT"){
        if(code[0].length == 0){
            return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
        }
        if(code[0][0] == ""){
            // if there is exceeding whitespace in between the operation
            return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
        }
        //operands
        error = operands_abs(code,tableOfLexemes,lineNumber, true);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }else{
        for (i = 0; i < 3; i++){
            if(code[0].length == 0){
                return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
            }
            if(code[0][0] == ""){
                // if there is exceeding whitespace in between the operation
                return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
            }
            if(i != 1){
                //operands
                error = operands_abs(code,tableOfLexemes,lineNumber, true);
                // check if error
                if(!Array.isArray(error)) return error;
                [code,tableOfLexemes, lineNumber] = error;
            }else if(code[0][0] == "AN"){
                placeholder = code[0].shift();
                tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            }else{
                // if inproper use of AN
                return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
            }
        }
    }
    return [code,tableOfLexemes, lineNumber];
}

// boolean many recursion abstraction //optimized
const boolean_many_recurse_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift(),error,cnt=0;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    while(tableOfLexemes[tableOfLexemes.length-1].value != "MKAY"){
        if(code[0].length == 0 && ["ANY OF","AN","ALL OF"].includes(tableOfLexemes[tableOfLexemes.length-1].value)){
            return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
        }
        if(code[0][0] == ""){
            // if there is exceeding whitespace in between the operation
            return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
        }
        if(["ANY OF","AN","ALL OF"].includes(tableOfLexemes[tableOfLexemes.length-1].value)){
            //operands
            error = operands_abs(code,tableOfLexemes,lineNumber, false);
            // check if error
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
            cnt ++;
        }else if(code[0][0] == "AN"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
        }else if(cnt>=2 && code[0][0] == "MKAY"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
        }else{
            return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
        }
    }
    return [code,tableOfLexemes, lineNumber];
}

// comparison abstraction //optimized
const comparison_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift(),i, error;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    for (i = 0; i < 3; i++){
        if(code[0].length == 0){
            return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
        }
        if(code[0][0] == ""){
            // if there is exceeding whitespace in between the operation
            return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
        }
        if(i != 1){
            //operands
            error = operands_abs(code,tableOfLexemes,lineNumber, true);
            // check if error
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
        }else if(code[0][0] == "AN"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
        }else{
            // if inproper use of AN
            return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
        }
    }
    return [code,tableOfLexemes, lineNumber];
}

// expression abstraction //optimized
const expression_abs = (code, tableOfLexemes, lineNumber, type) => {
    let error,changed = true;
    if(code[0][1] && keywords[[code[0][0],code[0][1]].join(" ")] && (keywords[[code[0][0],code[0][1]].join(" ")][0] == "Arithmetic")){
        // arithmetic
        code[0].unshift([code[0].shift(),code[0].shift()].join(" "));
        error = arithmetic_recurse_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }else if(keywords[code[0][0]] && keywords[code[0][0]][0] == 'Concat'){
        // concat
        error = concat_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }else{
        // boolean operations
        error = boolean_operands_abs(code,tableOfLexemes,lineNumber,type);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber,changed] = error;
    }
    return [code,tableOfLexemes, lineNumber,changed]
}

// concatenation abstraction //optimized
const concat_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift(),error,cnt = 0;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    while(tableOfLexemes[tableOfLexemes.length-1].value != "MKAY"){
        if(code[0].length == 0 && ["AN","SMOOSH"].includes(tableOfLexemes[tableOfLexemes.length-1].value)){
            // lacking operand after AN
            return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
        }
        if(cnt < 2 && code[0].join(" ").trim().split(" ")[0] == "BTW"){
            return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
        }else if(cnt >= 2 && tableOfLexemes[tableOfLexemes.length-1].value != "AN" && code[0].join(" ").trim().split(" ")[0] == "BTW" ){
            break;
        }
        if(code[0][0] == ""){
            // if there is exceeding whitespace in between the operation
            return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
        }
        if(["AN","SMOOSH"].includes(tableOfLexemes[tableOfLexemes.length-1].value)){
            //operands
            error = operands_abs(code,tableOfLexemes,lineNumber, true);
            // check if error
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
            cnt++;
        }else if(code[0][0] == "AN"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
        }else{
            if(code[0][0] == "MKAY" && cnt>=2){
                placeholder = code[0].shift();
                tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            }else if(cnt>=2){
                break;
            }else{
                // if only one operand present
                return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
            }
        }
    }
    return [code,tableOfLexemes, lineNumber];
} 

// if else abstraction //optimized
const if_else_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift(), if_active = false,else_active = false,end=false,error;
    placeholder = placeholder.slice(0,placeholder.length-1);
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    tableOfLexemes.push({value:"?",description:'Control Flow Delimiter'});
    while(!end){
        if(code.length == 0){
            return `Syntax Error in line ${lineNumber-1}: Expected End of Flow Control.`;
        }
        if(code[0].length == 0){
            // encounter new line
            code.shift();
            lineNumber++;
            tableOfLexemes.push({value:'\n',description:'Line Break'});
            if(code.length != 0){
                code[0]=code[0].trim().split(" ");
                error = yarn_token_abs(code,lineNumber);
                if(!Array.isArray(error)) return error;
                [code, lineNumber] = error;
            }
            continue;
        }else if (code[0][1] && [code[0][0],code[0][1]].join(" ") == "YA RLY" && !if_active){
            placeholder = [code[0].shift(),code[0].shift()].join(" ");
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            if_active = true;
        }else if(code[0][0] == "MEBBE" && if_active && !else_active){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            if(code[0].length == 0){
                return `Syntax Error in line ${lineNumber}: Missing Operation after ${placeholder}.`;
            }
            if(code[0][0] == ""){
                // if there is exceeding whitespace in between the operation
                return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
            }
            //operands
            error = operands_abs(code,tableOfLexemes,lineNumber, true);
            // check if error
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;   
        }else if(code[0][1] && [code[0][0],code[0][1]].join(" ") == "NO WAI" && if_active && !else_active){
            placeholder = [code[0].shift(),code[0].shift()].join(" ");
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            else_active = true;
        }else if(code[0][0] == "OIC" && else_active){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            end = true;
        }else if(if_active){
            error = statement_abs(code,tableOfLexemes,lineNumber);
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
        }
        if(code[0].join(" ").trim().split(" ")[0] == "BTW"){
            // inline comment
            [code,tableOfLexemes, lineNumber] = inline_comment_abs(code,tableOfLexemes,lineNumber);
        }else if(tableOfLexemes[tableOfLexemes.length - 1].value == "\n" && code[0][0] == 'OBTW'){
            // multiline comment
            error = multiline_comment_abs(code,tableOfLexemes,lineNumber);
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
        }else if(code[0].length != 0 && !if_active){
            // if there is no if
            return `Syntax Error in line ${lineNumber}: Expected start of Flow Control: ${code[0].join(" ").trim()}.`;
        }else if(code[0].length != 0){
            // if there is operation after the identifier
            return `Syntax Error in line ${lineNumber}: Expected end of Expression: ${code[0].join(" ").trim()}.`;
        }
    }
    return [code,tableOfLexemes, lineNumber];
}

// Switch Case Abstraction //optimized
const switch_case_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift(),start_active = false,default_active = false,end =false,error;
    placeholder = placeholder.slice(0,placeholder.length-1);
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    tableOfLexemes.push({value:"?",description:'Control Flow Delimiter'});
    while(!end){
        if(code.length == 0){
            return `Syntax Error in line ${lineNumber-1}: Expected End of Flow Control.`;
        }
        if(code[0].length == 0){
            // encounter new line
            code.shift();
            lineNumber++;
            tableOfLexemes.push({value:'\n',description:'Line Break'});
            if(code.length != 0){
                code[0]=code[0].trim().split(" ");
                error = yarn_token_abs(code,lineNumber);
                if(!Array.isArray(error)) return error;
                [code, lineNumber] = error;
            }
            continue;
        }else if(code[0][0] == "OMG"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            if(code[0].length == 0){
                return `Syntax Error in line ${lineNumber}: Missing Operation after ${placeholder}.`;
            }
            if(code[0][0] == ""){
                // if there is exceeding whitespace in between the operation
                return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
            }
            //operands
            error = operands_abs(code,tableOfLexemes,lineNumber, true);
            // check if error
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
            start_active = true;   
        }else if(code[0][0] == "OMGWTF" && start_active && !default_active){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            default_active = true;
        }else if(code[0][0] == "OIC" && default_active){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            end = true;
        }else if(code[0][0] == "GTFO" && start_active){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
        }else if(start_active || default_active){
            error = statement_abs(code,tableOfLexemes,lineNumber);
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
        }
        if(code[0].join(" ").trim().split(" ")[0] == "BTW"){
            // inline comment
            [code,tableOfLexemes, lineNumber] = inline_comment_abs(code,tableOfLexemes,lineNumber);
        }else if(tableOfLexemes[tableOfLexemes.length - 1].value == "\n" && code[0][0] == 'OBTW'){
            error = multiline_comment_abs(code,tableOfLexemes,lineNumber);
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
        }else if(code[0].length != 0 && !start_active){
            return `Syntax Error in line ${lineNumber}: Expected start of Flow Control: ${code[0].join(" ").trim()}.`;
        }else if(code[0].length != 0){
            // if there is operation after the identifier
            return `Syntax Error in line ${lineNumber}: Expected end of Expression: ${code[0].join(" ").trim()}.`;
        }
    }
    return [code,tableOfLexemes, lineNumber];
}

// loop abstraction
const loop_abs = (code, tableOfLexemes, lineNumber) => {
    let placeholder = code[0].shift(),error,end=false;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    if(code[0].length == 0){
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${placeholder}.`;
    }
    if(code[0][0] == ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    // for the name of the loop with the YR before
    if(code[0][0] == "YR"){
        placeholder = code[0].shift();
        tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
        // identifier
        error = identifier_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
        tableOfLexemes[tableOfLexemes.length-1].description = "Loop Identifier";
        if(code[0].length == 0){
            return `Syntax Error in line ${lineNumber}: Missing Operands after ${placeholder}.`;
        }
        if(code[0][0] == ""){
            // if there is exceeding whitespace in between the operation
            return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
        }
        // increment or decrement with the UPPIN and the NERFIN
        if(code[0][0] == "UPPIN" | code[0][0] == "NERFIN"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            if(code[0].length == 0){
                return `Syntax Error in line ${lineNumber}: Missing Operands after ${placeholder}.`;
            }
            if(code[0][0] == ""){
                // if there is exceeding whitespace in between the operation
                return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
            }
            // variable to be incremented with YR before
            if(code[0][0] == "YR"){
                placeholder = code[0].shift();
                tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
                // identifier
                error = identifier_abs(code,tableOfLexemes,lineNumber);
                // check if error
                if(!Array.isArray(error)) return error;
                [code,tableOfLexemes, lineNumber] = error;
                // the conditionals in the loop
                if(code[0][0] == "TIL" | code[0][0] == "WILE"){
                    placeholder = code[0].shift();
                    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
                    if(code[0].length == 0){
                        return `Syntax Error in line ${lineNumber}: Missing Operands after ${placeholder}.`;
                    }
                    if(code[0][0] == ""){
                        // if there is exceeding whitespace in between the operation
                        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
                    }
                    // the condition
                    //operands
                    error = operands_abs(code,tableOfLexemes,lineNumber, true);
                    // check if error
                    if(!Array.isArray(error)) return error;
                    [code,tableOfLexemes, lineNumber] = error;
                    // body of the loop
                    while(!end){
                        if(code.length == 0){
                            return `Syntax Error in line ${lineNumber-1}: Expected End of the Loop.`;
                        }
                        if(code[0].length == 0){
                            // encounter new line
                            code.shift();
                            lineNumber++;
                            tableOfLexemes.push({value:'\n',description:'Line Break'});
                            if(code.length != 0){
                                code[0]=code[0].trim().split(" ");
                                error = yarn_token_abs(code,lineNumber);
                                if(!Array.isArray(error)) return error;
                                [code, lineNumber] = error;
                            }
                            continue;
                        }else if(code[0][1] && [code[0][0],code[0][1]].join(" ") == "IM OUTTA"){
                            // loop code delimiter
                            placeholder = [code[0].shift(),code[0].shift()].join(' ');
                            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
                            if(code[0].length == 0){
                                return `Syntax Error in line ${lineNumber}: Missing Operands after ${placeholder}.`;
                            }
                            if(code[0][0] == ""){
                                // if there is exceeding whitespace in between the operation
                                return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
                            }
                            // name of the loop after the YR
                            if(code[0][0] == "YR"){
                                placeholder = code[0].shift();
                                tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
                                if(code[0].length == 0){
                                    return `Syntax Error in line ${lineNumber}: Missing Operands after ${placeholder}.`;
                                }
                                if(code[0][0] == ""){
                                    // if there is exceeding whitespace in between the operation
                                    return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
                                }
                                // identifier
                                error = identifier_abs(code,tableOfLexemes,lineNumber);
                                // check if error
                                if(!Array.isArray(error)) return error;
                                [code,tableOfLexemes, lineNumber] = error;
                            }else{
                                return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
                            }
                            end = true
                        }else{
                            // body of the loop
                            error = statement_abs(code,tableOfLexemes,lineNumber);
                            if(!Array.isArray(error)) return error;
                            [code,tableOfLexemes, lineNumber] = error;
                        }
                        if(code[0].join(" ").trim().split(" ")[0] == "BTW"){
                            // inline comment
                            [code,tableOfLexemes, lineNumber] = inline_comment_abs(code,tableOfLexemes,lineNumber);
                        }else if(code[0].length != 0){
                            // if there is operation after the identifier
                            return `Syntax Error in line ${lineNumber}: Expected end of Expression: ${code[0].join(" ").trim()}.`;
                        }
                    }
                }else{
                    return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
                }
            }else{
                return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
            }
        }else{
            return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
        }
    }else{
        return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
    }
    return [code,tableOfLexemes, lineNumber];
}

// statement abstraction //optimized
const statement_abs = (code,tableOfLexemes,lineNumber) => {
    let error,changed = true;
    [code,tableOfLexemes, lineNumber, changed] = literal_abs(code,tableOfLexemes,lineNumber);
    if(!changed){
        error = expression_abs(code,tableOfLexemes,lineNumber, true);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber, changed] = error;
    }
    if(!changed){
        changed = true;
        if(code[0][0] == "BTW"){
            error = inline_comment_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0][0] == "OBTW"){
            error = multiline_comment_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0][0] == "VISIBLE"){
            error = output_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0][0] == "GIMMEH"){
            error = input_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0][1] && code[0][2] && keywords[[code[0][0],code[0][1],code[0][2]].join(" ")] && (keywords[[code[0][0],code[0][1],code[0][2]].join(" ")][0] == "Declare Var")){
            code[0].unshift([code[0].shift(),code[0].shift(),code[0].shift()].join(" "));
            error = declaration_var_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0].includes("R")){
            error = assignment_var_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0][1] && keywords[[code[0][0],code[0][1].slice(0,code[0][1].length-1)].join(" ")] && (keywords[[code[0][0],code[0][1].slice(0,code[0][1].length-1)].join(" ")][0] == "If-Else")){
            code[0].unshift([code[0].shift(),code[0].shift()].join(" "));
            error = if_else_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0][1] && keywords[[code[0][0],code[0][1]].join(" ")] && (keywords[[code[0][0],code[0][1]].join(" ")][0] == "Loop")){
            code[0].unshift([code[0].shift(),code[0].shift()].join(" "));
            error = loop_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0][0] == "WTF?"){
            error = switch_case_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0][0] == "MAEK"){
            error = typecast_expr_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0].join(' ').includes("IS NOW")){
            error = typecast_var_abs(code,tableOfLexemes,lineNumber);
        }else if(["TLDR","OIC"].includes(code[0][0])){
            return `Syntax Error in line ${lineNumber}: Expected Starting Flow-Control Structure: ${code[0].join(" ").trim()}.`;
        }else{
            changed = false;
        }
        if(changed){
            // check if error
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
            if(code.length == 0){
                return [code,tableOfLexemes, lineNumber];
            }
        }
    }
    if(!changed){
        // identifier
        error = identifier_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;            
    }
    if(code[0].length != 0){
        if(code[0].join(" ").trim().split(" ")[0] == "BTW"){
            code[0] = code[0].join(" ").trim().split(" ");
            // inline comment
            [code,tableOfLexemes, lineNumber] = inline_comment_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0].length != 0){
            // if there is operation after the identifier
            return `Syntax Error in line ${lineNumber}: Expected end of Expression: ${code[0].join(" ").trim()}.`;
        }
    }
    return [code,tableOfLexemes, lineNumber]; 
}

// type casting of expression //optimized
const typecast_expr_abs = (code, tableOfLexemes, lineNumber) =>{
    let placeholder = code[0].shift();
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    if(code[0].length == 0){
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${placeholder}.`;
    }
    if(code[0][0] == ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    //operands
    error = operands_abs(code,tableOfLexemes,lineNumber, true);
    // check if error
    if(!Array.isArray(error)) return error;
    [code,tableOfLexemes, lineNumber] = error;
    // typecasting to data type
    if(code[0][0] == "A" ){
        //type init
        error = type_init_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }else{
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length - 1].value}.`;
    }
    return [code,tableOfLexemes, lineNumber];
}

// type casting of var
const typecast_var_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder;
    // identifier
    let error = identifier_abs(code,tableOfLexemes,lineNumber);
    // check if error
    if(!Array.isArray(error)) return error;
    [code,tableOfLexemes, lineNumber] = error;
    if(code[0][0] == ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }else if(code[0][1] && [code[0][0],code[0][1]].join(" ") == "IS NOW"){
        placeholder = [code[0].shift(),code[0].shift()].join(' ');
        tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});  
    }else{
        // if inproper use of IS NOW
        return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
    }
    // typecasting to data type
    if(code[0][0] == "A" ){
        //type init
        error = type_init_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }else{
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length - 1].value}.`;
    }
    return [code,tableOfLexemes, lineNumber];
}

// type initialization abstraction //optimized
const type_init_abs = (code, tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift();
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    if(code[0].length == 0){
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${placeholder}.`;
    }
    if(code[0][0] == ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    if(types[code[0][0]]){
        // data types
        placeholder = code[0].shift();
        tableOfLexemes.push({value:placeholder,description:types[placeholder][1]});
    }else{
        return `Syntax Error in line ${lineNumber}: Expected Data Type`;
    }
    return [code,tableOfLexemes, lineNumber];
}

// yarn tokenizer and joiner abs
const yarn_token_abs = (code,lineNumber) => {
    let index1,index2;
    while(true){
        index1 = code[0].findIndex((word)=>literal["YARN1"][0].test(word));
        if(index1 == -1) break;
        index2 = code[0].findIndex((word,index)=>((literal["YARN2"][0].test(word) || /(^[\"\'][^\"\']*[\"\']\!$)/.test(word)) && index != index1));
        if(index2>-1){
            code[0][index1] = code[0].slice(index1,index2+1).join(" ");
            code[0] = code[0].slice(0,index1+1).concat(code[0].slice(index2+1,code[0].length));
        }else{
            // if lacking closing "
            return `Syntax Error in line ${lineNumber}: Unexpected Sequence: ${code[0].slice(index1,code[0].length).join(" ").trim()}.`;
        }
    }
    return [code,lineNumber];
}

// start program 
const program_abs = (code,tableOfLexemes,lineNumber) =>{
    let start = false, end = false,placeholder,error;
    code = code.split("\n");
    while(code.length !=0 ){
        if(!Array.isArray(code[0])){
            // new line of code encountered
            code[0] = code[0].trim().split(" ");
            // when there is no content in the line
            if(code[0][0] == ''){
                code[0].shift();
                lineNumber++;
                continue;
            }
            // yarn tokenizer
            error = yarn_token_abs(code,lineNumber);
            if(!Array.isArray(error)) return error;
            [code, lineNumber] = error;
            continue;
        }else if(code[0].length == 0){
            // if new line encountered
            code.shift();
            lineNumber++;
            tableOfLexemes.push({value:'\n',description:'Line Break'});
            continue;
        }
        if(code[0].join(" ").trim().split(" ")[0] == "BTW"){
            // inline comment
            [code,tableOfLexemes, lineNumber] = inline_comment_abs(code,tableOfLexemes,lineNumber);
            continue;
        }else if((!start || (end && tableOfLexemes[tableOfLexemes.length-1].value == "\n")) && code[0][0] == 'OBTW'){
            // multiline comment
            error = multiline_comment_abs(code,tableOfLexemes,lineNumber);
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
            continue;
        }
        if(!start && code[0][0] == "HAI"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            start = true;
        }else if(start && code[0][0] == "KTHXBYE"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            end = true;
        }else if(start && !end){
            // main body of the program
            error = statement_abs(code,tableOfLexemes,lineNumber);
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
        }else if(start && code[0].length != 0){
            return `Syntax Error in line ${lineNumber}: Expected end of Expression: ${code[0].join(" ").trim()}.`;
        }else{
            return `Syntax Error in line ${lineNumber}: Expected start of the program.`;
        }
    }
    if(!end){
        return `Syntax Error in line ${lineNumber}: Expected end of the program.`;
    }
    return [code,tableOfLexemes, lineNumber]; 
}

fs.readFile('./sample.lol', 'utf8', function(err, data){ 
    console.log(program_abs(data,[],1));
}); 
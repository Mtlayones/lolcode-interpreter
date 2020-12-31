import { keywords , literal ,identifier, types} from './lexemes';

// inline comment abstraction //okay
const inline_comment_abs = (code, tableOfLexemes,lineNumber)=>{
    code[0] = code[0].join(" ").trim().split(" ");
    let placeholder = code[0].shift();
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    // if there is comment after BTW
    if(code[0].length !== 0){
        placeholder = code[0].join(" ");
        tableOfLexemes.push({value:placeholder,description:'Comment'});
        code[0] = [];
    }
    return [code, tableOfLexemes, lineNumber];
}

// multiline comment abstraction //okay
const multiline_comment_abs = (code, tableOfLexemes, lineNumber) =>{
    let placeholder = code[0].shift(),error,indexTLDR;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    // getting all the comment before the line of TLDR
    while(!code[0].includes('TLDR')){
        placeholder = code.shift().join(" ").trim();
        if(placeholder !== ""){
            tableOfLexemes.push({value:placeholder,description:'Comment'});
        }
        tableOfLexemes.push({value:'\n',description:'Line Break'});
        // if there is no TLDR present in the code
        if(code.length === 0) return `Syntax Error in line ${lineNumber}: Expected end of Multi-Line Comment.`;
        code[0]=code[0].trim().split(" ");
        error = tokenizer_abs(code,lineNumber);
        if(!Array.isArray(error)) return error;
        [code, lineNumber] = error;
        lineNumber++;
    }
    indexTLDR = code[0].indexOf("TLDR");
    // if there is comment before TLDR
    if(indexTLDR !== 0){
        placeholder = code[0].slice(0,indexTLDR).join(" ").trim();
        tableOfLexemes.push({value:placeholder,description:'Comment'});
    }
    tableOfLexemes.push({value:'TLDR',description:keywords['TLDR'][1]});
    code[0] = code[0].slice(indexTLDR+1,code[0].length).join(" ").trim().split(" ");
    // if command line break encountered
    if(code[0].join(" ").trim().split(" ")[0] === ","){
        code[0] = code[0].join(" ").trim().split(" ");
        tableOfLexemes.push({value: code[0].shift(),description:"Command Line Break"});
    }if(code[0][0] === '' && code[0].length ===1){
        code[0].shift();
    }
    return [code, tableOfLexemes, lineNumber];
}

// literal abstraction //okay
const literal_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift(),isChanged = true;
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
        isChanged = false;
    }
    // if command line break encountered
    if(isChanged && code[0].join(" ").trim().split(" ")[0] === ","){
        code[0] = code[0].join(" ").trim().split(" ");
        tableOfLexemes.push({value: code[0].shift(),description:"Command Line Break"});
    }
    return [code,tableOfLexemes, lineNumber,isChanged];
}

// identifier abstraction //okay
const identifier_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift();
    if(placeholder[0] === '\'' &&  placeholder[placeholder.length-1] === '\''){
        // if there are string that were enclose by single quotes
        return `Syntax Error in line ${lineNumber}: Unexpected Sequence: ${placeholder}.`;
    }else if(keywords[placeholder] || ["WIN","FAIL"].includes(placeholder) || !identifier[0].test(placeholder)){
        // invalid format of the identifier
        return `Syntax Error in line ${lineNumber}: Expected Identifier: ${placeholder}.`;
    }else{
        tableOfLexemes.push({value:placeholder, description: identifier[1]});
    }
    // if command line break encountered
    if(code[0].join(" ").trim().split(" ")[0] === ","){
        code[0] = code[0].join(" ").trim().split(" ");
        tableOfLexemes.push({value: code[0].shift(),description:"Command Line Break"});
    }
    return [code,tableOfLexemes, lineNumber];
}

// operands abstraction //okay
const operands_abs = (code,tableOfLexemes,lineNumber,type) => {
    let error,isChanged;
    // literal
    [code,tableOfLexemes, lineNumber, isChanged] = literal_abs(code,tableOfLexemes,lineNumber);
    // expression
    if(!isChanged){
        error = expression_abs(code,tableOfLexemes,lineNumber,type);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber, isChanged] = error;
    }
    // identifier
    if(!isChanged){
        error = identifier_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }
    return [code,tableOfLexemes, lineNumber];
}

// output abstraction //okay
const output_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift() , error;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    while(true){
        if(tableOfLexemes[tableOfLexemes.length-1].value === "VISIBLE" && (code[0].join(" ").trim().split(" ")[0] === "," ||code[0].join(" ").trim().split(" ")[0] === "BTW" || code[0].length === 0)){
            // missing operands after the VISIBLE KEYWORD
            return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
        }else if(code[0].join(" ").trim().split(" ")[0] === "BTW" || code[0].length === 0 || tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"){
            break;
        }else if(code[0].join(" ").trim().split(" ")[0] === "!"){
            // no new line encountered
            code[0] = code[0].join(" ").trim().split(" ");
            tableOfLexemes.push({value:code[0].shift(),description:"No newline output"});
            continue;
        }else if(tableOfLexemes[tableOfLexemes.length-1].value === "!" && code.length !== 0){
            // if there is operation after ! beside inline comment
            return `Syntax Error in line ${lineNumber}: Expected end of Expression: ${code[0].join(" ").trim()}.`;
        }else if(code[0][0] === ""){
            // if there is exceeding whitespace in between the operation
            return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
        }
        //operands
        error = operands_abs(code,tableOfLexemes,lineNumber, true);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }
    return [code,tableOfLexemes, lineNumber];
}

// input abstraction //optimized
const input_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift();
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    if(code[0].length === 0){
        // missing operands after the GIMMEH KEYWORD
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
    }
    if(code[0][0] === ""){
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
    if(code[0].length === 0){
        // missing operands after the ITZ KEYWORD
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
    }
    if(code[0][0] === ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    if(code[0][0] === "A" ){
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

// variable declaration //okay
const declaration_var_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift();
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    if(code[0].length === 0){
        // missing operands after the I HAS A KEYWORD
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
    }
    if(code[0][0] === ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    // identifier
    let error = identifier_abs(code,tableOfLexemes,lineNumber);
    // check if error   
    if(!Array.isArray(error)) return error;
    [code,tableOfLexemes, lineNumber] = error;
    tableOfLexemes[tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break" ?tableOfLexemes.length-2:tableOfLexemes.length-1].description = "Variable Identifier";
    // if special IT identifier
    if(tableOfLexemes[tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break" ?tableOfLexemes.length-2:tableOfLexemes.length-1].value === "IT"){
        return `Syntax Error in line ${lineNumber}: ${tableOfLexemes.pop().value} is a Special Identifier.`;
    }
    if(code[0][0] === ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    if(tableOfLexemes[tableOfLexemes.length-1].description !== "Command Line Break" && code[0][0] === "ITZ"){
        // initialization
        error = initialization_var_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }
    return [code,tableOfLexemes, lineNumber];
}

// variable assignment //okay
const assignment_var_abs = (code,tableOfLexemes,lineNumber)=>{
    let placeholder;
    // identifier
    let error = identifier_abs(code,tableOfLexemes,lineNumber);
    // check if error
    if(!Array.isArray(error)) return error;
    [code,tableOfLexemes, lineNumber] = error;
    if(tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"){
        return `Syntax Error in line ${lineNumber}: Invalid Operation: ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
    }
    if(code[0][0] === ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }else if(code[0][0] === "R"){
        placeholder = code[0].shift();
        tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});  
    }else{
        // if inproper use of R
        return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
    }
    if(code[0].length === 0){
        // missing operands after the R KEYWORD
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
    }
    if(code[0][0] === ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    if(code[0][0] === "MAEK"){
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

// arithmetic recursion //okay
const arithmetic_recurse_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift(),i,error;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    for (i = 0; i < 3; i++){
        if(code[0].length === 0){
            return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
        }
        if(code[0][0] === ""){
            // if there is exceeding whitespace in between the operation
            return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
        }
        if(i !== 1){
            //operands
            error = operands_abs(code,tableOfLexemes,lineNumber, true);
            // check if error
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
        }else if(code[0][0] === "AN" && tableOfLexemes[tableOfLexemes.length-1].description !== "Command Line Break"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
        }else{
            // if inproper use of AN
            return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
        }
    }
    return [code,tableOfLexemes, lineNumber];
}

// boolean operations op abstraction  //okay
const boolean_operands_abs = (code, tableOfLexemes, lineNumber, type) => {
    let error, isChanged = true;
    if(code[0][1] && keywords[[code[0][0],code[0][1]].join(" ")] && keywords[[code[0][0],code[0][1]].join(" ")][0] === "Boolean"){
        // boolean operations
        code[0].unshift([code[0].shift(),code[0].shift()].join(" "));
        error = boolean_recurse_abs(code,tableOfLexemes,lineNumber);
    }else if(code[0][0] === "NOT"){
        // not operations
        error = boolean_recurse_abs(code,tableOfLexemes,lineNumber);
    }else if(type && code[0][1] && keywords[[code[0][0],code[0][1]].join(" ")] && keywords[[code[0][0],code[0][1]].join(" ")][0] === "Boolean Many"){
        // boolean many operations
        code[0].unshift([code[0].shift(),code[0].shift()].join(" "));
        error = boolean_many_recurse_abs(code,tableOfLexemes,lineNumber);
    }else if(keywords[code[0][0]] && keywords[code[0][0]][0] === 'Comparison'){
        // comparison different
        error = comparison_abs(code,tableOfLexemes,lineNumber);
    }else if(code[0][1]==="SAEM" && (keywords[[code[0][0],code[0][1]].join(" ")][0] === "Comparison")){
        // comparison same
        code[0].unshift([code[0].shift(),code[0].shift()].join(" "));
        error = comparison_abs(code,tableOfLexemes,lineNumber);
    }else{
        isChanged = false;
    }
    if(isChanged){
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }
    return [code,tableOfLexemes, lineNumber,isChanged];
}

// boolean recursion abstraction //optimized
const boolean_recurse_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift(),i,error;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    if(tableOfLexemes[tableOfLexemes.length - 1].value === "NOT"){
        if(code[0].length === 0){
            return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
        }
        if(code[0][0] === ""){
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
            if(code[0].length === 0){
                return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
            }
            if(code[0][0] === ""){
                // if there is exceeding whitespace in between the operation
                return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
            }
            if(i !== 1){
                //operands
                error = operands_abs(code,tableOfLexemes,lineNumber, true);
                // check if error
                if(!Array.isArray(error)) return error;
                [code,tableOfLexemes, lineNumber] = error;
            }else if(code[0][0] === "AN" && tableOfLexemes[tableOfLexemes.length-1].description !== "Command Line Break"){
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

// boolean many recursion abstraction //okay
const boolean_many_recurse_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift(),error,cnt=0;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    while(true){
        if(code[0].length === 0 && ["ANY OF","AN","ALL OF"].includes(tableOfLexemes[tableOfLexemes.length-1].value)){
            return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
        }
        if(cnt>=2 && (code[0].length === 0 || code[0].join(" ").trim().split(" ")[0] === "BTW" || tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break")){
            return `Syntax Error in line ${lineNumber}: Expecting MKAY after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
        }
        if(code[0][0] === ""){
            // if there is exceeding whitespace in between the operation
            return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
        }
        if(["ANY OF","AN","ALL OF"].includes(tableOfLexemes[tableOfLexemes.length-1].value)){
            //operands
            error = operands_abs(code,tableOfLexemes,lineNumber, true);
            // check if error
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
            cnt ++;
        }else if(code[0][0] === "AN" && tableOfLexemes[tableOfLexemes.length-1].description !== "Command Line Break"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
        }else if(cnt>=2 && code[0][0] === "MKAY"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            // if command line break encountered
            if(code[0].join(" ").trim().split(" ")[0] === ","){
                code[0] = code[0].join(" ").trim().split(" ");
                tableOfLexemes.push({value:code[0].shift(),description:"Command Line Break"});
            }
            break;
        }else{
            if(cnt < 2 && (code[0].length === 0 || code[0].join(" ").trim().split(" ")[0] === "BTW" || tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break")){
                return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
            }
            return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
        }
    }
    return [code,tableOfLexemes, lineNumber];
}

// comparison abstraction //okay
const comparison_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift(),i, error;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    for (i = 0; i < 3; i++){
        if(code[0].length === 0){
            return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
        }
        if(code[0][0] === ""){
            // if there is exceeding whitespace in between the operation
            return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
        }
        if(i !== 1){
            //operands
            error = operands_abs(code,tableOfLexemes,lineNumber, true);
            // check if error
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
        }else if(code[0][0] === "AN" && tableOfLexemes[tableOfLexemes.length-1].description !== "Command Line Break"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
        }else{
            // if inproper use of AN
            return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
        }
    }
    return [code,tableOfLexemes, lineNumber];
}

// expression abstraction //okay
const expression_abs = (code, tableOfLexemes, lineNumber, type) => {
    let error,isChanged = true;
    if(code[0][1] && keywords[[code[0][0],code[0][1]].join(" ")] && (keywords[[code[0][0],code[0][1]].join(" ")][0] === "Arithmetic")){
        // arithmetic
        code[0].unshift([code[0].shift(),code[0].shift()].join(" "));
        error = arithmetic_recurse_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }else if(type && keywords[code[0][0]] && keywords[code[0][0]][0] === 'Concat'){
        // concat
        error = concat_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }else if(code[0][1] && keywords[[code[0][0],code[0][1]].join(" ")] && (keywords[[code[0][0],code[0][1]].join(" ")][0] === "Function Call")){
        // function call
        code[0].unshift([code[0].shift(),code[0].shift()].join(" "));
        error = function_call_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }else{
        // boolean operations
        error = boolean_operands_abs(code,tableOfLexemes,lineNumber,type);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber,isChanged] = error;
    }
    return [code,tableOfLexemes, lineNumber,isChanged]
}

// concatenation abstraction //okay
const concat_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift(),error,cnt = 0;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    while(true){
        if(code[0].length === 0 && ["AN","SMOOSH"].includes(tableOfLexemes[tableOfLexemes.length-1].value)){
            // lacking operand after AN
            return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
        }
        if(cnt>=2 && (code[0].length === 0 || code[0].join(" ").trim().split(" ")[0] === "BTW" || tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break")){
            break;
        }
        if(code[0][0] === ""){
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
        }else if(code[0][0] === "AN" && tableOfLexemes[tableOfLexemes.length-1].description !== "Command Line Break"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
        }else if(cnt>=2 && code[0][0] === "MKAY"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            // if command line break encountered
            if(code[0].join(" ").trim().split(" ")[0] === ","){
                code[0] = code[0].join(" ").trim().split(" ");
                tableOfLexemes.push({value:code[0].shift(),description:"Command Line Break"});
            }
            break;
        }else{
            if(cnt < 2 && (code[0].length === 0 || code[0].join(" ").trim().split(" ")[0] === "BTW" || tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break")){
                return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
            }
            return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
        }
    }
    return [code,tableOfLexemes, lineNumber];
} 

// if else abstraction //okay
const if_else_abs = (code,tableOfLexemes,lineNumber,type) => {
    let placeholder = code[0].shift(), if_active = false,else_active = false,end=false,error;
    placeholder = placeholder.slice(0,placeholder.length-1);
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    tableOfLexemes.push({value:"?",description:'Control Flow Delimiter'});
    // if command line break encountered
    if(code[0].join(" ").trim().split(" ")[0] === ","){
        code[0] = code[0].join(" ").trim().split(" ");
        tableOfLexemes.push({value: code[0].shift(),description:"Command Line Break"});
    }
    while(!end){
        if(code.length === 0){
            return `Syntax Error in line ${lineNumber-1}: Expected End of Flow Control.`;
        }
        if(code[0].length === 0){
            // encounter new line
            code.shift();
            if(tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"){
                return `Syntax Error in line ${lineNumber}: Expected Statement after: ${tableOfLexemes[tableOfLexemes.length-1].value}.`; 
            }
            lineNumber++;
            tableOfLexemes.push({value:'\n',description:'Line Break'});
            if(code.length !== 0){
                code[0]=code[0].trim().split(" ");
                if(code[0][0] === ''){
                    code[0].shift();
                    continue;
                }
                error = tokenizer_abs(code,lineNumber);
                if(!Array.isArray(error)) return error;
                [code, lineNumber] = error;
            }
            continue;
        }else if (code[0][1] && [code[0][0],code[0][1]].join(" ") === "YA RLY" && !if_active && ['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
            placeholder = [code[0].shift(),code[0].shift()].join(" ");
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            if_active = true;
            // if command line break encountered
            if(code[0].join(" ").trim().split(" ")[0] === ","){
                code[0] = code[0].join(" ").trim().split(" ");
                tableOfLexemes.push({value:code[0].shift(),description:"Command Line Break"});
            }
        }else if(code[0][0] === "MEBBE" && if_active && !else_active && ['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            if(code[0].length === 0){
                return `Syntax Error in line ${lineNumber}: Missing Operation after ${placeholder}.`;
            }
            if(code[0][0] === ""){
                // if there is exceeding whitespace in between the operation
                return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
            }
            //operands
            error = operands_abs(code,tableOfLexemes,lineNumber, true);
            // check if error
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;   
        }else if(code[0][1] && [code[0][0],code[0][1]].join(" ") === "NO WAI" && if_active && !else_active && ['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
            placeholder = [code[0].shift(),code[0].shift()].join(" ");
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            else_active = true;
            // if command line break encountered
            if(code[0].join(" ").trim().split(" ")[0] === ","){
                code[0] = code[0].join(" ").trim().split(" ");
                tableOfLexemes.push({value:code[0].shift(),description:"Command Line Break"});
            }
        }else if(code[0][0] === "OIC" && if_active && ['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            end = true;
            // if command line break encountered
            if(code[0].join(" ").trim().split(" ")[0] === ","){
                code[0] = code[0].join(" ").trim().split(" ");
                tableOfLexemes.push({value:code[0].shift(),description:"Command Line Break"});
            }
        }else if(if_active && ['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
            error = statement_abs(code,tableOfLexemes,lineNumber,type);
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
        }
        if(code[0].join(" ").trim().split(" ")[0] === "BTW"){
            // inline comment
            [code,tableOfLexemes, lineNumber] = inline_comment_abs(code,tableOfLexemes,lineNumber);
        }else if(['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description) && code[0][0] === 'OBTW'){
            // multiline comment
            error = multiline_comment_abs(code,tableOfLexemes,lineNumber);
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
        }else if(code[0].length !== 0 && !if_active){
            // if there is no if
            return `Syntax Error in line ${lineNumber}: Expected start of Flow Control: ${code[0].join(" ").trim()}.`;
        }else if(code[0].length !== 0 && tableOfLexemes[tableOfLexemes.length-1].description !== "Command Line Break"){
            // if there is operation after the identifier
            return `Syntax Error in line ${lineNumber}: Expected end of Expression: ${code[0].join(" ").trim()}.`;
        }
    }
    return [code,tableOfLexemes, lineNumber];
}

// Switch Case Abstraction //optimized
const switch_case_abs = (code,tableOfLexemes,lineNumber,type) => {
    let placeholder = code[0].shift(),start_active = false,default_active = false,end =false,error,listOfOptions = [],indexConstant=0;
    placeholder = placeholder.slice(0,placeholder.length-1);
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    tableOfLexemes.push({value:"?",description:'Control Flow Delimiter'});
    // if command line break encountered
    if(code[0].join(" ").trim().split(" ")[0] === ","){
        code[0] = code[0].join(" ").trim().split(" ");
        tableOfLexemes.push({value: code[0].shift(),description:"Command Line Break"});
    }
    while(!end){
        if(code.length === 0){
            return `Syntax Error in line ${lineNumber-1}: Expected End of Flow Control.`;
        }
        if(code[0].length === 0){
            // encounter new line
            code.shift();
            if(tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"){
                return `Syntax Error in line ${lineNumber}: Expected Statement after: ${tableOfLexemes[tableOfLexemes.length-1].value}.`; 
            }
            lineNumber++;
            tableOfLexemes.push({value:'\n',description:'Line Break'});
            if(code.length !== 0){
                code[0]=code[0].trim().split(" ");
                if(code[0][0] === ''){
                    code[0].shift();
                    continue;
                }
                error = tokenizer_abs(code,lineNumber);
                if(!Array.isArray(error)) return error;
                [code, lineNumber] = error;
            }
            continue;
        }else if(code[0][0] === "OMG" && !default_active && ['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            if(code[0].length === 0){
                return `Syntax Error in line ${lineNumber}: Missing Operation after ${placeholder}.`;
            }
            if(code[0][0] === ""){
                // if there is exceeding whitespace in between the operation
                return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
            }
            indexConstant = tableOfLexemes.length;
            //operands
            error = operands_abs(code,tableOfLexemes,lineNumber, true);
            // check if error
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
            if(!tableOfLexemes[indexConstant].description.split(" ").includes("Literal")){
                return `Syntax Error in line ${lineNumber}: Expected Constant Value at ${tableOfLexemes[indexConstant].value}.`;
            }else if(listOfOptions.includes(tableOfLexemes[indexConstant].value)){
                return `Syntax Error in line ${lineNumber}: OMG Literal Must be Unique at ${tableOfLexemes[indexConstant].value}.`;
            }
            listOfOptions.push(tableOfLexemes[indexConstant].value);
            start_active = true;   
        }else if(code[0][0] === "OMGWTF" && start_active && !default_active && ['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            default_active = true;
            // if command line break encountered
            if(code[0].join(" ").trim().split(" ")[0] === ","){
                code[0] = code[0].join(" ").trim().split(" ");
                tableOfLexemes.push({value:code[0].shift(),description:"Command Line Break"});
            }
        }else if(code[0][0] === "OIC" && start_active && ['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            end = true;
            // if command line break encountered
            if(code[0].join(" ").trim().split(" ")[0] === ","){
                code[0] = code[0].join(" ").trim().split(" ");
                tableOfLexemes.push({value:code[0].shift(),description:"Command Line Break"});
            }
        }else if((start_active || default_active) && ['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
            error = statement_abs(code,tableOfLexemes,lineNumber,type==="Function"? type:"Block Operations");
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
        }
        if(code[0].join(" ").trim().split(" ")[0] === "BTW"){
            // inline comment
            [code,tableOfLexemes, lineNumber] = inline_comment_abs(code,tableOfLexemes,lineNumber);
        }else if(['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description) && code[0][0] === 'OBTW'){
            error = multiline_comment_abs(code,tableOfLexemes,lineNumber);
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
        }else if(code[0].length !== 0 && !start_active){
            return `Syntax Error in line ${lineNumber}: Expected start of Flow Control: ${code[0].join(" ").trim()}.`;
        }else if(code[0].length !== 0 && tableOfLexemes[tableOfLexemes.length-1].description !== "Command Line Break"){
            // if there is operation after the identifier
            return `Syntax Error in line ${lineNumber}: Expected end of Expression: ${code[0].join(" ").trim()}.`;
        }
    }
    return [code,tableOfLexemes, lineNumber];
}

// loop abstraction //okay
const loop_abs = (code, tableOfLexemes, lineNumber,type) => {
    let placeholder = code[0].shift(),error,end=false,loopName='';
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    if(code[0].length === 0){
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
    }
    if(code[0][0] === ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    // for the name of the loop with the YR before
    if(code[0][0] === "YR"){
        placeholder = code[0].shift();
        tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
        // identifier
        error = identifier_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
        loopName = tableOfLexemes[tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"?tableOfLexemes.length-2:tableOfLexemes.length-1].value;
        tableOfLexemes[tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"?tableOfLexemes.length-2:tableOfLexemes.length-1].description = "Loop Identifier";
        if(tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"){
            return `Syntax Error in line ${lineNumber}: Invalid Operation: ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
        }
        if(code[0].length === 0){
            return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
        }
        if(code[0][0] === ""){
            // if there is exceeding whitespace in between the operation
            return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
        }
        // increment or decrement with the UPPIN and the NERFIN
        if(code[0][0] === "UPPIN" | code[0][0] === "NERFIN"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            if(code[0].length === 0){
                return `Syntax Error in line ${lineNumber}: Missing Operands ${tableOfLexemes[tableOfLexemes.length-1].value}es[tableOfLexemes.length-1].value}.`;
            }
            if(code[0][0] === ""){
                // if there is exceeding whitespace in between the operation
                return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
            }
            // variable to be incremented with YR before
            if(code[0][0] === "YR"){
                placeholder = code[0].shift();
                tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
                // identifier
                error = identifier_abs(code,tableOfLexemes,lineNumber);
                // check if error
                if(!Array.isArray(error)) return error;
                [code,tableOfLexemes, lineNumber] = error;
                tableOfLexemes[tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"?tableOfLexemes.length-2:tableOfLexemes.length-1].description = "Parameter Identifier";
                if(tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"){
                    return `Syntax Error in line ${lineNumber}: Invalid Operation: ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
                }
                // the conditionals in the loop
                if(code[0][0] === "TIL" | code[0][0] === "WILE"){
                    placeholder = code[0].shift();
                    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
                    if(code[0].length === 0){
                        return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
                    }
                    if(code[0][0] === ""){
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
                        if(code.length === 0){
                            return `Syntax Error in line ${lineNumber-1}: Expected End of the Loop.`;
                        }
                        if(code[0].length === 0){
                            // encounter new line
                            code.shift();
                            if(tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"){
                                return `Syntax Error in line ${lineNumber}: Expected Statement after: ${tableOfLexemes[tableOfLexemes.length-1].value}.`; 
                            }
                            lineNumber++;
                            tableOfLexemes.push({value:'\n',description:'Line Break'});
                            if(code.length !== 0){
                                code[0]=code[0].trim().split(" ");
                                if(code[0][0] === ''){
                                    code[0].shift();
                                    continue;
                                }
                                error = tokenizer_abs(code,lineNumber);
                                if(!Array.isArray(error)) return error;
                                [code, lineNumber] = error;
                            }
                            continue;
                        }else if(code[0][1] && [code[0][0],code[0][1]].join(" ") === "IM OUTTA" && ['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
                            // loop code delimiter
                            placeholder = [code[0].shift(),code[0].shift()].join(' ');
                            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
                            if(code[0].length === 0){
                                return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
                            }
                            if(code[0][0] === ""){
                                // if there is exceeding whitespace in between the operation
                                return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
                            }
                            // name of the loop after the YR
                            if(code[0][0] === "YR"){
                                placeholder = code[0].shift();
                                tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
                                if(code[0].length === 0){
                                    return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
                                }
                                if(code[0][0] === ""){
                                    // if there is exceeding whitespace in between the operation
                                    return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
                                }
                                // identifier
                                error = identifier_abs(code,tableOfLexemes,lineNumber);
                                // check if error
                                if(!Array.isArray(error)) return error;
                                [code,tableOfLexemes, lineNumber] = error;
                                if (loopName !== tableOfLexemes[tableOfLexemes.length-1].value){
                                    return `Syntax Error in line ${lineNumber}: Mismatched Loop Label.`;
                                }
                            }else{
                                return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
                            }
                            end = true
                        }else if(['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
                            // body of the loop
                            error = statement_abs(code,tableOfLexemes,lineNumber,type==="Function"? type:"Block Operations");
                            if(!Array.isArray(error)) return error;
                            [code,tableOfLexemes, lineNumber] = error;
                        }
                        if(code[0].join(" ").trim().split(" ")[0] === "BTW"){
                            // inline comment
                            [code,tableOfLexemes, lineNumber] = inline_comment_abs(code,tableOfLexemes,lineNumber);
                        }else if(code[0].length !== 0 && tableOfLexemes[tableOfLexemes.length-1].description !== "Command Line Break"){
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

// function  abstraction //okay
const function_abs = (code, tableOfLexemes, lineNumber) => {
    let placeholder = code[0].shift(),error,end=false;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    if(code[0].length === 0){
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
    }
    if(code[0][0] === ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    // identifier
    error = identifier_abs(code,tableOfLexemes,lineNumber);
    // check if error
    if(!Array.isArray(error)) return error;
    [code,tableOfLexemes, lineNumber] = error;
    tableOfLexemes[tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"?tableOfLexemes.length-2:tableOfLexemes.length-1].description = "Function Identifier";
    while(true){
        if(tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"){
            break;
        }
        if(code[0][0] === "" && !["BTW",","].includes(code[0].join(" ").trim().split(" ")[0])){
            // if there is exceeding whitespace in between the operation
            return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
        }else if(['Operand Delimiter Keyword','Function Identifier'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
            if(code[0][0] === "YR"){
                placeholder = code[0].shift();
                tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
                if(code[0].length === 0){
                    return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
                }
                if(code[0][0] === ""){
                    // if there is exceeding whitespace in between the operation
                    return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
                }
                // identifier
                error = identifier_abs(code,tableOfLexemes,lineNumber);
                // check if error
                if(!Array.isArray(error)) return error;
                [code,tableOfLexemes, lineNumber] = error;
                tableOfLexemes[tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"?tableOfLexemes.length-2:tableOfLexemes.length-1].description = "Parameter Identifier";
            }else{
                if(tableOfLexemes[tableOfLexemes.length-1].value === "AN"){
                    return `Syntax Error in line ${lineNumber}: Missing Operands ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
                }else{
                    break;
                }
            }
        }else if(code[0][0] === "AN"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
        }else{
            break;
        }
    }
    // body of the function
    while(!end){
        if(code.length === 0){
            return `Syntax Error in line ${lineNumber-1}: Expected End of the Function.`;
        }
        if(code[0].length === 0){
            // encounter new line
            code.shift();
            if(tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"){
                return `Syntax Error in line ${lineNumber}: Expected Statement after: ${tableOfLexemes[tableOfLexemes.length-1].value}.`; 
            }
            lineNumber++;
            tableOfLexemes.push({value:'\n',description:'Line Break'});
            if(code.length !== 0){
                code[0]=code[0].trim().split(" ");
                if(code[0][0] === ''){
                    code[0].shift();
                    continue;
                }
                error = tokenizer_abs(code,lineNumber);
                if(!Array.isArray(error)) return error;
                [code, lineNumber] = error;
            }
            continue;
        }else if(code[0][3] && [code[0][0],code[0][1],code[0][2],code[0][3]].join(" ") === "IF U SAY SO" && ['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
            // loop code delimiter
            placeholder = [code[0].shift(),code[0].shift(),code[0].shift(),code[0].shift()].join(' ');
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            // if command line break encountered
            if(code[0].join(" ").trim().split(" ")[0] === ","){
                code[0] = code[0].join(" ").trim().split(" ");
                code[0].shift()
                tableOfLexemes.push({value:",",description:"Command Line Break"});
            }
            end = true
        }else if(['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
            // body of the loop
            error = statement_abs(code,tableOfLexemes,lineNumber, 'Function');
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
        }
        if(code[0].join(" ").trim().split(" ")[0] === "BTW"){
            // inline comment
            [code,tableOfLexemes, lineNumber] = inline_comment_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0].length !== 0 && tableOfLexemes[tableOfLexemes.length-1].description !== "Command Line Break"){
            // if there is operation after the identifier
            return `Syntax Error in line ${lineNumber}: Expected end of Expression: ${code[0].join(" ").trim()}.`;
        }
    }
    return [code,tableOfLexemes, lineNumber];
}

// function call abstraction //okay
const function_call_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift(),error;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    if(code[0].length === 0){
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
    }
    if(code[0][0] === ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    // identifier
    error = identifier_abs(code,tableOfLexemes,lineNumber);
    // check if error
    if(!Array.isArray(error)) return error;
    [code,tableOfLexemes, lineNumber] = error;
    tableOfLexemes[tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"?tableOfLexemes.length-2:tableOfLexemes.length-1].description = "Function Identifier";
    while(true){
        if(tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"){
            break;
        }
        if(code[0][0] === "" && !["BTW",","].includes(code[0].join(" ").trim().split(" ")[0])){
            // if there is exceeding whitespace in between the operation
            return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
        }else if(['Operand Delimiter Keyword','Function Identifier'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
            if(code[0][0] === "YR"){
                placeholder = code[0].shift();
                tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
                if(code[0].length === 0){
                    return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
                }
                if(code[0][0] === ""){
                    // if there is exceeding whitespace in between the operation
                    return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
                }
                // operands
                error = operands_abs(code,tableOfLexemes,lineNumber);
                // check if error
                if(!Array.isArray(error)) return error;
                [code,tableOfLexemes, lineNumber] = error;
            }else{
                if(tableOfLexemes[tableOfLexemes.length-1].value === "AN"){
                    return `Syntax Error in line ${lineNumber}: Missing Operands ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
                }else{
                    if(code[0][0] === "MKAY"){
                        placeholder = code[0].shift();
                        tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
                    }
                    break;
                }
            }
        }else if(code[0][0] === "MKAY"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            break;
        }else if(code[0][0] === "AN"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
        }else{
            break;
        }
    }
    return [code,tableOfLexemes, lineNumber];
}

// statement abstraction //okay
const statement_abs = (code,tableOfLexemes,lineNumber,type) => {
    let error,isChanged = true;
    let placeholder;
    [code,tableOfLexemes, lineNumber, isChanged] = literal_abs(code,tableOfLexemes,lineNumber);
    if(!isChanged){
        error = expression_abs(code,tableOfLexemes,lineNumber, true);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber, isChanged] = error;
    }
    if(!isChanged){
        isChanged = true;
        if(code[0][0] === "BTW"){
            error = inline_comment_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0][0] === "OBTW"){
            error = multiline_comment_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0][0] === "VISIBLE"){
            error = output_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0][0] === "GIMMEH"){
            error = input_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0][1] && code[0][2] && keywords[[code[0][0],code[0][1],code[0][2]].join(" ")] && (keywords[[code[0][0],code[0][1],code[0][2]].join(" ")][0] === "Declare Var")){
            code[0].unshift([code[0].shift(),code[0].shift(),code[0].shift()].join(" "));
            error = declaration_var_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0].includes("R")){
            error = assignment_var_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0][1] && keywords[[code[0][0],code[0][1].slice(0,code[0][1].length-1)].join(" ")] && (keywords[[code[0][0],code[0][1].slice(0,code[0][1].length-1)].join(" ")][0] === "If-Else")){
            code[0].unshift([code[0].shift(),code[0].shift()].join(" "));
            error = if_else_abs(code,tableOfLexemes,lineNumber,type);
        }else if(code[0][1] && keywords[[code[0][0],code[0][1]].join(" ")] && (keywords[[code[0][0],code[0][1]].join(" ")][0] === "Loop")){
            code[0].unshift([code[0].shift(),code[0].shift()].join(" "));
            error = loop_abs(code,tableOfLexemes,lineNumber,type);
        }else if(code[0][2] && keywords[[code[0][0],code[0][1],code[0][2]].join(" ")] && (keywords[[code[0][0],code[0][1],code[0][2]].join(" ")][0] === "Function")){
            code[0].unshift([code[0].shift(),code[0].shift(),code[0].shift()].join(" "));
            error = function_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0][0] === "WTF?"){
            error = switch_case_abs(code,tableOfLexemes,lineNumber,type);
        }else if(code[0][0] === "MAEK"){
            error = typecast_expr_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0].join(' ').includes("IS NOW")){
            error = typecast_var_abs(code,tableOfLexemes,lineNumber);
        }else if(["TLDR","OIC"].includes(code[0][0])){
            return `Syntax Error in line ${lineNumber}: Expected Starting Flow-Control Structure: ${code[0].join(" ").trim()}.`;
        }else if(code[0][3] && [code[0][0],code[0][1],code[0][2],code[0][3]].join(" ") === "IF U SAY SO"){
            return `Syntax Error in line ${lineNumber}: Expected Starting Function Structure: ${code[0].join(" ").trim()}.`;
        }else if(code[0][1] && [code[0][0],code[0][1]].join(" ") === "IM OUTTA"){
            return `Syntax Error in line ${lineNumber}: Expected Starting Loop Structure: ${code[0].join(" ").trim()}.`;
        }else{
            isChanged = false;
        }
        if(isChanged){
            // check if error
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
            if(code.length === 0){
                return [code,tableOfLexemes, lineNumber];
            }
        }
    }
    if(!isChanged && (type === "Function" || type === "Block Operations")){
        isChanged = true;
        if(type === "Function" && code[0][0] === "FOUND" && ['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
            // loop code delimiter
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            if(code[0].length === 0){
                return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
            }
            if(code[0][0] === ""){
                // if there is exceeding whitespace in between the operation
                return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
            }
            if(code[0][0] === "YR"){
                placeholder = code[0].shift();
                tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
                if(code[0].length === 0){
                    return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
                }
                if(code[0][0] === ""){
                    // if there is exceeding whitespace in between the operation
                    return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
                }
                // return value
                error = operands_abs(code,tableOfLexemes,lineNumber);
                // check if error
                if(!Array.isArray(error)) return error;
                [code,tableOfLexemes, lineNumber] = error;
            }
        }else if(code[0][0] === "GTFO" && ['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description)){
            // break code delimiter
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            // if command line break encountered
            if(code[0].join(" ").trim().split(" ")[0] === ","){
                code[0] = code[0].join(" ").trim().split(" ");
                code[0].shift()
                tableOfLexemes.push({value:",",description:"Command Line Break"});
            }
        }else{
            isChanged = false;
        }
    }
    if(!isChanged){
        // identifier
        error = identifier_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;      
    }
    if(code[0].length !== 0){
        if(code[0].join(" ").trim().split(" ")[0] === "BTW"){
            // inline comment
            [code,tableOfLexemes, lineNumber] = inline_comment_abs(code,tableOfLexemes,lineNumber);
        }else if(code[0].length !== 0 && tableOfLexemes[tableOfLexemes.length-1].description !== "Command Line Break"){
            // if there is operation after the identifier
            return `Syntax Error in line ${lineNumber}: Expected end of Expression: ${code[0].join(" ").trim()}.`;
        }
    }
    return [code,tableOfLexemes, lineNumber]; 
}

// type casting of expression //okay
const typecast_expr_abs = (code, tableOfLexemes, lineNumber) =>{
    let placeholder = code[0].shift(),error;
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    if(code[0].length === 0){
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
    }
    if(code[0][0] === ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    //operands
    error = operands_abs(code,tableOfLexemes,lineNumber, true);
    // check if error
    if(!Array.isArray(error)) return error;
    [code,tableOfLexemes, lineNumber] = error;
    // typecasting to data type
    if(code[0][0] === "A" && tableOfLexemes[tableOfLexemes.length-1].description !== "Command Line Break"){
        //type init
        error = type_init_abs(code,tableOfLexemes,lineNumber);
        // check if error
        if(!Array.isArray(error)) return error;
        [code,tableOfLexemes, lineNumber] = error;
    }else{
        return `Syntax Error in line ${lineNumber}: Missing Operands ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
    }
    return [code,tableOfLexemes, lineNumber];
}

// type casting of var //okay
const typecast_var_abs = (code,tableOfLexemes,lineNumber) => {
    let placeholder;
    // identifier
    let error = identifier_abs(code,tableOfLexemes,lineNumber);
    // check if error
    if(!Array.isArray(error)) return error;
    [code,tableOfLexemes, lineNumber] = error;
    if(code[0][0] === ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }else if(code[0][1] && [code[0][0],code[0][1]].join(" ") === "IS NOW" && tableOfLexemes[tableOfLexemes.length-1].description !== "Command Line Break"){
        placeholder = [code[0].shift(),code[0].shift()].join(' ');
        tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});  
    }else{
        // if inproper use of IS NOW
        return `Syntax Error in line ${lineNumber}: Invalid Operation: ${code[0][0]}.`;
    }
    // typecasting to data type
    if(code[0][0] === "A" ){
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

// type initialization abstraction //okay
const type_init_abs = (code, tableOfLexemes,lineNumber) => {
    let placeholder = code[0].shift();
    tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
    if(code[0].length === 0){
        return `Syntax Error in line ${lineNumber}: Missing Operands after ${tableOfLexemes[tableOfLexemes.length-1].value}.`;
    }
    if(code[0][0] === ""){
        // if there is exceeding whitespace in between the operation
        return `Syntax Error in line ${lineNumber}: Exceeding whitespace.`;
    }
    if(types[code[0][0]]){
        // data types
        placeholder = code[0].shift();
        tableOfLexemes.push({value:placeholder,description:types[placeholder][1]});
        // if command line break encountered
        if(code[0].join(" ").trim().split(" ")[0] === ","){
            code[0] = code[0].join(" ").trim().split(" ");
            tableOfLexemes.push({value: code[0].shift(),description:"Command Line Break"});
        }
    }else{
        return `Syntax Error in line ${lineNumber}: Expected Data Type`;
    }
    return [code,tableOfLexemes, lineNumber];
}

// yarn tokenizer and joiner abs
const tokenizer_abs = (code,lineNumber) => {
    let index1,index2,tempHolder = [];
    while(true){
        index1 = code[0].findIndex((word)=>literal["YARN1"][0].test(word));
        if(index1 === -1) break;
        index2 = code[0].findIndex((word,index)=>(literal["YARN2"][0].test(word) && index !== index1));
        if(index2>-1){
            code[0][index1] = code[0].slice(index1,index2+1).join(" ");
            code[0] = code[0].slice(0,index1+1).concat(code[0].slice(index2+1,code[0].length));
        }else{
            // if lacking closing "
            return `Syntax Error in line ${lineNumber}: Unexpected Sequence: ${code[0].slice(index1,code[0].length).join(" ").trim()}.`;
        }
    }
    code[0].map((item)=>{
        if(item[0] === '\"' && item[item.length-1] === '\"'){
            tempHolder.push(item);
        }else{
            let temp_array = item.replace(/[\,]/g, " \,").replace(/[\!]/g, " \!").trim().replace(/[\!](?=[^\ ])/g, "\! ").replace(/[\,](?=[^\ ])/g, "\, ").trim().split(" ");
            if(item[0] === '\"'){
                const index1 = temp_array.findIndex((word)=>literal["YARN1"][0].test(word));
                if(index1 !== -1){
                    const index2 = temp_array.findIndex((word,index)=>(literal["YARN2"][0].test(word) && index !== index1));
                    if(index1 !== -1){
                        temp_array[index1] = temp_array.slice(index1,index2+1).join(" ");
                        temp_array = temp_array.slice(0,index1+1).concat(temp_array.slice(index2+1,temp_array.length));
                    }
                }
            }
            tempHolder.push(...temp_array);
        }
        return item;
      })
    code[0] = tempHolder;
    return [code,lineNumber];
}

// start program 
export const program_abs = (code,tableOfLexemes,lineNumber) =>{
    let start = false, end = false,placeholder,error;
    code = code.split("\n");
    while(code.length !==0){
        if(!Array.isArray(code[0])){
            // new line of code encountered
            code[0] = code[0].trim().split(" ");
            // when there is no content in the line
            if(code[0][0] === ''){
                code[0].shift();
                continue;
            }
            //tokenizer
            error = tokenizer_abs(code,lineNumber);
            if(!Array.isArray(error)) return error;
            [code, lineNumber] = error;
            continue;
        }else if(code[0].length === 0){
            // if new line encountered
            code.shift();
            if(tableOfLexemes[tableOfLexemes.length-1].description === "Command Line Break"){
                return `Syntax Error in line ${lineNumber}: Expected Statement after: ${tableOfLexemes[tableOfLexemes.length-1].value}.`; 
            }
            lineNumber++;
            tableOfLexemes.push({value:'\n',description:'Line Break'});
            continue;
        }
        if(code[0].join(" ").trim().split(" ")[0] === "BTW"){
            // inline comment
            [code,tableOfLexemes, lineNumber] = inline_comment_abs(code,tableOfLexemes,lineNumber);
            continue;
        }else if((!start || (end && ['Line Break','Command Line Break'].includes(tableOfLexemes[tableOfLexemes.length-1].description))) && code[0][0] === 'OBTW'){
            // multiline comment
            error = multiline_comment_abs(code,tableOfLexemes,lineNumber);
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
            continue;
        }
        if(!start && code[0][0] === "HAI"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            start = true;
            // if command line break encountered
            if(code[0].join(" ").trim().split(" ")[0] === ","){
                code[0] = code[0].join(" ").trim().split(" ");
                tableOfLexemes.push({value: code[0].shift(),description:"Command Line Break"});
            }
        }else if(start && !end && code[0][0] === "KTHXBYE"){
            placeholder = code[0].shift();
            tableOfLexemes.push({value:placeholder,description:keywords[placeholder][1]});
            end = true;
            // if command line break encountered
            if(code[0].join(" ").trim().split(" ")[0] === ","){
                code[0] = code[0].join(" ").trim().split(" ");
                tableOfLexemes.push({value: code[0].shift(),description:"Command Line Break"});
            }
        }else if(start && !end){
            // main body of the program
            error = statement_abs(code,tableOfLexemes,lineNumber,'None');
            if(!Array.isArray(error)) return error;
            [code,tableOfLexemes, lineNumber] = error;
        }else if(start && code[0].length !== 0){
            return `Syntax Error in line ${lineNumber}: Expected end of Expression: ${code[0].join(" ").trim()}.`;
        }else{
            return `Syntax Error in line ${lineNumber}: Expected start of the program.`;
        }
    }
    if(!end && start){
        return `Syntax Error in line ${lineNumber}: Expected end of the program.`;
    }
    return [code,tableOfLexemes, lineNumber]; 
}
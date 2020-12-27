const fs = require('fs');
const syntax = require('./parser.js')
const numbar_regex = /^(-?\d*.?\d+)$/g
const numbr_regex = /^(-?\d+)$/g
// javascript has to float, they use number instead of
// integers and float

// a function that removes the comments and
// comment keyword identifiers in the symbol table
const removeComments = (symbol_table) =>
{
	for (var i = 0; i<symbol_table.length; i++)
	{
		switch (symbol_table[i].description)
		{
			case 'Comment': 
			case 'Line Comment Keyword':
			case 'Comment Delimiter Keyword':
				symbol_table.splice(i,1);
				i--;
				break;
		}
	}
}

// a function that recursively executes the line until it reaches a new line,
// enough operands is met, or MKAY is encountered
const recursive_operations = (code,symbol_table, lexicon, line_number) => 
{
	let cur_code = symbol_table.shift(); // gets the first element in the symbol table
	let value; // variable for storing value of operand
	let operands = [];// list of operands
	let type; // variable for storing the data type of the operand
	let req_ops = 2; // variable for checking the number of operands required, default is 2
	let to_break = false; // variable for checking if MKAY is encountered
	const req_op_1 = ["NOT", "ITZ", "MEBBE", "R", "OMG"];
	if (req_op_1.indexOf(code.value) > -1) req_ops = 1; // not requires only 1 operand
	else if (code.value == "ANY OF" || code.value == "ALL OF") req_ops = -1; // infinite operands

	while(cur_code.value != "\n" && cur_code.value != ",")
	{
		switch(cur_code.description)
		{
			case "NUMBR Literal": operands.push({value:Number(cur_code.value), type:"NUMBR", name:"Literal"});
				break;
			case "NUMBAR Literal": operands.push({value:Number(cur_code.value), type:"NUMBAR", name: "Literal"});
				break;
			case "YARN Literal": operands.push({value:cur_code.value, type:"YARN"});
				break;
			case "TROOF Literal": operands.push({value:cur_code.value, type:"TROOF"});
				break;
			case "Type Keyword": cur_code = symbol_table.shift();
				operands.push({value:undefined, type:cur_code.value});
				break;
			case "Identifier": 
				if(cur_code.value == "NOOB")
				{
					operands.push({value:undefined, type:"NOOB"})
					break;
				}
				var i;
				for (i=0; i<lexicon.length; i++)
				{
					if(lexicon[i].name == cur_code.value)
					{
						operands.push({value:lexicon[i].value, type:lexicon[i].type,name:lexicon[i].name});
						break;
					}
				}
				if (i == lexicon.length) return `Error in line ${line_number}: variable ${cur_code.value} is undeclared`;
				break;
			case "Infinite Delimiter Keyword": to_break = true;
			case "Operand Delimiter Keyword": break;
			case "AND Delimiter Operation Keyword":
			case "OR Delimiter Operation Keyword": return `Error in line ${line_number}: ${cur_code.value} cannot be nested in operations`;
			default:
				error = recursive_operations(cur_code, symbol_table, lexicon, line_number);
				if(!Array.isArray(error)) return error;
				[value, type] = error;
				operands.push({value:value, type:type});
		}
		if (req_ops == operands.length || to_break) break;
		cur_code = symbol_table.shift();
	}
	if(req_ops == operands.length || to_break)
	{
		const arith = ["SUM OF", "DIFF OF", "PRODUKT OF", "QUOSHUNT OF", "MOD OF", "BIGGR OF", "SMALLR OF"];
		const bool = ["BOTH OF", "EITHER OF", "WON OF", "NOT", "ALL OF", "ANY OF"];
		const comparison = ["BOTH SAEM", "DIFFRINT"];
		if(arith.indexOf(code.value) >-1) return arithmetic_operations(code.value,operands,line_number,symbol_table);
		else if (bool.indexOf(code.value) > -1) return boolean_operations(code.value,operands, line_number,symbol_table);
		else if (comparison.indexOf(code.value) > -1) return comparison_operations(code.value,operands, line_number,symbol_table);
		return [operands[0].value, operands[0].type];
	}
	else if(operands.length < req_ops) return `Error in line ${line_number}: function ${code.value} requires ${req_ops} operands, only received ${operands.length} operands`;
	else return `Error in line ${line_number}: ${code.value} expecting MKAY keyword at the end`;
}

const arithmetic_operations = (code, operands, line_number, symbol_table) =>
{
	let i = 0;
	for (i; i<2; i++)
	{
		if (operands[i].type == "NOOB") return `Error in line ${line_number}: NOOB value cannot by implicitly typecasted into a NUMBR/NUMBAR`;
		else if (operands[i].type != "NOOB" && operands[i].value == undefined) return `Error in line ${line_number}: variable ${operands[i].name} is uninitialized before use`;
		else if (operands[i].type == "TROOF")
		{
			operands[i].value = (operands[i].value == "WIN")? 1: 0;
			operands[i].type = "NUMBR";
		}
		if (operands[i].type == "YARN")
		{
			const check = operands[i].value.replace(/"/g, '');
			if (numbar_regex.test(check))
			{
				operands[i].value = Number(check);
				operands[i].type = "NUMBAR";
			}
			else if (numbr_regex.test(check))
			{
				operands[i].value = Number(check);
				operands[i].type = "NUMBR";
			}
			else return `Error in line ${line_number}: ${operands[i].value} cannot be typecasted into a NUMBR or a NUMBR`;
		}
			
	}

	const op1 = operands.shift();
	const op2 = operands.shift();

	let result;
	let type;
	if (code == "SUM OF") result = op1.value + op2.value;
	else if (code == "DIFF OF") result = op1.value - op2.value;
	else if (code == "PRODUKT OF") result = op1.value * op2.value;
	else if (code == "QUOSHUNT OF") result = op1.value / op2.value;
	else if (code == "MOD OF") result = op1.value % op2.value;
	else if (code == "BIGGR OF") result = Math.max(op1.value,op2.value);
	else result = Math.min(op1.value,op2.value);

	if(op1.type == "NUMBAR" || op2.type == "NUMBAR") type = "NUMBAR";
	else
	{
		result = Math.floor(result);
		type = "NUMBR";
	} 
	return [result, type];
}

const boolean_operations = (code, operands, line_number, symbol_table) =>
{
	let i;
	for (i = 0; i<operands.length; i++){
		if(operands[i].type != "TROOF")
		{
			let name = (operands[i].name != undefined)? operands[i].name : "";
			operands[i].value = typecast_to_TROOF(operands[i].value, operands[i].type, name, line_number);
			if (operands[i].value != "WIN" && operands[i].value != "FAIL") return operands[i].value;
		}
	}
	let result;
	if (code == "NOT")
	{
		const op1 = operands.shift();
		result = (op1.value == "WIN")? "FAIL" : "WIN";
	}
	else if (code == "ALL OF")
	{
		result = "WIN";
		for(i = 0; i<operands.length; i++)
		{
			if(operands[i].value == "FAIL")
			{
				result = "FAIL";
				break;
			}
		}
	}
	else if (code == "ANY OF")
	{
		result = "FAIL";
		for(i = 0; i<operands.length; i++)
		{
			if(operands[i].value == "WIN")
			{
				result = "WIN";
				break;
			}
		}
	}
	else
	{
		let op1 = operands.shift();
		let op2 = operands.shift();
		op1 = (op1.value == "WIN")
		op2 = (op2.value == "WIN")

		if (code == "BOTH OF") result = (op1 && op2);
		else if (code == "EITHER OF") result = (op1 || op2);
		else result = (op1 != op2);

		result = result ? "WIN" : "FAIL";
	}
	return [result,"TROOF"];
}


const comparison_operations = (code, operands, line_number, symbol_table) =>
{
	let result;
	const op1 = operands.shift();
	const op2 = operands.shift();
	result = (op1.type == op2.type); // checks if op1 & op2 has same data types
	if (result) result = (op1.value == op2.value);
	// checks if true, if yes, checks if their value is equal and assigns it to result
	if (code == "DIFFRINT") result = !result;
	// checks if operation is different, if yes, negates result since all comparisons done is equality
	//conversion of boolean value to TROOF value
	if (result) result = "WIN"; // checks if result is true
	else result = "FAIL";

	return [result, "TROOF"];
}


const assignment_operation = (code, symbol_table, lexicon, line_number) =>
{
	var i = 0;
	for (i; i<lexicon.length; i++)
	{
		if (lexicon[i].name == code.value)
		{
			let value;
			let type;
			let cur_code = symbol_table.shift();
			error = recursive_operations(cur_code, symbol_table, lexicon, line_number);
			if(!Array.isArray(error)) return error;
			[value, type] = error;
			lexicon[i].value = value;
			lexicon[i].type = type;
			return false;
		}
	}
	if (i == lexicon.length) return `Error on line ${line_number}: assigning value to an undeclared variable ${code.value}`;
}

const ask_input = (symbol_table, lexicon, line_number) => 
{
	let variable = symbol_table.shift();
	var prompt = require('prompt-sync')();
	let i = 0;
	for(;i<lexicon.length; i++) if (lexicon[i].name == variable.value) break;

	if(i == lexicon.length) return `Error in line ${line_number}: GIMME is trying to assign to an undeclared variable`;
	lexicon[i].value = prompt("", "");
	lexicon[i].type = "YARN";
	return false;
}

/* NOTES OF SPECIAL CHARACTERS
:) -> newline (\n)
:> -> tab (\t)
:o -> beep (\g)
:" -> double quote (")
:: -> colon (:)
:{var} -> typecasts value of var into string and adds to the string
*/
const output = (symbol_table,lexicon,line_number) =>
{
	let code = symbol_table.shift();
	let error;
	let value;
	let type;
	let to_print = "";
	while(code.value != "\n" && code.value != ",")
	{
		switch(code.description)
		{
			case "NUMBAR Literal":
			case "NUMBR Literal":
			case "TROOF Literal": to_print += code.value;
				break;
			case "YARN Literal": to_print += code.value.replace(/"/g,'');
				break;
			case "Identifier":
				let i = 0;
				for (i; i<lexicon.length;i++)
				{
					if (lexicon[i].name == code.value)
					{
						if(lexicon[i].value == undefined) return `Error in line ${line_number}: trying to print uninitialized variable ${code.value}`
						else if(lexicon[i].type == "NUMBR") to_print += lexicon[i].value.toString();
						else if(lexicon[i].type == "NUMBAR")
						{
							if(Number.isInteger(lexicon[i].value)) to_print += lexicon[i].value.toFixed(1).toString();
							else to_print += lexicon[i].value.toString();
						}
						else to_print += lexicon[i].value;
						break;
					}
				}
				if(i==lexicon.length) return `Error in line ${line_number}: variable ${code.value} is undeclared`;
				break;
			default:
				error = recursive_operations(code, symbol_table, lexicon, line_number);
				if(!Array.isArray(error)) return error;
				[value, type] = error;
				if(type == "NUMBR") to_print += value.toString();
				else if(type == "NUMBAR")
				{
					if(Number.isInteger(value)) to_print += value.toFixed(1).toString();
					else to_print += value.toString();
				}
				else to_print += value;
		}

		code = symbol_table.shift();
	}
	console.log(to_print);
	return false;
}


// a function that handles variable declarations and initializations
const variable_dec_init = (symbol_table, lexicon,line_number) =>
{
	let code = symbol_table.shift(); // pops the first element of the array and gives it to code
	// value is expected to be a variable identifier
	const name = code.value;
	if (name == "IT") return `Error in line ${line_number}: IT is an implicit variable and cannot be redeclared`;
	let value = undefined
	let type = "NOOB";
	code = symbol_table.shift(); // gets next code
	if (code.value != '\n' && code.value != ",")
	{// iterates until it encounters a new line
		error = recursive_operations(code, symbol_table, lexicon,line_number);
		if(!Array.isArray(error)) return error;
		[value, type] = error;		
		code = symbol_table.shift(); // updating of iterator
	}

	variable = {name: name, value: value, type:type};
	lexicon.push(variable);
	return false;
}

const typecast_to_NUMBR = (value, type, name, line_number) =>
{
	if (operands[i].type == "NOOB") return `Error in line ${line_number}: NOOB value cannot by implicitly typecasted into a NUMBR`;
	else if (value == undefined) return `Error in line ${line_number}: variable ${name} is uninitialized before use`;
	else if (type == "TROOF")
	{
		value = (operands[i].value == "WIN")? 1 : 0;
	}
	else if (type == "NUMBAR") value = Math.floor(value);
	else
	{
		const check = operands[i].value.replace(/"/g, '');
		if (numbar_regex.test(check) || numbr_regex.test(check))
		{
			value = Number(check);
			value = Math.floor(value);
		}
		else return `Error in line ${line_number}: ${operands[i].value} cannot be typecasted into a NUMBR or a NUMBR`;
	}
	return value;
}

const typecast_to_TROOF = (value, type, name, line_number) =>
{
	if(type == "TROOF") return value;
	if (type == "NOOB") return "FAIL";
	else if(value == undefined) return `Error in line ${line_number}: variable ${name} is uninitialized before use`;
	else if(type == "NUMBAR" || type == "NUMBR") return ((value != 0)? "WIN": "FAIL");
	else
	{
		value = value.replace(/"/g, "");
		if(value == "WIN") return "WIN";
		else if (value == "FAIL") return "FAIL";
		else if(numbr_regex.test(value) || numbar_regex.test(value)) return ((Number(value) != 0)? "WIN": "FAIL");
		else return ((value != "")? "WIN": "FAIL");
	}
} 

const skip_control = (symbol_table, line_number) =>
{
	let code = symbol_table.shift();
	while(code.value != "OIC")
	{
		if(code.value == "\n") line_number++;
		else if(code.value == "O RLY") line_number = skip_control(symbol_table, line_number);
		else if(code.value == "WTF") line_number = skip_control(symbol_table, line_number);
		code = symbol_table.shift();
	}

	return line_number;
}

const if_else_control = (symbol_table, lexicon, line_number) =>
{
	let finished = false;
	let checker = {value:lexicon[0].value, type:lexicon[0].type};
	checker.value = typecast_to_TROOF(checker.value, checker.type);
	checker.type = "TROOF";
	let vars = [];
	let found = (checker.value == "WIN");
	let code = symbol_table.shift();
	while(code.value != "OIC")
	{
		if(found) break;
		switch(code.description)
		{
			case 'If-Else Delimiter Keyword': line_number = skip_control(symbol_table,line_number);
				break;
			case 'Line Break': line_number++;
				break;
			case 'Else-If Keyword':
				error = recursive_operations(code, symbol_table, lexicon, line_number);
				if(!Array.isArray(error)) return error;
				[checker.value, checker.type] = error;
				line_number++;
				checker.value = typecast_to_TROOF(checker.value, checker.type);
				checker.type = "TROOF";
				found = (checker.value == "WIN");
				break;
			case 'Else Keyword': found = true;
		}
		code = symbol_table.shift();
	}

	let to_continue = found;
	while(to_continue && code.value != "OIC")
	{
		switch(code.description)
		{
			case 'If-Else Delimiter Keyword': error = if_else_control(symbol_table, lexicon, line_number);
				if(!Number.isInteger(error)) return error;
				line_number = error;
				break;
			case 'Line Break': line_number++;
			case 'If Keyword':
			case 'Control Flow Delimiter':
			case 'Command Line Break': break;
			case 'Else-If Keyword': 
			case 'Else Keyword': to_continue = false;
				break;
			case 'Switch Case Delimiter Keyword': error = switch_control(symbol_table, lexicon, line_number);
				if(!Number.isInteger(error)) return error;
				line_number = error;
				break;
			case 'Variable Declaration Keyword': 
				error = variable_dec_init(symbol_table, lexicon,line_number);
				if(error) return error;
				line_number++;
				break;
			case 'Identifier': assignment_operation(code, symbol_table, lexicon, line_number);
				line_number++;
				break;
			case 'Output Keyword':
				error = output(symbol_table,lexicon,line_number);
				if(error) return error;
				break;
			case 'Input Keyword': error = ask_input(symbol_table, lexicon, line_number);
				if(error) return error;
				line_number++;
				break;
			default: error = recursive_operations(code, symbol_table, lexicon, line_number);
				if(!Array.isArray(error)) return error;
				[value, type] = error;
				lexicon[0].value = value;
				lexicon[0].type = type;
				line_number++;	
		}
		code = symbol_table.shift();
	}

	if(code.value != "OIC") line_number = skip_control(symbol_table, line_number);
	return line_number;
}


const execute_switch = (symbol_table, lexicon, line_number) =>
{
	let to_continue = true;
	let code = symbol_table.shift();
	while(to_continue && code.value != "OIC")
	{
		switch(code.description)
		{
			case 'If-Else Delimiter Keyword': error = if_else_control(symbol_table, lexicon, line_number);
				if(!Number.isInteger(error)) return error;
				line_number = error;
				break;
			case 'Switch Case Delimiter Keyword': error = switch_control(symbol_table, lexicon,line_number);
				if(!Number.isInteger(error)) return error;
				break;
			case 'Line Break': line_number++;
			case 'Control Flow Delimiter':
			case 'Command Line Break': break;
			case 'Break Keyword': to_continue = false;
				break;
			case 'Variable Declaration Keyword': 
				error = variable_dec_init(symbol_table, lexicon,line_number);
				if(error) return error;
				line_number++;
				break;
			case 'Identifier': assignment_operation(code, symbol_table, lexicon, line_number);
				line_number++;
				break;
			case 'Output Keyword':
				error = output(symbol_table,lexicon,line_number);
				if(error) return error;
				line_number++;
				break;
			case 'Input Keyword': error = ask_input(symbol_table, lexicon, line_number);
				if(error) return error;
				line_number++;
				break;
			case 'Case-Default Keyword':
			case 'Case Keyword': code = symbol_table.shift();
				break;
			default: error = recursive_operations(code, symbol_table, lexicon, line_number);
				if(!Array.isArray(error)) return error;
				[value, type] = error;
				lexicon[0].value = value;
				lexicon[0].type = type;
				line_number++;	
		}
		code = symbol_table.shift();
	}

	return [code.value, line_number];
}

const switch_control = (symbol_table, lexicon, line_number) =>
{
	const holder = {value:lexicon[0].value, type:lexicon[0].type};
	let to_break = false;
	let to_compare;
	let error;
	let code = symbol_table.shift();

	while(code.value != "OIC")
	{
		switch(code.description)
		{
			case 'Line Break': line_number++;
			case 'Command Line Break':
			case 'Control Flow Delimiter': break;
			case 'Switch Case Delimiter Keyword':
			case 'If-Else Delimiter Keyword': line_number = skip_control(symbol_table, line_number);
				break;
			case 'Case Keyword': error = recursive_operations(code, symbol_table,lexicon,line_number);
				if(!Array.isArray(error)) return error;
				[value, type] = error;
				to_compare = {value:value, type:type};
				if(holder.type == to_compare.type && holder.value == to_compare.value)
				{
					error = execute_switch(symbol_table, lexicon, line_number);
					if(!Array.isArray(error)) return error;
					line_number = error[1];
					to_break = true;
				}
				break;
			case 'Case-Default Keyword': error = execute_switch(symbol_table, lexicon, line_number);
				if(!Array.isArray(error)) return error;
				line_number = error[1];
				to_break = true;
				break;
		}
		if(to_break) break;
		code = symbol_table.shift();
	}
	if(error != undefined) code.value = error[0];
	if(code.value != "OIC") line_number = skip_control(symbol_table, line_number);
	return line_number;
}

const program_start = (symbol_table) =>
{
	removeComments(symbol_table); // removes comments in the symbol table
	let line_number = 1;
	let error;
	let code;
	let lexicon = [{name:"IT", value:undefined, type:"NOOB"}];
	while(symbol_table.length != 0)
	{
		code = symbol_table.shift();
		switch (code.description)
		{
			case 'Line Break': line_number++;
				break;
			case 'Command Line Break': break;
			case 'Variable Declaration Keyword': 
				error = variable_dec_init(symbol_table, lexicon,line_number);
				if(error) return error;
				line_number++;
				break;
			case 'Identifier': error = assignment_operation(code, symbol_table, lexicon, line_number);
				if(error) return error;
				line_number++;
				break;
			case 'Output Keyword':
				error = output(symbol_table,lexicon,line_number);
				if(error) return error;
				line_number++;
				break;
			case 'Input Keyword': error = ask_input(symbol_table, lexicon, line_number);
				if(error) return error;
				line_number++;
				break;
			case 'If Keyword':
			case 'Else-IF Keyword':
			case 'Else Keyword':
			case 'Flow-Control Delimiter Keyword':
			case 'Code Delimiter Keyword': break;
			case 'Switch Case Delimiter Keyword': error = switch_control(symbol_table, lexicon, line_number);
				if(!Number.isInteger(error)) return error;
				line_number = error;
				break;
			case 'If-Else Delimiter Keyword': error = if_else_control(symbol_table, lexicon, line_number);
				if(!Number.isInteger(error)) return error;
				line_number = error;
				break;
			default: error = recursive_operations(code, symbol_table, lexicon, line_number);
				if(!Array.isArray(error)) return error;
				[lexicon[0].value, lexicon[0].type] = error;
				line_number++;
		}	
	}

	for(let i = 0; i < lexicon.length; i++)
	{
		if (lexicon[i].type == "NUMBAR" && Number.isInteger(lexicon[i].value)) lexicon[i].value = parseFloat(lexicon[i].value.toFixed(1));
	}

	return lexicon
}

fs.readFile('./testcases/ifelse.lol', 'utf8', function(err, data){ 
    if(err) throw err;
    let error = syntax.parser(data,[],1);
    // console.log(error);
    if(!Array.isArray(error)) console.log(error);
    else
    {
    	let symbol_table = error[1];
    	console.log(program_start(symbol_table));	
    }
}); 
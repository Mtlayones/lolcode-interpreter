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
	return symbol_table;
}

// a function that recursively executes the line until it reaches a new line,
// enough operands is met, or MKAY is encountered
const recursive_operations = (code,symbol_table, lexicon, line_number) => 
{
	var cur_code = symbol_table.shift(); // gets the first element in the symbol table
	var value; // variable for storing value of operand
	var operands = [];// list of operands
	var type; // variable for storing the data type of the operand
	var req_ops = 2; // variable for checking the number of operands required, default is 2
	var to_break = false; // variable for checking if MKAY is encountered
	if (code.value == "NOT") req_ops = 1; // not requires only 1 operand
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
				[value, type, symbol_table] = error;
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

	var result;
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
	return [result, type, symbol_table];
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
		var op1 = operands.shift();
		var op2 = operands.shift();
		op1 = (op1.value == "WIN")
		op2 = (op2.value == "WIN")

		if (code == "BOTH OF") result = (op1 && op2);
		else if (code == "EITHER OF") result = (op1 || op2);
		else result = (op1 != op2);

		result = result ? "WIN" : "FAIL";
	}
	return [result,"TROOF",symbol_table];
}


const comparison_operations = (code, operands, line_number, symbol_table) =>
{
	var result;
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

	return [result, "TROOF", symbol_table];
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
			var result;	
			cur_code = symbol_table.shift();
			while(cur_code.value != "\n" && cur_code.value != ",")
			{
				
				switch(cur_code.description)
				{
					case 'Variable Assignment Keyword': break;
					case 'NUMBR Literal': value = Number(cur_code.value);
						type = "NUMBR";
						break;
					case 'NUMBAR Literal': value = Number(cur_code.value);
						type = "NUMBAR";
						break;
					case 'TROOF Literal': value = cur_code.value;
						type = "TROOF";
						break;
					case 'YARN Literal': value = cur_code.value;
						type = "YARN";
						break;
					case 'NOOB Type': value = undefined;
						type = "NOOB";
						break;
					case 'Identifier': 
						if (cur_code.value == code.value) return `Error on line ${line_number}: assigning variable of the same name`
						var j = 0;
						for (j; j<lexicon.length; j++)
						{
							if (lexicon[j].name == cur_code.value)
							{
								value = lexicon[j].value;
								type = lexicon[j].type;
							}
						}
						if (j == lexicon.length) return `Error on line ${line_number}: ${cur_code.value} is an undeclared variable`;
						break;
					default:
						error = recursive_operations(cur_code, symbol_table, lexicon, line_number);
						if(!Array.isArray(error)) return error;
						[value, type, symbol_table] = error;
				}
				cur_code = symbol_table.shift();
			}
			lexicon[i].value = value;
			lexicon[i].type = type;
			return 'success';
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
	return symbol_table;
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
				for (var i = 0; i<lexicon.length;i++)
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
					}
				}
				break;
			default:
				error = recursive_operations(code, symbol_table, lexicon, line_number);
				if(!Array.isArray(error)) return error;
				[value, type, symbol_table] = error;
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
	lexicon[0].value = to_print;
	lexicon[0].type = "YARN";
	console.log(lexicon[0].value)
	return symbol_table;
}


// a function that handles variable declarations and initializations
const variable_dec_init = (symbol_table, lexicon,line_number) =>
{
	var code = symbol_table.shift(); // pops the first element of the array and gives it to code
	// value is expected to be a variable identifier
	const name = code.value;
	var value = undefined
	var type = "NOOB";
	init = false; // will only be used in YARN types
	code = symbol_table.shift(); // gets next code
	while (code.value != '\n' && code.value != ",")
	{// iterates until it encounters a new line
		switch(code.description)
		{
			case "NUMBR Literal": value = Number(code.value);
				type = "NUMBR";
				break;
			case "NUMBAR Literal": value = Number(code.value);
				type = "NUMBAR";
				break;
			case "TROOF Literal": value = code.value;
				type = "TROOF";
				break;
			case "YARN Literal": value = code.value;
				type = "YARN";
				break;
			case "Type Keyword": code = symbol_table.shift();
				type = code.value;
				break;
			case "Identifier": if(code.value == "NOOB") break;
				var i = 0;
				for (i; i < lexicon.length; i++)
				{
					if (lexicon[i].name == code.value)
					{
						value = lexicon[i].value;
						type = lexicon[i].type
						break;
					}
				}
				if(i == lexicon.length) return `Error in line ${line_number}: variable ${code.value} is undeclared`;
				break;
			case "Variable Initialization Keyword": break;
			default:
				error = recursive_operations(code, symbol_table, lexicon,line_number);
				if(!Array.isArray(error)) return error;
				[value, type, symbol_table] = error;
		}
		code = symbol_table.shift(); // updating of iterator
	}

	variable = {name: name, value: value, type:type};
	lexicon.push(variable);
	return [symbol_table, lexicon];
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

const skip_nested_ifelse = (symbol_table, line_number) =>
{
	code = symbol_table.shift();
	while(code.value != "OIC")
	{
		if(code.value == "\n") line_number++;
		else if(code.value == "O RLY")
		{
			[symbol_table, line_number] = skip_nested_ifelse(symbol_table, line_number);
		}
		code = symbol_table.shift();
	}

	return [symbol_table, line_number];
}

const if_else_control = (symbol_table, lexicon, line_number) =>
{
	let finished = false;
	lexicon[0].value = typecast_to_TROOF(lexicon[0].value, lexicon[0].type);
	lexicon[0].type = "TROOF";
	let vars = [];
	let found = (lexicon[0].value == "WIN");
	code = symbol_table.shift();
	while(code.value != "OIC")
	{
		if(found) break;
		switch(code.description)
		{
			case 'If-Else Delimiter Keyword': 
				[symbol_table, line_number] = skip_nested_ifelse(symbol_table,line_number);
			case 'Line Break': line_number++;
				break;
			case 'Else-If Keyword':
				code = symbol_table.shift();
				error = recursive_operations(code, symbol_table, lexicon, line_number);
				if(!Array.isArray(error)) return error;
				[lexicon[0].value, lexicon[0].type, symbol_table] = error;
				line_number++;
				lexicon[0].value = typecast_to_TROOF(lexicon[0].value, lexicon[0].type);
				lexicon[0].type = "TROOF";
				found = (lexicon[0].value == "WIN");
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
				if(!Array.isArray(error)) return error;
				[symbol_table, line_number] = error;
				break;
			case 'Line Break': line_number++;
			case 'If Keyword':
			case 'Control Flow Delimiter':
			case 'Command Line Break': break;
			case 'Else-If Keyword': 
			case 'Else Keyword': to_continue = false;
				break;
			case 'Variable Declaration Keyword': 
				error = variable_dec_init(symbol_table, lexicon,line_number);
				if(!Array.isArray(error)) return error;
				[symbol_table, lexicon] = error;
				line_number++;
				break;
			case 'Identifier': assignment_operation(code, symbol_table, lexicon, line_number);
				line_number++;
				break;
			case 'Output Keyword':
				error = output(symbol_table,lexicon,line_number);
				if(!Array.isArray(error)) return error;
				symbol_table = error;
				line_number++;
				break;
			case 'Input Keyword': error = ask_input(symbol_table, lexicon, line_number);
				if(!Array.isArray(error)) return error;
				symbol_table = error;
				line_number++;
				break;
			default: error = recursive_operations(code, symbol_table, lexicon, line_number);
				if(!Array.isArray(error)) return error;
				[value, type, symbol_table] = error;
				lexicon[0].value = value;
				lexicon[0].type = type;
				line_number++;	
		}
		code = symbol_table.shift();
	}

	while(code.value != "OIC") code = symbol_table.shift();

	return [symbol_table, line_number];
}



const program_start = (symbol_table) =>
{
	var symbol_table = removeComments(symbol_table); // removes comments in the symbol table
	var line_number = 1;
	let result;
	let value;
	let type;
	let error;
	var lexicon = [{name:"IT", value:undefined, type:"NOOB"}];
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
				if(!Array.isArray(error)) return error;
				[symbol_table, lexicon] = error;
				line_number++;
				break;
			case 'Identifier': assignment_operation(code, symbol_table, lexicon, line_number);
				line_number++;
				break;
			case 'Output Keyword':
				error = output(symbol_table,lexicon,line_number);
				if(!Array.isArray(error)) return error;
				symbol_table = error;
				line_number++;
				break;
			case 'Input Keyword': error = ask_input(symbol_table, lexicon, line_number);
				if(!Array.isArray(error)) return error;
				symbol_table = error;
				line_number++;
				break;
			case 'If Keyword':
			case 'Else-IF Keyword':
			case 'Else Keyword':
			case 'Flow-Control Delimiter Keyword':
			case 'Code Delimiter Keyword': break;
			case 'If-Else Delimiter Keyword': error = if_else_control(symbol_table, lexicon, line_number);
				if(!Array.isArray(error)) return error;
				[symbol_table, line_number] = error;
				line_number++;
				break;
			default: error = recursive_operations(code, symbol_table, lexicon, line_number);
				if(!Array.isArray(error)) return error;
				[value, type, symbol_table] = error;
				lexicon[0].value = value;
				lexicon[0].type = type;
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
    	var symbol_table = error[1];
    	console.log(program_start(symbol_table));	
    }
}); 
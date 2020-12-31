/* eslint-disable default-case */
/* eslint-disable no-fallthrough */
/* eslint-disable no-useless-escape */
import { literal } from './lexemes';
// javascript has to float, they use number instead of
// integers and float

// a function that removes the comments and
// comment keyword identifiers in the symbol table
export const removeComments = (symbol_table) =>
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
const recursive_operations = (code,symbol_table, lexicon, func_table, line_number,handlePrefixChanges) => 
{
	let cur_code = symbol_table.shift(); // gets the first element in the symbol table
	let value; // variable for storing value of operand
	let operands = [];// list of operands
	let type; // variable for storing the data type of the operand
	let req_ops = 2; // variable for checking the number of operands required, default is 2
	let to_break = false; // variable for checking if MKAY is encountered
	const req_op_1 = ["NOT", "ITZ", "MEBBE", "R", "OMG", "FOUND"];
	const no_req = ["ALL OF", "ANY OF", "SMOOSH", "I IZ"];
	const literals = ["NUMBR Literal", "NUMBAR Literal", "YARN Literal", "TROOF Literal"];
	let error;
	if(literals.indexOf(code.description) > -1)
	{
		type = code.description.split(" ")[0];
		if(type === "NUMBAR" || type === "NUMBR") value = Number(code.value);
		else value = code.value;
		return [value, type];
	}
	else if(code.value === "NOOB") return [undefined, "NOOB"];
 	else if (req_op_1.indexOf(code.value) > -1) req_ops = 1; // not requires only 1 operand
	else if (no_req.indexOf(code.value) > -1) req_ops = -1; // infinite operands

	while(cur_code.value !== "\n" && cur_code.value !== ",")
	{
		switch(cur_code.description)
		{
			case "NUMBR Literal": operands.push({value:Number(cur_code.value), type:"NUMBR", name:"Literal"});
				break;
			case "NUMBAR Literal": operands.push({value:Number(cur_code.value), type:"NUMBAR", name: "Literal"});
				break;
			case "YARN Literal": operands.push({value:cur_code.value.slice(1,-1), type:"YARN", name: "Literal"});
				break;
			case "TROOF Literal": operands.push({value:cur_code.value, type:"TROOF", name: "Literal"});
				break;
			case "Type Keyword": cur_code = symbol_table.shift();
				operands.push({value:undefined, type:cur_code.value, name:"Type"});
				break;
			case "Identifier": 
				if(cur_code.value === "NOOB")
				{
					operands.push({value:undefined, type:"NOOB"})
					break;
				}
				let i;
				for (i=0; i<lexicon.length; i++)
				{
					if(lexicon[i].name === cur_code.value)
					{
						operands.push({value:lexicon[i].value, type:lexicon[i].type,name:lexicon[i].name});
						break;
					}
				}
				if (i === lexicon.length) return `Error in line ${line_number}: variable ${cur_code.value} is undeclared`;
				break;
			case 'Function Identifier': operands.push(cur_code.value);
				break;
			case "Infinite Delimiter Keyword": to_break = true;
			case "Parameter Delimiter Keyword":
			case "Operand Delimiter Keyword": break;
			default:
				error = recursive_operations(cur_code, symbol_table, lexicon, func_table, line_number,handlePrefixChanges);
				if(!Array.isArray(error)) return error;
				[value, type] = error;
				operands.push({value:value, type:type});
		}
		if (req_ops === operands.length || to_break) break;
		cur_code = symbol_table.shift();
	}

	if(cur_code.value === "\n") symbol_table.unshift(cur_code);

	if(req_ops === operands.length || to_break)
	{
		const arith = ["SUM OF", "DIFF OF", "PRODUKT OF", "QUOSHUNT OF", "MOD OF", "BIGGR OF", "SMALLR OF"];
		const bool = ["BOTH OF", "EITHER OF", "WON OF", "NOT", "ALL OF", "ANY OF"];
		const comparison = ["BOTH SAEM", "DIFFRINT"];

		if(arith.indexOf(code.value) >-1) return arithmetic_operations(code.value,operands,line_number);
		else if (bool.indexOf(code.value) > -1) return boolean_operations(code.value,operands, line_number);
		else if (comparison.indexOf(code.value) > -1) return comparison_operations(code.value,operands, line_number);
		else if (code.value === "MAEK") {if(operands[0].type !== operands[1].type) return typecast(operands[0], operands[1].type,line_number);}
		else if (code.value === "I IZ") return eval_function(operands, lexicon, func_table, line_number,handlePrefixChanges)
		else if (code.value === "SMOOSH") return SMOOSH(operands, line_number);
		return [operands[0].value, operands[0].type];
	}
	else if (code.value === "SMOOSH") return SMOOSH(operands, line_number);
	else if(operands.length < req_ops) return `Error in line ${line_number}: function ${code.value} requires ${req_ops} operands, only received ${operands.length} operands`;
	else return `Error in line ${line_number}: ${code.value} expecting MKAY keyword at the end`;
}

const arithmetic_operations = (code, operands, line_number) =>
{
	let i = 0;
	for (i; i<2; i++)
	{
		if (operands[i].type === "NOOB") return `Error in line ${line_number}: NOOB value cannot by implicitly typecasted into a NUMBR/NUMBAR`;
		else if (operands[i].type !== "NOOB" && operands[i].value === undefined) return `Error in line ${line_number}: variable ${operands[i].name} is uninitialized before use`;
		else if (operands[i].type === "TROOF")
		{
			operands[i].value = (operands[i].value === "WIN")? 1: 0;
			operands[i].type = "NUMBR";
		}
		else if (operands[i].type === "YARN")
		{
			const check = operands[i].value;
			if (literal['NUMBAR'][0].test(check))
			{
				operands[i].value = Number(check);
				operands[i].type = "NUMBAR";
			}
			else if (literal['NUMBR'][0].test(check))
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
	if (code === "SUM OF") result = op1.value + op2.value;
	else if (code === "DIFF OF") result = op1.value - op2.value;
	else if (code === "PRODUKT OF") result = op1.value * op2.value;
	else if (code === "QUOSHUNT OF") result = op1.value / op2.value;
	else if (code === "MOD OF") result = op1.value % op2.value;
	else if (code === "BIGGR OF") result = Math.max(op1.value,op2.value);
	else result = Math.min(op1.value,op2.value);

	if(op1.type === "NUMBAR" || op2.type === "NUMBAR") type = "NUMBAR";
	else
	{
		result = Math.floor(result);
		type = "NUMBR";
	} 
	return [result, type];
}

const boolean_operations = (code, operands, line_number) =>
{
	let i;
	let error;
	for (i = 0; i<operands.length; i++){
		if(operands[i].type !== "TROOF")
		{
			let name = (operands[i].name !== undefined)? operands[i].name : "";
			error = typecast_to_TROOF(operands[i].value, operands[i].type, name, line_number);
			if(!Array.isArray(error)) return error;
			operands[i].value = error[0];
		}
	}
	let result;
	if (code === "NOT")
	{
		const op1 = operands.shift();
		result = (op1.value === "WIN")? "FAIL" : "WIN";
	}
	else if (code === "ALL OF")
	{
		result = "WIN";
		for(i = 0; i<operands.length; i++)
		{
			if(operands[i].value === "FAIL")
			{
				result = "FAIL";
				break;
			}
		}
	}
	else if (code === "ANY OF")
	{
		result = "FAIL";
		for(i = 0; i<operands.length; i++)
		{
			if(operands[i].value === "WIN")
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
		op1 = (op1.value === "WIN")
		op2 = (op2.value === "WIN")

		if (code === "BOTH OF") result = (op1 && op2);
		else if (code === "EITHER OF") result = (op1 || op2);
		else result = (op1 !== op2);

		result = result ? "WIN" : "FAIL";
	}
	return [result,"TROOF"];
}


const comparison_operations = (code, operands, line_number) =>
{
	let result;
	const op1 = operands.shift();
	const op2 = operands.shift();
	result = (op1.type === op2.type); // checks if op1 & op2 has same data types
	if (result) result = (op1.value === op2.value);
	// checks if true, if yes, checks if their value is equal and assigns it to result
	if (code === "DIFFRINT") result = !result;
	// checks if operation is different, if yes, negates result since all comparisons done is equality
	//conversion of boolean value to TROOF value
	if (result) result = "WIN"; // checks if result is true
	else result = "FAIL";

	return [result, "TROOF"];
}
// if main lex == [], assignemnt is done on main
// else assignemnt is done on flow-control statements and lexicon is FCS lexicon
const assignment_operation = (code, symbol_table, lexicon, func_table,line_number,handlePrefixChanges) =>
{
	let i = 0;
	let error;
	for (i; i<lexicon.length; i++)
	{
		if (lexicon[i].name === code.value)
		{
			let cur_code = symbol_table.shift();
			if (cur_code.value === "IS NOW")
			{
				cur_code = symbol_table.shift();
				cur_code = symbol_table.shift();
				error = typecast(lexicon[i],cur_code.value,line_number);
			}
			else if (cur_code.value === "\n")
			{
				lexicon[0].value = lexicon[i].value;
				lexicon[0].type = lexicon[i].type;
			}
			else error = recursive_operations(cur_code, symbol_table, lexicon, func_table,line_number,handlePrefixChanges);
			
			if(!Array.isArray(error)) return error;
			[lexicon[i].value, lexicon[i].type] = error;
			return false;
		}
	}
	if (i === lexicon.length) return `Error on line ${line_number}: assigning value to an undeclared variable ${code.value}`;
}

const SMOOSH = (operands, line_number) =>
{
	let i;
	let concat = "";
	for(i = 0; i<operands.length; i++)
	{
		if(operands[i].type !== "YARN")
		{
			let name = operands[i].name;
			let error = typecast_to_YARN(operands[i].value, operands[i].type, name, line_number);
			if(!Array.isArray(error)) return error;
			[operands[i].value, operands[i].type] = error;
		}
		concat += operands[i].value;
	}
	return [concat, "YARN"];
}


const ask_input = (symbol_table, lexicon, line_number) => 
{
	let variable = symbol_table.shift();
	let input = prompt("");
	let type = "YARN";
	if(literal['NUMBR'][0].test(input))
	{
		input = Number(input);
		type = "NUMBR";
	}
	else if(literal['NUMBAR'][0].test(input))
	{
		input = Number(input);
		type = "NUMBAR";
	}
	else if(input === "WIN" || input === "FAIL") type = "TROOF";

	let i = 0;
	for(;i<lexicon.length; i++) if (lexicon[i].name === variable.value) break;

	if(i === lexicon.length) return `Error in line ${line_number}: GIMME is trying to assign to an undeclared variable`;
	lexicon[i].value = input;
	lexicon[i].type = type;
	return false;
}

const special_characters = (yarn, lexicon, line_number) =>
{
	const reg_newline = /\:\)/g;
	const reg_tab = /\:\>/g;
	const reg_beep = /\:\o/g;
	const reg_doublequote = /\:\'/g;
	const reg_colon = /\:\:/g;
	const reg_variable = /\:\{[a-zA-Z][a-zA-Z0-9]*\}/g
	const reg_error = /\:[^\:]/;

	// if(reg_error.test(yarn) && reg_variable.test(yarn)) return `Error in line ${line_number}: escape character found without special character`;
	let vars = yarn.match(reg_variable);
	if(vars != null)
	{
		let i;
		let j;
		let value;
		let new_str;
		let to_replace = [];
		for(i = 0; i<vars.length; i++)
		{	
			new_str = vars[i].slice(2,-1);
			for(j = 0; j<lexicon.length; j++)
			{
				if(lexicon[j].name === new_str)
				{
					if(lexicon[j].value === undefined) return `Error in line ${line_number}: variable ${new_str} is uninitialized, NOOB cannot be typecasted into YARN`;
					else if(lexicon[j].type === "NUMBR") value = lexicon[j].value.toString();
					else if(lexicon[j].type === "NUMBAR") value = truncate(lexicon[j].value);
					else value = lexicon[j].value;
					to_replace.push(value);
					break;
				}
			}
			if(j === lexicon.length) return `Error in line ${line_number}: variable ${vars[i]} is undeclared`;
		}
		for(i = 0; i<vars.length; i++) yarn = yarn.replace(vars[i], to_replace[i]);
	}
	yarn = yarn.replace(reg_newline, "\n");
	yarn = yarn.replace(reg_tab, "\t");
	yarn = yarn.replace(reg_beep, "\g");
	yarn = yarn.replace(reg_doublequote, "\"");
	let sub = yarn.replace(reg_colon, "");
	if(reg_error.test(sub)) return `Error in line ${line_number}: escape character found without a special character`;
	yarn = yarn.replace(reg_colon, "\:");
	return [yarn];
}

const truncate = (yarn) =>
{
	yarn = yarn.toString();
	yarn = yarn.split(".")
	if(yarn.length === 1) yarn = yarn[0] + ".00";
	else
	{
		if (yarn[1].length === 1) yarn[1] = yarn[1] + "0";
		else if(yarn[1].length > 2) yarn[1] = yarn[1].slice(0,2);
		yarn = yarn[0] + "." + yarn[1];
	}
	return yarn;
}


/* NOTES OF SPECIAL CHARACTERS
:) -> newline (\n)
:> -> tab (\t)
:o -> beep (\g)
:" -> double quote (")
:: -> colon (:)
:{var} -> typecasts value of var into string and adds to the string
*/
const output = (symbol_table,lexicon, func_table,line_number, handlePrefixChanges) =>
{
	let code = symbol_table.shift();
	let error;
	let value;
	let type;
	let to_print = "";
	let has_newline = true;
	while(code.value !== "\n" && code.value !== ",")
	{
		switch(code.description)
		{
			case "NUMBAR Literal": to_print += truncate(code.value);
				break;
			case 'No newline output': has_newline = false;
				break;
			case "NUMBR Literal":
			case "TROOF Literal": to_print += code.value;
				break;
			case "YARN Literal": to_print += code.value.slice(1,-1);
				break;
			case "Identifier":
				let i = 0;
				for (i; i<lexicon.length;i++)
				{
					if (lexicon[i].name === code.value)
					{
						if(lexicon[i].value === undefined) return `Error in line ${line_number}: trying to print uninitialized variable ${code.value}`
						else if(lexicon[i].type === "NUMBR") to_print += lexicon[i].value.toString();
						else if(lexicon[i].type === "NUMBAR") to_print += truncate(lexicon[i].value);
						else to_print += lexicon[i].value;
						break;
					}
				}
				if(i===lexicon.length) return `Error in line ${line_number}: variable ${code.value} is undeclared`;
				break;
			default:
				error = recursive_operations(code, symbol_table, lexicon, func_table, line_number,handlePrefixChanges);
				if(!Array.isArray(error)) return error;
				[value, type] = error;
				if(type === "NUMBR") to_print += value.toString();
				else if(type === "NUMBAR") to_print += truncate(value)
				else to_print += value;
		}
		code = symbol_table.shift();
	}

	to_print += (has_newline)? "\n": "";
	error = special_characters(to_print,lexicon,line_number);
	if(!Array.isArray(error)) return error;
	to_print = error[0];
	handlePrefixChanges(to_print);
	console.log(to_print);
	return false;
}

// a function that handles variable declarations and initializations
const variable_dec_init = (symbol_table, lexicon, func_table, line_number,handlePrefixChanges) =>
{
	let code = symbol_table.shift(); // pops the first element of the array and gives it to code
	let i;
	// value is expected to be a variable identifier
	const name = code.value;

	for(i=0; i<func_table; i++)
	{
		if(func_table[i].name === name) return `Error in line ${line_number}: ${name} is already a function identifier`;
	}

	if (name === "IT") return `Error in line ${line_number}: IT is an implicit variable and cannot be redeclared`;
	for (i=1;i<lexicon.length; i++) if(lexicon[i].name === name) break;
	let value = undefined
	let type = "NOOB";
	let error;
	code = symbol_table.shift(); // gets next code
	if (code.value !== '\n' && code.value !== ",")
	{// iterates until it encounters a new line
		error = recursive_operations(code, symbol_table, lexicon, func_table,line_number,handlePrefixChanges);
		if(!Array.isArray(error)) return error;
		[value, type] = error;		
		code = symbol_table.shift(); // updating of iterator
	}

	if(i === lexicon.length)
	{
		let variable = {name: name, value: value, type:type};
		lexicon.push(variable);
	}
	else
	{
		lexicon[i].value = value;
		lexicon[i].type = type;	
	} 
	return false;
}

const typecast = (operand, type, line_number) =>
{
	let value;
	if(type === "YARN") value = typecast_to_YARN(operand.value, operand.type, operand.name, line_number);
	else if(type === "NUMBR") value = typecast_to_NUMBR(operand.value, operand.type, operand.name, line_number);
	else if(type === "NUMBAR") value = typecast_to_NUMBAR(operand.value, operand.type, operand.name, line_number);
	else if(type === "TROOF") value = typecast_to_TROOF(operand.value, operand.type, operand.name, line_number);
	else return `Error in line ${line_number}: typecasting into NOOB is not allowed`;
	if(!Array.isArray(value)) return value;
	return value;
}

const typecast_to_YARN = (value, type, name, line_number) =>
{
	if(type === "NOOB") return `Error in line ${line_number}: cannot typecast NOOB to YARN`;
	else if(value === undefined) return `Error in line ${line_number}:variable ${name} is uninitialized`;
	else if (type === "NUMBR" || type === "NUMBAR") value = value.toString();
	return [value, "YARN"];
}

const typecast_to_NUMBR = (value, type, name, line_number) =>
{
	if (type === "NOOB") return `Error in line ${line_number}: NOOB value cannot by implicitly typecasted into a NUMBR`;
	else if (value === undefined) return `Error in line ${line_number}: variable ${name} is uninitialized before use`;
	else if (type === "TROOF") value = (value === "WIN")? 1 : 0;
	else if (type === "NUMBAR") value = Math.floor(value);
	else
	{
		if (literal['NUMBAR'][0].test(value) || literal['NUMBR'][0].test(value))
		{
			value = Number(value);
			value = Math.floor(value);
		}
		else return `Error in line ${line_number}: ${value} cannot be typecasted into a NUMBR`;
	}
	return [value, "NUMBR"];
}

const typecast_to_NUMBAR = (value, type, name, line_number) =>
{
	if (type === "NOOB") return `Error in line ${line_number}: NOOB value cannot by implicitly typecasted into a NUMBR`;
	else if (value === undefined) return `Error in line ${line_number}: variable ${name} is uninitialized before use`;
	else if (type === "TROOF") value = (value === "WIN")? 1 : 0;
	else if (type === "YARN")
	{
		// const check = value;
		if (literal['NUMBAR'][0].test(value) || literal['NUMBR'][0].test(value)) value = Number(value);
		else return `Error in line ${line_number}: ${value} cannot be typecasted into a NUMBAR`;
	}
	return [value,"NUMBAR"];	
}

// return [value, "TROOF"] or error prompt
const typecast_to_TROOF = (value, type, name, line_number) =>
{
	if (type === "NOOB") return ["FAIL","TROOF"];
	else if(value === undefined) return `Error in line ${line_number}: variable ${name} is uninitialized before use`;
	else if(type === "NUMBAR" || type === "NUMBR") value = (value !== 0)? "WIN": "FAIL";
	else
	{
		if(value === "WIN") value =  "WIN";
		else if (value === "FAIL") value = "FAIL";
		else if(literal['NUMBR'][0].test(value) || literal['NUMBAR'][0].test(value)) value = (Number(value) !== 0)? "WIN": "FAIL";
		else value = (value !== "")? "WIN": "FAIL";
	}
	return [value,"TROOF"];
} 

// return line number
const skip_control = (symbol_table, line_number) =>
{
	let code = symbol_table.shift();
	while(code.value !== "OIC")
	{
		if(code.value === "\n") line_number++;
		else if(code.value === "O RLY") line_number = skip_control(symbol_table, line_number);
		else if(code.value === "WTF") line_number = skip_control(symbol_table, line_number);
		code = symbol_table.shift();
	}

	return line_number;
}

// return [line_number, found_break] or error prompt
const if_else_control = (symbol_table, lexicon, func_table, line_number, switch_loop,handlePrefixChanges) =>
{
	let checker = {value:lexicon[0].value, type:lexicon[0].type};
	let error = typecast_to_TROOF(checker.value, checker.type);
	if(!Array.isArray(error)) return error;
	[checker.value, checker.type] = error;
	const prev_length = lexicon.length;
	let found = (checker.value === "WIN");
	let code = symbol_table.shift();
	let prev_func = func_table.length;
	while(code.value !== "OIC")
	{
		if(found) break;
		switch(code.description)
		{
			case 'Switch Case Delimiter Keyword':
			case 'If-Else Delimiter Keyword': line_number = skip_control(symbol_table,line_number);
				break;
			case 'Loop Delimiter Keyword': error = skip_loop(symbol_table,line_number,0);
				line_number = error[1];
				symbol_table.splice(0,error[0]+1);
				break;
			case 'Line Break': line_number++;
				break;
			case 'Else-If Keyword':
				error = recursive_operations(code, symbol_table, lexicon, func_table,line_number,handlePrefixChanges);
				if(!Array.isArray(error)) return error;
				[checker.value, checker.type] = error;
				line_number++;
				error = typecast_to_TROOF(checker.value, checker.type);
				if(!Array.isArray(error)) return error;
				[checker.value, checker.type] = error;
				found = (checker.value === "WIN");
				break;
			case 'Else Keyword': found = true;
		}
		code = symbol_table.shift();
	}

	let found_break = false;
	let to_continue = found;
	while(to_continue && code.value !== "OIC")
	{
		switch(code.description)
		{
			case 'If-Else Delimiter Keyword': error = if_else_control(symbol_table, lexicon, func_table ,line_number, switch_loop,handlePrefixChanges);
				if(!Array.isArray(error)) return error;
				[line_number,found_break] = error;
				if(found_break) to_continue = false;
				break;
			case 'Line Break': line_number++;
			case 'If Keyword':
			case 'Control Flow Delimiter':
			case 'Command Line Break': break;
			case 'Else-If Keyword': 
			case 'Else Keyword': to_continue = false;
				break;
			case 'Function Delimeter Keyword':
				error = get_function(symbol_table, lexicon, func_table, line_number);
				if(error) return error;
				break;
			case 'Loop Delimiter Keyword': error = loop(symbol_table, lexicon, func_table ,line_number,handlePrefixChanges);
				if(!Number.isInteger(error)) return error;
				line_number = error;
				break;
			case 'Break Keyword': if(!switch_loop) return `Error in line ${line_number}: GTFO encountered while not inside a switch case or a loop`;
				to_continue = false;
				found_break = true;
				break; 
			case 'Switch Case Delimiter Keyword': error = switch_control(symbol_table, lexicon, func_table ,line_number,handlePrefixChanges);
				if(!Number.isInteger(error)) return error;
				line_number = error;
				break;
			case 'Variable Declaration Keyword': 
				error = variable_dec_init(symbol_table, lexicon, func_table ,line_number,handlePrefixChanges);
				if(error) return error;
				line_number++;
				break;
			case 'Identifier': assignment_operation(code, symbol_table, lexicon, func_table, line_number,handlePrefixChanges);
				line_number++;
				break;
			case 'Output Keyword':
				error = output(symbol_table, lexicon, func_table ,line_number,handlePrefixChanges);
				if(error) return error;
				break;
			case 'Input Keyword': error = ask_input(symbol_table, lexicon,line_number);
				if(error) return error;
				line_number++;
				break;
			default: error = recursive_operations(code, symbol_table, lexicon, func_table,line_number,handlePrefixChanges);
				if(!Array.isArray(error)) return error;
				[lexicon[0].value, lexicon[0].type] = error;
				line_number++;	
		}
		code = symbol_table.shift();
	}

	const to_remove = lexicon.length - prev_length;
	const del_func = func_table.length - prev_func;
	if(to_remove > 0) lexicon.splice(-to_remove,to_remove);
	if(del_func > 0) func_table.splice(-del_func, del_func);
	if(code.value !== "OIC") line_number = skip_control(symbol_table, line_number);
	return [line_number, found_break];
}

// return [code.value, line number] or error prompt
const execute_switch = (symbol_table, lexicon, func_table, line_number,handlePrefixChanges) =>
{
	let to_continue = true;
	let found_break;
	let value;
	let type;
	let error;
	let code = symbol_table.shift();
	while(to_continue && code.value !== "OIC")
	{
		code = symbol_table.shift();
		switch(code.description)
		{
			case 'If-Else Delimiter Keyword': error = if_else_control(symbol_table, lexicon, func_table ,line_number, true,handlePrefixChanges);
				if(!Array.isArray(error)) return error;
				[line_number,found_break] = error;
				if(found_break) to_continue = false;
				break;
			case 'Switch Case Delimiter Keyword': error = switch_control(symbol_table, lexicon, func_table ,line_number,handlePrefixChanges);
				if(!Number.isInteger(error)) return error;
				break;
			case 'Function Delimeter Keyword':
				error = get_function(symbol_table, lexicon, func_table, line_number);
				if(error) return error;
				break;
			case 'Line Break': line_number++;
			case 'Control Flow Delimiter':
			case 'Command Line Break': break;
			case 'Flow-Control Delimiter Keyword':
			case 'Break Keyword': to_continue = false;
				break;
			case 'Loop Delimiter Keyword': error = loop(symbol_table, lexicon, func_table ,line_number,handlePrefixChanges);
				if(!Number.isInteger(error)) return error;
				line_number = error;
				break;
			case 'Variable Declaration Keyword': 
				error = variable_dec_init(symbol_table, lexicon, func_table ,line_number,handlePrefixChanges);
				if(error) return error;
				line_number++;
				break;
			case 'Identifier': assignment_operation(code, symbol_table, lexicon, func_table, line_number,handlePrefixChanges);
				line_number++;
				break;
			case 'Output Keyword':
				error = output(symbol_table, lexicon, func_table ,line_number,handlePrefixChanges);
				if(error) return error;
				line_number++;
				break;
			case 'Input Keyword': error = ask_input(symbol_table, lexicon,line_number);
				if(error) return error;
				line_number++;
				break;
			case 'Case-Default Keyword':
			case 'Case Keyword': code = symbol_table.shift();
				break;
			default: error = recursive_operations(code, symbol_table, lexicon, func_table,line_number,handlePrefixChanges);
				if(!Array.isArray(error)) return error;
				[value, type] = error;
				lexicon[0].value = value;
				lexicon[0].type = type;
				line_number++;	
		}
	}

	return [code.value, line_number];
}

// return line number, or error prompt
const switch_control = (symbol_table, lexicon, func_table, line_number,handlePrefixChanges) =>
{
	const holder = {value:lexicon[0].value, type:lexicon[0].type};
	let to_break = false;
	let to_compare;
	let value;
	let type;
	let error;
	const prev_length = lexicon.length;
	let prev_func = func_table.length;
	let code = symbol_table.shift();

	while(code.value !== "OIC")
	{
		switch(code.description)
		{
			case 'Line Break': line_number++;
			case 'Command Line Break':
			case 'Control Flow Delimiter': break;
			case 'Switch Case Delimiter Keyword':
			case 'If-Else Delimiter Keyword': line_number = skip_control(symbol_table, line_number);
				break;
			case 'Loop Delimiter Keyword': error = skip_loop(symbol_table,line_number,0);
				line_number = error[1];
				symbol_table.splice(0,error[0]+1);
				break;
			case 'Case Keyword':
				error = recursive_operations(code, symbol_table, lexicon, func_table, line_number,handlePrefixChanges);
				if(!Array.isArray(error)) return error;
				[value, type] = error;
				to_compare = {value:value, type:type};
				if((holder.type === to_compare.type) && (holder.value === to_compare.value))
				{
					error = execute_switch(symbol_table, lexicon, func_table ,line_number,handlePrefixChanges);
					if(!Array.isArray(error)) return error;
					line_number = error[1];
					to_break = true;
				}
				break;
			case 'Case-Default Keyword':
				error = execute_switch(symbol_table, lexicon, func_table ,line_number,handlePrefixChanges);
				if(!Array.isArray(error)) return error;
				line_number = error[1];
				to_break = true;
				break;
		}
		if(to_break) break;
		code = symbol_table.shift();
	}

	const to_remove = lexicon.length - prev_length;
	const del_func = func_table.length - prev_func;
	if(to_remove > 0) lexicon.splice(-to_remove,to_remove);
	if(del_func > 0) func_table.splice(-del_func, del_func);
	if(code.value !== "OIC" && error[0] !== "OIC") line_number = skip_control(symbol_table, line_number);
	return line_number;
}

// skiploop, hopp
const skip_loop = (symbol_table, line_number,index) =>
{
	while(symbol_table[index].value !== "IM OUTTA") 
	{
		index++;
		if(symbol_table[index].value === "\n") line_number++;
		else if (symbol_table[index].value === "IM IN") [index, line_number] = skip_loop(symbol_table, line_number, index);
	}
	index +=2;
	return [index, line_number];
}

const get_function = (symbol_table, lexicon, func_table, line_number) =>
{
	let code_list = [];
	let code = symbol_table.shift();
	let name = code.value
	let error;
	for(let i = 0; i<lexicon.length; i++)
	{
		if(lexicon[i].name === name) return `Error in line ${line_number}: ${name} is already a variable identifier`;
	}
	
	let parameters = [];
	while(code.value !== "\n")
	{
		if(code.description === "Parameter Identifier") parameters.push(code.value);
		code_list.push(code);
		code = symbol_table.shift();
	}
	while(code.value !== "IF U SAY SO")
	{
		if(code.description === "Function Delimeter Keyword")
		{
			while(code.value !== "IF U SAY SO")
			{
				code_list.push(code);
				code = symbol_table.shift();
			}
		}
		code_list.push(code);
		code = symbol_table.shift();
	}
	code_list.push(code);
	code = code_list.shift();
	while(code.value !== "\n") code = code_list.shift();

	const new_func = {name:name, parameters:parameters, arity:parameters.length, code:code_list, line:line_number};
	for (let i = 0; i<func_table.length; i++)
	{
		if(func_table[i].name === name)
		{
			if(func_table[i].arity === parameters.length) return `Error in line ${line_number}: function ${name} declared twice`;
			else break;
		}
	}
	func_table.push(new_func);
	return false;
}

const eval_function = (operands, lexicon, func_table, line_number,handlePrefixChanges) =>
{
	const name = operands.shift();
	const prev_func = func_table.length;
	const prev_length = lexicon.length;
	let i = 0;
	let pos_arity = [];
	for(i;i<func_table.length; i++)
	{
		if(name === func_table[i].name) 
		{
			if(operands.length === func_table[i].arity) break;
			else pos_arity.push(func_table[i].arity);
		}
	}
	if(i === func_table.length) 
	{
		if(pos_arity.length === 0) return `Error in line ${line_number}: function ${name} is not declared`;
		else
		{
			let to_print = "";
			if(pos_arity.length === 1) return `Error in line ${line_number}: function ${name} accepts ${pos_arity[0]} operands, but got ${operands.length} operands`;
			for(i=0; i<pos_arity.length-1; i++) to_print += pos_arity[i] + ", ";
			to_print += `or ${pos_arity[pos_arity.length-1]} `;
			return `Error in line ${line_number}: function ${name} accepts ${to_print}operands, but got ${operands.length} operands`;
		}
	}

	let j = 0;
	let k = 0;
	let param;

	while(operands.length !== 0)
	{
		param = operands.shift();
		for(; k<lexicon.length; k++)
		{
			if(lexicon[k].name === func_table[i].parameters[j])
			{
				lexicon[k].value = param.value;
				lexicon[k].type = param.type;
				break;
			}
		}
		if(k === lexicon.length) lexicon.push({value:param.value, type:param.type, name:func_table[i].parameters[j]});
		j++;
	}	

	line_number = func_table[i].line;

	let cur_table = func_table[i].code.slice(0);
	let code = cur_table.shift();
	let error;
	while(code.value !== "IF U SAY SO")
	{
		switch(code.description)
		{
			case 'Line Break': line_number++;
			case 'Command Line Break': break;
			case 'Function Return Keyword': error = recursive_operations(code, cur_table,lexicon, func_table, line_number,handlePrefixChanges);
				return error;
			case 'Function Delimeter Keyword':
				error = get_function(cur_table, lexicon, func_table, line_number);
				if(error) return error;
				break;
			case 'Variable Declaration Keyword': 
				error = variable_dec_init(cur_table, lexicon, func_table, line_number,handlePrefixChanges);
				if(error) return error;
				line_number++;
				break;
			case 'Identifier':
				if(code.value === "NOOB")
				{
					lexicon[0].value = undefined;
					lexicon[0].type = "NOOB";
					break;
				}
				error = assignment_operation(code, cur_table, lexicon, func_table, line_number,handlePrefixChanges);
				if(error) return error;
				line_number++;
				break;
			case 'Output Keyword':
				error = output(cur_table, lexicon, func_table ,line_number,handlePrefixChanges);
				if(error) return error;
				line_number++;
				break;
			case 'Input Keyword': error = ask_input(cur_table, lexicon,line_number);
				if(error) return error;
				line_number++;
				break;
			case 'Code Delimiter Keyword': break;
			case 'Switch Case Delimiter Keyword': error = switch_control(cur_table, lexicon, func_table ,line_number,handlePrefixChanges);
				if(!Number.isInteger(error)) return error;
				line_number = error;
				break;
			case 'Loop Delimiter Keyword':
				if(code.value === "IM IN") error = loop(cur_table, lexicon, func_table ,line_number,handlePrefixChanges);
				if(!Number.isInteger(error)) return error;
				break;
			case 'If-Else Delimiter Keyword': error = if_else_control(cur_table, lexicon, func_table ,line_number,false,handlePrefixChanges);
				if(!Array.isArray(error)) return error;
				line_number = error[0];
				break;
			default: error = recursive_operations(code, cur_table, lexicon, func_table, line_number,handlePrefixChanges);
				if(!Array.isArray(error)) return error;
				[lexicon[0].value, lexicon[0].type] = error;
				line_number++;	
		}
		code = cur_table.shift();
	}

	const to_remove = lexicon.length - prev_length;
	const del_func = func_table.length - prev_func;
	if(to_remove > 0) lexicon.splice(-to_remove, to_remove);
	console.log("me is del func",del_func)
	if(del_func > 0) func_table.splice(-del_func,del_func);
	return [lexicon[0].value, lexicon[0].type];

}

// return current line number or error prompt
const loop = (symbol_table, lexicon, func_table,line_number,handlePrefixChanges) =>
{
	let i = 0;
	let update;
	let cur_line_num = line_number;
	const prev_length = lexicon.length;
	let loop_label
	let loop_var;
	let loop_start;
	let check;
	for(; i<symbol_table.length; i++)
	{
		if(symbol_table[i].value === "IM OUTTA")
		{
			i+=2;
			if(symbol_table[i].value !== loop_label) return `Error in line ${cur_line_num}: Loop labels are mismatched`;
			break;
		}
		else if (symbol_table[i].value === "IM IN") [i,cur_line_num] = skip_loop(symbol_table,cur_line_num, i); 
		else if (symbol_table[i].value === "\n") cur_line_num++;
		else if (symbol_table[i].value === "UPPIN") update = 1;
		else if (symbol_table[i].value === "NERFIN") update = -1;
		else if (symbol_table[i].description === "Loop Keyword")
		{
			check = (symbol_table[i].value === "WILE")? "WIN": "FAIL";
			loop_start = i+1;
		}
		else if (symbol_table[i].description === 'Loop Identifier') loop_label = symbol_table[i].value;
		else if (symbol_table[i].description === 'Parameter Identifier') loop_var = symbol_table[i].value;
	}
	const placeholder = i+1;
	let table = symbol_table.slice(0,i+1);
	for(i = 0; i<lexicon.length; i++) if(lexicon[i].name === loop_var) break;
	if(i === lexicon.length) return `Error variable not found ayusin mo to pauwu in loop`;
	loop_var = i;

	let value;
	let type;
	let loop_copy = table.slice(loop_start);
	let error = recursive_operations(loop_copy.shift(), loop_copy,lexicon, func_table, line_number,handlePrefixChanges);
	if(!Array.isArray(error)) return error;
	[value, type] = error;
	if(type !== "TROOF")
	{
		error = typecast_to_TROOF(value, type, "", cur_line_num);
		if(!Array.isArray(error)) return error;
		[value, type] = error;
	}
	let to_continue = (check === value);
	let code = loop_copy.shift();

	while(to_continue)
	{
		switch(code.description)
		{
			case 'Line Break': cur_line_num++;
			case 'Flow-Control Delimiter Keyword':
			case 'Parameter Delimiter Keyword':
			case 'Command Line Break': break;
			case 'Break Keyword': to_continue = false;
				break;
			case 'Switch Case Delimiter Keyword': error = switch_control(loop_copy, lexicon, func_table, cur_line_num,handlePrefixChanges);
				if(!Number.isInteger(error)) return error
				cur_line_num = error;
				break;
			case 'If-Else Delimiter Keyword': error = if_else_control(loop_copy, lexicon, func_table,cur_line_num,true,handlePrefixChanges);
				if(!Array.isArray(error)) return error;
				cur_line_num = error[0];
				to_continue = !error[1]; // error[1] is found break
				break;
			case 'Variable Declaration Keyword': 
				error = variable_dec_init(loop_copy, lexicon, func_table, cur_line_num,handlePrefixChanges);
				if(error) return error;
				cur_line_num++;
				break;
			case 'Identifier': 
				assignment_operation(loop_copy, lexicon, func_table, cur_line_num,handlePrefixChanges);
				cur_line_num++;
				break;
			case 'Output Keyword':
				error = output(loop_copy, lexicon, func_table, cur_line_num,handlePrefixChanges);
				if(error) return error;
				cur_line_num++;
				break;
			case 'Input Keyword': error = ask_input(loop_copy, lexicon, cur_line_num);
				if(error) return error;
				line_number++;
				break;
			case 'Loop Delimiter Keyword':
				if(code.value === "IM OUTTA")
				{
					lexicon[loop_var].value+=update;
					loop_copy = table.slice(loop_start);
					error = recursive_operations(loop_copy.shift(), loop_copy,lexicon, func_table,line_number,handlePrefixChanges);
					if(!Array.isArray(error)) return error;
					[value, type] = error;
					if(type !== "TROOF")
					{
						error = typecast_to_TROOF(value, type, "", cur_line_num);
						if(!Array.isArray(error)) return error;
						[value, type] = error;
					}
					cur_line_num = line_number;
					to_continue = (check === value);						
				}
				else
				{
					error = loop(loop_copy, lexicon, func_table, cur_line_num,handlePrefixChanges);
					if(!Number.isInteger(error)) return error;
					cur_line_num = error;
				}
				break;
			default: 
				error = recursive_operations(code, loop_copy, lexicon, func_table,line_number,handlePrefixChanges);
				if(!Array.isArray(error)) return error;
				[value, type] = error;
				lexicon[0].value = value;
				lexicon[0].type = type;
				cur_line_num++;	
		}
		code = loop_copy.shift();
	}


	symbol_table.splice(0,placeholder);
	const to_remove = lexicon.length - prev_length;
	if(to_remove > 0) lexicon.splice(-to_remove,to_remove);
	return cur_line_num;
}


// return lexicon (variable table) or error prompt
export const program_start = (symbol_table,handlePrefixChanges) =>
{
	if(symbol_table.length === []) return "Cannot evaluate syntactically incorrect code";
	removeComments(symbol_table); // removes comments in the symbol table
	let line_number = 1;
	let error;
	let code;
	let func_table = [];
	let lexicon = [{name:"IT", value:undefined, type:"NOOB"}];
	while(symbol_table.length !== 0)
	{
		code = symbol_table.shift();
		switch (code.description)
		{
			case 'Line Break': line_number++;
			case 'Command Line Break': break;
			case 'Function Delimeter Keyword':
				error = get_function(symbol_table, lexicon, func_table, line_number);
				if(error) return error;
				break;
			case 'Variable Declaration Keyword': 
				error = variable_dec_init(symbol_table, lexicon, func_table, line_number,handlePrefixChanges);
				if(error) return error;
				line_number++;
				break;
			case 'Identifier':
				if(code.value === "NOOB")
				{
					lexicon[0].value = undefined;
					lexicon[0].type = "NOOB";
					break;
				}
				error = assignment_operation(code, symbol_table, lexicon, func_table, line_number,handlePrefixChanges);
				if(error) return error;
				line_number++;
				break;
			case 'Output Keyword':
				error = output(symbol_table, lexicon, func_table ,line_number,handlePrefixChanges);
				if(error) return error;
				line_number++;
				break;
			case 'Input Keyword': error = ask_input(symbol_table, lexicon,line_number);
				if(error) return error;
				line_number++;
				break;
			case 'Code Delimiter Keyword': break;
			case 'Switch Case Delimiter Keyword': error = switch_control(symbol_table, lexicon, func_table ,line_number,handlePrefixChanges);
				if(!Number.isInteger(error)) return error;
				line_number = error;
				break;
			case 'Loop Delimiter Keyword':
				if(code.value === "IM IN") error = loop(symbol_table, lexicon, func_table ,line_number,handlePrefixChanges);
				if(!Number.isInteger(error)) return error;
				break;
			case 'If-Else Delimiter Keyword': error = if_else_control(symbol_table, lexicon, func_table ,line_number,false,handlePrefixChanges);
				if(!Array.isArray(error)) return error;
				line_number = error[0];
				break;
			default: error = recursive_operations(code, symbol_table, lexicon, func_table, line_number,handlePrefixChanges);
				if(!Array.isArray(error)) return error;
				[lexicon[0].value, lexicon[0].type] = error;
				line_number++;
		}	
	}

	for(let i = 0; i < lexicon.length; i++)
	{
		if (lexicon[i].type === "NUMBAR" && lexicon[i].value !== undefined) lexicon[i].value = truncate(lexicon[i].value);
		else if(lexicon[i].value === undefined) lexicon[i].value = "NOOB";
	}

	return lexicon
}
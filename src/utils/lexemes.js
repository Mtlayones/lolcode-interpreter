export const keywords = 
    {
        "HAI":['Start','Code Delimiter Keyword'],
        "KTHXBYE":['End','Code Delimiter Keyword'],
        "BTW":['Comment','Line Comment Keyword'],
        "OBTW":['Multi-Line Comment Start','Comment Delimiter Keyword'],
        "TLDR":['Multi-Line Comment End','Comment Delimiter Keyword'],
        "I HAS A":['Declare Var','Variable Declaration Keyword'],
        "ITZ":['Initialize Var','Variable Initialization Keyword'],
        "R":['Assigment Var','Variable Assignment Keyword'],
        "SUM OF":['Arithmetic','Addition Operation Keyword'],
        "DIFF OF":['Arithmetic','Subtraction Operation Keyword'],
        "PRODUKT OF":['Arithmetic','Multiplication Operation Keyword'],
        "QUOSHUNT OF":['Arithmetic','Division Operation Keyword'],
        "MOD OF":['Arithmetic','Modulo Operation Keyword'],
        "BIGGR OF":['Arithmetic','Max Operation Keyword'],
        "SMALLR OF":['Arithmetic','Min Operation Keyword'],
        "BOTH OF":['Boolean','AND Operation Keyword'],
        "EITHER OF":['Boolean','OR Operation Keyword'],
        "WON OF":['Boolean','XOR Operation Keyword'],
        "NOT":['Boolean','NOT Operation Keyword'],
        "ANY OF":['Boolean Many','OR Delimiter Operation Keyword'],
        "ALL OF":['Boolean Many','AND Delimiter Operation Keyword'],
        "BOTH SAEM":['Comparison','Equal Operation Keyword'],
        "DIFFRINT":['Comparison','Not Equal Operation Keyword'],
        "SMOOSH":['Concat','Concatenation Operation Keyword'],
        "MAEK":['Declare Typecast','Type Casting Declaration Keyword'],
        "IS NOW":['Initialize Typecast','Type Casting Initialization Keyword'],
        "A":['Type Keyword','Type Keyword'],
        "VISIBLE":['Output','Output Keyword'],
        "GIMMEH":['Input','Input Keyword'],
        "O RLY":['If-Else','If-Else Delimiter Keyword'],
        "YA RLY":['If','If Keyword'],
        "MEBBE":['Else-If','Else-If Keyword'],
        "NO WAI":['Else','Else Keyword'],
        "OIC":['Flow-Control End','Flow-Control Delimiter Keyword'],
        "WTF":['Switch','Switch Case Delimiter Keyword'],
        "OMG":['Switch Option','Case Keyword'],
        "OMGWTF":['Switch Default','Case-Default Keyword'],
        "GTFO":['Break','Break Keyword'],
        "IM IN":['Loop','Loop Delimiter Keyword'],
        "YR":['Delimiter','Parameter Delimiter Keyword'],
        "UPPIN":['Loop Inc','Increment Keyword'],
        "NERFIN":['Loop Dec','Decrement Keyword'],
        "TIL":['Loop Cond','Loop Keyword'],
        "WILE":['Loop Cond','Loop Keyword'],
        "IM OUTTA":['Loop End','Loop Delimiter Keyword'],
        "AN":['Conjunction','Operand Delimiter Keyword'],
        "HOW IZ I":['Function', 'Function Delimeter Keyword'],
        "IF U SAY SO":['Function End', 'Function Delimeter Keyword'],
        "FOUND": ['Function Return','Function Return Keyword'],
        "I IZ":['Function Call', 'Function Call Keyword'],
        "NUMBR":['Type','NUMBR Type Keyword'],
        "NUMBAR":['Type','NUMBAR Type Keyword'],
        "YARN":['Type','YARN Type Keyword'],
        "TROOF":['Type','TROOF Type Keyword'],
        "MKAY":['Boolean Many','Infinite Delimiter Keyword'],
    }


export const literal = {
    "NUMBR":[/(^\-?[0-9]+$)/,'NUMBR Literal'],
<<<<<<< HEAD
    "NUMBAR":[/(^\-?[0-9]+\.[0-9]+$)/,'NUMBAR Literal'],
=======
    "NUMBAR":[/(^\-?[0-9]*\.[0-9]+$)/,'NUMBAR Literal'],
>>>>>>> ui
    "YARN1":[/(^[\"]([^\"]|(\:\"))*$)/,'YARN Literal'],
    "YARN2":[/(^([^\"]|(\:\"))*[\"][\!\,]{0,2}$)/,'YARN Literal'],
    "YARN":[/(^[\"]([^\"]|(\:\"))*[\"]$)/,'YARN Literal'],
    "TROOF":[/^((WIN)|(FAIL))$/,'TROOF Literal'],
}

export const identifier = [/^([A-Za-z]+[0-9\_]*)$/,'Identifier']

export const types = {
    "NUMBR":['Type','NUMBR Type'],
    "NUMBAR":['Type','NUMBAR Type'],
    "YARN":['Type','YARN Type'],
    "TROOF":['Type','TROOF Type'],
    "NOOB" : ['Type','NOOB Type'],
}


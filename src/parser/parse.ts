
// This needs to support multiple commands in future

export interface Command{
    commandName: string,
    commandIdentifier: string,
}

export interface ApplicableToResult{
    commands: Command[],
    applicableTo: string,
}

export function parseApplicableTo(applicableTo:string) :ApplicableToResult {

    let applicableToIter = applicableTo[Symbol.iterator]();

    let applicableToOut = "";

    let commands:Command[] = [];
    let curCommandName = "";
    let curCommandIdentifier = "";

    let nextIter;
    while(!(nextIter = applicableToIter.next()).done){
        if (nextIter.value === "<" && applicableToIter.next().value === "<") {
            let commandChar;
            let commandName = "";
            
            while((commandChar = applicableToIter.next()).value != ":"){
                commandName += commandChar.value;    
            }

            let commandIdentifier = "";

            while((commandChar = applicableToIter.next()).value != ">"){
                commandIdentifier += commandChar.value;    
            }

            let _ = applicableToIter.next();

            commands.push({commandIdentifier, commandName});
        }else{
            applicableToOut += nextIter.value;
        }
    }

    return {applicableTo:applicableToOut, commands};

}

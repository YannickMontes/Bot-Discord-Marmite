const wholeCheckDelimiter = '*';
const sentenceCheckDelimiter = '&';

export function canTrigger(message: string, trigger: string)
{
	trigger = trigger.toLowerCase();
	let startsWithSentenceDelim = trigger.startsWith(sentenceCheckDelimiter);
	let endsWithSentenceDelim = trigger.endsWith(sentenceCheckDelimiter);
	let startsWithWholeDelim = trigger.startsWith(wholeCheckDelimiter);
	let endsWithWholeDelim = trigger.endsWith(wholeCheckDelimiter);

	if(!startsWithSentenceDelim && !endsWithSentenceDelim && !startsWithWholeDelim && !endsWithWholeDelim)
	{
		return checkSimpleTrigger(message, trigger);
	}
	else
	{
		let startCorrectTrigger = false;
		let endCorrectTrigger = false;
		if(startsWithSentenceDelim)
		{
			startCorrectTrigger = checkSentenceTrigger(message, trigger, true);
		}
		else if(startsWithWholeDelim)
		{
			startCorrectTrigger = checkAllTrigger(message, trigger);
		}
		else
		{
			//Rien au début
			startCorrectTrigger = checkNothingAroundTrigger(message, trigger, true);
		}
		if(endsWithSentenceDelim)
		{
			endCorrectTrigger = checkSentenceTrigger(message, trigger, false);
		}
		else if(endsWithWholeDelim)
		{
			endCorrectTrigger = checkAllTrigger(message, trigger);
		}
		else
		{
			//Rien a la fin
			endCorrectTrigger = checkNothingAroundTrigger(message, trigger, false);
		}
		//console.log(trigger, startCorrectTrigger, endCorrectTrigger);
		return startCorrectTrigger && endCorrectTrigger;
	}
}

function checkSimpleTrigger(message: string, trigger: string) // if is only word
{
	return message.toLowerCase() === trigger.toLowerCase();
}

function checkAllTrigger(message: string, trigger: string) // if contains *
{
	let triggerNoDelim = removeDelimiters(trigger);
	let index = message.indexOf(triggerNoDelim);
	if(index != -1)
	{
		return true;
	}
	return false;
}

function checkSentenceTrigger(message: string, trigger: string, checkBegin: boolean) // if contains &
{
	let triggerNoDelim = removeDelimiters(trigger);
	let index = message.indexOf(triggerNoDelim);
	if(index != -1)
	{
		let wantedString = checkBegin ? message.substring(0, index) :  message.substring(index + triggerNoDelim.length, message.length);
		if(wantedString.length > 0 && (checkBegin ? !wantedString.endsWith(' ') : !wantedString.startsWith(' ')))
		{
			return false;
		}
		return true;
	}
	return false;
}

function checkNothingAroundTrigger(message: string, trigger: string, before: boolean)
{
	let trigNoDelim = removeDelimiters(trigger);
	let index = message.indexOf(trigNoDelim);
	if(index != -1)
	{
		if(before && index != 0
			|| !before && (index + trigNoDelim.length) != message.length -1)
		{
			return false;
		}
		return true;
	}
	return false;
}

function removeDelimiters(trigger: string)
{
	let returnTrig = null;
	let regex = /\*/g;
	returnTrig = trigger.replace(regex, '');
	regex = /\&/g;
	returnTrig = returnTrig.replace(regex, '');
	return returnTrig;
}

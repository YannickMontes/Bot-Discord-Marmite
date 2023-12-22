let allPasWords = [];

let pasSpaces = ["pas", "pa", "ap", "aps", "po", "pô", "pâs", "pâ", "pà", "pàs"]
let wordRegex = [/p{1,}a{1,}s{1,}/g, /p{1,}a{1,}/g, ]

getPasCountInMessage(message)
{
	let pasCpt = 0;
	let spltitedMessage = message.split(" ");
	spltitedMessage.forEach(word => {
		if(word.length > 1)
		{
			let newWord = word.replace(/[^\W]/g, '');
			if(allPasWords.includes(newWord))
				pasCpt++;
		}
		if(word == "p")
		{

		}
	});
	return pasCpt;
}
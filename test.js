const sentence = "Check out this link: https://x.com/something";
const regexWithCapture = /(https:\/\/)x\.com(\S*)/;
const match = sentence.match(regexWithCapture);

const modifiedLink = match ? `${match[1]}vxtwitter.com${match[2]}` : null;

console.log(modifiedLink);

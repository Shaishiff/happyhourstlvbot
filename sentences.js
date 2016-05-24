
var Consts = require('./consts');
var game = "(game|match)";
var live = "(live|ongoing|current|curent)";
var group = "(group|grup|groop|standing|table)";
var today = "(today|todays|tonight|tonights|this evening|this evenings)";

var sentences = {
  page_welcome_msg: "Hey ! :)\nLet me know what kind of info you are looking for about Euro2016.\nTo get things started, you can write something like:\nShow me the groups\nOr even just write:\ngroups\n(if you're a bit lazy...)\nAnd last thing - just write:\nhelp\nto get some more info from me.\nHave fun !",
  help_message: "Don't you worry ! I'll try and help out.",
  user_welcoming_messages: [
    "^Hello",
    "^Hi",
    "^Hey",
    "^Good morning",
    "^Morning",
    "^Good afternoon",
    "^Good evening",
    "^What's up",
    "^Sup",
    "^How's it going",
    "^Howdy",
    "^Well hello",
    "^Why hello there.",
    "^Yo",
    "^Greetings",
    "^Look who it is",
    "^Look what the cat dragged in"
  ],
  bot_welcoming_messages: [
    "Hello :)",
    "Hi there !",
    "Hey !",
    "Howdy...",
    "Well hello.",
    "Why hello there.",
    "Yo !",
    "Greetings."
  ],
  user_says_thanks: [
    "^thanks$",
    "^thanks dude",
    "^thanks man",
    "^thanks bot",
    "^thanks !",
    "^thank you$",
    "^thank you !",
    "^danke",
    "^cheers",
    "spank you"
  ],
  bot_says_you_are_welcome: [
    "No worries ;)",
    "Sure thing !",
    "You're welcome :)",
    "I'm Here to help.",
    "Don't worry about it."
  ],
  show_groups: [
    "^Can you please show me the group",
    "^Show me the group",
    "^Show me group",
    "^Show group",
    "^What are the group",
    "^Groups$",
    "^Groops$",
    "^Grops$",
    "^Grups$",
    "^Standings$",
    "^Show standings$",
    "^Show standing$",
    "^Please show groups",
    "^Please show me the groups",
    "^Show groops",
    "^Show me grups",
    "^Show grups",
    "^group(s)?(.*)show(.*)",
  ],
  help_me: [
    "^help$",
    "^help !",
    "^help me",
    "^hellp",
    "^heelp",
    "^helpp",
    "^please help",
    "^help please"
  ],
  bot_not_sure_what_user_means: [
    "Oopsy oops...not sure what you mean by that :(",
    "Not really sure what you mean by that...",
    "Hmmm, what ?",
    "mmmm, what was that again ?",
    "Sorry but I don't quite understand what u mean :("
  ]
}

module.exports = sentences;
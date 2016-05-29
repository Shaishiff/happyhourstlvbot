
var sentences = {
    lets_start: {
        en: "Main Menu",
        he: {
            male: "תפריט ראשי",
            female: "תפריט ראשי"
        }
    },
    invalid_response: {
        en: "Sorry but that isn't a valid response. If you want to start over just tell me: \"start over\" or just send: \"0\"",
        he: {
            male: "Sorry but that isn't a valid response. If you want to start over just tell me: \"start over\" or just send: \"0\"",
            female: "Sorry but that isn't a valid response. If you want to start over just tell me: \"start over\" or just send: \"0\""
        }
    },
    type_name_of_business: {
        en: "Please type the name of the business to see its happy hour.",
        he: {
            male: "בבקשה הקלד את שם המקום אותו אתה מחפש.",
            female: "בבקשה הקלידי את שם המקום אותו את מחפשת."
        }
    },
    user_requested_to_stop: [
        "0",
        "start over",
        "stop",
        "חדש",
        "עצור"
    ],
    user_wants_main_menu: [
        "99",
        "menu",
        "תפריט",
        "חדש חדש",
        "start over"
    ],
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
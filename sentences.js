
var sentences = {
    lets_start: {
        en: "Main Menu",
        he: {
            male: "תפריט ראשי",
            female: "תפריט ראשי"
        }
    },
    type_menu_to_see_menu: {
        en: "Type \"menu\" to see the main menu again.",
        he: {
            male: "הקלד \"תפריט\" על מנת לראות את התפריט הראשי שוב.",
            female: "הקילדי \"תפריט\" על מנת לראות את התפריט הראשי שוב."
        }
    },
    switching_to_language: {
        en: "Switching to English",
        he: {
            male: "עובר לעברית",
            female: "עובר לעברית"
        }
    },
    invalid_response: {
        en: "Sorry but that is not a valid response. If you want to quit the guide just tell me: \"stop\", \"exit\" or just send: \"0\"",
        he: {
            male: "מצטער אבל זאת לא בחירה תקינה. אם אתה רוצה לצאת מהמדריך פשוט הקליד \"עצור\", \"יציאה\" או שלח את הספרה \"0\".",
            female: "מצטער אבל זאת לא בחירה תקינה. אם את רוצה לצאת מהמדריך פשוט הקלידי \"עצור\", \"יציאה\" או שלחי את הספרה \"0\"."
        }
    },
    type_name_of_business: {
        en: "Please type the name of the business to see its happy hour.",
        he: {
            male: "בבקשה הקלד את שם המקום אותו אתה מחפש.",
            female: "בבקשה הקלידי את שם המקום אותו את מחפשת."
        }
    },
    please_choose_category: {
        en: "Which deal category are you interested in ? (click the button or enter the appropriate number)",
        he: {
            male: "איזה סוג של דיל אתה רוצה ? (לחץ על הכפתור או שלח את המספר המתאים)",
            female: "איזה סוג של דיל את רוצה ? (לחצי על הכפתור או שלחי את המספר המתאים)"
        }
    },
    please_choose_the_time: {
        en: "When do you want to go ? (click the button or enter the appropriate number)",
        he: {
            male: "מתי אתה רוצה ללכת ? (לחץ על הכפתור או שלח את המספר המתאים)",
            female: "מתי את רוצה ללכת ? (לחצי על הכפתור או שלחי את המספר המתאים)"
        }
    },
    do_you_want_based_on_your_location: {
        en: "Do you want to find a place based on your location ?",
        he: {
            male: "אתה רוצה למצוא מקום לפי המיקום שלך ?",
            female: "את רוצה למצוא מקום לפי המיקום שלך ?"
        }
    },
    please_enter_your_location: {
        en: "If so, please enter street name and number or you can just send your GPS location.\nSend \"no\" if location doesn't matter to you.",
        he: {
            male: "אם כן, הכנס את שם הרחוב ומספר הבית או שלח את מיקום ה-גי.פי.אס.\nכתוב \"לא\" אם המיקום לא משנה לך.",
            female: "אם כן, הכנסי את שם הרחוב ומספר הבית או שלחי את מיקום ה-גי.פי.אס.\nכתבי \"לא\" אם המיקום לא משנה לך."
        }
    },
    cant_find_exact_match_here_are_best_options: {
        en: "Could not find an exact match, here are the closest options...",
        he: {
            male: "לא נמצאה התאמה מדויקת, הנה האופציות הקרובות ביותר...",
            female: "לא נמצאה התאמה מדויקת, הנה האופציות הקרובות ביותר..."
        }
    },
    stopping_the_guide: {
        en: "Stopping the guide.",
        he: {
            male: "עוצר את המדריך.",
            female: "עוצר את המדריך."
        }
    },
    user_requested_to_stop: [
        "0",
        "stop",
        "exit",
        "עצור",
        "יציאה"
    ],
    user_wants_main_menu_en: [
        "99",
        "menu",
        "start over"
    ],
    user_wants_main_menu_he: [
        "תפריט",
        "חדש חדש",
        "התחלה"
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
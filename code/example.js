var Mysql = require('mysql');
var connection = Mysql.createConnection({
	host: "www.happyhourstlv.com",
	user: "readonly",
	password: "readonly123",
	database: "happyhours_db"
});
var a = connection.connect();
var b = connection.query("SELECT * FROM " + "deal_items", function(err, rows, fields) {
	console.log(rows[100].category);
});

var RowDataPacket = {
	object_id: 'tDECCkYb1y',
	headline: 'שפגאט Shpagat',
	headline_en: 'Shpagat',
	category: 'hh',
	main_offer: 'תפריט אלכוהול מוזל',
	main_offer_en: 'Discounted Drinks Menu',
	days: 'א\'-ש\', מפתיחה עד 19:00',
	days_en: 'Sun-Sat, Opening-19:00',
	address: 'נחלת בנימין 43, תל אביב יפו',
	address_en: 'Nahalat Binyamin St 43',
	details: 'לב העיר  בר  מועדון  סופ"ש  שעות ארוכות',
	details_en: 'City Center  Bar  Weekend',
	image_url: 'shpagat.jpg',
	is_active: 1,
	lat: 32.0652,
	lon: 34.7709,
	link: 'https://www.facebook.com/shpagatlv/timeline',
	phone: '03-560-1758',
	use_headline: 1,
	place_id: 'ChIJcW8VJINMHRURxeOJFoIld4Y',
	opening_hours: '[[{"end":1900,"start":1200}],[{"end":1900,"start":1200}],[{"end":1900,"start":1200}],[{"end":1900,"start":1200}],[{"end":1900,"start":1200}],[{"end":1900,"start":1200}],[{"end":1900,"start":1200}]]'
};

{
	"user": "10154157335931753",
	"channel": "10154157335931753",
	"timestamp": 1464180791156,
	"seq": 42,
	"mid": "mid.1464180790959:0490340f1090c7cf12",
	"attachments": [{
		"title": "Gcp Next 2016",
		"url": "https://www.facebook.com/l.php?u=https%3A%2F%2Fwww.bing.com%2Fmaps%2Fdefault.aspx%3Fv%3D2%26pc%3DFACEBK%26mid%3D8100%26where1%3DTel%2BAviv%252C%2BIsrael%26FORM%3DFBKPL1%26mkt%3Den-US&h=BAQFEIz6A&s=1&enc=AZM_bikF_yqz-mbTgEsMdwQC3vu4HiLcTs0XflIlSnCloiXhIh-OyKTZmVYv0w1f8t0oG3keFbP3DyE2BDtqnEh0J6A5Fr5a2wfrZXH0aNuoBQ",
		"type": "location",
		"payload": {
			"coordinates": {
				"lat": 32.10676574707,
				"long": 34.810844421387
			}
		}
	}]
}

https://developers.google.com/maps/documentation/geocoding/start#sample-request
https://console.developers.google.com/apis/credentials?project=learned-cirrus-132310

response.attachments.payload.coordinates.lat
response.attachments.payload.coordinates.long
response: {
	"text": "",
	"user": "10154157335931753",
	"channel": "10154157335931753",
	"timestamp": 1464442347039,
	"seq": 756,
	"mid": "mid.1464442346867:4543c76bacd5139a96",
	"attachments": [{
		"title": "Shai's Location",
		"url": "https://www.facebook.com/l.php?u=https%3A%2F%2Fwww.bing.com%2Fmaps%2Fdefault.aspx%3Fv%3D2%26pc%3DFACEBK%26mid%3D8100%26where1%3D32.079882%252C%2B34.778432%26FORM%3DFBKPL1%26mkt%3Den-US&h=WAQHxVev7&s=1&enc=AZOvybLHoirrS2izf8hLXti8j2URsXtdqZn9_3dfiMeMww10HUygfdPrIvfhNnfdXmkOWtkOCU2AFuCCsBK1Ums6_uH_UzS4OCLvI8WzjHD7mQ",
		"type": "location",
		"payload": {
			"coordinates": {
				"lat": 32.079882,
				"long": 34.778432
			}
		}
	}],
	"userInfo": {
		"_id": "5744560a2b8d6e11004207c4",
		"first_name": "Shai",
		"last_name": "Shiff",
		"profile_pic": "https://scontent.xx.fbcdn.net/v/t1.0-1/p200x200/10387688_10153423906881753_8341648569208829024_n.jpg?oh=e671373e74235fa61b3eaa05ddfafbb1&oe=57C773DA",
		"locale": "en_US",
		"timezone": 3,
		"gender": "male",
		"user_id": "10154157335931753"
	},
	"fullNameWithId": "Shai_Shiff_10154157335931753",
	"question": ""
}
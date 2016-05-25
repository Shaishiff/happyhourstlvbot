
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

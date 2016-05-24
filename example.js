
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
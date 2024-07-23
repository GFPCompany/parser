var url_prefix = "https://ibronevik.ru/taxi/c/gruzvill/api/v1/"; 

var driver_token = "значение токена"; 
var driver_u_hash = "значение хеша";  
var client_token = "значение токена"; 
var client_u_hash = "значение хеша"; 

function encode_data(obj){ 
	var data = []; 
	for (var key in obj){ 
		data.push(encodeURIComponent(key)+"="+encodeURIComponent(obj[key]));  
	} 
	data = data.join("&"); 
	return data; 
}

Создание поездки клиетом:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "drive", false);
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": client_token, 
	"u_hash": client_u_hash,
	"data": JSON.stringify({
		"b_start_address":"адрес начальной точки поездки",	//Для начальной точки должны быть указаны или адрес или координаты
		"b_start_latitude":"широта начальной точки поездки",
		"b_start_longitude":"долгота начальной точки поездки",
		"b_destination_address":"адрес цели поездки",
		"b_destination_latitude":"широта цели поездки",
		"b_destination_longitude":"долгота цели поездки",
		"b_start_datetime":"дата желаемого начала поездки год-месяц-день час:минуты:секунды±часы:минуты|any|now",	//необходимо
		"b_car_class":"идентификатор класса машины",	//						data.car_classes
		"b_payment_way":"идентификатор способа оплаты",	//необходимо			data.payment_ways
		"b_options":{},	//архив дополнительных параметров
		"b_comments":[],	//архив идентификаторов комментарий к поездкам		data.booking_comments
		"b_services":[],	//архив идентификаторов услуги при перевозке		data.services
		"b_only_offer":"0 или 1, создавать ли поездку, видимую только отобранным водителям"
	})
}; 
req.send(encode_data(post_obj));
var b_id = JSON.parse(req.response).data.b_id; 

Создание рейса водителем:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "trip", false); 
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": driver_token, 
	"u_hash": driver_u_hash, 
	"data": JSON.stringify({ 
		"t_start_address":"адрес начальной точки рейса", //Для начальной точки должны быть указаны или адрес или координаты
		"t_start_latitude":"широта начальной точки рейса",
		"t_start_longitude":"долгота начальной точки рейса",
		"t_destination_address":"адрес цели рейса",
		"t_destination_latitude":"широта цели рейса",
		"t_destination_longitude":"долгота цели рейса",		
		"t_start_datetime_interval":"максимальный возможный сдвиг начала рейса в секундах",
		"t_start_datetime":"планируемая дата начала рейса в виде год-месяц-день час:минуты:секунды±часы:минуты|now, 0000-00-00 00:00:00±часы:минуты запрещено"	//необходимо
		"t_complete_datetime":"планируемая дата завершения рейса в виде год-месяц-день час:минуты:секунды±часы:минуты"
		"t_options":{...} 
	}); 
}; 
req.send(encode_data(post_obj)); 
var t_id = JSON.parse(req.response).data.t_id;

Получение активных поездок клиентом:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "drive?fields=000000002", false); 
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": client_token, 
	"u_hash": client_u_hash
}; 
req.send(encode_data(post_obj)); 
var b_offers = JSON.parse(req.response).data[b_id].b_offers;	//список отобранных водителей

Получение активных поездок водителем:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "drive?fields=000000004", false); 
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": driver_token, 
	"u_hash": driver_u_hash, 
}; 
req.send(encode_data(post_obj)); 
var b_offer = JSON.parse(req.response).data[b_id].b_offer;	//отобран ли водитель

Получение ожидающих одобрения поездок водителем:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "drive/now?fields=000000004", false); 
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": driver_token, 
	"u_hash": driver_u_hash, 
}; 
req.send(encode_data(post_obj)); 
var b_offer = JSON.parse(req.response).data[b_id].b_offer;	//отобран ли водитель

Получение архивных поездок клиентом:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "drive/archive?fields=000000002", false); 
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": client_token, 
	"u_hash": client_u_hash
}; 
req.send(encode_data(post_obj)); 
var b_offers = JSON.parse(req.response).data[b_id].b_offers;	//список отобранных водителей

Получение архивных поездок водителем:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "drive/archive?fields=000000004", false); 
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": driver_token, 
	"u_hash": driver_u_hash, 
}; 
req.send(encode_data(post_obj)); 
var b_offer = JSON.parse(req.response).data[b_id].b_offer;	//отобран ли водитель

Получение всех или указанных поездок клиентом:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "drive/get/?fields=000000002", false);				//все доступные поездки
req.open('POST', url_prefix + "drive/get/b_id1,b_id2?fields=000000002", false);		//поездки b_id1,b_id2
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": client_token, 
	"u_hash": client_u_hash
}; 
req.send(encode_data(post_obj)); 
var b_offers = JSON.parse(req.response).data[b_id].b_offers;	//список отобранных водителей

Получение всех или указанных поездок водителем:
req = new XMLHttpRequest();
req.open('POST', url_prefix + "drive/get/?fields=000000004", false);				//все доступные поездки
req.open('POST', url_prefix + "drive/get/b_id1,b_id2?fields=000000004", false);		//поездки b_id1,b_id2
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": driver_token, 
	"u_hash": driver_u_hash, 
}; 
req.send(encode_data(post_obj)); 
var b_offer = JSON.parse(req.response).data[b_id].b_offer;	//отобран ли водитель

Получение активных рейсов водителем:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "trip", false);
req.open('POST', url_prefix + "trip?orders=b_id1,b_id2", false);	//отбирает рейсы, привязанные к поездкам b_id1,b_id
req.open('POST', url_prefix + "trip?filter=sd_cd", false);	//отбирает рейсы, для которых текущее время больше t_start_datetime и меньше t_complete_datetime
req.open('POST', url_prefix + "trip?orders=b_id1,b_id2&filter=sd_cd", false);	//параметры orders и filter можно совмещать 
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": driver_token, 
	"u_hash": driver_u_hash, 
}; 
req.send(encode_data(post_obj)); 
var orders = JSON.parse(req.response).data[t_id].orders;	//отобранные и прикрепленные поездки

Получение активных рейсов клиентом:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "trip", false);
req.open('POST', url_prefix + "trip?orders=b_id1,b_id2", false);	//отбирает рейсы, привязанные к поездкам b_id1,b_id
req.open('POST', url_prefix + "trip?filter=sd_cd", false);	//отбирает рейсы, для которых текущее время больше t_start_datetime и меньше t_complete_datetime
req.open('POST', url_prefix + "trip?orders=b_id1,b_id2&filter=sd_cd", false);	//параметры orders и filter можно совмещать 
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": client_token, 
	"u_hash": client_u_hash
}; 
req.send(encode_data(post_obj)); 
var orders = JSON.parse(req.response).data[t_id].orders;	//отобранные и прикрепленные поездки

Получение ожидающих грузов рейсов клиентом:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "trip/now", false);
req.open('POST', url_prefix + "trip/now?filter=sd_cd", false);	//отбирает рейсы, для которых текущее время больше t_start_datetime и меньше t_complete_datetime
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": client_token, 
	"u_hash": client_u_hash
}; 
req.send(encode_data(post_obj)); 

Получение всех или указанных рейсов водителем:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "trip/get/", false);					//все доступные рейсы
req.open('POST', url_prefix + "trip/get/t_id1,t_id2", false);		//рейсы t_id1,t_id2
req.open('POST', url_prefix + "trip/get/t_id1,t_id2?orders=b_id1,b_id2", false);	//отбирает рейсы, привязанные к поездкам b_id1,b_id
req.open('POST', url_prefix + "trip/get/t_id1,t_id2?filter=sd_cd", false);	//отбирает рейсы, для которых текущее время больше t_start_datetime и меньше t_complete_datetime
req.open('POST', url_prefix + "trip/get/t_id1,t_id2?orders=b_id1,b_id2&filter=sd_cd", false);	//параметры orders и filter можно совмещать 
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": driver_token, 
	"u_hash": driver_u_hash, 
}; 
req.send(encode_data(post_obj)); 
var orders = JSON.parse(req.response).data[t_id].orders;	//отобранные и прикрепленные поездки

Получение всех или указанных рейсов клиентом:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "trip/get/", false);					//все доступные рейсы
req.open('POST', url_prefix + "trip/get/t_id1,t_id2", false);		//рейсы t_id1,t_id2
req.open('POST', url_prefix + "trip/get/t_id1,t_id2?orders=b_id1,b_id2", false);	//отбирает рейсы, привязанные к поездкам b_id1,b_id
req.open('POST', url_prefix + "trip/get/t_id1,t_id2?filter=sd_cd", false);	//отбирает рейсы, для которых текущее время больше t_start_datetime и меньше t_complete_datetime
req.open('POST', url_prefix + "trip/get/t_id1,t_id2?orders=b_id1,b_id2&filter=sd_cd", false);	//параметры orders и filter можно совмещать 
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": client_token, 
	"u_hash": client_u_hash
}; 
req.send(encode_data(post_obj)); 
var orders = JSON.parse(req.response).data[t_id].orders;	//отобранные и прикрепленные поездки

Создание машины водителем
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "car", false); 
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": driver_token, 
	"u_hash": driver_u_hash, 
	"data": JSON.stringify({ 
		"cm_id":"идентификатор модели машины", 				//data.car_models
		"seats":"число мест в машине",
		"registration_plate":"автомобильный номер",			//необходимо
		"color":"идентификатор цвета машины", 				//data.car_colors
		"photo":"изображение, кодированное в base64 строку",
		"cc_id":"идентификатор класса машины"				//data.car_classes
	}); 
}; 
req.send(encode_data(post_obj)); 
var c_id = JSON.parse(req.response).data.cteated_car.c_id;
var u_id = JSON.parse(req.response).data.cteated_car.u_id;

Предложение рейсов t_id1,t_id2 для поездки b_id (видимой всем) водителем:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "drive/get/" + b_id, false);
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": driver_token, 
	"u_hash": driver_u_hash,
	"performer": 0,
	"action": "set_performer"
	"data": JSON.stringify({
		"c_id":"идентификатор машины",					//необходимо
		"c_payment_way":"идентификатор способа оплаты"	//необходимо				data.payment_ways
	}),
	"t_id":"t_id1,t_id2"								//какие рейсы предлагаются
}; 
req.send(encode_data(post_obj));

Подтверждение предложения рейсов t_id1,t_id2 для поездки b_id (видимой всем) клиентом:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "drive/get/" + b_id, false);
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": client_token, 
	"u_hash": client_u_hash
	"u_id": "идентификатор водителя из предыдущего запроса",
	"action": "set_performer"
	"t_id":"t_id1,t_id2"								//какие рейсы подтвердить, могут не совпадать с предыдущим запросом
}; 
req.send(encode_data(post_obj));

Предложение поездки b_id (видимой всем или только отобранным) водителю для рейсов t_id1,t_id2 клиентом:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "drive/get/" + b_id, false);
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": client_token, 
	"u_hash": client_u_hash
	"u_id": "идентификатор водителя рейсов t_id1,t_id2",
	"action": "set_offer"
	"t_id":"t_id1,t_id2"								//для каких рейсов предложить
}; 
req.send(encode_data(post_obj));

Подтверждение предложения поездки b_id для рейсов t_id1,t_id2 водителем:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "drive/get/" + b_id, false);
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
	"token": driver_token, 
	"u_hash": driver_u_hash,
	"performer": 1,
	"action": "set_performer"
	"data": JSON.stringify({
		"c_id":"идентификатор машины",					//необходимо
		"c_payment_way":"идентификатор способа оплаты"	//необходимо				data.payment_ways
	}),
	"t_id":"t_id1,t_id2"								//какие рейсы подтвердить, могут не совпадать с предыдущим запросом
}; 
req.send(encode_data(post_obj));

Изменение координат водителем:
req = new XMLHttpRequest(); 
req.open('POST', url_prefix + "location", false);
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
var post_obj = { 
 "token": driver_token, 
 "u_hash": driver_u_hash,
 "latitude": "широта",
 "longitude": "долгота"
}; 
req.send(encode_data(post_obj));
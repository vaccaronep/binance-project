# binance-project
 Notas:
dbaccount en verdad es dbidentity, despues lo cambio.

account-microservice:
  es el encargado a todo lo relacionado al websocket que levanta
  la info del ws de binance de los updates de cuenta. Tambien aqui podria estar toda la logica para guardar las configuraciones de cuentas de binance por cada usuario.

binance-api-gateway:
  el orquestador con todos los microservicios, el encargado de conectarse con los micros servicios y devolver la data al FE.
  El api gate expone un redis para recibir mensaje de los WS de binance desde los microservicios, y este luego tiene un webserver para que el FE se conecte. Lo demas se maneja por endpoints.

identity-microservice:
  generador de tokens para los usuarios

market-microservice (todo):
  la idea es que este sea el que consiga la info de mercado de los activos (btc, eth). Quizas estaria bueno que cada user tenga una wishlist. Ver como se podria implementar eso.

orders-microservice:
  es el encargado de lo relacionado con las orders de binance, un ws escuchando cuando se generan/modifican/eliminan orders de un usuario. Tambien va a contar con endpoints para generar/cancelar ordenes. La idea es que este sea el encargado de generar TP y SL de manera automatica una vez que la orden generada por el bot este filled. Permitiendo alterar esto desde un FE en todo momento.

rules-microservice:
  es el encargado de guardar las rules y estrategias de determinado usuario. Rule: Activo (BTCUSDT) + Estrategia (RSI+VOL).

users-microservice:
  es el encargado de mantener los usuarios. Queda pendiente el modulo de permisos (chequear que el usuario este activo por ahora).

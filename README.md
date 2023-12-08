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


TODO LIST:
------------------------------------------------------------------------------------------------------------
revisar despues de lo que hice abajo para ver como viene.


-wishlist para pegarle al market stream
  -> si un user no carga ninguno al momento de la carga, ponerle btc etch bnb xrp.
  -> ver como inicializar el ws con esta config.
  -> estaria bueno hacer un join y que haga un solo market ws trayendo data.
  -> devolver todos los tickers sobre un mismo ws, y que el FE filtre a lo sumo?
  -> al cambiar la wishlist(user-microservice) se le deberia avisar(una vez que se grabo en la db bien) al market-microservice para levantar un nuevo ws con la wishlist nueva. (no hace falta bajarlo, el ws de market soporta el subscribe/unsubscribe, seria hacer un nuevo send sobre esa instancia para agregar el par.)

-poder switchear entre test y real (account-service)
  -> que se pueda cargar esta info (keys y flags en la db?) - listo
  -> al momentor por ahora solo de hacer las orders, implicaria las consultas a la API.
  -> si se cambia el flag avisar al orders-microservice para apagar el ws y apuntar a los nuevos.
  -> pegarle a pythonanywhere para hacer un push de que se cambiaron las keys/flag.
  -> agregar funcionalidad para soportar spot/futuros. - LISTO
  -> armar otro ws para spot y futures, y que aplique la misma config de test y real. - LISTO


------------------------------------------------------------------------------------------------------------

-poder configurar maximos segun moneda
  -> en el account agregar la opcion de setear maximos para las estrategias (es decir, cantidad de plata por trade y hasta cuantos trades activos).
    {
      SPOT: {
        ETHUSDT: {
          CASH: 25,
          PYRAMIDING: 4,
          ACTUAL_TRADES: 3
        }
      }
    } enviar esto asi a pythonanywhere
  -> agregar validacion en la rule create para que no se puedan crear dos rules para el mismo ticker, usuario, spot/futures, strategyId.
  -> pegarle a pythonanywhere para actualizar esta info, asi el bot no sigue cargando data.
  -> configurar para levantar los ws de un dicionary
  -> cargar las rules para generar sl y tp en las rules que son manejadas por el boton (un filtro por user id, ticker, is active y manejadas por el bot).
  -> mismo cuando se hace un sell para el SL o el TP se deberia actualizar en pythonanywhere para saber que pudede empzar a poner orders nuevamente.
/* ==========================================================
   TEST "¿ESTE VIAJE ES PARA TI?"
   Cada viaje con test tiene una entrada en QUIZZES (la clave es
   el "slug" del viaje en data.js). Para agregar el test de otro
   viaje: copia la entrada de "bali", cambia los textos y las
   preguntas, y agrega  quiz: true  al viaje en data.js.
   No hace falta tocar test.js.

   score de cada respuesta:
     "green"  = encaja · "yellow" = con reservas · "red" = no encaja
   critical: true  = pregunta eliminatoria (una respuesta roja ya da "No")
   "alerta" (tercer dato de una respuesta amarilla) = por sí sola ya da "Piénsatela bien"
   reason = frase que se muestra en el resultado
   enMedia: true = su razón también se muestra en "Piénsatela bien" cuando la respuesta fue la intermedia
   ========================================================== */

/* Orden de las opciones en cada pregunta:
   false = siempre de la mejor a la peor (ideal, intermedia, negativa)
   true  = mezcladas al azar en cada carga */
const QUIZ_MEZCLAR = false;

/* Pregunta 2 de Bali: hora a la que empiezan casi todos los días.
   Escríbela con la palabra "a las" (por ejemplo: "a las 6:30").
   Mientras esté en null, la pregunta dice "empezamos temprano". */
const QUIZ_HORA = null;

const QUIZZES = {
  bali: {
    etiqueta: "VOIA BALI",
    foto: "media/balimedia/web/baligaleria-20-fondo.jpg", // portada del test: tarjeta del selector y fondo de la introducción (ruta o código de Unsplash)
    fotoPos: "50% 55%", // qué parte de la foto se ve cuando se recorta
    intro: [
      "Los viajes VOIA no son viajes cualquiera. Son expediciones en grupo pequeño que te sacan de tu zona de confort: madrugamos, convivimos todo el día, nos metemos al mar, caminamos, y compartimos el camino con la naturaleza tal como es, bichos incluidos.",
      "Queremos que cada persona que viaje con nosotros lo disfrute al máximo y que el grupo funcione. Por eso, antes de reservar, te pedimos contestar estas 10 preguntas.",
      "Sé honesto: no hay respuestas buenas ni malas, solo viajes que encajan contigo y otros que no.",
    ],
    tituloSi: "¡VOIA irme de viaje a Bali!", // título del resultado "Sí"
    // Resultado "La aventura te llama": primera frase, (aquí van las razones según las respuestas) y cierre
    introPiensatela: "Varias respuestas indican que partes del viaje podrían retarte",
    cierrePiensatela: "En VOIA creemos que la vida se trata de salir de tu zona de confort. Si tienes dudas, escríbenos y lo platicamos. ¡Queremos que vivas este viaje al máximo!",
    mensajeReserva: "Hola VOIA, quiero reservar mi lugar en el viaje a Bali.",
    mensajeHablar: "Hola VOIA, hice el test del viaje a Bali y me gustaría platicar antes de reservar.",
    mensajeNo: "Hola VOIA, hice el test del viaje a Bali y me gustaría hablar con ustedes.",
    preguntas: [
      { id: 1, tag: "Convivencia",
        q: "¿Has viajado alguna vez en grupo?",
        o: [["Sí, me gustó y lo repetiría.", "green"],
            ["Sí, aunque hubo momentos en los que me costó adaptarme al grupo.", "yellow"],
            ["No, esta sería mi primera vez.", "yellow"]],
        reason: "Es un viaje en grupo: compartimos comidas, traslados y actividades casi todo el día." },
      { id: 2, tag: "Ritmo", critical: true, enMedia: true,
        q: "Casi todos los días empezamos {hora} y seguimos un itinerario de grupo. ¿Cómo lo ves?",
        o: [["Perfecto, lo que quiero es aprovechar el día.", "green"],
            ["No es lo mío, pero me adapto sin problema.", "yellow"],
            ["Necesito dormir y decidir mis propios horarios.", "red"]],
        reason: "Casi todos los días arrancamos muy temprano y seguimos un itinerario de grupo." },
      { id: 3, tag: "Naturaleza real", critical: true,
        q: "En Bali vas a convivir con monos, lagartijas, insectos y otros animales, incluso en el alojamiento. ¿Cómo reaccionarías?",
        o: [["Es parte de estar en la naturaleza.", "green"],
            ["No me encantan, pero puedo con ello.", "yellow"],
            ["Me dan mucho asco o pánico y me arruinarían el viaje.", "red"]],
        reason: "En Bali los insectos y los animales son parte del día a día, también en el alojamiento." },
      { id: 4, tag: "Actitud", critical: false,
        q: "Llueve, hace mucho calor, un traslado se alarga o algo no es tan cómodo como en casa. Normalmente tú:",
        o: [["Lo tomo con humor. Es parte de la aventura.", "green"],
            ["Me incomoda un rato, pero se me pasa rápido.", "yellow"],
            ["Me cuesta mucho, me frustro y suelo quejarme.", "yellow", "alerta"]],
        reason: "Vas a encontrar calor, humedad, lluvia y menos comodidades que en la ciudad. La actitud del grupo lo es todo." },
      { id: 5, tag: "El mar", critical: false, enMedia: true,
        q: "Vamos a hacer actividades en el mar, siempre con guías y equipo de seguridad. ¿Cómo te sientes en el mar?",
        o: [["Cómodo. Sé nadar y disfruto el mar.", "green"],
            ["Sé nadar, pero el mar me impone un poco.", "yellow"],
            ["No sé nadar o el mar me da mucho miedo.", "yellow", "alerta"]],
        reason: "Habrá una actividad en el mar. Es segura y va guiada, pero conviene que sepas que está en el itinerario. Si no sabes nadar, escríbenos antes de reservar." },
      { id: 6, tag: "Condición física", critical: true,
        q: "El viaje incluye caminar, andar por terreno irregular, viajar en moto, subir y bajar de barcos. En Bali casi nada está adaptado para personas con movilidad reducida. ¿Cómo te sientes con esto?",
        o: [["Tengo buena condición y lo hago sin problema.", "green"],
            ["Me canso, pero puedo hacerlo a mi ritmo.", "yellow"],
            ["Tengo movilidad reducida o alguna limitación para caminar o subir escalones.", "red"]],
        reason: "Bali no está adaptado para movilidad reducida: templos con escaleras, caminos irregulares y barcos sin rampa." },
      { id: 7, tag: "Naturaleza", critical: false,
        q: "¿Qué papel juega la naturaleza cuando eliges un viaje?",
        o: [["Es lo principal. Busco destinos donde la naturaleza sea protagonista.", "green"],
            ["Me gusta, pero también me atraen la ciudad, las compras o la fiesta.", "yellow"],
            ["Prefiero destinos urbanos o de resort.", "yellow", "alerta"]],
        reason: "La naturaleza es el centro de este viaje, no un complemento." },
      { id: 8, tag: "Cultura local", critical: true,
        q: "Hoy decidimos comer en un “warung”, un restaurante local donde solo hay comida balinesa: nada de hamburguesas, pasta ni pizza. ¿Qué haces?",
        o: [["¡Genial! Pido algo que nunca he probado.", "green"],
            ["Pido lo más sencillo o lo que se parezca a algo que conozco.", "yellow"],
            ["Me frustra. Prefiero buscar otro lugar o esperarme a cenar.", "red"]],
        reason: "Comemos principalmente en restaurantes locales para vivir la cultura y apoyar a la comunidad, muchos tienen opciones occidentales limitadas." },
      { id: 9, tag: "Espíritu aventurero", critical: false,
        q: "¿Con cuál te identificas más?",
        o: [["Me encanta salir de mi zona de confort, probar cosas nuevas y estar activo.", "green"],
            ["Me gusta la aventura, pero en dosis moderadas y con ratos de descanso.", "yellow"],
            ["Prefiero viajes tranquilos, de descanso y confort.", "yellow", "alerta"]],
        reason: "Es un viaje de aventura y actividad, no de descanso y confort." },
      { id: 10, tag: "Transformación", critical: true,
        q: "¿Qué esperas que este viaje deje en ti?",
        o: [["Quiero volver distinto: crecer, conocer una cultura nueva y conectar con la naturaleza.", "green"],
            ["Quiero vivir algo increíble, y si algo cambia en mí, bienvenido.", "green"],
            ["Solo quiero descansar y desconectar.", "red"]],
        reason: "VOIA busca que el viaje te mueva algo por dentro; no es un viaje solo para descansar." },
    ],
  },
};

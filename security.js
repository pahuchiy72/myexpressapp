const jwt = require("jsonwebtoken");

function generateToken(user) {
  //функція яка генерує токен
  //створюємо функцію чка приймає об'єкт(user), якмй повертається з бази даних
  const payload = {
    //створюємо payload він по суті об'єкт який зберігає
    userId: user.id, //
    username: user.name,
  };

  const secret = process.env.JWT_SECRET; //робимо секрет, беремо його на зміних уточненнях
  const options = { expiresIn: "1h" }; //пишемо дані, коли цей токен виходить з ладу{за годину він не буде працювати}

  const token = jwt.sign(payload, secret, options); //створюємо токен sign(підписати)

  return token; //повертаємо токен
}

function verifyToken(token) {
  //створюємо функцію яка приймає об'єкт токен і яка її верифікує
  const secret = process.env.JWT_SECRET; //вона отримує секрет

  try {
    //щось робимо
    const decoded = jwt.verify(token, secret); //викликаємо jwt, передаємо токен та секрет, зберігаємо результат в змінній decoded
    return decoded; // повертаємо decoded
  } catch (err) {
    //якщо щось не так, повертаємо помилку
    return null; // (нічого не повертаємо)
  }
}

function authenticateToken(req, res, next) {
  //створюємо функцію з протоколом() для мідевер
  const authHeader = req.headers["authorization"]; // робимо заголовок
  const token = authHeader && authHeader.split(" ")[1]; //Bearer[0]" "TOKEN[1] це стандарт токен передається в форматі
  if (token == null) {
    //якщо нема токену
    return res.status(401).send({ error: "Нема токену" }); // повертаємо статус і кажемо
  }

  const decoded = verifyToken(token); //якщо токен є-отримуємо payload використоюмо ф-цію, передаємо їй токен

  if (decoded == null) {
    // якщо пейлод пустий
    return res.status(403).send({ error: "Токен не знайдено" }); //повертаємо
  }

  req.user = decoded; // якщо токен є - ми в req створюємо об'єкт юзер, яеий буде містити ін-ю про кор-ча

  next(); //в кінці викликаємо ф-ію нехт, щоб мідлевер передав роботу наступним ф-ям, які задіяні в цьому процесі
}

module.exports = {
  // експорт ф-ії
  authenticateToken,
  generateToken,
};

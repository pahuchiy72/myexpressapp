const app = require("../../app");
const { PrismaClient } = require("@prisma/client");
const request = require("supertest");
const { testEnvironment } = require("../../jest.config");
// const { request } = require("../../app");

const prisma = new PrismaClient();

const users = [
  { email: "test1@example.com", name: "Test User 1" },
  { email: "test2@example.com", name: "Test User 2" },
  { email: "test3@example.com", name: "Test User 3" },
  { email: "test4@example.com", name: "Test User 4" },
];

describe("GET /users", () => {
  //для опису те що будемо тестувати
  beforeAll(async () => {
    //перед кожним тестуванням запускаємо ф-ю beforeAll асинхрону
    for (const user of users) {
      //буде створювати в базі наших даних усіх коритувачів в масиві user, запускаємо цикл
      await prisma.user.create({
        data: user, //пройде в цей масив і створить усіх цих користувачів
      });
    }
  });

  afterAll(async () => {
    //чистемо нашу базу даних через асинхрону ф-ю
    await prisma.user.deleteMany({}); //видаляємо всіх користувачів
    await prisma.$disconnect(); //відключаємося від цієї бази даних
  });

  test("shoult respond with a list of users, має відповісти списком користувачів", async () => {
    //пишемо тест , опис тесту, асинхрону ф-ю
    const response = await request(app).get("/users"); //робимо ір-запит до нашого ір, передаємщ як параметр арр, робимо запит get до імпойт '/users'
    expect(response.statusCode).toBe(200); //очікуємо, що імройн щось буде відповідати
    expect(response.body).toBeInstanceOf(Array); //перевіряємо чи повертається массив
    expect(response.body.length).toBeGreaterThan(2); //очікуємо побачити всіх створених користувачів, length первірка довжини відповіді
  });

  test('shoult paginate the results, слід розбити результати на сторінки', async () => {
    const response = await request(app).get('/users?page=2&limit=2'); //запит до іра 
    expect(response.statusCode).toBe(200); 
    expect(response.body.length).toBe(2);
  });

  test('should handle invlid page and limit parameters grace, має обробляти недійсну сторінку та ліміт параметрів', async () => {
    const response = await request(app).get('/users?page=-1&limit=abc');
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  })
});

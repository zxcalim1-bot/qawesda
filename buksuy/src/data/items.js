// size — сколько места занимает в багажнике, stack — сколько штук в одной ячейке
// price — цена в магазине, sell — сколько дадут при продаже
// food — сколько сил восстанавливает

export const ITEMS = {
  toolkit: { name: 'Набор инструментов', icon: '🔧', size: 2, price: 900, sell: 300, desc: 'Ключи на 10, 13 и 17. Ключа на 12 нет и никогда не было.' },
  canister: { name: 'Канистра', icon: '⛽', size: 2, price: 450, sell: 120, capacity: 20, desc: 'Железная, двадцатилитровая. Внутри: {fuel} л.' },
  battery: { name: 'Аккумулятор', icon: '🔋', size: 2, price: 2300, sell: 600, desc: 'Свежий. Ну, свежее того, что стоит.' },
  spare_wheel: { name: 'Запасное колесо', icon: '🛞', size: 3, price: 1500, sell: 400, desc: 'Докатка? Нет, целое. Почти.' },
  oil: { name: 'Моторное масло', icon: '🧴', size: 1, stack: 3, price: 380, sell: 100, desc: 'Литр минералки для двигателя.' },
  coolant: { name: 'Антифриз', icon: '🧪', size: 1, stack: 3, price: 320, sell: 90, desc: 'Зелёный. Не пить.' },
  parts: { name: 'Запчасти', icon: '🔩', size: 1, stack: 6, price: 260, sell: 80, desc: 'Болты, гайки, шайбы, загадочные железки.' },
  food: { name: 'Еда', icon: '🍞', size: 1, stack: 5, price: 140, sell: 30, food: 30, desc: 'Батон и плавленый сырок.' },
  water: { name: 'Вода', icon: '💧', size: 1, stack: 5, price: 60, sell: 10, food: 8, desc: 'Можно пить. Можно залить в радиатор (не советую на севере).' },
  tape: { name: 'Синяя изолента', icon: '🟦', size: 1, stack: 5, price: 90, sell: 20, desc: 'Чинит всё. Временно. Но всё.' },
  wire: { name: 'Проволока', icon: '➰', size: 1, stack: 5, price: 60, sell: 10, desc: 'Держит то, что изолента не удержала.' },
  belt: { name: 'Ремень генератора', icon: '➿', size: 1, price: 480, sell: 150, desc: 'Резиновый, новый, пахнет магазином.' },
  tights: { name: 'Капроновые колготки', icon: '🧦', size: 1, price: 90, sell: 15, desc: 'Народный ремень генератора. Сорок ден.' },
  plugs: { name: 'Свечи зажигания', icon: '🕯', size: 1, price: 420, sell: 120, desc: 'Комплект из четырёх.' },
  hose: { name: 'Патрубок', icon: '〰', size: 1, price: 320, sell: 80, desc: 'Резиновый шланг для системы охлаждения.' },
  brake_hose: { name: 'Тормозной шланг', icon: '🪢', size: 1, price: 380, sell: 90, desc: 'Без него педаль — просто педаль.' },
  brake_pads: { name: 'Тормозные колодки', icon: '🟫', size: 1, price: 650, sell: 160, desc: 'Комплект на ось.' },
  fuel_pump: { name: 'Бензонасос', icon: '⚙️', size: 1, price: 1900, sell: 500, desc: 'Редкая штука. Без него Ласточка задыхается.' },
  clutch_disc: { name: 'Диск сцепления', icon: '💿', size: 1, price: 1700, sell: 450, desc: 'Тяжёлый блин с пружинками.' },
  shock: { name: 'Амортизаторы', icon: '🗜', size: 2, price: 1300, sell: 300, desc: 'Пара. Масло внутри, а не снаружи.' },
  bulb: { name: 'Фара в сборе', icon: '💡', size: 1, stack: 2, price: 450, sell: 100, desc: 'Круглая, как у всех нормальных машин.' },
  glass: { name: 'Лобовое стекло', icon: '🪟', size: 3, price: 2600, sell: 600, desc: 'Огромное, хрупкое. Не урони.' },
  film: { name: 'Плёнка', icon: '🎞', size: 1, stack: 3, price: 120, sell: 20, desc: 'Парниковая. Если стекла нет — хоть что-то.' },
  patch_kit: { name: 'Набор для латания шин', icon: '🩹', size: 1, stack: 3, price: 280, sell: 70, desc: 'Жгуты, клей и вера в лучшее.' },
  gearbox_kit: { name: 'Ремкомплект КПП', icon: '⚙️', size: 1, price: 1500, sell: 400, desc: 'Синхронизаторы, сальники, подшипник.' },
  saw: { name: 'Ножовка', icon: '🪚', size: 2, price: 550, sell: 150, desc: 'Пилить упавшие деревья. И не только.' },
  rope: { name: 'Буксировочный трос', icon: '🪢', size: 1, price: 420, sell: 100, desc: 'Чтобы тебя вытащили. Или ты кого-то.' },
  coffee: { name: 'Кофе в термосе', icon: '☕', size: 1, stack: 3, price: 160, sell: 30, food: 40, desc: 'Бодрит лучше, чем радио.' },
  pirozhki: { name: 'Пирожки бабы Нюры', icon: '🥟', size: 1, stack: 6, price: 100, sell: 40, food: 35, desc: 'С капустой. Тёплые, сколько бы ни прошло времени.' },
  fish: { name: 'Вяленая рыба', icon: '🐟', size: 1, stack: 5, price: 150, sell: 70, food: 25, desc: 'Пахнет на весь салон.' },
  scrap: { name: 'Металлолом', icon: '🧱', size: 2, stack: 2, price: 0, sell: 180, desc: 'Железо. Кому-то нужно.' },
  samovar: { name: 'Самовар', icon: '🫖', size: 2, price: 0, sell: 1400, desc: 'Тульский. С медалями. Немного помят.' },
  radio_lamp: { name: 'Радиолампа', icon: '🔆', size: 1, stack: 4, price: 0, sell: 250, desc: 'Старая, советская. Радиолюбители за такие душу продают.' },
  cassette: { name: 'Кассета', icon: '📼', size: 1, price: 0, sell: 0, desc: 'Подписана от руки: «Для дороги. Аня».', quest: true },
  parcel: { name: 'Посылка «НЕ КАНТОВАТЬ»', icon: '📦', size: 2, price: 0, sell: 0, desc: 'Для Бориса на заводе. Внутри что-то звякает.', quest: true },
  tackle: { name: 'Рыбацкий ящик', icon: '🧰', size: 2, price: 0, sell: 0, desc: 'Ящик Семёныча. Блёсны, мормышки, фляжка.', quest: true },
  carburetor: { name: 'Карбюратор «Солекс»', icon: '⚙️', size: 1, price: 0, sell: 2500, desc: 'Редкая деталь. Гена говорил, что для «Волжского» мотора нужен именно такой.' },
  documents: { name: 'Справка о техосмотре', icon: '📄', size: 1, price: 0, sell: 0, desc: 'Пожелтевшая. Подпись неразборчива. Печать — круглая, это главное.', quest: true },
  thermos_tea: { name: 'Термос с чаем', icon: '🍵', size: 1, price: 0, sell: 0, food: 30, desc: 'От бабы Нюры. Для сторожа Бориса, если что.' },
  key_garage: { name: 'Ключ от гаража', icon: '🗝', size: 1, price: 0, sell: 0, desc: 'Бирка: «Гараж 17. Не продавать». Где этот гараж?', quest: true },

  // отвалившиеся детали машины
  part_bumperF: { name: 'Передний бампер', icon: '🔲', size: 3, sell: 150, carPart: 'bumperF', desc: 'Свой, родной. Чуть помятый.' },
  part_bumperR: { name: 'Задний бампер', icon: '🔲', size: 3, sell: 150, carPart: 'bumperR', desc: 'Свой, родной.' },
  part_doorL: { name: 'Левая дверь', icon: '🚪', size: 4, sell: 300, carPart: 'doorL', desc: 'Водительская. Без неё дует.' },
  part_doorR: { name: 'Правая дверь', icon: '🚪', size: 4, sell: 300, carPart: 'doorR', desc: 'Пассажирская.' },
  part_hood: { name: 'Капот', icon: '🟩', size: 4, sell: 250, carPart: 'hood', desc: 'Большой, неудобный.' },
  part_trunk: { name: 'Крышка багажника', icon: '🟩', size: 3, sell: 200, carPart: 'trunk', desc: 'Без неё вещи выпадают на кочках.' },
  part_mirrorL: { name: 'Левое зеркало', icon: '🪞', size: 1, sell: 60, carPart: 'mirrorL', desc: 'Объекты в зеркале ближе, чем кажутся.' },
  part_mirrorR: { name: 'Правое зеркало', icon: '🪞', size: 1, sell: 60, carPart: 'mirrorR', desc: '' },
  part_exhaust: { name: 'Глушитель', icon: '🎺', size: 2, sell: 80, carPart: 'exhaust', desc: 'Без него Ласточка звучит как самолёт.' },
  part_wheel: { name: 'Колесо', icon: '🛞', size: 3, sell: 300, carPart: 'wheel', desc: 'Своё колесо. Укатилось, но вернулось.' },
};

export function itemDesc(id, state) {
  const it = ITEMS[id];
  if (!it) return '';
  let d = it.desc || '';
  if (state && state.fuel !== undefined) d = d.replace('{fuel}', state.fuel.toFixed(1));
  return d;
}

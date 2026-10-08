// Диалоги. Узел: { who, text, options: [{ text, next, if, do }], next, do, end, after }
// who: id персонажа, 'me' — игрок. after: 'shop:id' | 'workshop:id' | 'upgrades:id' — что открыть после разговора.

const has = (g, id, n = 1) => g.inventory.has(id, n, true);
const flag = (g, f) => g.story.hasFlag(f);
const q = (g) => g.quests;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const DIALOGS = {
  // ---------------- дядя Миша ----------------
  misha_intro: {
    start: 'a',
    nodes: {
      a: { text: 'А, проснулся. Вот она. Ласточка. Моя. Теперь — твоя.', next: 'b' },
      b: { text: 'Сорок лет стояла под навесом. Заводится с третьего раза, тормозит с пятого. А едет — всегда. Ну… почти всегда.', next: 'c' },
      c: {
        text: 'Вопросы есть?',
        options: [
          { text: 'Зачем мне машина?', next: 'why' },
          { text: 'Что там, на севере?', next: 'north' },
          { text: 'Она вообще доедет?', next: 'will' },
          { text: 'Ладно. Поехал.', next: 'go' },
        ],
      },
      why: { text: 'Затем, что пешком до севера далеко. А тебе надо на север.', next: 'why2' },
      why2: { who: 'me', text: 'Почему мне надо на север?', next: 'north' },
      north: { text: 'Если хочешь узнать, что находится на севере — доедь до Северного города.', next: 'north2' },
      north2: { text: 'Больше ничего не скажу. У меня давление.', next: 'c' },
      will: { text: 'Она — да. Насчёт тебя не уверен.', next: 'c' },
      go: {
        text: 'Бак почти пустой. Заправка «Колос» — по трассе на север, не промахнёшься. Держи на первое время. И загляни к Гене в мастерскую — ворчит, но руки золотые.',
        do: (g) => {
          g.quests.start('main', 'fuel');
          g.ui.notify('Задание: заправить Ласточку на АЗС «Колос»', 'good');
        },
        next: 'go2',
      },
      go2: { text: 'И ещё. Если увидишь старый мост… А, ладно. Езжай. Сам разберёшься.', end: true, do: (g) => g.story.setFlag('intro_done') },
    },
  },

  misha: {
    start: 'hub',
    nodes: {
      hub: {
        text: (g) => (flag(g, 'intro_done') ? pick([
          'Ну что стоишь? Север сам себя не найдёт.',
          'Масло проверял? Проверь. Потом ещё раз проверь.',
          'Ласточку не гони. Она этого не любит.',
        ]) : 'Ну?'),
        options: [
          { text: 'Расскажи про Ласточку', next: 'car' },
          { text: 'Кто такой Кирилл?', if: (g) => g.story.noteRead('glovebox'), next: 'kirill' },
          { text: 'Ты сам ездил на север?', next: 'self' },
          { text: 'Пока, дядя Миша', next: 'bye' },
        ],
      },
      car: { text: 'Собрали её в Тольятти в семьдесят каком-то году. Мы с другом на ней… Ладно, неважно. Главное — у неё характер. С ней надо разговаривать.', next: 'hub' },
      kirill: { text: 'Где ты… В бардачке? Я и забыл, что там… Кирилл — друг. Был. Есть. Не знаю. Доедешь — узнаешь.', do: (g) => g.npcs.rel('misha', 1), next: 'hub' },
      self: { text: 'Ездил. В восемьдесят шестом. До старого моста доехал, а дальше… Дальше не твоё дело. Езжай.', next: 'hub' },
      bye: { text: 'Давай. Позвони, как доедешь. Телефона у меня нет, но ты позвони.', end: true },
    },
  },

  // ---------------- Гена ----------------
  gena: {
    start: (g) => (g.vehicle.damage.overall() < 12 ? 'refuse' : flag(g, 'met_gena') ? 'hub' : 'first'),
    nodes: {
      first: { text: 'Ты на ней сюда приехал?', next: 'f2' },
      f2: { who: 'me', text: 'Да.', next: 'f3' },
      f3: { text: 'Она сама сюда доехала?', next: 'f4' },
      f4: { who: 'me', text: 'Да.', next: 'f5' },
      f5: { text: 'Тогда я её не трогал бы.', do: (g) => g.story.setFlag('met_gena'), next: 'hub' },
      refuse: {
        text: 'Нет. Нет-нет-нет. Я такое не чиню. Я такое отпеваю.',
        do: (g) => g.achievements.unlock('mechanic_refuses'),
        options: [
          { text: 'Гена, ну пожалуйста…', next: 'refuse2' },
          { text: 'Ладно, сам справлюсь', next: 'bye' },
        ],
      },
      refuse2: { text: 'Ладно. Двойной тариф. За моральный ущерб. Мне потом сниться будет.', after: 'workshop:gena:2', end: true },
      hub: {
        text: (g) => pick([
          'Ну, чего тебе?',
          'Опять ты. Что на этот раз отвалилось?',
          'Говори быстрее, у меня «Москвич» на подъёмнике скучает.',
        ]),
        options: [
          { text: 'Почини машину', after: 'workshop:gena:1', end: true },
          { text: 'Мне нужны запчасти', after: 'shop:gena', end: true },
          { text: 'Что можно улучшить?', after: 'upgrades:gena', end: true },
          { text: 'Смотри, что я нашёл — карбюратор «Солекс»', if: (g) => has(g, 'carburetor') && !flag(g, 'gena_carb'), next: 'carb' },
          { text: 'Сколько она жрёт бензина?', next: 'fuel' },
          { text: 'Что скажешь про север?', next: 'north' },
          { text: 'Ласточка как-то странно себя ведёт…', next: 'advice' },
          { text: 'Хочу продать Ласточку', if: (g) => flag(g, 'intro_done'), next: 'sell' },
          { text: 'Пока, Гена', next: 'bye' },
        ],
      },
      carb: {
        text: '…Где ты это взял? Это же «Солекс». Настоящий. Я двадцать лет такой ищу. Знаешь что — ставлю тебе мотор от «Волги» за полцены. Только карбюратор — мой. Шучу. Карбюратор — в мотор.',
        do: (g) => {
          g.story.setFlag('gena_carb');
          g.npcs.rel('gena', 3);
          g.ui.notify('Гена согласен поставить 90-сильный мотор со скидкой', 'good');
        },
        after: 'upgrades:gena',
        end: true,
      },
      fuel: { text: 'По пять литров на километр, если с горки. Это не машина, это философия.', next: 'hub' },
      north: { text: 'Был у меня клиент оттуда. Приехал на «Ниве», уехал пешком. Говорит, там машины не нужны. Врёт, наверное. Или нет.', next: 'hub' },
      advice: {
        text: (g) => {
          const d = g.vehicle.damage;
          if (d.hasFault('belt')) return 'Аккумулятор не заряжается? Ремень генератора, к гадалке не ходи. Нет ремня — колготки. Не смейся, работает.';
          if (d.hasFault('plugs')) return 'Троит? Свечи. Поменяй или хоть почисти. Ножиком. Аккуратно.';
          if (d.hasFault('fuelpump')) return 'Глохнет на ходу? Бензонасос. Постучи по нему. Серьёзно, постучи.';
          if (d.fluids.oil < 0.3) return 'Масло. Ты вообще масло проверял? Ты же мне её угробишь.';
          if (d.hp('brakes') < 40) return 'Тормоза у тебя — одно название. Колодки поменяй, пока не поздно.';
          if (d.flat.some((f) => f)) return 'У тебя колесо спущено. Я вижу. Все видят.';
          return 'Да вроде живая. Скрипит, стучит, но живая. Как я.';
        },
        next: 'hub',
      },
      sell: {
        text: (g) => `Продать? Ласточку? …Ну, ${g.story.carPrice()} дам. Больше никто не даст. Меньше — тоже никто, я единственный, кто её купит. Только учти: обратно не продам.`,
        options: [
          { text: `Продаю`, next: 'sell2' },
          { text: 'Нет, я передумал', next: 'sell_no' },
        ],
      },
      sell2: { text: 'Точно? Дядя Миша тебе потом уши открутит. Мне — тоже.', options: [{ text: 'Точно. Продаю.', do: (g) => g.story.sellCar(g.story.carPrice()), end: true }, { text: 'Нет, пусть едет на север', next: 'sell_no' }] },
      sell_no: { text: 'Вот и правильно. Я бы её всё равно на запчасти не разобрал. Рука бы не поднялась.', next: 'hub' },
      bye: { text: 'Давай. Если что — эвакуатор знаешь где. Нигде. Его нет.', end: true },
    },
  },

  // ---------------- Люда ----------------
  luda: {
    start: 'hub',
    nodes: {
      hub: {
        text: (g) => (flag(g, 'met_luda') ? pick(['Ну?', 'Опять ты. Бензин кончился или совесть?', 'Чего тебе, путешественник?'])
          : 'Бензин — в колонке, деньги — в окошке, вопросы — в жалобную книгу. Жалобной книги нет.'),
        do: (g) => g.story.setFlag('met_luda'),
        options: [
          { text: 'Как заправиться?', next: 'fuel' },
          { text: 'Что нового?', next: 'news' },
          { text: 'Хочу что-нибудь купить', after: 'shop:kolos_shop', end: true },
          { text: 'Пока', next: 'bye' },
        ],
      },
      fuel: { text: 'Колонка вон. Подъезжаешь, жмёшь «Заправка», платишь. Пистолет вставляй в бак, а не куда обычно.', next: 'hub' },
      news: {
        text: (g) => pick([
          'Говорят, на перевале опять обвал будет. Каждый год говорят, и каждый год — бац.',
          'Валера в кафе «Трасса» опять ищет, кому посылку сунуть. Не связывайся. Хотя он платит.',
          'Видела вчера мужика в плаще на обочине. Стоит, смотрит. Я моргнула — нету. Я больше не моргаю.',
          'Если кончится бензин — у меня канистры есть. Тоже за деньги, не надейся.',
          'Дед Ефим опять всем рассказывает про мост. Ты его слушай, он хоть и старый, но не дурак.',
          'На севере, говорят, сияние. Красиво. Я не видела. Я тут двадцать лет.',
        ]),
        next: 'hub',
      },
      bye: { text: 'Мотор у колонки не заводи. Уже было. Брови до сих пор отрастают.', end: true },
    },
  },

  // ---------------- Валера ----------------
  valera: {
    start: (g) => (flag(g, 'met_valera') ? 'hub' : 'first'),
    nodes: {
      first: { text: 'Это твоё? Бирюзовое? Куда путь держишь?', next: 'f2' },
      f2: { who: 'me', text: 'На север. В Северный город.', next: 'f3' },
      f3: { text: 'До севера? На ЭТОМ? …Удачи.', do: (g) => g.story.setFlag('met_valera'), next: 'hub' },
      hub: {
        text: (g) => pick(['Чего хотел?', 'Садись, кофе будешь? Шучу, кофе платный.', 'Ну, рассказывай.']),
        options: [
          { text: 'Есть работа?', if: (g) => !q(g).known('parcel'), next: 'parcel' },
          { text: 'Посылку отвёз, всё нормально', if: (g) => q(g).isDone('parcel') && !flag(g, 'valera_thanked'), next: 'thanks' },
          { text: 'Расскажи про трассу', next: 'road' },
          { text: 'Почему сам не повезёшь на север?', next: 'why' },
          { text: 'Пока', next: 'bye' },
        ],
      },
      parcel: {
        text: 'Работа есть. Посылку отвезти — сторожу Борису на завод «Красный поршень», это за рекой, на восток от трассы. Хрупкое. Плачу полторы тысячи, половину сейчас.',
        options: [
          {
            text: 'Беру',
            do: (g) => {
              if (!g.inventory.give('parcel', 1, null, 'trunk', true)) {
                g.ui.notify('Посылке нет места. Освободи багажник.', 'warn');
                return;
              }
              g.inventory.addMoney(750, 'аванс');
              g.quests.start('parcel');
            },
            next: 'parcel_ok',
          },
          { text: 'Не, я не почтальон', next: 'parcel_no' },
        ],
      },
      parcel_ok: { text: 'Вот и ладно. Только не кантуй. Я серьёзно. Там… ну, неважно что там. Хрупкое там.', next: 'hub' },
      parcel_no: { text: 'Как знаешь. Посылка подождёт. Она тридцать лет ждёт.', next: 'hub' },
      thanks: { text: 'Борис звонил. Доволен, как слон. Держи, остальное.', do: (g) => { g.story.setFlag('valera_thanked'); g.inventory.addMoney(750, 'посылка'); g.npcs.rel('valera', 2); }, next: 'hub' },
      road: { text: 'Мост через Кривую новый, держит. Старый — не держит никого, особенно дураков. За перевалом — снег, без зимней резины даже не мечтай. И на серпантине не гони, там камни сыплются.', next: 'hub' },
      why: { text: 'Моя фура на север не ездит. Там шлагбаум, а у прапорщика Сидоренко ко мне личное. Я у него однажды… неважно. Пирожки он любит. Запомни.', next: 'hub' },
      bye: { text: 'Давай. Если увидишь мужика в плаще — не останавливайся. Мало ли.', end: true },
    },
  },

  // ---------------- дед Ефим ----------------
  efim: {
    start: (g) => (flag(g, 'met_efim') ? 'hub' : 'first'),
    nodes: {
      first: { text: 'Кто таков? А-а… на Ласточке. Узнаю. Ты вот что: если увидишь старый мост — не сворачивай направо.', next: 'f2' },
      f2: { text: 'Не сворачивай, говорю!', do: (g) => g.story.setFlag('met_efim'), next: 'hub' },
      hub: {
        text: (g) => pick(['Чего тебе, внучек?', 'Не сворачивай направо. Я уже говорил? Ещё раз скажу.', 'Сядь, посиди. Куда торопиться.']),
        options: [
          { text: 'А что там, направо?', next: 'right' },
          { text: 'А налево?', next: 'left' },
          { text: 'Расскажи про восемьдесят шестой', if: (g) => flag(g, 'efim_right'), next: 'story' },
          { text: 'Можно взять что-нибудь в сарае?', if: (g) => !flag(g, 'efim_ok'), next: 'barn' },
          { text: 'Пойду я', next: 'bye' },
        ],
      },
      right: { text: 'Болото. Чёрное. Машины там стоят, как грибы. Одна — с восемьдесят шестого года.', do: (g) => g.story.setFlag('efim_right'), next: 'hub' },
      left: {
        text: 'Налево дорога заросла. Говорят, там вышка, а за ней — старая узкоколейка, до самого севера. Тоннель там. Я не проверял, мне и тут хорошо.',
        do: (g) => g.story.revealRoad('west_road'),
        next: 'hub',
      },
      story: {
        text: 'Ехали двое на бирюзовой. Один хотел налево, другой — направо. Поругались прямо у меня под окном. Вернулся один — без машины, без друга, весь в тине. Сказал: «Машину вытащу потом». Тридцать с лишним лет вытаскивает.',
        do: (g) => g.story.addClueFromNote('efim_story'),
        next: 'hub',
      },
      barn: { text: 'Бери, что под руку попадёт. Только трактор не трогай.', do: (g) => g.story.setFlag('efim_ok'), next: 'barn2' },
      barn2: { who: 'me', text: 'Там нет никакого трактора.', next: 'barn3' },
      barn3: { text: 'Вот и не трогай.', next: 'hub' },
      bye: { text: 'Иди. И помни: направо — не надо.', end: true },
    },
  },

  // ---------------- Семёныч ----------------
  semenych: {
    start: 'hub',
    nodes: {
      hub: {
        text: (g) => pick(['Тсс. Рыбу распугаешь. Она, кстати, тоже на север уплывает.', 'Клюёт плохо. Рыба нынче умная пошла.', 'Присаживайся. Только тихо.']),
        options: [
          { text: 'Что-то случилось? Вид у тебя грустный', if: (g) => !q(g).known('tackle'), next: 'tackle' },
          { text: 'Вот твой ящик', if: (g) => has(g, 'tackle'), next: 'tackle_done' },
          { text: 'Расскажи про брод', if: (g) => q(g).isDone('tackle'), next: 'ford' },
          { text: 'Как клюёт?', next: 'fish' },
          { text: 'Пока', next: 'bye' },
        ],
      },
      tackle: {
        text: 'Ящик свой рыбацкий забыл. В доме с синими ставнями, у кума. Кум помер, а ящик остался. А там блёсны, мормышки, фляжка… Фляжка особенно. Привезёшь — расскажу про брод. Короткая дорога, ни один мост не нужен.',
        do: (g) => g.quests.start('tackle', has(g, 'tackle') ? 'bring' : 'find'),
        next: 'hub',
      },
      tackle_done: {
        text: 'Он! Родной! И фляжка на месте… почти полная. Ну, спасибо. Держи рыбы, держи денег. И слушай про брод.',
        do: (g) => {
          g.inventory.take('tackle', 1, true);
          g.inventory.give('fish', 3, null, 'trunk', true);
          g.inventory.addMoney(300, 'Семёныч');
          g.quests.complete('tackle');
          g.npcs.rel('semenych', 3);
        },
        next: 'ford',
      },
      ford: {
        text: 'От лагеря правее, вдоль берега. Где река широкая — там и мелко. Держись левее, колёса по камням. Воды по колено, если не дурить. А за рекой колея на завод и дальше на перевал.',
        do: (g) => g.story.revealRoad('ford_track'),
        next: 'hub',
      },
      fish: { text: 'Окунь — есть. Щука — была. А вот одна рыба тут каждую ночь светится. Не рыба, наверное. Не знаю. Я не пью. Почти.', next: 'hub' },
      bye: { text: 'Езжай. Тихо только. Рыба всё слышит.', end: true },
    },
  },

  // ---------------- тётя Зина ----------------
  zina: {
    start: 'hub',
    nodes: {
      hub: {
        text: 'Колёса, запчасти, советы. Советы бесплатно.',
        options: [
          { text: 'Почини машину', after: 'workshop:zina:0.9', end: true },
          { text: 'Хочу купить запчасти', after: 'shop:zina', end: true },
          { text: 'Шины и подвеска', after: 'upgrades:zina', end: true },
          { text: 'Дай совет', next: 'advice' },
          { text: 'Не знаешь, где гараж номер семнадцать?', if: (g) => has(g, 'key_garage') && !g.worldInteractions.left.garage17, next: 'garage' },
          { text: 'Пока', next: 'bye' },
        ],
      },
      advice: {
        text: () => pick([
          'Зимняя резина на севере — не роскошь, а средство передвижения.',
          'В грязи не газуй — копай. Или газуй, но с умом: чуть вперёд, чуть назад, качай её.',
          'Колготки вместо ремня — работает. Проверено на трёх мужьях.',
          'Если машина перевернулась — не плачь. Вылезь, раскачай и поставь. Сила не нужна, нужна злость.',
          'Свечи чисти ножом. Только не тем, которым хлеб режешь. Хотя… тем тоже можно.',
          'Ручник в повороте — это не трюк, это образ жизни.',
        ]),
        next: 'hub',
      },
      garage: { text: 'Семнадцатый? Это за шиномонтажом, в гаражном ряду, синие ворота посередине. Хозяина лет тридцать не видели. Говорят, ушёл на север.', do: (g) => g.quests.start('garage'), next: 'hub' },
      bye: { text: 'Давай. Колёса береги — они у тебя одни. Ну, четыре.', end: true },
    },
  },

  // ---------------- баба Нюра ----------------
  nyura: {
    start: 'hub',
    nodes: {
      hub: {
        text: 'Пирожки! С капустой! Сынок, ты чего такой худой?',
        options: [
          { text: 'Давай пирожков', after: 'shop:nyura', end: true },
          { text: 'Мне бы на завод попасть. Сторож не пускает', if: (g) => !flag(g, 'factory_access') && !has(g, 'thermos_tea') && !flag(g, 'nyura_tea'), next: 'tea' },
          { text: 'А почему пирожки всегда тёплые?', next: 'warm' },
          { text: 'Спасибо, бабушка', next: 'bye' },
        ],
      },
      tea: {
        text: 'Борька-то? Отнеси ему чаю. Он без чаю злой, а с чаем — ещё ничего. На, термос. Только верни потом. Не вернёшь — ну и ладно.',
        do: (g) => {
          if (g.inventory.give('thermos_tea', 1, null, 'pockets', true)) g.story.setFlag('nyura_tea');
          else g.ui.notify('Нет места для термоса.', 'warn');
        },
        next: 'hub',
      },
      warm: { text: 'Секрет. С любовью пеку. И ещё печка у меня хорошая, немецкая, трофейная. Но больше — с любовью.', next: 'hub' },
      bye: { text: 'Кушай, сынок. И шапку надень, на севере холодно.', end: true },
    },
  },

  // ---------------- Борис ----------------
  boris: {
    start: (g) => (g.world.dayNight.darkness > 0.6 && g.world.dayNight.time < 5 ? 'sleep' : 'hub'),
    nodes: {
      sleep: { text: 'Хррр… Хррр… …Не сплю! Охраняю! Хррр…', end: true },
      hub: {
        text: (g) => (flag(g, 'factory_access') ? pick(['А, это ты. Проходи, проходи.', 'Цех №2 — направо. Ничего тяжелее карбюратора не выноси.'])
          : 'Стой, кто идёт! Завод закрыт с девяносто восьмого. На обед.'),
        options: [
          { text: 'Вам посылка от Валеры', if: (g) => has(g, 'parcel'), next: 'parcel' },
          { text: 'Вот, чай от бабы Нюры', if: (g) => has(g, 'thermos_tea') && !flag(g, 'factory_access'), next: 'tea' },
          { text: 'Пропустите за 500 рублей?', if: (g) => !flag(g, 'factory_access'), next: 'bribe' },
          { text: 'Давно вы тут работаете?', next: 'old' },
          { text: 'Металлолом принимаете?', if: (g) => !q(g).isDone('scrap'), next: 'scrap' },
          { text: 'Пока', next: 'bye' },
        ],
      },
      parcel: {
        text: (g) => (flag(g, 'parcel_broken')
          ? 'Посылка? От Валерки? Тридцать лет жду! …Звенит. Ну, звенит — значит, было чему звенеть. Проходи уж, раз приехал.'
          : 'Посылка? От Валерки? Тридцать лет жду! …Целый! Целый сервиз! Мамин! Ну, уважил. Проходи на завод, бери что надо.'),
        do: (g) => {
          g.inventory.take('parcel', 1, true);
          g.inventory.addMoney(flag(g, 'parcel_broken') ? 200 : 500, 'посылка');
          g.quests.complete('parcel');
          g.story.setFlag('factory_access');
          g.npcs.rel('boris', 3);
        },
        next: 'hub',
      },
      tea: {
        text: 'Чай? От Нюры? С чабрецом… Ну, проходи, раз такое дело. Цех №2, налево от трубы.',
        do: (g) => { g.inventory.take('thermos_tea', 1, true); g.story.setFlag('factory_access'); g.npcs.rel('boris', 2); },
        next: 'hub',
      },
      bribe: {
        text: 'Пятьсот? Это… взятка? Это не взятка. Это штраф за то, что я тебя не видел.',
        options: [
          { text: 'Дать 500 ₽', if: (g) => g.inventory.canAfford(500), do: (g) => { g.inventory.addMoney(-500, 'Борис'); g.story.setFlag('factory_access'); }, next: 'bribe_ok' },
          { text: 'Передумал', next: 'hub' },
        ],
      },
      bribe_ok: { text: 'Никого не видел. Ничего не слышал. Иди уже.', next: 'hub' },
      old: {
        text: 'С восемьдесят пятого. В восемьдесят шестом, в феврале, мимо меня парень прошёл. Пешком, на север. Я его пустил — холодно было. Ласточкин фамилия. Смешная. В журнале записано, если интересно.',
        do: (g) => g.story.setFlag('boris_told'),
        next: 'hub',
      },
      scrap: {
        text: (g) => `Принимаю. Привезёшь три куска — дам ремкомплект для коробки, новый, в масле. Сейчас у тебя: ${g.inventory.count('scrap', true)}.`,
        options: [
          {
            text: 'Вот, три куска',
            if: (g) => g.inventory.count('scrap', true) >= 3,
            do: (g) => {
              g.inventory.take('scrap', 3, true);
              g.inventory.give('gearbox_kit', 1, null, 'trunk', true) || g.inventory.addMoney(1500, 'металлолом');
              g.quests.complete('scrap');
            },
            next: 'scrap_ok',
          },
          { text: 'Понял', do: (g) => q(g).known('scrap') || g.quests.start('scrap'), next: 'hub' },
        ],
      },
      scrap_ok: { text: 'Вот это я понимаю. Держи. Коробка будет как новая. Ну, как подержанная, но хорошая.', next: 'hub' },
      bye: { text: 'Давай. И это… если увидишь Валерку — скажи, что я не сержусь. Хотя сержусь.', end: true },
    },
  },

  // ---------------- Сидоренко ----------------
  sidorenko: {
    start: (g) => (flag(g, 'checkpoint_open') ? 'open' : 'stop'),
    nodes: {
      open: { text: 'Проезжай, проезжай. Не задерживай движение. Которого нет.', end: true },
      stop: {
        text: 'Стоять! Прапорщик Сидоренко. Документы на транспортное средство.',
        options: [
          { text: 'Вот справка о техосмотре', if: (g) => has(g, 'documents'), next: 'docs' },
          { text: 'Документов нет…', next: 'nodocs' },
          { text: 'Я везу пирожки бабы Нюры', if: (g) => has(g, 'pirozhki'), next: 'pies' },
          { text: 'А что там, в городе?', next: 'city' },
          { text: 'Развернусь, пожалуй', next: 'bye' },
        ],
      },
      docs: {
        text: 'Печать… круглая. Подпись… есть. Год… восемьдесят шестой. Ну что ж. Годится! Проезжай.',
        do: (g) => { g.story.setFlag('checkpoint_open'); g.quests.complete('checkpoint'); },
        end: true,
      },
      nodocs: {
        text: 'Тогда разворачивайся. Шучу. Не шучу. Ладно, наполовину шучу. Есть вариант: штраф за отсутствие штрафа.',
        options: [
          { text: 'Заплатить 1000 ₽', if: (g) => g.inventory.canAfford(1000), do: (g) => { g.inventory.addMoney(-1000, 'КПП'); g.story.setFlag('checkpoint_open'); g.quests.complete('checkpoint'); }, next: 'paid' },
          { text: 'Нет таких денег', next: 'poor' },
        ],
      },
      paid: { text: 'Квитанции не будет. Принтер сломался в девяносто первом. Проезжай.', end: true },
      poor: { text: 'Нет денег — нет проезда. Нет проезда — нет проблем. Вот если бы пирожки…', do: (g) => g.quests.start('checkpoint'), end: true },
      pies: {
        text: 'Пирожки? Бабы Нюры? С капустой?.. Это… меняет дело. Проезжай. Но пирожок оставь. Два пирожка.',
        do: (g) => { g.inventory.take('pirozhki', 2, true); g.story.setFlag('checkpoint_open'); g.quests.complete('checkpoint'); },
        end: true,
      },
      city: { text: 'Город как город. Тихий. Все приезжие пешком приходят, а уезжать никто не хочет. Подозрительно. Я поэтому и стою.', next: 'stop' },
      bye: { text: 'Правильное решение. Хотя вокруг объехать — тоже вариант. Я этого не говорил.', end: true },
    },
  },

  // ---------------- Аня ----------------
  anya: {
    start: (g) => (g.story.hasFlag('anya_met') ? 'again' : 'first'),
    nodes: {
      first: {
        text: 'Привет! Подбросишь до рыбацкого лагеря? Там мой дядя, Семёныч. Я не тяжёлая, у меня только гитара. Гитары, правда, нет.',
        options: [
          { text: 'Садись', do: (g) => g.randomEvents.takePassenger('anya', 'camp', 0), next: 'yes' },
          { text: 'Извини, не по пути', next: 'no' },
        ],
      },
      yes: { text: 'Ура! Я буду показывать дорогу. Я не знаю дорогу, но буду показывать.', do: (g) => g.story.setFlag('anya_met'), end: true },
      no: { text: 'Ну и ладно. Пешком полезнее. Наверное.', do: (g) => g.story.setFlag('anya_met'), end: true },
      again: {
        text: 'О, опять ты! Мир тесен, а дорога ещё теснее. Я теперь тоже на север. Подбросишь?',
        options: [
          { text: 'Запрыгивай', do: (g) => g.randomEvents.takePassenger('anya', 'north_city', 600), next: 'yes2' },
          { text: 'В другой раз', next: 'no' },
        ],
      },
      yes2: { text: 'Северный город! Я про него песню слышала. Не помню какую. Сочиню новую.', end: true },
    },
  },

  // ---------------- незнакомец ----------------
  stranger: {
    start: (g) => ['s1', 's2', 's3'][Math.min(2, g.story.strangerMet)],
    nodes: {
      s1: { text: 'Хорошая машина. Бирюзовая. Я такую уже видел. Давно.', do: (g) => g.story.metStranger(), end: true },
      s2: { text: 'Ты всё ещё едешь? Ласточка редко доезжает дальше моста. Она помнит.', do: (g) => g.story.metStranger(), end: true },
      s3: {
        text: 'Миша всё ещё боится моста? Передай ему: постамент свободен.',
        options: [
          { text: 'Кто ты такой?', next: 's3b' },
          { text: 'Какой постамент?', next: 's3b' },
        ],
      },
      s3b: { text: 'Доедешь — узнаешь. Все узнают, кто доезжает.', do: (g) => { g.story.metStranger(); g.story.addClueFromNote('stranger'); }, end: true },
    },
  },

  // ---------------- Ашот ----------------
  ashot: {
    start: 'hub',
    nodes: {
      hub: {
        text: 'Слушай, дорогой! Есть всё! А чего нет — того тебе и не надо.',
        options: [
          { text: 'Покажи товар', after: 'shop:ashot', end: true },
          { text: 'Откуда всё это?', next: 'where' },
          { text: 'Пока, Ашот', next: 'bye' },
        ],
      },
      where: { text: 'Откуда, откуда… С дороги! Дорога всё даёт, если умеешь брать. Вот самовар — с дороги. Вот колесо — с дороги. Вот я — тоже с дороги.', next: 'hub' },
      bye: { text: 'Езжай с миром! Если что — я везде. Особенно там, где меня не ждут.', end: true },
    },
  },

  // ---------------- Пыжов ----------------
  pyzhov: {
    start: 'a',
    nodes: {
      a: {
        text: (g) => {
          const d = g.vehicle.damage;
          const issues = [];
          if (d.hp('headlightL') < 15 || d.hp('headlightR') < 15) issues.push('почему фара не горит');
          if (d.isDetached('bumperF') || d.isDetached('bumperR')) issues.push('где бампер');
          if (d.isDetached('doorL') || d.isDetached('doorR')) issues.push('где дверь');
          if (d.hp('glass') < 30) issues.push('что со стеклом');
          const list = issues.length ? issues.join(', ') + ', и вообще' : 'почему машина такая бирюзовая';
          return `Лейтенант Пыжов. Документики. …Так. А ${list} — почему она вообще едет?`;
        },
        options: [
          { text: 'Это раритет. Музейный экспонат', next: 'rare' },
          { text: 'Заплатить штраф 300 ₽', if: (g) => g.inventory.canAfford(300), do: (g) => g.inventory.addMoney(-300, 'штраф'), next: 'fine' },
          { text: 'Угостить пирожком', if: (g) => has(g, 'pirozhki'), do: (g) => g.inventory.take('pirozhki', 1, true), next: 'pie' },
        ],
      },
      rare: {
        text: (g) => (g.vehicle.damage.overall() > 60 || Math.random() < 0.4
          ? 'Раритет… Ну да, вижу. Ухоженный раритет. Ладно, езжай. Аккуратно.'
          : 'Раритет — это когда в музее стоит, а не по трассе гремит. Штраф. Сто рублей. Из уважения к возрасту.'),
        do: (g) => { if (g.vehicle.damage.overall() <= 60) g.inventory.addMoney(-100, 'штраф'); },
        end: true,
      },
      fine: { text: 'Квитанцию пришлют. Когда-нибудь. Езжай.', end: true },
      pie: { text: 'С капустой?.. Ладно. На первый раз — устное предупреждение. Устно: будь осторожен.', end: true },
    },
  },

  // ---------------- Толик ----------------
  tolik: {
    start: 'a',
    nodes: {
      a: {
        text: 'Брат, выручай! Ремень генератора порвался. Второй день тут стою. Жена думает, я у тёщи. Тёща думает, я у жены.',
        options: [
          { text: 'Держи ремень', if: (g) => has(g, 'belt'), do: (g) => { g.inventory.take('belt', 1, true); g.inventory.addMoney(900, 'Толик'); g.randomEvents.resolveTolik(true); }, next: 'belt' },
          { text: 'Есть колготки. Капроновые', if: (g) => has(g, 'tights'), do: (g) => { g.inventory.take('tights', 1, true); g.inventory.addMoney(500, 'Толик'); g.randomEvents.resolveTolik(true); }, next: 'tights' },
          { text: 'Прикурить тебе дам, а дальше сам', if: (g) => g.vehicle.engine.on, do: (g) => { g.inventory.addMoney(200, 'Толик'); g.randomEvents.resolveTolik(true); }, next: 'jump' },
          { text: 'Извини, нечем помочь', next: 'no' },
        ],
      },
      belt: { text: 'Брат! Вот спасибо! Держи денег, держи… больше нечего. Держи ещё денег!', end: true },
      tights: { text: 'Колготки?! …А что, работает! Тёща не узнает. Спасибо, брат!', end: true },
      jump: { text: 'Завелась! До Гены дотяну. Спасибо!', end: true },
      no: { text: 'Ну, ладно. Буду ждать. Мимо кто-нибудь да поедет. Ты вот поехал же.', end: true },
    },
  },

  // ---------------- попутчик ----------------
  hitch_generic: {
    start: 'a',
    nodes: {
      a: {
        text: (g) => {
          const o = g.randomEvents.offer;
          return `Здравствуйте! Подбросите? Мне до места «${o?.destName || 'куда-нибудь'}». Заплачу ${o?.reward || 300} рублей. Ну, или расскажу что-нибудь интересное. Лучше деньгами, да?`;
        },
        options: [
          { text: 'Садись', do: (g) => { const o = g.randomEvents.offer; g.randomEvents.takePassenger(o.npc, o.dest, o.reward); }, next: 'yes' },
          { text: 'Не по пути', next: 'no' },
        ],
      },
      yes: { text: 'Спасибо! Я пристегнусь. А, ремня нет. Ну, держаться буду.', end: true },
      no: { text: 'Понял. Пойду пешком. Полезно для сердца, вредно для ног.', end: true },
    },
  },

  // ---------------- грибник ----------------
  vitya: {
    start: 'a',
    nodes: {
      a: {
        text: 'О, машина! Здорово. Грибы нужны? Белые, подберёзовики и… эти. Не знаю, как называются. Красивые.',
        options: [
          { text: 'Почём белые?', next: 'buy' },
          { text: 'Что интересного в лесу?', next: 'rumor' },
          { text: 'Красивые не надо', next: 'no' },
        ],
      },
      buy: {
        text: 'Сто рублей лукошко. Жарить, сушить, на зиму. Бери!',
        options: [
          { text: 'Беру (100 ₽)', if: (g) => g.inventory.canAfford(100), do: (g) => { g.inventory.addMoney(-100, 'грибы'); g.inventory.give('food', 2, null, 'trunk', true); }, next: 'bought' },
          { text: 'Не надо', next: 'rumor' },
        ],
      },
      bought: { text: 'Вот! Только жарь подольше. Подольше, говорю.', next: 'rumor' },
      rumor: {
        text: (g) => g.randomEvents.rumor(),
        end: true,
      },
      no: { text: 'Ну и правильно. Я сам их не ем. Я их собираю.', end: true },
    },
  },

  // ---------------- Кирилл (финал) ----------------
  kirill: {
    start: 'a',
    nodes: {
      a: { text: 'Приехал всё-таки. На Ласточке. Своим ходом. Тридцать лет ждал, что кто-нибудь на ней приедет.', end: true },
    },
  },
};

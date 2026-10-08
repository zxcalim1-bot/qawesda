// Задания. target — id локации для метки на карте (или функция).

export const QUESTS = {
  main: {
    title: 'На север',
    main: true,
    stages: {
      fuel: { text: 'Заправить Ласточку на АЗС «Колос» (трасса, на север от деревни)', target: 'kolos' },
      north: { text: 'Добраться до Северного города', target: 'north_city' },
      done: { text: 'Доехал. Ласточка на постаменте… или нет?' },
    },
  },
  secret: {
    title: 'Тайна Ласточки',
    stages: {
      clues: { text: (g) => `Разобраться, что случилось в 1986 году. Улик: ${g.story.clueCount()} из ${g.story.clueTotal()}` },
    },
  },
  parcel: {
    title: 'Посылка «НЕ КАНТОВАТЬ»',
    stages: {
      deliver: { text: (g) => `Отвезти посылку сторожу Борису на завод «Красный поршень».${g.story.hasFlag('parcel_broken') ? ' Внутри что-то звенит. Уже звенит.' : ' Хрупкое! Не бить машину.'}`, target: 'factory' },
    },
  },
  tackle: {
    title: 'Ящик Семёныча',
    stages: {
      find: { text: 'Найти рыбацкий ящик в доме с синими ставнями (запад от «Колоса»)', target: 'blue_house' },
      bring: { text: 'Отвезти ящик Семёнычу в рыбацкий лагерь', target: 'camp' },
    },
  },
  ride: {
    title: 'Попутчик',
    repeatable: true,
    stages: {
      ride: { text: (g) => g.randomEvents.passengerText(), target: (g) => g.randomEvents.passenger?.dest },
    },
  },
  scrap: {
    title: 'Металлолом для Бориса',
    stages: {
      collect: { text: (g) => `Привезти Борису 3 куска металлолома (есть: ${g.inventory.count('scrap', true)}). Снимать — с брошенных машин.`, target: 'factory' },
    },
  },
  garage: {
    title: 'Гараж №17',
    stages: {
      find: { text: 'Открыть гараж №17 в посёлке Перевал (гаражный ряд за шиномонтажом)', target: 'pereval' },
    },
  },
  signal: {
    title: 'Сигнал на частоте 4',
    stages: {
      find: { text: 'Найти источник странной передачи. На западе в горах, говорят, стоит старая вышка.', target: 'tower' },
      answer: { text: 'Ответить с пульта вышки. Ночью сигнал сильнее.', target: 'tower' },
    },
  },
  checkpoint: {
    title: 'КПП «Северный»',
    stages: {
      pass: { text: 'Пройти КПП: нужны документы, деньги… или пирожки. Или смелость объехать.', target: 'checkpoint' },
    },
  },
  tolik: {
    title: 'Толик на обочине',
    stages: {
      help: { text: 'Помочь Толику: у него порвался ремень генератора', target: (g) => g.randomEvents.tolikPos },
    },
  },
};

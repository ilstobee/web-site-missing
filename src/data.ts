export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export type CategoryExampleTeam = {
  name: string
  skills: string
  rating: string
}

export type CategoryInfo = {
  title: string
  subtitle: string
  spheres: string[]
  teams: CategoryExampleTeam[]
  cta: string
}

export type Category = {
  id: string
  name: string
  icon: string
  tint?: string
  info: CategoryInfo
}

export type Team = {
  id: string
  title: string
  image: string
  members: number
  capacity: number
  avatars: string[]
  tags: string[]
  description: string
  action: 'details' | 'join' | 'watch'
  category: string
  city: string
  difficulty: 'Легко' | 'Средне' | 'Сложно'
}

const av = [
  asset('images/avatars/avatar-1.png'),
  asset('images/avatars/avatar-2.png'),
  asset('images/avatars/avatar-3.png'),
  asset('images/avatars/avatar-4.png'),
]

export const socialAvatars = av

export const categories: Category[] = [
  {
    id: 'travel',
    name: 'Путешествия',
    icon: asset('images/icons/travel.png'),
    tint: 'bg-[#e7f3ff]',
    info: {
      title: 'Найди свою команду для путешествий!',
      subtitle:
        'Здесь ты можешь найти единомышленников для совместных приключений, исследований и незабываемых поездок.',
      spheres: [
        'Пешеходные маршруты',
        'Автостопом',
        'Велопутешествия',
        'Экстремальные поездки',
        'Походы в горы',
        'Культурные экскурсии',
        'Море и пляжи',
        'Приключенческие туры',
      ],
      teams: [
        {
          name: 'Группа для походов в горы',
          skills: 'Физическая подготовка, опыт в походах',
          rating: '4/5',
        },
        {
          name: 'Путешественники на авто',
          skills: 'Умение водить, интерес к новым маршрутам',
          rating: '5/5',
        },
        {
          name: 'Группа для культурных поездок',
          skills: 'Интерес к истории и культуре',
          rating: '4/5',
        },
      ],
      cta: 'Заполни 4 простых шага и найди людей, которые готовы отправиться с тобой в путешествие.',
    },
  },
  {
    id: 'games',
    name: 'Видеоигры',
    icon: asset('images/icons/games.png'),
    info: {
      title: 'Найди свою команду для видеоигр!',
      subtitle: 'Объединяйся с геймерами для совместных баталий, турниров и прохождения.',
      spheres: ['Шутеры', 'Стратегии', 'RPG', 'MOBA', 'Симуляторы'],
      teams: [
        {
          name: 'Киберспортсмены',
          skills: 'Реакция, командная игра, знание меты',
          rating: '4.5/5',
        },
      ],
      cta: 'Заполни 4 шага и найди тиммейтов.',
    },
  },
  {
    id: 'sport',
    name: 'Спорт',
    icon: asset('images/icons/sport.png'),
    info: {
      title: 'Найди команду для спортивных достижений!',
      subtitle: 'Тренируйся, соревнуйся и побеждай вместе с единомышленниками.',
      spheres: ['Футбол', 'Баскетбол', 'Волейбол', 'Бег', 'Йога'],
      teams: [
        {
          name: 'Беговой клуб «Энергия»',
          skills: 'Выносливость, желание тренироваться',
          rating: '5/5',
        },
      ],
      cta: 'Заполни 4 шага и найди тиммейтов.',
    },
  },
  {
    id: 'party',
    name: 'Дискотеки',
    icon: asset('images/icons/party.png'),
    info: {
      title: 'Найди компанию для танцев и вечеринок!',
      subtitle: 'Открой для себя лучшие ночные клубы и события вместе.',
      spheres: ['Хаус', 'Техно', 'Поп-музыка', 'Ретро'],
      teams: [
        {
          name: 'Ночные огни',
          skills: 'Чувство ритма, позитивный настрой',
          rating: '4/5',
        },
      ],
      cta: 'Заполни 4 шага и найди тиммейтов.',
    },
  },
  {
    id: 'food',
    name: 'Кафе и рестораны',
    icon: asset('images/icons/food.png'),
    info: {
      title: 'Найди компанию для гастрономических открытий!',
      subtitle: 'Пробуй новые места и делись впечатлениями.',
      spheres: ['Итальянская кухня', 'Азиатская кухня', 'Вегетарианство', 'Кофейни'],
      teams: [
        {
          name: 'Гурманы',
          skills: 'Интерес к кулинарии, открытость новому',
          rating: '4.2/5',
        },
      ],
      cta: 'Заполни 4 шага и найди тиммейтов.',
    },
  },
  {
    id: 'it',
    name: 'IT',
    icon: asset('images/icons/it.png'),
    info: {
      title: 'Найди команду для IT-проектов!',
      subtitle: 'Создавай стартапы, участвуй в хакатонах и обменивайся опытом.',
      spheres: ['Веб-разработка', 'Мобильная разработка', 'Data Science', 'DevOps', 'Кибербезопасность'],
      teams: [
        {
          name: 'DevBridge',
          skills: 'Python, JavaScript, командная работа',
          rating: '4.8/5',
        },
      ],
      cta: 'Заполни 4 шага и собери команду мечты.',
    },
  },
  {
    id: 'design',
    name: 'Дизайн',
    icon: asset('images/icons/design.png'),
    info: {
      title: 'Найди команду для творческих проектов!',
      subtitle: 'Вместе создавайте визуальные шедевры.',
      spheres: ['Графический дизайн', 'UX/UI', '3D-моделирование', 'Иллюстрация'],
      teams: [
        {
          name: 'Креативная студия',
          skills: 'Figma, Photoshop, чувство стиля',
          rating: '4.7/5',
        },
      ],
      cta: 'Заполни 4 шага и найди тиммейтов.',
    },
  },
  {
    id: 'art',
    name: 'Искусство',
    icon: asset('images/icons/art.png'),
    info: {
      title: 'Найди команду для творческого самовыражения!',
      subtitle: 'Живопись, скульптура, инсталляции — твори вместе.',
      spheres: ['Живопись', 'Скульптура', 'Перформанс', 'Граффити'],
      teams: [
        {
          name: 'Арт-группа «Взгляд»',
          skills: 'Креативность, владение материалами',
          rating: '4.3/5',
        },
      ],
      cta: 'Заполни 4 шага и найди тиммейтов.',
    },
  },
  {
    id: 'music',
    name: 'Музыка',
    icon: asset('images/icons/music.png'),
    info: {
      title: 'Найди музыкальную команду!',
      subtitle: 'Создавай группы, играй концерты и записывай треки.',
      spheres: ['Рок', 'Поп', 'Электроника', 'Джаз', 'Классика'],
      teams: [
        {
          name: 'Рок-бенд «Децибел»',
          skills: 'Игра на инструменте, чувство ритма',
          rating: '4.6/5',
        },
      ],
      cta: 'Заполни 4 шага и найди тиммейтов.',
    },
  },
  {
    id: 'cinema',
    name: 'Кино',
    icon: asset('images/icons/cinema.png'),
    info: {
      title: 'Найди команду для съёмок и просмотров!',
      subtitle: 'Снимай короткометражки, обсуждай фильмы и организуй кинопоказы.',
      spheres: ['Короткометражки', 'Документалистика', 'Анимация', 'Киноклубы'],
      teams: [
        {
          name: 'КиноМастерская',
          skills: 'Монтаж, операторская работа, сценарий',
          rating: '4.4/5',
        },
      ],
      cta: 'Заполни 4 шага и найди тиммейтов.',
    },
  },
  {
    id: 'photo',
    name: 'Фото',
    icon: asset('images/icons/photo.png'),
    info: {
      title: 'Найди команду для фото-проектов!',
      subtitle: 'Организуй фотосессии, учись и вдохновляйся.',
      spheres: ['Портрет', 'Пейзаж', 'Стрит-фотография', 'Предметная съёмка'],
      teams: [
        {
          name: 'Фотоклуб «Объектив»',
          skills: 'Владение камерой, композиция',
          rating: '4.5/5',
        },
      ],
      cta: 'Заполни 4 шага и найди тиммейтов.',
    },
  },
  {
    id: 'dance',
    name: 'Танцы',
    icon: asset('images/icons/dance.png'),
    info: {
      title: 'Найди танцевальную команду!',
      subtitle: 'Танцуй, участвуй в баттлах и выступай на сцене.',
      spheres: ['Хип-хоп', 'Современные танцы', 'Бальные', 'Латина'],
      teams: [
        {
          name: 'Dance Fusion',
          skills: 'Чувство ритма, пластика',
          rating: '4.9/5',
        },
      ],
      cta: 'Заполни 4 шага и найди тиммейтов.',
    },
  },
  {
    id: 'education',
    name: 'Образование',
    icon: asset('images/icons/education.png'),
    info: {
      title: 'Найди команду для учёбы и саморазвития!',
      subtitle: 'Вместе учи языки, готовься к экзаменам и посещай курсы.',
      spheres: ['Иностранные языки', 'Программирование', 'Математика', 'Курсы личностного роста'],
      teams: [
        {
          name: 'StudyLab',
          skills: 'Усидчивость, желание учиться',
          rating: '4.1/5',
        },
      ],
      cta: 'Заполни 4 шага и найди тиммейтов.',
    },
  },
  {
    id: 'books',
    name: 'Книги',
    icon: asset('images/icons/books.png'),
    info: {
      title: 'Найди книжный клуб!',
      subtitle: 'Обсуждай книги, делись рекомендациями и читай вместе.',
      spheres: ['Художественная литература', 'Нон-фикшн', 'Фантастика', 'Классика'],
      teams: [
        {
          name: 'Читатели',
          skills: 'Любовь к чтению, умение анализировать',
          rating: '4.0/5',
        },
      ],
      cta: 'Заполни 4 шага и найди тиммейтов.',
    },
  },
  {
    id: 'science',
    name: 'Наука',
    icon: asset('images/icons/science.png'),
    info: {
      title: 'Найди команду для научных открытий!',
      subtitle: 'Проводи эксперименты, участвуй в конференциях и популяризируй науку.',
      spheres: ['Физика', 'Химия', 'Биология', 'Астрономия'],
      teams: [
        {
          name: 'Научный кружок',
          skills: 'Аналитическое мышление, знание основ',
          rating: '4.6/5',
        },
      ],
      cta: 'Заполни 4 шага и найди тиммейтов.',
    },
  },
  {
    id: 'startups',
    name: 'Стартапы',
    icon: asset('images/icons/startups.png'),
    info: {
      title: 'Найди команду для стартапа!',
      subtitle: 'Вместе создавайте инновации и привлекайте инвестиции.',
      spheres: ['Tech', 'Social', 'E-commerce', 'Green tech'],
      teams: [
        {
          name: 'StartupHub',
          skills: 'Предпринимательское мышление, навык презентации',
          rating: '4.7/5',
        },
      ],
      cta: 'Заполни 4 шага и найди сооснователей.',
    },
  },
  {
    id: 'ecology',
    name: 'Экология',
    icon: asset('images/icons/ecology.png'),
    info: {
      title: 'Найди команду для защиты планеты!',
      subtitle: 'Участвуй в акциях, субботниках и эко-проектах.',
      spheres: ['Раздельный сбор', 'Озеленение', 'Эко-образование', 'Животные'],
      teams: [
        {
          name: 'Зелёный патруль',
          skills: 'Ответственность, активная позиция',
          rating: '4.8/5',
        },
      ],
      cta: 'Заполни 4 шага и найди тиммейтов.',
    },
  },
  {
    id: 'volunteer',
    name: 'Волонтёрство',
    icon: asset('images/icons/volunteer.png'),
    info: {
      title: 'Найди команду для добрых дел!',
      subtitle: 'Помогай людям, животным и природе вместе.',
      spheres: ['Помощь детям', 'Помощь пожилым', 'Приюты для животных', 'Экологические акции'],
      teams: [
        {
          name: 'Доброе сердце',
          skills: 'Эмпатия, свободное время',
          rating: '5/5',
        },
      ],
      cta: 'Заполни 4 шага и найди тиммейтов.',
    },
  },
  {
    id: 'languages',
    name: 'Языки',
    icon: asset('images/icons/languages.png'),
    info: {
      title: 'Найди команду для языкового обмена!',
      subtitle: 'Практикуй иностранные языки с носителями и энтузиастами.',
      spheres: ['Английский', 'Китайский', 'Испанский', 'Французский'],
      teams: [
        {
          name: 'Polyglot Club',
          skills: 'Базовые знания языка, желание общаться',
          rating: '4.4/5',
        },
      ],
      cta: 'Заполни 4 шага и найди речевых партнёров.',
    },
  },
  {
    id: 'board',
    name: 'Настольные игры',
    icon: asset('images/icons/board.png'),
    info: {
      title: 'Найди команду для настольных игр!',
      subtitle: 'Собирайся на игротеки, турниры и просто вечеринки.',
      spheres: ['Стратегии', 'Карточные игры', 'Кооперативные игры', 'Варгеймы'],
      teams: [
        {
          name: 'Игровой стол',
          skills: 'Логика, командный дух',
          rating: '4.9/5',
        },
      ],
      cta: 'Заполни 4 шага и найди тиммейтов.',
    },
  },
  {
    id: 'hiking',
    name: 'Походы',
    icon: asset('images/icons/hiking.png'),
    info: {
      title: 'Найди команду для походов и приключений!',
      subtitle: 'Горы, леса, реки — исследуй природу вместе.',
      spheres: ['Пешеходные маршруты', 'Велопоходы', 'Водные походы', 'Зимние походы'],
      teams: [
        {
          name: 'Тропа',
          skills: 'Физподготовка, любовь к природе',
          rating: '5/5',
        },
      ],
      cta: 'Заполни 4 шага и найди попутчиков.',
    },
  },
]

export const heroTags = [
  { label: 'Путешествия', icon: asset('images/icons/travel.png'), className: 'top-[4%] left-[2%]' },
  { label: 'Спорт', icon: asset('images/icons/sport.png'), className: 'top-[8%] right-[6%]' },
  { label: 'Дизайн', icon: asset('images/icons/art.png'), className: 'top-[42%] left-[-4%]' },
  { label: 'IT', icon: asset('images/icons/it.png'), className: 'top-[28%] right-[-2%]' },
  { label: 'Видеоигры', icon: asset('images/icons/games.png'), className: 'bottom-[8%] right-[10%]' },
]

export const featuredTeams: Team[] = [
  {
    id: 'minecraft',
    title: 'Minecraft Builders',
    image: asset('images/teams/team-minecraft.png'),
    members: 5,
    capacity: 8,
    avatars: [av[0], av[1], av[2]],
    tags: ['Minecraft', 'Строительство'],
    description: 'Строим большой город и крутые проекты вместе!',
    action: 'details',
    category: 'Видеоигры',
    city: 'Москва',
    difficulty: 'Легко',
  },
  {
    id: 'startup',
    title: 'Startup Team',
    image: asset('images/teams/team-startup.png'),
    members: 3,
    capacity: 5,
    avatars: [av[3], av[0], av[1]],
    tags: ['IT', 'Бизнес', 'Дизайн'],
    description: 'Ищем дизайнера и разработчика для нового стартапа.',
    action: 'join',
    category: 'Стартапы',
    city: 'Санкт-Петербург',
    difficulty: 'Сложно',
  },
  {
    id: 'hike',
    title: 'Поход на выходных',
    image: asset('images/teams/team-hike.png'),
    members: 4,
    capacity: 6,
    avatars: [av[2], av[3], av[0]],
    tags: ['Путешествия', 'Туризм'],
    description: 'Ищем еще двух человек для похода в горы!',
    action: 'watch',
    category: 'Путешествия',
    city: 'Казань',
    difficulty: 'Средне',
  },
  {
    id: 'dance',
    title: 'Танцевальная команда',
    image: asset('images/teams/team-dance.png'),
    members: 6,
    capacity: 10,
    avatars: [av[1], av[2], av[3]],
    tags: ['Танцы', 'Хореография'],
    description: 'Готовимся к выступлениям и фестивалям.',
    action: 'details',
    category: 'Танцы',
    city: 'Нижний Новгород',
    difficulty: 'Средне',
  },
]

export const recommendedTeams: Team[] = [
  {
    id: 'valorant',
    title: 'Valorant Team',
    image: asset('images/teams/rec-valorant.png'),
    members: 3,
    capacity: 5,
    avatars: [av[0], av[1], av[2]],
    tags: ['Киберспорт'],
    description: '',
    action: 'details',
    category: 'Киберспорт',
    city: 'Москва',
    difficulty: 'Средне',
  },
  {
    id: 'webdev',
    title: 'Web Development',
    image: asset('images/teams/rec-webdev.png'),
    members: 3,
    capacity: 6,
    avatars: [av[3], av[0], av[1]],
    tags: ['IT'],
    description: '',
    action: 'details',
    category: 'IT',
    city: 'Санкт-Петербург',
    difficulty: 'Сложно',
  },
  {
    id: 'creative',
    title: 'Creative Team',
    image: asset('images/teams/rec-design.png'),
    members: 2,
    capacity: 5,
    avatars: [av[2], av[3]],
    tags: ['Дизайн'],
    description: '',
    action: 'details',
    category: 'Дизайн',
    city: 'Екатеринбург',
    difficulty: 'Средне',
  },
  {
    id: 'football',
    title: 'Любительский футбол',
    image: asset('images/teams/rec-football.png'),
    members: 7,
    capacity: 12,
    avatars: [av[0], av[1], av[3]],
    tags: ['Спорт'],
    description: '',
    action: 'details',
    category: 'Спорт',
    city: 'Краснодар',
    difficulty: 'Легко',
  },
  {
    id: 'phototours',
    title: 'Фототуры',
    image: asset('images/teams/rec-photo.png'),
    members: 4,
    capacity: 8,
    avatars: [av[2], av[0], av[3]],
    tags: ['Путешествия'],
    description: '',
    action: 'details',
    category: 'Путешествия',
    city: 'Самара',
    difficulty: 'Легко',
  },
]

export const stats = [
  { label: 'активных пользователей', icon: 'users' },
  { label: 'команд создано', icon: 'teams' },
  { label: 'успешных объединений', icon: 'star' },
  { label: 'направлений', icon: 'globe' },
]

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
  creatorId?: string
  sphereId?: string
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
    info: {
      title: 'Найди свою команду для путешествий!',
      subtitle: 'Здесь ты можешь найти единомышленников для совместных приключений, исследований и незабываемых поездок.',
      spheres: ['Пешеходные маршруты', 'Автостопом', 'Велопутешествия', 'Экстремальные поездки', 'Походы в горы', 'Культурные экскурсии', 'Море и пляжи', 'Приключенческие туры'],
      teams: [],
      cta: 'За минуту найди найди людей, которые готовы отправиться с тобой в путешествие.',
    },
  },
  {
    id: 'games',
    name: 'Видеоигры',
    icon: asset('images/icons/games.png'),
    info: {
      title: 'Найди свою команду для видеоигр!',
      subtitle: 'Объединяйся с геймерами для совместных баталий, турниров и прохождения любимых игр.',
      spheres: ['Шутеры', 'Стратегии', 'RPG', 'MOBA', 'Симуляторы', 'Инди-игры'],
      teams: [],
      cta: 'За минуту найди найди тиммейтов для своих игровых сессий.',
    },
  },
  {
    id: 'sport',
    name: 'Спорт',
    icon: asset('images/icons/sport.png'),
    info: {
      title: 'Найди свою команду для спорта!',
      subtitle: 'Тренируйся, соревнуйся и достигай новых высот вместе с единомышленниками.',
      spheres: ['Футбол', 'Баскетбол', 'Волейбол', 'Бег', 'Йога', 'Фитнес', 'Плавание', 'Теннис'],
      teams: [],
      cta: 'За минуту найди собери команду для тренировок и соревнований.',
    },
  },
  {
    id: 'party',
    name: 'Дискотеки',
    icon: asset('images/icons/party.png'),
    info: {
      title: 'Найди компанию для дискотек и вечеринок!',
      subtitle: 'Открывай лучшие ночные клубы и события вместе с теми, кто любит танцевать.',
      spheres: ['Хаус', 'Техно', 'Поп-музыка', 'Ретро', 'Латина', 'Хип-хоп'],
      teams: [],
      cta: 'За минуту найди найди компанию для самых ярких ночей.',
    },
  },
  {
    id: 'food',
    name: 'Кафе и рестораны',
    icon: asset('images/icons/food.png'),
    info: {
      title: 'Найди компанию для гастрономических открытий!',
      subtitle: 'Пробуй новые места, делись впечатлениями и наслаждайся вкусной едой вместе.',
      spheres: ['Итальянская кухня', 'Азиатская кухня', 'Вегетарианство', 'Кофейни', 'Сладкое', 'Уличная еда'],
      teams: [],
      cta: 'За минуту найди собери компанию для гастрономических приключений.',
    },
  },
  {
    id: 'it',
    name: 'IT',
    icon: asset('images/icons/it.png'),
    info: {
      title: 'Найди команду для IT-проектов!',
      subtitle: 'Создавай стартапы, участвуй в хакатонах и обменивайся опытом с коллегами.',
      spheres: ['Веб-разработка', 'Мобильная разработка', 'Data Science', 'DevOps', 'Кибербезопасность', 'Искусственный интеллект'],
      teams: [],
      cta: 'За минуту найди найди единомышленников для технологических проектов.',
    },
  },
  {
    id: 'design',
    name: 'Дизайн',
    icon: asset('images/icons/design.png'),
    info: {
      title: 'Найди команду для творческих проектов!',
      subtitle: 'Вместе создавайте визуальные шедевры и вдохновляйте друг друга.',
      spheres: ['Графический дизайн', 'UX/UI', '3D-моделирование', 'Иллюстрация', 'Анимация', 'Брендинг'],
      teams: [],
      cta: 'За минуту найди собери команду для дизайнерских проектов.',
    },
  },
  {
    id: 'art',
    name: 'Искусство',
    icon: asset('images/icons/art.png'),
    info: {
      title: 'Найди команду для творческого самовыражения!',
      subtitle: 'Живопись, скульптура, инсталляции — твори и вдохновляйся вместе.',
      spheres: ['Живопись', 'Скульптура', 'Перформанс', 'Граффити', 'Фотография', 'Инсталляции'],
      teams: [],
      cta: 'За минуту найди найди единомышленников для художественных проектов.',
    },
  },
  {
    id: 'music',
    name: 'Музыка',
    icon: asset('images/icons/music.png'),
    info: {
      title: 'Найди музыкальную команду!',
      subtitle: 'Создавай группы, играй концерты и записывай треки вместе.',
      spheres: ['Рок', 'Поп', 'Электроника', 'Джаз', 'Классика', 'Хип-хоп'],
      teams: [],
      cta: 'За минуту найди собери музыкальный коллектив.',
    },
  },
  {
    id: 'cinema',
    name: 'Кино',
    icon: asset('images/icons/cinema.png'),
    info: {
      title: 'Найди команду для кино!',
      subtitle: 'Снимай короткометражки, обсуждай фильмы и организуй кинопоказы.',
      spheres: ['Короткометражки', 'Документалистика', 'Анимация', 'Киноклубы', 'Сценаристика', 'Монтаж'],
      teams: [],
      cta: 'За минуту найди найди команду для съёмок и обсуждений.',
    },
  },
  {
    id: 'photo',
    name: 'Фото',
    icon: asset('images/icons/photo.png'),
    info: {
      title: 'Найди команду для фото-проектов!',
      subtitle: 'Организуй фотосессии, учись новому и вдохновляйся.',
      spheres: ['Портрет', 'Пейзаж', 'Стрит-фотография', 'Предметная съёмка', 'Свадебная', 'Обработка'],
      teams: [],
      cta: 'За минуту найди собери команду для фото-экспедиций.',
    },
  },
  {
    id: 'dance',
    name: 'Танцы',
    icon: asset('images/icons/dance.png'),
    info: {
      title: 'Найди танцевальную команду!',
      subtitle: 'Танцуй, участвуй в баттлах и выступай на сцене.',
      spheres: ['Хип-хоп', 'Современные танцы', 'Бальные', 'Латина', 'Брейк-данс', 'Народные'],
      teams: [],
      cta: 'За минуту найди найди партнёров для танцев.',
    },
  },
  {
    id: 'education',
    name: 'Образование',
    icon: asset('images/icons/education.png'),
    info: {
      title: 'Найди команду для учёбы и саморазвития!',
      subtitle: 'Вместе учи языки, готовься к экзаменам и посещай курсы.',
      spheres: ['Иностранные языки', 'Программирование', 'Математика', 'Курсы личностного роста', 'Подготовка к ЕГЭ', 'Онлайн-курсы'],
      teams: [],
      cta: 'За минуту найди найди напарников для учёбы.',
    },
  },
  {
    id: 'books',
    name: 'Книги',
    icon: asset('images/icons/books.png'),
    info: {
      title: 'Найди книжный клуб!',
      subtitle: 'Обсуждай книги, делись рекомендациями и читай вместе.',
      spheres: ['Художественная литература', 'Нон-фикшн', 'Фантастика', 'Классика', 'Детективы', 'Поэзия'],
      teams: [],
      cta: 'За минуту найди собери книжный клуб по душе.',
    },
  },
  {
    id: 'science',
    name: 'Наука',
    icon: asset('images/icons/science.png'),
    info: {
      title: 'Найди команду для научных открытий!',
      subtitle: 'Проводи эксперименты, участвуй в конференциях и популяризируй науку.',
      spheres: ['Физика', 'Химия', 'Биология', 'Астрономия', 'Математика', 'Экология'],
      teams: [],
      cta: 'За минуту найди найди единомышленников для научных проектов.',
    },
  },
  {
    id: 'startups',
    name: 'Стартапы',
    icon: asset('images/icons/startups.png'),
    info: {
      title: 'Найди команду для стартапа!',
      subtitle: 'Вместе создавайте инновации и привлекайте инвестиции.',
      spheres: ['Tech', 'Social', 'E-commerce', 'Green tech', 'Fintech', 'Edtech'],
      teams: [],
      cta: 'За минуту найди собери команду для запуска стартапа.',
    },
  },
  {
    id: 'ecology',
    name: 'Экология',
    icon: asset('images/icons/ecology.png'),
    info: {
      title: 'Найди команду для защиты планеты!',
      subtitle: 'Участвуй в акциях, субботниках и эко-проектах.',
      spheres: ['Раздельный сбор', 'Озеленение', 'Эко-образование', 'Животные', 'Ноль отходов', 'Климат'],
      teams: [],
      cta: 'За минуту найди найди активистов для эко-проектов.',
    },
  },
  {
    id: 'volunteer',
    name: 'Волонтёрство',
    icon: asset('images/icons/volunteer.png'),
    info: {
      title: 'Найди команду для добрых дел!',
      subtitle: 'Помогай людям, животным и природе вместе.',
      spheres: ['Помощь детям', 'Помощь пожилым', 'Приюты для животных', 'Экологические акции', 'Событийное волонтёрство', 'Помощь в кризисных ситуациях'],
      teams: [],
      cta: 'За минуту найди найди единомышленников для волонтёрских проектов.',
    },
  },
  {
    id: 'languages',
    name: 'Языки',
    icon: asset('images/icons/languages.png'),
    info: {
      title: 'Найди команду для языкового обмена!',
      subtitle: 'Практикуй иностранные языки с носителями и энтузиастами.',
      spheres: ['Английский', 'Китайский', 'Испанский', 'Французский', 'Немецкий', 'Японский'],
      teams: [],
      cta: 'За минуту найди найди партнёров для языковой практики.',
    },
  },
  {
    id: 'board',
    name: 'Настольные игры',
    icon: asset('images/icons/board.png'),
    info: {
      title: 'Найди команду для настольных игр!',
      subtitle: 'Собирайся на игротеки, турниры и просто вечеринки.',
      spheres: ['Стратегии', 'Карточные игры', 'Кооперативные игры', 'Варгеймы', 'Ролевые игры', 'Детективные игры'],
      teams: [],
      cta: 'За минуту найди найди партнёров для настольных баталий.',
    },
  },
  {
    id: 'hiking',
    name: 'Походы',
    icon: asset('images/icons/hiking.png'),
    info: {
      title: 'Найди команду для походов и приключений!',
      subtitle: 'Горы, леса, реки — исследуй природу вместе.',
      spheres: ['Пешеходные маршруты', 'Велопоходы', 'Водные походы', 'Зимние походы', 'Скалолазание', 'Кемпинг'],
      teams: [],
      cta: 'За минуту найди найди попутчиков для новых троп.',
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

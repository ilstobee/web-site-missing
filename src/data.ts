export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export type Category = {
  id: string
  name: string
  icon: string
  tint?: string
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
}

const av = [
  asset('images/avatars/avatar-1.png'),
  asset('images/avatars/avatar-2.png'),
  asset('images/avatars/avatar-3.png'),
  asset('images/avatars/avatar-4.png'),
]

export const socialAvatars = av

export const categories: Category[] = [
  { id: 'travel', name: 'Путешествия', icon: asset('images/icons/travel.png'), tint: 'bg-[#e7f3ff]' },
  { id: 'games', name: 'Видеоигры', icon: asset('images/icons/games.png') },
  { id: 'sport', name: 'Спорт', icon: asset('images/icons/sport.png') },
  { id: 'party', name: 'Дискотеки', icon: asset('images/icons/party.png') },
  { id: 'food', name: 'Кафе и рестораны', icon: asset('images/icons/food.png') },
  { id: 'it', name: 'IT', icon: asset('images/icons/it.png') },
  { id: 'design', name: 'Дизайн', icon: asset('images/icons/design.png') },
  { id: 'art', name: 'Искусство', icon: asset('images/icons/art.png') },
  { id: 'music', name: 'Музыка', icon: asset('images/icons/music.png') },
  { id: 'cinema', name: 'Кино', icon: asset('images/icons/cinema.png') },
  { id: 'photo', name: 'Фото', icon: asset('images/icons/photo.png') },
  { id: 'dance', name: 'Танцы', icon: asset('images/icons/dance.png') },
  { id: 'education', name: 'Образование', icon: asset('images/icons/education.png') },
  { id: 'books', name: 'Книги', icon: asset('images/icons/books.png') },
  { id: 'science', name: 'Наука', icon: asset('images/icons/science.png') },
  { id: 'startups', name: 'Стартапы', icon: asset('images/icons/startups.png') },
  { id: 'ecology', name: 'Экология', icon: asset('images/icons/ecology.png') },
  { id: 'volunteer', name: 'Волонтёрство', icon: asset('images/icons/volunteer.png') },
  { id: 'politics', name: 'Политика', icon: asset('images/icons/politics.png') },
  { id: 'religion', name: 'Религия', icon: asset('images/icons/religion.png') },
  { id: 'languages', name: 'Языки', icon: asset('images/icons/languages.png') },
  { id: 'board', name: 'Настольные игры', icon: asset('images/icons/board.png') },
  { id: 'hiking', name: 'Походы', icon: asset('images/icons/hiking.png') },
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
  },
]

export const createSteps = [
  {
    n: 1,
    title: 'Выбери сферу',
    text: 'Укажи, чем вы хотите заниматься',
    icon: 'target',
  },
  {
    n: 2,
    title: 'Опиши идею',
    text: 'Расскажи о целях и планах',
    icon: 'idea',
  },
  {
    n: 3,
    title: 'Определи роли',
    text: 'Укажи, кого ты ищешь в команду',
    icon: 'roles',
  },
  {
    n: 4,
    title: 'Опубликуй',
    text: 'Найди своих людей!',
    icon: 'send',
  },
]

export const stats = [
  { value: '10 000+', label: 'активных пользователей', icon: 'users' },
  { value: '2 500+', label: 'команд создано', icon: 'teams' },
  { value: '50 000+', label: 'успешных объединений', icon: 'star' },
  { value: '100+', label: 'направлений', icon: 'globe' },
]

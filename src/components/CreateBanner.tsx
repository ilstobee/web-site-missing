import { useRef, useState } from 'react'
import { useApp } from '../store'
import type { Difficulty } from '../store'
import { firebaseEnabled, uploadCover } from '../firebase'

type Props = {
  onOpenAuth(): void
}

export function CreateBanner({ onOpenAuth }: Props) {
  const { user, allCategories, addTeam } = useApp()

  const [sphereId, setSphereId] = useState(allCategories[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState(user?.city ?? '')
  const [difficulty, setDifficulty] = useState<Difficulty>('Легко')
  const [capacity, setCapacity] = useState(5)
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const selected = allCategories.find((category) => category.id === sphereId)

  const inputClass =
    'w-full rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand'

  const pickImage = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadCover(file, title.trim() || 'team')
      setImage(url)
    } catch {
      setImage('')
    } finally {
      setUploading(false)
    }
  }

  const submit = () => {
    if (!user) {
      onOpenAuth()
      return
    }
    if (!title.trim() || !selected || capacity < 2) return
    addTeam({
      title: title.trim(),
      category: selected.name,
      sphereId: selected.id,
      description: description.trim(),
      city: city.trim() || 'Москва',
      difficulty,
      capacity,
      tags: [selected.name],
      image: image || undefined,
    })
    setTitle('')
    setDescription('')
    setImage('')
    setDone(true)
    window.setTimeout(() => setDone(false), 4000)
  }

  return (
    <section id="create" className="py-4">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="rounded-[28px] bg-blush px-6 py-8 shadow-[0_8px_24px_rgba(80,40,40,0.04)] sm:px-8 lg:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-[1.55rem] font-extrabold leading-tight text-ink">
                Не нашёл подходящую команду?
              </h2>
              <p className="mt-1 text-[1.7rem] font-extrabold leading-tight text-brand">
                Создай свою!
              </p>
              <p className="mt-2 text-sm text-muted">
                Укажи сферу, город и сложность — после одобрения твоя команда появится в ленте, и на
                неё смогут подавать заявки. Для создания нужно войти в аккаунт.
              </p>
              {done ? (
                <p className="mt-4 inline-block rounded-full bg-brand px-4 py-2 text-[13px] font-semibold text-white">
                  {firebaseEnabled
                    ? '✓ Команда отправлена на модерацию!'
                    : '✓ Команда создана и добавлена в ленту!'}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={sphereId}
                  onChange={(event) => setSphereId(event.target.value)}
                  className={inputClass}
                >
                  {allCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value as Difficulty)}
                  className={inputClass}
                >
                  <option value="Легко">Сложность: Легко</option>
                  <option value="Средне">Сложность: Средне</option>
                  <option value="Сложно">Сложность: Сложно</option>
                </select>
              </div>
              <input
                className={inputClass}
                placeholder="Название команды *"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <textarea
                className={inputClass}
                rows={3}
                placeholder="Опиши идею: кого ищешь, какие цели (цензура включена)"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className={inputClass}
                  placeholder="Город"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                />
                <label className="flex items-center gap-2 text-[13px] font-medium text-ink">
                  Нужно человек:
                  <input
                    type="number"
                    min={2}
                    value={capacity}
                    onChange={(event) => setCapacity(Number(event.target.value))}
                    className={inputClass}
                  />
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => void pickImage(event.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-[13px] font-semibold text-ink transition hover:border-brand"
                >
                  {uploading ? 'Загружаю обложку…' : image ? 'Заменить обложку' : 'Добавить обложку'}
                </button>
                {image ? (
                  <img
                    src={image}
                    alt="Обложка"
                    className="h-10 w-16 rounded-lg object-cover"
                  />
                ) : null}
              </div>
              {firebaseEnabled ? (
                <p className="text-[12px] text-muted">
                  Команда появится в ленте после одобрения администратором.
                </p>
              ) : null}
              <button
                type="button"
                onClick={submit}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Создать команду →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
import {
    Chapter,
    Tag,
    SourceManga,
    TagSection,
    HomeSection,
    PartialSourceManga,
} from '@paperback/types'

import { MangaDetails, ChaptersDetails, HomePageDetails } from './OlympusScanInterfaces'

export const parseMangaDetails = (data: MangaDetails, mangaId: string): SourceManga => {
    const titles: string[] = [data.name ?? '']
    const author = data.team.name ?? ''
    const description = data.summary ?? 'No description available'
    const arrayTags: Tag[] = []
    for (const tag of data?.genres) {
        arrayTags.push({ id: tag.id.toString() ?? '', label: tag.name ?? '' })
    }

    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]
    let status = 'ONGOING'
    switch (data?.status?.name.toUpperCase()) {
        case 'ACTIVO':
            status = 'Ongoing'
            break
        case 'FINALIZADO':
            status = 'Completed'
            break
        case 'ABANDONADO POR EL SCAN':
            status = 'Abandoned'
            break
        case 'PAUSADO POR EL AUTOR (HIATUS)':
            status = 'Hiatus'
            break
        default:
            status = 'Ongoing'
            break
    }
    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: titles,
            image: data.cover.replace(/ /g, "%20"),
            status: status,
            author: author ?? '',
            tags: tagSections,
            desc: description
        })
    })
}

export const parseChapters = (data: ChaptersDetails[], mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []
    for (const chapter of data) {
        const number = Number(chapter.name)
        const title = `Chapter ${number}`
        const date = new Date(chapter.published_at)
        chapters.push(App.createChapter({
            id: String(chapter.id),
            name: title,
            langCode: '🇪🇸',
            chapNum: number,
            time: date
        }))
    }
    if (chapters.length == 0) {
        throw new Error(`Couldn't find any chapters for mangaId: ${mangaId}!`)
    }
    return chapters
}

export const parseHomeSections = (sections: any, sectionCallback: (section: HomeSection) => void): void => {
    const collectedIds: string[] = []

    for (const section of sections) {
        const mangaItemsArray: PartialSourceManga[] = []

        for (const manga of section.data) {
            const title = manga.name ?? ''
            const id = manga.slug ?? ''
            const image = manga.cover.replace(/ /g, "%20") ?? ''

            if (!id || !title || collectedIds.includes(manga.id.toString())) continue
            mangaItemsArray.push(App.createPartialSourceManga({
                image: image,
                title: title,
                mangaId: id,
            }))

            collectedIds.push(manga.id.toString())
        }
        section.section.items = mangaItemsArray
        sectionCallback(section.section)
    }
}

export const parseViewMore = (homepageSectionId: string, data: any): PartialSourceManga[] => {
    const collectedIds: string[] = []
    let mangaData
    switch (homepageSectionId) {
        case 'new_chapters':
            mangaData = data
            break
        default:
            throw new Error(`Invalid homepage section ID: ${homepageSectionId}`)
    }

    const moreManga: PartialSourceManga[] = []
    for (const manga of mangaData) {
        const title = manga.name ?? ''
        const id = manga.slug ?? ''
        const image = manga.cover.replace(/ /g, "%20") ?? ''

        if (!id || !title || collectedIds.includes(manga.id.toString())) continue
        moreManga.push(App.createPartialSourceManga({
            image: image,
            title: title,
            mangaId: id,
        }))
        collectedIds.push(manga.id.toString())
    }
    return moreManga
}



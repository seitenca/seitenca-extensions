/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Tag,
    SourceManga,
    TagSection,
    HomeSection,
    PartialSourceManga
} from '@paperback/types'

import entities = require('entities')

export function decodeHTMLEntity(str: string) {
    return entities.decodeHTML(str)
}

export const parseMangaDetails = (data: any, mangaId: string): SourceManga => {
    const titles: string[] = [data.name ?? '']
    let author
    try {
        author = data.team.name ?? ''
    } catch (e) {
        author = ''
    }
    const description = data.summary ?? 'No description available'
    const arrayTags: Tag[] = []
    for (const tag of data.genres) {
        arrayTags.push({ id: tag.id.toString() ?? '', label: tag.name ?? '' })
    }

    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]
    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: titles,
            image: encodeURI(decodeURI(decodeHTMLEntity(data.cover?.trim() ?? ''))),
            status: data?.status?.name,
            author: author ?? '',
            tags: tagSections,
            desc: description
        })
    })
}


export const parseHomeSections = (sections: any, sectionCallback: (section: HomeSection) => void): void => {
    const collectedIds: string[] = []

    for (const section of sections) {
        const mangaItemsArray: PartialSourceManga[] = []

        for (const manga of section.data) {
            const title = manga.name ?? ''
            const id = manga.slug ?? ''
            const image = encodeURI(decodeURI(decodeHTMLEntity(manga.cover?.trim() ?? '')))
            let subtitle
            try {
                subtitle = `Capitulo ${manga.last_chapters[0].name}`
            } catch (e) {
                subtitle = ''
            }

            if (!id || !title || collectedIds.includes(manga.id.toString())) continue
            mangaItemsArray.push(App.createPartialSourceManga({
                image: image,
                title: title,
                subtitle: subtitle,
                mangaId: id
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
        const image = encodeURI(decodeURI(decodeHTMLEntity(manga.cover?.trim() ?? '')))
        const subtitle = `Capitulo ${manga.last_chapters[0].name}`

        if (!id || !title || collectedIds.includes(manga.id.toString())) continue
        moreManga.push(App.createPartialSourceManga({
            image: image,
            title: title,
            mangaId: id,
            subtitle: subtitle
        }))
        collectedIds.push(manga.id.toString())
    }
    return moreManga
}



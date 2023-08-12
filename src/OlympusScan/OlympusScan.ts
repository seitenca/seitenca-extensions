/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    SourceManga,
    Chapter,
    ChapterDetails,
    SearchRequest,
    PagedResults,
    SourceInfo,
    ContentRating,
    BadgeColor,
    Request,
    Response,
    SourceIntents,
    ChapterProviding,
    MangaProviding,
    SearchResultsProviding,
    Tag,
    HomePageSectionsProviding,
    PartialSourceManga,
    HomeSection,
    HomeSectionType,
    TagSection
} from '@paperback/types'

import {
    parseChapters,
    parseHomeSections,
    parseMangaDetails,
    parseViewMore
} from './OlympusScanParser'

const OS_DOMAIN = 'https://olympusv2.gg'
const OS_API_DOMAIN = 'https://dashboard.olympusv2.gg/api'

export const OlympusScanInfo: SourceInfo = {
    version: '0.0.18',
    name: 'OlympusScan',
    icon: 'icon.png',
    author: 'Seitenca',
    authorWebsite: 'https://github.com/seitenca',
    description: `Extension that pulls manga from ${OS_DOMAIN}`,
    contentRating: ContentRating.ADULT,
    websiteBaseURL: `${OS_DOMAIN}/`,
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS,
    language: 'SPANISH',
    sourceTags: [
        {
            text: 'Spanish',
            type: BadgeColor.GREY
        }
    ]
}

export class OlympusScan implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding {
    requestManager = App.createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': `${OS_API_DOMAIN}/`,
                        'user-agent': await this.requestManager.getDefaultUserAgent()
                    }
                }
                return request
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })

    getMangaShareUrl(mangaId: string): string {
        return `${OS_API_DOMAIN}/series/${mangaId}`
    }

    async getData(url: string): Promise<any> {
        const response = await this.requestManager.schedule(App.createRequest({
            url: url,
            method: 'GET'
        }), 1)
        try {
            return JSON.parse(response.data as string)
        } catch (e) {
            throw new Error(`${e}`)
        }
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const data = await this.getData(`${OS_API_DOMAIN}/series/${mangaId}`)
        return parseMangaDetails(data.data, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const data = await this.getData(`${OS_API_DOMAIN}/series/${mangaId}/chapters`)
        return parseChapters(data.data, mangaId)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const data = await this.getData(`${OS_API_DOMAIN}/series/${mangaId}/chapters/${chapterId}`)
        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: data.chapter.pages
        })
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        const manga: PartialSourceManga[] = []

        if (query.title) {
            const data = await this.getData(`${OS_API_DOMAIN}/search?name=${encodeURI(query.title)}&page=${page}`)
            data.data.forEach((element: any) => {
                manga.push(App.createPartialSourceManga({
                    mangaId: element.slug,
                    image: element.cover.replace(/ /g, '%20'),
                    title: element.name
                }))
            })
        } else {
            const data = await this.getData(`${OS_API_DOMAIN}/series?page=${page}&genres=${query?.includedTags?.map((x: Tag) => x.id)[0]}`)
            data.data.series.data.forEach((element: any) => {
                manga.push(App.createPartialSourceManga({
                    mangaId: element.slug,
                    image: element.cover.replace(/ /g, '%20'),
                    title: element.name
                }))
            })
        }

        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const new_chapters_data = await this.getData(`${OS_API_DOMAIN}/sf/new-chapters?page=1`)
        const sections = [
            {
                data: new_chapters_data.data,
                section: App.createHomeSection({
                    id: 'new_chapters',
                    title: 'Capítulos Recientes',
                    containsMoreItems: true,
                    type: HomeSectionType.singleRowNormal
                })
            }
        ]
        parseHomeSections(sections, sectionCallback)
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const offset: number = metadata?.offset ?? 0
        const data = await this.getData(`${OS_API_DOMAIN}/sf/new-chapters?page=${offset}`)
        const manga = parseViewMore(homepageSectionId, data.data)
        metadata = { offset: offset + 30 }
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    async getSearchTags(): Promise<TagSection[]> {
        const data = await this.getData(`${OS_API_DOMAIN}/genres-statuses`)
        const arrayTags: Tag[] = []
        for (const genre of data.genres) {
            arrayTags.push({ id: genre.id.toString(), label: genre.name })
        }
        return [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]
    }
}







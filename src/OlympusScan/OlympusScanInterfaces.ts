export interface MangaDetails {
    id: number;
    name: string;
    summary: string;
    slug: string;
    status: {
        id: number;
        name: string;
    };
    note: string | null;
    disqus_key: string | null;
    disqus_page_url: string | null;
    view_count: number;
    bookmark_count: number;
    like_count: number;
    bookmarked: boolean;
    liked: boolean;
    rating: number;
    genres: {
        name: string;
        id: number;
    }[];
    created_at: string;
    cover: string;
    team: {
        id: number;
        name: string;
        cover: string;
    };
    type: string;
    first_chapter: {
        id: number;
        name: string;
    };
    gallery: string | null;
    chapter_count: number;
}

export interface ChaptersDetails {
    name: string;
    id: number;
    published_at: string;
    team: string | null;
    read_by_auth: boolean;
}
export interface HomePageDetails {
    slider: Series[];
    popular_comics: string;
    novels: Novel[];
    new_chapters: Comic[];
}

interface Series {
    title: string | null;
    description: string | null;
    banner: string;
    banner_srcset: string;
    banner_mini_srcset: string;
    url: string;
}

interface NovelStatus {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

interface Novel {
    id: number;
    name: string;
    slug: string;
    status: NovelStatus;
    cover: string;
    cover_srcset: string;
    type: string;
}

interface LastChapter {
    id: number;
    name: string;
    published_at: string;
}

interface Comic {
    name: string;
    slug: string;
    id: number;
    cover: string;
    cover_srcset: string;
    last_chapters: LastChapter[];
    status: null; // This could be another interface representing comic status
    type: string;
}


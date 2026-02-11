import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  id: string;
  title: string;
  type: 'book' | 'video' | 'image' | 'pdf' | 'dataset';
  source: string;
  url: string;
  preview?: string;
  description?: string;
  author?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'all';

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const results: SearchResult[] = [];

  // Search OpenLibrary (books)
  if (type === 'all' || type === 'book') {
    try {
      const openLibraryResults = await searchOpenLibrary(query);
      results.push(...openLibraryResults);
    } catch (error) {
      console.error('OpenLibrary search error:', error);
    }
  }

  // Search Project Gutenberg (public domain books)
  if (type === 'all' || type === 'book' || type === 'pdf') {
    try {
      const gutenbergResults = await searchProjectGutenberg(query);
      results.push(...gutenbergResults);
    } catch (error) {
      console.error('Project Gutenberg search error:', error);
    }
  }

  // Search Pixabay (images)
  if (type === 'all' || type === 'image') {
    try {
      const pixabayResults = await searchPixabay(query);
      results.push(...pixabayResults);
    } catch (error) {
      console.error('Pixabay search error:', error);
    }
  }

  // Search Unsplash (images)
  if (type === 'all' || type === 'image') {
    try {
      const unsplashResults = await searchUnsplash(query);
      results.push(...unsplashResults);
    } catch (error) {
      console.error('Unsplash search error:', error);
    }
  }

  // Search Internet Archive (various formats)
  if (type === 'all' || type === 'book' || type === 'video' || type === 'pdf' || type === 'dataset') {
    try {
      const archiveResults = await searchInternetArchive(query, type);
      results.push(...archiveResults);
    } catch (error) {
      console.error('Internet Archive search error:', error);
    }
  }

  return NextResponse.json({ results });
}

async function searchOpenLibrary(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10&fields=title,author_name,cover_i,key,first_publish_year,format`
    );
    const data = await response.json();

    if (data.docs) {
      for (const doc of data.docs.slice(0, 8)) {
        const id = doc.key.replace('/works/', '');
        const hasPDF = doc.format && Array.isArray(doc.format) && doc.format.includes('pdf');

        results.push({
          id: `ol-${id}`,
          title: doc.title || 'Untitled',
          type: hasPDF ? 'pdf' : 'book',
          source: 'OpenLibrary',
          url: `https://openlibrary.org${doc.key}`,
          preview: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined,
          description: `First published: ${doc.first_publish_year || 'Unknown'}`,
          author: doc.author_name ? doc.author_name[0] : undefined,
        });
      }
    }
  } catch (error) {
    console.error('OpenLibrary API error:', error);
  }

  return results;
}

async function searchProjectGutenberg(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  try {
    // Project Gutenberg API via Gutendex
    const response = await fetch(
      `https://gutendex.com/books?search=${encodeURIComponent(query)}&limit=5`
    );
    const data = await response.json();

    if (data.results) {
      for (const book of data.results) {
        const coverUrl = book.formats['image/jpeg'] || book.formats['image/png'];

        results.push({
          id: `pg-${book.id}`,
          title: book.title || 'Untitled',
          type: 'pdf',
          source: 'Project Gutenberg',
          url: `https://www.gutenberg.org/ebooks/${book.id}`,
          preview: coverUrl,
          description: `Public domain book with ${book.download_count} downloads`,
          author: book.authors[0]?.name,
        });
      }
    }
  } catch (error) {
    console.error('Project Gutenberg API error:', error);
  }

  return results;
}

async function searchPixabay(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const apiKey = process.env.PIXABAY_API_KEY;

  if (!apiKey) {
    console.warn('Pixabay API key not set, skipping Pixabay search');
    return results;
  }

  try {
    const response = await fetch(
      `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=5&safesearch=true`
    );
    const data = await response.json();

    if (data.hits) {
      for (const hit of data.hits) {
        results.push({
          id: `pix-${hit.id}`,
          title: hit.tags || 'Image',
          type: 'image',
          source: 'Pixabay',
          url: hit.pageURL,
          preview: hit.webformatURL,
          description: `High quality image - ${hit.likes} likes`,
        });
      }
    }
  } catch (error) {
    console.error('Pixabay API error:', error);
  }

  return results;
}

async function searchUnsplash(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const apiKey = process.env.UNSPLASH_API_KEY;

  if (!apiKey) {
    console.warn('Unsplash API key not set, skipping Unsplash search');
    return results;
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5`,
      {
        headers: {
          'Authorization': `Client-ID ${apiKey}`,
        },
      }
    );
    const data = await response.json();

    if (data.results) {
      for (const photo of data.results) {
        results.push({
          id: `uns-${photo.id}`,
          title: photo.alt_description || photo.description || 'Unsplash Photo',
          type: 'image',
          source: 'Unsplash',
          url: photo.links.html,
          preview: photo.urls.regular,
          description: `By ${photo.user.name} - ${photo.likes} likes`,
        });
      }
    }
  } catch (error) {
    console.error('Unsplash API error:', error);
  }

  return results;
}

async function searchInternetArchive(
  query: string,
  type: string
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  try {
    // Build query with mediatype filter
    let mediaTypeFilter = '';
    if (type === 'video') mediaTypeFilter = ' AND mediatype:(movies)';
    else if (type === 'pdf' || type === 'book') mediaTypeFilter = ' AND mediatype:(texts)';
    else if (type === 'dataset') mediaTypeFilter = ' AND mediatype:(data)';

    const response = await fetch(
      `https://archive.org/advancedsearch.php?q=${encodeURIComponent(
        query + mediaTypeFilter
      )}&fl[]=identifier,format,title,creator,year&rows=5&output=json`
    );
    const data = await response.json();

    if (data.response && data.response.docs) {
      for (const doc of data.response.docs) {
        const identifier = doc.identifier;
        const hasVideo = doc.format && Array.isArray(doc.format) && doc.format.includes('MPEG4');
        const hasPDF = doc.format && Array.isArray(doc.format) && doc.format.includes('PDF');

        let resultType: 'book' | 'video' | 'image' | 'pdf' | 'dataset' = 'book';
        if (hasVideo) resultType = 'video';
        else if (hasPDF) resultType = 'pdf';
        else if (type === 'dataset') resultType = 'dataset';

        results.push({
          id: `ia-${identifier}`,
          title: doc.title || identifier,
          type: resultType,
          source: 'Internet Archive',
          url: `https://archive.org/details/${identifier}`,
          preview: `https://archive.org/services/img/${identifier}`,
          description: `Year: ${doc.year || 'Unknown'}`,
          author: doc.creator ? (Array.isArray(doc.creator) ? doc.creator[0] : doc.creator) : undefined,
        });
      }
    }
  } catch (error) {
    console.error('Internet Archive API error:', error);
  }

  return results;
}

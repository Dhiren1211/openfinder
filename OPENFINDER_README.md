# OpenFinder - Legal Content Search Platform

A comprehensive web application that searches the internet for LEGAL downloadable content only, providing direct links from authorized sources.

## 🌟 Features

### Core Features
- **Multi-source Search**: Search across multiple legal content platforms simultaneously
- **Content Type Filtering**: Filter by Books, Videos, Images, PDFs, and Datasets
- **Favorites System**: Save and manage your favorite results
- **User File Upload**: Upload your own legally distributable files
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Legal Content Sources
- ✅ **OpenLibrary** - Free and open library
- ✅ **Project Gutenberg** - Public domain books
- ✅ **Internet Archive** - Licensed collections
- ✅ **Pixabay** - Free stock images
- ✅ **Unsplash** - High-quality photography

### Content Types
- 📚 **Books** - PDFs and EPUBs from public domain and open sources
- 📹 **Videos** - Licensed educational and public domain content
- 🖼️ **Images** - Creative Commons and royalty-free images
- 📄 **PDFs** - Educational documents and research papers
- 💾 **Datasets** - Open data and research datasets

## 📁 Project Structure

```
openfinder/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── search/
│   │   │   │   └── route.ts          # Main search API endpoint
│   │   │   └── upload/
│   │   │       └── route.ts          # File upload API endpoint
│   │   ├── layout.tsx                # Root layout with theme provider
│   │   ├── page.tsx                  # Main OpenFinder page
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── theme-provider.tsx        # Next.js theme provider
│   │   └── ui/                       # shadcn/ui components
│   ├── hooks/
│   │   └── use-toast.ts              # Toast notifications hook
│   └── lib/
│       └── db/                       # Database configuration (Prisma)
├── public/
│   └── uploads/                      # User uploaded files
├── prisma/
│   └── schema.prisma                 # Database schema
└── package.json
```

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Theme**: next-themes

### Backend
- **API Routes**: Next.js API routes
- **File Upload**: Native Node.js fs module
- **API Integrations**: REST API calls to legal content providers

### Development Tools
- **Package Manager**: Bun
- **Linting**: ESLint
- **Database**: Prisma ORM with SQLite

## 🔌 API Integrations

### 1. OpenLibrary API
Searches for books with PDF availability.

```typescript
// API Endpoint
https://openlibrary.org/search.json

// Parameters
- q: search query
- limit: number of results
- fields: title, author_name, cover_i, key, first_publish_year, format
```

### 2. Project Gutenberg (via Gutendex)
Public domain books with download counts.

```typescript
// API Endpoint
https://gutendex.com/books

// Parameters
- search: search query
- limit: number of results
```

### 3. Pixabay API
Free stock images (requires API key).

```typescript
// API Endpoint
https://pixabay.com/api/

// Parameters
- key: API key
- q: search query
- image_type: photo
- per_page: number of results
- safesearch: true
```

### 4. Unsplash API
High-quality royalty-free images (requires API key).

```typescript
// API Endpoint
https://api.unsplash.com/search/photos

// Parameters
- query: search query
- per_page: number of results

// Headers
- Authorization: Client-ID {API_KEY}
```

### 5. Internet Archive API
Various content types including books, videos, and datasets.

```typescript
// API Endpoint
https://archive.org/advancedsearch.php

// Parameters
- q: search query (with mediatype filters)
- fl: fields (identifier, format, title, creator, year)
- rows: number of results
- output: json
```

## 📡 API Endpoints

### `/api/search`
Search across all legal content providers.

**Method**: GET

**Query Parameters**:
- `q` (required): Search query string
- `type` (optional): Content type filter (all, book, video, image, pdf, dataset)

**Example Request**:
```
GET /api/search?q=shakespeare&type=book
```

**Response**:
```json
{
  "results": [
    {
      "id": "ol-OL15178839W",
      "title": "The Complete Works of William Shakespeare",
      "type": "book",
      "source": "OpenLibrary",
      "url": "https://openlibrary.org/works/OL15178839W",
      "preview": "https://covers.openlibrary.org/b/id/123456-M.jpg",
      "description": "First published: 1590",
      "author": "William Shakespeare"
    }
  ]
}
```

### `/api/upload`
Upload user files.

**Method**: POST

**Form Data**:
- `file` (required): File to upload

**Supported Types**:
- PDF: `application/pdf`
- EPUB: `application/epub+zip`
- Images: `image/jpeg`, `image/png`
- Video: `video/mp4`
- Archive: `application/zip`
- Text: `text/plain`

**Example Request**:
```bash
curl -X POST /api/upload \
  -F "file=@document.pdf"
```

**Response**:
```json
{
  "success": true,
  "file": {
    "id": "550e8400-e29b-41d4-a716-446655440000.pdf",
    "originalName": "document.pdf",
    "size": 1024000,
    "type": "application/pdf",
    "url": "/uploads/550e8400-e29b-41d4-a716-446655440000.pdf",
    "uploadedAt": "2025-02-11T18:30:00.000Z"
  }
}
```

**Method**: GET (List files)

**Response**:
```json
{
  "files": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000.pdf",
      "url": "/uploads/550e8400-e29b-41d4-a716-446655440000.pdf"
    }
  ]
}
```

## 🔐 Security & Ethics

### Content Policy
- ❌ **No Pirated Content**: Never hosts or distributes copyrighted pirated material
- ✅ **Legal Sources Only**: Only indexes from public-domain, Creative Commons, or officially provided APIs
- ✅ **Source Transparency**: Clearly displays the source of every file
- ✅ **Direct Links**: Redirects users to the original provider for downloads

### Privacy Protection
- ❌ **No Paywall Bypass**: Does not bypass any paywalls
- ❌ **No Private Drives**: Does not generate links to private drives
- ✅ **API Terms Compliance**: Respects robots.txt and API terms of service

### File Upload Guidelines
- Users must own the rights to distribute uploaded files
- Content must be legally distributable
- Maximum file size: 100MB
- Supported formats: PDF, EPUB, MP4, JPEG, PNG, ZIP, TXT

## 🎨 UI/UX Features

### Design Standards
- Modern, clean interface with shadcn/ui components
- Responsive design for all screen sizes
- Accessible (WCAG compliant)
- Dark/Light mode support

### Interactive Elements
- Real-time search with loading states
- Drag-and-drop file upload
- Card-based result display with previews
- One-click favorites management
- Type-specific color badges and icons

### Card Information
Each result card displays:
- Title (with truncation for long titles)
- File type badge with icon
- Source website badge
- Preview image (when available)
- Description or author
- "Open Source Page" button (redirects to original provider)

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ or Bun
- Git

### Installation Steps

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd openfinder
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Optional: For image search (get from respective services)
   PIXABAY_API_KEY=your_pixabay_api_key
   UNSPLASH_API_KEY=your_unsplash_api_key
   ```

4. **Start development server**
   ```bash
   bun run dev
   ```

5. **Access the application**
   Open your browser and navigate to the URL shown in the terminal (typically http://localhost:3000)

## 📝 Usage Guide

### Searching for Content

1. **Enter search query**: Type your search term in the main search bar
2. **Filter by type** (optional): Select a content type from the tabs (All, Books, Videos, Images, PDFs, Datasets)
3. **Click Search** or press Enter
4. **Review results**: Browse through the result cards
5. **Access content**: Click "Open Source Page" to view/download from the original source

### Managing Favorites

1. **Save favorites**: Click the heart icon on any result card
2. **View favorites**: Click the "Favorites" button in the header
3. **Remove favorites**: Click the heart icon again to remove

### Uploading Files

1. **Navigate to Upload tab**: Click the "Upload Your Files" tab
2. **Select files**: Click to browse or drag and drop files
3. **Review selected files**: Check the list of selected files
4. **Upload**: Click "Upload All" to upload files
5. **Access uploaded files**: View and access uploaded files in the list below

### Theme Toggle

Click the sun/moon icon in the header to switch between dark and light modes.

## 🌍 API Key Setup (Optional)

### Pixabay API Key
1. Visit [Pixabay API](https://pixabay.com/api/docs/)
2. Sign up for a free account
3. Get your API key
4. Add to `.env`: `PIXABAY_API_KEY=your_key_here`

### Unsplash API Key
1. Visit [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application
3. Get your Access Key
4. Add to `.env`: `UNSPLASH_API_KEY=your_key_here`

**Note**: The app works without these keys, but image search results will be limited.

## 🧪 Development

### Run linter
```bash
bun run lint
```

### Build for production
```bash
bun run build
```

## 📄 License

This project is designed to respect copyright laws and promote legal content distribution. All external API integrations comply with their respective terms of service.

## 🤝 Contributing

When contributing, ensure:
- All new features respect copyright laws
- New API integrations are from legal sources only
- Code follows the project's style guidelines
- All UI components use shadcn/ui where possible

## 🙏 Acknowledgments

- **OpenLibrary** for providing free and open book data
- **Project Gutenberg** for public domain literature
- **Internet Archive** for preserving digital content
- **Pixabay** and **Unsplash** for free stock images
- **shadcn/ui** for beautiful UI components
- **Next.js** team for the amazing framework

---

**OpenFinder** - Respecting copyright while making legal content accessible to everyone.

© 2025 OpenFinder. All rights reserved.

'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Heart, Upload, Sun, Moon, ExternalLink, Book, Video, Image as ImageIcon, FileText, Database, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';

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

interface UploadedFile {
  id: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export default function OpenFinder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  // Upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const savedFavorites = localStorage.getItem('openfinder-favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }

    // Load uploaded files
    fetchUploadedFiles();
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('openfinder-favorites', JSON.stringify([...favorites]));
    }
  }, [favorites, mounted]);

  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch('/api/upload');
      const data = await response.json();
      setUploadedFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const typeParam = selectedType !== 'all' ? `&type=${selectedType}` : '';
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}${typeParam}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);
    setUploadFiles(prev => [...prev, ...selected]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    setUploading(true);
    const uploaded: UploadedFile[] = [];

    for (const file of uploadFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          uploaded.push(data.file);
        } else {
          toast({
            title: 'Upload Failed',
            description: data.error || `Failed to upload ${file.name}`,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Upload Error',
          description: `Failed to upload ${file.name}`,
          variant: 'destructive',
        });
      }
    }

    if (uploaded.length > 0) {
      setUploadedFiles(prev => [...prev, ...uploaded]);
      toast({
        title: 'Upload Complete',
        description: `${uploaded.length} file(s) uploaded successfully`,
      });
      setUploadFiles([]);
    }

    setUploading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book': return <Book className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'dataset': return <Database className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'video': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'image': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'pdf': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'dataset': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const displayResults = showFavorites
    ? results.filter(r => favorites.has(r.id))
    : results;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">OpenFinder</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showFavorites ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFavorites(!showFavorites)}
              >
                <Heart className={`w-4 h-4 mr-2 ${showFavorites ? 'fill-current' : ''}`} />
                Favorites ({favorites.size})
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for books, videos, images, PDFs, datasets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          <Tabs value={selectedType} onValueChange={setSelectedType} className="mt-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="book">Books</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="image">Images</TabsTrigger>
              <TabsTrigger value="pdf">PDFs</TabsTrigger>
              <TabsTrigger value="dataset">Datasets</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="mb-8">
          <TabsList>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="upload">Upload Your Files</TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            {displayResults.length === 0 && !loading && (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  {showFavorites ? 'No favorites yet' : 'Search Legal Content'}
                </h3>
                <p className="max-w-md mx-auto">
                  {showFavorites 
                    ? 'Save your favorite results by clicking the heart icon.'
                    : 'Enter a search term above to find books, videos, images, and more from authorized sources.'}
                </p>
                {!showFavorites && (
                  <div className="mt-8 flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Book className="w-3 h-3" /> OpenLibrary
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Book className="w-3 h-3" /> Project Gutenberg
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Video className="w-3 h-3" /> YouTube API
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <ImageIcon className="w-3 h-3" /> Pixabay
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <ImageIcon className="w-3 h-3" /> Unsplash
                    </Badge>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
              {displayResults.map((result) => (
                <Card key={result.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
                  {result.preview && (
                    <div className="relative h-48 bg-muted overflow-hidden">
                      <img
                        src={result.preview}
                        alt={result.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{result.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(result.id)}
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(result.id) ? 'fill-current text-red-500' : ''}`} />
                      </Button>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {result.description || result.author || `From ${result.source}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getTypeColor(result.type)}>
                        <span className="flex items-center gap-1">
                          {getTypeIcon(result.type)}
                          {result.type.toUpperCase()}
                        </span>
                      </Badge>
                      <Badge variant="secondary">{result.source}</Badge>
                    </div>
                    {result.author && (
                      <p className="text-sm text-muted-foreground mt-2">Author: {result.author}</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <a href={result.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Open Source Page
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <div className="space-y-6">
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Your Own Files
                  </CardTitle>
                  <CardDescription>
                    Share your own content with the community. Only upload files you have the rights to distribute.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                      dragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      accept=".pdf,.epub,.mp4,.jpeg,.jpg,.png,.zip,.txt"
                    />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">
                      Drop your files here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Supported formats: PDF, EPUB, MP4, JPEG, PNG, ZIP, TXT
                    </p>
                    <Button variant="outline" type="button">
                      Select Files
                    </Button>
                  </div>

                  {uploadFiles.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">
                          Selected Files ({uploadFiles.length})
                        </h4>
                        <Button
                          onClick={handleUpload}
                          disabled={uploading}
                          size="sm"
                        >
                          {uploading ? 'Uploading...' : 'Upload All'}
                        </Button>
                      </div>
                      {uploadFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                        >
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Important:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Only upload content you own or have permission to share</li>
                      <li>Ensure your content is legally distributable</li>
                      <li>Maximum file size: 100MB</li>
                      <li>By uploading, you agree to our Terms of Service</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {uploadedFiles.length > 0 && (
                <Card className="max-w-4xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Uploaded Files ({uploadedFiles.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <FileText className="w-10 h-10 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {file.originalName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Uploaded: {new Date(file.uploadedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full mt-3"
                          >
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open File
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">OpenFinder</h4>
              <p className="text-sm text-muted-foreground">
                Search and discover legal, authorized content from trusted sources worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Legal Sources</h4>
              <p className="text-sm text-muted-foreground">
                We only index content from OpenLibrary, Project Gutenberg, Internet Archive, YouTube API, Pixabay, Unsplash, and other authorized providers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Compliance</h4>
              <p className="text-sm text-muted-foreground">
                All content is indexed from legal sources. We do not host or distribute copyrighted pirated material. All downloads redirect to original providers.
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 OpenFinder. Respecting copyright and creators worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

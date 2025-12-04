import React, { useState } from 'react';
import { LibraryBook, BookCategory } from '../types';
import { TRANSLATIONS } from '../constants';
import { Book, Download, Eye, Plus, Search, Globe, X, UploadCloud, FileText, ExternalLink, Bookmark } from 'lucide-react';
import { saveLibraryBook, incrementBookDownload } from '../services/storage';

interface LibraryFeedProps {
    books: LibraryBook[];
    lang: 'en' | 'si';
    onBookAdded: () => void;
}

export const LibraryFeed: React.FC<LibraryFeedProps> = ({ books, lang, onBookAdded }) => {
    const t = TRANSLATIONS[lang];
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [previewBook, setPreviewBook] = useState<LibraryBook | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        linkUrl: '',
        description: '',
        language: 'Sinhala' as 'Sinhala' | 'English' | 'Tamil',
        category: BookCategory.TEXTBOOK
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredBooks = books.filter(book => {
        const matchesSearch =
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || book.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleUpload = async () => {
        if (!formData.title || !formData.linkUrl || !formData.author) {
            alert(t.errFillAll);
            return;
        }

        setIsSubmitting(true);
        const newBook: LibraryBook = {
            id: 'lib-' + Date.now(),
            title: formData.title,
            author: formData.author,
            linkUrl: formData.linkUrl,
            description: formData.description,
            language: formData.language,
            category: formData.category,
            uploadedBy: 'Community User',
            downloads: 0,
            timestamp: Date.now(),
            // Auto-generate cover based on title length for variety
            coverUrl: `https://images.unsplash.com/photo-${['1532012197267-da84d127e765', '1495446815901-a7297e633e8d', '1512820790803-83ca734da794'][formData.title.length % 3]}?auto=format&fit=crop&w=400&q=80`
        };

        await saveLibraryBook(newBook);
        setIsSubmitting(false);
        setIsUploadModalOpen(false);
        setFormData({ title: '', author: '', linkUrl: '', description: '', language: 'Sinhala', category: BookCategory.TEXTBOOK });
        onBookAdded();
    };

    const handleDownload = (book: LibraryBook) => {
        incrementBookDownload(book.id);
        window.open(book.linkUrl, '_blank');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <Book className="text-teal-600" size={32} />
                        {t.libTitle}
                    </h2>
                    <p className="text-gray-500 mt-1">{t.libSubtitle}</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-1"
                >
                    <Plus size={20} /> {t.btnUpload}
                </button>
            </div>

            {/* Official Resources Links */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-lg">
                    <Bookmark size={20} className="text-blue-600" /> {t.libResourcesTitle}
                </h3>
                <p className="text-sm text-blue-700 mb-4 max-w-2xl">{t.libResourcesSubtitle}</p>
                <div className="flex flex-wrap gap-4">
                    <a
                        href="http://www.edupub.gov.lk/BooksDownload.php"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-blue-100 text-blue-800 font-medium hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all group"
                    >
                        <Globe size={16} /> Edu. Publications Dept. <ExternalLink size={14} className="opacity-50 group-hover:opacity-100" />
                    </a>
                    <a
                        href="https://e-thaksalawa.moe.gov.lk/lcms/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-blue-100 text-blue-800 font-medium hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all group"
                    >
                        <Globe size={16} /> e-Thaksalawa <ExternalLink size={14} className="opacity-50 group-hover:opacity-100" />
                    </a>
                    <a
                        href="https://govdoc.lk/category/text-books"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-blue-100 text-blue-800 font-medium hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all group"
                    >
                        <Globe size={16} /> GovDoc.lk <ExternalLink size={14} className="opacity-50 group-hover:opacity-100" />
                    </a>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder={t.searchLib}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                </div>
                <select
                    className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[150px]"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    {Object.values(BookCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredBooks.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400">
                        <Book size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No books found in the library yet.</p>
                        <p className="text-sm">Be the first to share one!</p>
                    </div>
                ) : (
                    filteredBooks.map(book => (
                        <div key={book.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-100 overflow-hidden flex flex-col group">
                            <div className="h-48 relative overflow-hidden bg-gray-200">
                                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                    <Download size={10} /> {book.downloads}
                                </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded uppercase">{book.category}</span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1"><Globe size={10} /> {book.language}</span>
                                </div>

                                <h3 className="font-bold text-gray-900 leading-tight mb-1">{book.title}</h3>
                                <p className="text-sm text-gray-500 mb-2">by {book.author}</p>
                                <p className="text-xs text-gray-600 line-clamp-2 mb-4 flex-1">{book.description}</p>

                                <div className="flex gap-2 mt-auto">
                                    <button
                                        onClick={() => setPreviewBook(book)}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                                    >
                                        <Eye size={16} /> {t.btnPreview}
                                    </button>
                                    <button
                                        onClick={() => handleDownload(book)}
                                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                                    >
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                        <div className="bg-teal-600 p-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <UploadCloud /> {t.uploadTitle}
                            </h3>
                            <button onClick={() => setIsUploadModalOpen(false)} className="hover:bg-teal-500 p-1 rounded-full"><X /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelBookTitle}</label>
                                <input type="text" className="w-full p-2 border rounded-lg" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelAuthor}</label>
                                    <input type="text" className="w-full p-2 border rounded-lg" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelLanguage}</label>
                                    <select className="w-full p-2 border rounded-lg" value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value as any })}>
                                        <option>Sinhala</option><option>English</option><option>Tamil</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.category}</label>
                                <select className="w-full p-2 border rounded-lg" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })}>
                                    {Object.values(BookCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelLink}</label>
                                <input type="url" placeholder="https://" className="w-full p-2 border rounded-lg" value={formData.linkUrl} onChange={e => setFormData({ ...formData, linkUrl: e.target.value })} />
                                <p className="text-xs text-gray-400 mt-1">Paste a public Google Drive, Dropbox, or PDF link.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelDesc}</label>
                                <textarea className="w-full p-2 border rounded-lg" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                            <button
                                onClick={handleUpload}
                                disabled={isSubmitting}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-bold shadow-md flex justify-center gap-2"
                            >
                                {isSubmitting ? 'Uploading...' : t.btnUpload}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewBook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-scale-in">
                        <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <FileText size={18} /> {previewBook.title}
                            </h3>
                            <button onClick={() => setPreviewBook(null)} className="hover:text-gray-300"><X /></button>
                        </div>
                        <div className="flex-1 bg-gray-100 flex items-center justify-center relative">
                            {/* PDF Preview Iframe - Note: many sites block iframes, so we add a fallback link */}
                            <iframe
                                src={previewBook.linkUrl}
                                className="w-full h-full"
                                title="Preview"
                                onError={() => console.log('Preview failed')}
                            />
                            <div className="absolute bottom-6 bg-white/90 backdrop-blur px-6 py-4 rounded-xl shadow-lg text-center">
                                <p className="text-sm font-medium text-gray-800 mb-2">If preview doesn't load:</p>
                                <button
                                    onClick={() => handleDownload(previewBook)}
                                    className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 mx-auto"
                                >
                                    <Download size={14} /> Open Directly
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
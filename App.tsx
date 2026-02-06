
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus, 
  ArrowLeft,
  Flame,
  Star,
  Clock,
  ExternalLink,
  ChevronDown,
  Filter,
  Eye,
  Trash2,
  Copy,
  Edit2,
  CheckCircle2,
  AlertCircle,
  FileDown,
  FileUp,
  TrendingUp,
  Ticket,
  Tags,
  Upload,
  Image as ImageIcon,
  XCircle,
  Database,
  Save,
  AlignLeft,
  DollarSign,
  Link as LinkIcon,
  ChevronLeft,
  Download,
  Share2,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { db } from './db';
import { Product, ProductStatus, BadgeType, Category, Coupon, DiscountType } from './types';
import { format, differenceInSeconds } from 'date-fns';

// --- UTILS ---

const resizeImage = (file: File, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const generateUniqueProductCode = (existingProducts: Product[]): string => {
  const existingCodes = new Set(existingProducts.map(p => p.code));
  let code = '';
  do {
    code = Math.floor(10000 + Math.random() * 90000).toString();
  } while (existingCodes.has(code));
  return code;
};

// --- COMPONENTS ---

const HighlightCarousel: React.FC<{ products: Product[], onBuy: (p: Product) => void }> = ({ products, onBuy }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (products.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % products.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [products.length]);

  if (products.length === 0) return null;

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(prev => (prev + 1) % products.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(prev => (prev === 0 ? products.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-slate-900 rounded-[2.5rem] shadow-2xl group mb-12">
      {products.length > 1 && (
        <>
          <button 
            onClick={prev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-4 bg-slate-950/40 hover:bg-slate-950/60 text-white rounded-full backdrop-blur-md transition-all active:scale-90 border border-white/10 shadow-xl"
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            onClick={next}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-4 bg-slate-950/40 hover:bg-slate-950/60 text-white rounded-full backdrop-blur-md transition-all active:scale-90 border border-white/10 shadow-xl"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {products.map((product, index) => (
        <div 
          key={product.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out flex flex-col md:flex-row items-center p-8 md:p-20 gap-10 ${
            index === current ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-95 pointer-events-none'
          }`}
          style={{ background: 'linear-gradient(145deg, #1e293b 0%, #020617 100%)' }}
        >
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-orange-600/20 blur-[120px] rounded-full animate-pulse" />

          <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center relative">
            <img 
              src={product.images[0]} 
              alt={product.title} 
              className="max-h-full max-w-full object-contain drop-shadow-[0_35px_60px_rgba(249,115,22,0.4)] animate-[float_6s_ease-in-out_infinite] cursor-pointer"
              onClick={() => onBuy(product)}
            />
          </div>

          <div className="w-full md:w-1/2 text-center md:text-left flex flex-col justify-center gap-6">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <button 
                onClick={() => onBuy(product)}
                className="bg-orange-600 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest flex items-center gap-2 hover:bg-orange-700 transition-colors cursor-pointer"
              >
                <Zap size={14} fill="white" /> Destaque Imperdível
              </button>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight line-clamp-2">
              {product.title}
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex flex-col">
                <span className="text-4xl md:text-6xl font-black text-orange-500">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-slate-500 font-bold text-lg opacity-60">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.oldPrice)}
                  </span>
                )}
              </div>
              <div className="hidden md:block h-12 w-[2px] bg-slate-800 mx-4" />
              <button 
                onClick={() => onBuy(product)}
                className="bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-orange-500 hover:text-white transition-all shadow-2xl hover:scale-105 active:scale-95 group/btn w-full md:w-auto"
              >
                Resgatar Oferta
                <ArrowUpRight size={24} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ProductCard: React.FC<{ 
  product: Product; 
  onOpenDetail: (p: Product) => void;
  isAdmin?: boolean;
  onEdit?: (p: Product) => void;
  onDelete?: (id: string) => void;
}> = ({ product, onOpenDetail, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100 flex flex-col group h-full hover:shadow-xl transition-all duration-300 relative">
      <div className="absolute top-3 right-3 z-10">
        <span className="bg-white/80 backdrop-blur-md text-slate-900 text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-sm border border-slate-100">
          #{product.code}
        </span>
      </div>
      
      <div 
        className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer"
        onClick={() => onOpenDetail(product)}
      >
        <img 
          src={product.images && product.images.length > 0 ? product.images[0] : `https://picsum.photos/seed/${product.id}/400`} 
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {(product.badges || []).map(badge => (
            <span key={badge} className={`text-[9px] font-black px-3 py-1.5 rounded-lg shadow-sm text-white uppercase tracking-widest ${
              badge === BadgeType.RELAMPAGO ? 'bg-red-600' :
              badge === BadgeType.OFERTA ? 'bg-orange-500' :
              badge === BadgeType.CUPOM ? 'bg-blue-600' : 'bg-purple-600'
            }`}>
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 h-10 mb-4 group-hover:text-orange-600 transition-colors cursor-pointer" onClick={() => onOpenDetail(product)}>
          {product.title}
        </h3>
        
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-black text-orange-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.oldPrice)}
              </span>
            )}
          </div>

          {!isAdmin ? (
            <button 
              onClick={(e) => { e.stopPropagation(); onOpenDetail(product); }}
              className="w-full bg-slate-900 hover:bg-orange-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Ver Detalhes
              <ChevronRight size={18} />
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => onEdit?.(product)} className="flex-1 bg-blue-50 text-blue-600 p-3 rounded-xl hover:bg-blue-100 transition-colors" title="Editar">
                <Edit2 size={18} className="mx-auto" />
              </button>
              <button onClick={() => onDelete?.(product.id)} className="flex-1 bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-100 transition-colors" title="Excluir">
                <Trash2 size={18} className="mx-auto" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- PAGES ---

const StoreFront = ({ onAdminLogin }: { onAdminLogin: () => void }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        db.getProducts(),
        db.getCategories()
      ]);
      setProducts(prods.filter(p => p.status === ProductStatus.ACTIVE));
      setCategories(cats);
      setLoading(false);
    }
    fetchData();
  }, []);

  const highlightedProducts = useMemo(() => {
    return products.filter(p => p.isHighlighted).slice(0, 5);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = p.title.toLowerCase().includes(term) || 
                          (p.description || '').toLowerCase().includes(term) ||
                          (p.code || '').includes(term);
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleBuy = async (p: Product) => {
    if (!p) return;
    const urlParams = new URLSearchParams(window.location.search);
    const origin = urlParams.get('utm_source') || 'Direct';
    await db.logClick(p.id, origin);
    window.open(p.link, '_blank', 'noopener,noreferrer');
  };

  const handleOpenDetail = (p: Product) => {
    setSelectedProduct(p);
    setActiveImageIdx(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-[#F8F9FA]">
      <nav className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-40 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-slate-700">
            <Menu size={24} />
          </button>
          
          <div className="flex-grow">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Busque por nome ou código de 5 dígitos..." 
                className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl pl-12 pr-12 py-3.5 focus:border-orange-500 outline-none transition-all text-sm font-bold placeholder:text-slate-500 text-slate-900"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedProduct) setSelectedProduct(null);
                }}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors p-1"
                >
                  <XCircle size={18} />
                </button>
              )}
            </div>
          </div>

          <button onClick={onAdminLogin} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-orange-50 hover:text-orange-500 transition-all">
            <Settings size={22} />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-10">
        
        {!searchTerm && !selectedProduct && (
          <div className="mb-12 text-center md:text-left cursor-pointer group" onClick={resetAllFilters}>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter italic group-hover:text-orange-600 transition-colors">
              Achadinhos <span className="text-orange-600 group-hover:text-slate-900 transition-colors">Pro</span>
            </h1>
            <p className="text-slate-500 font-bold mt-2 text-lg">As melhores oportunidades garimpadas em tempo real para o seu bolso!</p>
          </div>
        )}

        {selectedProduct ? (
          <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-4 duration-500 mb-12">
            <div className="w-full md:w-3/5 h-[400px] md:h-[600px] bg-slate-50 relative group overflow-hidden">
               <button 
                  onClick={handleCloseDetail} 
                  className="absolute top-8 left-8 z-[110] bg-white text-slate-800 p-4 rounded-full hover:bg-slate-100 transition-all shadow-lg active:scale-90 flex items-center gap-2 font-black text-sm pr-6"
                >
                  <ArrowLeft size={24} strokeWidth={3} /> Voltar
                </button>

               <div className="w-full h-full flex items-center justify-center p-12">
                 <img 
                    src={selectedProduct.images[activeImageIdx]} 
                    className="max-w-full max-h-full object-contain rounded-3xl drop-shadow-[0_45px_100px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-700" 
                    alt={selectedProduct.title} 
                 />
               </div>
               
               {selectedProduct.images.length > 1 && (
                 <>
                   <button 
                     onClick={() => setActiveImageIdx(prev => (prev === 0 ? selectedProduct.images.length - 1 : prev - 1))}
                     className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 p-4 rounded-full shadow-2xl hover:bg-white transition-all active:scale-90"
                   >
                     <ChevronLeft size={28} />
                   </button>
                   <button 
                     onClick={() => setActiveImageIdx(prev => (prev === selectedProduct.images.length - 1 ? 0 : prev + 1))}
                     className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 p-4 rounded-full shadow-2xl hover:bg-white transition-all active:scale-90"
                   >
                     <ChevronRight size={28} />
                   </button>
                 </>
               )}

               <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
                 {selectedProduct.images.map((img, i) => (
                   <button 
                    key={i} 
                    onClick={() => setActiveImageIdx(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${activeImageIdx === i ? 'bg-orange-600 w-12 shadow-lg shadow-orange-600/30' : 'bg-slate-300 w-2.5'}`} 
                   />
                 ))}
               </div>
            </div>

            <div className="w-full md:w-2/5 p-10 md:p-16 overflow-y-auto flex flex-col bg-white">
               <div className="mb-8 flex justify-between items-start">
                 <div>
                   <span className="text-orange-600 font-black uppercase text-xs tracking-widest bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">{selectedProduct.category}</span>
                   <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-[1.1] mt-4">{selectedProduct.title}</h2>
                 </div>
                 <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl text-xs font-black shrink-0 shadow-lg flex flex-col items-center">
                    <span className="text-[8px] text-slate-400 uppercase leading-none mb-1">Cód SKU</span>
                    {selectedProduct.code}
                 </div>
               </div>

               <div className="flex items-center gap-6 mb-10">
                  <div className="flex flex-col">
                    <span className="text-5xl font-black text-orange-600 tracking-tighter">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProduct.price)}
                    </span>
                    {selectedProduct.oldPrice && (
                      <span className="text-xl text-slate-300 line-through font-black">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProduct.oldPrice)}
                      </span>
                    )}
                  </div>
               </div>

               <div className="mb-12 flex-grow">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                    <AlignLeft size={16} /> Detalhes do Garimpo
                  </h4>
                  <p className="text-slate-600 font-bold leading-relaxed whitespace-pre-wrap text-xl">
                    {selectedProduct.description || "Este item foi selecionado pela nossa equipe por oferecer a melhor qualidade pelo menor preço do mercado."}
                  </p>
               </div>

               <div className="mt-auto pt-10 border-t border-slate-100">
                  <button 
                    onClick={() => handleBuy(selectedProduct)}
                    className="w-full bg-orange-600 hover:bg-slate-900 text-white font-black py-7 rounded-[2.5rem] text-2xl shadow-2xl shadow-orange-600/20 transition-all hover:-translate-y-2 flex items-center justify-center gap-4 animate-pulse group"
                  >
                    Resgatar Oferta Agora
                    <ArrowUpRight size={32} className="group-hover:rotate-45 transition-transform" />
                  </button>
                  <p className="text-center text-[11px] text-slate-400 font-black uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
                    <Star size={12} fill="currentColor" /> Link Seguro e Verificado de Parceiro
                  </p>
               </div>
            </div>
          </div>
        ) : (
          <>
            {!searchTerm && highlightedProducts.length > 0 && (
              <HighlightCarousel products={highlightedProducts} onBuy={handleBuy} />
            )}

            {!searchTerm && highlightedProducts.length === 0 && (
              <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-12 md:p-20 overflow-hidden relative rounded-[3rem] mb-12 shadow-2xl">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                  <div className="text-center md:text-left">
                    <span className="bg-white/20 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">Sua vitrine de ofertas favorita</span>
                    <p className="text-orange-50 bg-white/10 backdrop-blur-md p-6 rounded-3xl font-bold text-2xl leading-snug border border-white/10 max-w-xl">
                      Explore nossa selection exclusiva de produtos com preços imperdíveis.
                    </p>
                  </div>
                  <div className="hidden md:block scale-125">
                     <ShoppingBag size={180} className="text-white opacity-20 rotate-12" />
                  </div>
                </div>
                <Flame size={300} className="absolute -right-20 -bottom-20 opacity-10 rotate-12" />
              </div>
            )}

            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-8 -mx-4 px-4">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={`px-8 py-4 rounded-2xl whitespace-nowrap text-sm font-black transition-all shadow-sm border ${
                  !selectedCategory ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                }`}
              >
                Todos os Achados
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-8 py-4 rounded-2xl whitespace-nowrap text-sm font-black transition-all shadow-sm border ${
                    selectedCategory === cat.name ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="mt-4 mb-8 flex justify-between items-center">
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
                {searchTerm ? `Resultados: "${searchTerm}"` : 'Novidades do Dia'}
              </h2>
              {products.length > 0 && (
                <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                  <CheckCircle2 size={14} /> Atualizado Agora
                </div>
              )}
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-200">
                 <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Package size={48} className="text-slate-300" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-800">Nenhum resultado</h3>
                 <p className="text-slate-400 font-bold max-w-sm mx-auto mt-3 text-lg">Não encontramos achadinhos com este nome ou código. Tente outra busca!</p>
                 {(searchTerm || selectedCategory) && (
                   <button 
                     onClick={resetAllFilters}
                     className="mt-8 text-orange-600 font-black uppercase tracking-widest text-sm hover:underline"
                   >
                     Limpar todos os filtros
                   </button>
                 )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {filteredProducts.map(p => (
                  <ProductCard 
                    key={p.id} 
                    product={p} 
                    onOpenDetail={handleOpenDetail}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative w-80 bg-white h-full shadow-2xl p-10 flex flex-col animate-in slide-in-from-left duration-500">
            <h3 className="text-3xl font-black text-orange-600 italic mb-10 tracking-tighter">Navegação</h3>
            <div className="space-y-6">
              {categories.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => { setSelectedCategory(cat.name); setIsSidebarOpen(false); if (selectedProduct) setSelectedProduct(null); }}
                  className="w-full text-left font-black text-xl text-slate-700 hover:text-orange-600 transition-colors flex items-center justify-between group"
                >
                  {cat.name}
                  <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
            
            <div className="mt-auto">
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Sobre o App</p>
                 <p className="text-slate-600 font-bold text-sm leading-relaxed">Achadinhos Pro é o seu agregador oficial de ofertas selecionadas a dedo.</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- ADMIN ---

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await db.login(email, pass);
      onLogin();
    } catch (error: any) {
      alert('Erro ao acessar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md bg-white rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] p-12 border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-orange-600" />
        
        <h1 className="text-4xl font-black text-center mb-10 text-slate-800 tracking-tighter">Painel <span className="text-orange-600">Admin</span></h1>
        
        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-2">E-mail Admin</label>
            <input 
              type="email" 
              placeholder="seu@email.com" 
              className="w-full border-2 border-slate-200 rounded-[1.5rem] px-8 py-5 focus:border-orange-500 outline-none transition-all bg-slate-100 font-black text-lg text-slate-900 placeholder:text-slate-400" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-2">Senha de Acesso</label>
            <input 
              type="password" 
              placeholder="Sua senha" 
              className="w-full border-2 border-slate-200 rounded-[1.5rem] px-8 py-5 focus:border-orange-500 outline-none transition-all bg-slate-100 font-black text-lg text-slate-900 placeholder:text-slate-400" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
              autoComplete="current-password"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-6 rounded-[1.5rem] shadow-2xl hover:bg-orange-600 transition-all active:scale-95 text-xl tracking-tight disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Acessar Agora'}
          </button>
        </form>
        
        <button onClick={() => window.location.reload()} className="w-full mt-8 text-slate-400 font-black hover:text-slate-800 text-sm uppercase tracking-widest transition-colors">
          Voltar para Loja
        </button>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'analytics' | 'database'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<any>({ images: [], status: ProductStatus.ACTIVE, badges: [], isHighlighted: false });
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dbImportRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([
      db.getProducts(),
      db.getCategories()
    ]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.link || !formData.category) {
      alert('Preencha os campos obrigatórios!');
      return;
    }
    
    if (formData.isHighlighted && products.filter(p => p.isHighlighted && p.id !== editingProduct?.id).length >= 5) {
      alert('O limite de 5 produtos no banner foi atingido. Desmarque algum antes de destacar este.');
      return;
    }

    setIsSaving(true);
    
    const productCode = editingProduct?.code || generateUniqueProductCode(products);

    const newProduct: Product = {
      id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
      code: productCode,
      title: formData.title!,
      description: formData.description || '',
      category: formData.category!,
      price: Number(formData.price),
      oldPrice: formData.oldPrice ? Number(formData.oldPrice) : undefined,
      link: formData.link!,
      images: formData.images || [],
      status: formData.status || ProductStatus.ACTIVE,
      badges: formData.badges || [],
      isFeatured: false,
      isHighlighted: !!formData.isHighlighted,
      isDailyOffer: false,
      isLightningDeal: false,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      clickCount: editingProduct?.clickCount || 0
    };
    try {
      await db.saveProduct(newProduct);
      await refresh();
      setIsFormVisible(false);
      setEditingProduct(null);
      setFormData({ images: [], status: ProductStatus.ACTIVE, badges: [], isHighlighted: false });
    } catch (err: any) {
      alert('Erro ao salvar no Supabase: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const currentImages = [...(formData.images || [])];
    for (const file of files) {
      if (currentImages.length >= 5) break;
      try {
        const resized = await resizeImage(file);
        currentImages.push(resized);
      } catch (err) {
        console.error("Erro ao processar imagem", err);
      }
    }
    setFormData({ ...formData, images: currentImages });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const [analytics, setAnalytics] = useState<any[]>([]);
  useEffect(() => {
    if (activeTab === 'analytics') {
      db.getAnalytics().then(setAnalytics);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <div className="w-full md:w-80 bg-slate-900 text-white p-10 shrink-0 flex flex-col">
        <h2 className="text-3xl font-black mb-16 tracking-tighter">Painel <span className="text-orange-600">PRO</span></h2>
        <nav className="space-y-6 flex-grow">
          <button onClick={() => { setActiveTab('products'); setIsFormVisible(false); }} className={`w-full text-left p-5 rounded-3xl font-black transition-all flex items-center gap-4 ${activeTab === 'products' ? 'bg-orange-600 shadow-lg shadow-orange-600/20' : 'hover:bg-slate-800'}`}>
            <Package size={24} /> Meus Produtos
          </button>
          <button onClick={() => { setActiveTab('analytics'); setIsFormVisible(false); }} className={`w-full text-left p-5 rounded-3xl font-black transition-all flex items-center gap-4 ${activeTab === 'analytics' ? 'bg-orange-600 shadow-lg shadow-orange-600/20' : 'hover:bg-slate-800'}`}>
            <BarChart3 size={24} /> Relatório de Cliques
          </button>
          <button onClick={() => { setActiveTab('database'); setIsFormVisible(false); }} className={`w-full text-left p-5 rounded-3xl font-black transition-all flex items-center gap-4 ${activeTab === 'database' ? 'bg-orange-600 shadow-lg shadow-orange-600/20' : 'hover:bg-slate-800'}`}>
            <Database size={24} /> Backup & Banco
          </button>
        </nav>
        <button onClick={onLogout} className="w-full text-left p-5 rounded-3xl font-black text-red-400 hover:bg-red-400/10 mt-12 flex items-center gap-4">
          <LogOut size={24} /> Encerrar Sessão
        </button>
      </div>

      <div className="flex-grow p-10 md:p-16 overflow-y-auto">
        {activeTab === 'products' ? (
          <div className="space-y-12">
            {!isFormVisible ? (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Gestão de Catálogo</h1>
                    <p className="text-slate-400 font-bold mt-2">Você tem {products.length} produtos salvos.</p>
                  </div>
                  <button 
                    onClick={() => { setEditingProduct(null); setFormData({ images: [], status: ProductStatus.ACTIVE, badges: [], isHighlighted: false }); setIsFormVisible(true); }}
                    className="bg-orange-600 text-white px-10 py-5 rounded-3xl font-black shadow-2xl hover:bg-orange-700 transition-all flex items-center gap-3 w-full md:w-auto justify-center"
                  >
                    <Plus size={28} /> Novo Achadinho
                  </button>
                </div>

                {loading ? (
                  <div className="py-20 text-center"><div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {products.map(p => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        isAdmin 
                        onOpenDetail={() => {}} 
                        onEdit={(prod) => { setEditingProduct(prod); setFormData(prod); setIsFormVisible(true); }}
                        onDelete={async (id) => { if(confirm('Excluir definitivamente este produto?')) { await db.deleteProduct(id); await refresh(); }}}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-3xl font-black tracking-tighter">{editingProduct ? 'Editar' : 'Criar'} Achadinho</h2>
                  <button onClick={() => setIsFormVisible(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={36}/></button>
                </div>
                
                <form onSubmit={handleSave} className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-3">
                      <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-2">Título do Produto</label>
                      <input required className="w-full bg-slate-100 border-2 border-slate-200 p-5 rounded-2xl font-bold text-lg outline-none focus:border-orange-500 transition-all text-slate-900" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="flex items-center gap-4 bg-orange-50 p-6 rounded-[2rem] border border-orange-100 cursor-pointer group hover:bg-orange-100 transition-colors">
                        <input 
                          type="checkbox" 
                          className="w-8 h-8 rounded-xl text-orange-600 focus:ring-orange-500 border-orange-200" 
                          checked={formData.isHighlighted || false} 
                          onChange={e => setFormData({...formData, isHighlighted: e.target.checked})}
                        />
                        <div className="flex flex-col">
                          <span className="font-black text-orange-700 uppercase text-xs tracking-widest">Destacar no Banner Principal</span>
                          <span className="text-[10px] text-orange-600/70 font-bold uppercase mt-1">Este produto aparecerá no carrossel do topo (máx 5).</span>
                        </div>
                      </label>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-2">Preço Final (R$)</label>
                      <input required type="number" step="0.01" className="w-full bg-slate-100 border-2 border-slate-200 p-5 rounded-2xl font-bold text-lg outline-none focus:border-orange-500 transition-all text-slate-900" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-2">Preço Antigo (Opcional)</label>
                      <input type="number" step="0.01" className="w-full bg-slate-100 border-2 border-slate-200 p-5 rounded-2xl font-bold text-lg outline-none focus:border-orange-500 transition-all text-slate-900" value={formData.oldPrice || ''} onChange={e => setFormData({...formData, oldPrice: e.target.value})} />
                    </div>
                    <div className="col-span-2 space-y-3">
                      <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-2">Categoria</label>
                      <select required className="w-full bg-slate-100 border-2 border-slate-200 p-5 rounded-2xl font-bold text-lg outline-none focus:border-orange-500 transition-all appearance-none text-slate-900" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option value="">Selecione uma categoria...</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 space-y-3">
                      <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-2">Link Afiliado (Marketplace)</label>
                      <input required className="w-full bg-slate-100 border-2 border-slate-200 p-5 rounded-2xl font-bold text-lg outline-none focus:border-orange-500 transition-all text-slate-900" value={formData.link || ''} onChange={e => setFormData({...formData, link: e.target.value})} />
                    </div>
                    <div className="col-span-2 space-y-3">
                      <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-2">Descrição Curta</label>
                      <textarea rows={3} className="w-full bg-slate-100 border-2 border-slate-200 p-5 rounded-2xl font-bold text-lg outline-none focus:border-orange-500 transition-all text-slate-900" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-2">Imagens do Produto (Máx 5)</label>
                    <div className="flex flex-wrap gap-5">
                      {formData.images?.map((img: string, idx: number) => (
                        <div key={idx} className="relative w-24 h-24 group">
                          <img src={img} className="w-full h-full object-cover rounded-2xl shadow-md" />
                          <button type="button" onClick={() => setFormData({...formData, images: formData.images?.filter((_: any, i: number) => i !== idx)})} className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"><X size={16}/></button>
                        </div>
                      ))}
                      {(formData.images?.length || 0) < 5 && (
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500 transition-all bg-slate-100">
                          <Plus size={40} />
                        </button>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={handleImageUpload} />
                  </div>

                  <div className="flex gap-6 pt-10">
                    <button type="button" onClick={() => setIsFormVisible(false)} className="flex-1 bg-slate-100 p-6 rounded-[2rem] font-black text-slate-500 hover:bg-slate-200 transition-colors">Cancelar</button>
                    <button type="submit" disabled={isSaving} className="flex-[2] bg-orange-600 text-white p-6 rounded-[2rem] font-black shadow-2xl disabled:opacity-50 hover:bg-orange-700 transition-all text-xl">
                      {isSaving ? 'Gravando...' : editingProduct ? 'Salvar Alterações' : 'Publicar Agora'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="space-y-10">
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Cliques em Tempo Real</h1>
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-8 font-black text-xs uppercase tracking-[0.2em] text-slate-400">Produto / Código</th>
                    <th className="p-8 font-black text-xs uppercase tracking-[0.2em] text-slate-400">Origem do Tráfego</th>
                    <th className="p-8 font-black text-xs uppercase tracking-[0.2em] text-slate-400">Data e Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {analytics.slice().reverse().map((click, i) => {
                    const prod = products.find(p => p.id === click.productId);
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-8">
                           <p className="font-black text-slate-800">{prod?.title || 'Removido'}</p>
                           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Cód: {prod?.code || 'N/A'}</p>
                        </td>
                        <td className="p-8"><span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest">{click.origin}</span></td>
                        <td className="p-8 text-slate-500 font-bold">{format(new Date(click.timestamp), 'dd/MM/yyyy HH:mm:ss')}</td>
                      </tr>
                    );
                  })}
                  {analytics.length === 0 && (
                    <tr><td colSpan={3} className="p-20 text-center text-slate-400 font-black text-lg">Nenhum clique registrado ainda.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl space-y-12">
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Gerenciar Portabilidade</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
                <Download size={48} className="text-orange-600" />
                <h3 className="text-2xl font-black text-slate-800">Exportar Catálogo</h3>
                <p className="text-slate-400 font-bold leading-relaxed">Baixe o arquivo JSON para backup ou para que outras pessoas vejam seus produtos.</p>
                <button onClick={() => {
                  const data = { products, categories, version: '1.2' };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `backup_achadinhos_${format(new Date(), 'dd-MM-yyyy')}.json`;
                  a.click();
                }} className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] hover:scale-105 transition-all">Baixar JSON</button>
              </div>
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
                <Upload size={48} className="text-blue-600" />
                <h3 className="text-2xl font-black text-slate-800">Importar Catálogo</h3>
                <p className="text-slate-400 font-bold leading-relaxed">Suba um backup JSON para restaurar produtos no Supabase.</p>
                <button onClick={() => dbImportRef.current?.click()} className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.5rem] hover:scale-105 transition-all">Subir Arquivo</button>
                <input type="file" ref={dbImportRef} hidden accept=".json" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    try {
                      const json = JSON.parse(ev.target?.result as string);
                      if (json.products && confirm('Isso irá sobrescrever ou adicionar novos produtos ao banco de dados. Continuar?')) {
                        for (const p of json.products) {
                          await db.saveProduct(p);
                        }
                        await refresh();
                        alert('Importação concluída!');
                      }
                    } catch { alert('Arquivo inválido'); }
                  };
                  reader.readAsText(file);
                }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-25px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<'store' | 'admin-login' | 'admin-dashboard'>('store');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => { 
    async function checkSession() {
      const session = await db.getSession();
      if (session) {
        setCurrentView('admin-dashboard');
      }
      setIsInitialLoading(false);
    }
    checkSession();
  }, []);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {currentView === 'store' && <StoreFront onAdminLogin={() => setCurrentView('admin-login')} />}
      {currentView === 'admin-login' && <AdminLogin onLogin={() => setCurrentView('admin-dashboard')} />}
      {currentView === 'admin-dashboard' && <AdminDashboard onLogout={async () => { await db.logout(); setCurrentView('store'); }} />}
    </div>
  );
}

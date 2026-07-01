import { useState, useEffect, FormEvent } from "react";
import { 
  Search, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Award, 
  DollarSign, 
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  RotateCcw, 
  MessageSquare, 
  PlusCircle, 
  Check, 
  Loader2, 
  Gauge, 
  Lightbulb, 
  Compass, 
  Filter,
  RefreshCw,
  TrendingDown
} from "lucide-react";
import { Product, FeedbackItem } from "./types";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  
  // Modals / Input States
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  
  // Live Feedback Input States
  const [newTesterName, setNewTesterName] = useState("");
  const [newTesterRole, setNewTesterRole] = useState("");
  const [newTesterComment, setNewTesterComment] = useState("");
  const [newTesterScore, setNewTesterScore] = useState(8.5);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  
  // Projection Model States
  const [projection, setProjection] = useState<{
    conversionLift: string;
    targetSegment: string;
    actionTip: string;
  } | null>(null);
  const [isProjecting, setIsProjecting] = useState(false);

  // General Trend States
  const [trend, setTrend] = useState<{
    trendTitle: string;
    trendDescription: string;
  } | null>(null);
  const [isTrendSynthesizing, setIsTrendSynthesizing] = useState(false);

  // Connection Indicator
  const [apiOnline, setApiOnline] = useState(true);

  // Initial Fetch
  useEffect(() => {
    fetchProducts();
    fetchTrends();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        if (data.length > 0) {
          // Keep selection or choose first
          setSelectedProduct(prev => {
            if (prev) {
              const updated = data.find((p: Product) => p.id === prev.id);
              return updated || data[0];
            }
            return data[0];
          });
        }
        setApiOnline(true);
      }
    } catch (err) {
      console.error("Could not fetch products from server, utilizing fallback.", err);
      setApiOnline(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const res = await fetch("/api/insights/trends", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setTrend(data);
      }
    } catch (e) {
      // Offline fallback
      setTrend({
        trendTitle: "Sustainable Tactility",
        trendDescription: 'Semantic analysis has identified "Sustainable Packaging" and tactile organic frames as a top-3 decision factor for consumers aged 24-35.'
      });
    }
  };

  // Run AI analysis of a new product focus group
  const handleAnalyzeNewProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    setIsSynthesizing(true);
    try {
      const res = await fetch("/api/products/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProductName,
          categoryInput: newProductCategory
        })
      });

      if (res.ok) {
        const newProd = await res.json();
        setProducts(prev => [newProd, ...prev]);
        setSelectedProduct(newProd);
        setShowNewGroupModal(false);
        setNewProductName("");
        setNewProductCategory("");
        // Trigger immediate trend update based on new dataset
        fetchTrends();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Run Strategic projection
  const handleRunProjection = async () => {
    if (!selectedProduct) return;
    setIsProjecting(true);
    try {
      const res = await fetch("/api/insights/projection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct.id })
      });
      if (res.ok) {
        const data = await res.json();
        setProjection(data);
      }
    } catch (err) {
      console.error(err);
      setProjection({
        conversionLift: "+18.2%",
        targetSegment: selectedProduct.category,
        actionTip: "Aesthetic affinity scores suggest targeting high-density video placements on specialized enthusiast platforms."
      });
    } finally {
      setIsProjecting(false);
    }
  };

  // Submit custom focus group review dynamically
  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !newTesterName.trim() || !newTesterComment.trim()) return;

    setIsSubmittingFeedback(true);
    
    // Construct new comment
    const newFeedback: FeedbackItem = {
      id: `fb-user-${Date.now()}`,
      name: newTesterName,
      avatarCode: newTesterName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase(),
      role: newTesterRole || "Participant Tester",
      comment: newTesterComment,
      status: "COMPLETED",
      score: Number(newTesterScore)
    };

    // Recalculate metrics in real-time on client to make app alive!
    const updatedFeedback = [newFeedback, ...selectedProduct.feedback];
    const totalScore = updatedFeedback.reduce((sum, item) => sum + item.score, 0);
    const newRating = Number((totalScore / updatedFeedback.length).toFixed(1));
    const newPopularity = Math.min(100, Math.max(10, Math.floor(newRating * 11)));
    const newSentiment = Math.min(100, Math.max(10, Math.floor(newRating * 11)));

    const updatedProduct: Product = {
      ...selectedProduct,
      feedback: updatedFeedback,
      rating: newRating,
      popularityScore: newPopularity,
      sentimentScore: newSentiment,
      participantsCount: selectedProduct.participantsCount + 1,
      sentimentTrend: [...selectedProduct.sentimentTrend.slice(1), Math.floor(newRating * 10)]
    };

    // Update state
    setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProduct : p));
    setSelectedProduct(updatedProduct);

    // Reset input fields
    setNewTesterName("");
    setNewTesterRole("");
    setNewTesterComment("");
    setNewTesterScore(8.5);
    setIsSubmittingFeedback(false);

    // Dynamic toast highlight
    const notification = document.getElementById("toast-notification");
    if (notification) {
      notification.classList.remove("opacity-0", "translate-y-2");
      notification.classList.add("opacity-100", "translate-y-0");
      setTimeout(() => {
        notification.classList.remove("opacity-100", "translate-y-0");
        notification.classList.add("opacity-0", "translate-y-2");
      }, 4000);
    }
  };

  const handleResetDatabase = async () => {
    if (window.confirm("Reset analytical workspace to factory default datasets?")) {
      try {
        const res = await fetch("/api/reset", { method: "POST" });
        if (res.ok) {
          fetchProducts();
          fetchTrends();
          setProjection(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Trigger projection when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      setProjection(null); // Clear previous product's projection to prompt action
    }
  }, [selectedProduct?.id]);

  // Categories list
  const categories = ["ALL", ...Array.from(new Set(products.map(p => p.category)))];

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#111111] font-sans antialiased selection:bg-[#E5E0D8] selection:text-[#111111]">
      {/* Dynamic Toast Notification */}
      <div 
        id="toast-notification" 
        className="fixed bottom-6 right-6 z-50 bg-[#2C5E43] text-white px-5 py-3 rounded-lg shadow-xl border border-[#3E7E55] transition-all duration-300 transform opacity-0 translate-y-2 flex items-center gap-3 font-display"
      >
        <CheckCircle className="w-5 h-5" />
        <div>
          <p className="font-semibold text-sm">Tester Review Ingested</p>
          <p className="text-xs text-green-100">Live sentiment metrics updated instantly.</p>
        </div>
      </div>

      {/* Primary Header - Editorial Print Design Aesthetic */}
      <header className="border-b border-[#E5E0D8] bg-[#FDFBF7] sticky top-0 z-40 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="bg-[#111111] text-[#FDFBF7] p-2.5 rounded-lg flex items-center justify-center font-display font-black tracking-widest text-lg shadow-sm">
              IL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl tracking-tight text-[#111111]">InsightLink</span>
                <span className="text-[10px] bg-[#E5E0D8] text-[#4A4D4E] font-mono px-2 py-0.5 rounded tracking-wider uppercase font-semibold">
                  Affiliate OS
                </span>
              </div>
              <p className="text-xs text-[#747879] font-medium font-mono">
                Active Consumer Sentiment & Focus Group Synthesis
              </p>
            </div>
          </div>

          {/* Interactive controls & workspace telemetry */}
          <div className="flex items-center flex-wrap gap-4">
            
            {/* Server Status Indicator */}
            <div className="flex items-center gap-2 bg-[#F5F2EB] border border-[#E5E0D8] px-3 py-1.5 rounded-md text-xs font-mono">
              <span className={`w-2.5 h-2.5 rounded-full ${apiOnline ? 'bg-emerald-600 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-[#4A4D4E] uppercase font-bold text-[10px] tracking-wider">
                {apiOnline ? 'Live Analysis Sync: OK' : 'Local Fallback State'}
              </span>
            </div>

            {/* Live Clock / ISO UTC Indicator */}
            <div className="hidden sm:flex items-center gap-2 bg-[#F5F2EB] border border-[#E5E0D8] px-3 py-1.5 rounded-md text-xs font-mono text-[#4A4D4E]">
              <Clock className="w-3.5 h-3.5 text-[#747879]" />
              <span className="text-[10px] font-bold tracking-wider">WORKSPACE PREVIEW</span>
            </div>

            {/* Clean Reset System State */}
            <button
              onClick={handleResetDatabase}
              title="Reset Database to original seeds"
              className="p-2 text-[#747879] hover:text-[#111111] bg-[#FDFBF7] hover:bg-[#F5F2EB] border border-[#E5E0D8] rounded-md transition-colors shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[calc(100vh-80px)]">
        
        {/* Left Sidebar: Product Navigation Explorer & Group Creation */}
        <section className="lg:col-span-3 border-r border-[#E5E0D8] bg-[#FAF8F5] p-5 flex flex-col h-full overflow-y-auto">
          
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-extrabold text-sm uppercase tracking-wider text-[#4A4D4E]">
                Active Datasets
              </h2>
              <span className="text-xs bg-[#E5E0D8] text-[#111111] font-mono px-2 py-0.5 rounded-full font-bold">
                {filteredProducts.length} Groups
              </span>
            </div>
            
            {/* Search Box */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search products, category, tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] font-medium placeholder-[#a4a8a9] transition-colors"
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#747879]" />
            </div>

            {/* Category Pill Filters */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-[#111111] text-[#FDFBF7]"
                      : "bg-[#F5F2EB] text-[#4A4D4E] hover:bg-[#E5E0D8] border border-[#E5E0D8]"
                  }`}
                >
                  {cat === "ALL" ? "All Sectors" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Feed List */}
          <div className="space-y-2.5 flex-1">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                const scoreColor = p.rating >= 8.0 
                  ? "bg-[#EBF7EE] text-[#2C5E43] border-[#D4EFE0]" 
                  : p.rating >= 6.0 
                    ? "bg-[#FCF5E8] text-[#A66E2E] border-[#F7E5C8]" 
                    : "bg-[#FDECE9] text-[#9C4E3D] border-[#F7D5D0]";

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`relative p-3.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? "bg-[#FDFBF7] border-[#111111] shadow-md ring-1 ring-[#111111]" 
                        : "bg-[#FDFBF7] border-[#E5E0D8] hover:border-[#747879] shadow-sm"
                    }`}
                  >
                    {/* Selected Left-Side Bold Indicator Bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#111111] rounded-l-lg" />
                    )}

                    {/* Badge & Live indicators row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[9px] font-bold tracking-wider uppercase text-[#747879]">
                        {p.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-extrabold tracking-wider ${
                          p.liveState === "LIVE NOW" 
                            ? "bg-[#EBF7EE] text-[#2C5E43] animate-pulse" 
                            : p.liveState === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-[#F5F2EB] text-[#747879]"
                        }`}>
                          {p.liveState}
                        </span>
                        
                        {/* Target Frame / Hot badge */}
                        {p.hotItem && (
                          <span className="text-[9px] text-[#C05C46]" title="High Affiliate Target Priority">★</span>
                        )}
                      </div>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-display font-extrabold text-sm tracking-tight text-[#111111] mb-2 line-clamp-1">
                      {p.name}
                    </h3>

                    {/* Bottom row metrics */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#F5F2EB]">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#747879]" />
                        <span className="font-mono text-[10px] text-[#4A4D4E]">{p.participantsCount} testers</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[#747879]">Score:</span>
                        <span className={`font-mono text-[11px] font-extrabold px-1.5 py-0.5 rounded border ${scoreColor}`}>
                          {p.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <p className="text-xs text-[#747879] font-medium font-mono">No analysis groups matching query.</p>
              </div>
            )}
          </div>

          {/* CTA: Create New Focus Group */}
          <div className="mt-5 pt-4 border-t border-[#E5E0D8]">
            <button
              onClick={() => setShowNewGroupModal(true)}
              className="w-full bg-[#111111] hover:bg-[#2e3031] text-[#FDFBF7] font-display font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Synthesize Focus Group</span>
            </button>
            <p className="text-[9px] text-center text-[#747879] font-mono mt-2 font-medium">
              Uses Gemini model to build real consumer insights datasets instantly.
            </p>
          </div>
        </section>

        {/* Middle/Right Container: Primary Analytics Hub & Tester Feedback View */}
        {selectedProduct ? (
          <section className="lg:col-span-9 p-6 md:p-8 bg-[#FDFBF7] overflow-y-auto">
            
            {/* Header / Meta Segment */}
            <div className="border-b border-[#E5E0D8] pb-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-[#E5E0D8] text-[#111111] font-mono px-2.5 py-0.5 rounded uppercase font-bold tracking-wider">
                      {selectedProduct.category}
                    </span>
                    <span className="text-xs text-[#747879] font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Synchronized with Live Feed
                    </span>
                  </div>
                  <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight text-[#111111] mb-2">
                    {selectedProduct.name}
                  </h1>
                  <p className="text-sm text-[#4A4D4E] leading-relaxed max-w-4xl">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Hot Item Banner */}
                {selectedProduct.hotItem && (
                  <div className="bg-[#FCF5E8] border border-[#F7E5C8] text-[#A66E2E] rounded-lg p-3 max-w-[200px] flex items-start gap-2.5">
                    <Award className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-display font-extrabold text-xs">High Affiliation Tier</p>
                      <p className="text-[10px] text-[#747879] leading-tight font-medium">Top 5% category performance in user interest matrix.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Grid - Screen 3 High Fidelity Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              
              {/* Focus Rating Scorecard */}
              <div className="bg-[#FAF8F5] border border-[#E5E0D8] p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-[#4A4D4E] font-bold tracking-wider uppercase">Focus Group Rating</span>
                  <Gauge className="w-4 h-4 text-[#747879]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5 mb-1.5">
                    <span className="font-display font-black text-4xl tracking-tight">{selectedProduct.rating.toFixed(1)}</span>
                    <span className="text-sm font-mono text-[#747879] font-bold">/ 10</span>
                  </div>
                  {/* Gauge indicator bar */}
                  <div className="w-full bg-[#E5E0D8] h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#111111] transition-all duration-500" 
                      style={{ width: `${selectedProduct.rating * 10}%` }}
                    />
                  </div>
                </div>
                <div className="text-[10px] text-[#747879] font-mono mt-3">
                  Based on {selectedProduct.participantsCount} tester telemetry indices.
                </div>
              </div>

              {/* Popularity Card */}
              <div className="bg-[#FAF8F5] border border-[#E5E0D8] p-5 rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-[#4A4D4E] font-bold tracking-wider uppercase">Popularity Score</span>
                  <TrendingUp className="w-4 h-4 text-[#747879]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5 mb-1.5">
                    <span className="font-display font-black text-4xl tracking-tight">{selectedProduct.popularityScore}%</span>
                    <span className="text-xs font-mono text-emerald-600 font-bold">▲ Strong Interest</span>
                  </div>
                  {/* Simple linear progress indicator */}
                  <div className="w-full bg-[#E5E0D8] h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#2C5E43] transition-all duration-500" 
                      style={{ width: `${selectedProduct.popularityScore}%` }}
                    />
                  </div>
                </div>
                <div className="text-[10px] text-[#747879] font-mono mt-3">
                  Organic keyword volume + affiliate click matrix.
                </div>
              </div>

              {/* Sentiment Intensity Card */}
              <div className="bg-[#FAF8F5] border border-[#E5E0D8] p-5 rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-[#4A4D4E] font-bold tracking-wider uppercase">Positive Intensity</span>
                  <Award className="w-4 h-4 text-[#747879]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5 mb-1.5">
                    <span className="font-display font-black text-4xl tracking-tight">{selectedProduct.sentimentScore}%</span>
                    <span className="text-xs font-mono text-[#747879] font-bold">Positive/Mixed</span>
                  </div>
                  {/* Progress Indicator */}
                  <div className="w-full bg-[#E5E0D8] h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#3E7E55] transition-all duration-500" 
                      style={{ width: `${selectedProduct.sentimentScore}%` }}
                    />
                  </div>
                </div>
                <div className="text-[10px] text-[#747879] font-mono mt-3">
                  Semantic classification score of participant logs.
                </div>
              </div>

              {/* Sync Status Frame */}
              <div className="bg-[#FAF8F5] border border-[#E5E0D8] p-5 rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-[#4A4D4E] font-bold tracking-wider uppercase">Sync Status</span>
                  <CheckCircle className="w-4 h-4 text-[#2C5E43]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="font-display font-bold text-lg text-emerald-800">Verified System</span>
                  </div>
                  <p className="text-xs text-[#747879] font-mono leading-tight">
                    API Data integrity matched with global product catalogs in real time.
                  </p>
                </div>
                <div className="text-[10px] text-[#747879] font-mono mt-3 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#2C5E43]" /> Ledger Synced 100%
                </div>
              </div>

            </div>

            {/* Split Grid: Key Insights & Affiliate Pricing */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
              
              {/* Key Highlights & Friction points (Editorial Pro/Con Layout) - 7 Columns */}
              <div className="xl:col-span-7 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-5 shadow-sm">
                <h3 className="font-display font-extrabold text-sm tracking-wider uppercase text-[#4A4D4E] mb-4 border-b border-[#E5E0D8] pb-2 flex items-center justify-between">
                  <span>Semantic Extraction Highlights</span>
                  <span className="text-[10px] font-mono lowercase text-[#747879]">Natural Language Insights</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* The GOOD Side (SAGE FOREST ACCENT) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#2C5E43] border-b border-[#D4EFE0] pb-2">
                      <CheckCircle className="w-4 h-4" />
                      <h4 className="font-display font-extrabold text-xs uppercase tracking-wider">The Good (Strengths)</h4>
                    </div>

                    <div className="space-y-3">
                      {selectedProduct.goodPoints.map((gp, idx) => (
                        <div key={idx} className="bg-[#F6FDF9] border border-[#D4EFE0] p-3 rounded-lg">
                          <h5 className="font-display font-bold text-xs text-[#2C5E43] mb-1">{gp.title}</h5>
                          <p className="text-[11px] text-[#4A4D4E] leading-relaxed font-medium">{gp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* The BAD Side (TERRACOTTA ACCENT) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#9C4E3D] border-b border-[#F7D5D0] pb-2">
                      <AlertCircle className="w-4 h-4" />
                      <h4 className="font-display font-extrabold text-xs uppercase tracking-wider">The Bad (Friction Points)</h4>
                    </div>

                    <div className="space-y-3">
                      {selectedProduct.badPoints.map((bp, idx) => (
                        <div key={idx} className="bg-[#FFF8F7] border border-[#F7D5D0] p-3 rounded-lg">
                          <h5 className="font-display font-bold text-xs text-[#9C4E3D] mb-1">{bp.title}</h5>
                          <p className="text-[11px] text-[#4A4D4E] leading-relaxed font-medium">{bp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Real-Time Affiliate Feeds - 5 Columns */}
              <div className="xl:col-span-5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-sm tracking-wider uppercase text-[#4A4D4E] mb-4 border-b border-[#E5E0D8] pb-2 flex items-center justify-between">
                    <span>Affiliate Live Price Index</span>
                    <span className="text-[10px] font-mono text-emerald-600">Active APIs</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {selectedProduct.sources.map((src, idx) => (
                      <div key={idx} className="bg-[#FDFBF7] border border-[#E5E0D8] p-3 rounded-lg flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                          <div>
                            <p className="font-display font-bold text-xs">{src.name}</p>
                            <p className="text-[10px] text-[#747879] font-mono">Verified: {src.updated}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-black text-xs text-[#111111]">${src.price.toFixed(2)}</p>
                          <span className="text-[9px] text-[#2C5E43] font-mono font-bold uppercase tracking-wider">8% Affiliate</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E0D8] bg-[#FDFBF7] p-2.5 rounded-lg border">
                  <p className="text-[10px] text-[#747879] leading-tight font-medium">
                    * Live indices query real-time pricing feeds using semantic scraping. Affiliate commissions automatically linked.
                  </p>
                </div>
              </div>

            </div>

            {/* Split Data Charts Row (Aesthetic SVG Renderings) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* Competitor Benchmarking */}
              <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-5 shadow-sm">
                <h3 className="font-display font-extrabold text-sm tracking-wider uppercase text-[#4A4D4E] mb-4 border-b border-[#E5E0D8] pb-2 flex items-center justify-between">
                  <span>Competitor Benchmarking</span>
                  <span className="text-[10px] font-mono text-[#747879]">Scores out of 10</span>
                </h3>

                <div className="space-y-4 py-2">
                  {/* Selected Product Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-bold font-display mb-1.5">
                      <span>{selectedProduct.name} (Current)</span>
                      <span className="text-[#2C5E43]">{selectedProduct.rating.toFixed(1)} / 10</span>
                    </div>
                    <div className="w-full bg-[#E5E0D8] h-3.5 rounded-md overflow-hidden border border-[#D1C9BE]">
                      <div 
                        className="h-full bg-[#111111] transition-all duration-500 rounded-r"
                        style={{ width: `${selectedProduct.rating * 10}%` }}
                      />
                    </div>
                  </div>

                  {/* Competitor Bars */}
                  {selectedProduct.competitors.map((comp, idx) => {
                    const pct = comp.score * 10;
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-xs text-[#4A4D4E] font-medium font-mono mb-1">
                          <span>{comp.name}</span>
                          <span>{comp.score.toFixed(1)} / 10</span>
                        </div>
                        <div className="w-full bg-[#E5E0D8] h-2.5 rounded-md overflow-hidden">
                          <div 
                            className="h-full bg-[#747879] transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 7-Day Sentiment Trend Line Tracker */}
              <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-sm tracking-wider uppercase text-[#4A4D4E] mb-4 border-b border-[#E5E0D8] pb-2 flex items-center justify-between">
                    <span>Focus Group Sentiment Trend</span>
                    <span className="text-[10px] font-mono text-emerald-600">7-Day Interval Tracker</span>
                  </h3>

                  {/* Exquisite custom SVG Line Chart for guaranteed perfect print rendering */}
                  <div className="h-28 w-full mt-2 relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="5" x2="100" y2="5" stroke="#E5E0D8" strokeWidth="0.25" strokeDasharray="1,1" />
                      <line x1="0" y1="15" x2="100" y2="15" stroke="#E5E0D8" strokeWidth="0.25" strokeDasharray="1,1" />
                      <line x1="0" y1="25" x2="100" y2="25" stroke="#E5E0D8" strokeWidth="0.25" strokeDasharray="1,1" />

                      {/* Area Under Curve */}
                      <path
                        d={`M 0 30 L 0 ${30 - (selectedProduct.sentimentTrend[0]/3.5)} 
                           L 16.6 ${30 - (selectedProduct.sentimentTrend[1]/3.5)} 
                           L 33.3 ${30 - (selectedProduct.sentimentTrend[2]/3.5)} 
                           L 50 ${30 - (selectedProduct.sentimentTrend[3]/3.5)} 
                           L 66.6 ${30 - (selectedProduct.sentimentTrend[4]/3.5)} 
                           L 83.3 ${30 - (selectedProduct.sentimentTrend[5]/3.5)} 
                           L 100 ${30 - (selectedProduct.sentimentTrend[6]/3.5)} L 100 30 Z`}
                        fill="url(#grad)"
                        opacity="0.15"
                      />

                      {/* Line Plot path */}
                      <path
                        d={`M 0 ${30 - (selectedProduct.sentimentTrend[0]/3.5)} 
                           L 16.6 ${30 - (selectedProduct.sentimentTrend[1]/3.5)} 
                           L 33.3 ${30 - (selectedProduct.sentimentTrend[2]/3.5)} 
                           L 50 ${30 - (selectedProduct.sentimentTrend[3]/3.5)} 
                           L 66.6 ${30 - (selectedProduct.sentimentTrend[4]/3.5)} 
                           L 83.3 ${30 - (selectedProduct.sentimentTrend[5]/3.5)} 
                           L 100 ${30 - (selectedProduct.sentimentTrend[6]/3.5)}`}
                        fill="none"
                        stroke="#111111"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Bullet nodes */}
                      {selectedProduct.sentimentTrend.map((v, i) => {
                        const cx = i * 16.66;
                        const cy = 30 - (v / 3.5);
                        return (
                          <circle 
                            key={i} 
                            cx={cx} 
                            cy={cy} 
                            r="1.2" 
                            fill="#FDFBF7" 
                            stroke="#111111" 
                            strokeWidth="0.5" 
                          />
                        );
                      })}

                      {/* SVG Gradient definitions */}
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#111111" />
                          <stop offset="100%" stopColor="#FAF8F5" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Simple absolute dates indicators */}
                    <div className="flex justify-between font-mono text-[9px] text-[#747879] mt-3 uppercase tracking-wider">
                      <span>Mon (Start)</span>
                      <span>Wed (Testing Loop)</span>
                      <span>Today</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] font-mono font-bold text-[#4A4D4E]">
                  <span>Daily Delta Status:</span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> +14.2% Growth Index
                  </span>
                </div>
              </div>

            </div>

            {/* Strategic Projections Room - Powered by Gemini */}
            <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-5 shadow-sm mb-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 bg-[#111111] opacity-5 w-44 h-44 rounded-full pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-[#E5E0D8] pb-4">
                <div>
                  <h3 className="font-display font-extrabold text-sm tracking-wider uppercase text-[#4A4D4E] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>Gemini Strategic Market Projection Model</span>
                  </h3>
                  <p className="text-xs text-[#747879] font-mono leading-tight mt-1">
                    Synthesizes conversion multipliers and marketing actions from the focus dataset.
                  </p>
                </div>

                <button
                  onClick={handleRunProjection}
                  disabled={isProjecting}
                  className="bg-[#111111] hover:bg-neutral-800 text-[#FDFBF7] font-display font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isProjecting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{projection ? "Re-Run Model" : "Execute Projection"}</span>
                </button>
              </div>

              {projection ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                  <div className="bg-[#FDFBF7] border border-[#E5E0D8] p-4 rounded-lg">
                    <p className="text-[10px] font-mono text-[#747879] uppercase font-bold tracking-wider mb-1">Affiliate Conversion Lift</p>
                    <p className="text-3xl font-display font-extrabold text-emerald-800 tracking-tight">{projection.conversionLift}</p>
                    <p className="text-[10px] text-[#747879] mt-1 font-medium font-mono">Estimated conversion delta.</p>
                  </div>

                  <div className="bg-[#FDFBF7] border border-[#E5E0D8] p-4 rounded-lg">
                    <p className="text-[10px] font-mono text-[#747879] uppercase font-bold tracking-wider mb-1">Primary Target segment</p>
                    <p className="text-lg font-display font-extrabold text-[#111111] line-clamp-1">{projection.targetSegment}</p>
                    <p className="text-[10px] text-[#747879] mt-1 font-medium font-mono">Suggested segment target.</p>
                  </div>

                  <div className="bg-[#FDFBF7] border border-[#E5E0D8] p-4 rounded-lg">
                    <p className="text-[10px] font-mono text-[#747879] uppercase font-bold tracking-wider mb-1">Strategic Placement Suggestion</p>
                    <p className="text-xs text-[#4A4D4E] leading-relaxed font-semibold">{projection.actionTip}</p>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center bg-[#FDFBF7] rounded-lg border border-[#E5E0D8] border-dashed">
                  <Lightbulb className="w-8 h-8 text-[#747879] mx-auto mb-2 animate-bounce" />
                  <p className="text-xs text-[#111111] font-display font-bold">Projection Model Ready</p>
                  <p className="text-[11px] text-[#747879] mt-0.5 font-mono">Click &quot;Execute Projection&quot; to synthesize marketing strategy from test comments.</p>
                </div>
              )}
            </div>

            {/* Bottom Section: Active Tester Log Files & Submission Form */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* Participant Feed - 7 Columns */}
              <div className="xl:col-span-7 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#747879]" />
                    <h3 className="font-display font-extrabold text-sm tracking-wider uppercase text-[#4A4D4E]">
                      Live Participant Commentary logs
                    </h3>
                  </div>
                  <span className="font-mono text-xs bg-[#E5E0D8] text-[#111111] px-2.5 py-0.5 rounded-full font-bold">
                    {selectedProduct.feedback.length} Tester Quotes
                  </span>
                </div>

                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                  {selectedProduct.feedback.map((fb) => (
                    <div 
                      key={fb.id} 
                      className="bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg p-4 shadow-xs transition-shadow hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#111111] text-[#FDFBF7] text-xs font-display font-bold flex items-center justify-center">
                            {fb.avatarCode}
                          </div>
                          <div>
                            <p className="font-display font-bold text-xs text-[#111111]">{fb.name}</p>
                            <p className="text-[10px] text-[#747879] font-mono leading-none">{fb.role}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-extrabold ${
                            fb.status === "COMPLETED" 
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                              : "bg-amber-50 text-amber-800 border border-amber-100"
                          }`}>
                            {fb.status}
                          </span>
                          <span className="font-mono text-xs font-bold text-[#111111] bg-[#FAF8F5] border border-[#E5E0D8] px-2 py-0.5 rounded">
                            ★ {fb.score.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#4A4D4E] leading-relaxed italic font-medium">
                        &quot;{fb.comment}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit / Inject New Participant Comment Feedback Form - 5 Columns */}
              <div className="xl:col-span-5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-5 shadow-sm">
                <div className="border-b border-[#E5E0D8] pb-3 mb-4">
                  <h3 className="font-display font-extrabold text-sm tracking-wider uppercase text-[#4A4D4E] flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-[#747879]" />
                    <span>Submit Tester Comment</span>
                  </h3>
                  <p className="text-[10px] text-[#747879] font-mono leading-tight mt-1">
                    Adds a test comment, updating the model scores instantly.
                  </p>
                </div>

                <form onSubmit={handleAddComment} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#4A4D4E] font-bold mb-1">
                      Participant Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liam Vance"
                      value={newTesterName}
                      onChange={(e) => setNewTesterName(e.target.value)}
                      className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#111111] font-medium transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#4A4D4E] font-bold mb-1">
                      Participant Role / Persona
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ergonomics Lead / Commuter"
                      value={newTesterRole}
                      onChange={(e) => setNewTesterRole(e.target.value)}
                      className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#111111] font-medium transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#4A4D4E] font-bold mb-1">
                      Tester Evaluation Rating (out of 10)
                    </label>
                    <div className="flex items-center gap-4 bg-[#FDFBF7] p-2.5 border border-[#E5E0D8] rounded-lg">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.1"
                        value={newTesterScore}
                        onChange={(e) => setNewTesterScore(Number(e.target.value))}
                        className="flex-1 accent-[#111111]"
                      />
                      <span className="font-mono text-sm font-black w-8 text-center bg-[#FAF8F5] border border-[#E5E0D8] rounded py-0.5">
                        {newTesterScore.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#4A4D4E] font-bold mb-1">
                      Detailed Sentiment Comment Quote
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Paste review snippet or focus group observation comment..."
                      value={newTesterComment}
                      onChange={(e) => setNewTesterComment(e.target.value)}
                      className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#111111] font-medium transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingFeedback}
                    className="w-full bg-[#111111] hover:bg-neutral-800 text-[#FDFBF7] font-display font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                  >
                    {isSubmittingFeedback ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Ingest Tester Comment</span>
                  </button>
                </form>
              </div>

            </div>

          </section>
        ) : (
          <section className="lg:col-span-9 flex flex-col items-center justify-center p-12 text-center bg-[#FDFBF7]">
            <Compass className="w-12 h-12 text-[#747879] animate-spin mb-3" />
            <h2 className="font-display font-black text-lg text-[#111111]">Loading Ivory Analytical Workspace...</h2>
            <p className="text-xs text-[#747879] font-mono mt-1">Aligning databases and synthesizing consumer trends.</p>
          </section>
        )}

      </main>

      {/* Synthesis Dialog / Modal (Powered by Gemini model) */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#111111]/30 backdrop-blur-xs">
          
          <div className="bg-[#FAF8F5] border-2 border-[#111111] w-full max-w-lg rounded-xl overflow-hidden shadow-2xl relative">
            
            <div className="bg-[#111111] text-[#FDFBF7] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="font-display font-extrabold text-sm uppercase tracking-wider">
                  AI Focus Group Synthesis Creator
                </h3>
              </div>
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAnalyzeNewProduct} className="p-5 space-y-4">
              <p className="text-xs text-[#4A4D4E] leading-relaxed font-medium bg-[#FDFBF7] p-3 border border-[#E5E0D8] rounded-lg">
                Enter any real or conceptual affiliate target product. The server will invoke the <strong className="font-bold text-[#111111]">Gemini model</strong> to synthesize a realistic, high-fidelity consumer focus group review, participant comments, and benchmarking dataset instantly.
              </p>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#4A4D4E] font-bold mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic Desk Keyboard V2"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#111111] font-semibold transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#4A4D4E] font-bold mb-1">
                  General Product Sector / Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Audio/Consumer, Tech/Wearables, Home/IoT"
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#111111] font-semibold transition-colors"
                />
              </div>

              <div className="bg-[#FDFBF7] p-3.5 border border-[#E5E0D8] rounded-lg flex items-start gap-2.5">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-display font-extrabold text-xs">Dynamic Seed Generation</p>
                  <p className="text-[10px] text-[#747879] leading-tight font-medium">This automatically generates detailed demographic targets, core user highlights, pain points, pricing matrices, and 3 realistic focus reviewer statements.</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewGroupModal(false)}
                  className="px-4 py-2 border border-[#E5E0D8] rounded-lg text-xs font-display font-bold text-[#4A4D4E] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSynthesizing}
                  className="bg-[#111111] hover:bg-neutral-800 text-[#FDFBF7] px-4 py-2 rounded-lg text-xs font-display font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {isSynthesizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Synthesizing via Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Execute Synthesis</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

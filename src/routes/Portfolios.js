import React, { useState, useEffect } from 'react';
import { Eye, ThumbsUp, MessageCircle, Search} from 'lucide-react';
import PortfolioDetailPage from '../component/PortfolioDetail';
import { db } from '../firebase';
import { collection, query, orderBy,  where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Splash from '../component/Splash';


const categories = [
  "전체", "디자인", "개발", "마케팅", "비즈니스", "예술", "공학", "과학", "기타"
];

const categoryMapping = {
  "전체": "all",
  "디자인": "design",
  "개발": "development",
  "마케팅": "marketing",
  "비즈니스": "business",
  "예술": "art",
  "공학": "engineering",
  "과학": "science",
  "기타": "other"
};

// 카테고리별 색상 매핑 추가
const categoryColors = {
  "전체": "bg-gray-100 text-gray-800",
  "디자인": "bg-pink-100 text-pink-800",
  "개발": "bg-blue-100 text-blue-800",
  "마케팅": "bg-green-100 text-green-800",
  "비즈니스": "bg-purple-100 text-purple-800",
  "예술": "bg-yellow-100 text-yellow-800",
  "공학": "bg-orange-100 text-orange-800",
  "과학": "bg-cyan-100 text-cyan-800",
  "기타": "bg-gray-100 text-gray-800"
};

function MainPortfolioPage() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPortfolios, setFilteredPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;
    setIsLoading(true); // 로딩 상태 시작

    const setupRealtimeUpdates = () => {
      let q;
      
      if (selectedCategory === "전체") {
        q = query(collection(db, 'portfolios'), orderBy('createdAt', 'desc'));
      } else {
        q = query(
          collection(db, 'portfolios'),
          where('category', '==', categoryMapping[selectedCategory])
        );
      }

      unsubscribe = onSnapshot(q, async (snapshot) => {
        try {
          const portfolioList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
            updatedAt: doc.data().updatedAt?.toDate().toISOString() || new Date().toISOString()
          }));

          if (selectedCategory !== "전체") {
            portfolioList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          }

          // 이미지 프리로딩 함수
          const preloadImage = (url) => {
            return new Promise((resolve, reject) => {
              if (!url) {
                resolve(); // URL이 없는 경우 바로 resolve
                return;
              }
              const img = new Image();
              img.src = url;
              img.onload = resolve;
              img.onerror = resolve; // 에러가 나도 계속 진행
            });
          };

          // 모든 포트폴리오의 이미지와 썸네일 프리로딩
          const imagePromises = portfolioList.map(portfolio => {
            const promises = [];
            if (portfolio.images?.[0]) {
              promises.push(preloadImage(portfolio.images[0]));
            }
            if (portfolio.thumbnailUrl) {
              promises.push(preloadImage(portfolio.thumbnailUrl));
            }
            return Promise.all(promises);
          });

          // 데이터 설정 및 이미지 로딩 완료 대기
          await Promise.all(imagePromises);
          setPortfolios(portfolioList);
          setError('');

          // 최소 1초 로딩 시간 보장
          setTimeout(() => {
            setIsLoading(false);
          }, 1000);

        } catch (error) {
          console.error('Error processing portfolios:', error);
          setError('포트폴리오를 불러오는 중 오류가 발생했습니다.');
          setIsLoading(false);
        }
      }, (error) => {
        console.error('Error fetching portfolios:', error);
        setError('포트폴리오를 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      });
    };

    setupRealtimeUpdates();

    // Clean up subscription
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedCategory]);

  useEffect(() => {
    // 검색어로 포트폴리오 필터링
    const filterPortfolios = () => {
      const searchTermLower = searchTerm.toLowerCase().trim();
      const filtered = portfolios.filter(portfolio => {
        const titleMatch = portfolio.title?.toLowerCase().includes(searchTermLower);
        const authorMatch = portfolio.authorName?.toLowerCase().includes(searchTermLower);
        return titleMatch || authorMatch;
      });
      setFilteredPortfolios(filtered);
    };

    filterPortfolios();
  }, [searchTerm, portfolios]);

  // const popularPortfolios = [...portfolios].sort((a, b) => b.views - a.views).slice(0, 3);
  // const recentPortfolios = [...portfolios];

  const handlePortfolioClick = (portfolioId) => {
    navigate(`/portfolio/${portfolioId}`);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <Splash />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* 검색 및 카테고리 필터 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            {/* 검색바 */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="제목 또는 작성자 이름으로 검색"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-md ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : `hover:opacity-80`
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedPortfolio && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
            <div className="min-h-screen px-4 text-center">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-black opacity-50"></div>
              </div>

              <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

              <div className="inline-block w-full max-w-4xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg relative">
                <button
                  onClick={() => setSelectedPortfolio(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="max-h-[90vh] overflow-y-auto">
                  <PortfolioDetailPage portfolio={selectedPortfolio} />
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="px-4 py-6 sm:px-0">
            <div className="text-red-500 text-center">{error}</div>
          </div>
        )}

        {/* 포트폴리오 그리드 */}
        <div className="px-4 py-6 sm:px-0">
          {filteredPortfolios.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {searchTerm 
                  ? '검색 결과가 없습니다.' 
                  : '등록된 포트폴리오가 없습니다.'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPortfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  onClick={() => handlePortfolioClick(portfolio.id)}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform duration-200 hover:scale-[1.02]"
                >
                  <div className="relative pb-[60%]">
                    <img
                      src={portfolio.thumbnailUrl || portfolio.images?.[0]}
                      alt={portfolio.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{portfolio.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{portfolio.authorName}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        categoryColors[Object.entries(categoryMapping).find(([k, v]) => v === portfolio.category)?.[0] || 'bg-gray-100 text-gray-800']
                      }`}>
                        {Object.entries(categoryMapping).find(([k, v]) => v === portfolio.category)?.[0] || portfolio.category}
                      </span>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {portfolio.views}
                        </span>
                        <span className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {portfolio.likes}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {portfolio.commentsCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MainPortfolioPage;
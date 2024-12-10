import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Users, Briefcase, Eye, ChevronRight, ArrowRight, Lightbulb, Globe, Award,ThumbsUp, MessageCircle,} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [randomPortfolios, setRandomPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryMapping = {
    "디자인": "design",
    "개발": "development",
    "마케팅": "marketing",
    "비즈니스": "business",
    "예술": "art",
    "공학": "engineering",
    "과학": "science",
    "기타": "other"
  };
  
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
  
  const handlePortfolioAuthClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/portfolio');
    }
  };
  const handleUploadClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/upload');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/portfolio?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  useEffect(() => {
    const fetchRandomPortfolios = async () => {
      try {
        const q = query(collection(db, 'portfolios'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const portfolios = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(portfolio => portfolio.images && portfolio.images.length > 0);

        const shuffled = portfolios.sort(() => 0.5 - Math.random());
        setRandomPortfolios(shuffled.slice(0, 6));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching portfolios:', error);
        setLoading(false);
      }
    };

    fetchRandomPortfolios();
  }, []);

  const handlePortfolioClick = (portfolioId) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/portfolio?selected=${portfolioId}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-64 bg-gradient-to-r from-purple-50 via-white to-blue-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                  당신의 재능을 세상에 보여주세요
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  대학생들의 창의적인 작품과 프로젝트를 공유하고 발견하는 플랫폼입니다.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2" onSubmit={handleSearch}>
                  <input 
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" 
                    placeholder="포트폴리오 검색..." 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    className="px-3 py-2 bg-[#343434] text-white rounded-md hover:bg-[#4a4a4a] focus:outline-none focus:ring-2 focus:ring-[#343434] focus:ring-offset-2"
                  >
                    <Search className="h-4 w-4" />
                    <span className="sr-only">검색</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">주요 서비스</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Users, title: "네트워킹", description: "다른 학생들과 ��결하고 협업 기회를 찾아보세요." },
                { icon: BookOpen, title: "학습", description: "다양한 포트폴리오를 통해 새로운 아이디어와 기술을 배우세요." },
                { icon: Briefcase, title: "취업 기회", description: "기업들과 연결되어 인턴십이나 취업 기회를 잡으세요." },
                { icon: Lightbulb, title: "아이디어 공유", description: "창의적인 아이디어를 공유하고 피드백을 받아보세요." },
                { icon: Globe, title: "글로벌 네트워크", description: "전 세계 학생들과 소통하며 시야를 넓혀보세요." },
                { icon: Award, title: "성과 인증", description: "프로젝트 완료와 기술 습득을 인증받고 표시하세요." }
              ].map((service, index) => (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300">
                    <service.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-600 transition-colors duration-300">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              다양한 포트폴리오를 만나보세요.
            </h2>
            {loading ? (
              <div className="text-center py-10">
                <p>로딩 중...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {randomPortfolios.map((portfolio) => (
                  <div
                    key={portfolio.id}
                    onClick={() => handlePortfolioClick(portfolio.id)}
                    className="bg-white overflow-hidden shadow-sm rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  >
                    <img 
                      className="h-48 w-full object-cover" 
                      src={portfolio.images?.[0] || 'https://via.placeholder.com/300x200'} 
                      alt={portfolio.title} 
                    />
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
                            {portfolio.views || 0}
                          </span>
                          <span className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {portfolio.likes || 0}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {portfolio.commentsCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-12 text-center">
              <button 
                onClick={handlePortfolioAuthClick}
                className="px-6 py-3 bg-[#343434] text-white rounded-md hover:bg-[#4a4a4a] focus:outline-none focus:ring-2 focus:ring-[#343434] focus:ring-offset-2 transition-all duration-300 transform hover:scale-105">
                더 많은 포트폴리오 보기
                <ChevronRight className="ml-2 h-4 w-4 inline" />
              </button>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">카테고리별 탐색</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { name: "디자인", icon: "🎨" },
                { name: "개발", icon: "💻" },
                { name: "마케팅", icon: "📊" },
                { name: "비즈니스", icon: "💼" },
                { name: "예술", icon: "🎭" },
                { name: "공학", icon: "🔧" },
                { name: "과학", icon: "🔬" },
                { name: "기타", icon: "🌟" }
              ].map((category) => (
                <button key={category.name} className="h-24 flex flex-col items-center justify-center text-center border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 hover:shadow-md">
                  <span className="text-3xl mb-2 transition-transform duration-300 transform group-hover:scale-110">{category.icon}</span>
                  <span className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors duration-300">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-purple-100 to-blue-100">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">지금 시작하세요</h2>
                <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  여러분의 재능을 세상에 보여줄 준비가 되셨나요? 지금 바로 포트폴리오를 업로드하고 새로운 기회를 만나보세요.
                </p>
              </div>
              <button 
                onClick={handleUploadClick}
                className="h-11 px-8 bg-[#343434] text-white rounded-md hover:bg-[#4a4a4a] focus:outline-none focus:ring-2 focus:ring-[#343434] focus:ring-offset-2 transition-all duration-300 transform hover:scale-105">
                포트폴리오 업로드
                <ArrowRight className="ml-2 h-4 w-4 inline" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
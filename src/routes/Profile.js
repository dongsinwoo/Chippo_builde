import React, { useState, useEffect } from 'react';
import { LogOut, Eye, ThumbsUp, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db, storage } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import CorrectionPopup from '../component/CorrectionPopup';
import Splash from '../component/Splash';

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

const Profile = () => {
  const [userPortfolios, setUserPortfolios] = useState([]);
  const [userStats, setUserStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  });
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // 사용자의 포트폴리오 가져오기
        const q = query(
          collection(db, 'portfolios'),
          where('authorId', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const portfolios = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setUserPortfolios(portfolios);

        // 통계 계산
        const stats = portfolios.reduce((acc, portfolio) => ({
          totalViews: acc.totalViews + (portfolio.views || 0),
          totalLikes: acc.totalLikes + (portfolio.likes || 0),
          totalComments: acc.totalComments + (portfolio.commentsCount || 0)
        }), {
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0
        });

        setUserStats(stats);

        // 이미지 프리로딩 함수
        const preloadImage = (url) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = reject;
          });
        };

        // 모든 포트폴리오 이미지 프리로딩
        const imageLoadPromises = portfolios
          .map(portfolio => portfolio.images?.[0])
          .filter(Boolean)
          .map(preloadImage);

        // 데이터 설정 및 이미지 로딩 완료 대기
        setUserPortfolios(portfolios);
        await Promise.all(imageLoadPromises);

        // 최소 1초 로딩 시간 보장
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);

      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  const handleDelete = async (portfolio) => {
    if (!window.confirm('정말로 이 포트폴리오를 삭제하시겠습니까?')) return;

    try {
      // Firestore에서 문서 삭제
      await deleteDoc(doc(db, 'portfolios', portfolio.id));

      // Storage에서 이미지 삭제
      if (portfolio.images && portfolio.images.length > 0) {
        for (const imageUrl of portfolio.images) {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef).catch(error => {
            console.error("이미지 삭제 실패:", error);
          });
        }
      }

      // 로컬 상태 업데이트
      setUserPortfolios(prevPortfolios => 
        prevPortfolios.filter(p => p.id !== portfolio.id)
      );

      // 통계 업데이트
      setUserStats(prev => ({
        totalViews: prev.totalViews - (portfolio.views || 0),
        totalLikes: prev.totalLikes - (portfolio.likes || 0),
        totalComments: prev.totalComments - (portfolio.commentsCount || 0)
      }));

    } catch (error) {
      console.error('포트폴리오 삭제 중 오류 발생:', error);
      alert('포트폴리오 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (portfolio) => {
    setEditingPortfolio(portfolio);
  };

  const handlePortfolioUpdate = (updatedPortfolio) => {
    setUserPortfolios(prevPortfolios =>
      prevPortfolios.map(p =>
        p.id === updatedPortfolio.id ? updatedPortfolio : p
      )
    );
  };

  const renderStats = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">활동 통계</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-indigo-100 rounded-lg p-4">
          <p className="text-indigo-800 font-semibold">총 조회수</p>
          <p className="text-3xl font-bold text-indigo-600">{userStats.totalViews}</p>
        </div>
        <div className="bg-green-100 rounded-lg p-4">
          <p className="text-green-800 font-semibold">총 좋아요</p>
          <p className="text-3xl font-bold text-green-600">{userStats.totalLikes}</p>
        </div>
        <div className="bg-yellow-100 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold">총 댓글</p>
          <p className="text-3xl font-bold text-yellow-600">{userStats.totalComments}</p>
        </div>
      </div>
    </div>
  );

  const renderPortfolios = () => (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">나의 포트폴리오</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {userPortfolios.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">
            등록된 포트폴리오가 없습니다.
          </div>
        ) : (
          userPortfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              className="bg-white overflow-hidden shadow-sm rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200 relative group"
              onClick={() => navigate(`/portfolio/${portfolio.id}`)}
            >
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(portfolio);
                  }}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  title="수정"
                >
                  <Pencil className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(portfolio);
                  }}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  title="삭제"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
              <div onClick={() => navigate(`/portfolio/${portfolio.id}`)}>
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
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Splash />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div className="flex items-center">
                <img 
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded-full mr-3 sm:mr-4" 
                  src={user?.photoURL || "https://via.placeholder.com/64"} 
                  alt={user?.displayName} 
                />
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate max-w-[150px] sm:max-w-none">
                    {user?.displayName}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 truncate max-w-[150px] sm:max-w-none">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={handleLogout} 
                  className="bg-gray-600 text-white px-2 sm:px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-300 flex items-center text-xs sm:text-sm"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  로그아웃
                </button>
              </div>
            </div>
          </div>

          {renderStats()}

          {renderPortfolios()}
        </div>
      </div>

      {editingPortfolio && (
        <CorrectionPopup
          portfolio={editingPortfolio}
          onClose={() => setEditingPortfolio(null)}
          onUpdate={handlePortfolioUpdate}
        />
      )}
    </div>
  );
};

export default Profile;
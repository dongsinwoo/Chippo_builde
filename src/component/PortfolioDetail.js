import React, { useState, useEffect } from 'react';
import { Send, Eye, ThumbsUp, MessageCircle, Share2, Copy, Facebook, Twitter, Link, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { 
  doc, 
  updateDoc, 
  collection,
  addDoc,
  query,
  where,
  getDocs,
  increment,
  serverTimestamp,
  orderBy,
  setDoc,
  deleteDoc,
  getDoc,
  runTransaction
} from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';

const LineIcon = () => (
  <svg 
    viewBox="0 0 28 28"
    className="h-4 w-4 mr-3"
    fill="currentColor"
  >
    <path d="M24 4H4v20h14V10h6V4zM6 22V6h16v2h-6v14H6z"/>
  </svg>
);

function PortfolioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuth();
  const [hasViewedPortfolio, setHasViewedPortfolio] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // 포트폴리오 데이터 불러오기
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!id) return;
      
      try {
        const portfolioRef = doc(db, 'portfolios', id);
        const portfolioDoc = await getDoc(portfolioRef);
        
        if (portfolioDoc.exists()) {
          setPortfolio({
            id: portfolioDoc.id,
            ...portfolioDoc.data()
          });
        } else {
          navigate('/portfolio');
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        navigate('/portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [id, navigate]);

  // 댓글 불러오기
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      
      try {
        const q = query(
          collection(db, 'portfolios', id, 'comments'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedComments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setComments(fetchedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [id]);

  // 조회수 증가
  useEffect(() => {
    const updateViews = async () => {
      if (!id || !portfolio || hasViewedPortfolio) return;

      try {
        const portfolioRef = doc(db, 'portfolios', id);
        const currentDoc = await getDoc(portfolioRef);
        if (!currentDoc.exists()) return;

        const currentViews = currentDoc.data().views || 0;
        
        await updateDoc(portfolioRef, {
          views: currentViews + 1
        });

        setPortfolio(prev => ({
          ...prev,
          views: currentViews + 1
        }));
        
        setHasViewedPortfolio(true);
      } catch (error) {
        console.error('조회수 업데이트 중 오류 발생:', error);
      }
    };

    updateViews();
  }, [id, portfolio, hasViewedPortfolio]);

  // 좋아요 상태 확인
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!id || !user) return;
      
      try {
        const q = query(
          collection(db, 'portfolios', id, 'likes'),
          where('userId', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        setIsLiked(!querySnapshot.empty);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkLikeStatus();
  }, [id, user]);

  // 댓글 작성 처리
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !id) return;

    try {
      const commentData = {
        content: newComment,
        authorId: user.uid,
        authorName: user.displayName,
        authorImage: user.photoURL,
        createdAt: serverTimestamp()
      };

      // 댓글을 포트폴리오의 하위 컬렉션으 저장
      const commentRef = await addDoc(
        collection(db, 'portfolios', id, 'comments'),
        commentData
      );

      // 포트폴리오의 댓글 수 증가
      const portfolioRef = doc(db, 'portfolios', id);
      await updateDoc(portfolioRef, {
        commentsCount: increment(1)
      });

      // 로컬 상태 업데이트
      setComments([{
        id: commentRef.id,
        ...commentData,
        createdAt: new Date()
      }, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // 좋아요 토글 처리
  const handleLikeToggle = async () => {
    if (!user || !id) return;

    try {
      const portfolioRef = doc(db, 'portfolios', id);
      const userLikeRef = doc(collection(db, 'portfolios', id, 'likes'), user.uid);

      if (isLiked) {
        // 좋아요 취소
        await deleteDoc(userLikeRef);
        await updateDoc(portfolioRef, {
          likes: increment(-1)
        });
      } else {
        // 좋아요 추가
        await setDoc(userLikeRef, {
          userId: user.uid,
          createdAt: serverTimestamp()
        });
        await updateDoc(portfolioRef, {
          likes: increment(1)
        });
      }

      setIsLiked(!isLiked);
      
      // 좋아요 수 즉시 반영을 위한 로컬 상태 업데이트 추가
      if (portfolio) {
        portfolio.likes = (portfolio.likes || 0) + (isLiked ? -1 : 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // 날짜 맷팅 함수
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    // Firebase Timestamp인 경우 toDate() 메서드 사용
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // 댓글 수정 함수
  const handleEditComment = async (commentId, newContent) => {
    if (!newContent.trim() || !user) return;

    try {
      const commentRef = doc(db, 'portfolios', id, 'comments', commentId);
      await updateDoc(commentRef, {
        content: newContent.trim(),
        updatedAt: serverTimestamp()
      });

      // 로컬 상태 업데이트
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: newContent.trim(), updatedAt: new Date() }
          : comment
      ));
      setEditingCommentId(null);
      setEditCommentContent('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  // 댓글 삭제 함수
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      // 댓글 삭제
      await deleteDoc(doc(db, 'portfolios', id, 'comments', commentId));
      
      // 포트폴리오의 댓글 수 감소
      const portfolioRef = doc(db, 'portfolios', id);
      await updateDoc(portfolioRef, {
        commentsCount: increment(-1)
      });

      // 로컬 상태 업데이트
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // URL 복사 함수
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('URL 복사 실패:', err);
    }
  };

  // 소셜 미디어 공유 함수들
  const handleFacebookShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=500');
  };

  const handleTwitterShare = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${portfolio.title} - 포트폴리오`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  // Line 공유 함수
  const handleLineShare = () => {
    const text = encodeURIComponent(portfolio.title);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`, '_blank', 'width=600,height=500');
  };

  // 뒤로가기 핸들러 추가
  const handleGoBack = () => {
    navigate(-1);
  };

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 포트폴리오가 없는 경우
  if (!portfolio) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>포트폴리오를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-16 bg-white shadow w-full z-40">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
              {portfolio?.title}
            </h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-[1440px] mx-auto py-6 px-4 md:px-6">
        <div className="bg-white shadow md:rounded-lg h-full md:h-auto">
          {/* 이미지 갤러리 */}
          <div className="px-4 py-4 md:px-6">
            <div className="grid grid-cols-1 gap-4">
              {portfolio?.images?.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`포트폴리오 이미지 ${index + 1}`}
                  className="w-full h-auto rounded-lg shadow-md"
                />
              ))}
            </div>
          </div>

          {/* 작성자 정보 및 통계 */}
          <div className="px-4 py-4 md:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
              <div className="flex items-center">
                <img 
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" 
                  src={portfolio?.authorImage || "https://via.placeholder.com/48"} 
                  alt={portfolio?.authorName} 
                />
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">
                    {portfolio?.authorName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    작성일: {formatDate(portfolio?.createdAt)}
                    {portfolio?.updatedAt && portfolio?.updatedAt !== portfolio?.createdAt && 
                      <span className="block sm:inline sm:ml-1">
                        (수정됨: {formatDate(portfolio?.updatedAt)})
                      </span>
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <span className="text-xs sm:text-sm text-gray-500">{portfolio?.views || 0}</span>
                </div>
                <button 
                  onClick={handleLikeToggle}
                  className="flex items-center space-x-1"
                >
                  <ThumbsUp className={`h-4 w-4 sm:h-5 sm:w-5 ${isLiked ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span className="text-xs sm:text-sm text-gray-500">{portfolio?.likes || 0}</span>
                </button>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <span className="text-xs sm:text-sm text-gray-500">{comments.length}</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{portfolio?.description}</p>
          </div>

          {/* 사용 도구 섹션 */}
          <div className="px-4 py-4 md:px-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">사용 도구</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {portfolio?.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="px-4 py-4 md:px-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">댓글</h3>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0">
                    <img
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                      src={comment.authorImage || "https://via.placeholder.com/40"}
                      alt={comment.authorName}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{comment.authorName}</p>
                      {comment.authorId === portfolio?.authorId && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          글쓴이
                        </span>
                      )}
                    </div>
                    {editingCommentId === comment.id ? (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleEditComment(comment.id, editCommentContent);
                        }}
                        className="mt-2"
                      >
                        <input
                          type="text"
                          value={editCommentContent}
                          onChange={(e) => setEditCommentContent(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="mt-2 flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditCommentContent('');
                            }}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            취소
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          >
                            저장
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                            {comment.updatedAt && comment.updatedAt !== comment.createdAt && 
                              ` (수정됨: ${formatDate(comment.updatedAt)})`
                            }
                          </p>
                          {user && comment.authorId === user.uid && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditCommentContent(comment.content);
                                }}
                                className="text-xs text-gray-600 hover:text-indigo-600"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-xs text-gray-600 hover:text-red-600"
                              >
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 댓글 입력 폼 */}
            <form onSubmit={handleCommentSubmit} className="mt-4 md:mt-6 sticky bottom-0 bg-white p-2 md:p-0">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <img
                  className="h-8 w-8 md:h-10 md:w-10 rounded-full"
                  src={user.photoURL || "https://via.placeholder.com/40"}
                  alt={user.displayName}
                />
                <div className="flex-grow w-full">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
                >
                  <Send className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  댓글
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PortfolioDetail;
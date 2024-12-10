import chippoLogo from '../assets/chippo_logo.png';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function HeadNav() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // 화면 크기 상태 추가
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 화면 크기 변경 감지
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
            setIsDropdownOpen(false);
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    const handleNavigation = (path, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        setIsDropdownOpen(false);
        
        setTimeout(() => {
            if (path === '/upload' || path === '/portfolio') {
                if (!user) {
                    navigate('/login');
                    return;
                }
            }
            
            navigate(path);
        }, 100);
    };

    // 모바일 메뉴 컴포넌트
    const MobileMenu = () => (
        <>
            <button 
                className="ml-auto"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>

            {isDropdownOpen && (
                <div className="absolute top-16 left-0 right-0 bg-white shadow-lg z-40">
                    <div className="py-2">
                        <button 
                            onClick={() => handleNavigation('/')} 
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            홈
                        </button>
                        <button 
                            onClick={() => handleNavigation('/portfolio')} 
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            포트폴리오
                        </button>
                        <button 
                            onClick={() => handleNavigation('/upload')} 
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            업로드
                        </button>
                        {user ? (
                            <>
                                <button 
                                    onClick={() => handleNavigation('/profile')} 
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    프로필
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => handleNavigation('/login')} 
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    로그인
                                </button>
                                <button 
                                    onClick={() => handleNavigation('/signup')} 
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    회원가입
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );

    // 데스크톱 메뉴 컴포넌트
    const DesktopMenu = () => (
        <nav className="flex ml-auto items-center gap-4 md:gap-6">
            <button onClick={() => handleNavigation('/')} className="text-sm font-medium hover:text-primary transition-colors">홈</button>
            <button onClick={() => handleNavigation('/portfolio')} className="text-sm font-medium hover:text-primary transition-colors">포트폴리오</button>
            <button onClick={() => handleNavigation('/upload')} className="text-sm font-medium hover:text-primary transition-colors">업로드</button>
            
            {user ? (
                <div ref={dropdownRef} className="relative">
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 py-2 hover:text-primary transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                            <img
                                src={user.photoURL || "https://via.placeholder.com/32"}
                                alt={user.displayName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-sm font-medium">
                            {user.displayName || '사용자'}
                        </span>
                    </button>
                    
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100">
                            <button
                                onClick={() => handleNavigation('/profile')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                프로필
                            </button>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                로그아웃
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <button onClick={() => handleNavigation('/login')} className="text-sm font-medium hover:text-primary transition-colors">로그인</button>
                    <button onClick={() => handleNavigation('/signup')} className="text-sm font-medium h-9 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                        회원가입
                    </button>
                </>
            )}
        </nav>
    );

    return (
        <header className={`sticky top-0 z-50 w-full px-4 lg:px-6 h-16 flex items-center transition-all duration-200 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-md' : ''}`}>
            <button onClick={() => handleNavigation('/')} className="flex items-center">
                <img src={chippoLogo} alt="학생포트폴리오" className="w-[150px] md:w-[210px] h-auto object-contain" />
            </button>
            
            {isMobile ? <MobileMenu /> : <DesktopMenu />}
        </header>
    );
}

export default HeadNav;
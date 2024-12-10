import chippoLogo from '../assets/취뽀취뽀.png';

function Splash() {
    return (<div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        <div className="animate-bounce mb-4">
          <img 
            src={chippoLogo} 
            alt="취뽀의 정석" 
            className="w-[200px] h-auto"
          />
        </div>
        <div className="mt-4 flex items-center">
          <div className="animate-spin mr-3 h-5 w-5 text-gray-600">
            <svg className="w-full h-full" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <span className="text-gray-600 text-sm">로딩중...</span>
        </div>
      </div>
    );
}

export default Splash;
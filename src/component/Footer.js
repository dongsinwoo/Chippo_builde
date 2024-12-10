function Footer() {
  return (
    <footer className="w-full py-6 bg-gray-100">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <p className="text-xs text-gray-500">©copyright 2024 studentportfolio. All rights reserved.</p>
            <nav  className="sm:ml-auto flex gap-4 sm:gap-6">
              <a href="/terms" className="text-xs hover:underline underline-offset-4 text-gray-500 hover:text-gray-900">
                이용약관
              </a>
              <a href="/privacy" className="text-xs hover:underline underline-offset-4 text-gray-500 hover:text-gray-900">
                개인정보처리방침
              </a>
            </nav>
          </div>
        </div>
      </footer>
  );
}

export default Footer;
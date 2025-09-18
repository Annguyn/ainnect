import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="brand-gradient h-8 w-8 rounded-md" />
          <span className="text-xl font-extrabold tracking-tight font-sans">ainnect</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link className="hover:text-primary-600 transition-colors" to="/">Feed</Link>
          <Link className="hover:text-primary-600 transition-colors" to="/profile">Profile</Link>
          <Link className="hover:text-primary-600 transition-colors" to="/auth">Login</Link>
        </nav>
      </div>
    </header>
  )
}

function Shell({ children }) {
  return (
    <div className="min-h-full">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}

function ReactionBar() {
  const reactions = [
    { key: 'like', label: 'Like', color: 'text-primary-600 hover:text-primary-700' },
    { key: 'love', label: 'Love', color: 'text-accent-500 hover:text-accent-600' },
    { key: 'wow', label: 'Wow', color: 'text-tertiary-500 hover:text-tertiary-600' },
  ]
  return (
    <div className="flex items-center gap-4 text-sm">
      {reactions.map(r => (
        <button key={r.key} className={`transition-colors ${r.color}`}>{r.label}</button>
      ))}
      <button className="text-secondary-600 hover:text-secondary-700 transition-colors">Share</button>
    </div>
  )
}

function CommentBox() {
  return (
    <div className="mt-3 flex items-center gap-2">
      <input className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors" placeholder="Write a comment..." />
      <button className="rounded-md bg-primary-600 px-3 py-2 text-white text-sm hover:bg-primary-700 transition-colors">Post</button>
    </div>
  )
}

function PostCard({ post }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <header className="mb-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500" />
        <div>
          <div className="font-semibold text-slate-900">{post.author}</div>
          <div className="text-xs text-slate-500">{post.time}</div>
        </div>
      </header>
      <div className="prose max-w-none text-slate-700">
        <p>{post.content}</p>
        {post.image && (
          <img className="mt-2 w-full rounded-lg" src={post.image} alt="" />
        )}
      </div>
      <div className="mt-4">
        <ReactionBar />
        <CommentBox />
      </div>
    </article>
  )
}

function FeedPage() {
  const mockPosts = [
    { id: 1, author: 'Linh Nguyen', time: '2h ago', content: 'Chào mừng đến với ainnect! Mạng xã hội sáng tạo cho mọi người.', image: '' },
    { id: 2, author: 'Minh Tran', time: '5h ago', content: 'Màu tím, xanh dương, xanh lam, hồng — quá đẹp!', image: '' },
    { id: 3, author: 'Anna Le', time: '1d ago', content: 'Giao diện mới của ainnect thật tuyệt vời! 🎨✨', image: '' },
  ]
  return (
    <Shell>
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <input className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors" placeholder="What's on your mind?" />
      </div>
      <div className="grid gap-4">
        {mockPosts.map(p => (<PostCard key={p.id} post={p} />))}
      </div>
    </Shell>
  )
}

function ProfilePage() {
  return (
    <Shell>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-1">
          <div className="h-28 w-full rounded-lg bg-gradient-to-r from-primary-400 via-secondary-500 to-tertiary-500" />
          <div className="-mt-8 flex items-end gap-3">
            <div className="h-16 w-16 rounded-full border-4 border-white bg-gradient-to-br from-accent-400 to-primary-500" />
            <div>
              <div className="text-lg font-semibold text-slate-900">Bạn dùng ainnect</div>
              <div className="text-sm text-slate-500">@ainnect_user</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Chỉnh sửa trang cá nhân</h2>
          <form className="grid gap-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Tên hiển thị</label>
              <input className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors" defaultValue="Bạn dùng ainnect" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Giới thiệu</label>
              <textarea rows={4} className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors" placeholder="Viết đôi điều về bạn..." />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50 transition-colors">Hủy</button>
              <button className="rounded-md bg-secondary-600 px-4 py-2 text-sm text-white hover:bg-secondary-700 transition-colors">Lưu</button>
            </div>
          </form>
        </div>
      </div>
    </Shell>
  )
}

function AuthPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="brand-gradient hidden lg:block" />
      <div className="flex items-center justify-center p-6">
        <AuthCard />
      </div>
    </div>
  )
}

function AuthCard() {
  return (
    <AuthToggle />
  )
}

function AuthToggle() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="flex">
        <input id="auth-toggle" type="checkbox" className="peer hidden" />
        <div className="flex w-full flex-col p-6 transition-all duration-500 ease-out peer-checked:-translate-x-full lg:w-1/2 lg:translate-x-0 lg:peer-checked:translate-x-0">
          <h2 className="mb-1 text-2xl font-bold text-slate-900">Đăng nhập</h2>
          <p className="mb-4 text-sm text-slate-500">Chào mừng trở lại ainnect</p>
          <AuthForm mode="login" />
          <label htmlFor="auth-toggle" className="mt-4 cursor-pointer text-sm text-primary-600 hover:text-primary-700 transition-colors">Chưa có tài khoản? Đăng ký</label>
        </div>
        <div className="hidden w-full flex-col p-6 transition-all duration-500 ease-out peer-checked:translate-x-0 lg:flex lg:w-1/2 lg:translate-x-0">
          <h2 className="mb-1 text-2xl font-bold text-slate-900">Đăng ký</h2>
          <p className="mb-4 text-sm text-slate-500">Tham gia cộng đồng sáng tạo ainnect</p>
          <AuthForm mode="register" />
          <label htmlFor="auth-toggle" className="mt-4 cursor-pointer text-sm text-secondary-600 hover:text-secondary-700 transition-colors">Đã có tài khoản? Đăng nhập</label>
        </div>
      </div>
      <div className="block border-t border-slate-200 p-4 lg:hidden">
        <label htmlFor="auth-toggle" className="cursor-pointer text-sm text-tertiary-600 hover:text-tertiary-700 transition-colors">Chuyển đổi form</label>
      </div>
    </div>
  )
}

function AuthForm({ mode }) {
  const isRegister = mode === 'register'
  return (
    <form className="grid gap-3">
      {isRegister && (
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Tên hiển thị</label>
          <input className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors" placeholder="Tên của bạn" />
        </div>
      )}
      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-700">Email</label>
        <input className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors" placeholder="you@example.com" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
        <input type="password" className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors" placeholder="••••••••" />
      </div>
      {isRegister && (
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Xác nhận mật khẩu</label>
          <input type="password" className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors" placeholder="••••••••" />
        </div>
      )}
      <button className="mt-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
        {isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
      </button>
    </form>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

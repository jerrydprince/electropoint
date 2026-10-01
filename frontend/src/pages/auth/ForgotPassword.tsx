export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Forgot Password</h2>
        <p className="mb-4 text-sm text-gray-600 text-center">Enter your email to receive a password reset link.</p>
        <form>
          <input type="email" placeholder="Email" className="w-full p-2 border rounded mb-4" />
          <button className="w-full bg-primary text-white p-2 rounded">Send Reset Link</button>
        </form>
      </div>
    </div>
  );
}

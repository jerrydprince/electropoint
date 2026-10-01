export default function ResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Reset Password</h2>
        <form>
          <input type="password" placeholder="New Password" className="w-full p-2 border rounded mb-4" />
          <input type="password" placeholder="Confirm Password" className="w-full p-2 border rounded mb-4" />
          <button className="w-full bg-primary text-white p-2 rounded">Reset Password</button>
        </form>
      </div>
    </div>
  );
}

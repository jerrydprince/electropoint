export default function ChangePassword() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Change Password</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-md">
        <form>
          <input type="password" placeholder="Current Password" className="w-full p-2 border rounded mb-4" />
          <input type="password" placeholder="New Password" className="w-full p-2 border rounded mb-4" />
          <input type="password" placeholder="Confirm New Password" className="w-full p-2 border rounded mb-4" />
          <button className="bg-primary text-white p-2 rounded w-full">Update Password</button>
        </form>
      </div>
    </div>
  );
}

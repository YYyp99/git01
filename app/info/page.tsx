export default function InfoPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 font-sans">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-6">Information</h1>
        <p className="mb-4">
          This is the information page. You can add your personal information, bio, or any other details here.
        </p>
        <a href="/" className="text-black hover:text-gray-600 transition-colors duration-300 font-medium">
          Back to Home
        </a>
      </div>
    </main>
  )
}

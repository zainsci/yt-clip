import { useState, FormEvent } from "react"
import axios from "axios"

export default function HomePage() {
	const [url, setUrl] = useState("")
	const [startTime, setStartTime] = useState("00:00")
	const [endTime, setEndTime] = useState("00:10")
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault()
		setIsLoading(true)
		setError(null)
		setDownloadUrl(null)

		try {
			const response = await axios.post("/api/clip", {
				url,
				startTime,
				endTime,
			})

			if (response.data.clipUrl) {
				setDownloadUrl(response.data.clipUrl)
			} else {
				setError(response.data.error || "An unknown error occurred.")
			}
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.error ||
				"Failed to process the video. Please check the URL and timestamps."
			setError(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
			<div className="w-full max-w-2xl bg-gray-800 p-8 rounded-xl shadow-lg">
				<h1 className="text-4xl font-bold text-center mb-2 text-cyan-400">
					YT Clipper
				</h1>
				<p className="text-center text-gray-400 mb-8">
					Create and download clips from YouTube videos instantly.
				</p>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="url"
							className="block text-sm font-medium text-gray-300 mb-2"
						>
							YouTube Video URL
						</label>
						<input
							type="url"
							id="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://www.youtube.com/watch?v=..."
							required
							className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label
								htmlFor="startTime"
								className="block text-sm font-medium text-gray-300 mb-2"
							>
								Start Time (MM:SS)
							</label>
							<input
								type="text"
								id="startTime"
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
								pattern="[0-5]?[0-9]:[0-5][0-9]"
								placeholder="00:30"
								required
								className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
							/>
						</div>
						<div>
							<label
								htmlFor="endTime"
								className="block text-sm font-medium text-gray-300 mb-2"
							>
								End Time (MM:SS)
							</label>
							<input
								type="text"
								id="endTime"
								value={endTime}
								onChange={(e) => setEndTime(e.target.value)}
								pattern="[0-5]?[0-9]:[0-5][0-9]"
								placeholder="01:15"
								required
								className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
							/>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
						>
							{isLoading ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Processing...
								</>
							) : (
								"Create Clip"
							)}
						</button>
					</div>
				</form>

				{error && (
					<div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-md">
						<p>
							<strong>Error:</strong> {error}
						</p>
					</div>
				)}

				{downloadUrl && (
					<div className="mt-6 p-4 bg-green-900/50 border border-green-700 text-green-300 rounded-md text-center">
						<h3 className="text-xl font-semibold mb-3">Your clip is ready!</h3>
						<a
							href={downloadUrl}
							download
							className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition-all duration-300"
						>
							Download Clip
						</a>
					</div>
				)}
			</div>
		</div>
	)
}

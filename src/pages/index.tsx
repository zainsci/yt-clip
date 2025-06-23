import { useState, FormEvent } from "react"
import axios from "axios"
import { TextField, Button, Flex, Text, Card, Heading } from "@radix-ui/themes"
import Link from "next/link"

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
		<Flex
			align="center"
			justify="center"
			direction="column"
			className="min-h-screen text-whitep-4"
		>
			<Card size="5" className="w-full max-w-2xl">
				<Heading as="h1" size="9" align="center" mb="6">
					YT Clipper
				</Heading>
				<Text as="p" size="4" align="center" className="text-center" mb="4">
					Create and download clips from YouTube videos instantly.
				</Text>

				<form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
					<Flex direction="column">
						<label
							htmlFor="url"
							className="block text-sm font-medium text-gray-300 mb-2"
						>
							YouTube Video URL
						</label>
						<TextField.Root
							variant="surface"
							size="3"
							type="url"
							id="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://www.youtube.com/watch?v=..."
							required
						/>
					</Flex>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Flex direction="column">
							<label
								htmlFor="startTime"
								className="block text-sm font-medium text-gray-300 mb-2"
							>
								Start Time (MM:SS)
							</label>
							<TextField.Root
								variant="surface"
								size="2"
								type="text"
								id="startTime"
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
								pattern="[0-5]?[0-9]:[0-5][0-9]"
								placeholder="00:30"
								required
							/>
						</Flex>
						<Flex direction="column">
							<label
								htmlFor="endTime"
								className="block text-sm font-medium text-gray-300 mb-2"
							>
								End Time (MM:SS)
							</label>
							<TextField.Root
								variant="surface"
								size="2"
								type="text"
								id="endTime"
								value={endTime}
								onChange={(e) => setEndTime(e.target.value)}
								pattern="[0-5]?[0-9]:[0-5][0-9]"
								placeholder="01:15"
								required
							/>
						</Flex>
					</div>

					<Flex direction="column">
						<Button
							type="submit"
							disabled={isLoading}
							size="3"
							className="w-full"
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
						</Button>
					</Flex>
				</form>

				{error && (
					<div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-md">
						<p>
							<strong>Error:</strong> {error}
						</p>
					</div>
				)}

				{downloadUrl && (
					<Card className="bg-green-900/50 border border-green-700" mt="6">
						<Flex direction="column" align="center" gap="4" p="2">
							<Heading as="h3" color="jade">
								Your clip is ready!
							</Heading>
							<Button asChild color="jade">
								<Link
									href={downloadUrl}
									download
									className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition-all duration-300"
								>
									Download Clip
								</Link>
							</Button>
						</Flex>
					</Card>
				)}
			</Card>
		</Flex>
	)
}

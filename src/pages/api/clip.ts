import type { NextApiRequest, NextApiResponse } from "next"
import ytDlp from "yt-dlp-exec"
import { exec } from "child_process"
import ffmpeg from "ffmpeg-static"
import fs from "fs"
import path from "path"
import os from "os"

type ResponseData = {
	message?: string
	error?: string
	clipUrl?: string
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ResponseData>
) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method Not Allowed" })
	}

	const { url, startTime, endTime } = req.body

	// --- Basic Input Validation ---
	if (!url || !startTime || !endTime) {
		return res.status(400).json({ error: "Missing required parameters." })
	}

	const timestampRegex = /^(?:[0-5]?\d):[0-5]?\d$/ // MM:SS format
	if (!timestampRegex.test(startTime) || !timestampRegex.test(endTime)) {
		return res
			.status(400)
			.json({ error: "Invalid timestamp format. Please use MM:SS." })
	}

	// A temporary file path for the initial download
	const tempId = `video-${Date.now()}`
	const tempInputPath = path.join(os.tmpdir(), `${tempId}.mp4`)

	// The final output path in the public directory
	const outputFileName = `clip-${Date.now()}.mp4`
	const outputPath = path.join(process.cwd(), "public", "clips", outputFileName)

	try {
		// --- 1. Download the video using yt-dlp ---
		console.log("Downloading video...")
		await ytDlp(url, {
			format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best", // Get best MP4 format
			output: tempInputPath,
		})
		console.log("Download complete.")

		// --- 2. Clip the video using ffmpeg ---
		// The "-c copy" flag is crucial. It tells ffmpeg to copy the streams
		// without re-encoding, which is MUCH faster.
		const ffmpegCommand = `"${ffmpeg}" -i "${tempInputPath}" -ss ${startTime} -to ${endTime} -c copy "${outputPath}"`

		console.log("Clipping video...")
		await new Promise<void>((resolve, reject) => {
			exec(ffmpegCommand, (error, stdout, stderr) => {
				if (error) {
					console.error(`ffmpeg error: ${error.message}`)
					return reject(new Error("Failed to clip video."))
				}
				console.log(`ffmpeg stdout: ${stdout}`)
				console.error(`ffmpeg stderr: ${stderr}`)
				resolve()
			})
		})
		console.log("Clipping complete.")

		// --- 3. Send the URL of the clipped video back to the client ---
		const clipUrl = `/clips/${outputFileName}`
		res.status(200).json({ message: "Clip created successfully!", clipUrl })
	} catch (error) {
		console.error("An error occurred:", error)
		res.status(500).json({ error: "An internal server error occurred." })
	} finally {
		// --- 4. Cleanup the temporary downloaded file ---
		if (fs.existsSync(tempInputPath)) {
			fs.unlinkSync(tempInputPath)
			console.log("Cleaned up temp file.")
		}
	}
}

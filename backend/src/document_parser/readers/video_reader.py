import os
import json
import tempfile
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict
from moviepy.editor import VideoFileClip
import google.generativeai as genai
from dotenv import load_dotenv
from openai import AsyncOpenAI
from pydub import AudioSegment
from dotenv import load_dotenv

load_dotenv()


class VideoReader:
    def __init__(self):
        load_dotenv()
        self.GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
        self.OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
        genai.configure(api_key=self.GOOGLE_API_KEY)
        self.gemini_model = genai.GenerativeModel(model_name="models/gemini-1.5-flash")
        self.openai_client = AsyncOpenAI(api_key=self.OPENAI_API_KEY)

    async def load_data(self, video_path: str) -> List[Dict]:
        audio_path = self._extract_audio(video_path)
        transcript_task = asyncio.create_task(self._get_transcript(audio_path))
        summary_task = asyncio.create_task(self._get_summary(audio_path))
        
        transcript, summary = await asyncio.gather(transcript_task, summary_task)
        
        sections = self._process_sections(summary, transcript)
        self._cut_video_sections(video_path, sections)
        
        # Clean up
        os.remove(audio_path)
        
        return sections

    async def _get_transcript(self, audio_path: str) -> List[Dict]:
        print("Transcribing audio...")
        chunk_duration_ms = 100 * 1000  # 100 seconds
        audio_segment = AudioSegment.from_wav(audio_path)
        chunk_file_paths = []

        for start_time in range(0, len(audio_segment), chunk_duration_ms):
            audio_chunk = audio_segment[start_time : start_time + chunk_duration_ms]
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_chunk_file:
                chunk_file_path = temp_chunk_file.name
                audio_chunk.export(chunk_file_path, format="wav")
                chunk_file_paths.append(chunk_file_path)

        async def transcribe_chunk(chunk_path):
            async with self.openai_client as client:
                with open(chunk_path, "rb") as audio_file:
                    return await client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        response_format="verbose_json",
                        timestamp_granularities=["segment", "word"],
                    )

        transcription_tasks = [transcribe_chunk(chunk) for chunk in chunk_file_paths]
        transcription_responses = await asyncio.gather(*transcription_tasks)

        # Process transcriptions
        full_transcript = []
        offset = 0
        for response in transcription_responses:
            for segment in response.segments:
                segment["start"] += offset
                segment["end"] += offset
                full_transcript.append({
                    "text": segment["text"],
                    "start": self._format_time(segment["start"]),
                    "end": self._format_time(segment["end"])
                })
            offset = full_transcript[-1]["end"]

        # Clean up temporary files
        for chunk_path in chunk_file_paths:
            os.remove(chunk_path)

        return full_transcript

    async def _get_summary(self, audio_path: str) -> Dict:
        print("Generating summary...")
        video_file = genai.upload_file(path=audio_path)
        
        prompt = """
        Analyze and summarize the audio content. Provide a summary and identify key sections in the following JSON format:

        {
            "summary": "Summary of the content in 5 - 10 sentences",
            "sections": [
                {
                    "start_time": "time stamp in HH:MM:SS format",
                    "end_time": "time stamp in HH:MM:SS format",
                    "summary": "detailed summary of the section",
                },
                ...
            ]
        }

        Be objective, clear, and concise. Explain technical terms if necessary.
        """

        response = await asyncio.to_thread(
            self.gemini_model.generate_content,
            [prompt, video_file],
            request_options={"timeout": 600}
        )
        return json.loads(response.text)

    def _extract_audio(self, video_path: str) -> str:
        print("Extracting audio...")
        video = VideoFileClip(video_path)
        audio = video.audio
        audio_path = tempfile.mktemp(suffix=".wav")
        audio.write_audiofile(audio_path)
        video.close()
        return audio_path

    def _process_sections(self, summary_data: Dict, transcript: List[Dict]) -> List[Dict]:
        processed_sections = []
        for section in summary_data['sections']:
            section_start = self._time_to_seconds(section['start_time'])
            section_end = self._time_to_seconds(section['end_time'])
            
            section_transcript = [
                entry for entry in transcript
                if section_start <= self._time_to_seconds(entry['start']) < section_end
            ]
            
            processed_section = {
                "text": section["summary"],
                "metadata": {
                    "video_summary": summary_data['summary'],
                    "start_time": section["start_time"],
                    "end_time": section["end_time"],
                    "transcript": " ".join(entry['text'] for entry in section_transcript)
                }
            }
            processed_sections.append(processed_section)
        return processed_sections

    def _cut_video_sections(self, video_path: str, sections: List[Dict]):
        video = VideoFileClip(video_path)
        for i, section in enumerate(sections):
            start_time = self._time_to_seconds(section["metadata"]["start_time"])
            end_time = self._time_to_seconds(section["metadata"]["end_time"])
            
            section_clip = video.subclip(start_time, end_time)
            output_path = f"section_{i}.mp4"
            section_clip.write_videofile(output_path)
            
            section["metadata"]["section_path"] = output_path

        video.close()

    @staticmethod
    def _time_to_seconds(time_str: str) -> float:
        t = datetime.strptime(time_str, '%H:%M:%S')
        return timedelta(hours=t.hour, minutes=t.minute, seconds=t.second).total_seconds()

    @staticmethod
    def _format_time(seconds: float) -> str:
        return str(timedelta(seconds=seconds)).split('.')[0]

if __name__ == "__main__":
    reader = VideoReader()
    video_path = "/home/bachngo/Desktop/code/Knowledge_Base_Agent/backend/notebooks/video_data/input_vid.mp4"
    sections = asyncio.run(reader.load_data(video_path))
    print(sections)
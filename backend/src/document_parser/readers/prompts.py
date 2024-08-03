VIDEO_PROCESSING_PROMPT ="""
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
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
from llama_index.readers.file import (
    DocxReader,
    HWPReader,
    PDFReader,
    EpubReader,
    FlatReader,
    HTMLTagReader,
    ImageCaptionReader,
    ImageVisionLLMReader,
    IPYNBReader,
    MarkdownReader,
    MboxReader,
    PptxReader,
    PandasCSVReader,
    VideoAudioReader,
    UnstructuredReader,
    PyMuPDFReader,
    ImageTabularChartReader,
    XMLReader,
    PagedCSVReader,
    CSVReader,
    RTFReader,
)


logger = logging.getLogger(__name__)

class PDFReader:
    """PDF parser."""

    def __init__(self, return_full_document: Optional[bool] = False) -> None:
        """Initialize PDFReader."""
        self.return_full_document = return_full_document

    def load_data(
        self,
        file: Path,
        extra_info: Optional[Dict] = None,
    ) -> List[Dict[str, Any]]:
        """Parse PDF file."""
        if not isinstance(file, Path):
            file = Path(file)

        try:
            import pypdf
        except ImportError:
            raise ImportError(
                "pypdf is required to read PDF files: `pip install pypdf`"
            )

        with open(file, "rb") as fp:
            pdf = pypdf.PdfReader(fp)
            num_pages = len(pdf.pages)
            docs = []

            if self.return_full_document:
                metadata = {"file_name": file.name}
                if extra_info:
                    metadata.update(extra_info)

                text = "\n".join(
                    pdf.pages[page].extract_text() for page in range(num_pages)
                )

                docs.append({"text": text, "metadata": metadata})
            else:
                for page in range(num_pages):
                    page_text = pdf.pages[page].extract_text()
                    page_label = pdf.page_labels[page]

                    metadata = {"page_label": page_label, "file_name": file.name}
                    if extra_info:
                        metadata.update(extra_info)

                    docs.append({"text": page_text, "metadata": metadata})

            return docs


class DocxReader:
    """Docx parser."""

    def load_data(
        self,
        file: Path,
        extra_info: Optional[Dict] = None,
    ) -> List[Dict[str, Any]]:
        """Parse DOCX file."""
        if not isinstance(file, Path):
            file = Path(file)

        try:
            import docx2txt
        except ImportError:
            raise ImportError(
                "docx2txt is required to read Microsoft Word files: "
                "`pip install docx2txt`"
            )

        text = docx2txt.process(file)
        metadata = {"file_name": file.name}
        if extra_info:
            metadata.update(extra_info)

        return [{"text": text, "metadata": metadata}]
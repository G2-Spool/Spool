# PDF Textbook Formatter

A standalone tool to extract and structure PDF textbook content into organized chapters, sections, and segments.

## Features

- **PDF Text Extraction**: Clean text extraction with spacing correction
- **Structure Detection**: Automatic detection of chapters and sections
- **Content Segmentation**: Splits content while preserving document structure
- **Keyword Extraction**: Extracts relevant keywords from segments
- **Multiple Output Formats**: JSON output with full document structure

## Installation

```bash
npm install
npm run build
```

## Usage

### Command Line

```bash
node dist/index.js textbook.pdf output.json
```

### Programmatic API

```typescript
import { TextbookFormatter } from './index.js';

const formatter = new TextbookFormatter({
  detectStructure: true,
  preserveFormatting: true,
  extractKeywords: true,
  minChapterConfidence: 0.7
});

const structuredDoc = await formatter.formatPDF('textbook.pdf');
```

## Output Format

The tool produces a structured JSON document:

```json
{
  "metadata": {
    "title": "Textbook Title",
    "author": "Author Name",
    "subject": "Subject",
    "pageCount": 500,
    "extractedDate": "2024-01-01T00:00:00Z"
  },
  "chapters": [
    {
      "title": "Introduction to Chemistry",
      "number": "1",
      "startPage": 1,
      "endPage": 45,
      "confidence": 0.9
    }
  ],
  "sections": [
    {
      "title": "Atomic Structure",
      "number": "1.1",
      "chapter": "Introduction to Chemistry",
      "level": 1
    }
  ],
  "segments": [
    {
      "id": "segment_1",
      "text": "Content text...",
      "type": "content",
      "chapter": "Introduction to Chemistry",
      "section": "Atomic Structure",
      "keywords": ["atoms", "electrons", "protons"]
    }
  ]
}
```

## Components

- **PDFProcessor**: Handles PDF text extraction and cleaning
- **StructureDetector**: Detects chapters and sections using pattern matching
- **ContentSegmenter**: Segments content based on detected structure
- **TextbookFormatter**: Main orchestrator combining all components
# IEEE Conference Paper - Formatting Guide

## Converting Markdown to IEEE Template

### Step 1: Download IEEE Template
- Visit: https://www.ieee.org/conferences/publishing/templates.html
- Download: **"Conference Template for A4 Paper"** (Word format)
- Alternative: LaTeX template if you prefer LaTeX

### Step 2: Document Setup

**Page Layout:**
- Paper size: A4 (210mm × 297mm)
- Margins: Top = 19mm, Bottom = 43mm, Left = Right = 14.32mm
- Two-column format with 4.22mm spacing between columns

**Fonts:**
- Title: 24pt, Bold, Times New Roman
- Authors: 11pt, Times New Roman
- Affiliations: 10pt, Italic, Times New Roman
- Section Headers: 10pt, Bold, Times New Roman
- Body Text: 10pt, Times New Roman
- References: 9pt, Times New Roman

### Step 3: Header Structure

```
[Title - Centered, Bold, 24pt]

[Author Names - Centered, 11pt]
[Affiliations - Centered, Italic, 10pt]
[Email addresses - Centered, 10pt]

Abstract—[Abstract text in italic, 10pt]

Keywords—[Keywords in italic, 10pt]
```

### Step 4: Section Formatting

**Main Sections (Level 1):**
- Format: I. INTRODUCTION (Uppercase, Roman numerals)
- Font: 10pt, Bold
- Spacing: 6pt before, 3pt after

**Subsections (Level 2):**
- Format: A. Background (Uppercase first letter, Capital letters)
- Font: 10pt, Italic
- Spacing: 3pt before and after

**Sub-subsections (Level 3):**
- Format: 1) Data Model: (Sentence case with number)
- Font: 10pt, Italic
- Spacing: minimal

### Step 5: Content Mapping

**From Markdown to IEEE:**

| Markdown Section | IEEE Section |
|-----------------|--------------|
| ## I. Introduction | I. INTRODUCTION |
| ### A. Background | A. Background |
| #### 1. Problem | 1) Problem: |

### Step 6: References Formatting

**IEEE Citation Style:**

[1] A. Author, "Title of paper," in Conf. Name, Year, pp. 1-10.

[2] A. Author, B. Author, "Title," Journal Name, vol. X, no. Y, pp. 1-10, Year.

**Examples:**

```
[1] S. Nakamoto, "Bitcoin: A Peer-to-Peer Electronic Cash System," 2008.

[2] N. Kshetri, "Blockchain's roles in meeting key supply chain management objectives," International Journal of Information Management, vol. 39, pp. 80-89, 2018.

[3] F. Tian, "An agri-food supply chain traceability system for China based on RFID blockchain technology," in 2016 13th International Conference on Service Systems and Service Management (ICSSSM), pp. 1-6, 2016.
```

### Step 7: Tables and Figures

**Table Format:**
```
TABLE I
PERFORMANCE METRICS

Metric                    | Value
--------------------------|----------------
Event Creation Latency    | 350-550 ms
Provenance Retrieval      | 200-400 ms
GPS Coordinate Accuracy   | 5-10 meters
```

**Table Caption:**
- Position: Above table
- Format: TABLE I (Roman numerals, centered, uppercase)
- Description: Centered, uppercase title
- Font: 8pt

**Figure Caption:**
- Position: Below figure
- Format: Fig. 1. Caption text. (Sentence case)
- Font: 9pt

### Step 8: Equations (If needed)

**Format:**
- Centered on separate line
- Numbered in parentheses on right: (1)
- Font: 10pt, Times New Roman with Symbol font for Greek

**Example:**
```
         H(n) = SHA256(data || H(n-1) || t)        (1)
```

### Step 9: Two-Column Layout

**Column Break Rules:**
- Title, authors, abstract, keywords: Full width (single column)
- Main text: Two columns starting after keywords
- Large figures/tables: Can span both columns
- References: Two columns

### Step 10: Page Numbers and Headers

**Conference Headers (Provided by organizers):**
- Usually added during publication
- Don't include in your submission unless specified

**Page Numbers:**
- Usually added by conference organizers
- Check call for papers for requirements

---

## Quick Conversion Checklist

### Before Submission:

- [ ] Document is A4 size (not US Letter)
- [ ] Two-column layout applied (except title/abstract)
- [ ] All fonts are Times New Roman
- [ ] Font sizes match IEEE specifications
- [ ] Section numbering uses Roman numerals (I, II, III)
- [ ] Subsections use letters (A, B, C)
- [ ] Abstract has no equations or special characters
- [ ] References follow IEEE citation style
- [ ] All references are numbered [1], [2], etc.
- [ ] In-text citations use [1] format
- [ ] Figures have captions below (Fig. 1. Caption)
- [ ] Tables have captions above (TABLE I)
- [ ] No page numbers (unless required)
- [ ] File saved as PDF (not Word)
- [ ] PDF is not password protected
- [ ] File size is under submission limit
- [ ] Author information is complete
- [ ] Keywords are included
- [ ] Spell-checked and proofread

---

## Common Formatting Mistakes to Avoid

### ❌ Don't Do:
1. Use US Letter size instead of A4
2. Single column for entire document
3. Include title/running headers
4. Use colored text (unless required for figures)
5. Use footnotes (convert to in-text citations)
6. Use bullet points excessively (prefer numbered lists)
7. Include hyperlinks (except in references if allowed)
8. Use first-person ("we", "our") excessively
9. Include marketing language or promotional content
10. Submit Word document (unless specifically requested)

### ✅ Do:
1. Use A4 paper size
2. Two columns for main content
3. Consistent formatting throughout
4. Black text only (except figures)
5. In-text citations with brackets [1]
6. Professional academic tone
7. Clear section hierarchy
8. Proper figure and table captions
9. IEEE citation style
10. Submit as PDF

---

## Author Information Template

```
Blockchain-Based Geo-Tagged Traceability System for
Sustainable Ayurvedic Herbal Supply Chains

[Your Name]
Department of Computer Science
[Your University]
[City, State, Country]
[your.email@university.edu]

[Team Member 2]
Department of [Department]
[Your University]
[City, State, Country]
[email@university.edu]

[Add more authors as needed]
```

---

## LaTeX Alternative (If Using Overleaf)

### Template:
```latex
\documentclass[conference]{IEEEtran}
\usepackage{cite}
\usepackage{amsmath,amssymb,amsfonts}
\usepackage{graphicx}
\usepackage{textcomp}

\begin{document}

\title{Blockchain-Based Geo-Tagged Traceability System for Sustainable Ayurvedic Herbal Supply Chains}

\author{
\IEEEauthorblockN{Your Name}
\IEEEauthorblockA{\textit{Department} \\
\textit{University}\\
City, Country \\
email@university.edu}
}

\maketitle

\begin{abstract}
[Your abstract text here]
\end{abstract}

\begin{IEEEkeywords}
Blockchain, Supply Chain, ...
\end{IEEEkeywords}

\section{Introduction}
[Your content here]

\section{Related Work}
...

\end{document}
```

---

## Submission Checklist for Conferences

### Required Files:
- [ ] PDF of full paper (camera-ready)
- [ ] Source files (Word/LaTeX) if requested
- [ ] Copyright form (signed)
- [ ] Author biography (if required)
- [ ] Supplementary materials (optional)

### Metadata:
- [ ] Paper title
- [ ] All author names and affiliations
- [ ] Contact author email
- [ ] Abstract (copy-paste ready)
- [ ] Keywords (comma-separated)
- [ ] Subject areas/topics

### Technical Requirements:
- [ ] PDF version 1.4 or higher
- [ ] All fonts embedded
- [ ] No bookmarks or annotations
- [ ] RGB color space (not CMYK)
- [ ] Resolution: 300 DPI for images
- [ ] File size under limit (usually 10-15 MB)

---

## Recommended Tools

### PDF Conversion:
- **Adobe Acrobat DC** (Best quality)
- **Microsoft Word PDF Export** (Good quality)
- **LaTeX pdflatex** (Excellent quality)
- **Online IEEE PDF Checker** (Validate compliance)

### Reference Management:
- **Zotero** (Free, IEEE style available)
- **Mendeley** (Free, citation plugin)
- **EndNote** (Paid, industry standard)
- **BibTeX** (For LaTeX users)

### Proofreading:
- **Grammarly** (Grammar and style)
- **Overleaf** (Built-in spell check for LaTeX)
- **Hemingway Editor** (Readability)
- **IEEE PDF eXpress** (Format validation)

---

## Final Quality Check

### Before Submission, Verify:

**Formatting:**
- All pages are correctly formatted
- Columns are balanced on last page
- No orphaned lines or widows
- Consistent spacing throughout

**Content:**
- Abstract matches paper content
- All sections are complete
- All figures are referenced in text
- All tables are referenced in text
- All references are cited in text
- No "[TODO]" or placeholder text

**Technical:**
- All equations are correctly formatted
- All abbreviations are defined
- All acronyms are spelled out on first use
- All numbers have appropriate units
- All data is consistent across sections

**Legal:**
- No copyright violations
- All images are original or properly licensed
- No plagiarism
- Proper attribution for all sources

---

## Contact for Formatting Help

If you need help with IEEE formatting:

1. **IEEE Author Center:** https://ieeeauthorcenter.ieee.org/
2. **IEEE Templates:** https://www.ieee.org/conferences/publishing/templates.html
3. **IEEE Style Manual:** Available on IEEE website
4. **Conference Organizers:** Email provided in call for papers
5. **University Writing Center:** Local support

---

## Timeline Recommendation

**2 weeks before deadline:**
- [ ] Convert content to IEEE format
- [ ] Add author information
- [ ] Format all references

**1 week before deadline:**
- [ ] Add any diagrams or figures
- [ ] Complete proofreading
- [ ] Get peer review from advisor

**3 days before deadline:**
- [ ] Final formatting check
- [ ] Generate PDF
- [ ] Validate with IEEE PDF checker

**1 day before deadline:**
- [ ] Submit to conference system
- [ ] Receive confirmation
- [ ] Save all submission receipts

---

**Good luck with your IEEE conference submission!**

Your paper is well-structured and ready for formatting. The content is solid, technically accurate, and follows academic writing standards. Just apply the IEEE template and you'll have a publication-ready document.

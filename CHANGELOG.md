# NoteSnap - Development Changelog & Roadmap

> A comprehensive timeline of all changes, features, decisions, and future plans for NoteSnap AI Study App.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Development Timeline](#development-timeline)
3. [Current Features](#current-features)
4. [Technical Decisions](#technical-decisions)
5. [Next Steps (Priority)](#next-steps-priority)
6. [Future Roadmap](#future-roadmap)
7. [Known Issues](#known-issues)

---

## 🎯 Project Overview

**NoteSnap** is an AI-powered study companion app built with React Native + Expo. It helps students:
- Capture and organize notes (text + images)
- Generate flashcards and quizzes using AI
- Study with spaced repetition
- Track learning progress

**Tech Stack:**
- Framework: React Native + Expo
- Navigation: Expo Router (file-based)
- State: Zustand with AsyncStorage persistence
- AI: OpenRouter API (free models)
- Styling: Custom theme with gradients

---

## 📅 Development Timeline

### Phase 1: Foundation (Initial Setup)

#### ✅ Core App Structure
- **Added**: Expo Router file-based navigation
- **Added**: Tab navigation (Home, AI, Upload, Study, Profile)
- **Added**: Zustand store with AsyncStorage persistence
- **Added**: Custom theme system with Colors, Typography, Spacing
- **Why**: Modern, scalable architecture for rapid development

#### ✅ Note Management
- **Added**: Create, edit, delete notes
- **Added**: Favorite notes feature
- **Added**: Word count tracking
- **Added**: Tags support (prepared for future use)
- **Why**: Core functionality for a note-taking app

---

### Phase 2: AI Integration

#### ✅ Initial AI Setup (OpenAI)
- **Added**: OpenAI GPT-4o integration
- **Removed**: Shortly after due to cost concerns
- **Why**: GPT-4o was too expensive for a student app

#### ✅ Google Gemini Migration
- **Added**: Google Gemini API (free tier)
- **Removed**: Switched to OpenRouter for more flexibility
- **Why**: Free tier had rate limits, needed more reliable options

#### ✅ OpenRouter Integration (Current)
- **Added**: OpenRouter API for model flexibility
- **Added**: Multiple model fallback system
- **Why**: Access to many models, better reliability

#### ✅ FREE Models Only (Latest)
- **Added**: NVIDIA Nemotron Nano 12B VL (vision, FREE)
- **Added**: DeepSeek R1 (text, FREE)
- **Added**: TNG Chimera (text, FREE)
- **Added**: Kwaipilot KAT-Coder (coding, FREE)
- **Removed**: Claude Haiku (too expensive)
- **Removed**: GPT-4o (too expensive)
- **Removed**: Gemini Flash paid models
- **Why**: User requested $0 cost operation

**Models Evolution:**
```
OpenAI GPT-4o → Google Gemini → OpenRouter Paid → OpenRouter FREE
```

---

### Phase 3: Vision & Image Features

#### ✅ Camera & Image Upload
- **Added**: Camera capture functionality
- **Added**: Gallery image picker
- **Added**: Image preview before saving
- **Why**: Students need to capture textbook pages, notes, diagrams

#### ✅ Image Storage
- **Added**: `imageUri` field in Note interface
- **Added**: `imageBase64` field for AI analysis
- **Why**: Need both for display (URI) and AI processing (base64)

#### ✅ Vision AI Actions
- **Added**: Extract text from image (OCR)
- **Added**: Summarize image content
- **Added**: Create flashcards from image
- **Added**: Create quiz from image
- **Why**: Core value proposition - turn any image into study materials

#### ✅ Zoomable Image Viewer
- **Added**: Full-screen image modal
- **Added**: Double-tap to zoom (2.5x)
- **Added**: Pan/drag functionality
- **Added**: "Tap to zoom" overlay hint
- **Why**: Users need to see image details clearly

---

### Phase 4: Flashcards & Quizzes

#### ✅ Flashcard System
- **Added**: Flashcard deck creation
- **Added**: AI-generated flashcards from notes
- **Added**: Card flip animation
- **Added**: Confidence tracking (new → learning → reviewing → mastered)
- **Added**: Session statistics
- **Why**: Spaced repetition is proven study method

#### ✅ Dynamic Text Sizing
- **Added**: Auto-shrink text based on length
- **Added**: Scrollable card content for long answers
- **Added**: "Scroll for more" hint
- **Why**: User reported text overflow on flipped cards

#### ✅ Quiz System
- **Added**: Multiple choice quiz generation
- **Added**: AI-generated quizzes from notes
- **Added**: Score tracking
- **Added**: Explanation for wrong answers
- **Why**: Active recall enhances learning

---

### Phase 5: AI Chat & Context

#### ✅ AI Chat Interface
- **Added**: Chat with AI about notes
- **Added**: Full context awareness (notes, decks, stats)
- **Added**: Quick suggestions
- **Added**: Create flashcards/quizzes via chat
- **Why**: Natural language interface for studying

#### ✅ Keyboard Handling
- **Added**: KeyboardAvoidingView
- **Added**: Keyboard listeners for height tracking
- **Added**: Dynamic padding based on keyboard state
- **Removed**: Fixed position approach (caused issues)
- **Why**: Input was hidden behind keyboard on mobile

---

### Phase 6: Note Editor & Formatting

#### ✅ Rich Text Editor
- **Added**: Bold formatting (`**text**`)
- **Added**: Italic formatting (`_text_`)
- **Added**: Bullet points (`• item`)
- **Added**: Numbered lists (`1. item`)
- **Added**: Headings (`## Heading`)
- **Why**: Users need to organize notes visually

#### ✅ Formatting Toolbar
- **Added**: Bold button [B]
- **Added**: Italic button [I]
- **Added**: List button
- **Added**: Heading button
- **Why**: Easy access to formatting without typing markdown

#### ✅ FormattedText Component
- **Added**: Renders markdown-style formatting
- **Added**: Parses bold/italic inline
- **Why**: Display formatted content in read mode

---

### Phase 7: Save AI Responses

#### ✅ AI Notes System
- **Added**: `AINoteEntry` interface in store
- **Added**: `aiNotes` array in Note interface
- **Added**: Save button for AI summaries
- **Added**: Save button for Ask AI responses
- **Added**: Dedicated "Saved AI Notes" section
- **Why**: Users wanted to keep AI-generated content

#### ✅ Editable AI Sections
- **Added**: Edit button per AI note
- **Added**: Delete button per AI note
- **Added**: Inline editing with save
- **Why**: Users need to correct/modify AI responses

#### ✅ Extract Text Options
- **Added**: "Save as AI Note" option
- **Added**: "Replace Content" option
- **Why**: Flexibility in how extracted text is saved

---

### Phase 8: UI Overhaul

#### ✅ New Color Scheme
- **Removed**: Earthy cream/sage/teal palette
- **Added**: Vibrant indigo/violet palette
- **Added**: Gradient presets (Gradients export)
- **Added**: Colored shadows with glow effect
- **Why**: Previous design was "bland and out of life"

**Color Evolution:**
```
Cream (#faf3dd) → Off-white (#fafafa)
Sage (#c8d5b9) → Violet (#8b5cf6)
Teal (#68b0ab) → Indigo (#6366f1)
```

#### ✅ Gradient Components
- **Added**: Gradient stat cards on home
- **Added**: Gradient action buttons
- **Added**: Gradient progress bars
- **Added**: Gradient answer buttons (red/yellow/green)
- **Why**: Modern, premium feel

#### ✅ Visual Improvements
- **Added**: Accent lines on note cards
- **Added**: Notification bell placeholder
- **Added**: "See All →" links
- **Added**: Better empty states
- **Why**: Polish and attention to detail

---

## ✨ Current Features

### Notes
- ✅ Create, edit, delete notes
- ✅ Favorite notes
- ✅ Image attachments
- ✅ Rich text formatting
- ✅ Word count
- ✅ Tap-to-edit

### AI
- ✅ Summarize content
- ✅ Generate flashcards
- ✅ Generate quizzes
- ✅ Extract text from images
- ✅ Ask AI questions
- ✅ Save AI responses
- ✅ FREE models (zero cost)

### Flashcards
- ✅ AI-generated decks
- ✅ Card flip animation
- ✅ Confidence tracking
- ✅ Session statistics
- ✅ Scrollable long content

### Quizzes
- ✅ Multiple choice
- ✅ Score tracking
- ✅ Answer explanations

### UI/UX
- ✅ Vibrant gradient theme
- ✅ Zoomable images
- ✅ Keyboard handling
- ✅ Loading states
- ✅ Error handling

---

## 🔧 Technical Decisions

### Why OpenRouter?
- Access to 100+ models from one API
- Easy model switching without code changes
- Free tier models available
- Pay-per-use with credits

### Why Zustand?
- Simpler than Redux
- Built-in persistence middleware
- No boilerplate
- Great TypeScript support

### Why Expo Router?
- File-based routing like Next.js
- Easy deep linking
- Type-safe navigation
- Automatic code splitting

### Why Base64 for Images?
- OpenRouter vision models require base64
- Can't send file:// URIs to API
- Stored alongside note for instant AI access

---

## 🚀 Next Steps (Priority)

### High Priority

#### 1. Search Functionality
- **What**: Global search across notes, decks, quizzes
- **How**: Add search bar to home, filter with fuzzy matching
- **Why**: Users need to find content quickly

#### 2. Spaced Repetition Algorithm
- **What**: Smart scheduling for flashcard review
- **How**: Implement SM-2 algorithm based on confidence
- **Why**: More effective than random review order

#### 3. Study Reminders
- **What**: Push notifications to study
- **How**: Use expo-notifications with scheduling
- **Why**: Consistency is key to learning

#### 4. Dark Mode
- **What**: Night-friendly theme toggle
- **How**: Add theme context, create dark color palettes
- **Why**: Eye strain reduction, user preference

### Medium Priority

#### 5. Deck Management
- **What**: Edit/delete flashcards, reorder cards
- **How**: Add edit modal, drag-to-reorder
- **Why**: Users need to refine AI-generated content

#### 6. Statistics Dashboard
- **What**: Charts showing study progress
- **How**: Use react-native-chart-kit or victory-native
- **Why**: Motivation through visualization

#### 7. Export/Share
- **What**: Export notes as PDF, share decks
- **How**: Use expo-print for PDF generation
- **Why**: Print notes, share with friends

#### 8. Tags & Categories
- **What**: Organize content with color-coded tags
- **How**: Add tag picker UI, filter by tags
- **Why**: Better organization for many notes

---

## 🌟 Future Roadmap

### v1.1 - Study Enhancement
- [ ] Spaced repetition scheduling
- [ ] Study streak rewards/achievements
- [ ] Pomodoro timer integration
- [ ] Focus mode (hide distractions)

### v1.2 - Content Features
- [ ] Audio notes (voice memos)
- [ ] Handwriting recognition
- [ ] PDF text extraction
- [ ] Web clipper (save articles)

### v1.3 - Social Features
- [ ] Share decks publicly
- [ ] Collaborative study groups
- [ ] Compete with friends
- [ ] Community deck library

### v1.4 - Advanced AI
- [ ] Personalized study paths
- [ ] Weak area detection
- [ ] Adaptive quizzes (harder if doing well)
- [ ] Study recommendations

### v1.5 - Platform Expansion
- [ ] Web app version
- [ ] Desktop app (Electron)
- [ ] Browser extension
- [ ] Offline mode improvements

### v2.0 - Premium Features
- [ ] Cloud sync across devices
- [ ] Unlimited AI calls
- [ ] Advanced analytics
- [ ] Priority support

---

## 🐛 Known Issues

### Current
1. **PDF extraction unreliable** - OpenRouter models struggle with PDF base64
   - *Workaround*: Take photos of PDF pages instead

2. **Free models rate limited** - May get 429 errors during heavy use
   - *Workaround*: Wait 1-2 minutes and retry

3. **Keyboard on web** - KeyboardAvoidingView doesn't work on web
   - *Impact*: Desktop users don't see keyboard issues anyway

### Resolved
- ✅ Chat input hidden behind keyboard
- ✅ Flashcard text overflow/hidden
- ✅ Vision AI failing (fixed with NVIDIA Nemotron)
- ✅ Images not saving with base64

---

## 📊 Feature Ideas (Community Suggestions)

These are additional features that could enhance the app:

### Learning
- **Mnemonics generator** - Memory tricks for hard concepts
- **Mind maps** - Visual concept connections
- **Formula cards** - LaTeX rendering for math
- **Code snippets** - Syntax highlighted code cards

### Gamification
- **XP system** - Earn points for studying
- **Levels** - Unlock features with progress
- **Daily challenges** - Bonus XP for consistency
- **Leaderboards** - Compare with friends

### Accessibility
- **Text-to-speech** - Read cards aloud
- **Voice input** - Dictate notes
- **High contrast mode** - Better visibility
- **Larger fonts** - Accessibility setting

### Integration
- **Google Drive sync** - Backup to cloud
- **Notion import** - Bring existing notes
- **Anki import/export** - Standard flashcard format
- **Calendar sync** - Study schedule integration

---

## 👤 Contributors

- **Developer**: Built with assistance from AI pair programming
- **Design**: Custom gradient theme inspired by modern apps
- **AI Models**: NVIDIA, DeepSeek, TNG, Kwaipilot (all free)

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | Dec 2024 | Initial app structure |
| 0.2.0 | Dec 2024 | AI integration (OpenAI) |
| 0.3.0 | Dec 2024 | Switched to Gemini |
| 0.4.0 | Dec 2024 | OpenRouter integration |
| 0.5.0 | Dec 2024 | Vision + Image features |
| 0.6.0 | Dec 2024 | Flashcards + Quizzes |
| 0.7.0 | Dec 2024 | Save AI responses |
| 0.8.0 | Dec 2024 | UI overhaul (current) |

---

*Last updated: December 16, 2024*

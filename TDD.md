# Technical Design Document - Bookmarks Web App

## Overview
A client-side web application for bookmark management built with vanilla HTML, CSS, and JavaScript.

## Architecture

### Frontend Stack
- **HTML5**: Semantic markup and structure
- **CSS3**: Styling with custom properties and responsive design
- **ES6+ JavaScript**: Class-based architecture with modern features
- **Local Storage**: Client-side data persistence
- **DOM APIs**: Document fragments, event delegation

### File Structure
```
bookmarks-web-app/
├── index.html          # Main application interface
├── result.html         # Success confirmation page
├── style.css           # Global styles and theme
├── main.js            # Application logic and data management
├── README.md          # User documentation
└── TDD.md             # This technical document
```

## Design Decisions

### Data Storage
- **Local Storage**: Chosen for simplicity and no backend requirements
- **Storage Keys**: 
  - `bookmarks`: Array of bookmark objects
  - `resultBookmark`: Single bookmark object for result page
- **JSON Format**: Data serialized using JSON.stringify/parse

### UI/UX Design
- **Dark Theme**: Reduces eye strain and modern aesthetic
- **Accessibility**: Focus states, semantic HTML, and keyboard navigation

### State Management
- **Class-Based Architecture**: BookmarkApp class manages all state
- **Event-Driven**: DOM events trigger state updates
- **Pagination**: Client-side pagination (20 items per page)
- **Modal State**: Edit modal state managed

## Technical Implementation

### Core Functions
- `handleSubmit()`: Validates and stores new bookmarks
- `renderBookmarks()`: Renders bookmark list with pagination
- `handleEdit()`: Updates existing bookmark data
- `deleteBookmark()`: Removes bookmarks from storage
- `isValidUrl()`: Ensures valid URL format with protocol validation
- `getBookmarks()` / `setBookmarks()`: Local storage management

### Data Model
```javascript
Bookmark {
  id: number,        // Unique identifier (timestamp + random)
  title: string,     // Display name
  url: string        // Website URL
}
```
# Project Media Gallery Enhancement

This update improves the project gallery functionality by replacing the generic MediaGallery component with a specialized GlobalMediaSelector configured to work specifically with the "Projects" category.

## Features Implemented

1. **Category-Specific Media Selection**: All project media is now restricted to the "Projects" category (#2).
2. **Auto-Categorization**: When uploading or selecting images for projects, they are automatically assigned to the "Projects" category.
3. **Organized Media Storage**: All project-related media is stored in a dedicated folder, improving organization and searchability.
4. **Consistent Categories**: Added a central media-categories utility to maintain consistency across the application.

## Components Created/Modified

1. **New Components**:
   - `ProjectGallerySelector`: A dedicated component for selecting project gallery images
   - `/api/media/update-category`: A new API endpoint to update media categories

2. **Modified Components**:
   - `TabbedProjectForm`: Updated to use the new ProjectGallerySelector
   - `GlobalMediaSelector`: Enhanced with category restriction capability
   - `MediaSelector`: Modified to support filtering by category

3. **Utility Files**:
   - `media-categories.ts`: A new utility file with constants for media category IDs and helpers

## Setup Instructions

1. Run the initialization script to ensure all required media categories exist:
   ```
   npm run init-categories
   ```

2. Restart the development server:
   ```
   npm run dev
   ```

## Usage

- When creating or editing projects, the media selector will automatically filter to only show or save to the "Projects" category.
- The main image selector and gallery selector both respect this restriction.
- Uploaded media will be automatically categorized in the "Projects" folder.

## Technical Notes

- The "Projects" category has ID 2 in the database.
- If you ever need to modify category IDs, update the `MEDIA_CATEGORIES` object in `lib/media-categories.ts`.
- The `update-category` API can be used to batch update media categories for other use cases.

# Pharmacy Pills Background Image Setup Instructions

## Image Replacement Steps

1. **Save the New Image**
   - Save your new pharmacy pills image (the one you just shared) to your computer
   - Name it exactly: `pharmacy-pills-bg.jpg`

2. **Replace the Current Image**
   - Navigate to: `c:\Users\Avishka\Documents\Web_Project_4th_sem\pharmacy_app\public\`
   - Replace the existing `pharmacy-pills-bg.jpg` file with your new image
   - Make sure the filename is exactly `pharmacy-pills-bg.jpg` (case-sensitive)

3. **Image Requirements**
   - Format: JPG or PNG (but name it .jpg)
   - Recommended size: 1920x1080 or larger for best quality
   - The image will be automatically resized to fit the right container

## What the CSS Does

The updated CSS configuration:
- Uses your pharmacy pills image as the background for the right container only
- Applies a blue gradient overlay (75% opacity) to maintain text readability
- Centers the image and covers the entire right container
- Uses `background-attachment: local` for better performance
- Maintains the image quality with `background-size: cover`

## Current Setup

✅ CSS is already configured to use the image
✅ File path is set to `/pharmacy-pills-bg.jpg`
✅ Background positioning is optimized
✅ Gradient overlay is adjusted for better visibility

## If You Need to Test

After replacing the image:
1. Start the development server: `npm run dev`
2. Navigate to the login page
3. The right container should now display your pharmacy pills image with a blue overlay

## Troubleshooting

If the image doesn't appear:
- Clear your browser cache (Ctrl+F5)
- Check that the filename is exactly `pharmacy-pills-bg.jpg`
- Ensure the image is in the `public` folder (not in any subfolder)
- Try refreshing the page

The image will only appear on the right side of the login page, with all your content (pharmacy name, greeting, feature cards) displayed on top of it with the blue gradient overlay for readability.

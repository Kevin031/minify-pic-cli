# Minify Pic CLI - Batch Image Compression Tool

English | [简体中文](./README.zh-CN.md)

A simple and easy-to-use command-line tool for batch image compression, supporting PNG, JPEG, and GIF formats. Perfect for frontend developers and designers to quickly optimize image file sizes.

## Features

- 🖼️ Support multiple image formats: PNG, JPEG, GIF
- 📁 Batch process all images in directories and subdirectories
- ⚙️ Customizable compression quality and parameters
- 🚫 Support for excluding specified directories
- 📊 Display file size comparison before and after compression
- 🎯 Maintain original directory structure
- ⚡ Support skip confirmation for automation
- 🔄 Support in-place compression to replace original files

## Installation

### Global Installation

```bash
# Install using pnpm
pnpm install -g minify-pic-cli

# Or using npm
npm install -g minify-pic-cli
```

## Usage

### Basic Usage

```bash
# Compress all images in current directory
mpic

# Or run directly
node index.js
```

### Command Line Options

```bash
mpic [options]

Options:
  -d, --dir <dir>              Directory to compress (default: current directory)
  -o, --output <output>        Output directory (default: ./output)
  -q, --quality <quality>      Compression quality 0-100 (default: 80)
  -g, --gif-colours <colours>  GIF palette maximum colors 2-256 (default: 128)
  -b, --black-dirs <dirs>      Exclude subdirectories, comma-separated (default: "no")
  -y, --yes                    Skip confirmation and start compression directly
  -r, --replace                In-place compression, replace original files
  -v, --version                Display version number
  -h, --help                   Display help information
```

### Usage Examples

```bash
# Compress images in specified directory, output to compressed folder
mpic -d ./images -o ./compressed

# Set compression quality to 90
mpic -q 90

# Exclude node_modules and .git directories
mpic -b "node_modules,.git"

# Set GIF palette to 64 colors
mpic -g 64

# Skip confirmation prompt, start compression automatically
mpic -y

# In-place compression to replace original files (no new directory)
mpic -r

# Skip confirmation + in-place replace (recommended for automation)
mpic -y -r

# In-place replace + custom compression quality
mpic -y -r -q 90

# Combine multiple options
mpic -d ./src/assets -o ./dist/assets -q 85 -b "node_modules,.git"
```

## Supported Image Formats

- **PNG**: Supports transparency, suitable for icons and simple graphics
- **JPEG**: Suitable for photos and complex images
- **GIF**: Supports animation, adjustable palette colors

## Configuration

### Compression Quality (quality)
- Range: 0-100
- Default: 80
- Higher value = better quality, larger file size
- Recommended: 80-90 for best balance

### GIF Palette Colors (gif-colours)
- Range: 2-256
- Default: 128
- Fewer colors = smaller file size, may affect visual quality
- Recommended: 64-128 for common use

### Exclude Directories (black-dirs)
- Support multiple directories, comma-separated
- Default exclude: "no" directory
- Common exclude directories: `node_modules,.git,dist,build`

## Output Information

The tool displays in console:
- Current working directory
- Compression progress and results
- File size comparison
- Final output directory

Example output:
```
Current directory path: /path/to/your/project
Do you need to compress all images in the current directory? Y/N: y
Compression complete [Size change: 2.5MB ---->>>> 1.2MB] /path/to/output/image1.jpg
Compression complete [Size change: 800KB ---->>>> 400KB] /path/to/output/image2.png
All compression tasks completed, output to /path/to/output
```

## Important Notes

1. **Backup Original Files**: Default mode creates new compressed files in output directory without overwriting originals
2. **In-Place Replace Mode**: Using `-r` parameter will directly replace original files. Use with caution and backup important files first
3. **Output Directory**: Default output to `./output` directory, automatically created (not created when using `-r`)
4. **Directory Structure**: Maintains original directory structure after compression
5. **Large File Processing**: Compression of large files may take some time
6. **Permission Issues**: Ensure write permissions for target directories
7. **Automation Scripts**: For CI/CD or automation scripts, use `-y` parameter to skip interactive confirmation

## Tech Stack

- **Node.js**: Runtime environment
- **Sharp**: High-performance image processing library
- **Commander.js**: Command-line argument parsing
- **Readline**: User interaction

## Development

```bash
# Install dependencies
pnpm install

# Run development version
node index.js
```

## License

ISC

## Changelog

### v1.0.3
- Added `-y, --yes` parameter: Skip confirmation prompt for automation support
- Added `-r, --replace` parameter: In-place compression to replace original files
- Improved user experience with more flexible usage options

### v1.0.2
- Initial release
- Support PNG, JPEG, GIF format compression
- Command-line parameter support
- Batch processing functionality

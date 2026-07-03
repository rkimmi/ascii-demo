# ascii-demo

Image to ascii-image conversion, replaces pixels with text characters defined in [ascii-core.js](./ascii-core.js)

# Credits

This project lightly extends [this](https://www.youtube.com/watch?v=HeT-5RZgEQY) ascii image tutorial by [@FranksLaboratory](https://www.youtube.com/@Frankslaboratory)

## Web

Run a server and open `index.html`:

```bash
python -m http.server
```

Paste an image URL into the input to convert it to ASCII.
Adjust cell size and color controls, then save-as.

## Batch .txt file generation

### Convert .gif file to frames

```bash
ffmpeg -i <path-to-input-gif> -vf "scale=480:240" frames-out/frame-%04d.png
```

### Convert frames to ascii

```bash
 node batch-text.js <path-to-input-frames> <path-to-txt-frames> <cellsize>
```

### Play generated ascii frames in the terminal

```bash
node play-text-cli.js <path-to-input-txt-frames> --fps 24 --loop 
```

## Batch image generation to support video

Convert a batch set of frames to ASCII PNGs without the web UI.

Prerequsite: Convert a video file to frames. This is easily done with ffmpeg:

```bash
ffmpeg -i input.mp4 frame_%04d.png
```

Then run the batch conversion script, with specified cell size:

```bash
node batch.js <inputDir> <outputDir> <cellSize>
```

Example:

```bash
node batch.js frames output 7
```

### Conversion of frames back into video:

Note: The following command includes settings that I found to produce good results so far. These should be adjusted as needed. These are outlined below. 

```bash
ffmpeg -framerate 24 -i frame_%04d.png -vf "eq=saturation=1.4,scale=in_range=full:out_range=full:out_color_matrix=bt709,format=yuv444p" -c:v libx264 -crf 14 -preset slow -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range pc -movflags +faststart <output_file_path>
```

Make sure to replace <output_file_path> with a desired output file path, e.g; './output.mp4'

  | args | What it does | 
  |---|---|
  | `framerate` | Desired frame rate |
  | `-i` | Input frame file names, %04d as wild card, matches and processes all frames in sequence |
  | `-vf` | Defines start of video filters, outlined further below |
  | `-c:v libx264` | Encodes video with the x264 (H.264) |
  | `-crf 10` | Quality level (0–51 scale), lower val = higher quality. 10 results in a larger file size than the default 23, but preserve character crisp-ness |
  | `-preset slow` | Encoder effort. Slower = better compression at same quality, takes longer |
  | `-colorspace bt709` | Tags the YUV matrix (matches `out_color_matrix`) |
  | `-color_primaries bt709` | Tags the RGB primaries (Rec.709 = standard HD/sRGB gamut) |
  | `-color_trc bt709` | Tags the transfer curve (gamma), matching the source |
  | `-color_range tv` | Flags the data as limited range (matches `out_range=limited`) |
  | `-movflags +faststart` | Moves the file index to the front so it can start playing before fully downloaded (web/streaming) |
  | `<filename>` | Output filename |

  | vf setting | What it does |
  |---|---|
  | `eq=saturation=1.4` | Boosts color saturation to 140%, basically  compensates for color dilution |
  | `scale=in_range=full` | Specifies that inputs PNGs are full-range RGB|
  | `:out_range=full` | Outputs video-standard to full-range YUV |
  | `:out_color_matrix=bt709` | Uses Rec.709 standard for RGB to YUV conversion. |
  | `format=yuv444p` | Outputs pixel format with **full-resolution color** |

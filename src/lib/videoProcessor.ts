import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export interface VideoProcessingOptions {
  introPath?: string;        // Path to intro video or gif
  outroPath?: string;        // Path to outro video or gif
  watermarkPath?: string;    // Path to watermark image (png/jpg/gif)
  watermarkText?: string;    // Fallback text watermark
  watermarkPosition?: 'center' | 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  watermarkOpacity?: number; // 0.1 to 1.0 (default: 0.35)
  resolution?: string;       // e.g. '1280:720'
}

/**
 * Check if FFmpeg is installed and accessible in PATH
 */
export async function isFfmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const proc = spawn('ffmpeg', ['-version']);
      proc.on('error', () => resolve(false));
      proc.on('close', (code) => resolve(code === 0));
    } catch {
      resolve(false);
    }
  });
}

/**
 * Check if a file has an audio track
 */
async function hasAudioStream(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const proc = spawn('ffmpeg', ['-i', filePath]);
      let output = '';
      proc.stderr.on('data', (data) => {
        output += data.toString();
      });
      proc.on('close', () => {
        resolve(output.includes('Audio:'));
      });
      proc.on('error', () => resolve(false));
    } catch {
      resolve(false);
    }
  });
}

/**
 * Get video/gif duration in seconds
 */
async function getMediaDuration(filePath: string): Promise<number> {
  return new Promise((resolve) => {
    try {
      const proc = spawn('ffmpeg', ['-i', filePath]);
      let output = '';
      proc.stderr.on('data', (data) => {
        output += data.toString();
      });
      proc.on('close', () => {
        const match = output.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
        if (match) {
          const hours = parseFloat(match[1]);
          const mins = parseFloat(match[2]);
          const secs = parseFloat(match[3]);
          resolve(hours * 3600 + mins * 60 + secs);
        } else {
          // Default to 4 seconds for GIFs or undetected media
          resolve(4);
        }
      });
      proc.on('error', () => resolve(4));
    } catch {
      resolve(4);
    }
  });
}

function getAvailableFontFile(): string | null {
  if (process.platform === 'win32' && fs.existsSync('C:/Windows/Fonts/arial.ttf')) {
    return 'C\\:/Windows/Fonts/arial.ttf';
  }
  const linuxFonts = [
    '/usr/share/fonts/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/TTF/DejaVuSans.ttf',
    '/usr/share/fonts/freefont/FreeSans.ttf'
  ];
  for (const f of linuxFonts) {
    if (fs.existsSync(f)) return f;
  }
  return null;
}

/**
 * Process video: prepend intro, append outro, and apply watermark
 */
export async function processVideo(
  inputVideoPath: string,
  outputPath: string,
  options: VideoProcessingOptions = {}
): Promise<{ success: boolean; error?: string }> {
  const ffmpegReady = await isFfmpegAvailable();
  if (!ffmpegReady) {
    return { success: false, error: 'FFmpeg tidak terpasang di sistem server.' };
  }

  if (!fs.existsSync(inputVideoPath)) {
    return { success: false, error: `Berkas video input tidak ditemukan: ${inputVideoPath}` };
  }

  const {
    introPath,
    outroPath,
    watermarkPath,
    watermarkText = 'Nyalaporn.com',
    watermarkPosition = 'center',
    watermarkOpacity = 0.35,
    resolution = '1280:720'
  } = options;

  const hasIntro = !!(introPath && fs.existsSync(introPath));
  const hasOutro = !!(outroPath && fs.existsSync(outroPath));
  const hasWatermarkImg = !!(watermarkPath && fs.existsSync(watermarkPath));
  const hasWatermarkText = !hasWatermarkImg && !!watermarkText.trim();

  // If no branding tasks are enabled, simply copy file
  if (!hasIntro && !hasOutro && !hasWatermarkImg && !hasWatermarkText) {
    fs.copyFileSync(inputVideoPath, outputPath);
    return { success: true };
  }

  try {
    const inputArgs: string[] = [];
    const filterComplexParts: string[] = [];
    let inputIndex = 0;

    // Determine watermark coordinates
    let wmCoord = '(W-w)/2:(H-h)/2'; // Center default
    if (watermarkPosition === 'top-right') wmCoord = 'W-w-24:24';
    if (watermarkPosition === 'bottom-right') wmCoord = 'W-w-24:H-h-24';
    if (watermarkPosition === 'top-left') wmCoord = '24:24';
    if (watermarkPosition === 'bottom-left') wmCoord = '24:H-h-24';

    // 1. Prepare Intro if exists
    let introVideoTag = '';
    let introAudioTag = '';
    if (hasIntro) {
      const isGif = introPath.toLowerCase().endsWith('.gif');
      if (isGif) {
        inputArgs.push('-ignore_loop', '0', '-t', '4', '-i', introPath);
      } else {
        inputArgs.push('-i', introPath);
      }
      const introIdx = inputIndex++;
      const introHasAudio = !isGif && (await hasAudioStream(introPath));

      // Video filter: normalize resolution, sar, fps
      filterComplexParts.push(
        `[${introIdx}:v]scale=${resolution}:force_original_aspect_ratio=decrease,pad=${resolution}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v_intro]`
      );
      introVideoTag = '[v_intro]';

      if (introHasAudio) {
        filterComplexParts.push(`[${introIdx}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a_intro]`);
        introAudioTag = '[a_intro]';
      } else {
        const dur = await getMediaDuration(introPath);
        filterComplexParts.push(`anullsrc=r=44100:cl=stereo,atrim=duration=${dur}[a_intro]`);
        introAudioTag = '[a_intro]';
      }
    }

    // 2. Prepare Main Video
    const mainIdx = inputIndex++;
    inputArgs.push('-i', inputVideoPath);
    const mainHasAudio = await hasAudioStream(inputVideoPath);

    // Normalize main video resolution, sar, fps
    filterComplexParts.push(
      `[${mainIdx}:v]scale=${resolution}:force_original_aspect_ratio=decrease,pad=${resolution}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v_main_scaled]`
    );

    // Apply Watermark to Main Video
    let mainVideoTag = '[v_main_scaled]';
    if (hasWatermarkImg) {
      const wmIdx = inputIndex++;
      inputArgs.push('-i', watermarkPath!);
      filterComplexParts.push(
        `[${wmIdx}:v]format=rgba,colorchannelmixer=aa=${watermarkOpacity}[wm_ready]`,
        `[v_main_scaled][wm_ready]overlay=${wmCoord}:format=auto[v_main_watermarked]`
      );
      mainVideoTag = '[v_main_watermarked]';
    } else if (hasWatermarkText) {
      const escapedText = watermarkText.replace(/'/g, "\\'").replace(/:/g, '\\:');
      const font = getAvailableFontFile();
      const fontParam = font ? `fontfile='${font}':` : '';
      filterComplexParts.push(
        `[v_main_scaled]drawtext=${fontParam}text='${escapedText}':fontcolor=white@${watermarkOpacity}:fontsize=36:x=(w-text_w)/2:y=(h-text_h)/2[v_main_watermarked]`
      );
      mainVideoTag = '[v_main_watermarked]';
    }

    let mainAudioTag = '[a_main]';
    if (mainHasAudio) {
      filterComplexParts.push(`[${mainIdx}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a_main]`);
    } else {
      const mainDur = await getMediaDuration(inputVideoPath);
      filterComplexParts.push(`anullsrc=r=44100:cl=stereo,atrim=duration=${mainDur}[a_main]`);
    }

    // 3. Prepare Outro if exists
    let outroVideoTag = '';
    let outroAudioTag = '';
    if (hasOutro) {
      const isGif = outroPath.toLowerCase().endsWith('.gif');
      if (isGif) {
        inputArgs.push('-ignore_loop', '0', '-t', '4', '-i', outroPath);
      } else {
        inputArgs.push('-i', outroPath);
      }
      const outroIdx = inputIndex++;
      const outroHasAudio = !isGif && (await hasAudioStream(outroPath));

      filterComplexParts.push(
        `[${outroIdx}:v]scale=${resolution}:force_original_aspect_ratio=decrease,pad=${resolution}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v_outro]`
      );
      outroVideoTag = '[v_outro]';

      if (outroHasAudio) {
        filterComplexParts.push(`[${outroIdx}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a_outro]`);
        outroAudioTag = '[a_outro]';
      } else {
        const outroDur = await getMediaDuration(outroPath);
        filterComplexParts.push(`anullsrc=r=44100:cl=stereo,atrim=duration=${outroDur}[a_outro]`);
        outroAudioTag = '[a_outro]';
      }
    }

    // 4. Concat all segments if intro or outro exists
    let finalVideoMap = mainVideoTag;
    let finalAudioMap = mainAudioTag;

    const segments: { v: string; a: string }[] = [];
    if (hasIntro) segments.push({ v: introVideoTag, a: introAudioTag });
    segments.push({ v: mainVideoTag, a: mainAudioTag });
    if (hasOutro) segments.push({ v: outroVideoTag, a: outroAudioTag });

    if (segments.length > 1) {
      const concatInputs = segments.map((s) => `${s.v}${s.a}`).join('');
      filterComplexParts.push(`${concatInputs}concat=n=${segments.length}:v=1:a=1[v_final][a_final]`);
      finalVideoMap = '[v_final]';
      finalAudioMap = '[a_final]';
    }

    // Output args
    const filterComplexStr = filterComplexParts.join(';');
    const ffmpegArgs = [
      '-y', // Overwrite output
      ...inputArgs,
      '-filter_complex',
      filterComplexStr,
      '-map',
      finalVideoMap,
      '-map',
      finalAudioMap,
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '23',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-movflags',
      '+faststart',
      outputPath
    ];

    return new Promise((resolve) => {
      const proc = spawn('ffmpeg', ffmpegArgs);
      let errorLog = '';

      proc.stderr.on('data', (chunk) => {
        errorLog += chunk.toString();
      });

      proc.on('close', (code) => {
        if (code === 0 && fs.existsSync(outputPath)) {
          resolve({ success: true });
        } else {
          console.error('FFmpeg Process Error:', errorLog.slice(-500));
          // Fallback to copying original video if transcoding failed
          try {
            fs.copyFileSync(inputVideoPath, outputPath);
            resolve({ success: true });
          } catch (copyErr) {
            resolve({ success: false, error: errorLog.slice(-300) });
          }
        }
      });

      proc.on('error', (err) => {
        console.error('FFmpeg spawn error:', err);
        // Fallback to original
        try {
          fs.copyFileSync(inputVideoPath, outputPath);
          resolve({ success: true });
        } catch {
          resolve({ success: false, error: err.message });
        }
      });
    });
  } catch (err: any) {
    return { success: false, error: err.message || 'Error executing video processor' };
  }
}

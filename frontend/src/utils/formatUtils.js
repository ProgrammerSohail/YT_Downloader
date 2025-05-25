export const formatVideoOption = (format) => {
  return {
    itag: format.itag,
    label: `${format.resolution || 'Unknown'} ${format.fps ? `${format.fps}fps` : ''} (${format.type === 'video_progressive' ? 'Video + Audio' : 'Also Select Audio'}) - ${format.size}`
  };
};

export const formatAudioOption = (format) => {
  return {
    itag: format.itag,
    label: `${format.mime_type} - ${format.abr || 'Unknown'} - ${format.size}`
  };
};

export const groupFormats = (formats) => {
  // Add validation and debugging
  console.log('Formats received in groupFormats:', formats);
  
  if (!formats || typeof formats !== 'object') {
    console.error('Invalid formats object received:', formats);
    return { video: [], audio: [] };
  }

  if (!Array.isArray(formats.video) || !Array.isArray(formats.audio)) {
    console.error('formats.video or formats.audio is not an array:', formats);
    return { video: [], audio: [] };
  }

  // Filter and group video formats by resolution and type
  const videoFormatsMap = new Map();
  formats.video.forEach(format => {
    console.log('Processing video format:', format);
    const key = `${format.resolution || 'Unknown'}-${format.type}`;
    if (!videoFormatsMap.has(key)) {
      videoFormatsMap.set(key, format);
    }
  });
  const uniqueVideoFormats = Array.from(videoFormatsMap.values());

  // Filter and group audio formats by abr
  const audioFormatsMap = new Map();
  formats.audio.forEach(format => {
    console.log('Processing audio format:', format);
    const key = `${format.abr || 'Unknown'}`;
    if (!audioFormatsMap.has(key)) {
      audioFormatsMap.set(key, format);
    }
  });
  const uniqueAudioFormats = Array.from(audioFormatsMap.values());

  const result = {
    video: uniqueVideoFormats.map(formatVideoOption),
    audio: uniqueAudioFormats.map(formatAudioOption)
  };

  console.log('Grouped and formatted result:', result);
  return result;
};
